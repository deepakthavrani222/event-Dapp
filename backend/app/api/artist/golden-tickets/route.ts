import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { GoldenTicketTemplate } from '@/lib/db/models/GoldenTicket';
import { Artist } from '@/lib/db/models/Artist';
import { verifyToken } from '@/lib/auth/jwt';

// GET - Get artist's golden ticket templates
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

    // Get artist profile
    const artist = await Artist.findOne({ userId: decoded.userId });
    if (!artist) {
      return NextResponse.json({ 
        success: false, 
        error: 'Artist profile not found' 
      }, { status: 404 });
    }

    // Check if artist can create golden tickets
    if (!artist.canCreateGoldenTickets || artist.verificationStatus !== 'verified') {
      return NextResponse.json({ 
        success: false, 
        error: 'Golden ticket creation not available' 
      }, { status: 403 });
    }

    // Get golden ticket templates
    const templates = await GoldenTicketTemplate.find({ 
      artistId: artist._id 
    }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      templates: templates.map(template => ({
        id: template._id,
        name: template.name,
        description: template.description,
        priceMultiplier: template.priceMultiplier,
        finalPrice: template.finalPrice,
        maxQuantity: template.maxQuantity,
        soldQuantity: template.soldQuantity,
        royaltyBonus: template.royaltyBonus,
        totalRoyaltyPercentage: template.totalRoyaltyPercentage,
        perks: template.perks,
        isLimited: template.isLimited,
        isSoulbound: template.isSoulbound,
        isActive: template.isActive,
        salesData: template.salesData,
        presaleSettings: template.presaleSettings,
        createdAt: template.createdAt
      }))
    });

  } catch (error) {
    console.error('Get golden tickets error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch golden tickets' 
    }, { status: 500 });
  }
}

// POST - Create new golden ticket template
export async function POST(request: NextRequest) {
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

    // Get artist profile
    const artist = await Artist.findOne({ userId: decoded.userId });
    if (!artist) {
      return NextResponse.json({ 
        success: false, 
        error: 'Artist profile not found' 
      }, { status: 404 });
    }

    // Check permissions
    if (!artist.canCreateGoldenTickets || artist.verificationStatus !== 'verified') {
      return NextResponse.json({ 
        success: false, 
        error: 'Golden ticket creation not available' 
      }, { status: 403 });
    }

    const {
      name,
      description,
      priceMultiplier,
      basePrice,
      maxQuantity,
      royaltyBonus,
      perks,
      isLimited,
      isSoulbound,
      backgroundColor,
      textColor,
      customMessage,
      presaleSettings
    } = await request.json();

    // Validate required fields
    if (!name || !description || !priceMultiplier || !basePrice || !maxQuantity) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Calculate final price and royalties
    const finalPrice = basePrice * priceMultiplier;
    const totalRoyaltyPercentage = artist.royaltyPercentage + (royaltyBonus || 0);

    // Create golden ticket template
    const template = await GoldenTicketTemplate.create({
      artistId: artist._id,
      name,
      description,
      priceMultiplier,
      basePrice,
      finalPrice,
      maxQuantity,
      royaltyBonus: royaltyBonus || 0,
      totalRoyaltyPercentage,
      perks: perks || [],
      isLimited: isLimited !== false,
      isSoulbound: isSoulbound || false,
      backgroundColor: backgroundColor || '#FFD700',
      textColor: textColor || '#000000',
      customMessage,
      presaleSettings: presaleSettings || { enabled: false },
      salesData: {
        totalRevenue: 0,
        artistRoyalties: 0,
        platformFees: 0
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Golden ticket template created successfully',
      template: {
        id: template._id,
        name: template.name,
        description: template.description,
        finalPrice: template.finalPrice,
        maxQuantity: template.maxQuantity,
        totalRoyaltyPercentage: template.totalRoyaltyPercentage,
        perks: template.perks,
        isLimited: template.isLimited,
        isSoulbound: template.isSoulbound,
        createdAt: template.createdAt
      }
    });

  } catch (error) {
    console.error('Create golden ticket error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create golden ticket template' 
    }, { status: 500 });
  }
}