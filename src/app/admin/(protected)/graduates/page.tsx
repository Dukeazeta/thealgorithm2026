import { GraduateEditor } from "@/components/admin/editor-forms";
import { listAllGraduates } from "@/lib/content";

export default async function AdminGraduatesPage() {
  const graduates = await listAllGraduates();
  return (
    <main className="w-full max-w-full overflow-x-hidden px-5 py-20 sm:px-10 sm:py-28 lg:px-16 lg:py-36">
      <div className="mx-auto max-w-[96rem]">
        <div className="grid gap-8 border-b border-white/10 pb-12 lg:grid-cols-12 lg:items-end"><div className="lg:col-span-8"><p className="text-xs font-semibold tracking-[0.18em] text-[#d7ff5a] uppercase">People directory</p><h1 className="mt-5 max-w-6xl text-[clamp(3rem,5vw,6rem)] leading-[0.9] font-medium tracking-[-0.075em]">Give every face a proper record.</h1></div><p className="max-w-md text-sm leading-7 text-white/50 lg:col-span-4">Create a profile, attach a portrait from Blob, and publish it when the details are ready.</p></div>
        <div className="mt-14 grid gap-12 lg:grid-cols-12"><section className="lg:col-span-7"><h2 className="text-2xl font-medium tracking-[-0.05em]">New graduate profile</h2><p className="mt-2 mb-6 text-sm text-white/45">Save as draft first, then publish from the status selector.</p><GraduateEditor /></section><aside className="lg:col-span-5"><h2 className="text-2xl font-medium tracking-[-0.05em]">Existing records</h2><div className="mt-6 space-y-3">{graduates.length === 0 ? <div className="rounded-2xl border border-dashed border-white/15 p-6 text-sm text-white/45">No graduate profiles yet.</div> : graduates.map((graduate) => <div key={graduate.id} className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.045] p-4"><div><p className="font-medium">{graduate.name}</p><p className="mt-1 text-xs text-white/40">{graduate.slug}</p></div><span className="rounded-full bg-white/8 px-3 py-1 text-[0.65rem] font-semibold text-white/55 uppercase">{graduate.status}</span></div>)}</div></aside></div>
      </div>
    </main>
  );
}
