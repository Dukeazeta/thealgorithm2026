"use client";

import { useState, useTransition } from "react";
import {
  saveGalleryAction,
  saveGraduateAction,
  saveStoryChapterAction,
  saveStoryMemoryAction,
  saveStoryStatAction,
} from "@/app/admin/actions";

function Field({ label, name, type = "text", placeholder, required = true }: { label: string; name: string; type?: string; placeholder?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-white/55">{label}</span>
      <input name={name} type={type} required={required} placeholder={placeholder} className="mt-2 h-11 w-full rounded-xl border border-white/12 bg-black/20 px-3.5 text-sm text-white outline-none transition-colors placeholder:text-white/20 focus:border-[#d7ff5a]/70" />
    </label>
  );
}

function TextArea({ label, name, placeholder, rows = 4 }: { label: string; name: string; placeholder?: string; rows?: number }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-white/55">{label}</span>
      <textarea name={name} rows={rows} required placeholder={placeholder} className="mt-2 w-full rounded-xl border border-white/12 bg-black/20 px-3.5 py-3 text-sm leading-6 text-white outline-none transition-colors placeholder:text-white/20 focus:border-[#d7ff5a]/70" />
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
    <div className="rounded-xl border border-dashed border-white/15 bg-black/15 p-4">
      <label className="flex cursor-pointer items-center justify-between gap-4">
        <span><span className="block text-xs font-semibold text-white/60">Archive image</span><span className="mt-1 block text-xs text-white/35">JPEG, PNG, or WebP · 10 MB maximum</span></span>
        <span className="rounded-full bg-white/10 px-3 py-2 text-xs font-bold text-white">{pending ? "Uploading" : "Choose file"}</span>
        <input type="file" accept="image/jpeg,image/png,image/webp" disabled={pending} className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) upload(file); }} />
      </label>
      <p className="mt-3 text-xs text-[#d7ff5a]">{message}</p>
    </div>
  );
}

function SaveButton({ pending }: { pending: boolean }) {
  return <button type="submit" disabled={pending} className="h-11 rounded-xl bg-[#d7ff5a] px-5 text-xs font-bold text-[#0b0d0d] transition-transform hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60">{pending ? "Saving…" : "Save draft"}</button>;
}

export function GraduateEditor() {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [mediaAssetId, setMediaAssetId] = useState<string | null>(null);

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
    <form onSubmit={submit} className="space-y-5 rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2"><Field label="Full name" name="name" /><Field label="Nickname" name="nickname" /><Field label="Slug" name="slug" placeholder="duke-azeta" /><Field label="Date of birth" name="dob" placeholder="December 14" /></div>
      <MediaUploadField onChange={setMediaAssetId} />
      <div className="grid gap-4 sm:grid-cols-2"><Field label="Image alt text" name="alt" /><Field label="Favourite colour" name="favouriteColour" /><Field label="Favorite lecturer" name="favoriteLecturer" /><Field label="Favorite level" name="favoriteLevel" /><Field label="Worst level" name="worstLevel" /><Field label="If not Computer Science" name="ifNotComputerScience" /><Field label="Stay or japa" name="stayOrJapa" /><Field label="Sort order" name="sortOrder" type="number" required={false} /></div>
      <TextArea label="Advice to younger students" name="adviceToYoungerLevel" /><TextArea label="Skills and hobbies" name="skillsHobbies" /><TextArea label="Department friends, comma separated" name="departmentFriends" /><TextArea label="Favourite quote" name="favouriteQuote" />
      <div className="flex flex-wrap items-center justify-between gap-4"><select name="status" defaultValue="draft" className="h-11 rounded-xl border border-white/12 bg-black/20 px-3 text-sm text-white"><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select><div className="flex items-center gap-4"><span className="text-xs text-[#d7ff5a]">{message}</span><SaveButton pending={pending} /></div></div>
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
    <form onSubmit={submit} className="space-y-5 rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 sm:p-8"><div className="grid gap-4 sm:grid-cols-2"><Field label="Title" name="title" /><Field label="Slug" name="slug" placeholder="project-defence" /><Field label="Year" name="year" placeholder="2026" /><Field label="Location" name="location" /></div><MediaUploadField onChange={setMediaAssetId} /><div className="grid gap-4 sm:grid-cols-2"><Field label="Image alt text" name="alt" /><Field label="Tag" name="tag" placeholder="Milestone" /><Field label="Sort order" name="sortOrder" type="number" required={false} /><label className="flex items-center gap-3 pt-6 text-sm text-white/65"><input name="featured" type="checkbox" className="h-4 w-4 accent-[#d7ff5a]" /> Feature this frame</label></div><label className="block"><span className="text-xs font-semibold text-white/55">Category</span><select name="category" defaultValue="Class" className="mt-2 h-11 w-full rounded-xl border border-white/12 bg-black/20 px-3 text-sm text-white"><option>Class</option><option>Campus</option><option>Labs</option><option>Celebrations</option></select></label><TextArea label="Caption" name="caption" rows={5} /><div className="flex flex-wrap items-center justify-between gap-4"><select name="status" defaultValue="draft" className="h-11 rounded-xl border border-white/12 bg-black/20 px-3 text-sm text-white"><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select><div className="flex items-center gap-4"><span className="text-xs text-[#d7ff5a]">{message}</span><SaveButton pending={pending} /></div></div></form>
  );
}

export function StoryChapterEditor() {
  const [pending, startTransition] = useTransition(); const [message, setMessage] = useState("");
  function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); const payload = { slug: data.get("slug"), year: data.get("year"), level: data.get("level"), title: data.get("title"), eyebrow: data.get("eyebrow"), headline: data.get("headline"), narrative: String(data.get("narrative") ?? "").split(/\n\s*\n/).map((value) => value.trim()).filter(Boolean), keyCourses: String(data.get("keyCourses") ?? "").split("\n").map((value) => value.trim()).filter(Boolean), definingMoment: data.get("definingMoment"), quoteText: data.get("quoteText"), quoteAuthor: data.get("quoteAuthor"), tone: data.get("tone"), status: data.get("status"), sortOrder: Number(data.get("sortOrder") ?? 0) }; const actionData = new FormData(); actionData.set("payload", JSON.stringify(payload)); setMessage(""); startTransition(() => { saveStoryChapterAction(actionData).then(() => setMessage("Chapter saved.")).catch((error: unknown) => setMessage(error instanceof Error ? error.message : "Could not save chapter.")); }); }
  return <form onSubmit={submit} className="space-y-5 rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 sm:p-8"><div className="grid gap-4 sm:grid-cols-2"><Field label="Slug" name="slug" placeholder="100-level-genesis" /><Field label="Year" name="year" placeholder="2021 / 2022" /><Field label="Level" name="level" placeholder="100 Level" /><Field label="Title" name="title" /><Field label="Eyebrow" name="eyebrow" /><Field label="Sort order" name="sortOrder" type="number" required={false} /></div><Field label="Headline" name="headline" /><TextArea label="Narrative paragraphs, separated by blank lines" name="narrative" rows={8} /><TextArea label="Key courses, one per line" name="keyCourses" rows={5} /><TextArea label="Defining moment" name="definingMoment" /><TextArea label="Quote" name="quoteText" /><Field label="Quote author" name="quoteAuthor" /><div className="grid gap-4 sm:grid-cols-2"><select name="tone" defaultValue="stone" className="h-11 rounded-xl border border-white/12 bg-black/20 px-3 text-sm text-white"><option value="forest">Forest</option><option value="slate">Slate</option><option value="stone">Stone</option><option value="dark">Dark</option></select><select name="status" defaultValue="draft" className="h-11 rounded-xl border border-white/12 bg-black/20 px-3 text-sm text-white"><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></div><div className="flex justify-end"><div className="flex items-center gap-4"><span className="text-xs text-[#d7ff5a]">{message}</span><SaveButton pending={pending} /></div></div></form>;
}

export function StoryMemoryEditor() {
  const [pending, startTransition] = useTransition(); const [message, setMessage] = useState("");
  function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); const payload = { category: data.get("category"), title: data.get("title"), snippet: data.get("snippet"), author: data.get("author"), status: data.get("status"), sortOrder: Number(data.get("sortOrder") ?? 0) }; const actionData = new FormData(); actionData.set("payload", JSON.stringify(payload)); startTransition(() => { saveStoryMemoryAction(actionData).then(() => setMessage("Memory saved.")).catch((error: unknown) => setMessage(error instanceof Error ? error.message : "Could not save memory.")); }); }
  return <form onSubmit={submit} className="space-y-4 rounded-[2rem] border border-white/10 bg-white/[0.055] p-6"><div className="grid gap-4 sm:grid-cols-2"><Field label="Category" name="category" /><Field label="Title" name="title" /><Field label="Author" name="author" /><Field label="Sort order" name="sortOrder" type="number" required={false} /></div><TextArea label="Snippet" name="snippet" rows={4} /><div className="flex items-center justify-between gap-4"><select name="status" defaultValue="draft" className="h-10 rounded-xl border border-white/12 bg-black/20 px-3 text-sm text-white"><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select><div className="flex items-center gap-3"><span className="text-xs text-[#d7ff5a]">{message}</span><SaveButton pending={pending} /></div></div></form>;
}

export function StoryStatEditor() {
  const [pending, startTransition] = useTransition(); const [message, setMessage] = useState("");
  function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); const payload = { label: data.get("label"), value: data.get("value"), status: data.get("status"), sortOrder: Number(data.get("sortOrder") ?? 0) }; const actionData = new FormData(); actionData.set("payload", JSON.stringify(payload)); startTransition(() => { saveStoryStatAction(actionData).then(() => setMessage("Stat saved.")).catch((error: unknown) => setMessage(error instanceof Error ? error.message : "Could not save stat.")); }); }
  return <form onSubmit={submit} className="space-y-4 rounded-[2rem] border border-white/10 bg-white/[0.055] p-6"><div className="grid gap-4 sm:grid-cols-2"><Field label="Label" name="label" /><Field label="Value" name="value" placeholder="8+" /><Field label="Sort order" name="sortOrder" type="number" required={false} /></div><div className="flex items-center justify-between gap-4"><select name="status" defaultValue="draft" className="h-10 rounded-xl border border-white/12 bg-black/20 px-3 text-sm text-white"><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select><div className="flex items-center gap-3"><span className="text-xs text-[#d7ff5a]">{message}</span><SaveButton pending={pending} /></div></div></form>;
}
