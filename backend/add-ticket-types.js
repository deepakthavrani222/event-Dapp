/**
 * Script to add ticket types to existing events
 * Run with: node add-ticket-types.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ticketchain';

// Define schemas
const ticketTypeSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  totalSupply: { type: Number, required: true },
  availableSupply: { type: Number, required: true },
  maxPerWallet: { type: Number, default: 6 },
  tokenId: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const eventSchema = new mongoose.Schema({
  title: String,
  status: String,
});

async function addTicketTypes() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const Event = mongoose.model('Event', eventSchema);
    const TicketType = mongoose.model('TicketType', ticketTypeSchema);

    // Get all events
    const events = await Event.find({});
    console.log(`Found ${events.length} events`);

    for (const event of events) {
      // Check if event already has ticket types
      const existingTypes = await TicketType.find({ eventId: event._id });
      
      if (existingTypes.length > 0) {
        console.log(`Event "${event.title}" already has ${existingTypes.length} ticket types`);
        continue;
      }

      // Add ticket types for this event
      const ticketTypes = [
        {
          eventId: event._id,
          name: 'General Admission',
          description: 'Standard entry to the event',
          price: 999,
          totalSupply: 500,
          availableSupply: 500,
          maxPerWallet: 6,
          tokenId: `GA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          isActive: true,
        },
        {
          eventId: event._id,
          name: 'VIP',
          description: 'Premium access with exclusive perks',
          price: 2499,
          totalSupply: 100,
          availableSupply: 100,
          maxPerWallet: 4,
          tokenId: `VIP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          isActive: true,
        },
        {
          eventId: event._id,
          name: 'Premium',
          description: 'Best seats with backstage access',
          price: 4999,
          totalSupply: 50,
          availableSupply: 50,
          maxPerWallet: 2,
          tokenId: `PREM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          isActive: true,
        },
      ];

      await TicketType.insertMany(ticketTypes);
      console.log(`Added 3 ticket types to event "${event.title}"`);
    }

    console.log('\nDone! All events now have ticket types.');
    
    // Verify
    const allTicketTypes = await TicketType.find({});
    console.log(`Total ticket types in database: ${allTicketTypes.length}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

addTicketTypes();
