# 🎯 Organizer Testing Guide

## Complete Workflow Test

### Step 1: Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Step 2: Login as Organizer

1. Go to: http://localhost:3000/login
2. Enter email: `organizer@test.com`
3. Enter name: `Test Organizer`
4. Click "Continue"
5. You'll be redirected to: `/organizer`

### Step 3: Create an Event

1. Click "Create Event" button
2. Fill in the form:

**Event Details:**
- Title: `Summer Music Festival 2025`
- Description: `Amazing outdoor music festival with top artists`
- Category: `Music`
- Image URL: (leave default or use your own)

**Location:**
- Venue: `Phoenix Marketcity`
- City: `Mumbai`
- Address: `LBS Marg, Kurla West, Mumbai, Maharashtra 400070`

**Date & Time:**
- Date: Select any future date
- Time: `18:00`

3. Click "Create Event"
4. You'll see success message and redirect to dashboard

### Step 4: Check Event Status

On organizer dashboard, you'll see:
- Event card with **"Pending"** badge (yellow)
- Event details
- Status: Waiting for admin approval

### Step 5: Login as Admin

1. Open new incognito/private window
2. Go to: http://localhost:3000/login
3. Enter email: `admin@test.com`
4. Enter name: `Admin User`
5. Click "Continue"
6. You'll be redirected to: `/admin`

### Step 6: Approve the Event

1. Click "Events" in admin navigation (or go to `/admin/events`)
2. You'll see the "Pending" tab with your event
3. Click "Approve Event" button
4. Event status changes to "Approved"

### Step 7: Check as Organizer

1. Go back to organizer window
2. Refresh the page
3. Event badge now shows **"Approved"** (green)

### Step 8: View on Homepage

1. Go to: http://localhost:3000
2. Your event now appears on the homepage!
3. Only approved events are visible to buyers

---

## Testing Rejection Flow

### Step 1: Create Another Event

As organizer, create another event:
- Title: `Test Event for Rejection`
- Fill other details
- Submit

### Step 2: Reject as Admin

1. Login as admin
2. Go to `/admin/events`
3. Click "Reject Event" button
4. Enter reason: `Event details are incomplete`
5. Click "Reject Event"

### Step 3: Check as Organizer

1. Go back to organizer dashboard
2. Event shows **"Rejected"** badge (red)
3. Rejection reason is displayed below event details

---

## Event Status Flow

```
Organizer creates event
        ↓
Status: "pending" (Yellow badge)
        ↓
Admin reviews
        ↓
    ┌───────┴───────┐
    ↓               ↓
Approve         Reject
    ↓               ↓
"approved"      "rejected"
(Green)         (Red + reason)
    ↓               ↓
Shows on        Hidden from
homepage        homepage
```

---

## API Endpoints Used

**Organizer:**
- `POST /api/organizer/events` - Create event
- `GET /api/organizer/events` - Get my events

**Admin:**
- `GET /api/admin/events?status=pending` - Get pending events
- `POST /api/admin/events/approve` - Approve/reject event

**Buyer (Public):**
- `GET /api/buyer/events` - Get approved events only

---

## Database Check

To verify in MongoDB:

```javascript
// Check event status
db.events.find({}, { title: 1, status: 1, rejectionReason: 1 })

// Count by status
db.events.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 } } }
])
```

---

## Features Working:

✅ Organizer can create events
✅ Events start with "pending" status
✅ Admin can see all events with filters
✅ Admin can approve events
✅ Admin can reject with reason
✅ Organizer sees rejection reason
✅ Only approved events show on homepage
✅ Status badges with colors
✅ Real-time updates
✅ No mock data - all from database

---

## Troubleshooting

**Event not showing on homepage?**
- Check if status is "approved"
- Check if date is in the future
- Refresh the page

**Can't create event?**
- Check if MongoDB is running
- Check backend console for errors
- Verify you're logged in as organizer

**Admin can't see events?**
- Check if you're logged in as admin
- Go to `/admin/events` directly
- Check backend API response

---

## Next Steps

After testing, you can:
1. Add more event fields (price, capacity, etc.)
2. Add event editing for organizers
3. Add email notifications
4. Add event analytics
5. Add ticket sales tracking

Everything is working dynamically now! 🎉
