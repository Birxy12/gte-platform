import { ROLES } from "./roles";

export const PERMISSIONS = {
  // Course Management
  COURSE_CREATE: "course:create",
  COURSE_EDIT: "course:edit",
  COURSE_DELETE: "course:delete",
  COURSE_ENROLL: "course:enroll",
  
  // User Management
  USER_VIEW_ALL: "user:view_all",
  USER_EDIT_ROLE: "user:edit_role",
  USER_SUSPEND: "user:suspend",
  
  // Social & Posts
  POST_CREATE: "post:create",
  POST_APPROVE: "post:approve",
  POST_DELETE: "post:delete",
  REEL_UPLOAD: "reel:upload",
  
  // Financial & Economy
  ECONOMY_MANAGE: "economy:manage",
  VAULT_AWARD: "vault:award",
  
  // Administrative
  SETTINGS_EDIT: "settings:edit",
  REPORTS_VIEW: "reports:view",
  CERTIFICATE_ISSUE: "certificate:issue"
};

export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [ROLES.ADMIN]: Object.values(PERMISSIONS),
  [ROLES.INSTRUCTOR]: [
    PERMISSIONS.COURSE_CREATE,
    PERMISSIONS.COURSE_EDIT,
    PERMISSIONS.COURSE_ENROLL,
    PERMISSIONS.POST_CREATE,
    PERMISSIONS.REEL_UPLOAD
  ],
  [ROLES.STUDENT]: [
    PERMISSIONS.COURSE_ENROLL,
    PERMISSIONS.POST_CREATE,
    PERMISSIONS.REEL_UPLOAD
  ],
  [ROLES.TACTICAL_OPERATIVE]: [
    PERMISSIONS.COURSE_ENROLL,
    PERMISSIONS.POST_CREATE,
    PERMISSIONS.REEL_UPLOAD
  ],
  [ROLES.GUEST]: []
};

export const hasPermission = (userRole, permission) => {
  if (!userRole) return false;
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes(permission);
};
