import { GeistSans } from "geist/font/sans";
import { AdminShell } from "@/components/admin/admin-shell";

export default function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={GeistSans.className}>
      <AdminShell>{children}</AdminShell>
    </div>
  );
}
