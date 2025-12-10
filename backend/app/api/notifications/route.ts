import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, unauthorizedResponse } from '@/lib/middleware/auth';
import { connectDB } from '@/lib/db/connection';
import { getUserNotifications, markAllAsRead, getUnreadCount } from '@/lib/services/notification';

/**
 * GET /api/notifications
 * Get notifications for the current user
 */
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  
  if (!auth.authorized) {
    return unauthorizedResponse(auth.error);
  }

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const notifications = await getUserNotifications(auth.user!.id, limit);
    const unreadCount = await getUnreadCount(auth.user!.id);

    return NextResponse.json({
      success: true,
      notifications: notifications.map(n => ({
        id: n._id,
        type: n.type,
        title: n.title,
        message: n.message,
        data: n.data,
        read: n.read,
        createdAt: n.createdAt,
      })),
      unreadCount,
    });

  } catch (error: any) {
    console.error('Fetch notifications error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notifications
 * Mark all notifications as read
 */
export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  
  if (!auth.authorized) {
    return unauthorizedResponse(auth.error);
  }

  try {
    await connectDB();

    const body = await request.json();
    const { action } = body;

    if (action === 'mark_all_read') {
      await markAllAsRead(auth.user!.id);
      return NextResponse.json({ success: true, message: 'All notifications marked as read' });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('Notification action error:', error);
    return NextResponse.json(
      { error: 'Failed to process notification action', details: error.message },
      { status: 500 }
    );
  }
}
