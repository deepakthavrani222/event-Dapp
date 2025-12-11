import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { Artist } from '@/lib/db/models/Artist';
import { User } from '@/lib/db/models/User';
import { verifyAuth } from '@/lib/auth/verify';

// POST - Approve or reject artist verification
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await User.findById(authResult.user.id);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { action, rejectionReason, royaltyPercentage, canCreateGoldenTickets } = body;

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Valid action (approve/reject) is required' 
      }, { status: 400 });
    }

    const artist = await Artist.findById(params.id);
    
    if (!artist) {
      return NextResponse.json({ 
        success: false, 
        error: 'Artist not found' 
      }, { status: 404 });
    }

    if (artist.verificationStatus !== 'pending') {
      return NextResponse.json({ 
        success: false, 
        error: 'Artist verification is not pending' 
      }, { status: 400 });
    }

    if (action === 'approve') {
      artist.verificationStatus = 'verified';
      artist.verifiedAt = new Date();
      artist.verifiedBy = authResult.user.id;
      artist.rejectionReason = undefined;
      
      // Set royalty percentage (default 15% if not specified)
      if (royaltyPercentage && royaltyPercentage >= 10 && royaltyPercentage <= 25) {
        artist.royaltyPercentage = royaltyPercentage;
      } else {
        artist.royaltyPercentage = 15;
      }
      
      // Enable golden tickets creation for verified artists
      artist.canCreateGoldenTickets = canCreateGoldenTickets !== undefined ? canCreateGoldenTickets : true;
      
    } else if (action === 'reject') {
      if (!rejectionReason) {
        return NextResponse.json({ 
          success: false, 
          error: 'Rejection reason is required' 
        }, { status: 400 });
      }
      
      artist.verificationStatus = 'rejected';
      artist.rejectionReason = rejectionReason;
      artist.verifiedAt = undefined;
      artist.verifiedBy = undefined;
      artist.canCreateGoldenTickets = false;
    }

    await artist.save();

    // Get artist user data for notification
    const artistUser = await User.findById(artist.userId).select('name email');

    return NextResponse.json({
      success: true,
      message: `Artist ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      artist: {
        id: artist._id,
        artistName: artist.artistName,
        verificationStatus: artist.verificationStatus,
        verifiedAt: artist.verifiedAt,
        rejectionReason: artist.rejectionReason,
        royaltyPercentage: artist.royaltyPercentage,
        canCreateGoldenTickets: artist.canCreateGoldenTickets
      },
      notification: {
        userId: artist.userId,
        userEmail: artistUser?.email,
        userName: artistUser?.name,
        action
      }
    });

  } catch (error) {
    console.error('Artist verification error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to process verification' 
    }, { status: 500 });
  }
}