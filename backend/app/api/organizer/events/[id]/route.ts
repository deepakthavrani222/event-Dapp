import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireRole, unauthorizedResponse, forbiddenResponse } from '@/lib/middleware/auth';
import { connectDB } from '@/lib/db/connection';
import { Event, TicketType, Ticket } from '@/lib/db/models';

/**
 * GET /api/organizer/events/[id]
 * Get detailed event information for organizer dashboard
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const event = await Event.findById(params.id);
    
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Verify ownership (unless admin)
    if (auth.user!.role !== 'ADMIN' && event.organizerId.toString() !== auth.user!.id) {
      return forbiddenResponse('You do not own this event');
    }

    // Get ticket types with sales data
    const ticketTypes = await TicketType.find({ eventId: event._id });
    
    // Get sold tickets count per type
    const ticketTypesWithSales = await Promise.all(
      ticketTypes.map(async (tt) => {
        const soldCount = await Ticket.countDocuments({ 
          ticketTypeId: tt._id,
          status: { $in: ['valid', 'used'] }
        });
        
        return {
          id: tt._id,
          name: tt.name,
          description: tt.description,
          price: tt.price,
          totalSupply: tt.totalSupply,
          availableSupply: tt.totalSupply - soldCount,
          soldCount,
          maxPerWallet: tt.maxPerWallet,
          pricingType: tt.pricingType,
          earlyBirdPrice: tt.earlyBirdPrice,
          earlyBirdEndDate: tt.earlyBirdEndDate,
        };
      })
    );

    return NextResponse.json({
      success: true,
      event: {
        id: event._id,
        title: event.title,
        description: event.description,
        category: event.category,
        date: event.date,
        time: event.time,
        timezone: event.timezone,
        venue: event.venue,
        city: event.city,
        location: event.location,
        image: event.image,
        status: event.status,
        rejectionReason: event.rejectionReason,
        royaltySettings: event.royaltySettings,
        promotionSettings: event.promotionSettings,
        venueFee: event.venueFee,
        totalRevenue: event.totalRevenue,
        totalRoyaltiesEarned: event.totalRoyaltiesEarned,
        contractAddress: event.contractAddress,
        ticketTypes: ticketTypesWithSales,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
      },
    });

  } catch (error: any) {
    console.error('Fetch event error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/organizer/events/[id]
 * Update event details
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const event = await Event.findById(params.id);
    
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Verify ownership
    if (auth.user!.role !== 'ADMIN' && event.organizerId.toString() !== auth.user!.id) {
      return forbiddenResponse('You do not own this event');
    }

    const body = await request.json();
    const allowedUpdates = [
      'title', 'description', 'category', 'date', 'time', 'timezone',
      'venue', 'city', 'location', 'image', 'imagePublicId',
      'royaltySettings', 'promotionSettings'
    ];

    // Only update allowed fields
    for (const key of allowedUpdates) {
      if (body[key] !== undefined) {
        (event as any)[key] = body[key];
      }
    }

    await event.save();

    // TODO: Send notification to buyers about event update

    return NextResponse.json({
      success: true,
      message: 'Event updated successfully',
      event: {
        id: event._id,
        title: event.title,
        status: event.status,
      },
    });

  } catch (error: any) {
    console.error('Update event error:', error);
    return NextResponse.json(
      { error: 'Failed to update event', details: error.message },
      { status: 500 }
    );
  }
}
