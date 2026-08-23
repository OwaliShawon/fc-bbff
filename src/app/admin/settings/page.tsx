import { getSiteSettings } from "@/actions/settings-actions";
import { SettingsClient } from "./settings-client";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();
  return <SettingsClient initialSettings={settings} />;
}
