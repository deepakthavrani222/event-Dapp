import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireRole, unauthorizedResponse, forbiddenResponse } from '@/lib/middleware/auth';
import { connectDB } from '@/lib/db/connection';
import { Event, TicketType, Royalty } from '@/lib/db/models';
import { generateTokenId } from '@/lib/utils/token-id';

/**
 * POST /api/organizer/events
 * Create a new event with ticket types
 * Only ORGANIZER and ADMIN roles can access
 * Auto-approves small events (<100 tickets)
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
    const {
      title,
      description,
      category,
      venue,
      city,
      location,
      image,
      imagePublicId,
      date,
      time,
      timezone,
      royaltySettings,
      promotionSettings,
      venueFee,
    } = body;

    // Validate required fields
    if (!title || !description || !venue || !city || !location || !date || !time) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, venue, city, location, date, time' },
        { status: 400 }
      );
    }

    // Parse royalty settings with defaults
    const parsedRoyaltySettings = {
      enableResale: royaltySettings?.soulbound ? false : (royaltySettings?.enableResale !== false),
      royaltyPercentage: Math.min(10, Math.max(2, royaltySettings?.royaltyPercentage || 5)),
      maxResalePrice: Math.min(200, Math.max(100, royaltySettings?.maxResalePrice || 120)),
      soulbound: royaltySettings?.soulbound || false,
    };

    // Parse promotion settings
    const parsedPromotionSettings = {
      tags: promotionSettings?.tags || [],
      enableReferrals: promotionSettings?.enableReferrals || false,
      referralCommission: Math.min(15, Math.max(1, promotionSettings?.referralCommission || 5)),
      websiteUrl: promotionSettings?.websiteUrl || '',
      socialLinks: promotionSettings?.socialLinks || {},
    };

    // Calculate total tickets for auto-approval check
    const ticketTypesData = body.ticketTypes || [];
    const totalTickets = ticketTypesData.reduce((sum: number, tt: any) => sum + (tt.totalSupply || 0), 0);
    
    // Auto-approve small events (<100 tickets)
    const isAutoApproved = totalTickets < 100;

    // Create event
    const event = await Event.create({
      title,
      description,
      category: category || 'Other',
      venue,
      city,
      location,
      image: image || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800',
      imagePublicId: imagePublicId || '',
      date: new Date(date),
      time,
      timezone: timezone || 'Asia/Kolkata',
      organizerId: auth.user!.id,
      status: isAutoApproved ? 'approved' : 'pending',
      royaltySettings: parsedRoyaltySettings,
      promotionSettings: parsedPromotionSettings,
      venueFee: venueFee || 0,
      totalRevenue: 0,
      totalRoyaltiesEarned: 0,
      createdAt: new Date(),
    });

    // Create ticket types if provided
    const createdTicketTypes = [];

    for (const tt of ticketTypesData) {
      if (tt.name && tt.price > 0 && tt.totalSupply > 0) {
        const tokenId = generateTokenId();
        const ticketType = await TicketType.create({
          eventId: event._id,
          name: tt.name,
          description: tt.description || '',
          price: tt.price,
          totalSupply: tt.totalSupply,
          availableSupply: tt.totalSupply,
          maxPerWallet: tt.maxPerWallet || 4,
          tokenId,
          isActive: true,
          // Early bird pricing
          pricingType: tt.pricingType || 'fixed',
          earlyBirdPrice: tt.earlyBirdPrice || 0,
          earlyBirdEndDate: tt.earlyBirdEndDate ? new Date(tt.earlyBirdEndDate) : null,
          createdAt: new Date(),
        });
        createdTicketTypes.push({
          id: ticketType._id,
          name: ticketType.name,
          price: ticketType.price,
          totalSupply: ticketType.totalSupply,
          availableSupply: ticketType.availableSupply,
        });
      }
    }

    return NextResponse.json({
      success: true,
      event: {
        id: event._id,
        title: event.title,
        description: event.description,
        category: event.category,
        venue: event.venue,
        city: event.city,
        location: event.location,
        image: event.image,
        date: event.date,
        time: event.time,
        timezone: event.timezone,
        status: event.status,
        isAutoApproved,
        royaltySettings: event.royaltySettings,
        promotionSettings: event.promotionSettings,
        ticketTypes: createdTicketTypes,
      },
      message: isAutoApproved 
        ? 'Event created and auto-approved! It\'s now live.' 
        : 'Event submitted for review. You\'ll receive an email within 1-24 hours.',
    }, { status: 201 });

  } catch (error: any) {
    console.error('Event creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create event', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/organizer/events
 * Get all events created by the organizer
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

    const events = await Event.find({ organizerId: auth.user!.id })
      .sort({ createdAt: -1 });

    const eventsWithTickets = await Promise.all(
      events.map(async (event) => {
        const ticketTypes = await TicketType.find({ eventId: event._id });
        return {
          id: event._id,
          title: event.title,
          description: event.description,
          category: event.category,
          venue: event.venue,
          startDate: event.startDate,
          endDate: event.endDate,
          status: event.status,
          ticketTypes: ticketTypes.map(tt => ({
            id: tt._id,
            name: tt.name,
            price: tt.price,
            totalSupply: tt.totalSupply,
            availableSupply: tt.availableSupply,
            tokenId: tt.tokenId,
          })),
        };
      })
    );

    return NextResponse.json({
      success: true,
      events: eventsWithTickets,
      count: eventsWithTickets.length,
    });

  } catch (error: any) {
    console.error('Fetch events error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events', details: error.message },
      { status: 500 }
    );
  }
}
