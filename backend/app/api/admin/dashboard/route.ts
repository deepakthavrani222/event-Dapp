import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireRole, unauthorizedResponse, forbiddenResponse } from '@/lib/middleware/auth';
import { connectDB } from '@/lib/db/connection';
import { User, Event, Ticket, Transaction } from '@/lib/db/models';

/**
 * GET /api/admin/dashboard
 * Get platform metrics and statistics
 */
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  
  if (!auth.authorized) {
    return unauthorizedResponse(auth.error);
  }

  const hasAccess = requireRole(auth.user!.role, ['ADMIN']);
  
  if (!hasAccess) {
    return forbiddenResponse('Admin access required');
  }

  try {
    await connectDB();

    // Get counts
    const totalUsers = await User.countDocuments();
    const totalEvents = await Event.countDocuments();
    const totalTickets = await Ticket.countDocuments();
    const pendingEvents = await Event.countDocuments({ status: 'DRAFT' });

    // Get revenue
    const transactions = await Transaction.find({ status: 'COMPLETED' });
    const totalRevenue = transactions.reduce((sum, t) => sum + t.totalAmount, 0);
    const platformRevenue = transactions.reduce((sum, t) => sum + (t.platformFee || 0), 0);

    // Get user breakdown by role
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Get recent activity
    const recentEvents = await Event.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title status createdAt organizerId');

    const recentTransactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('totalAmount currency status createdAt buyerId');

    return NextResponse.json({
      success: true,
      metrics: {
        totalUsers,
        totalEvents,
        totalTickets,
        pendingEvents,
        totalRevenue,
        platformRevenue,
      },
      usersByRole: usersByRole.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {} as Record<string, number>),
      recentEvents,
      recentTransactions,
    });

  } catch (error: any) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data', details: error.message },
      { status: 500 }
    );
  }
}
