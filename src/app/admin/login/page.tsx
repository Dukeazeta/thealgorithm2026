import Link from "next/link";
import { GeistSans } from "geist/font/sans";
import { AdminMotion } from "@/components/admin/admin-motion";
import { LoginForm } from "@/components/admin/login-form";

export default function AdminLoginPage() {
  return (
    <main className={`${GeistSans.className} relative min-h-[100dvh] overflow-x-hidden bg-[#0b0d0d] text-white`}>

      {/* Header */}
      <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-6 py-5 sm:px-10">
        <Link href="/admin/login" className="flex items-center gap-3 transition-opacity hover:opacity-70">
          <span className="flex h-2 w-2 bg-white" />
          <span className="text-xs font-semibold tracking-[0.16em] uppercase">The Algorithm 26</span>
        </Link>
        <Link href="/" className="hidden text-xs text-white/40 transition-colors hover:text-white sm:block">
          Return to public archive
        </Link>
      </header>

      {/* Split layout */}
      <div className="relative z-10 grid min-h-[100dvh] grid-cols-1 lg:grid-cols-2">

        {/* Left — Hero copy */}
        <div className="flex flex-col justify-end px-6 pb-12 pt-28 sm:px-10 lg:justify-center lg:px-16 lg:py-24" data-admin-reveal>
          <p className="text-[0.65rem] font-semibold tracking-[0.2em] text-white/30 uppercase">Archive console</p>
          <h1 className="mt-5 max-w-xl text-[clamp(2.8rem,6vw,5.5rem)] leading-[0.9] font-medium tracking-[-0.06em]">
            Keep the record
            <br />
            in motion.
          </h1>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-white/40">
            A quiet workspace for the people, photographs, and memories that make the class story durable.
          </p>
        </div>

        {/* Right — Login form */}
        <div className="flex flex-col justify-center border-t border-white/8 px-6 py-12 sm:px-10 lg:border-t-0 lg:border-l lg:px-16 lg:py-24" data-admin-reveal>
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-8">
              <div className="mb-2 flex items-center gap-2 text-[0.65rem] font-semibold tracking-[0.16em] text-white/30 uppercase">
                <span className="h-1.5 w-1.5 bg-white/40" />
                Administrator access
              </div>
              <h2 className="text-2xl font-medium tracking-tight">Sign in to the archive</h2>
            </div>
            <LoginForm />
            <p className="mt-5 text-[0.65rem] text-white/25">
              Use the credentials created for the archive administrator.
            </p>
          </div>
        </div>
      </div>

      <AdminMotion />
    </main>
  );
}
