/**
 * Single source of truth for club management / leadership roles.
 * Keep in sync with the `ManagementRole` enum in prisma/schema.prisma.
 * Array order = display order (admin dropdown + public management page).
 */
export const MANAGEMENT_ROLES = [
  "PRESIDENT",
  "VICE_PRESIDENT",
  "TREASURER",
  "MANAGER",
  "ASSISTANT_MANAGER",
  "MEDIA_MANAGER",
  "CAPTAIN",
  "VICE_CAPTAIN",
] as const;

export type ManagementRoleValue = (typeof MANAGEMENT_ROLES)[number];

export const MANAGEMENT_ROLE_LABELS: Record<ManagementRoleValue, string> = {
  PRESIDENT: "President",
  VICE_PRESIDENT: "Vice President",
  TREASURER: "Treasurer",
  MANAGER: "Manager",
  ASSISTANT_MANAGER: "Assistant Manager",
  MEDIA_MANAGER: "Media Manager",
  CAPTAIN: "Captain",
  VICE_CAPTAIN: "Vice-Captain",
};

/** Tailwind classes for the admin role badge */
export const MANAGEMENT_ROLE_BADGE: Record<ManagementRoleValue, { className: string; label: string }> = {
  PRESIDENT: { className: "bg-purple-500/20 text-purple-300", label: "President" },
  VICE_PRESIDENT: { className: "bg-fuchsia-500/20 text-fuchsia-300", label: "Vice President" },
  TREASURER: { className: "bg-yellow-500/20 text-yellow-300", label: "Treasurer" },
  MANAGER: { className: "bg-emerald-500/20 text-emerald-300", label: "Manager" },
  ASSISTANT_MANAGER: { className: "bg-teal-500/20 text-teal-300", label: "Assistant Manager" },
  MEDIA_MANAGER: { className: "bg-pink-500/20 text-pink-300", label: "Media Manager" },
  CAPTAIN: { className: "bg-amber-500/20 text-amber-300", label: "Captain (C)" },
  VICE_CAPTAIN: { className: "bg-blue-500/20 text-blue-300", label: "Vice-Captain (VC)" },
};
