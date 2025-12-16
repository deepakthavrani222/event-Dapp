import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { PlatformSettings } from '@/lib/db/models/PlatformSettings';

// GET - Get platform wallet address (public endpoint for smart contract)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get platform wallet setting
    const platformWalletSetting = await PlatformSettings.findOne({ key: 'platform_wallet' });
    const platformFeeSetting = await PlatformSettings.findOne({ key: 'platform_fee_percent' });

    // Return default if not set
    const platformWallet = platformWalletSetting?.value || process.env.NEXT_PUBLIC_PLATFORM_WALLET || null;
    const platformFeePercent = platformFeeSetting?.value || 5;

    if (!platformWallet) {
      return NextResponse.json({
        success: false,
        error: 'Platform wallet not configured'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      platformWallet,
      platformFeePercent,
      network: 'sepolia'
    });

  } catch (error) {
    console.error('Get platform wallet error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch platform wallet' 
    }, { status: 500 });
  }
}
