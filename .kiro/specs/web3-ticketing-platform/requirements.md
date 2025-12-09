# Requirements Document - Web3 Ticketing Platform

## Introduction

TicketChain is a Web3-powered event ticketing platform for the Indian market that provides a BookMyShow-like user experience with blockchain technology running invisibly in the background. The platform supports NFT-based tickets with features like resale, auctions, referrals, and gasless transactions, while maintaining a familiar fiat-based interface for end users.

## Glossary

- **System**: The TicketChain Web3 ticketing platform
- **User**: Any person interacting with the platform
- **Ticket NFT**: An ERC-1155 token representing event admission
- **Smart Wallet**: An ERC-4337 account abstraction wallet created automatically for users
- **Gasless Transaction**: Blockchain transaction where gas fees are sponsored by the platform
- **Testnet**: Polygon Mumbai test network for development
- **Mainnet**: Polygon production network for live deployment
- **Royalty Split**: Automatic distribution of revenue to stakeholders
- **Anti-Scalping**: Mechanisms to prevent ticket hoarding and price manipulation

## Requirements

### Requirement 1: User Authentication and Wallet Management

**User Story:** As a user, I want to sign in using my Google account, email, or phone number, so that I can access the platform without dealing with crypto wallets or seed phrases.

#### Acceptance Criteria

1. WHEN a user initiates login with Google, email, or phone THEN the System SHALL authenticate via Web3Auth and create an ERC-4337 smart wallet invisibly
2. WHEN authentication succeeds THEN the System SHALL generate a JWT token containing user ID, wallet address, and assigned role
3. WHEN a user logs in for the first time THEN the System SHALL assign the BUYER role by default
4. WHEN a user's wallet is created THEN the System SHALL store the wallet address in MongoDB linked to the user profile
5. WHEN a user accesses protected endpoints THEN the System SHALL validate the JWT token and verify role permissions

### Requirement 2: Role-Based Access Control

**User Story:** As a platform administrator, I want different user types to have specific permissions, so that organizers can create events, buyers can purchase tickets, and other roles can perform their designated functions.

#### Acceptance Criteria

1. THE System SHALL support exactly nine user roles: BUYER, ORGANIZER, PROMOTER, VENUE_OWNER, ARTIST, RESELLER, INSPECTOR, ADMIN, GUEST
2. WHEN a user attempts to access a role-protected endpoint THEN the System SHALL verify the user's role matches the required role
3. WHEN role verification fails THEN the System SHALL return a 403 Forbidden error
4. WHEN an ADMIN assigns a new role to a user THEN the System SHALL update the user's role in MongoDB and require re-authentication
5. THE System SHALL implement a RoleGuard that checks JWT claims against endpoint role requirements

### Requirement 3: Event Creation and Management

**User Story:** As an organizer, I want to create events with multiple ticket types and pricing tiers, so that I can sell tickets to my events.

#### Acceptance Criteria

1. WHEN an ORGANIZER creates an event THEN the System SHALL store event details including title, description, date, venue, and ticket types in MongoDB
2. WHEN an event is created THEN the System SHALL generate unique ERC-1155 token IDs for each ticket type
3. WHEN ticket types are defined THEN the System SHALL support properties including price in INR, total supply, max per wallet, and royalty percentages
4. WHEN an event includes multiple stakeholders THEN the System SHALL configure royalty splits for organizer, artist, venue owner, and platform
5. WHEN an event is published THEN the System SHALL make it visible to BUYER role users for purchase

### Requirement 4: Ticket Purchase and Minting

**User Story:** As a buyer, I want to purchase event tickets using UPI or credit card, so that I can attend events without needing cryptocurrency.

#### Acceptance Criteria

1. WHEN a BUYER selects tickets and initiates purchase THEN the System SHALL calculate total price in INR including platform fees
2. WHEN payment is processed THEN the System SHALL simulate Transak payment gateway for testnet or process real payment for mainnet
3. WHEN payment succeeds THEN the System SHALL mint ERC-1155 ticket NFTs to the buyer's smart wallet using gasless transactions via Biconomy
4. WHEN minting completes THEN the System SHALL store ticket ownership records in MongoDB and emit a purchase confirmation
5. WHEN anti-scalping rules are configured THEN the System SHALL enforce maximum tickets per wallet before allowing purchase

### Requirement 5: Ticket Resale Marketplace

**User Story:** As a buyer, I want to resell my tickets if I cannot attend an event, so that I can recover my costs and allow others to attend.

#### Acceptance Criteria

1. WHEN a BUYER lists a ticket for resale THEN the System SHALL create a marketplace listing with asking price in INR
2. WHEN a ticket is resold THEN the System SHALL transfer the NFT from seller to buyer using gasless transactions
3. WHEN a resale completes THEN the System SHALL distribute payment according to royalty splits configured for the event
4. WHEN royalties are calculated THEN the System SHALL ensure organizer, artist, venue owner, and platform receive their configured percentages
5. WHEN a ticket is listed for resale THEN the System SHALL prevent the original owner from using it until delisted or sold

### Requirement 6: Promoter Referral System

**User Story:** As a promoter, I want to share referral links for events and earn commission on sales, so that I can monetize my audience and marketing efforts.

#### Acceptance Criteria

1. WHEN a PROMOTER generates a referral link THEN the System SHALL create a unique tracking code linked to the promoter's account
2. WHEN a user purchases tickets via a referral link THEN the System SHALL record the promoter ID in the transaction
3. WHEN a referred purchase completes THEN the System SHALL calculate promoter commission as a percentage of the sale price
4. WHEN commission is earned THEN the System SHALL credit the promoter's account balance in MongoDB
5. WHEN a referred ticket is resold THEN the System SHALL pay the promoter commission on the secondary sale as well

### Requirement 7: Real-Time Seat Availability

**User Story:** As a buyer, I want to see live updates of available seats when browsing events, so that I know which tickets are still available without refreshing the page.

#### Acceptance Criteria

1. WHEN a BUYER views an event page THEN the System SHALL establish a Socket.io connection for real-time updates
2. WHEN any user purchases tickets THEN the System SHALL broadcast availability updates to all connected clients viewing that event
3. WHEN seat availability changes THEN the System SHALL update the UI within 2 seconds without page refresh
4. WHEN a user holds tickets in cart THEN the System SHALL temporarily reserve those tickets for 10 minutes
5. WHEN reservation expires THEN the System SHALL release tickets and broadcast availability update

### Requirement 8: Notification System

**User Story:** As a user, I want to receive WhatsApp and email notifications for important events like ticket purchases and event reminders, so that I stay informed about my bookings.

#### Acceptance Criteria

1. WHEN a ticket purchase completes THEN the System SHALL send WhatsApp and email notifications via Novu containing ticket details and QR code
2. WHEN an event is 24 hours away THEN the System SHALL send reminder notifications to all ticket holders
3. WHEN a ticket is resold THEN the System SHALL notify both seller and buyer of the successful transaction
4. WHEN a refund is processed THEN the System SHALL send confirmation notification to the user
5. WHEN notifications fail to send THEN the System SHALL log the error and retry up to 3 times

### Requirement 9: Ticket Verification

**User Story:** As an inspector, I want to scan ticket QR codes at event entry, so that I can verify authenticity and prevent duplicate entry.

#### Acceptance Criteria

1. WHEN an INSPECTOR scans a ticket QR code THEN the System SHALL verify the NFT ownership on-chain
2. WHEN a ticket is valid and unused THEN the System SHALL mark it as checked-in and allow entry
3. WHEN a ticket has already been used THEN the System SHALL reject entry and display previous check-in timestamp
4. WHEN a ticket is invalid or transferred THEN the System SHALL reject entry and display current owner
5. WHEN verification occurs THEN the System SHALL complete the check within 3 seconds to avoid entry delays

### Requirement 10: Admin Platform Management

**User Story:** As an admin, I want to manage users, approve events, and monitor platform activity, so that I can ensure platform quality and handle disputes.

#### Acceptance Criteria

1. WHEN an ADMIN views the dashboard THEN the System SHALL display metrics including total users, events, tickets sold, and revenue
2. WHEN an ADMIN reviews pending events THEN the System SHALL allow approval or rejection with reason
3. WHEN an ADMIN manages users THEN the System SHALL allow role assignment, account suspension, and activity review
4. WHEN disputes arise THEN the System SHALL provide tools to review transaction history and issue refunds
5. WHEN platform fees are configured THEN the System SHALL allow ADMIN to set percentage fees for primary and secondary sales

### Requirement 11: Gasless Transaction Infrastructure

**User Story:** As a user, I want all blockchain transactions to be free, so that I don't need to worry about gas fees or holding cryptocurrency.

#### Acceptance Criteria

1. WHEN any blockchain transaction is initiated THEN the System SHALL use Biconomy ERC-4337 paymaster to sponsor gas fees
2. WHEN minting tickets THEN the System SHALL execute gasless minting without requiring user to hold MATIC
3. WHEN transferring tickets THEN the System SHALL execute gasless transfers for resale and gifting
4. WHEN gas sponsorship fails THEN the System SHALL log the error and notify administrators
5. WHEN transactions are processed THEN the System SHALL maintain transaction records in MongoDB for auditing

### Requirement 12: Local Development and Testing

**User Story:** As a developer, I want to run the entire platform locally with test data, so that I can develop and test features without real money or mainnet deployment.

#### Acceptance Criteria

1. WHEN the development environment starts THEN the System SHALL use Polygon Mumbai testnet for all blockchain operations
2. WHEN MongoDB is required THEN the System SHALL connect to local MongoDB instance via Docker Compose
3. WHEN payments are simulated THEN the System SHALL use mock Transak integration that doesn't process real money
4. WHEN testing gasless transactions THEN the System SHALL use Biconomy testnet paymaster with free test MATIC
5. WHEN switching to production THEN the System SHALL support environment variable configuration for mainnet deployment
