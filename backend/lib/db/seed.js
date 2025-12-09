const mongoose = require('mongoose');

const MONGODB_URI = process.env.DATABASE_URL || 'mongodb://localhost:27017/ticketchain';

const UserRoles = {
  BUYER: 'BUYER',
  ORGANIZER: 'ORGANIZER',
  PROMOTER: 'PROMOTER',
  VENUE_OWNER: 'VENUE_OWNER',
  ARTIST: 'ARTIST',
  RESELLER: 'RESELLER',
  INSPECTOR: 'INSPECTOR',
  ADMIN: 'ADMIN',
  GUEST: 'GUEST',
};

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected');
    console.log('🌱 Starting database seed...');

    // Get collections
    const User = mongoose.connection.collection('users');
    const Event = mongoose.connection.collection('events');
    const TicketType = mongoose.connection.collection('tickettypes');
    const Royalty = mongoose.connection.collection('royalties');

    // Clear existing data
    await User.deleteMany({});
    await Event.deleteMany({});
    await TicketType.deleteMany({});
    await Royalty.deleteMany({});

    // Create sample users
    const usersResult = await User.insertMany([
      {
        name: 'Demo Buyer',
        email: 'buyer@ticketchain.io',
        role: UserRoles.BUYER,
        walletAddress: '0x1234567890123456789012345678901234567890',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Demo Organizer',
        email: 'organizer@ticketchain.io',
        role: UserRoles.ORGANIZER,
        walletAddress: '0x2345678901234567890123456789012345678901',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Demo Promoter',
        email: 'promoter@ticketchain.io',
        role: UserRoles.PROMOTER,
        walletAddress: '0x3456789012345678901234567890123456789012',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Admin User',
        email: 'admin@ticketchain.io',
        role: UserRoles.ADMIN,
        walletAddress: '0x4567890123456789012345678901234567890123',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const organizerId = usersResult.insertedIds[1];
    console.log('✅ Created 4 sample users');

    // Create sample events
    const eventsResult = await Event.insertMany([
      {
        title: 'Diljit Dosanjh Live in Mumbai',
        description: 'Experience the magic of Diljit Dosanjh live in concert.',
        category: 'concert',
        date: new Date('2025-02-15'),
        time: '19:00',
        venue: 'DY Patil Stadium',
        city: 'Mumbai',
        location: 'Navi Mumbai, Maharashtra',
        image: '/concert-stage-purple-lights.jpg',
        organizerId: organizerId,
        status: 'published',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'IPL 2025: MI vs CSK',
        description: 'Witness the biggest IPL rivalry live!',
        category: 'sports',
        date: new Date('2025-04-20'),
        time: '19:30',
        venue: 'Wankhede Stadium',
        city: 'Mumbai',
        location: 'Marine Lines, Mumbai',
        image: '/cricket-stadium-floodlights.jpg',
        organizerId: organizerId,
        status: 'published',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'Sunburn Festival Goa',
        description: "Asia's biggest EDM festival returns to Goa!",
        category: 'festival',
        date: new Date('2025-12-28'),
        time: '16:00',
        venue: 'Vagator Beach',
        city: 'Goa',
        location: 'Vagator, North Goa',
        image: '/edm-festival-beach-sunset.jpg',
        organizerId: organizerId,
        status: 'published',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const event1Id = eventsResult.insertedIds[0];
    const event2Id = eventsResult.insertedIds[1];
    const event3Id = eventsResult.insertedIds[2];
    console.log('✅ Created 3 sample events');

    // Create ticket types
    await TicketType.insertMany([
      {
        eventId: event1Id,
        name: 'VIP',
        tokenId: 1001,
        price: 5000,
        totalSupply: 500,
        soldCount: 0,
        maxPerWallet: 4,
        createdAt: new Date(),
      },
      {
        eventId: event1Id,
        name: 'General',
        tokenId: 1002,
        price: 2500,
        totalSupply: 2000,
        soldCount: 0,
        maxPerWallet: 4,
        createdAt: new Date(),
      },
      {
        eventId: event2Id,
        name: 'Premium',
        tokenId: 2001,
        price: 3000,
        totalSupply: 1000,
        soldCount: 0,
        maxPerWallet: 4,
        createdAt: new Date(),
      },
      {
        eventId: event2Id,
        name: 'Standard',
        tokenId: 2002,
        price: 1500,
        totalSupply: 5000,
        soldCount: 0,
        maxPerWallet: 4,
        createdAt: new Date(),
      },
      {
        eventId: event3Id,
        name: 'Early Bird',
        tokenId: 3001,
        price: 3000,
        totalSupply: 1000,
        soldCount: 0,
        maxPerWallet: 4,
        createdAt: new Date(),
      },
      {
        eventId: event3Id,
        name: 'Regular',
        tokenId: 3002,
        price: 3500,
        totalSupply: 3000,
        soldCount: 0,
        maxPerWallet: 4,
        createdAt: new Date(),
      },
    ]);

    console.log('✅ Created 6 ticket types');

    // Create royalty splits
    await Royalty.insertMany([
      {
        eventId: event1Id,
        organizerPct: 70,
        artistPct: 15,
        venuePct: 10,
        platformPct: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        eventId: event2Id,
        organizerPct: 70,
        artistPct: 15,
        venuePct: 10,
        platformPct: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        eventId: event3Id,
        organizerPct: 70,
        artistPct: 15,
        venuePct: 10,
        platformPct: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    console.log('✅ Created 3 royalty configurations');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Users: 4 (1 buyer, 1 organizer, 1 promoter, 1 admin)`);
    console.log(`   - Events: 3`);
    console.log(`   - Ticket Types: 6`);
    console.log(`   - Royalty Configs: 3`);
    console.log('\n✅ You can now test the API endpoints!');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
