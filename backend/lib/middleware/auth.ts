import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth/jwt';
import { connectDB } from '@/lib/db/connection';
import { User } from '@/lib/db/models';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email?: string;
    phone?: string;
    name: string;
    walletAddress: string;
    role: string;
  };
}

/**
 * Middleware to verify JWT token and attach user to request
 */
export async function requireAuth(request: NextRequest): Promise<{
  authorized: boolean;
  user?: any;
  error?: string;
}> {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return { authorized: false, error: 'No token provided' };
    }

    const payload = verifyToken(token);

    if (!payload) {
      return { authorized: false, error: 'Invalid or expired token' };
    }

    await connectDB();

    const user = await User.findOne({
      $or: [
        { _id: payload.userId },
        { walletAddress: payload.walletAddress }
      ]
    });

    if (!user) {
      return { authorized: false, error: 'User not found' };
    }

    if (user.isActive === false) {
      return { authorized: false, error: 'User account is inactive' };
    }

    return {
      authorized: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        phone: user.phone,
        name: user.name,
        walletAddress: user.walletAddress,
        role: user.role,
      },
    };
  } catch (error: any) {
    return { authorized: false, error: error.message };
  }
}

/**
 * Middleware to check if user has required role(s)
 */
export function requireRole(userRole: string, allowedRoles: string[]): boolean {
  // ADMIN has access to everything
  if (userRole === 'ADMIN') {
    return true;
  }

  return allowedRoles.includes(userRole);
}

/**
 * Helper to create unauthorized response
 */
export function unauthorizedResponse(message: string = 'Unauthorized') {
  return NextResponse.json(
    { error: message },
    { status: 401 }
  );
}

/**
 * Helper to create forbidden response
 */
export function forbiddenResponse(message: string = 'Forbidden: Insufficient permissions') {
  return NextResponse.json(
    { error: message, requiredRole: 'Check endpoint documentation' },
    { status: 403 }
  );
}
