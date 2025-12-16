# Ticket Auction System - Complete Implementation

## Overview

A comprehensive auction system for NFT tickets with ETH bidding, anti-sniping protection, and automatic royalty distribution.

## Features Implemented

### 1. Core Auction Mechanics ✅
- **Starting Bid**: Seller sets minimum opening bid
- **Reserve Price**: Optional hidden minimum threshold
- **Bid Increment**: Minimum amount each new bid must exceed current
- **Auction Duration**: 1 hour to 7 days (configurable)
- **Anti-Sniping**: +10 minute extension on bids in last 10 minutes

### 2. Seller Features ✅
- Create auction from "My Tickets" page
- Set starting bid, reserve price, duration, increment
- Preview fees and royalties before confirming
- Ticket NFT locked during auction (escrow)
- Cancel auction (only before any bids)

### 3. Bidder Features ✅
- Dedicated auctions page (`/auction`)
- Live auction detail page with countdown
- Place bids with ETH via MetaMask
- Real-time bid updates
- Quick bid buttons (+0.01, +0.05, +0.1 ETH)
- View bid history (anonymized)

### 4. Notifications ✅
- "You've been outbid!" alerts
- "Auction ending soon" notifications
- "You won!" celebration
- Seller notifications for new bids
- Auction completion notifications

### 5. Security & Fairness ✅
- Max 4 active bids per wallet
- Price cap (150% of original by default, configurable up to 300%)
- Anti-sniping protection
- Event-level auction enable/disable (Organizer controls)
- Auto-cancel if event cancelled

### 8. Organizer Controls ✅
- **Enable/Disable Auctions**: Organizer decides if auctions are allowed for their event
- **Price Cap Setting**: Set maximum auction price (100-300% of original)
- **Artist Wallet**: Optional artist wallet for royalty distribution
- **Toggle from Dashboard**: Quick enable/disable from event management page
- **Settings in Event Creation**: Configure auction settings when creating event

### 6. Royalty Distribution ✅
- Platform fee: 7.5%
- Organizer royalty: 5% (configurable)
- Artist royalty: 10% (configurable)
- Automatic distribution on settlement

### 7. Admin Controls ✅
- Admin auction monitoring dashboard
- View all auctions and stats
- Emergency cancel capability
- Analytics (volume, bids, etc.)

## File Structure

```
backend/
├── contracts/
│   ├── TicketAuction.sol          # Smart contract for on-chain auctions
│   └── deploy-auction.js          # Deployment script
├── lib/
│   ├── blockchain/
│   │   └── auction.ts             # Blockchain interaction service
│   ├── db/models/
│   │   ├── Auction.ts             # Auction database model
│   │   └── Bid.ts                 # Bid database model
│   └── services/
│       └── notification.ts        # Auction notification helpers
├── app/api/
│   ├── buyer/
│   │   ├── auctions/
│   │   │   ├── route.ts           # GET/POST auctions
│   │   │   └── [auctionId]/
│   │   │       ├── route.ts       # GET/DELETE auction
│   │   │       ├── bid/route.ts   # POST bid
│   │   │       └── settle/route.ts # POST settle
│   │   └── my-auctions/route.ts   # User's auctions & bids
│   ├── admin/auctions/route.ts    # Admin monitoring
│   └── cron/settle-auctions/route.ts # Auto-settle cron
└── vercel.json                    # Cron configuration

frontend/
├── components/auction/
│   ├── AuctionCard.tsx            # Auction listing card
│   ├── BidForm.tsx                # Place bid form
│   ├── CreateAuctionForm.tsx      # Create auction form
│   ├── AuctionDialog.tsx          # Modal wrapper
│   └── index.ts                   # Exports
├── app/
│   ├── auction/
│   │   ├── page.tsx               # Auctions listing
│   │   └── [auctionId]/page.tsx   # Auction detail
│   ├── my-tickets/auctions/page.tsx # My auctions dashboard
│   └── organizer/
│       ├── create/page.tsx        # Event creation with auction settings
│       └── events/[id]/page.tsx   # Event management with auction toggle
```

## API Endpoints

### Public/Buyer APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/buyer/auctions` | List auctions (with filters) |
| POST | `/api/buyer/auctions` | Create new auction |
| GET | `/api/buyer/auctions/[id]` | Get auction details |
| DELETE | `/api/buyer/auctions/[id]` | Cancel auction |
| POST | `/api/buyer/auctions/[id]/bid` | Place bid |
| GET | `/api/buyer/auctions/[id]/bid` | Get user's bids |
| POST | `/api/buyer/auctions/[id]/settle` | Settle ended auction |
| GET | `/api/buyer/my-auctions` | User's auctions & bids |

### Admin APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/auctions` | All auctions with stats |

### Cron APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/cron/settle-auctions` | Auto-settle ended auctions |

## Smart Contract

### TicketAuction.sol

Key functions:
- `createAuction()` - Create new auction with NFT escrow
- `placeBid()` - Place ETH bid with anti-sniping
- `settleAuction()` - Settle and distribute funds
- `cancelAuction()` - Cancel before bids
- `emergencyCancel()` - Admin emergency cancel

### Deployment

```bash
cd backend
npx hardhat run contracts/deploy-auction.js --network sepolia
```

## Database Models

### Auction
```typescript
{
  ticketId: ObjectId,
  sellerId: ObjectId,
  eventId: ObjectId,
  startingBidEth: number,
  reservePriceEth: number,
  bidIncrementEth: number,
  currentBidEth: number,
  currentBidderId: ObjectId,
  endTime: Date,
  status: 'pending' | 'active' | 'ended' | 'settled' | 'cancelled',
  // ... royalty settings, stats
}
```

### Bid
```typescript
{
  auctionId: ObjectId,
  bidderId: ObjectId,
  bidderWallet: string,
  amountEth: number,
  status: 'active' | 'outbid' | 'won' | 'refunded',
  txHash: string,
  causedExtension: boolean,
}
```

## Configuration

### Who Controls Auction Permission?

**Organizer** decides whether auctions are allowed for their event:

1. **During Event Creation** (`/organizer/create`):
   - In Step 2 (Web3 Options), toggle "Allow Auctions"
   - Set max auction price cap (100-300%)
   - Optionally add artist wallet for royalties

2. **After Event Creation** (`/organizer/events/[id]`):
   - Go to "Manage" tab
   - Find "Auction Settings" card
   - Click Enable/Disable button

3. **Default Behavior**:
   - Auctions are **disabled by default** for new events
   - Organizer must explicitly enable them
   - If disabled, buyers see "Auctions are not enabled for this event" error

### Event-Level Settings

Organizers can configure per-event:
- `auctionsEnabled`: Enable/disable auctions (default: false)
- `maxAuctionPriceCapPercent`: Max bid as % of original (default 150%, range 100-300%)
- `organizerRoyaltyPercent`: Organizer's cut (basis points, default 500 = 5%)
- `artistRoyaltyPercent`: Artist's cut (basis points, default 1000 = 10%)
- `artistWallet`: Optional wallet address for artist royalties

### Environment Variables

```env
AUCTION_CONTRACT_ADDRESS=0x...
CRON_SECRET=your-secret
PLATFORM_WALLET_ADDRESS=0x...
```

## Usage Flow

### Seller Flow
1. Go to "My Tickets"
2. Click "Auction" on a ticket
3. Set starting bid, reserve (optional), duration
4. Confirm → Ticket locked in escrow
5. Monitor bids in "My Auctions"
6. Auction auto-settles when ended

### Bidder Flow
1. Browse `/auction` page
2. Click on auction → Detail page
3. Connect MetaMask wallet
4. Enter bid amount → Confirm in MetaMask
5. ETH sent to escrow
6. If outbid → Auto-refund
7. If won → Ticket transferred to wallet

## Testing

### Manual Testing
1. Create auction via API or UI
2. Place bids from different accounts
3. Wait for auction to end
4. Call settle endpoint or wait for cron
5. Verify ticket transfer and fund distribution

### API Testing
```bash
# Create auction
curl -X POST http://localhost:3001/api/buyer/auctions \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ticketId": "...", "startingBidEth": 0.01, "durationHours": 1}'

# Place bid
curl -X POST http://localhost:3001/api/buyer/auctions/AUCTION_ID/bid \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amountEth": 0.02, "walletAddress": "0x..."}'

# Settle auction
curl -X POST http://localhost:3001/api/buyer/auctions/AUCTION_ID/settle
```

## Future Enhancements

- [ ] WebSocket real-time bid updates
- [ ] Promoter commission on auction wins
- [ ] Batch auctions (multiple tickets)
- [ ] Dutch auctions (descending price)
- [ ] Buy-it-now option
- [ ] Auction analytics dashboard
- [ ] Mobile push notifications

## Security Considerations

1. **Escrow**: NFT and bids held in smart contract
2. **Anti-Sniping**: Prevents last-second bid manipulation
3. **Price Caps**: Prevents excessive scalping
4. **Wallet Limits**: Max 4 active bids per wallet
5. **Reserve Price**: Hidden to prevent bid manipulation
6. **Cron Secret**: Protects settlement endpoint
