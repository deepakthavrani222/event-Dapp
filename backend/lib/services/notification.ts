import mongoose from 'mongoose';

// Notification Schema
const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['TICKET_SOLD', 'ROYALTY_EARNED', 'WITHDRAWAL_COMPLETE', 'EVENT_APPROVED', 'EVENT_REJECTED', 'MILESTONE', 'SYSTEM'],
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed }, // Additional data like eventId, amount, etc.
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);

export interface NotificationData {
  userId: string;
  type: 'TICKET_SOLD' | 'ROYALTY_EARNED' | 'WITHDRAWAL_COMPLETE' | 'EVENT_APPROVED' | 'EVENT_REJECTED' | 'MILESTONE' | 'SYSTEM';
  title: string;
  message: string;
  data?: Record<string, any>;
}

/**
 * Create a notification for a user
 */
export async function createNotification(data: NotificationData) {
  try {
    const notification = await Notification.create({
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      data: data.data,
    });
    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
    throw error;
  }
}

/**
 * Get notifications for a user
 */
export async function getUserNotifications(userId: string, limit = 50) {
  try {
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit);
    return notifications;
  } catch (error) {
    console.error('Failed to get notifications:', error);
    throw error;
  }
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId: string) {
  try {
    await Notification.findByIdAndUpdate(notificationId, { read: true });
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    throw error;
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllAsRead(userId: string) {
  try {
    await Notification.updateMany({ userId, read: false }, { read: true });
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error);
    throw error;
  }
}

/**
 * Get unread count for a user
 */
export async function getUnreadCount(userId: string) {
  try {
    const count = await Notification.countDocuments({ userId, read: false });
    return count;
  } catch (error) {
    console.error('Failed to get unread count:', error);
    return 0;
  }
}

// Helper functions for common notifications

export async function notifyTicketSold(organizerId: string, eventTitle: string, ticketType: string, amount: number) {
  return createNotification({
    userId: organizerId,
    type: 'TICKET_SOLD',
    title: '🎫 Ticket Sold!',
    message: `${ticketType} ticket sold for ${eventTitle}`,
    data: { eventTitle, ticketType, amount },
  });
}

export async function notifyRoyaltyEarned(organizerId: string, eventTitle: string, amount: number) {
  return createNotification({
    userId: organizerId,
    type: 'ROYALTY_EARNED',
    title: '💰 Royalty Earned!',
    message: `You earned ₹${amount} from a ticket resale for ${eventTitle}`,
    data: { eventTitle, amount },
  });
}

export async function notifyMilestone(organizerId: string, eventTitle: string, milestone: string) {
  return createNotification({
    userId: organizerId,
    type: 'MILESTONE',
    title: '🎉 Milestone Reached!',
    message: `${eventTitle} is ${milestone} sold!`,
    data: { eventTitle, milestone },
  });
}

export async function notifyEventApproved(organizerId: string, eventTitle: string) {
  return createNotification({
    userId: organizerId,
    type: 'EVENT_APPROVED',
    title: '✅ Event Approved!',
    message: `Your event "${eventTitle}" has been approved and is now live!`,
    data: { eventTitle },
  });
}

export async function notifyEventRejected(organizerId: string, eventTitle: string, reason: string) {
  return createNotification({
    userId: organizerId,
    type: 'EVENT_REJECTED',
    title: '❌ Event Rejected',
    message: `Your event "${eventTitle}" was not approved. Reason: ${reason}`,
    data: { eventTitle, reason },
  });
}

export async function notifyWithdrawalComplete(organizerId: string, amount: number, method: string) {
  return createNotification({
    userId: organizerId,
    type: 'WITHDRAWAL_COMPLETE',
    title: '💸 Withdrawal Complete!',
    message: `₹${amount} has been sent to your ${method} account`,
    data: { amount, method },
  });
}
