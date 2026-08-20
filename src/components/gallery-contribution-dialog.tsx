"use client";

import { upload } from "@vercel/blob/client";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type ReactNode,
} from "react";
import {
  CONTRIBUTION_SESSION_KEY,
  fileFingerprint,
  MAX_BATCH_FILES,
  uploadPath,
} from "@/lib/contribution";
import {
  createClientFileId,
  optimizeContributionImage,
  validateSourceImage,
} from "@/lib/contribution-client";

type ItemState =
  | "waiting"
  | "queued"
  | "processing"
  | "uploading"
  | "finalizing"
  | "ready"
  | "failed"
  | "cancelled";

type UploadItem = {
  clientFileId: string;
  submissionId?: string;
  name: string;
  type: string;
  size: number;
  lastModified: number;
  file?: File;
  previewUrl?: string;
  state: ItemState;
  progress: number;
  error?: string;
};

type Metadata = {
  contributorName: string;
  category: "Class" | "Campus" | "Labs" | "Celebrations";
  title: string;
  caption: string;
};

type Credentials = { batchId: string; editToken: string };

type StoredSession = {
  credentials: Credentials;
  metadata: Metadata;
  items: Omit<UploadItem, "file" | "previewUrl">[];
};

const EMPTY_METADATA: Metadata = {
  contributorName: "",
  category: "Class",
  title: "",
  caption: "",
};

async function responseJson<T>(response: Response) {
  const body = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(body.error ?? "Something went wrong.");
  return body;
}

function sizeLabel(bytes: number) {
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function GalleryContributionDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [metadata, setMetadata] = useState(EMPTY_METADATA);
  const [items, setItems] = useState<UploadItem[]>([]);
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const [active, setActive] = useState(false);
  const [complete, setComplete] = useState(false);
  const [message, setMessage] = useState("");
  const aborters = useRef(new Map<string, AbortController>());
  const cancelledIds = useRef(new Set<string>());
  const cancelAllRequested = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const dialogRef = useRef<HTMLElement>(null);

  const updateItem = useCallback(
    (clientFileId: string, patch: Partial<UploadItem>) => {
      setItems((current) =>
        current.map((item) =>
          item.clientFileId === clientFileId ? { ...item, ...patch } : item,
        ),
      );
    },
    [],
  );

  useEffect(() => {
    if (!open) return;
    titleRef.current?.focus();
    const stored = sessionStorage.getItem(CONTRIBUTION_SESSION_KEY);
    if (!stored || credentials || items.length > 0) return;

    try {
      const session = JSON.parse(stored) as StoredSession;
      void fetch(`/api/submissions/batches/${session.credentials.batchId}/status`, {
        headers: { Authorization: `Bearer ${session.credentials.editToken}` },
        cache: "no-store",
      })
        .then((response) =>
          responseJson<{
            batch: Metadata & { status: string };
            items: Array<{
              submissionId: string;
              clientFileId: string;
              name: string;
              type: string;
              size: number;
              lastModified: number;
              status: string;
            }>;
          }>(response),
        )
        .then((status) => {
          setCredentials(session.credentials);
          setMetadata({
            contributorName: status.batch.contributorName,
            category: status.batch.category,
            title: status.batch.title,
            caption: status.batch.caption,
          });
          setItems(
            status.items.map((item) => ({
              ...item,
              state: item.status === "uploading" ? "waiting" : "ready",
              progress: item.status === "uploading" ? 0 : 100,
            })),
          );
          if (status.batch.status !== "uploading") {
            setComplete(true);
            sessionStorage.removeItem(CONTRIBUTION_SESSION_KEY);
          } else {
            setMessage("Completed photos are safe. Reselect unfinished files to continue.");
          }
        })
        .catch((error: unknown) => {
          sessionStorage.removeItem(CONTRIBUTION_SESSION_KEY);
          setCredentials(null);
          setMessage(error instanceof Error ? error.message : "Recovery failed.");
        });
    } catch {
      sessionStorage.removeItem(CONTRIBUTION_SESSION_KEY);
    }
  }, [credentials, items.length, open]);

  useEffect(() => {
    if (!credentials || complete) return;
    const session: StoredSession = {
      credentials,
      metadata,
      items: items.map((item) => ({
        clientFileId: item.clientFileId,
        submissionId: item.submissionId,
        name: item.name,
        type: item.type,
        size: item.size,
        lastModified: item.lastModified,
        state: item.state,
        progress: item.progress,
        error: item.error,
      })),
    };
    sessionStorage.setItem(CONTRIBUTION_SESSION_KEY, JSON.stringify(session));
  }, [complete, credentials, items, metadata]);

  useEffect(() => {
    if (!open) return;
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !active) onClose();
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => element.offsetParent !== null);
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, [active, onClose, open]);

  const addFiles = useCallback(
    (selected: File[]) => {
      setMessage("");
      setItems((current) => {
        const next = [...current];
        const known = new Map(next.map((item) => [fileFingerprint(item), item]));
        const errors: string[] = [];

        for (const file of selected) {
          const validation = validateSourceImage(file);
          if (validation) {
            errors.push(validation);
            continue;
          }
          const fingerprint = fileFingerprint(file);
          const existing = known.get(fingerprint);
          if (existing) {
            if (existing.state === "waiting" || existing.state === "failed" || existing.state === "cancelled") {
              Object.assign(existing, {
                file,
                previewUrl: URL.createObjectURL(file),
                state: "queued" as const,
                progress: 0,
                error: undefined,
              });
            } else {
              errors.push(`${file.name} is already in this batch.`);
            }
            continue;
          }
          if (credentials) {
            errors.push(`${file.name} does not match an unfinished photo in this batch.`);
            continue;
          }
          if (next.length >= MAX_BATCH_FILES) {
            errors.push("A batch can contain at most 200 photos.");
            break;
          }
          const item: UploadItem = {
            clientFileId: createClientFileId(),
            name: file.name,
            type: file.type,
            size: file.size,
            lastModified: file.lastModified,
            file,
            previewUrl: URL.createObjectURL(file),
            state: "queued",
            progress: 0,
          };
          next.push(item);
          known.set(fingerprint, item);
        }
        if (errors.length) setMessage(errors.slice(0, 3).join(" "));
        return next;
      });
    },
    [credentials],
  );

  const processItem = useCallback(
    async (item: UploadItem, batch: Credentials) => {
      if (!item.file || !item.submissionId) return;
      if (cancelAllRequested.current || cancelledIds.current.has(item.clientFileId)) {
        updateItem(item.clientFileId, { state: "cancelled", error: "Cancelled" });
        return;
      }
      const controller = new AbortController();
      aborters.current.set(item.clientFileId, controller);
      try {
        updateItem(item.clientFileId, { state: "processing", progress: 2, error: undefined });
        const optimized = await optimizeContributionImage(item.file);
        if (
          controller.signal.aborted ||
          cancelAllRequested.current ||
          cancelledIds.current.has(item.clientFileId)
        ) {
          throw new DOMException("Cancelled", "AbortError");
        }
        updateItem(item.clientFileId, { state: "uploading", progress: 5 });
        const blob = await upload(
          uploadPath(batch.batchId, item.submissionId, optimized.extension),
          optimized.file,
          {
            access: "public",
            handleUploadUrl: "/api/submissions/upload",
            clientPayload: JSON.stringify({
              ...batch,
              submissionId: item.submissionId,
            }),
            abortSignal: controller.signal,
            onUploadProgress: ({ percentage }) =>
              updateItem(item.clientFileId, {
                progress: Math.max(5, Math.round(percentage * 0.9)),
              }),
          },
        );
        updateItem(item.clientFileId, { state: "finalizing", progress: 96 });
        await responseJson(
          await fetch(
            `/api/submissions/batches/${batch.batchId}/items/${item.submissionId}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ editToken: batch.editToken, blob }),
            },
          ),
        );
        updateItem(item.clientFileId, {
          state: "ready",
          progress: 100,
          file: undefined,
          error: undefined,
        });
      } catch (error) {
        updateItem(item.clientFileId, {
          state: controller.signal.aborted ? "cancelled" : "failed",
          error:
            controller.signal.aborted
              ? "Cancelled"
              : error instanceof Error
                ? error.message
                : "Upload failed.",
        });
      } finally {
        aborters.current.delete(item.clientFileId);
      }
    },
    [updateItem],
  );

  const startUploads = useCallback(async () => {
    setMessage("");
    let batch = credentials;
    let queue = items.filter(
      (item) => item.file && ["queued", "failed", "cancelled"].includes(item.state),
    );
    if (!queue.length) {
      setMessage("Select or reselect at least one unfinished photo.");
      return;
    }

    try {
      setActive(true);
      cancelAllRequested.current = false;
      queue.forEach((item) => cancelledIds.current.delete(item.clientFileId));
      if (!batch) {
        if (!metadata.contributorName.trim() || !metadata.title.trim()) {
          throw new Error("Add your name and a title before uploading.");
        }
        const created = await responseJson<{
          batchId: string;
          editToken: string;
          items: Array<{ clientFileId: string; submissionId: string }>;
        }>(
          await fetch("/api/submissions/batches", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...metadata,
              files: items.map(({ clientFileId, name, type, size, lastModified }) => ({
                clientFileId,
                name,
                type,
                size,
                lastModified,
              })),
            }),
          }),
        );
        batch = { batchId: created.batchId, editToken: created.editToken };
        const ids = new Map(created.items.map((item) => [item.clientFileId, item.submissionId]));
        queue = queue.map((item) => ({ ...item, submissionId: ids.get(item.clientFileId) }));
        setItems((current) =>
          current.map((item) => ({ ...item, submissionId: ids.get(item.clientFileId) })),
        );
        setCredentials(batch);
      }

      let cursor = 0;
      const workers = Array.from({ length: Math.min(2, queue.length) }, async () => {
        while (cursor < queue.length && !cancelAllRequested.current) {
          const item = queue[cursor++];
          await processItem(item, batch!);
        }
      });
      await Promise.all(workers);

      const status = await responseJson<{
        batch: { status: string };
      }>(
        await fetch(`/api/submissions/batches/${batch.batchId}/status`, {
          headers: { Authorization: `Bearer ${batch.editToken}` },
          cache: "no-store",
        }),
      );
      if (status.batch.status !== "uploading") {
        setComplete(true);
        sessionStorage.removeItem(CONTRIBUTION_SESSION_KEY);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload could not start.");
    } finally {
      setActive(false);
    }
  }, [credentials, items, metadata, processItem]);

  const finishSuccessful = useCallback(async () => {
    if (!credentials) return;
    const discardSubmissionIds = items
      .filter((item) => item.state !== "ready")
      .flatMap((item) => (item.submissionId ? [item.submissionId] : []));
    try {
      setActive(true);
      await responseJson(
        await fetch(`/api/submissions/batches/${credentials.batchId}/complete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ editToken: credentials.editToken, discardSubmissionIds }),
        }),
      );
      setComplete(true);
      sessionStorage.removeItem(CONTRIBUTION_SESSION_KEY);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The batch could not be finished.");
    } finally {
      setActive(false);
    }
  }, [credentials, items]);

  const discardBatch = useCallback(async () => {
    if (!credentials) return;
    const discardSubmissionIds = items.flatMap((item) =>
      item.submissionId ? [item.submissionId] : [],
    );
    try {
      setActive(true);
      await responseJson(
        await fetch(`/api/submissions/batches/${credentials.batchId}/complete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ editToken: credentials.editToken, discardSubmissionIds }),
        }),
      );
      setItems((current) => {
        current.forEach((item) => {
          if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
        });
        return [];
      });
      setCredentials(null);
      sessionStorage.removeItem(CONTRIBUTION_SESSION_KEY);
      setMessage("Batch cancelled. You can select another set of photos.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The batch could not be cancelled.");
    } finally {
      setActive(false);
    }
  }, [credentials, items]);

  const uploaded = items.filter((item) => item.state === "ready").length;
  const failed = items.filter((item) => ["failed", "cancelled"].includes(item.state)).length;
  const unfinished = items.length - uploaded;
  const overall = items.length
    ? Math.round(items.reduce((sum, item) => sum + item.progress, 0) / items.length)
    : 0;

  const close = () => {
    if (active) return;
    onClose();
  };

  const cancelUploads = () => {
    cancelAllRequested.current = true;
    setItems((current) =>
      current.map((item) => {
        if (item.state === "ready" || item.state === "finalizing") return item;
        cancelledIds.current.add(item.clientFileId);
        return { ...item, state: "cancelled", error: "Cancelled" };
      }),
    );
    aborters.current.forEach((controller) => controller.abort());
  };

  const cancelItem = (item: UploadItem) => {
    cancelledIds.current.add(item.clientFileId);
    aborters.current.get(item.clientFileId)?.abort();
    updateItem(item.clientFileId, { state: "cancelled", error: "Cancelled" });
  };

  const discardItem = async (item: UploadItem) => {
    if (!credentials || !item.submissionId) {
      removeItem(item.clientFileId);
      return;
    }
    try {
      setMessage("");
      const result = await responseJson<{ expectedCount: number }>(
        await fetch(
          `/api/submissions/batches/${credentials.batchId}/items/${item.submissionId}`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ editToken: credentials.editToken }),
          },
        ),
      );
      const remaining = items.filter((candidate) => candidate.clientFileId !== item.clientFileId);
      removeItem(item.clientFileId);
      if (result.expectedCount === 0) {
        setCredentials(null);
        sessionStorage.removeItem(CONTRIBUTION_SESSION_KEY);
        setMessage("The empty batch was cancelled. You can start a new one.");
      } else if (remaining.every((candidate) => candidate.state === "ready")) {
        setComplete(true);
        sessionStorage.removeItem(CONTRIBUTION_SESSION_KEY);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The photo could not be discarded.");
    }
  };

  const removeItem = (clientFileId: string) => {
    setItems((current) => {
      const item = current.find((candidate) => candidate.clientFileId === clientFileId);
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      return current.filter((candidate) => candidate.clientFileId !== clientFileId);
    });
  };

  const fieldsLocked = Boolean(credentials);
  const canRetry = failed > 0 && !active;
  const accept = "image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif";
  const statusSummary = useMemo(
    () => `${uploaded} uploaded · ${failed} failed · ${unfinished} remaining`,
    [failed, unfinished, uploaded],
  );

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="contribution-title"
      className="fixed inset-0 z-50 flex bg-black/75 sm:items-center sm:justify-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <section ref={dialogRef} className="relative flex h-dvh w-full flex-col overflow-hidden bg-[#f7f7f5] sm:h-[min(92dvh,920px)] sm:max-w-6xl">
        <header className="flex shrink-0 items-start justify-between border-b border-zinc-200 px-4 py-4 sm:px-7 sm:py-5">
          <div>
            <p className="text-[0.6rem] font-bold tracking-[0.22em] text-zinc-400 uppercase">Class archive intake</p>
            <h2 id="contribution-title" ref={titleRef} tabIndex={-1} className="mt-1 text-2xl font-medium tracking-tight text-zinc-950 outline-none sm:text-3xl">
              Contribute photos
            </h2>
          </div>
          <button type="button" onClick={close} disabled={active} aria-label={active ? "Uploads must be cancelled before closing" : "Close contribution dialog"} className="flex h-11 w-11 items-center justify-center border border-zinc-300 text-zinc-600 disabled:cursor-not-allowed disabled:opacity-30">
            <span aria-hidden="true" className="text-xl">×</span>
          </button>
        </header>

        {complete ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <span className="flex h-14 w-14 items-center justify-center bg-zinc-950 text-2xl text-white">✓</span>
            <h3 className="mt-6 text-3xl font-medium tracking-tight text-zinc-950">Batch received</h3>
            <p className="mt-3 max-w-md text-sm leading-6 text-zinc-500">{uploaded || items.length} photos are safely queued for moderation. They will remain private until approved.</p>
            <button type="button" onClick={close} className="mt-8 min-h-12 bg-zinc-950 px-8 text-xs font-bold tracking-wider text-white uppercase">Return to gallery</button>
          </div>
        ) : (
          <div className="grid min-h-0 flex-1 overflow-y-auto pb-28 lg:grid-cols-[22rem_1fr] lg:overflow-hidden lg:pb-0">
            <div className="border-b border-zinc-200 p-4 sm:p-6 lg:overflow-y-auto lg:border-r lg:border-b-0">
              {fieldsLocked && (
                <div className="border-l-2 border-zinc-950 pl-3 lg:hidden">
                  <p className="truncate text-sm font-semibold text-zinc-950">{metadata.title}</p>
                  <p className="mt-1 truncate text-[0.65rem] tracking-wide text-zinc-500 uppercase">{metadata.category} · {metadata.contributorName}</p>
                </div>
              )}
              <div className={`${fieldsLocked ? "hidden lg:grid" : "grid"} gap-3 sm:grid-cols-2 lg:grid-cols-1 lg:gap-4`}>
                <Field label="Your name">
                  <input value={metadata.contributorName} disabled={fieldsLocked} onChange={(event) => setMetadata({ ...metadata, contributorName: event.target.value })} maxLength={80} placeholder="e.g. Victor E. / CS '26" className="min-h-11 w-full border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-950 disabled:bg-zinc-100" />
                </Field>
                <Field label="Category">
                  <select value={metadata.category} disabled={fieldsLocked} onChange={(event) => setMetadata({ ...metadata, category: event.target.value as Metadata["category"] })} className="min-h-11 w-full border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-950 disabled:bg-zinc-100">
                    <option value="Class">The Class & Friends</option>
                    <option value="Labs">Classrooms & Labs</option>
                    <option value="Campus">Campus Life</option>
                    <option value="Celebrations">Celebrations</option>
                  </select>
                </Field>
                <Field label="Shared title">
                  <input value={metadata.title} disabled={fieldsLocked} onChange={(event) => setMetadata({ ...metadata, title: event.target.value })} maxLength={160} placeholder="Give this collection a title" className="min-h-11 w-full border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-950 disabled:bg-zinc-100" />
                </Field>
                <Field label="Shared caption (optional)">
                  <textarea value={metadata.caption} disabled={fieldsLocked} onChange={(event) => setMetadata({ ...metadata, caption: event.target.value })} maxLength={5000} rows={2} placeholder="Add context for the moment" className="w-full resize-none border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-950 disabled:bg-zinc-100" />
                </Field>
              </div>
              <div className={`${fieldsLocked ? "hidden" : "hidden lg:block"} mt-5 border-t border-zinc-200 pt-5 text-xs leading-5 text-zinc-500`}>
                <p>Up to 200 JPEG, PNG, WebP, HEIC, or HEIF photos. 25 MB maximum per original.</p>
                <p className="mt-2">Photos are resized on this device before upload. Original metadata is removed.</p>
              </div>
            </div>

            <div className="flex min-h-0 flex-col lg:overflow-hidden">
              <div className="shrink-0 p-4 sm:p-6">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(event: DragEvent) => event.preventDefault()}
                  onDrop={(event: DragEvent) => {
                    event.preventDefault();
                    addFiles(Array.from(event.dataTransfer.files));
                  }}
                  className="flex min-h-24 w-full items-center justify-between border border-dashed border-zinc-400 bg-white px-4 text-left transition-colors hover:border-zinc-950 sm:min-h-28 sm:px-6"
                >
                  <span>
                    <span className="block text-sm font-semibold text-zinc-900">Drop photos here or choose files</span>
                    <span className="mt-1 block text-xs text-zinc-400">{items.length} of 200 selected</span>
                  </span>
                  <span className="ml-4 border border-zinc-900 px-4 py-3 text-[0.65rem] font-bold tracking-wider uppercase">Browse</span>
                </button>
                <input ref={fileInputRef} type="file" multiple accept={accept} className="sr-only" onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  addFiles(Array.from(event.target.files ?? []));
                  event.target.value = "";
                }} />
                <p className="mt-2 text-[0.65rem] leading-5 text-zinc-400 lg:hidden">JPEG, PNG, WebP, HEIC or HEIF · up to 25 MB each</p>

                {items.length > 0 && (
                  <div className="mt-4" aria-live="polite">
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <span>{statusSummary}</span><span className="tabular-nums">{overall}%</span>
                    </div>
                    <div className="mt-2 h-1 overflow-hidden bg-zinc-200"><div className="h-full bg-zinc-950 transition-[width]" style={{ width: `${overall}%` }} /></div>
                  </div>
                )}
                {message && <p role="alert" className="mt-3 border border-amber-300 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">{message}</p>}
              </div>

              <div className="min-h-36 flex-1 border-y border-zinc-200 bg-white lg:min-h-0 lg:overflow-y-auto">
                {items.length === 0 ? (
                  <div className="flex h-full min-h-32 items-center justify-center px-6 text-center text-sm text-zinc-400">Your upload queue will appear here.</div>
                ) : (
                  <ul className="grid grid-cols-1 divide-y divide-zinc-100 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-3">
                    {items.map((item) => (
                      <li key={item.clientFileId} className="flex min-w-0 gap-3 border-zinc-100 p-3 sm:border-r sm:border-b">
                        <div className="h-16 w-16 shrink-0 overflow-hidden bg-zinc-100">
                          {item.previewUrl ? <Image src={item.previewUrl} alt="" width={64} height={64} unoptimized className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-[0.55rem] font-bold text-zinc-400 uppercase">Reselect</div>}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold text-zinc-900" title={item.name}>{item.name}</p>
                          <p className="mt-1 text-[0.65rem] text-zinc-400">{sizeLabel(item.size)} · {item.state}</p>
                          <div className="mt-2 h-1 bg-zinc-100"><div className={`h-full ${item.state === "failed" ? "bg-red-500" : "bg-zinc-900"}`} style={{ width: `${item.progress}%` }} /></div>
                          {item.error && <p className="mt-1 line-clamp-2 text-[0.6rem] text-red-600">{item.error}</p>}
                        </div>
                        {active && ["queued", "processing", "uploading"].includes(item.state) ? (
                          <button type="button" onClick={() => cancelItem(item)} aria-label={`Cancel ${item.name}`} className="h-8 shrink-0 px-1 text-[0.58rem] font-bold tracking-wide text-red-600 uppercase hover:text-red-800">Cancel</button>
                        ) : !active && item.state !== "ready" ? (
                          <button type="button" onClick={() => void discardItem(item)} aria-label={`${credentials ? "Discard" : "Remove"} ${item.name}`} className="h-8 shrink-0 px-1 text-[0.58rem] font-bold tracking-wide text-zinc-500 uppercase hover:text-zinc-950">{credentials ? "Discard" : "Remove"}</button>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <footer className="absolute inset-x-0 bottom-0 z-20 flex shrink-0 flex-col gap-2 border-t border-zinc-200 bg-[#f7f7f5]/95 p-3 backdrop-blur sm:p-4 lg:static lg:flex-row lg:items-center lg:justify-between lg:border-t-0 lg:bg-transparent lg:p-6 lg:backdrop-blur-none">
                {active ? (
                  <button type="button" onClick={cancelUploads} className="min-h-12 border border-red-300 px-5 text-xs font-bold tracking-wider text-red-700 uppercase">Cancel all uploads</button>
                ) : <span className="hidden text-xs text-zinc-400 sm:block">Two photos upload at a time</span>}
                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row">
                  {credentials && uploaded === 0 && unfinished > 0 && !active && <button type="button" onClick={() => void discardBatch()} className="min-h-12 border border-red-300 px-5 text-xs font-bold tracking-wider text-red-700 uppercase">Discard batch</button>}
                  {uploaded > 0 && unfinished > 0 && !active && <button type="button" onClick={() => void finishSuccessful()} className="min-h-12 border border-zinc-300 px-5 text-xs font-bold tracking-wider text-zinc-700 uppercase">Finish with {uploaded} successful</button>}
                  {!active && <button type="button" disabled={items.length === 0} onClick={() => void startUploads()} className="min-h-12 bg-zinc-950 px-4 text-[0.65rem] font-bold tracking-wider text-white uppercase only:col-span-2 disabled:cursor-not-allowed disabled:opacity-40 sm:px-6 sm:text-xs">
                    {canRetry ? "Retry failed" : credentials ? "Continue upload" : items.length ? `Upload ${items.length} photos` : "Select photos first"}
                  </button>}
                </div>
              </footer>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-[0.65rem] font-bold tracking-wider text-zinc-700 uppercase">{label}</span>{children}</label>;
}
