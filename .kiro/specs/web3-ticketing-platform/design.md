# Design Document - Web3 Ticketing Platform

## Overview

TicketChain is built as a Next.js full-stack application with API routes serving as the backend. The architecture separates concerns into authentication, role-based modules, blockchain integration, and real-time communication layers. The system uses MongoDB for off-chain data storage, Polygon Mumbai testnet for blockchain operations, and integrates Web3Auth for invisible wallet creation.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                       │
│  - Public pages (events, landing)                           │
│  - Role-based dashboards (buyer, organizer, etc.)           │
│  - Real-time UI updates (Socket.io client)                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Backend (Next.js API Routes)                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Auth Module  │  │ Role Modules │  │ Common Module│     │
│  │ - Web3Auth   │  │ - Buyer      │  │ - Blockchain │     │
│  │ - JWT        │  │ - Organizer  │  │ - Notifications│   │
│  └──────────────┘  │ - Promoter   │  │ - Socket.io  │     │
│                    │ - etc.       │  └──────────────┘     │
│                    └──────────────┘                         │
└─────────────────────────────────────────────────────────────┘
           │                    │                    │
           ▼                    ▼                    ▼
    ┌──────────┐        ┌──────────┐        ┌──────────┐
    │ MongoDB  │        │ Polygon  │        │  Novu    │
    │ (Local)  │        │ Mumbai   │        │ (Notif)  │
    └──────────┘        └──────────┘        └──────────┘
```

### Technology Stack

**Frontend:**
- Next.js 14 (App Router)
- React 19
- TailwindCSS
- Socket.io Client
- Web3.js / Ethers.js

**Backend:**
- Next.js API Routes
- Prisma ORM (MongoDB provider)
- JWT for authentication
- Socket.io Server

**Blockchain:**
- Polygon Mumbai Testnet
- Web3Auth (social login → smart wallets)
- Biconomy SDK (gasless transactions)
- ERC-1155 Smart Contract (tickets)
- ERC-2981 (royalty standard)

**Infrastructure:**
- Local MongoDB (Docker)
- Novu (notifications)
- Mock Transak (payment simulation)

## Components and Interfaces

### 1. Authentication Module

**Responsibilities:**
- Handle social/email/phone login via Web3Auth
- Create ERC-4337 smart wallets
- Generate and validate JWT tokens
- Manage user sessions

**API Endpoints:**
```typescript
POST /api/auth/login
  Body: { provider: 'google' | 'email' | 'phone', credential: string }
  Response: { token: string, user: User, wallet: string }

POST /api/auth/verify
  Headers: { Authorization: 'Bearer <token>' }
  Response: { valid: boolean, user: User }

POST /api/auth/logout
  Headers: { Authorization: 'Bearer <token>' }
  Response: { success: boolean }
```

### 2. Buyer Module

**Responsibilities:**
- Browse events
- Purchase tickets
- View owned tickets
- List tickets for resale
- Transfer tickets

**API Endpoints:**
```typescript
GET /api/buyer/events
  Query: { category?, city?, date?, search? }
  Response: { events: Event[] }

POST /api/buyer/purchase
  Body: { eventId: string, ticketTypeId: string, quantity: number, referralCode?: string }
  Response: { transaction: Transaction, tickets: Ticket[] }

GET /api/buyer/tickets
  Response: { tickets: Ticket[] }

POST /api/buyer/resell
  Body: { ticketId: string, price: number }
  Response: { listing: Listing }
```

### 3. Organizer Module

**Responsibilities:**
- Create and manage events
- Configure ticket types and pricing
- Set royalty splits
- View sales analytics
- Manage refunds

**API Endpoints:**
```typescript
POST /api/organizer/events
  Body: { event: EventInput, ticketTypes: TicketTypeInput[], royalties: RoyaltyInput }
  Response: { event: Event, tokenIds: number[] }

GET /api/organizer/events/:id/analytics
  Response: { sales: SalesData, revenue: RevenueData, demographics: DemographicData }

POST /api/organizer/events/:id/refund
  Body: { ticketId: string, reason: string }
  Response: { refund: Refund }
```

### 4. Promoter Module

**Responsibilities:**
- Generate referral links
- Track referral sales
- View commission earnings
- Withdraw earnings

**API Endpoints:**
```typescript
POST /api/promoter/referrals
  Body: { eventId: string }
  Response: { referralCode: string, link: string }

GET /api/promoter/earnings
  Response: { total: number, pending: number, paid: number, referrals: Referral[] }

POST /api/promoter/withdraw
  Body: { amount: number, method: 'bank' | 'upi' }
  Response: { withdrawal: Withdrawal }
```

### 5. Common Module (Blockchain Service)

**Responsibilities:**
- Interact with smart contracts
- Handle gasless transactions via Biconomy
- Mint, transfer, and burn NFTs
- Query on-chain data

**Key Functions:**
```typescript
async mintTickets(to: string, tokenId: number, quantity: number): Promise<string>
async transferTicket(from: string, to: string, tokenId: number): Promise<string>
async burnTicket(owner: string, tokenId: number): Promise<string>
async getTicketOwner(tokenId: number): Promise<string>
async verifyTicketOwnership(wallet: string, tokenId: number): Promise<boolean>
```

### 6. Notification Service

**Responsibilities:**
- Send WhatsApp messages via Novu
- Send email notifications
- Queue and retry failed notifications
- Generate ticket QR codes

**Key Functions:**
```typescript
async sendPurchaseConfirmation(user: User, tickets: Ticket[]): Promise<void>
async sendEventReminder(user: User, event: Event): Promise<void>
async sendResaleNotification(seller: User, buyer: User, ticket: Ticket): Promise<void>
```

### 7. Socket.io Service

**Responsibilities:**
- Broadcast real-time seat availability
- Handle temporary seat reservations
- Notify connected clients of updates

**Events:**
```typescript
// Client → Server
'join-event': { eventId: string }
'reserve-seats': { eventId: string, ticketTypeId: string, quantity: number }
'release-seats': { reservationId: string }

// Server → Client
'availability-update': { eventId: string, ticketTypeId: string, available: number }
'reservation-confirmed': { reservationId: string, expiresAt: Date }
'reservation-expired': { reservationId: string }
```

## Data Models

### Prisma Schema (MongoDB)

```prisma
datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum UserRole {
  BUYER
  ORGANIZER
  PROMOTER
  VENUE_OWNER
  ARTIST
  RESELLER
  INSPECTOR
  ADMIN
  GUEST
}

model User {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  email         String?  @unique
  phone         String?  @unique
  name          String
  role          UserRole @default(BUYER)
  walletAddress String   @unique
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  tickets       Ticket[]
  events        Event[]
  referrals     Referral[]
  transactions  Transaction[]
}

model Event {
  id              String   @id @default(auto()) @map("_id") @db.ObjectId
  title           String
  description     String
  category        String
  date            DateTime
  time            String
  venue           String
  city            String
  location        String
  image           String
  organizerId     String   @db.ObjectId
  organizer       User     @relation(fields: [organizerId], references: [id])
  status          String   @default("draft") // draft, published, cancelled
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  ticketTypes     TicketType[]
  tickets         Ticket[]
  royalties       Royalty?
}

model TicketType {
  id              String   @id @default(auto()) @map("_id") @db.ObjectId
  eventId         String   @db.ObjectId
  event           Event    @relation(fields: [eventId], references: [id])
  name            String   // VIP, General, Early Bird
  tokenId         Int      @unique // ERC-1155 token ID
  price           Float    // Price in INR
  totalSupply     Int
  soldCount       Int      @default(0)
  maxPerWallet    Int      @default(4)
  createdAt       DateTime @default(now())
  
  tickets         Ticket[]
}

model Ticket {
  id              String   @id @default(auto()) @map("_id") @db.ObjectId
  eventId         String   @db.ObjectId
  event           Event    @relation(fields: [eventId], references: [id])
  ticketTypeId    String   @db.ObjectId
  ticketType      TicketType @relation(fields: [ticketTypeId], references: [id])
  ownerId         String   @db.ObjectId
  owner           User     @relation(fields: [ownerId], references: [id])
  tokenId         Int      // ERC-1155 token ID
  nftTokenId      String   // Unique NFT identifier
  qrCode          String   // QR code for verification
  status          String   @default("active") // active, used, resale, transferred
  purchasePrice   Float
  isCheckedIn     Boolean  @default(false)
  checkedInAt     DateTime?
  createdAt       DateTime @default(now())
  
  listing         Listing?
  transaction     Transaction?
}

model Listing {
  id              String   @id @default(auto()) @map("_id") @db.ObjectId
  ticketId        String   @unique @db.ObjectId
  ticket          Ticket   @relation(fields: [ticketId], references: [id])
  price           Float    // Resale price in INR
  status          String   @default("active") // active, sold, cancelled
  createdAt       DateTime @default(now())
  soldAt          DateTime?
}

model Transaction {
  id              String   @id @default(auto()) @map("_id") @db.ObjectId
  userId          String   @db.ObjectId
  user            User     @relation(fields: [userId], references: [id])
  ticketId        String?  @unique @db.ObjectId
  ticket          Ticket?  @relation(fields: [ticketId], references: [id])
  type            String   // purchase, resale, refund
  amount          Float    // Amount in INR
  txHash          String?  // Blockchain transaction hash
  referralCode    String?
  status          String   @default("pending") // pending, completed, failed
  createdAt       DateTime @default(now())
  completedAt     DateTime?
}

model Royalty {
  id              String   @id @default(auto()) @map("_id") @db.ObjectId
  eventId         String   @unique @db.ObjectId
  event           Event    @relation(fields: [eventId], references: [id])
  organizerPct    Float    @default(70.0)
  artistPct       Float    @default(15.0)
  venuePct        Float    @default(10.0)
  platformPct     Float    @default(5.0)
}

model Referral {
  id              String   @id @default(auto()) @map("_id") @db.ObjectId
  promoterId      String   @db.ObjectId
  promoter        User     @relation(fields: [promoterId], references: [id])
  code            String   @unique
  eventId         String?  @db.ObjectId
  commissionPct   Float    @default(5.0)
  totalEarnings   Float    @default(0.0)
  clickCount      Int      @default(0)
  conversionCount Int      @default(0)
  createdAt       DateTime @default(now())
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Wallet Creation Uniqueness
*For any* user authentication, creating a smart wallet should result in a unique wallet address that is stored exactly once in the database and linked to that user.
**Validates: Requirements 1.1, 1.4**

### Property 2: Role Authorization Consistency
*For any* API endpoint protected by role requirements, a request with a valid JWT containing a non-matching role should always be rejected with 403 Forbidden.
**Validates: Requirements 2.2, 2.3**

### Property 3: Ticket Supply Constraint
*For any* ticket type, the total number of minted tickets should never exceed the configured totalSupply value.
**Validates: Requirements 3.3, 4.4**

### Property 4: Anti-Scalping Enforcement
*For any* wallet address and ticket type with maxPerWallet configured, the number of tickets owned by that wallet should never exceed the maximum.
**Validates: Requirements 4.5**

### Property 5: Royalty Distribution Completeness
*For any* ticket resale transaction, the sum of royalty payments to organizer, artist, venue owner, and platform should equal 100% of the sale price.
**Validates: Requirements 5.4**

### Property 6: Referral Commission Accuracy
*For any* ticket purchase made via a referral link, the promoter's commission should be calculated as the configured percentage of the sale price and credited to their account.
**Validates: Requirements 6.3, 6.4**

### Property 7: Real-Time Update Propagation
*For any* ticket purchase that changes availability, all connected Socket.io clients viewing that event should receive an availability update within 2 seconds.
**Validates: Requirements 7.2, 7.3**

### Property 8: Notification Delivery Guarantee
*For any* completed ticket purchase, the system should attempt to send WhatsApp and email notifications, retrying up to 3 times on failure.
**Validates: Requirements 8.1, 8.5**

### Property 9: Ticket Verification Idempotence
*For any* ticket that has been checked in once, subsequent verification attempts should reject entry and display the original check-in timestamp.
**Validates: Requirements 9.2**

### Property 10: Gasless Transaction Sponsorship
*For any* blockchain transaction initiated by a user, the gas fees should be sponsored by the platform paymaster, requiring zero MATIC balance from the user.
**Validates: Requirements 11.1, 11.2, 11.3**

### Property 11: Environment Configuration Isolation
*For any* deployment environment (testnet vs mainnet), the system should use the correct blockchain network, payment gateway, and database based on environment variables.
**Validates: Requirements 12.1, 12.5**

### Property 12: Token ID Uniqueness
*For any* event with multiple ticket types, each ticket type should be assigned a unique ERC-1155 token ID that is never reused.
**Validates: Requirements 3.2**

## Error Handling

### Authentication Errors
- **Web3Auth Failure:** Return 401 with message "Authentication failed, please try again"
- **Invalid JWT:** Return 401 with message "Invalid or expired token"
- **Wallet Creation Failure:** Log error, retry once, return 500 if still failing

### Authorization Errors
- **Insufficient Role:** Return 403 with message "You don't have permission to access this resource"
- **Missing Token:** Return 401 with message "Authentication required"

### Business Logic Errors
- **Sold Out:** Return 400 with message "Tickets are sold out"
- **Max Tickets Exceeded:** Return 400 with message "Maximum {max} tickets per wallet"
- **Invalid Referral Code:** Log warning, proceed without referral
- **Payment Failure:** Return 400 with message "Payment processing failed"

### Blockchain Errors
- **Minting Failure:** Retry up to 3 times, return 500 with message "Failed to mint tickets"
- **Transfer Failure:** Return 500 with message "Failed to transfer ticket"
- **Gas Sponsorship Failure:** Alert admin, return 500 with message "Transaction failed"

### Database Errors
- **Connection Failure:** Retry with exponential backoff, return 503 if unavailable
- **Duplicate Key:** Return 409 with message "Resource already exists"
- **Not Found:** Return 404 with message "Resource not found"

## Testing Strategy

### Unit Testing
- Test individual functions in isolation (JWT generation, royalty calculation, etc.)
- Mock external dependencies (Web3Auth, Biconomy, MongoDB)
- Test edge cases (zero tickets, maximum tickets, invalid inputs)
- Use Jest for test framework

### Property-Based Testing
- Use fast-check library for property-based testing
- Configure each property test to run minimum 100 iterations
- Tag each test with the property number from design document
- Test properties like wallet uniqueness, royalty distribution, anti-scalping

### Integration Testing
- Test complete user flows (signup → purchase → resale)
- Test role-based access control across all endpoints
- Test blockchain integration with testnet
- Test Socket.io real-time updates

### End-to-End Testing
- Test full user journeys in browser
- Test payment flow with mock Transak
- Test notification delivery
- Test ticket verification flow

### Testing Requirements
- Minimum 80% code coverage
- All properties must have corresponding property-based tests
- Critical paths (purchase, mint, transfer) must have integration tests
- Each property-based test must reference the design document property using format: **Feature: web3-ticketing-platform, Property {number}: {property_text}**
