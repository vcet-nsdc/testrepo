import { auth } from "@/auth";
import AdminShell from "@/components/admin/AdminShell";
import type { Role } from "@/config/roles";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) return <>{children}</>;

  return (
    <AdminShell role={session.user.role as Role} name={session.user.name ?? "Admin"}>
      {children}
    </AdminShell>
  );
}
