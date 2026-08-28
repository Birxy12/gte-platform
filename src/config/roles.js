export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  INSTRUCTOR: "instructor",
  STUDENT: "student",
  TACTICAL_OPERATIVE: "tactical_operative",
  GUEST: "guest"
};

export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: "Super Admin",
  [ROLES.ADMIN]: "Command Administrator",
  [ROLES.INSTRUCTOR]: "Mission Instructor",
  [ROLES.STUDENT]: "Tactical Cadet",
  [ROLES.TACTICAL_OPERATIVE]: "Tactical Operative",
  [ROLES.GUEST]: "Guest"
};

export const isAuthorized = (userRole, requiredRole) => {
  const roleHierarchy = [ROLES.GUEST, ROLES.STUDENT, ROLES.TACTICAL_OPERATIVE, ROLES.INSTRUCTOR, ROLES.ADMIN, ROLES.SUPER_ADMIN];
  const userRank = roleHierarchy.indexOf(userRole);
  const reqRank = roleHierarchy.indexOf(requiredRole);
  return userRank >= reqRank;
};
