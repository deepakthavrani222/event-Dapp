# Implementation Plan - Web3 Ticketing Platform

- [x] 1. Project Setup and Infrastructure



  - Initialize Next.js backend project in `/backend` folder
  - Install dependencies: Prisma, Web3.js, Biconomy SDK, Socket.io, JWT, Novu
  - Create Docker Compose file for local MongoDB
  - Set up environment variables structure
  - Configure TypeScript with strict mode



  - _Requirements: 12.1, 12.2_

- [x] 2. Database Schema and Mongoose Setup
  - Create Mongoose models with TypeScript interfaces
  - Define User model with 9 role enum (BUYER, ORGANIZER, PROMOTER, VENUE_OWNER, ARTIST, RESELLER, INSPECTOR, ADMIN, GUEST)
  - Define Event, TicketType, Ticket, Listing, Transaction, Royalty, Referral models
  - Create MongoDB connection utility
  - Create database seed script with sample data
  - _Requirements: 2.1, 3.1, 3.2_

- [x] 2.1 Write property test for database schema
  - **Property 12: Token ID Uniqueness**
  - **Validates: Requirements 3.2**

- [x] 3. Authentication Module with Web3Auth
  - Create `/api/auth/login` endpoint for social/email/phone login
  - Implement deterministic wallet generation (testnet mode)
  - Implement ERC-4337 smart wallet generation
  - Generate JWT tokens with user ID, wallet address, and role
  - Create `/api/auth/verify` endpoint for token validation
  - Create `/api/auth/logout` endpoint
  - Store user and wallet data in MongoDB
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 3.1 Write property test for wallet creation
  - **Property 1: Wallet Creation Uniqueness**
  - **Validates: Requirements 1.1, 1.4**

- [x] 4. Role-Based Access Control System
  - Create authentication middleware for JWT validation
  - Implement role checking functions for endpoint protection
  - Add role verification logic against JWT claims
  - Return 401 Unauthorized for missing/invalid tokens
  - Return 403 Forbidden for insufficient permissions
  - Create helper functions for role checking
  - ADMIN role has universal access to all endpoints
  - _Requirements: 2.1, 2.2, 2.3, 2.5_

- [x] 4.1 Write property test for role authorization
  - **Property 2: Role Authorization Consistency**
  - **Validates: Requirements 2.2, 2.3**

- [x] 5. Blockchain Service with Biconomy
  - Create blockchain service class for smart contract interaction
  - Implement mock Biconomy gasless transaction layer
  - Implement mintTickets() function with ERC-1155
  - Implement mintTicketsBatch() for multiple ticket types
  - Implement transferTicket() function
  - Implement burnTicket() function for refunds
  - Implement getTicketBalance() and verifyTicketOwnership() functions
  - Configure Polygon Mumbai testnet connection
  - Create provider utilities for blockchain interaction
  - _Requirements: 11.1, 11.2, 11.3_

- [x] 5.1 Write property test for gasless transactions
  - **Property 10: Gasless Transaction Sponsorship**
  - **Validates: Requirements 11.1, 11.2, 11.3**

- [ ] 6. Smart Contract Development
  - Write ERC-1155 ticket NFT contract in Solidity
  - Add ERC-2981 royalty standard support
  - Implement batch minting for multiple tickets
  - Add access control for minting (only backend can mint)
  - Deploy contract to Polygon Mumbai testnet
  - Store contract address in environment variables
  - _Requirements: 3.2, 4.3, 5.4_

- [ ] 7. Organizer Module - Event Creation
  - Create `/api/organizer/events` POST endpoint
  - Validate event data (title, date, venue, etc.)
  - Generate unique ERC-1155 token IDs for ticket types
  - Store event and ticket types in MongoDB
  - Configure royalty splits (organizer, artist, venue, platform)
  - Return event details with token IDs
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 7.1 Write property test for token ID generation
  - **Property 12: Token ID Uniqueness**
  - **Validates: Requirements 3.2**

- [ ] 8. Buyer Module - Ticket Purchase Flow
  - Create `/api/buyer/events` GET endpoint for browsing
  - Create `/api/buyer/purchase` POST endpoint
  - Calculate total price in INR with platform fees
  - Implement mock Transak payment simulation
  - Mint ERC-1155 tickets using gasless Biconomy
  - Store ticket ownership in MongoDB
  - Enforce anti-scalping rules (max tickets per wallet)
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 8.1 Write property test for ticket supply constraint
  - **Property 3: Ticket Supply Constraint**
  - **Validates: Requirements 3.3, 4.4**

- [ ] 8.2 Write property test for anti-scalping
  - **Property 4: Anti-Scalping Enforcement**
  - **Validates: Requirements 4.5**

- [ ] 9. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Resale Marketplace Module
  - Create `/api/buyer/resell` POST endpoint for listing tickets
  - Create `/api/buyer/listings` GET endpoint for browsing resale tickets
  - Implement ticket transfer with gasless transactions
  - Calculate and distribute royalties on resale
  - Update ticket ownership in MongoDB
  - Prevent original owner from using listed tickets
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 10.1 Write property test for royalty distribution
  - **Property 5: Royalty Distribution Completeness**
  - **Validates: Requirements 5.4**

- [ ] 11. Promoter Referral System
  - Create `/api/promoter/referrals` POST endpoint
  - Generate unique referral codes
  - Track referral usage in ticket purchases
  - Calculate promoter commission (5% default)
  - Credit commission to promoter account
  - Apply commission on both primary and secondary sales
  - Create `/api/promoter/earnings` GET endpoint
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 11.1 Write property test for referral commission
  - **Property 6: Referral Commission Accuracy**
  - **Validates: Requirements 6.3, 6.4**

- [ ] 12. Real-Time Seat Availability with Socket.io
  - Set up Socket.io server in Next.js API route
  - Implement 'join-event' event handler
  - Implement 'reserve-seats' with 10-minute expiration
  - Broadcast 'availability-update' on purchases
  - Handle reservation expiration and release
  - Update UI within 2 seconds of changes
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 12.1 Write property test for real-time updates
  - **Property 7: Real-Time Update Propagation**
  - **Validates: Requirements 7.2, 7.3**

- [ ] 13. Notification System with Novu
  - Integrate Novu SDK for WhatsApp and email
  - Create notification service class
  - Implement sendPurchaseConfirmation() with ticket QR code
  - Implement sendEventReminder() for 24-hour alerts
  - Implement sendResaleNotification() for buyers and sellers
  - Add retry logic (up to 3 attempts) for failed notifications
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 13.1 Write property test for notification delivery
  - **Property 8: Notification Delivery Guarantee**
  - **Validates: Requirements 8.1, 8.5**

- [ ] 14. Inspector Module - Ticket Verification
  - Create `/api/inspector/verify` POST endpoint
  - Verify NFT ownership on-chain
  - Check if ticket has been used (isCheckedIn)
  - Mark ticket as checked-in on first scan
  - Reject duplicate scans with timestamp
  - Complete verification within 3 seconds
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 14.1 Write property test for ticket verification
  - **Property 9: Ticket Verification Idempotence**
  - **Validates: Requirements 9.2**

- [ ] 15. Admin Module - Platform Management
  - Create `/api/admin/dashboard` GET endpoint with metrics
  - Create `/api/admin/events/approve` POST endpoint
  - Create `/api/admin/users` GET and PATCH endpoints
  - Implement role assignment functionality
  - Create `/api/admin/refunds` POST endpoint for dispute resolution
  - Add platform fee configuration
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 16. Additional Role Modules
  - Create venue-owner module with venue management endpoints
  - Create artist module with profile and royalty tracking
  - Create reseller module with bulk ticket operations
  - Implement role-specific dashboards and analytics
  - _Requirements: 2.1_

- [ ] 17. Environment Configuration and Deployment Prep
  - Create .env.example with all required variables
  - Document testnet vs mainnet configuration
  - Add environment validation on startup
  - Create README with setup instructions
  - Add Docker Compose commands to README
  - _Requirements: 12.1, 12.5_

- [ ] 17.1 Write property test for environment isolation
  - **Property 11: Environment Configuration Isolation**
  - **Validates: Requirements 12.1, 12.5**

- [ ] 18. API Documentation with Swagger
  - Install and configure Swagger/OpenAPI
  - Document all API endpoints with request/response schemas
  - Add authentication requirements to docs
  - Include example requests and responses
  - Host Swagger UI at `/api/docs`
  - _Requirements: All modules_

- [ ] 19. Error Handling and Logging
  - Implement global error handler middleware
  - Add specific error messages for auth, authorization, business logic
  - Implement retry logic for blockchain operations
  - Add structured logging for debugging
  - Create error response standardization
  - _Requirements: All modules_

- [ ] 20. Final Checkpoint - Integration Testing
  - Test complete user flow: signup → purchase → resale
  - Test all role-based access controls
  - Test blockchain integration on Mumbai testnet
  - Test Socket.io real-time updates
  - Test notification delivery
  - Verify all property-based tests pass
  - Ensure all tests pass, ask the user if questions arise.
