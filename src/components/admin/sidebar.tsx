"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import type { UserRole } from "@prisma/client";
import {
  LayoutDashboard,
  Users,
  Shield,
  Trophy,
  Calendar,
  Newspaper,
  Settings,
  ClipboardList,
  Swords,
  Medal,
  BarChart3,
  ImageIcon,
  FileText,
  ChevronDown,
  UserCircle,
  UsersRound,
  UserCheck,
  CalendarDays,
  TableProperties,
  Star,
  MapPin,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  permission?: string;
  children?: {
    title: string;
    href: string;
    permission?: string;
  }[];
};

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Club",
    items: [
      {
        title: "Players",
        href: "/admin/players",
        icon: UserCircle,
        permission: PERMISSIONS.PLAYERS_VIEW,
      },
      {
        title: "Teams",
        href: "/admin/teams",
        icon: UsersRound,
        permission: PERMISSIONS.TEAMS_VIEW,
      },
      {
        title: "Management",
        href: "/admin/management",
        icon: UserCheck,
        permission: PERMISSIONS.PLAYERS_VIEW,
      },
    ],
  },
  {
    label: "Matches & Venues",
    items: [
      {
        title: "Fixtures & Results",
        href: "/admin/matches",
        icon: Swords,
        permission: PERMISSIONS.MATCHES_VIEW,
      },
      {
        title: "Venues",
        href: "/admin/venues",
        icon: MapPin,
        permission: PERMISSIONS.VENUES_VIEW,
      },
      {
        title: "Statistics",
        href: "/admin/statistics",
        icon: BarChart3,
        permission: PERMISSIONS.MATCHES_VIEW,
      },
    ],
  },
  {
    label: "Competitions",
    items: [
      {
        title: "Competitions",
        href: "/admin/competitions",
        icon: Trophy,
        permission: PERMISSIONS.COMPETITIONS_VIEW,
      },
      {
        title: "Seasons",
        href: "/admin/seasons",
        icon: CalendarDays,
        permission: PERMISSIONS.COMPETITIONS_VIEW,
      },
      {
        title: "League Tables",
        href: "/admin/league-tables",
        icon: TableProperties,
        permission: PERMISSIONS.COMPETITIONS_VIEW,
      },
    ],
  },
  {
    label: "Events",
    items: [
      {
        title: "Club Events",
        href: "/admin/events",
        icon: Calendar,
        permission: PERMISSIONS.EVENTS_VIEW,
      },
    ],
  },
  {
    label: "Content",
    items: [
      {
        title: "News",
        href: "/admin/news",
        icon: Newspaper,
        permission: PERMISSIONS.NEWS_VIEW,
      },
      {
        title: "Media",
        href: "/admin/media",
        icon: ImageIcon,
        permission: PERMISSIONS.MEDIA_VIEW,
      },
    ],
  },
  {
    label: "Users & Security",
    items: [
      {
        title: "Users",
        href: "/admin/users",
        icon: Users,
        permission: PERMISSIONS.USERS_VIEW,
      },
      {
        title: "Audit Logs",
        href: "/admin/audit-logs",
        icon: ClipboardList,
        permission: PERMISSIONS.AUDIT_LOGS_VIEW,
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        title: "Settings",
        href: "/admin/settings",
        icon: Settings,
        permission: PERMISSIONS.SETTINGS_VIEW,
      },
    ],
  },
];

export function AdminSidebar({
  userRole,
  isOpen,
  onClose,
}: {
  userRole: UserRole;
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-neutral-200 bg-white transition-transform duration-200 dark:border-neutral-800 dark:bg-neutral-950 lg:sticky lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-neutral-200 px-6 dark:border-neutral-800">
          <div className="relative h-9 w-9 overflow-hidden rounded-full border border-neutral-200 bg-neutral-900 shadow-sm dark:border-neutral-800">
            <Image
              src="/logo.png"
              alt="FC BBFF Logo"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h1 className="text-sm font-bold text-neutral-900 dark:text-white">
              FC BBFF
            </h1>
            <p className="text-xs text-neutral-500">Admin Dashboard</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {navGroups.map((group) => {
            const visibleItems = group.items.filter(
              (item) =>
                !item.permission ||
                hasPermission(userRole, item.permission as never)
            );

            if (visibleItems.length === 0) return null;

            return (
              <div key={group.label} className="mb-6">
                <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  {group.label}
                </p>
                <div className="space-y-1">
                  {visibleItems.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (item.href !== "/admin" &&
                        pathname.startsWith(item.href));

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                            : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
                        )}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {item.title}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-neutral-200 px-6 py-3 dark:border-neutral-800">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
          >
            ← View Public Site
          </Link>
        </div>
      </aside>
    </>
  );
}
