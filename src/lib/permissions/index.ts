import { UserRole } from "@prisma/client";

/**
 * Permission definitions for Role-Based Access Control.
 * Each permission follows the pattern: module.action
 */
export const PERMISSIONS = {
  // Players
  PLAYERS_VIEW: "players.view",
  PLAYERS_CREATE: "players.create",
  PLAYERS_UPDATE: "players.update",
  PLAYERS_DELETE: "players.delete",

  // Teams
  TEAMS_VIEW: "teams.view",
  TEAMS_CREATE: "teams.create",
  TEAMS_UPDATE: "teams.update",
  TEAMS_DELETE: "teams.delete",

  // Matches
  MATCHES_VIEW: "matches.view",
  MATCHES_CREATE: "matches.create",
  MATCHES_UPDATE: "matches.update",
  MATCHES_DELETE: "matches.delete",
  MATCHES_PUBLISH: "matches.publish",

  // Results
  RESULTS_CREATE: "results.create",
  RESULTS_UPDATE: "results.update",
  RESULTS_DELETE: "results.delete",

  // Events
  EVENTS_VIEW: "events.view",
  EVENTS_CREATE: "events.create",
  EVENTS_UPDATE: "events.update",
  EVENTS_DELETE: "events.delete",

  // News
  NEWS_VIEW: "news.view",
  NEWS_CREATE: "news.create",
  NEWS_UPDATE: "news.update",
  NEWS_DELETE: "news.delete",
  NEWS_PUBLISH: "news.publish",

  // Competitions
  COMPETITIONS_VIEW: "competitions.view",
  COMPETITIONS_CREATE: "competitions.create",
  COMPETITIONS_UPDATE: "competitions.update",
  COMPETITIONS_DELETE: "competitions.delete",

  // Users
  USERS_VIEW: "users.view",
  USERS_CREATE: "users.create",
  USERS_UPDATE: "users.update",
  USERS_DELETE: "users.delete",

  // Settings
  SETTINGS_VIEW: "settings.view",
  SETTINGS_UPDATE: "settings.update",

  // Audit Logs
  AUDIT_LOGS_VIEW: "audit_logs.view",

  // Media
  MEDIA_VIEW: "media.view",
  MEDIA_UPLOAD: "media.upload",
  MEDIA_DELETE: "media.delete",

  // Venues
  VENUES_VIEW: "venues.view",
  VENUES_CREATE: "venues.create",
  VENUES_UPDATE: "venues.update",
  VENUES_DELETE: "venues.delete",
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/**
 * Role-to-permissions mapping. Defines which permissions each role has.
 */
export const ROLE_PERMISSIONS: Record<UserRole, PermissionKey[]> = {
  SUPER_ADMIN: Object.values(PERMISSIONS),

  ADMIN: [
    PERMISSIONS.PLAYERS_VIEW,
    PERMISSIONS.PLAYERS_CREATE,
    PERMISSIONS.PLAYERS_UPDATE,
    PERMISSIONS.PLAYERS_DELETE,
    PERMISSIONS.TEAMS_VIEW,
    PERMISSIONS.TEAMS_CREATE,
    PERMISSIONS.TEAMS_UPDATE,
    PERMISSIONS.TEAMS_DELETE,
    PERMISSIONS.MATCHES_VIEW,
    PERMISSIONS.MATCHES_CREATE,
    PERMISSIONS.MATCHES_UPDATE,
    PERMISSIONS.MATCHES_DELETE,
    PERMISSIONS.MATCHES_PUBLISH,
    PERMISSIONS.RESULTS_CREATE,
    PERMISSIONS.RESULTS_UPDATE,
    PERMISSIONS.RESULTS_DELETE,
    PERMISSIONS.EVENTS_VIEW,
    PERMISSIONS.EVENTS_CREATE,
    PERMISSIONS.EVENTS_UPDATE,
    PERMISSIONS.EVENTS_DELETE,
    PERMISSIONS.NEWS_VIEW,
    PERMISSIONS.NEWS_CREATE,
    PERMISSIONS.NEWS_UPDATE,
    PERMISSIONS.NEWS_DELETE,
    PERMISSIONS.NEWS_PUBLISH,
    PERMISSIONS.COMPETITIONS_VIEW,
    PERMISSIONS.COMPETITIONS_CREATE,
    PERMISSIONS.COMPETITIONS_UPDATE,
    PERMISSIONS.COMPETITIONS_DELETE,
    PERMISSIONS.MEDIA_VIEW,
    PERMISSIONS.MEDIA_UPLOAD,
    PERMISSIONS.MEDIA_DELETE,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.VENUES_VIEW,
    PERMISSIONS.VENUES_CREATE,
    PERMISSIONS.VENUES_UPDATE,
    PERMISSIONS.VENUES_DELETE,
  ],

  EDITOR: [
    PERMISSIONS.PLAYERS_VIEW,
    PERMISSIONS.TEAMS_VIEW,
    PERMISSIONS.MATCHES_VIEW,
    PERMISSIONS.EVENTS_VIEW,
    PERMISSIONS.EVENTS_CREATE,
    PERMISSIONS.EVENTS_UPDATE,
    PERMISSIONS.NEWS_VIEW,
    PERMISSIONS.NEWS_CREATE,
    PERMISSIONS.NEWS_UPDATE,
    PERMISSIONS.COMPETITIONS_VIEW,
    PERMISSIONS.MEDIA_VIEW,
    PERMISSIONS.MEDIA_UPLOAD,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.VENUES_VIEW,
    PERMISSIONS.VENUES_CREATE,
    PERMISSIONS.VENUES_UPDATE,
  ],

  VIEWER: [
    PERMISSIONS.PLAYERS_VIEW,
    PERMISSIONS.TEAMS_VIEW,
    PERMISSIONS.MATCHES_VIEW,
    PERMISSIONS.EVENTS_VIEW,
    PERMISSIONS.NEWS_VIEW,
    PERMISSIONS.COMPETITIONS_VIEW,
    PERMISSIONS.MEDIA_VIEW,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.VENUES_VIEW,
  ],
};

/**
 * Check if a given role has a specific permission.
 */
export function hasPermission(
  role: UserRole,
  permission: PermissionKey
): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Check if a role has any of the given permissions.
 */
export function hasAnyPermission(
  role: UserRole,
  permissions: PermissionKey[]
): boolean {
  return permissions.some((perm) => hasPermission(role, perm));
}

/**
 * Check if a role has all of the given permissions.
 */
export function hasAllPermissions(
  role: UserRole,
  permissions: PermissionKey[]
): boolean {
  return permissions.every((perm) => hasPermission(role, perm));
}

/**
 * Get all permissions for a role.
 */
export function getPermissionsForRole(role: UserRole): PermissionKey[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * All available permissions as a flat array for seed/configuration.
 */
export const ALL_PERMISSIONS = Object.entries(PERMISSIONS).map(
  ([, value]) => {
    const [module, action] = value.split(".");
    return {
      name: value,
      module,
      description: `${action.charAt(0).toUpperCase() + action.slice(1).replace("_", " ")} ${module}`,
    };
  }
);
