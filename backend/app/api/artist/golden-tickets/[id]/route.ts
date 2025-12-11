import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { GoldenTicketTemplate } from '@/lib/db/models/GoldenTicket';
import { Artist } from '@/lib/db/models/Artist';
import { verifyToken } from '@/lib/auth/jwt';

// Type assertion helper
const asAny = (obj: any) => obj;

// GET - Get specific golden ticket template
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const { id } = params;
    
    // Get template (public endpoint for viewing)
    const template = asAny(await GoldenTicketTemplate.findById(id)
      .populate('artistId', 'artistName verificationStatus'));
    
    if (!template) {
      return NextResponse.json({ 
        success: false, 
        error: 'Golden ticket template not found' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      template: {
        id: template._id,
        name: template.name,
        description: template.description,
        priceMultiplier: template.priceMultiplier,
        finalPrice: template.finalPrice,
        maxQuantity: template.maxQuantity,
        soldQuantity: template.soldQuantity,
        availableQuantity: template.maxQuantity - template.soldQuantity,
        royaltyBonus: template.royaltyBonus,
        totalRoyaltyPercentage: template.totalRoyaltyPercentage,
        perks: template.perks,
        isLimited: template.isLimited,
        isSoulbound: template.isSoulbound,
        isActive: template.isActive,
        backgroundColor: template.backgroundColor,
        textColor: template.textColor,
        customMessage: template.customMessage,
        nftMetadata: template.nftMetadata,
        presaleSettings: template.presaleSettings,
        artist: template.artistId,
        createdAt: template.createdAt
      }
    });

  } catch (error) {
    console.error('Get golden ticket template error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch golden ticket template' 
    }, { status: 500 });
  }
}

// PUT - Update golden ticket template
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;
    
    // Get artist profile
    const artist = await Artist.findOne({ userId: decoded.userId });
    if (!artist) {
      return NextResponse.json({ 
        success: false, 
        error: 'Artist profile not found' 
      }, { status: 404 });
    }

    // Get template and verify ownership
    const template = await GoldenTicketTemplate.findById(id);
    if (!template) {
      return NextResponse.json({ 
        success: false, 
        error: 'Golden ticket template not found' 
      }, { status: 404 });
    }

    if (template.artistId.toString() !== artist._id.toString()) {
      return NextResponse.json({ 
        success: false, 
        error: 'Not authorized to update this template' 
      }, { status: 403 });
    }

    // Don't allow updates if tickets have been sold
    if (template.soldQuantity > 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Cannot update template with existing sales' 
      }, { status: 400 });
    }

    const updateData = await request.json();
    
    // Recalculate final price if base price or multiplier changed
    if (updateData.basePrice || updateData.priceMultiplier) {
      const basePrice = updateData.basePrice || template.basePrice;
      const priceMultiplier = updateData.priceMultiplier || template.priceMultiplier;
      updateData.finalPrice = basePrice * priceMultiplier;
    }

    // Recalculate total royalty percentage if bonus changed
    if (updateData.royaltyBonus !== undefined) {
      updateData.totalRoyaltyPercentage = artist.royaltyPercentage + updateData.royaltyBonus;
    }

    // Update template
    const updatedTemplate = await GoldenTicketTemplate.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Golden ticket template updated successfully',
      template: updatedTemplate
    });

  } catch (error) {
    console.error('Update golden ticket template error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update golden ticket template' 
    }, { status: 500 });
  }
}

// DELETE - Delete golden ticket template
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;
    
    // Get artist profile
    const artist = await Artist.findOne({ userId: decoded.userId });
    if (!artist) {
      return NextResponse.json({ 
        success: false, 
        error: 'Artist profile not found' 
      }, { status: 404 });
    }

    // Get template and verify ownership
    const template = await GoldenTicketTemplate.findById(id);
    if (!template) {
      return NextResponse.json({ 
        success: false, 
        error: 'Golden ticket template not found' 
      }, { status: 404 });
    }

    if (template.artistId.toString() !== artist._id.toString()) {
      return NextResponse.json({ 
        success: false, 
        error: 'Not authorized to delete this template' 
      }, { status: 403 });
    }

    // Don't allow deletion if tickets have been sold
    if (template.soldQuantity > 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Cannot delete template with existing sales' 
      }, { status: 400 });
    }

    // Delete template
    await GoldenTicketTemplate.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Golden ticket template deleted successfully'
    });

  } catch (error) {
    console.error('Delete golden ticket template error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete golden ticket template' 
    }, { status: 500 });
  }
}