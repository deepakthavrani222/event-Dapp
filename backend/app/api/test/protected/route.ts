import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireRole, unauthorizedResponse, forbiddenResponse } from '@/lib/middleware/auth';

/**
 * Test endpoint - Only BUYER role can access
 */
export async function GET(request: NextRequest) {
  // Check authentication
  const auth = await requireAuth(request);
  
  if (!auth.authorized) {
    return unauthorizedResponse(auth.error);
  }

  // Check role authorization
  const hasAccess = requireRole(auth.user!.role, ['BUYER']);
  
  if (!hasAccess) {
    return forbiddenResponse(`Access denied. Required role: BUYER. Your role: ${auth.user!.role}`);
  }

  return NextResponse.json({
    message: 'Access granted to protected resource',
    user: auth.user,
  });
}
