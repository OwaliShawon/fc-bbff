import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin } from "lucide-react";
import type { SiteSettingsMap } from "@/types";

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function TwitterIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function YoutubeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </svg>
  );
}

export function PublicFooter({ settings }: { settings: SiteSettingsMap }) {
  return (
    <footer className="border-t border-white/10 bg-neutral-950">
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-neutral-900 border border-white/10 shadow-lg shadow-emerald-500/10">
                <Image
                  src="/logo.png"
                  alt="FC BBFF Logo"
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
              <span className="text-lg font-bold text-white">{settings.clubName}</span>
            </div>
            <p className="text-sm leading-relaxed text-neutral-400">
              {settings.clubMotto || "One for All, All for One"}
            </p>
            <div className="flex gap-3">
              {settings.facebookUrl && (
                <a href={settings.facebookUrl} target="_blank" rel="noreferrer" className="rounded-lg bg-white/5 p-2 text-neutral-400 transition-colors hover:bg-emerald-500/20 hover:text-emerald-400">
                  <FacebookIcon className="h-4 w-4" />
                </a>
              )}
              {settings.twitterUrl && (
                <a href={settings.twitterUrl} target="_blank" rel="noreferrer" className="rounded-lg bg-white/5 p-2 text-neutral-400 transition-colors hover:bg-emerald-500/20 hover:text-emerald-400">
                  <TwitterIcon className="h-4 w-4" />
                </a>
              )}
              {settings.instagramUrl && (
                <a href={settings.instagramUrl} target="_blank" rel="noreferrer" className="rounded-lg bg-white/5 p-2 text-neutral-400 transition-colors hover:bg-emerald-500/20 hover:text-emerald-400">
                  <InstagramIcon className="h-4 w-4" />
                </a>
              )}
              {settings.youtubeUrl && (
                <a href={settings.youtubeUrl} target="_blank" rel="noreferrer" className="rounded-lg bg-white/5 p-2 text-neutral-400 transition-colors hover:bg-emerald-500/20 hover:text-emerald-400">
                  <YoutubeIcon className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { href: "/about", label: "About Us" },
                { href: "/management", label: "Management" },
                { href: "/players", label: "Players" },
                { href: "/teams", label: "Teams" },
                { href: "/matches", label: "Matches" },
                { href: "/news", label: "Latest News" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-neutral-400 transition-colors hover:text-emerald-400">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* More */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">More</h3>
            <ul className="space-y-3">
              {[
                { href: "/competitions", label: "Competitions" },
                { href: "/events", label: "Events" },
                { href: "/statistics", label: "Statistics" },
                { href: "/admin", label: "Admin Login" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-neutral-400 transition-colors hover:text-emerald-400">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Contact</h3>
            <ul className="space-y-3">
              {settings.contactEmail && (
                <li className="flex items-center gap-2 text-sm text-neutral-400">
                  <Mail className="h-4 w-4 text-emerald-500" />
                  {settings.contactEmail}
                </li>
              )}
              {settings.contactPhone && (
                <li className="flex items-center gap-2 text-sm text-neutral-400">
                  <Phone className="h-4 w-4 text-emerald-500" />
                  {settings.contactPhone}
                </li>
              )}
              {settings.address && (
                <li className="flex items-start gap-2 text-sm text-neutral-400">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  {settings.address}
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8 text-center">
          <p className="text-sm text-neutral-500">
            {settings.footerText || `© ${new Date().getFullYear()} ${settings.clubName}. All rights reserved.`}
          </p>
        </div>
      </div>
    </footer>
  );
}
