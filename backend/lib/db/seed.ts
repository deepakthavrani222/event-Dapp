import { connectDB } from './connection';
import { User, UserRole, Event, TicketType, Royalty } from './models';

async function seed() {
  try {
    await connectDB();
    console.log('🌱 Starting database seed...');

    // Clear existing data
    await User.deleteMany({});
    await Event.deleteMany({});
    await TicketType.deleteMany({});
    await Royalty.deleteMany({});

    // Create sample users
    const buyer = await User.create({
      name: 'Demo Buyer',
      email: 'buyer@ticketchain.io',
      role: UserRole.BUYER,
      walletAddress: '0x1234567890123456789012345678901234567890',
    });

    const organizer = await User.create({
      name: 'Demo Organizer',
      email: 'organizer@ticketchain.io',
      role: UserRole.ORGANIZER,
      walletAddress: '0x2345678901234567890123456789012345678901',
    });

    const promoter = await User.create({
      name: 'Demo Promoter',
      email: 'promoter@ticketchain.io',
      role: UserRole.PROMOTER,
      walletAddress: '0x3456789012345678901234567890123456789012',
    });

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@ticketchain.io',
      role: UserRole.ADMIN,
      walletAddress: '0x4567890123456789012345678901234567890123',
    });

    console.log('✅ Created 4 sample users');

    // Create sample events
    const event1 = await Event.create({
      title: 'Diljit Dosanjh Live in Mumbai',
      description: 'Experience the magic of Diljit Dosanjh live in concert.',
      category: 'concert',
      date: new Date('2025-02-15'),
      time: '19:00',
      venue: 'DY Patil Stadium',
      city: 'Mumbai',
      location: 'Navi Mumbai, Maharashtra',
      image: '/concert-stage-purple-lights.jpg',
      organizerId: organizer._id,
      status: 'published',
    });

    const event2 = await Event.create({
      title: 'IPL 2025: MI vs CSK',
      description: 'Witness the biggest IPL rivalry live!',
      category: 'sports',
      date: new Date('2025-04-20'),
      time: '19:30',
      venue: 'Wankhede Stadium',
      city: 'Mumbai',
      location: 'Marine Lines, Mumbai',
      image: '/cricket-stadium-floodlights.jpg',
      organizerId: organizer._id,
      status: 'published',
    });

    const event3 = await Event.create({
      title: 'Sunburn Festival Goa',
      description: "Asia's biggest EDM festival returns to Goa!",
      category: 'festival',
      date: new Date('2025-12-28'),
      time: '16:00',
      venue: 'Vagator Beach',
      city: 'Goa',
      location: 'Vagator, North Goa',
      image: '/edm-festival-beach-sunset.jpg',
      organizerId: organizer._id,
      status: 'published',
    });

    console.log('✅ Created 3 sample events');

    // Create ticket types for event 1
    await TicketType.create({
      eventId: event1._id,
      name: 'VIP',
      tokenId: 1001,
      price: 5000,
      totalSupply: 500,
      soldCount: 0,
      maxPerWallet: 4,
    });

    await TicketType.create({
      eventId: event1._id,
      name: 'General',
      tokenId: 1002,
      price: 2500,
      totalSupply: 2000,
      soldCount: 0,
      maxPerWallet: 4,
    });

    // Create ticket types for event 2
    await TicketType.create({
      eventId: event2._id,
      name: 'Premium',
      tokenId: 2001,
      price: 3000,
      totalSupply: 1000,
      soldCount: 0,
      maxPerWallet: 4,
    });

    await TicketType.create({
      eventId: event2._id,
      name: 'Standard',
      tokenId: 2002,
      price: 1500,
      totalSupply: 5000,
      soldCount: 0,
      maxPerWallet: 4,
    });

    // Create ticket types for event 3
    await TicketType.create({
      eventId: event3._id,
      name: 'Early Bird',
      tokenId: 3001,
      price: 3000,
      totalSupply: 1000,
      soldCount: 0,
      maxPerWallet: 4,
    });

    await TicketType.create({
      eventId: event3._id,
      name: 'Regular',
      tokenId: 3002,
      price: 3500,
      totalSupply: 3000,
      soldCount: 0,
      maxPerWallet: 4,
    });

    console.log('✅ Created 6 ticket types');

    // Create royalty splits for events
    await Royalty.create({
      eventId: event1._id,
      organizerPct: 70,
      artistPct: 15,
      venuePct: 10,
      platformPct: 5,
    });

    await Royalty.create({
      eventId: event2._id,
      organizerPct: 70,
      artistPct: 15,
      venuePct: 10,
      platformPct: 5,
    });

    await Royalty.create({
      eventId: event3._id,
      organizerPct: 70,
      artistPct: 15,
      venuePct: 10,
      platformPct: 5,
    });

    console.log('✅ Created 3 royalty configurations');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Users: 4 (1 buyer, 1 organizer, 1 promoter, 1 admin)`);
    console.log(`   - Events: 3`);
    console.log(`   - Ticket Types: 6`);
    console.log(`   - Royalty Configs: 3`);
    console.log('\n✅ You can now test the API endpoints!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
