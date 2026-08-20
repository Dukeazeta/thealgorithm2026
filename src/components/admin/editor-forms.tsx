"use client";

import { useRef, useState, useTransition } from "react";
import {
  saveGalleryAction,
  saveGraduateAction,
  saveStoryChapterAction,
  saveStoryMemoryAction,
  saveStoryStatAction,
} from "@/app/admin/actions";
import { extractGraduateProfile } from "@/lib/graduate-ocr";
import type { GraduateExtraction } from "@/lib/types";

function Field({ label, name, type = "text", placeholder, required = true, className = "" }: { label: string; name: string; type?: string; placeholder?: string; required?: boolean; className?: string; }) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-[0.65rem] font-bold tracking-[0.1em] text-white/40 uppercase">{label}</span>
      <input name={name} type={type} required={required} placeholder={placeholder} className="h-10 w-full border-b border-white/10 bg-transparent px-0 text-sm text-white outline-none transition-colors placeholder:text-white/20 focus:border-white/50" />
    </label>
  );
}

function TextArea({ label, name, placeholder, rows = 4, required = true, className = "" }: { label: string; name: string; placeholder?: string; rows?: number; required?: boolean; className?: string; }) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-[0.65rem] font-bold tracking-[0.1em] text-white/40 uppercase">{label}</span>
      <textarea name={name} rows={rows} required={required} placeholder={placeholder} className="w-full border border-white/10 bg-transparent px-3 py-2 text-sm leading-6 text-white outline-none transition-colors placeholder:text-white/20 focus:border-white/50" />
    </label>
  );
}

export function MediaUploadField({ onChange }: { onChange: (id: string) => void }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("No image attached");

  function upload(file: File) {
    setMessage("Uploading image…");
    const formData = new FormData();
    formData.set("file", file);
    startTransition(() => {
      fetch("/api/admin/media", { method: "POST", body: formData })
        .then(async (response) => {
          const body = (await response.json()) as { data?: { id: string }; error?: string };
          if (!response.ok || !body.data) throw new Error(body.error ?? "Upload failed.");
          onChange(body.data.id);
          setMessage("Image uploaded and attached");
        })
        .catch((error: unknown) => setMessage(error instanceof Error ? error.message : "Upload failed."));
    });
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[0.65rem] font-bold tracking-[0.1em] text-white/40 uppercase">Archive image</span>
      <div className="flex items-center justify-between border-b border-white/10 py-2">
        <label className="flex cursor-pointer items-center gap-4">
          <span className="border border-white/20 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/5">{pending ? "Uploading..." : "Choose file"}</span>
          <span className="text-xs text-white/30">JPEG, PNG, WebP (10MB max)</span>
          <input type="file" accept="image/jpeg,image/png,image/webp" disabled={pending} className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) upload(file); }} />
        </label>
        <span className="text-xs font-medium text-white/60">{message}</span>
      </div>
    </div>
  );
}

function GraduateImportField({
  onComplete,
}: {
  onComplete: (profile: GraduateExtraction, mediaAssetId: string) => void;
}) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("No profile image selected");

  async function importImage(file: File) {
    setPending(true);
    setMessage("Reading image locally...");

    try {
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("eng");
      let text = "";
      try {
        const result = await worker.recognize(file);
        text = result.data.text;
      } finally {
        await worker.terminate();
      }

      const profile = extractGraduateProfile(text);
      if (!profile.name) throw new Error("No graduate name was found in this image.");

      setMessage("Uploading portrait...");
      const formData = new FormData();
      formData.set("file", file);
      const response = await fetch("/api/admin/media", { method: "POST", body: formData });
      const body = (await response.json()) as { data?: { id: string }; error?: string };
      if (!response.ok || !body.data) throw new Error(body.error ?? "Portrait upload failed.");

      onComplete(profile, body.data.id);
      setMessage("Details imported. Review before saving.");
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "Could not read this image.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[0.65rem] font-bold tracking-[0.1em] text-white/40 uppercase">Import profile from image</span>
      <div className="flex items-center justify-between border-b border-white/10 py-2">
        <label className="flex cursor-pointer items-center gap-4">
          <span className="border border-white/20 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/5">{pending ? "Reading..." : "Choose profile image"}</span>
          <span className="text-xs text-white/30">JPEG, PNG, WebP (10MB max)</span>
          <input type="file" accept="image/jpeg,image/png,image/webp" disabled={pending} className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) importImage(file); }} />
        </label>
        <span className="text-xs font-medium text-white/60">{message}</span>
      </div>
    </div>
  );
}

function SaveButton({ pending }: { pending: boolean }) {
  return (
    <button type="submit" disabled={pending} className="h-10 bg-white px-6 text-[0.65rem] font-bold tracking-[0.1em] uppercase text-black transition-transform hover:bg-white/90 active:scale-[0.98] disabled:opacity-50">
      {pending ? "Saving…" : "Save to archive"}
    </button>
  );
}

export function GraduateEditor() {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [mediaAssetId, setMediaAssetId] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function applyExtractedProfile(profile: GraduateExtraction, extractedMediaAssetId: string) {
    const form = formRef.current;
    if (!form) return;

    const values = {
      ...profile,
      departmentFriends: profile.departmentFriends.join(", "),
    };
    for (const [name, value] of Object.entries(values)) {
      const field = form.elements.namedItem(name);
      if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement) {
        field.value = value;
      }
    }

    setMediaAssetId(extractedMediaAssetId);
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      slug: data.get("slug"), name: data.get("name"), nickname: data.get("nickname"), mediaAssetId,
      alt: data.get("alt"), dob: data.get("dob"), favouriteColour: data.get("favouriteColour"), adviceToYoungerLevel: data.get("adviceToYoungerLevel"),
      skillsHobbies: data.get("skillsHobbies"), favoriteLecturer: data.get("favoriteLecturer"), favoriteLevel: data.get("favoriteLevel"), worstLevel: data.get("worstLevel"),
      departmentFriends: String(data.get("departmentFriends") ?? "").split(",").map((value) => value.trim()).filter(Boolean), favouriteQuote: data.get("favouriteQuote"),
      ifNotComputerScience: data.get("ifNotComputerScience"), stayOrJapa: data.get("stayOrJapa"), status: data.get("status"), sortOrder: Number(data.get("sortOrder") ?? 0),
    };
    const actionData = new FormData(); actionData.set("payload", JSON.stringify(payload));
    setMessage("");
    startTransition(() => { saveGraduateAction(actionData).then(() => setMessage("Graduate saved.")).catch((error: unknown) => setMessage(error instanceof Error ? error.message : "Could not save graduate.")); });
  }

  return (
    <form ref={formRef} onSubmit={submit} className="flex flex-col gap-10 bg-[#0b0d0d]">
      
      {/* Identity Block */}
      <div className="flex flex-col gap-6 border border-white/5 bg-white/[0.02] p-6">
        <h3 className="mb-2 text-[0.65rem] font-bold tracking-[0.2em] text-white/20 uppercase">Identity</h3>
        <GraduateImportField onComplete={applyExtractedProfile} />
        <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <Field label="Full name" name="name" />
          <Field label="Nickname" name="nickname" />
          <Field label="Slug (URL identifier)" name="slug" placeholder="duke-azeta" />
          <Field label="Date of birth" name="dob" placeholder="December 14" />
          <Field label="Image alt text" name="alt" className="sm:col-span-2" />
        </div>
      </div>

      {/* Preferences Block */}
      <div className="flex flex-col gap-6 border border-white/5 bg-white/[0.02] p-6">
        <h3 className="mb-2 text-[0.65rem] font-bold tracking-[0.2em] text-white/20 uppercase">Preferences</h3>
        <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <Field label="Favourite colour" name="favouriteColour" />
          <Field label="Favorite lecturer" name="favoriteLecturer" />
          <Field label="Favorite level" name="favoriteLevel" />
          <Field label="Worst level" name="worstLevel" />
          <Field label="If not Computer Science" name="ifNotComputerScience" />
          <Field label="Stay or japa" name="stayOrJapa" />
        </div>
      </div>

      {/* Open Text Block */}
      <div className="flex flex-col gap-6 border border-white/5 bg-white/[0.02] p-6">
        <h3 className="mb-2 text-[0.65rem] font-bold tracking-[0.2em] text-white/20 uppercase">Long-form</h3>
        <TextArea label="Advice to younger students" name="adviceToYoungerLevel" rows={3} />
        <TextArea label="Skills and hobbies" name="skillsHobbies" rows={3} />
        <TextArea label="Department friends (comma separated)" name="departmentFriends" rows={2} />
        <TextArea label="Favourite quote" name="favouriteQuote" rows={2} />
      </div>

      {/* Footer Block */}
      <div className="flex items-center justify-between border-t border-white/10 pt-6">
        <label className="flex items-center gap-3">
          <span className="text-[0.65rem] font-bold tracking-[0.1em] text-white/40 uppercase">Status</span>
          <select name="status" defaultValue="draft" className="h-9 border-b border-white/20 bg-transparent pl-1 pr-6 text-sm text-white outline-none">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        
        <div className="flex items-center gap-6">
          <span className="text-xs font-medium text-white/50">{message}</span>
          <SaveButton pending={pending} />
        </div>
      </div>
    </form>
  );
}

export function GalleryEditor() {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [mediaAssetId, setMediaAssetId] = useState<string | null>(null);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const data = new FormData(event.currentTarget);
    const payload = { slug: data.get("slug"), title: data.get("title"), category: data.get("category"), year: data.get("year"), location: data.get("location"), mediaAssetId, alt: data.get("alt"), caption: data.get("caption"), tag: data.get("tag"), featured: data.get("featured") === "on", status: data.get("status"), sortOrder: Number(data.get("sortOrder") ?? 0) };
    const actionData = new FormData(); actionData.set("payload", JSON.stringify(payload)); setMessage("");
    startTransition(() => { saveGalleryAction(actionData).then(() => setMessage("Gallery item saved.")).catch((error: unknown) => setMessage(error instanceof Error ? error.message : "Could not save gallery item.")); });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-10 bg-[#0b0d0d]">
      <div className="flex flex-col gap-6 border border-white/5 bg-white/[0.02] p-6">
        <h3 className="mb-2 text-[0.65rem] font-bold tracking-[0.2em] text-white/20 uppercase">Media & Details</h3>
        <MediaUploadField onChange={setMediaAssetId} />
        <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <Field label="Title" name="title" />
          <Field label="Slug" name="slug" placeholder="project-defence" />
          <Field label="Year" name="year" placeholder="2026" />
          <Field label="Location" name="location" />
          <Field label="Image alt text" name="alt" />
          <Field label="Tag" name="tag" placeholder="Milestone" />
          
          <label className="flex flex-col gap-1.5">
            <span className="text-[0.65rem] font-bold tracking-[0.1em] text-white/40 uppercase">Category</span>
            <select name="category" defaultValue="Class" className="h-10 w-full border-b border-white/10 bg-transparent px-0 text-sm text-white outline-none transition-colors focus:border-white/50">
              <option>Class</option><option>Campus</option><option>Labs</option><option>Celebrations</option>
            </select>
          </label>
          <label className="flex h-10 cursor-pointer items-center gap-3 self-end border-b border-white/10">
            <input name="featured" type="checkbox" className="h-3.5 w-3.5" /> 
            <span className="text-[0.65rem] font-bold tracking-[0.1em] text-white/40 uppercase">Feature this frame</span>
          </label>
        </div>
        <TextArea label="Caption (optional)" name="caption" rows={4} required={false} />
      </div>

      <div className="flex items-center justify-between border-t border-white/10 pt-6">
        <label className="flex items-center gap-3">
          <span className="text-[0.65rem] font-bold tracking-[0.1em] text-white/40 uppercase">Status</span>
          <select name="status" defaultValue="draft" className="h-9 border-b border-white/20 bg-transparent pl-1 pr-6 text-sm text-white outline-none">
            <option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option>
          </select>
        </label>
        <div className="flex items-center gap-6"><span className="text-xs font-medium text-white/50">{message}</span><SaveButton pending={pending} /></div>
      </div>
    </form>
  );
}

export function StoryChapterEditor() {
  const [pending, startTransition] = useTransition(); const [message, setMessage] = useState("");
  function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); const payload = { slug: data.get("slug"), year: data.get("year"), level: data.get("level"), title: data.get("title"), eyebrow: data.get("eyebrow"), headline: data.get("headline"), narrative: String(data.get("narrative") ?? "").split(/\n\s*\n/).map((value) => value.trim()).filter(Boolean), keyCourses: String(data.get("keyCourses") ?? "").split("\n").map((value) => value.trim()).filter(Boolean), definingMoment: data.get("definingMoment"), quoteText: data.get("quoteText"), quoteAuthor: data.get("quoteAuthor"), tone: data.get("tone"), status: data.get("status"), sortOrder: Number(data.get("sortOrder") ?? 0) }; const actionData = new FormData(); actionData.set("payload", JSON.stringify(payload)); setMessage(""); startTransition(() => { saveStoryChapterAction(actionData).then(() => setMessage("Chapter saved.")).catch((error: unknown) => setMessage(error instanceof Error ? error.message : "Could not save chapter.")); }); }
  
  return (
    <form onSubmit={submit} className="flex flex-col gap-10 bg-[#0b0d0d]">
      <div className="flex flex-col gap-6 border border-white/5 bg-white/[0.02] p-6">
        <h3 className="mb-2 text-[0.65rem] font-bold tracking-[0.2em] text-white/20 uppercase">Chapter Overview</h3>
        <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <Field label="Slug" name="slug" placeholder="100-level-genesis" />
          <Field label="Year" name="year" placeholder="2021 / 2022" />
          <Field label="Level" name="level" placeholder="100 Level" />
          <Field label="Title" name="title" />
          <Field label="Eyebrow" name="eyebrow" />
          <Field label="Sort order" name="sortOrder" type="number" required={false} />
        </div>
      </div>

      <div className="flex flex-col gap-6 border border-white/5 bg-white/[0.02] p-6">
        <h3 className="mb-2 text-[0.65rem] font-bold tracking-[0.2em] text-white/20 uppercase">Content</h3>
        <Field label="Headline" name="headline" />
        <TextArea label="Narrative (blank line to separate paragraphs)" name="narrative" rows={6} />
        <TextArea label="Key courses (one per line)" name="keyCourses" rows={4} />
        <TextArea label="Defining moment" name="definingMoment" rows={3} />
        <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <TextArea label="Quote text" name="quoteText" rows={2} />
          <Field label="Quote author" name="quoteAuthor" />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-white/10 pt-6">
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-3">
            <span className="text-[0.65rem] font-bold tracking-[0.1em] text-white/40 uppercase">Tone</span>
            <select name="tone" defaultValue="stone" className="h-9 border-b border-white/20 bg-transparent pl-1 pr-6 text-sm text-white outline-none">
              <option value="forest">Forest</option><option value="slate">Slate</option><option value="stone">Stone</option><option value="dark">Dark</option>
            </select>
          </label>
          <label className="flex items-center gap-3">
            <span className="text-[0.65rem] font-bold tracking-[0.1em] text-white/40 uppercase">Status</span>
            <select name="status" defaultValue="draft" className="h-9 border-b border-white/20 bg-transparent pl-1 pr-6 text-sm text-white outline-none">
              <option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option>
            </select>
          </label>
        </div>
        <div className="flex items-center gap-6"><span className="text-xs font-medium text-white/50">{message}</span><SaveButton pending={pending} /></div>
      </div>
    </form>
  );
}

export function StoryMemoryEditor() {
  const [pending, startTransition] = useTransition(); const [message, setMessage] = useState("");
  function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); const payload = { category: data.get("category"), title: data.get("title"), snippet: data.get("snippet"), author: data.get("author"), status: data.get("status"), sortOrder: Number(data.get("sortOrder") ?? 0) }; const actionData = new FormData(); actionData.set("payload", JSON.stringify(payload)); startTransition(() => { saveStoryMemoryAction(actionData).then(() => setMessage("Memory saved.")).catch((error: unknown) => setMessage(error instanceof Error ? error.message : "Could not save memory.")); }); }
  
  return (
    <form onSubmit={submit} className="flex flex-col gap-8 bg-[#0b0d0d]">
      <div className="flex flex-col gap-6 border border-white/5 bg-white/[0.02] p-6">
        <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <Field label="Category" name="category" />
          <Field label="Title" name="title" />
          <Field label="Author" name="author" />
          <Field label="Sort order" name="sortOrder" type="number" required={false} />
        </div>
        <TextArea label="Snippet" name="snippet" rows={3} />
      </div>
      <div className="flex items-center justify-between border-t border-white/10 pt-4">
        <label className="flex items-center gap-3"><span className="text-[0.65rem] font-bold tracking-[0.1em] text-white/40 uppercase">Status</span><select name="status" defaultValue="draft" className="h-9 border-b border-white/20 bg-transparent pl-1 pr-6 text-sm text-white outline-none"><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label>
        <div className="flex items-center gap-6"><span className="text-xs font-medium text-white/50">{message}</span><SaveButton pending={pending} /></div>
      </div>
    </form>
  );
}

export function StoryStatEditor() {
  const [pending, startTransition] = useTransition(); const [message, setMessage] = useState("");
  function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); const payload = { label: data.get("label"), value: data.get("value"), status: data.get("status"), sortOrder: Number(data.get("sortOrder") ?? 0) }; const actionData = new FormData(); actionData.set("payload", JSON.stringify(payload)); startTransition(() => { saveStoryStatAction(actionData).then(() => setMessage("Stat saved.")).catch((error: unknown) => setMessage(error instanceof Error ? error.message : "Could not save stat.")); }); }
  
  return (
    <form onSubmit={submit} className="flex flex-col gap-8 bg-[#0b0d0d]">
      <div className="flex flex-col gap-6 border border-white/5 bg-white/[0.02] p-6">
        <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <Field label="Label" name="label" />
          <Field label="Value" name="value" placeholder="8+" />
          <Field label="Sort order" name="sortOrder" type="number" required={false} />
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-white/10 pt-4">
        <label className="flex items-center gap-3"><span className="text-[0.65rem] font-bold tracking-[0.1em] text-white/40 uppercase">Status</span><select name="status" defaultValue="draft" className="h-9 border-b border-white/20 bg-transparent pl-1 pr-6 text-sm text-white outline-none"><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label>
        <div className="flex items-center gap-6"><span className="text-xs font-medium text-white/50">{message}</span><SaveButton pending={pending} /></div>
      </div>
    </form>
  );
}
