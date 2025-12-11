import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { Artist } from '@/lib/db/models/Artist';
import { User } from '@/lib/db/models/User';
import { Event } from '@/lib/db/models/Event';

// GET - Get public artist profile by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();
    
    const { slug } = params;
    
    // Find artist by slug (in real app, you'd have a slug field)
    // For now, we'll use artistName as slug (converted to lowercase with hyphens)
    const artist = await Artist.findOne({
      $or: [
        { artistName: { $regex: new RegExp(slug.replace(/-/g, ' '), 'i') } },
        { artistName: { $regex: new RegExp(slug, 'i') } }
      ],
      verificationStatus: 'verified' // Only show verified artists publicly
    });
    
    if (!artist) {
      return NextResponse.json({ 
        success: false, 
        error: 'Artist not found' 
      }, { status: 404 });
    }

    // Get user details
    const user = await User.findById(artist.userId).select('name email');
    
    // Get artist's events
    const events = await Event.find({ 
      organizerId: artist.userId,
      status: { $in: ['approved', 'live'] }
    }).sort({ startDate: -1 });

    // Separate upcoming and past events
    const now = new Date();
    const upcomingEvents = events.filter(event => new Date(event.startDate) > now);
    const pastEvents = events.filter(event => new Date(event.startDate) <= now);

    return NextResponse.json({
      success: true,
      artist: {
        id: artist._id,
        slug: artist.artistName.toLowerCase().replace(/\s+/g, '-'),
        artistName: artist.artistName,
        realName: artist.realName,
        bio: artist.bio,
        genre: artist.genre,
        socialLinks: artist.socialLinks,
        verificationStatus: artist.verificationStatus,
        verifiedAt: artist.verifiedAt,
        totalEvents: artist.totalEvents,
        totalTicketsSold: artist.totalTicketsSold,
        totalRevenue: artist.totalRevenue,
        fanCount: artist.fanCount,
        averageRating: artist.averageRating,
        royaltyPercentage: artist.royaltyPercentage,
        canCreateGoldenTickets: artist.canCreateGoldenTickets,
        goldenTicketPerks: artist.goldenTicketPerks,
        createdAt: artist.createdAt,
      },
      events: {
        upcoming: upcomingEvents.map(event => ({
          id: event._id,
          title: event.title,
          description: event.description,
          venue: event.venue,
          city: event.city,
          startDate: event.startDate,
          endDate: event.endDate,
          ticketTypes: event.ticketTypes,
          totalCapacity: event.totalCapacity,
          ticketsSold: event.ticketsSold,
          status: event.status,
          image: event.image,
        })),
        past: pastEvents.map(event => ({
          id: event._id,
          title: event.title,
          venue: event.venue,
          city: event.city,
          startDate: event.startDate,
          ticketsSold: event.ticketsSold,
          totalCapacity: event.totalCapacity,
          status: 'past',
          image: event.image,
        }))
      }
    });

  } catch (error) {
    console.error('Get public artist profile error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch artist profile' 
    }, { status: 500 });
  }
}