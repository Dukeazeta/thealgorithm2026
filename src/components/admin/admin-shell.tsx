import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAction } from "@/app/admin/actions";
import { requireAdmin, UnauthorizedError } from "@/lib/auth";

const navigation = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/submissions", label: "Submissions" },
  { href: "/admin/graduates", label: "Graduates" },
  { href: "/admin/gallery", label: "Gallery" },
  { href: "/admin/story", label: "Story" },
];

export async function AdminShell({ children }: { children: React.ReactNode }) {
  let session;
  try {
    session = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) redirect("/admin/login");
    throw error;
  }

  return (
    <div className="min-h-svh bg-[#0b0d0d] text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b0d0d]/85 px-4 py-4 backdrop-blur-xl sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[96rem] items-center justify-between gap-6">
          <Link href="/admin" className="group flex items-center gap-3">
            <span className="text-lg font-bold tracking-tighter text-white transition-opacity hover:opacity-70">
              A26
            </span>
            <span className="hidden text-sm font-semibold tracking-[-0.02em] text-white/50 sm:block">
              Archive Console
            </span>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex" aria-label="Admin navigation">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="border-b border-transparent pb-1 text-xs font-medium text-white/60 transition-all hover:border-white/40 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-white/45 md:block">{session.email}</span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="border border-white/10 bg-transparent px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-white/5 active:scale-[0.98]"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
        <nav className="mx-auto mt-4 flex max-w-[96rem] gap-4 overflow-x-auto lg:hidden" aria-label="Admin navigation">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 border-b border-white/10 pb-2 text-xs font-medium text-white/65 hover:border-white/40 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      {children}
    </div>
  );
}
