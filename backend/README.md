# TicketChain Backend - Web3 Ticketing Platform

Production-ready Next.js backend for a Web3 ticketing platform with 9 user roles, gasless transactions, and BookMyShow-like UX.

## 🚀 Tech Stack

- **Framework:** Next.js 14 (API Routes)
- **Database:** MongoDB (Local) + Mongoose ODM
- **Blockchain:** Polygon Mumbai Testnet + ERC-1155 NFTs
- **Auth:** Web3Auth (invisible wallets) + JWT
- **Gasless:** Biconomy ERC-4337
- **Payments:** Mock Transak (testnet)
- **Notifications:** Novu (WhatsApp + Email)
- **Real-time:** Socket.io

## 📋 Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- MongoDB Community Server (local installation)
- Git

## 🛠️ Setup Instructions

### 1. Install MongoDB Locally

**Windows:**
1. Download MongoDB Community Server from https://www.mongodb.com/try/download/community
2. Run the installer (choose "Complete" installation)
3. MongoDB will start automatically as a Windows service on `localhost:27017`

**Verify MongoDB is running:**
```bash
# Open Command Prompt and run:
mongosh
# You should see MongoDB shell connect successfully
```

### 2. Clone and Install

```bash
cd backend
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:
- Web3Auth credentials
- Biconomy API key
- Novu API key
- JWT secret

### 4. Setup Database (Optional)

Make sure MongoDB is running, then:

```bash
# Seed with sample data (optional)
npm run db:seed
```

### 5. Run Development Server

```bash
npm run dev
```

Backend runs on `http://localhost:3001`

## 📁 Project Structure

```
backend/
├── app/
│   └── api/
│       ├── auth/          # Authentication endpoints
│       ├── buyer/         # Buyer role endpoints
│       ├── organizer/     # Organizer role endpoints
│       ├── promoter/      # Promoter role endpoints
│       ├── venue-owner/   # Venue owner endpoints
│       ├── artist/        # Artist endpoints
│       ├── reseller/      # Reseller endpoints
│       ├── admin/         # Admin endpoints
│       └── inspector/     # Inspector endpoints
├── lib/
│   ├── auth/             # JWT & Web3Auth utilities
│   ├── blockchain/       # Biconomy & smart contract interaction
│   ├── guards/           # RoleGuard middleware
│   ├── notifications/    # Novu integration
│   └── utils/            # Helper functions
├── lib/db/
│   ├── models/           # Mongoose models
│   ├── connection.ts     # MongoDB connection
│   └── seed.ts           # Sample data
└── __tests__/            # Property-based tests
```

## 🔑 User Roles

The platform supports 9 distinct roles:

1. **BUYER** - Purchase and resell tickets
2. **ORGANIZER** - Create and manage events
3. **PROMOTER** - Generate referral links, earn commission
4. **VENUE_OWNER** - Manage venues, receive royalties
5. **ARTIST** - Artist profiles, royalty tracking
6. **RESELLER** - Bulk ticket operations
7. **INSPECTOR** - Verify tickets at entry
8. **ADMIN** - Platform management
9. **GUEST** - Unauthenticated users

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm test -- --coverage
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/login` - Social/email/phone login
- `POST /api/auth/verify` - Verify JWT token
- `POST /api/auth/logout` - Logout

### Buyer
- `GET /api/buyer/events` - Browse events
- `POST /api/buyer/purchase` - Buy tickets
- `GET /api/buyer/tickets` - View owned tickets
- `POST /api/buyer/resell` - List ticket for resale

### Organizer
- `POST /api/organizer/events` - Create event
- `GET /api/organizer/events/:id/analytics` - View analytics
- `POST /api/organizer/events/:id/refund` - Process refund

### Promoter
- `POST /api/promoter/referrals` - Generate referral link
- `GET /api/promoter/earnings` - View earnings

*Full API documentation available at `/api/docs` (Swagger)*

## 🌐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret for JWT signing | Yes |
| `POLYGON_RPC_URL` | Polygon Mumbai RPC | Yes |
| `WEB3AUTH_CLIENT_ID` | Web3Auth client ID | Yes |
| `BICONOMY_API_KEY` | Biconomy API key | Yes |
| `NOVU_API_KEY` | Novu API key | Yes |

See `.env.example` for complete list.

## 🚢 Deployment

### Testnet (Current)
- Blockchain: Polygon Mumbai
- Payments: Mock Transak
- Free test MATIC from faucet

### Production (Future)
1. Update `.env` with mainnet values
2. Deploy smart contract to Polygon Mainnet
3. Configure real Transak payments
4. Update `POLYGON_RPC_URL` and `POLYGON_CHAIN_ID`

## 📚 Documentation

- [Requirements](./.kiro/specs/web3-ticketing-platform/requirements.md)
- [Design](./.kiro/specs/web3-ticketing-platform/design.md)
- [Tasks](./.kiro/specs/web3-ticketing-platform/tasks.md)

## 🤝 Contributing

1. Follow the task list in `tasks.md`
2. Write property-based tests for all features
3. Maintain 80%+ code coverage
4. Update API documentation

## 📄 License

MIT

## 🆘 Support

For issues or questions, check the spec documents or create an issue.

---

Built with ❤️ for the Indian Web3 ecosystem
