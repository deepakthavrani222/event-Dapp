import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { Artist } from '@/lib/db/models/Artist';
import { verifyAuth } from '@/lib/auth/verify';

// POST - Submit verification documents
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { idProof, artistProof, additionalDocs } = body;

    // Validation
    if (!idProof || !artistProof) {
      return NextResponse.json({ 
        success: false, 
        error: 'ID proof and artist proof documents are required' 
      }, { status: 400 });
    }

    const artist = await Artist.findOne({ userId: authResult.user.id });
    
    if (!artist) {
      return NextResponse.json({ 
        success: false, 
        error: 'Artist profile not found. Please create your profile first.' 
      }, { status: 404 });
    }

    // Update verification documents
    artist.verificationDocuments = {
      idProof,
      artistProof,
      additionalDocs: additionalDocs || []
    };
    artist.verificationStatus = 'pending';
    artist.verificationSubmittedAt = new Date();
    artist.rejectionReason = undefined; // Clear any previous rejection reason

    await artist.save();

    return NextResponse.json({
      success: true,
      message: 'Verification documents submitted successfully. Review typically takes 24-48 hours.',
      verificationStatus: artist.verificationStatus
    });

  } catch (error) {
    console.error('Submit verification error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to submit verification documents' 
    }, { status: 500 });
  }
}

// GET - Get verification status
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const artist = await Artist.findOne({ userId: authResult.user.id });
    
    if (!artist) {
      return NextResponse.json({ 
        success: false, 
        error: 'Artist profile not found' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      verification: {
        status: artist.verificationStatus,
        submittedAt: artist.verificationSubmittedAt,
        verifiedAt: artist.verifiedAt,
        rejectionReason: artist.rejectionReason,
        documentsSubmitted: {
          idProof: !!artist.verificationDocuments?.idProof,
          artistProof: !!artist.verificationDocuments?.artistProof,
          additionalDocs: artist.verificationDocuments?.additionalDocs?.length || 0
        }
      }
    });

  } catch (error) {
    console.error('Get verification status error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch verification status' 
    }, { status: 500 });
  }
}