import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { User } from '@/lib/db/models/User';
import { verifyToken } from '@/lib/auth/jwt';

// GET - Get organizer wallet
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      walletAddress: user.walletAddress || null,
      hasWallet: !!user.walletAddress
    });

  } catch (error: any) {
    console.error('Get organizer wallet error:', error);
    return NextResponse.json({ error: 'Failed to fetch wallet' }, { status: 500 });
  }
}

// PUT - Update organizer wallet
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { walletAddress } = await request.json();

    // Validate wallet address format
    if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return NextResponse.json({ error: 'Invalid wallet address format' }, { status: 400 });
    }

    // Update user's wallet address
    const user = await User.findByIdAndUpdate(
      decoded.userId,
      { walletAddress },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log(`[WALLET] Organizer ${user.email} updated wallet to ${walletAddress}`);

    return NextResponse.json({
      success: true,
      message: 'Wallet updated successfully',
      walletAddress
    });

  } catch (error: any) {
    console.error('Update organizer wallet error:', error);
    return NextResponse.json({ error: 'Failed to update wallet' }, { status: 500 });
  }
}
