# TicketChain - Next-Generation Web3 Ticketing Platform

A premium, production-ready Web3 ticketing platform for events in India that combines the speed and UX of BookMyShow with the blockchain security of District.io.

## Features

### 🎭 Multi-Role System
- **Guest**: Browse events without login
- **Buyer**: Purchase tickets, view 3D NFT tickets, resell/gift
- **Organizer**: Create events, track sales, manage royalties
- **Promoter**: Generate referral links, earn commissions
- **Venue Owner**: Manage venues and bookings
- **Artist**: Launch golden passes, message fans
- **Reseller**: Bulk purchase with profit calculator
- **Admin**: Platform management and event approvals
- **Inspector**: QR code ticket verification

### 🚀 Key Capabilities
- **3D NFT Tickets**: Rotatable ticket cards using React Three Fiber
- **Blockchain Secured**: All tickets verified on-chain (Web3 hidden from users)
- **Real-time Analytics**: Live sales graphs and earnings tracking
- **Bulk Purchase**: Wholesale pricing for resellers with ROI calculator
- **PWA Ready**: Works offline with service worker
- **Mobile-First**: Optimized for mobile with responsive design
- **Dark Mode**: Premium dark theme with neon purple/teal gradients

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **3D Graphics**: React Three Fiber
- **Animations**: Framer Motion
- **State**: Zustand
- **Icons**: Lucide React
- **Charts**: Recharts
- **QR Codes**: react-qr-code

## Project Structure

\`\`\`
app/
├── (public)/              # Public pages (homepage, events)
├── buyer/                 # Buyer dashboard and tickets
├── organizer/             # Event creation and management
├── promoter/              # Referral links and earnings
├── venue-owner/           # Venue management
├── artist/                # Artist profile and golden pass
├── reseller/              # Bulk purchase interface
├── admin/                 # Platform administration
└── inspector/             # QR code scanner

components/
├── ui/                    # shadcn/ui components
└── shared/                # Reusable components
    ├── event-card.tsx
    ├── ticket-3d-card.tsx
    ├── fee-breakdown-modal.tsx
    ├── dashboard-header.tsx
    └── protected-route.tsx

hooks/
└── use-role.ts            # Role management hook

lib/
└── mock-data.ts           # Mock events and tickets data
\`\`\`

## Getting Started

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Run development server:
\`\`\`bash
npm run dev
\`\`\`

3. Open [http://localhost:3000](http://localhost:3000)

## Role Switching

Use the role switcher in the header to test different user experiences:
- Switch between 9 different roles
- Each role has unique dashboards and capabilities
- Mock authentication system (replace with real auth in production)

## PWA Installation

The app can be installed as a Progressive Web App:
1. Open the site in Chrome/Edge
2. Click the install icon in the address bar
3. App will work offline with cached content

## Production Deployment

This app is optimized for Vercel deployment:
- Automatic optimized builds
- Edge functions ready
- Environment variables supported
- PWA manifest included

## License

MIT License - Built with v0.app
\`\`\`

```json file="" isHidden
