import Link from "next/link";
import { getSiteSettings } from "@/actions/settings-actions";
import { Toaster } from "@/components/ui/sonner";
import { PublicNavbar } from "@/components/public/navbar";
import { PublicFooter } from "@/components/public/footer";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  return (
    <div className="flex min-h-screen flex-col bg-neutral-950 text-white">
      <PublicNavbar clubName={settings.clubName} />
      <main className="flex-1">{children}</main>
      <PublicFooter settings={settings} />
      <Toaster />
    </div>
  );
}
