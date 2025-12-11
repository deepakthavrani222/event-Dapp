# 🎫 My Tickets Backend Data Analysis

## Overview
This document analyzes what data is stored and returned for each ticket in the "My Tickets" section.

## 📊 Data Flow Analysis

### 1. **When Ticket is Purchased** (`/api/buyer/purchase`)

**Data Stored in Database:**
```javascript
const ticket = await Ticket.create({
  eventId: ticketType.eventId,           // Reference to Event
  ticketTypeId: ticketType._id,          // Reference to TicketType  
  buyerId: auth.user!.id,                // Reference to User (buyer)
  tokenId: ticketType.tokenId,           // NFT Token ID (from TicketType)
  price: ticketType.price,               // Price paid (from TicketType)
  currency: ticketType.currency,         // Currency (usually 'INR')
  status: 'ACTIVE',                      // Ticket status
  purchaseDate: new Date(),              // When purchased
  txHash: mintResult.txHash,             // Blockchain transaction hash
});
```

### 2. **Ticket Model Structure** (`/lib/db/models/Ticket.ts`)

**Complete Ticket Schema:**
```typescript
interface ITicket {
  eventId: ObjectId;                     // ✅ Stored: Event reference
  ticketTypeId: ObjectId;                // ✅ Stored: Ticket type reference
  buyerId: ObjectId;                     // ✅ Stored: Buyer reference
  ownerAddress?: string;                 // ❌ Not used: Wallet address
  tokenId: string;                       // ✅ Stored: NFT token ID
  price: number;                         // ✅ Stored: Purchase price
  currency: string;                      // ✅ Stored: Currency (INR)
  status: 'ACTIVE'|'USED'|'LISTED'|'TRANSFERRED'; // ✅ Stored: Status
  purchaseDate: Date;                    // ✅ Stored: Purchase timestamp
  usedAt?: Date;                         // ❌ Not used: Check-in time
  checkedInBy?: ObjectId;                // ❌ Not used: Inspector reference
  txHash?: string;                       // ✅ Stored: Blockchain hash
  createdAt: Date;                       // ✅ Auto: MongoDB timestamp
}
```

### 3. **My Tickets API Response** (`/api/buyer/tickets`)

**Data Returned to Frontend:**
```javascript
{
  success: true,
  tickets: [
    {
      // Ticket Data
      id: ticket._id,                    // Ticket ID
      tokenId: ticket.tokenId,           // NFT Token ID
      status: ticket.status,             // ACTIVE/USED/etc
      price: ticket.price,               // Purchase price
      currency: ticket.currency,         // INR
      purchaseDate: ticket.purchaseDate, // When bought
      usedAt: ticket.usedAt,            // Check-in time (if used)
      txHash: ticket.txHash,            // Blockchain hash
      
      // Event Data (populated from Event model)
      event: {
        id: event._id,                   // Event ID
        title: event.title,              // Event name
        venue: event.venue,              // Venue name
        startDate: event.date,           // Event date
        status: event.status,            // approved/pending
      },
      
      // Ticket Type Data (populated from TicketType model)
      ticketType: {
        name: ticketType.name,           // VIP/General/etc
        description: ticketType.description, // Ticket description
      }
    }
  ],
  count: 4
}
```

## 🔍 **Key Findings**

### **Same Data for All Tickets?**
**❌ NO** - Each ticket has **unique data**:

1. **Unique Per Ticket:**
   - ✅ `id` - Each ticket has unique MongoDB ID
   - ✅ `tokenId` - Each ticket has unique NFT token ID  
   - ✅ `purchaseDate` - Each purchase has different timestamp
   - ✅ `txHash` - Each has unique blockchain transaction hash

2. **Same for Tickets of Same Event/Type:**
   - 🔄 `price` - Same for same ticket type
   - 🔄 `currency` - Usually INR for all
   - 🔄 `event.*` - Same event details for tickets of same event
   - 🔄 `ticketType.*` - Same type details for same ticket type

3. **Same for All User's Tickets:**
   - 🔄 `buyerId` - Same user for all their tickets
   - 🔄 `status` - Usually 'ACTIVE' until used

### **Potential Issues Identified:**

1. **❌ TokenId Problem:**
   ```javascript
   tokenId: ticketType.tokenId  // ALL tickets of same type get SAME tokenId!
   ```
   **Issue**: Multiple tickets of same type share the same `tokenId`, which should be unique per ticket.

2. **❌ Missing Unique Identifiers:**
   - No seat numbers
   - No unique ticket numbers
   - No QR code data stored

3. **❌ Unused Fields:**
   - `ownerAddress` - Not populated
   - `usedAt` - Not used in check-in flow
   - `checkedInBy` - Not used

## 🛠️ **Recommendations**

### **Fix TokenId Issue:**
```javascript
// Instead of using ticketType.tokenId for all tickets
tokenId: ticketType.tokenId,

// Generate unique tokenId per ticket
tokenId: `${ticketType.tokenId}-${Date.now()}-${i}`,
```

### **Add Unique Identifiers:**
```javascript
const ticket = await Ticket.create({
  // ... existing fields
  seatNumber: `${ticketType.name}-${String(i + 1).padStart(3, '0')}`, // VIP-001
  qrCodeData: `${ticketType._id}-${Date.now()}-${crypto.randomUUID()}`,
  uniqueTicketNumber: `TKT-${Date.now()}-${i}`,
});
```

### **Populate Owner Address:**
```javascript
ownerAddress: auth.user!.walletAddress, // Add wallet address
```

## 📋 **Current Data Summary**

**What's Unique Per Ticket:**
- Ticket ID, Purchase Date, Transaction Hash

**What's Shared:**
- Event details, Ticket type details, Price, TokenId (❌ Problem)

**What's Missing:**
- Unique seat numbers, QR codes, proper tokenId uniqueness

The main issue is that **tokenId is not unique per ticket** - all tickets of the same type share the same tokenId, which breaks NFT uniqueness principles.