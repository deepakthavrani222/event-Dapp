# 🚀 Quick Start Guide - Web3 Ticketing Platform

## Prerequisites
- Node.js 18+
- MongoDB Community Server 7.0+
- Git

---

## Installation

### 1. Start MongoDB
```bash
# Windows
net start MongoDB

# Mac/Linux
sudo systemctl start mongod
```

### 2. Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend (new terminal)
cd frontend
npm install
```

### 3. Configure Environment
```bash
# Backend
cd backend
cp .env.example .env
# Edit .env if needed (defaults work for local)

# Frontend
cd frontend
# .env.local already configured
```

### 4. Seed Database (Optional)
```bash
cd backend
npm run db:seed
```

---

## Running the Platform

### Start Both Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# ✓ Backend running on http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# ✓ Frontend running on http://localhost:3000
```

---

## Quick Test Flow

### 1. Create Accounts

Visit `http://localhost:3000/login` and create accounts:

```
buyer@test.com - Buyer
organizer@test.com - Organizer
promoter@test.com - Promoter
inspector@test.com - Inspector
admin@test.com - Admin
```

### 2. Assign Roles

```bash
cd backend

node lib/db/update-role.js buyer@test.com BUYER
node lib/db/update-role.js organizer@test.com ORGANIZER
node lib/db/update-role.js promoter@test.com PROMOTER
node lib/db/update-role.js inspector@test.com INSPECTOR
node lib/db/update-role.js admin@test.com ADMIN
```

### 3. Test Complete Flow

#### As Organizer:
1. Login with `organizer@test.com`
2. Go to `/organizer/create`
3. Create an event with ticket types
4. Note: Event needs admin approval

#### As Admin:
1. Login with `admin@test.com`
2. Go to `/admin`
3. Approve the pending event

#### As Promoter:
1. Login with `promoter@test.com`
2. Go to `/promoter`
3. Click "Create Referral Code"
4. Copy the generated code

#### As Buyer:
1. Login with `buyer@test.com`
2. Browse events at `/buyer`
3. Click on an event
4. Purchase tickets (enter referral code)
5. View tickets at `/buyer/tickets`
6. Click "Resell" to list on marketplace
7. Browse resale at `/buyer/resale`

#### As Inspector:
1. Login with `inspector@test.com`
2. Go to `/inspector`
3. Click "Start Scanning"
4. Use manual entry with ticket QR data
5. Verify ticket check-in
6. View history at `/inspector/history`

---

## API Testing

### Health Check
```bash
curl http://localhost:3001/api/health
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"buyer@test.com","name":"Test Buyer"}'
```

### Get Events
```bash
curl http://localhost:3001/api/buyer/events
```

---

## Running Tests

```bash
cd backend
npm test

# Expected output:
# Test Suites: 6 passed, 6 total
# Tests:       33 passed, 33 total
```

---

## Common Commands

### Database
```bash
# Seed database
npm run db:seed

# Update user role
node lib/db/update-role.js <email> <ROLE>

# Update to admin
node lib/db/update-admin.js <email>
```

### Development
```bash
# Backend dev server
npm run dev

# Frontend dev server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

---

## Troubleshooting

### MongoDB Connection Error
```bash
# Check if MongoDB is running
mongosh

# If not, start it:
# Windows: net start MongoDB
# Mac/Linux: sudo systemctl start mongod
```

### Port Already in Use
```bash
# Backend (3001)
# Kill process on port 3001
# Windows: netstat -ano | findstr :3001
# Mac/Linux: lsof -ti:3001 | xargs kill

# Frontend (3000)
# Kill process on port 3000
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

---

## URLs Reference

### Frontend
- **Home:** http://localhost:3000
- **Login:** http://localhost:3000/login
- **Buyer Dashboard:** http://localhost:3000/buyer
- **My Tickets:** http://localhost:3000/buyer/tickets
- **Resale Market:** http://localhost:3000/buyer/resale
- **Organizer Dashboard:** http://localhost:3000/organizer
- **Create Event:** http://localhost:3000/organizer/create
- **Promoter Dashboard:** http://localhost:3000/promoter
- **Inspector Scanner:** http://localhost:3000/inspector
- **Inspector History:** http://localhost:3000/inspector/history
- **Admin Dashboard:** http://localhost:3000/admin

### Backend API
- **Health:** http://localhost:3001/api/health
- **Login:** POST http://localhost:3001/api/auth/login
- **Events:** GET http://localhost:3001/api/buyer/events
- **Purchase:** POST http://localhost:3001/api/buyer/purchase

---

## User Roles

| Role | Access |
|------|--------|
| **BUYER** | Browse events, purchase tickets, resell tickets |
| **ORGANIZER** | Create events, manage events, view analytics |
| **PROMOTER** | Create referral codes, track earnings |
| **INSPECTOR** | Verify tickets, check-in attendees |
| **ADMIN** | Full platform access, approve events, manage users |
| **VENUE_OWNER** | Manage venues (future) |
| **ARTIST** | Manage profile, royalties (future) |
| **RESELLER** | Bulk operations (future) |
| **GUEST** | View only (default) |

---

## Features Checklist

### ✅ Working Features
- [x] User authentication (email-based)
- [x] Wallet generation
- [x] Role-based access control
- [x] Event creation
- [x] Ticket purchasing
- [x] NFT minting (mock)
- [x] QR code generation
- [x] Resale marketplace
- [x] Royalty distribution
- [x] Referral system
- [x] Ticket verification
- [x] Admin panel
- [x] Multiple dashboards

### ⏳ Optional Features
- [ ] Real-time seat updates (Socket.io)
- [ ] WhatsApp/Email notifications (Novu)
- [ ] Smart contract deployment
- [ ] Additional role dashboards

---

## Support

### Documentation
- `README.md` - Project overview
- `SETUP_WINDOWS.md` - Windows setup guide
- `TEST_*.md` - Testing guides
- `*_COMPLETE.md` - Feature documentation
- `FINAL_STATUS.md` - Current status

### Testing
- Run `npm test` in backend
- Check `__tests__/` directory
- View test coverage reports

---

## Next Steps

1. ✅ Test all user flows
2. ✅ Verify all features work
3. ⏳ Add real-time features (optional)
4. ⏳ Deploy smart contract (optional)
5. ⏳ Add notifications (optional)
6. ⏳ Deploy to production

---

**Happy Testing! 🎉**

For issues or questions, check the documentation files or review the code comments.
