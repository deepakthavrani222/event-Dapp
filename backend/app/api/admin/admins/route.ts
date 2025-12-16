import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { User } from '@/lib/db/models/User';
import { verifyToken } from '@/lib/auth/jwt';
import { logAuditEvent } from '@/lib/db/models/PlatformSettings';

// GET - Get all admin users
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

    const currentUser = await User.findById(decoded.userId);
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get all admin users
    const admins = await User.find({ role: 'ADMIN' })
      .select('name email walletAddress role createdAt lastLogin loginCount')
      .sort({ createdAt: 1 })
      .lean();

    const formattedAdmins = admins.map((admin: any, index: number) => ({
      id: admin._id.toString(),
      name: admin.name || 'Admin User',
      email: admin.email,
      wallet: admin.walletAddress 
        ? `${admin.walletAddress.slice(0, 6)}...${admin.walletAddress.slice(-4)}`
        : 'Not connected',
      walletAddress: admin.walletAddress,
      role: index === 0 ? 'Super Admin' : 'Admin',
      addedAt: new Date(admin.createdAt).toLocaleDateString('en-IN'),
      lastActive: admin.lastLogin 
        ? getRelativeTime(new Date(admin.lastLogin))
        : 'Never',
      loginCount: admin.loginCount || 0,
      isCurrentUser: admin._id.toString() === decoded.userId,
    }));

    return NextResponse.json({
      success: true,
      admins: formattedAdmins,
    });

  } catch (error: any) {
    console.error('Get admins error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch admins' }, { status: 500 });
  }
}

// POST - Add new admin
export async function POST(request: NextRequest) {
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

    const currentUser = await User.findById(decoded.userId);
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { email, name, walletAddress } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    
    if (user) {
      // Update existing user to admin
      user.role = 'ADMIN';
      if (name) user.name = name;
      if (walletAddress) user.walletAddress = walletAddress;
      await user.save();
    } else {
      // Create new admin user
      user = await User.create({
        email,
        name: name || 'Admin User',
        role: 'ADMIN',
        walletAddress: walletAddress || undefined,
      });
    }

    // Log audit event
    await logAuditEvent(
      'Admin Added',
      'admin',
      'User',
      currentUser._id.toString(),
      currentUser.email || '',
      currentUser.role,
      { newAdminEmail: email },
      user._id.toString(),
      'high'
    );

    return NextResponse.json({
      success: true,
      message: 'Admin added successfully',
      admin: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: 'Admin',
      },
    });

  } catch (error: any) {
    console.error('Add admin error:', error);
    return NextResponse.json({ error: error.message || 'Failed to add admin' }, { status: 500 });
  }
}

// DELETE - Remove admin
export async function DELETE(request: NextRequest) {
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

    const currentUser = await User.findById(decoded.userId);
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get('id');

    if (!adminId) {
      return NextResponse.json({ error: 'Admin ID required' }, { status: 400 });
    }

    // Can't remove yourself
    if (adminId === decoded.userId) {
      return NextResponse.json({ error: 'Cannot remove yourself' }, { status: 400 });
    }

    const adminToRemove = await User.findById(adminId);
    if (!adminToRemove) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    // Demote to BUYER instead of deleting
    adminToRemove.role = 'BUYER';
    await adminToRemove.save();

    // Log audit event
    await logAuditEvent(
      'Admin Removed',
      'admin',
      'User',
      currentUser._id.toString(),
      currentUser.email || '',
      currentUser.role,
      { removedAdminEmail: adminToRemove.email },
      adminId,
      'high'
    );

    return NextResponse.json({
      success: true,
      message: 'Admin removed successfully',
    });

  } catch (error: any) {
    console.error('Remove admin error:', error);
    return NextResponse.json({ error: error.message || 'Failed to remove admin' }, { status: 500 });
  }
}

// Helper function for relative time
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString('en-IN');
}
