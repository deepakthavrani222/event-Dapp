# Windows Setup Guide - TicketChain Backend

## Step 1: Install MongoDB (One-time setup)

1. **Download MongoDB:**
   - Go to https://www.mongodb.com/try/download/community
   - Select "Windows" platform
   - Download the MSI installer

2. **Install MongoDB:**
   - Run the downloaded `.msi` file
   - Choose "Complete" installation
   - Check "Install MongoDB as a Service" (recommended)
   - MongoDB will automatically start on `localhost:27017`

3. **Verify Installation:**
   ```bash
   # Open Command Prompt or PowerShell
   mongosh
   ```
   You should see MongoDB shell connect successfully. Type `exit` to quit.

## Step 2: Install Project Dependencies

```bash
cd backend
npm install
```

## Step 3: Configure Environment

```bash
# Copy the example env file
copy .env.example .env
```

Edit `.env` file and update:
- `DATABASE_URL` should be: `mongodb://localhost:27017/ticketchain`
- Add your API keys (Web3Auth, Biconomy, Novu) when ready
- For now, you can use the default values for local testing

## Step 4: Setup Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema to MongoDB
npm run prisma:push

# Seed with sample data (optional)
npm run prisma:seed
```

## Step 5: Run Development Server

```bash
npm run dev
```

Backend will run on: http://localhost:3001

## Troubleshooting

### MongoDB Not Running?

**Check if MongoDB service is running:**
```bash
# Open Services (Win + R, type "services.msc")
# Look for "MongoDB" service
# Right-click → Start if it's stopped
```

**Or start manually:**
```bash
# Open Command Prompt as Administrator
net start MongoDB
```

### Port 27017 Already in Use?

```bash
# Find what's using the port
netstat -ano | findstr :27017

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Can't Connect to MongoDB?

Make sure:
1. MongoDB service is running (check Services)
2. `DATABASE_URL` in `.env` is correct: `mongodb://localhost:27017/ticketchain`
3. No firewall blocking port 27017

## Quick Commands

```bash
# Start development server
npm run dev

# Run tests
npm test

# Generate Prisma Client (after schema changes)
npm run prisma:generate

# Push schema changes to DB
npm run prisma:push

# View database in Prisma Studio
npx prisma studio
```

## Next Steps

Once the backend is running:
1. Visit http://localhost:3001 to see the API homepage
2. Check http://localhost:3001/api/health for health status
3. API documentation will be at http://localhost:3001/api/docs (after Task 18)

---

Need help? Check the main README.md or the spec documents in `.kiro/specs/`
