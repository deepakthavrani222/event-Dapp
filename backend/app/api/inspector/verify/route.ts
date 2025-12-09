import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireRole, unauthorizedResponse } from '@/lib/middleware/auth';
import { connectDB } from '@/lib/db/connection';
import { Ticket, Event } from '@/lib/db/models';
import { verifyTicketOwnership } from '@/lib/blockchain/ticket-nft';

/**
 * POST /api/inspector/verify
 * Verify and check-in a ticket by scanning QR code
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  const auth = await requireAuth(request);
  
  if (!auth.authorized) {
    return unauthorizedResponse(auth.error);
  }

  const roleCheck = requireRole(auth.user!, ['INSPECTOR', 'ADMIN']);
  if (!roleCheck.authorized) {
    return unauthorizedResponse(roleCheck.error);
  }

  try {
    await connectDB();

    const body = await request.json();
    const { ticketId, tokenId, eventId } = body;

    if (!ticketId || !tokenId) {
      return NextResponse.json(
        { error: 'Missing ticket ID or token ID' },
        { status: 400 }
      );
    }

    // Get ticket from database
    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Ticket not found',
          status: 'INVALID'
        },
        { status: 404 }
      );
    }

    // Verify token ID matches
    if (ticket.tokenId !== tokenId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Token ID mismatch',
          status: 'INVALID'
        },
        { status: 400 }
      );
    }

    // Verify event ID if provided
    if (eventId && ticket.eventId.toString() !== eventId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Ticket is for a different event',
          status: 'WRONG_EVENT'
        },
        { status: 400 }
      );
    }

    // Check if ticket is already used
    if (ticket.status === 'USED') {
      const event = await Event.findById(ticket.eventId);
      
      return NextResponse.json(
        { 
          success: false,
          error: 'Ticket already used',
          status: 'ALREADY_USED',
          usedAt: ticket.usedAt,
          checkedInBy: ticket.checkedInBy,
          event: event ? {
            title: event.title,
            startDate: event.startDate,
          } : null,
        },
        { status: 400 }
      );
    }

    // Check if ticket is listed for resale
    if (ticket.status === 'LISTED') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Ticket is listed for resale',
          status: 'LISTED'
        },
        { status: 400 }
      );
    }

    // Verify NFT ownership on-chain
    const ownerAddress = ticket.ownerAddress || ticket.buyerId;
    const ownershipVerification = await verifyTicketOwnership(
      ownerAddress,
      ticket.tokenId
    );

    if (!ownershipVerification.isOwner) {
      return NextResponse.json(
        { 
          success: false,
          error: 'NFT ownership verification failed',
          status: 'OWNERSHIP_FAILED'
        },
        { status: 400 }
      );
    }

    // Mark ticket as used
    ticket.status = 'USED';
    ticket.usedAt = new Date();
    ticket.checkedInBy = auth.user!.id;
    await ticket.save();

    // Get event details
    const event = await Event.findById(ticket.eventId);

    const verificationTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      message: 'Ticket verified and checked in successfully',
      status: 'VALID',
      ticket: {
        id: ticket._id,
        tokenId: ticket.tokenId,
        status: ticket.status,
        usedAt: ticket.usedAt,
        checkedInBy: auth.user!.name,
      },
      event: event ? {
        title: event.title,
        venue: event.venue,
        startDate: event.startDate,
      } : null,
      verificationTime: `${verificationTime}ms`,
    }, { status: 200 });

  } catch (error: any) {
    console.error('Ticket verification error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Verification failed', 
        details: error.message,
        status: 'ERROR'
      },
      { status: 500 }
    );
  }
}
