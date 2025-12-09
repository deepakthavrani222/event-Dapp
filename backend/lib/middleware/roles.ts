/**
 * Role definitions and utilities
 */

export enum UserRole {
  BUYER = 'BUYER',
  ORGANIZER = 'ORGANIZER',
  PROMOTER = 'PROMOTER',
  VENUE_OWNER = 'VENUE_OWNER',
  ARTIST = 'ARTIST',
  RESELLER = 'RESELLER',
  INSPECTOR = 'INSPECTOR',
  ADMIN = 'ADMIN',
  GUEST = 'GUEST',
}

/**
 * Role hierarchy - higher roles include permissions of lower roles
 */
export const ROLE_HIERARCHY: Record<string, number> = {
  GUEST: 0,
  BUYER: 1,
  RESELLER: 2,
  PROMOTER: 3,
  INSPECTOR: 4,
  ARTIST: 5,
  VENUE_OWNER: 6,
  ORGANIZER: 7,
  ADMIN: 10,
};

/**
 * Check if user role meets minimum required role
 */
export function hasMinimumRole(userRole: string, requiredRole: string): boolean {
  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;
  return userLevel >= requiredLevel;
}

/**
 * Check if user has any of the allowed roles
 */
export function hasAnyRole(userRole: string, allowedRoles: string[]): boolean {
  // ADMIN always has access
  if (userRole === UserRole.ADMIN) {
    return true;
  }
  return allowedRoles.includes(userRole);
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: string): string {
  const displayNames: Record<string, string> = {
    BUYER: 'Buyer',
    ORGANIZER: 'Event Organizer',
    PROMOTER: 'Promoter',
    VENUE_OWNER: 'Venue Owner',
    ARTIST: 'Artist',
    RESELLER: 'Reseller',
    INSPECTOR: 'Ticket Inspector',
    ADMIN: 'Administrator',
    GUEST: 'Guest',
  };
  return displayNames[role] || role;
}

/**
 * Validate if role is valid
 */
export function isValidRole(role: string): boolean {
  return Object.values(UserRole).includes(role as UserRole);
}
