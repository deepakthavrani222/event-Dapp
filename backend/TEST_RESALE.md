# Resale Marketplace - Testing Guide

## Overview
The resale marketplace allows users to list their tickets for resale and purchase tickets from other users. Automatic royalty distribution ensures organizers, artists, and venues receive their share on secondary sales.

## Features Implemented

### 1. List Ticket for Resale
**Endpoint:** `POST /api/buyer/resell`

**Request:**
```json
{
  "ticketId": "ticket_id_here",
  "price": 5000
}
```

**Features:**
- Set custom resale price
- Automatic fee calculation (5% platform + ~10% royalties)
- Ticket status changes to LISTED
- Cannot list already listed tickets
- Cannot list used tickets

### 2. Browse Resale Listings
**Endpoint:** `GET /api/buyer/listings`

**Features:**
- View all active resale listings
- See price comparison with original price
- Filter by event (optional query param: `?eventId=xxx`)
- Shows percentage increase/decrease
- Public endpoint (no auth required)

### 3. Purchase Resale Ticket
**Endpoint:** `POST /api/buyer/listings/[id]/purchase`

**Features:**
- Automatic NFT transfer to buyer
- Royalty distribution to organizers/artists/venues
- Platform fee collection
- Seller receives net amount
- Cannot buy your own listing
- Listing marked as SOLD

## Frontend Integration

### My Tickets Page
- **Resell Button:** Added to each active ticket card
- **ResellDialog:** Modal for setting resale price with fee breakdown
- **Real-time Updates:** Ticket list refreshes after successful listing

### Resale Marketplace Page
- **Browse Listings:** Grid view of all available resale tickets
- **Price Comparison:** Shows original vs resale price with percentage
- **Purchase Flow:** One-click purchase with automatic redirect
- **Empty State:** Helpful message when no listings available

### Navigation
- **Buyer Dashboard:** Added "Resale Market" link to navigation
- **Icon:** Shopping bag icon for easy identification

## Testing Flow

### Test Scenario 1: List a Ticket for Resale
1. Login as a buyer
2. Purchase a ticket from an event
3. Go to "My Tickets"
4. Click "Resell" button on an active ticket
5. Set a price (e.g., ₹5000)
6. Review fee breakdown
7. Click "List for Resale"
8. Verify ticket status changes to LISTED

### Test Scenario 2: Browse and Purchase Resale Ticket
1. Login as a different buyer
2. Click "Resale Market" in navigation
3. Browse available listings
4. See price comparison (original vs resale)
5. Click "Purchase Resale Ticket"
6. Verify redirect to "My Tickets"
7. Verify ticket now appears in your collection

### Test Scenario 3: Royalty Distribution
1. Check transaction record in MongoDB
2. Verify royalty amounts calculated correctly
3. Verify seller receives: price - platform fee - royalties
4. Verify platform fee: 5% of price
5. Verify royalty fee: based on event configuration

## API Client Methods

```typescript
// List ticket for resale
await apiClient.resellTicket(ticketId, price);

// Get all resale listings
await apiClient.getResaleListings();

// Purchase resale ticket
await apiClient.purchaseResaleTicket(listingId, paymentMethod);
```

## Database Models

### Listing Model
```typescript
{
  ticketId: ObjectId,
  sellerId: ObjectId,
  buyerId: ObjectId (after sold),
  eventId: ObjectId,
  ticketTypeId: ObjectId,
  price: Number,
  currency: String,
  status: 'ACTIVE' | 'SOLD' | 'CANCELLED',
  listedAt: Date,
  soldAt: Date
}
```

### Transaction Model (Resale)
```typescript
{
  buyerId: ObjectId,
  sellerId: ObjectId,
  eventId: ObjectId,
  ticketTypeId: ObjectId,
  quantity: 1,
  totalAmount: Number,
  platformFee: Number,
  royaltyAmount: Number,
  isResale: true,
  status: 'COMPLETED',
  txHash: String
}
```

## Fee Structure

### Platform Fee
- **Rate:** 5% of resale price
- **Collected by:** Platform
- **Example:** ₹5000 ticket = ₹250 platform fee

### Royalty Fee
- **Rate:** Configurable per event (typically ~10%)
- **Distribution:**
  - Organizer: 5%
  - Artist: 3%
  - Venue: 2%
- **Example:** ₹5000 ticket = ₹500 royalty fee

### Seller Receives
- **Formula:** Price - Platform Fee - Royalty Fee
- **Example:** ₹5000 - ₹250 - ₹500 = ₹4250

## Security Features

1. **Ownership Verification:** Can only resell tickets you own
2. **Status Validation:** Can only resell ACTIVE tickets
3. **Duplicate Prevention:** Cannot list already listed tickets
4. **Self-Purchase Block:** Cannot buy your own listings
5. **Authentication Required:** All resale actions require valid JWT

## Blockchain Integration

### NFT Transfer on Resale
```typescript
// Automatic transfer from seller to buyer
await transferTicket(
  sellerAddress,
  buyerAddress,
  tokenId,
  1
);
```

### Gasless Transactions
- Uses Biconomy (mock) for gasless transfers
- Buyer doesn't pay gas fees
- Platform covers transaction costs

## Error Handling

### Common Errors
- `404`: Ticket or listing not found
- `400`: Invalid price or ticket status
- `403`: Not ticket owner or trying to buy own listing
- `500`: Blockchain transfer failed

### User-Friendly Messages
- "Ticket not found"
- "Ticket is already listed for resale"
- "Cannot purchase your own listing"
- "Failed to transfer ticket"

## Next Steps

### Potential Enhancements
1. **Cancel Listing:** Allow sellers to cancel active listings
2. **Price History:** Track price changes over time
3. **Offers:** Allow buyers to make offers below asking price
4. **Notifications:** Alert sellers when their ticket sells
5. **Analytics:** Show resale market trends

## Testing Checklist

- [x] List ticket for resale
- [x] Browse resale listings
- [x] Purchase resale ticket
- [x] Royalty distribution
- [x] NFT transfer
- [x] Fee calculation
- [x] Navigation integration
- [x] UI components
- [x] Error handling
- [x] Authentication

## Status: ✅ COMPLETE

All resale marketplace features are fully implemented and tested.
