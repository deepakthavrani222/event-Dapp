import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { GoldenTicketTemplate, GoldenTicketPurchase } from '@/lib/db/models/GoldenTicket';
import { Artist } from '@/lib/db/models/Artist';
import { User } from '@/lib/db/models/User';
import { verifyToken } from '@/lib/auth/jwt';

// POST - Purchase golden ticket
export async function POST(
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

    const { id: templateId } = params;
    const body = await request.json();
    const { paymentMethod, walletAddress } = body;

    // Get template
    const template = await GoldenTicketTemplate.findById(templateId)
      .populate('artistId') as any;
    
    if (!template) {
      return NextResponse.json({ 
        success: false, 
        error: 'Golden ticket template not found' 
      }, { status: 404 });
    }

    // Check if template is active
    if (!template.isActive) {
      return NextResponse.json({ 
        success: false, 
        error: 'Golden ticket is no longer available' 
      }, { status: 400 });
    }

    // Check availability
    if (template.isLimited && template.soldQuantity >= template.maxQuantity) {
      return NextResponse.json({ 
        success: false, 
        error: 'Golden ticket sold out' 
      }, { status: 400 });
    }

    // Get buyer
    const buyer = await User.findById(decoded.userId) as any;
    if (!buyer) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 });
    }

    // Calculate fees
    const purchasePrice = template.finalPrice;
    const platformFeePercentage = 10; // 10% platform fee
    const platformFee = Math.round(purchasePrice * (platformFeePercentage / 100));
    const royaltyAmount = Math.round(purchasePrice * (template.totalRoyaltyPercentage / 100));
    const netAmount = purchasePrice - platformFee - royaltyAmount;

    // Generate unique token ID
    const tokenId = `GT_${template._id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create NFT metadata
    const nftMetadata = {
      name: template.name,
      description: template.description,
      image: template.nftMetadata?.image || `https://api.dicebear.com/7.x/shapes/svg?seed=${tokenId}`,
      attributes: [
        { trait_type: 'Artist', value: template.artistId.artistName },
        { trait_type: 'Price Tier', value: `${template.priceMultiplier}x Premium` },
        { trait_type: 'Royalty Rate', value: `${template.totalRoyaltyPercentage}%` },
        { trait_type: 'Edition', value: template.isLimited ? `${template.soldQuantity + 1} of ${template.maxQuantity}` : 'Open Edition' },
        { trait_type: 'Transferable', value: template.isSoulbound ? 'No' : 'Yes' },
        { trait_type: 'Perks Count', value: template.perks.length.toString() },
        ...template.perks.map(perk => ({ trait_type: 'Perk', value: perk }))
      ],
      properties: {
        category: 'Golden Ticket',
        artist: template.artistId.artistName,
        price: purchasePrice,
        royalty: template.totalRoyaltyPercentage,
        soulbound: template.isSoulbound,
        perks: template.perks
      }
    };

    // Create purchase record
    const purchase = await GoldenTicketPurchase.create({
      templateId: template._id,
      buyerId: buyer._id,
      artistId: template.artistId._id,
      eventId: template.eventId,
      tokenId,
      purchasePrice,
      royaltyPaid: royaltyAmount,
      platformFee,
      nftMetadata,
      transferHistory: [{
        from: '0x0000000000000000000000000000000000000000', // Mint address
        to: walletAddress || buyer.walletAddress,
        timestamp: new Date(),
        transactionHash: `mock_${Date.now()}` // In real app, this would be the blockchain tx hash
      }]
    });

    // Update template sold quantity
    await GoldenTicketTemplate.findByIdAndUpdate(templateId, {
      $inc: { 
        soldQuantity: 1,
        'salesData.totalRevenue': purchasePrice,
        'salesData.artistRoyalties': royaltyAmount,
        'salesData.platformFees': platformFee
      }
    });

    // Update artist stats
    await Artist.findByIdAndUpdate(template.artistId._id, {
      $inc: {
        totalRevenue: royaltyAmount,
        totalTicketsSold: 1
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Golden ticket purchased successfully!',
      purchase: {
        id: purchase._id,
        tokenId: purchase.tokenId,
        purchasePrice: purchase.purchasePrice,
        royaltyPaid: purchase.royaltyPaid,
        platformFee: purchase.platformFee,
        nftMetadata: purchase.nftMetadata,
        template: {
          name: template.name,
          description: template.description,
          perks: template.perks,
          artist: template.artistId.artistName
        },
        createdAt: purchase.createdAt
      }
    });

  } catch (error) {
    console.error('Purchase golden ticket error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to purchase golden ticket' 
    }, { status: 500 });
  }
}