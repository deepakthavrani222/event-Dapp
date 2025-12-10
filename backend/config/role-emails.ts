/**
 * Role-based Email Configuration
 * 
 * This file defines specific email addresses that automatically assign roles
 * when users log in to the platform.
 */

export const ROLE_EMAILS = {
  // Admin users - Full platform access
  ADMIN: [
    'admin@ticketchain.com',
    'admin@tikr.web3',
    'superadmin@ticketchain.com',
    'root@ticketchain.com'
  ],

  // Event organizers - Can create and manage events
  ORGANIZER: [
    'organizer@ticketchain.com',
    'event@ticketchain.com',
    'events@tikr.web3',
    'organizer@tikr.web3'
  ],

  // Promoters - Can promote events and earn commissions
  PROMOTER: [
    'promoter@ticketchain.com',
    'marketing@ticketchain.com',
    'promo@tikr.web3',
    'promoter@tikr.web3'
  ],

  // Inspectors - Can verify tickets and events
  INSPECTOR: [
    'inspector@ticketchain.com',
    'verify@ticketchain.com',
    'inspector@tikr.web3',
    'audit@tikr.web3'
  ],

  // Venue owners - Can manage venues
  VENUE_OWNER: [
    'venue@ticketchain.com',
    'venues@tikr.web3',
    'owner@ticketchain.com'
  ],

  // Artists - Can perform at events
  ARTIST: [
    'artist@ticketchain.com',
    'performer@tikr.web3',
    'artist@tikr.web3'
  ],

  // Resellers - Can resell tickets on marketplace
  RESELLER: [
    'reseller@ticketchain.com',
    'resale@tikr.web3',
    'marketplace@tikr.web3'
  ]
} as const;

/**
 * Get role for a given email address
 */
export function getRoleForEmail(email: string): string {
  const emailLower = email.toLowerCase();
  
  // Check exact email matches first
  for (const [role, emails] of Object.entries(ROLE_EMAILS)) {
    if (emails.includes(emailLower)) {
      return role;
    }
  }
  
  // Fallback: Check for keywords in email
  if (emailLower.includes('admin')) return 'ADMIN';
  if (emailLower.includes('organizer') || emailLower.includes('event')) return 'ORGANIZER';
  if (emailLower.includes('promoter') || emailLower.includes('promo')) return 'PROMOTER';
  if (emailLower.includes('inspector') || emailLower.includes('verify')) return 'INSPECTOR';
  if (emailLower.includes('venue') || emailLower.includes('owner')) return 'VENUE_OWNER';
  if (emailLower.includes('artist') || emailLower.includes('performer')) return 'ARTIST';
  if (emailLower.includes('reseller') || emailLower.includes('resale')) return 'RESELLER';
  
  // Default role
  return 'BUYER';
}

/**
 * Dashboard routes for each role
 */
export const ROLE_ROUTES = {
  ADMIN: '/admin',
  ORGANIZER: '/organizer',
  PROMOTER: '/promoter',
  INSPECTOR: '/inspector',
  VENUE_OWNER: '/venue-owner',
  ARTIST: '/artist',
  RESELLER: '/reseller',
  BUYER: '/buyer'
} as const;