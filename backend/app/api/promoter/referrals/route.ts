import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireRole, unauthorizedResponse } from '@/lib/middleware/auth';
import { connectDB } from '@/lib/db/connection';
import { Referral, User } from '@/lib/db/models';
import crypto from 'crypto';

/**
 * POST /api/promoter/referrals
 * Generate a new referral code
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { eventId, commissionRate } = body;

    // Generate unique referral code
    const code = `${auth.user!.name.substring(0, 3).toUpperCase()}${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    // Check if code already exists (very unlikely)
    const existing = await Referral.findOne({ code });
    if (existing) {
      return NextResponse.json(
        { error: 'Code collision, please try again' },
        { status: 409 }
      );
    }

    // Create referral
    const referral = await Referral.create({
      code,
      promoterId: auth.user!.id,
      eventId: eventId || null,
      commissionRate: commissionRate || 5, // Default 5%
      isActive: true,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      referral: {
        id: referral._id,
        code: referral.code,
        commissionRate: referral.commissionRate,
        eventId: referral.eventId,
        isActive: referral.isActive,
      },
    }, { status: 201 });

  } catch (error: any) {
    console.error('Create referral error:', error);
    return NextResponse.json(
      { error: 'Failed to create referral code', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/promoter/referrals
 * Get all referral codes for the promoter
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

    const referrals = await Referral.find({ 
      promoterId: auth.user!.id 
    }).sort({ createdAt: -1 });

    const referralsWithStats = referrals.map(ref => ({
      id: ref._id,
      code: ref.code,
      eventId: ref.eventId,
      commissionRate: ref.commissionRate,
      isActive: ref.isActive,
      usageCount: ref.usageCount,
      totalEarnings: ref.totalEarnings,
      createdAt: ref.createdAt,
    }));

    return NextResponse.json({
      success: true,
      referrals: referralsWithStats,
      count: referralsWithStats.length,
    });

  } catch (error: any) {
    console.error('Fetch referrals error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch referrals', details: error.message },
      { status: 500 }
    );
  }
}
