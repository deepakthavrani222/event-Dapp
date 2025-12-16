import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { PlatformSettings, logAuditEvent } from '@/lib/db/models/PlatformSettings';
import { User } from '@/lib/db/models/User';
import { verifyToken } from '@/lib/auth/jwt';

// GET - Get platform wallet and key settings
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

    // Get platform wallet setting
    const platformWalletSetting = await PlatformSettings.findOne({ key: 'platform_wallet' });
    const platformFeeSetting = await PlatformSettings.findOne({ key: 'platform_fee_percent' });

    return NextResponse.json({
      success: true,
      platformWallet: platformWalletSetting?.value || null,
      platformFeePercent: platformFeeSetting?.value || 5,
      lastModifiedAt: platformWalletSetting?.lastModifiedAt || null
    });

  } catch (error) {
    console.error('Get platform settings error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch settings' 
    }, { status: 500 });
  }
}

// PUT - Update platform wallet
export async function PUT(request: NextRequest) {
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

    const { platformWallet, platformFeePercent } = await request.json();

    // Validate wallet address format
    if (platformWallet && !/^0x[a-fA-F0-9]{40}$/.test(platformWallet)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid wallet address format' 
      }, { status: 400 });
    }

    // Update platform wallet
    if (platformWallet) {
      const existingWallet = await PlatformSettings.findOne({ key: 'platform_wallet' });
      const oldValue = existingWallet?.value;

      await PlatformSettings.findOneAndUpdate(
        { key: 'platform_wallet' },
        {
          $set: {
            category: 'financial',
            key: 'platform_wallet',
            value: platformWallet,
            dataType: 'string',
            description: 'Platform wallet address for receiving fees',
            isPublic: false,
            lastModifiedBy: user._id,
            lastModifiedAt: new Date()
          },
          $inc: { version: 1 }
        },
        { upsert: true, new: true }
      );

      // Log audit event (non-blocking)
      try {
        await logAuditEvent(
          'UPDATE_PLATFORM_WALLET',
          'settings',
          'PlatformSettings',
          user._id.toString(),
          user.email || '',
          user.role,
          {
            before: { platformWallet: oldValue },
            after: { platformWallet },
            metadata: { action: 'wallet_update' }
          },
          'platform_wallet',
          'high'
        );
      } catch (auditError) {
        console.error('Audit log failed (non-critical):', auditError);
      }

      // Also update user's wallet address (only if not already used by another user)
      try {
        const existingUser = await User.findOne({ 
          walletAddress: platformWallet, 
          _id: { $ne: user._id } 
        });
        
        if (!existingUser) {
          await User.findByIdAndUpdate(user._id, {
            walletAddress: platformWallet
          });
        } else {
          console.log(`Wallet ${platformWallet} already used by user ${existingUser.email}, skipping user update`);
        }
      } catch (walletError) {
        console.error('Failed to update user wallet (non-critical):', walletError);
      }
    }

    // Update platform fee if provided
    if (platformFeePercent !== undefined) {
      const feePercent = Math.min(Math.max(0, platformFeePercent), 20); // 0-20%
      
      await PlatformSettings.findOneAndUpdate(
        { key: 'platform_fee_percent' },
        {
          $set: {
            category: 'financial',
            key: 'platform_fee_percent',
            value: feePercent,
            dataType: 'number',
            description: 'Platform fee percentage for ticket sales',
            isPublic: true,
            lastModifiedBy: user._id,
            lastModifiedAt: new Date()
          },
          $inc: { version: 1 }
        },
        { upsert: true, new: true }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Platform settings updated successfully',
      platformWallet,
      platformFeePercent
    });

  } catch (error: any) {
    console.error('Update platform settings error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to update settings' 
    }, { status: 500 });
  }
}
