import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireRole, unauthorizedResponse, forbiddenResponse } from '@/lib/middleware/auth';

/**
 * Test endpoint - Only ADMIN role can access
 */
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  
  if (!auth.authorized) {
    return unauthorizedResponse(auth.error);
  }

  const hasAccess = requireRole(auth.user!.role, ['ADMIN']);
  
  if (!hasAccess) {
    return forbiddenResponse(`Admin access required. Your role: ${auth.user!.role}`);
  }

  return NextResponse.json({
    message: 'Admin access granted',
    user: auth.user,
    adminFeatures: ['manage-users', 'approve-events', 'handle-refunds'],
  });
}
