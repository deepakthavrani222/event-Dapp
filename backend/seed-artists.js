const mongoose = require('mongoose');
require('dotenv').config();

// Import models - using dynamic imports for ES modules
async function importModels() {
  const { Artist } = await import('./lib/db/models/Artist.js');
  const { User } = await import('./lib/db/models/User.js');
  return { Artist, User };
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ticketchain';

async function seedArtists() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Import models
    const { Artist, User } = await importModels();

    // Create sample users for artists
    const artistUsers = [
      {
        email: 'badshah@example.com',
        name: 'Badshah',
        role: 'organizer'
      },
      {
        email: 'prateek@example.com',
        name: 'Prateek Kuhad',
        role: 'organizer'
      },
      {
        email: 'nucleya@example.com',
        name: 'Nucleya',
        role: 'organizer'
      },
      {
        email: 'wcmt@example.com',
        name: 'When Chai Met Toast',
        role: 'organizer'
      },
      {
        email: 'divine@example.com',
        name: 'DIVINE',
        role: 'organizer'
      }
    ];

    // Create users
    const createdUsers = [];
    for (const userData of artistUsers) {
      let user = await User.findOne({ email: userData.email });
      if (!user) {
        user = await User.create(userData);
      }
      createdUsers.push(user);
    }

    // Create sample artists
    const artistsData = [
      {
        userId: createdUsers[0]._id,
        artistName: 'Badshah',
        realName: 'Aditya Prateek Singh Sisodia',
        bio: 'Indian rapper, singer, songwriter and music producer. Known for Hindi, Haryanvi and Punjabi songs.',
        genre: ['Hip Hop', 'Punjabi', 'Bollywood'],
        socialLinks: {
          instagram: 'https://instagram.com/badboyshah',
          youtube: 'https://youtube.com/c/badshah',
          spotify: 'https://open.spotify.com/artist/4YRxDV8wJFPHPTeXepOstw'
        },
        verificationStatus: 'verified',
        verifiedAt: new Date('2024-01-10'),
        totalEvents: 25,
        totalTicketsSold: 125000,
        totalRevenue: 31250000, // 25% of ticket sales
        fanCount: 2500,
        averageRating: 4.8,
        royaltyPercentage: 25,
        canCreateGoldenTickets: true,
        goldenTicketPerks: ['Meet & Greet', 'Backstage Pass', 'Signed Merchandise', 'VIP Lounge Access']
      },
      {
        userId: createdUsers[1]._id,
        artistName: 'Prateek Kuhad',
        realName: 'Prateek Kuhad',
        bio: 'Indian singer-songwriter and musician known for his indie folk music. His songs blend English and Hindi lyrics.',
        genre: ['Indie', 'Folk', 'Alternative'],
        socialLinks: {
          instagram: 'https://instagram.com/prateekuhad',
          youtube: 'https://youtube.com/c/prateekuhad',
          spotify: 'https://open.spotify.com/artist/09hVIj6vPWghhCuQWiURAY'
        },
        verificationStatus: 'verified',
        verifiedAt: new Date('2024-01-15'),
        totalEvents: 18,
        totalTicketsSold: 85000,
        totalRevenue: 19125000,
        fanCount: 1800,
        averageRating: 4.9,
        royaltyPercentage: 22,
        canCreateGoldenTickets: true,
        goldenTicketPerks: ['Acoustic Session', 'Signed Vinyl', 'Personal Message', 'Early Access']
      },
      {
        userId: createdUsers[2]._id,
        artistName: 'Nucleya',
        realName: 'Udyan Sagar',
        bio: 'Indian electronic music producer and DJ. Pioneer of bass music in India, known for his unique sound.',
        genre: ['Electronic', 'Bass', 'EDM'],
        socialLinks: {
          instagram: 'https://instagram.com/nucleya',
          youtube: 'https://youtube.com/c/nucleya',
          spotify: 'https://open.spotify.com/artist/3nzuGtN3nXARvvecier4K0'
        },
        verificationStatus: 'verified',
        verifiedAt: new Date('2024-01-20'),
        totalEvents: 45,
        totalTicketsSold: 180000,
        totalRevenue: 36000000,
        fanCount: 3200,
        averageRating: 4.7,
        royaltyPercentage: 20,
        canCreateGoldenTickets: true,
        goldenTicketPerks: ['DJ Booth Access', 'Custom Mix CD', 'Producer Session', 'Festival Pass']
      },
      {
        userId: createdUsers[3]._id,
        artistName: 'When Chai Met Toast',
        realName: 'When Chai Met Toast',
        bio: 'Indian indie folk band known for their soulful melodies and heartfelt lyrics. Creating music that resonates with the soul.',
        genre: ['Indie', 'Pop', 'Folk'],
        socialLinks: {
          instagram: 'https://instagram.com/whenchaimetttoast',
          youtube: 'https://youtube.com/c/whenchaimetttoast',
          spotify: 'https://open.spotify.com/artist/6sFIWsNpZYqfjUpaCgueju'
        },
        verificationStatus: 'verified',
        verifiedAt: new Date('2024-02-01'),
        totalEvents: 12,
        totalTicketsSold: 45000,
        totalRevenue: 9000000,
        fanCount: 950,
        averageRating: 4.6,
        royaltyPercentage: 18,
        canCreateGoldenTickets: true,
        goldenTicketPerks: ['Band Hangout', 'Signed Guitar Pick', 'Songwriting Session', 'Chai & Chat']
      },
      {
        userId: createdUsers[4]._id,
        artistName: 'DIVINE',
        realName: 'Vivian Fernandes',
        bio: 'Indian rapper from Mumbai. Pioneer of Gully Rap movement in India, known for authentic street stories.',
        genre: ['Hip Hop', 'Rap', 'Gully Rap'],
        socialLinks: {
          instagram: 'https://instagram.com/vivianakadivine',
          youtube: 'https://youtube.com/c/divine',
          spotify: 'https://open.spotify.com/artist/4K6blSRoklNdpw4mzLxwfn'
        },
        verificationStatus: 'verified',
        verifiedAt: new Date('2024-02-05'),
        totalEvents: 22,
        totalTicketsSold: 95000,
        totalRevenue: 21375000,
        fanCount: 2100,
        averageRating: 4.8,
        royaltyPercentage: 23,
        canCreateGoldenTickets: true,
        goldenTicketPerks: ['Rap Battle Session', 'Studio Visit', 'Signed Merchandise', 'Gully Tour']
      }
    ];

    // Create artists
    for (const artistData of artistsData) {
      const existingArtist = await Artist.findOne({ userId: artistData.userId });
      if (!existingArtist) {
        await Artist.create(artistData);
        console.log(`Created artist: ${artistData.artistName}`);
      } else {
        console.log(`Artist already exists: ${artistData.artistName}`);
      }
    }

    console.log('Artist seeding completed!');
    process.exit(0);

  } catch (error) {
    console.error('Error seeding artists:', error);
    process.exit(1);
  }
}

seedArtists();