import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireRole, unauthorizedResponse } from '@/lib/middleware/auth';
import { connectDB } from '@/lib/db/connection';
import { Referral, Transaction } from '@/lib/db/models';

/**
 * GET /api/promoter/earnings
 * Get promoter earnings summary
 */
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  
  if (!auth.authorized) {
    return unauthorizedResponse(auth.error);
  }

  const roleCheck = requireRole(auth.user!, ['PROMOTER', 'ADMIN']);
  if (!roleCheck.authorized) {
    return unauthorizedResponse(roleCheck.error);
  }

  try {
    await connectDB();

    // Get all referrals for this promoter
    const referrals = await Referral.find({ 
      promoterId: auth.user!.id 
    });

    const referralIds = referrals.map(r => r._id);

    // Get all transactions using these referrals
    const transactions = await Transaction.find({
      referralId: { $in: referralIds },
      status: 'COMPLETED',
    }).populate('eventId');

    // Calculate earnings
    let totalEarnings = 0;
    let totalReferrals = 0;
    const earningsByEvent: any = {};

    transactions.forEach(tx => {
      const commission = tx.referralCommission || 0;
      totalEarnings += commission;
      totalReferrals++;

      const eventId = tx.eventId?.toString();
      if (eventId) {
        if (!earningsByEvent[eventId]) {
          earningsByEvent[eventId] = {
            eventId,
            eventTitle: (tx.eventId as any)?.title || 'Unknown Event',
            earnings: 0,
            referrals: 0,
          };
        }
        earningsByEvent[eventId].earnings += commission;
        earningsByEvent[eventId].referrals++;
      }
    });

    // Get referral code stats
    const referralStats = referrals.map(ref => ({
      code: ref.code,
      usageCount: ref.usageCount,
      totalEarnings: ref.totalEarnings,
      isActive: ref.isActive,
    }));

    return NextResponse.json({
      success: true,
      summary: {
        totalEarnings,
        totalReferrals,
        activeReferralCodes: referrals.filter(r => r.isActive).length,
        averageCommission: totalReferrals > 0 ? totalEarnings / totalReferrals : 0,
      },
      earningsByEvent: Object.values(earningsByEvent),
      referralCodes: referralStats,
    });

  } catch (error: any) {
    console.error('Fetch earnings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch earnings', details: error.message },
      { status: 500 }
    );
  }
}
