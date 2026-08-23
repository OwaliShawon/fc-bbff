"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateSiteSettings } from "@/actions/settings-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Shield, Globe, Share2, Info } from "lucide-react";
import type { SiteSettingsMap } from "@/types";

export function SettingsClient({ initialSettings }: { initialSettings: SiteSettingsMap }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    clubName: initialSettings.clubName || "FC BBFF",
    clubMotto: initialSettings.clubMotto || "One for All, All for One",
    clubLogo: initialSettings.clubLogo || "/logo.png",
    contactEmail: initialSettings.contactEmail || "info@fcbbff.com",
    contactPhone: initialSettings.contactPhone || "+880 1700-000000",
    address: initialSettings.address || "FC BBFF Ground, Dhaka, Bangladesh",
    facebookUrl: initialSettings.facebookUrl || "https://facebook.com/fcbbff",
    twitterUrl: initialSettings.twitterUrl || "",
    instagramUrl: initialSettings.instagramUrl || "https://instagram.com/fcbbff",
    youtubeUrl: initialSettings.youtubeUrl || "",
    aboutText:
      initialSettings.aboutText ||
      "FC BBFF is an amateur football club built on camaraderie, dedication, and passion.",
    footerText: initialSettings.footerText || "© 2026 FC BBFF. All rights reserved.",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateSiteSettings(formData);
      if (result.success) {
        toast.success("Site settings updated successfully!");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update settings");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Club & Site Settings
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Configure global club branding, identity, contact information, and social links.
          </p>
        </div>
        <Button type="submit" disabled={isPending} className="bg-emerald-600 hover:bg-emerald-500">
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Brand Identity */}
        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-500" /> Club Identity & Branding
            </CardTitle>
            <CardDescription>Primary club names, mottos, and logos displayed across the site.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="clubName">Club Name *</Label>
              <Input
                id="clubName"
                required
                value={formData.clubName}
                onChange={(e) => setFormData({ ...formData, clubName: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="clubMotto">Club Motto</Label>
              <Input
                id="clubMotto"
                value={formData.clubMotto}
                onChange={(e) => setFormData({ ...formData, clubMotto: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="clubLogo">Logo URL / Path</Label>
              <Input
                id="clubLogo"
                value={formData.clubLogo}
                onChange={(e) => setFormData({ ...formData, clubLogo: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-500" /> Contact & Location
            </CardTitle>
            <CardDescription>Official contact details displayed in header and footer.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input
                id="contactPhone"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="address">Club Ground / Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Social Media Links */}
        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Share2 className="h-5 w-5 text-amber-500" /> Social Channels
            </CardTitle>
            <CardDescription>Direct links to official club social media pages.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="facebookUrl">Facebook URL</Label>
              <Input
                id="facebookUrl"
                placeholder="https://facebook.com/..."
                value={formData.facebookUrl}
                onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="instagramUrl">Instagram URL</Label>
              <Input
                id="instagramUrl"
                placeholder="https://instagram.com/..."
                value={formData.instagramUrl}
                onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="youtubeUrl">YouTube URL</Label>
              <Input
                id="youtubeUrl"
                placeholder="https://youtube.com/..."
                value={formData.youtubeUrl}
                onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* About & Footer */}
        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Info className="h-5 w-5 text-emerald-500" /> About & Footer Content
            </CardTitle>
            <CardDescription>Club summary and copyright notices.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="aboutText">About Us Summary</Label>
              <Textarea
                id="aboutText"
                rows={3}
                value={formData.aboutText}
                onChange={(e) => setFormData({ ...formData, aboutText: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="footerText">Footer Copyright Text</Label>
              <Input
                id="footerText"
                value={formData.footerText}
                onChange={(e) => setFormData({ ...formData, footerText: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
