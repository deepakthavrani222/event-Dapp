import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { User } from '@/lib/db/models';
import { generateToken } from '@/lib/auth/jwt';
import { generateSmartWallet } from '@/lib/auth/wallet';
import { getRoleForEmail } from '@/config/role-emails';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { email, phone, name, loginMethod } = body;

    // Validate input
    if (!email && !phone) {
      return NextResponse.json(
        { error: 'Email or phone is required' },
        { status: 400 }
      );
    }

    const identifier = email || phone;

    // Check if user exists
    let user = await User.findOne({
      $or: [
        { email: identifier },
        { phone: identifier }
      ]
    });

    // Create new user if doesn't exist
    if (!user) {
      // Generate smart wallet for new user
      const wallet = generateSmartWallet(identifier);

      // Determine role based on email address
      const role = email ? getRoleForEmail(email) : 'BUYER';

      user = await User.create({
        email: email || undefined,
        phone: phone || undefined,
        name: name || 'Guest User',
        walletAddress: wallet.address,
        role: role,
        isActive: true,
        createdAt: new Date(),
      });
    }

    // Generate JWT token
    const token = generateToken({
      userId: user._id.toString(),
      walletAddress: user.walletAddress,
      role: user.role,
      email: user.email,
    });

    return NextResponse.json({
      success: true,
      token,
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
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed', details: error.message },
      { status: 500 }
    );
  }
}
