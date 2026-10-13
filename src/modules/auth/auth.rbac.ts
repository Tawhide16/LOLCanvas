export type Role = "CREATOR" | "CURATOR" | "ADMIN" | "SUPER_ADMIN";

export const ROLES: Record<Role, Role> = {
  CREATOR: "CREATOR",
  CURATOR: "CURATOR",
  ADMIN: "ADMIN",
  SUPER_ADMIN: "SUPER_ADMIN",
};

export type Permission =
  | "create:meme"
  | "edit:own_meme"
  | "delete:own_meme"
  | "approve:template"
  | "create:template"
  | "delete:any_meme"
  | "manage:users"
  | "manage:admins"
  | "manage:system";

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  CREATOR: ["create:meme", "edit:own_meme", "delete:own_meme"],
  CURATOR: [
    "create:meme",
    "edit:own_meme",
    "delete:own_meme",
    "approve:template",
    "create:template",
  ],
  ADMIN: [
    "create:meme",
    "edit:own_meme",
    "delete:own_meme",
    "approve:template",
    "create:template",
    "delete:any_meme",
    "manage:users",
  ],
  SUPER_ADMIN: [
    "create:meme",
    "edit:own_meme",
    "delete:own_meme",
    "approve:template",
    "create:template",
    "delete:any_meme",
    "manage:users",
    "manage:admins",
    "manage:system",
  ],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

export function isAtLeastRole(userRole: Role, requiredRole: Role): boolean {
  const roleWeights: Record<Role, number> = {
    CREATOR: 1,
    CURATOR: 2,
    ADMIN: 3,
    SUPER_ADMIN: 4,
  };
  return (roleWeights[userRole] || 0) >= (roleWeights[requiredRole] || 0);
}
