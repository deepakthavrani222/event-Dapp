import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireRole, unauthorizedResponse, forbiddenResponse } from '@/lib/middleware/auth';
import { connectDB } from '@/lib/db/connection';
import { Withdrawal } from '@/lib/db/models';

/**
 * POST /api/organizer/withdraw
 * Request a withdrawal
 */
export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  
  if (!auth.authorized) {
    return unauthorizedResponse(auth.error);
  }

  const hasAccess = requireRole(auth.user!.role, ['ORGANIZER', 'ADMIN']);
  
  if (!hasAccess) {
    return forbiddenResponse('Organizer access required');
  }

  try {
    await connectDB();

    const body = await request.json();
    const { amount, method, destination } = body;

    // Validate
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid withdrawal amount' },
        { status: 400 }
      );
    }

    if (!method || !['CRYPTO', 'BANK', 'UPI'].includes(method)) {
      return NextResponse.json(
        { error: 'Invalid withdrawal method. Use CRYPTO, BANK, or UPI' },
        { status: 400 }
      );
    }

    if (!destination) {
      return NextResponse.json(
        { error: 'Destination address/account required' },
        { status: 400 }
      );
    }

    // Minimum withdrawal check
    if (amount < 50) {
      return NextResponse.json(
        { error: 'Minimum withdrawal amount is ₹50' },
        { status: 400 }
      );
    }

    // Create withdrawal request
    const withdrawal = await Withdrawal.create({
      userId: auth.user!.id,
      amount,
      method,
      destination,
      status: 'pending',
    });

    // In production, this would trigger actual payment processing
    // For demo, we'll simulate instant processing for crypto
    if (method === 'CRYPTO') {
      // Simulate blockchain transaction - mark as completed immediately for demo
      await Withdrawal.findByIdAndUpdate(withdrawal._id, {
        status: 'completed',
        transactionHash: `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`,
      });
    } else {
      // For bank/UPI, mark as processing
      await Withdrawal.findByIdAndUpdate(withdrawal._id, {
        status: 'processing',
      });
    }

    return NextResponse.json({
      success: true,
      withdrawal: {
        id: withdrawal._id,
        amount: withdrawal.amount,
        method: withdrawal.method,
        status: withdrawal.status,
        estimatedTime: method === 'CRYPTO' ? '< 5 minutes' : '1-3 business days',
        createdAt: withdrawal.createdAt,
      },
      message: method === 'CRYPTO' 
        ? 'Withdrawal initiated. Funds will arrive in your wallet within 5 minutes.'
        : 'Withdrawal request submitted. Processing time: 1-3 business days.',
    }, { status: 201 });

  } catch (error: any) {
    console.error('Withdrawal error:', error);
    return NextResponse.json(
      { error: 'Failed to process withdrawal', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/organizer/withdraw
 * Get withdrawal history
 */
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  
  if (!auth.authorized) {
    return unauthorizedResponse(auth.error);
  }

  const hasAccess = requireRole(auth.user!.role, ['ORGANIZER', 'ADMIN']);
  
  if (!hasAccess) {
    return forbiddenResponse('Organizer access required');
  }

  try {
    await connectDB();

    const withdrawals = await Withdrawal.find({ userId: auth.user!.id })
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({
      success: true,
      withdrawals: withdrawals.map(w => ({
        id: w._id,
        amount: w.amount,
        currency: w.currency,
        method: w.method,
        destination: w.destination,
        status: w.status,
        transactionHash: w.transactionHash,
        processedAt: w.processedAt,
        createdAt: w.createdAt,
      })),
    });

  } catch (error: any) {
    console.error('Fetch withdrawals error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch withdrawals', details: error.message },
      { status: 500 }
    );
  }
}
