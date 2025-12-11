import { NextRequest } from 'next/server';
import { verifyToken } from './jwt';
import { User } from '@/lib/db/models/User';

export interface AuthResult {
  success: boolean;
  user?: any;
  error?: string;
}

export async function verifyAuth(request: NextRequest): Promise<AuthResult> {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return { success: false, error: 'No token provided' };
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return { success: false, error: 'Invalid token' };
    }

    // Get user from database
    const user = await User.findById(decoded.userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    return { success: true, user };
  } catch (error) {
    console.error('Auth verification error:', error);
    return { success: false, error: 'Authentication failed' };
  }
}