import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { Toaster } from "@/components/ui/sonner";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <>
      <AdminShell
        userName={session.user.name || "Admin"}
        userRole={session.user.role}
      >
        {children}
      </AdminShell>
      <Toaster />
    </>
  );
}
