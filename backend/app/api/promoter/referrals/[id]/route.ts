import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireRole, unauthorizedResponse } from '@/lib/middleware/auth';
import { connectDB } from '@/lib/db/connection';
import { Referral } from '@/lib/db/models';

/**
 * PATCH /api/promoter/referrals/[id]
 * Toggle referral code active status
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const referral = await Referral.findById(params.id);

    if (!referral) {
      return NextResponse.json(
        { error: 'Referral not found' },
        { status: 404 }
      );
    }

    // Verify ownership (unless admin)
    if (auth.user!.role !== 'ADMIN' && referral.promoterId.toString() !== auth.user!.id) {
      return NextResponse.json(
        { error: 'Not authorized to modify this referral' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { isActive } = body;

    if (typeof isActive === 'boolean') {
      referral.isActive = isActive;
      await referral.save();
    }

    return NextResponse.json({
      success: true,
      referral: {
        id: referral._id,
        code: referral.code,
        isActive: referral.isActive,
      },
    });

  } catch (error: any) {
    console.error('Update referral error:', error);
    return NextResponse.json(
      { error: 'Failed to update referral', details: error.message },
      { status: 500 }
    );
  }
}
