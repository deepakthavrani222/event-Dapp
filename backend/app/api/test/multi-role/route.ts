import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireRole, unauthorizedResponse, forbiddenResponse } from '@/lib/middleware/auth';

/**
 * Test endpoint - ORGANIZER, VENUE_OWNER, or ADMIN can access
 */
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  
  if (!auth.authorized) {
    return unauthorizedResponse(auth.error);
  }

  const hasAccess = requireRole(auth.user!.role, ['ORGANIZER', 'VENUE_OWNER', 'ADMIN']);
  
  if (!hasAccess) {
    return forbiddenResponse(`Access denied. Required roles: ORGANIZER, VENUE_OWNER, or ADMIN. Your role: ${auth.user!.role}`);
  }

  return NextResponse.json({
    message: 'Multi-role access granted',
    user: auth.user,
    allowedRoles: ['ORGANIZER', 'VENUE_OWNER', 'ADMIN'],
  });
}
