import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { AdminUser, logAuditEvent } from '@/lib/db/models/PlatformSettings';
import { User } from '@/lib/db/models/User';
import { verifyToken } from '@/lib/auth/jwt';

// GET - Get users (all platform users or admin users)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authentication required' 
      }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid token' 
      }, { status: 401 });
    }

    // Check if user is admin
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ 
        success: false, 
        error: 'Admin access required' 
      }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const isActive = searchParams.get('active');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type'); // 'admin' for admin users only

    // If type=admin, return admin users
    if (type === 'admin') {
      const query: any = {};
      if (role) {
        query.role = role;
      }
      if (isActive !== null) {
        query.isActive = isActive === 'true';
      }

      const adminUsers = await AdminUser.find(query)
        .populate('userId', 'name email walletAddress')
        .populate('addedBy', 'name email')
        .sort({ createdAt: -1 });

      return NextResponse.json({
        success: true,
        adminUsers: adminUsers.map(admin => ({
          id: admin._id,
          user: admin.userId,
          email: admin.email,
          walletAddress: admin.walletAddress,
          role: admin.role,
          permissions: admin.permissions,
          isActive: admin.isActive,
          addedBy: admin.addedBy,
          lastLoginAt: admin.lastLoginAt,
          loginCount: admin.loginCount,
          createdAt: admin.createdAt
        })),
        roles: ['super_admin', 'admin', 'moderator', 'support']
      });
    }

    // Return all platform users
    const query: any = {};
    if (role && role !== 'all') {
      query.role = role;
    }

    const users = await User.find(query)
      .select('name email role walletAddress isVerified createdAt')
      .sort({ createdAt: -1 })
      .limit(limit);

    return NextResponse.json({
      success: true,
      users: users.map(u => ({
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        walletAddress: u.walletAddress,
        isVerified: u.isVerified || false,
        createdAt: u.createdAt
      })),
      total: await User.countDocuments(query)
    });

  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch users' 
    }, { status: 500 });
  }
}

// POST - Add new admin user
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authentication required' 
      }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid token' 
      }, { status: 401 });
    }

    // Check if user is admin
    const currentUser = await User.findById(decoded.userId);
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ 
        success: false, 
        error: 'Admin access required' 
      }, { status: 403 });
    }

    const {
      email,
      walletAddress,
      role,
      permissions = []
    } = await request.json();

    // Validate required fields
    if (!email || !role) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email and role are required' 
      }, { status: 400 });
    }

    // Check if user exists
    let targetUser = await User.findOne({ 
      $or: [
        { email },
        ...(walletAddress ? [{ walletAddress }] : [])
      ]
    });

    if (!targetUser) {
      // Create new user if they don't exist
      targetUser = await User.create({
        email,
        name: email.split('@')[0], // Use email prefix as name
        walletAddress,
        role: 'ADMIN' // Set user role to ADMIN
      });
    } else {
      // Update existing user role to ADMIN
      targetUser.role = 'ADMIN';
      await targetUser.save();
    }

    // Check if admin user already exists
    const existingAdmin = await AdminUser.findOne({ userId: targetUser._id });
    if (existingAdmin) {
      return NextResponse.json({ 
        success: false, 
        error: 'User is already an admin' 
      }, { status: 400 });
    }

    // Create admin user
    const adminUser = await AdminUser.create({
      userId: targetUser._id,
      email: targetUser.email,
      walletAddress: targetUser.walletAddress,
      role,
      permissions,
      addedBy: currentUser._id
    });

    // Log audit event
    await logAuditEvent(
      'ADD_ADMIN',
      'admin',
      'AdminUser',
      currentUser._id.toString(),
      currentUser.email || '',
      currentUser.role,
      {
        after: { email, role, permissions },
        metadata: { targetUserId: targetUser._id }
      },
      adminUser._id.toString(),
      'high'
    );

    return NextResponse.json({
      success: true,
      message: 'Admin user added successfully',
      adminUser: {
        id: adminUser._id,
        email: adminUser.email,
        role: adminUser.role,
        permissions: adminUser.permissions
      }
    });

  } catch (error) {
    console.error('Add admin user error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to add admin user' 
    }, { status: 500 });
  }
}