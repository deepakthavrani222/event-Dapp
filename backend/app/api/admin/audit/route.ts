import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { AuditLog } from '@/lib/db/models/PlatformSettings';
import { User } from '@/lib/db/models/User';
import { verifyToken } from '@/lib/auth/jwt';

// GET - Get audit logs with search and filtering
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const category = searchParams.get('category');
    const action = searchParams.get('action');
    const userId = searchParams.get('userId');
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');
    const severity = searchParams.get('severity');
    const search = searchParams.get('search');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build query
    const query: any = {};
    
    if (category) query.category = category;
    if (action) query.action = { $regex: action, $options: 'i' };
    if (userId) query.userId = userId;
    if (entityType) query.entityType = entityType;
    if (entityId) query.entityId = entityId;
    if (severity) query.severity = severity;
    
    // Date range filter
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }
    
    // Text search across multiple fields
    if (search) {
      query.$or = [
        { action: { $regex: search, $options: 'i' } },
        { entityType: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } },
        { 'details.metadata': { $regex: search, $options: 'i' } }
      ];
    }

    // Get audit logs with pagination
    const auditLogs = await AuditLog.find(query)
      .populate('userId', 'name email')
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalCount = await AuditLog.countDocuments(query);

    // Get summary statistics
    const stats = await AuditLog.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalLogs: { $sum: 1 },
          categories: { $addToSet: '$category' },
          severities: { $addToSet: '$severity' },
          actions: { $addToSet: '$action' },
          uniqueUsers: { $addToSet: '$userId' }
        }
      }
    ]);

    // Get recent activity summary
    const recentActivity = await AuditLog.aggregate([
      {
        $match: {
          timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          latestAction: { $max: '$timestamp' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    return NextResponse.json({
      success: true,
      auditLogs: auditLogs.map(log => ({
        id: log._id,
        action: log.action,
        category: log.category,
        entityType: log.entityType,
        entityId: log.entityId,
        user: log.userId,
        userEmail: log.userEmail,
        userRole: log.userRole,
        details: log.details,
        severity: log.severity,
        timestamp: log.timestamp,
        createdAt: log.createdAt
      })),
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      },
      stats: stats[0] || {
        totalLogs: 0,
        categories: [],
        severities: [],
        actions: [],
        uniqueUsers: []
      },
      recentActivity,
      filters: {
        categories: ['user', 'event', 'transaction', 'artist', 'admin', 'system', 'settings'],
        severities: ['low', 'medium', 'high', 'critical'],
        commonActions: [
          'LOGIN', 'LOGOUT', 'CREATE_EVENT', 'APPROVE_EVENT', 'REJECT_EVENT',
          'PURCHASE_TICKET', 'REFUND_TICKET', 'UPDATE_SETTING', 'ADD_ADMIN',
          'VERIFY_ARTIST', 'CREATE_GOLDEN_TICKET', 'SEND_MESSAGE'
        ]
      }
    });

  } catch (error) {
    console.error('Get audit logs error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch audit logs' 
    }, { status: 500 });
  }
}