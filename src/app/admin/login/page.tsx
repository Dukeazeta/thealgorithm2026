import { GeistSans } from "geist/font/sans";
import { LoginForm } from "@/components/admin/login-form";

export default function AdminLoginPage() {
  return (
    <main className={`${GeistSans.className} min-h-svh overflow-x-hidden bg-[#0b0d0d] px-5 py-8 text-white sm:px-10 lg:px-16`}>
      <div className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-[96rem] items-center">
        <div className="grid w-full gap-16 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <p className="text-xs font-medium tracking-[0.2em] text-[#d7ff5a] uppercase">The Algorithm 26 / Archive Console</p>
            <h1 className="mt-6 max-w-6xl text-[clamp(3rem,6vw,7rem)] leading-[0.92] font-medium tracking-[-0.075em]">
              Keep the record in motion.
            </h1>
            <p className="mt-8 max-w-xl text-base leading-7 text-white/55 sm:text-lg">
              A quiet workspace for the people, photographs, and memories that make the class story durable.
            </p>
          </div>
          <div className="lg:col-span-5 lg:pl-10">
            <div className="rounded-[2rem] border border-white/12 bg-white/[0.055] p-6 shadow-2xl shadow-black/25 backdrop-blur-xl sm:p-9">
              <div className="mb-8 flex items-end justify-between border-b border-white/10 pb-5">
                <div>
                  <p className="text-xs font-semibold tracking-[0.16em] text-white/45 uppercase">Administrator access</p>
                  <h2 className="mt-2 text-2xl font-medium tracking-[-0.04em]">Sign in to the archive</h2>
                </div>
                <span className="h-3 w-3 rounded-full bg-[#d7ff5a] shadow-[0_0_24px_rgba(215,255,90,.7)]" />
              </div>
              <LoginForm />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
