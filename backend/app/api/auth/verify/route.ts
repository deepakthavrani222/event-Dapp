import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth/jwt';
import { connectDB } from '@/lib/db/connection';
import { User } from '@/lib/db/models';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    await connectDB();

    // Verify user still exists and is active
    const user = await User.findOne({ 
      $or: [
        { _id: payload.userId },
        { walletAddress: payload.walletAddress }
      ]
    });

    if (!user) {
      console.error('User not found:', payload.userId);
      return NextResponse.json(
        { error: 'User not found', userId: payload.userId },
        { status: 401 }
      );
    }

    if (user.isActive === false) {
      return NextResponse.json(
        { error: 'User account is inactive' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      valid: true,
      user: {
        id: user._id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        walletAddress: user.walletAddress,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { error: 'Verification failed', details: error.message },
      { status: 500 }
    );
  }
}
