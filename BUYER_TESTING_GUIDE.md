# 🧪 Buyer Functionality Testing Guide

## 🚀 **Servers Running**
- **Frontend**: http://localhost:3002
- **Backend**: http://localhost:3001

---

## 📋 **Test Flow - Complete Buyer Journey**

### **Phase 1: Browse as Guest (No Login Required)**

1. **Open Homepage**
   - Go to: `http://localhost:3002`
   - ✅ Should see beautiful event grid
   - ✅ Can browse, search, filter without signing up
   - ✅ City selector, category filters working

2. **Browse Events**
   - Click on any event card
   - ✅ Should see full event details page
   - ✅ Ticket types with prices visible
   - ✅ Quantity selector working
   - ✅ "Buy Tickets" button visible

---

### **Phase 2: Buy Tickets (45-90 seconds)**

1. **Select Tickets**
   - On event page, select ticket quantity (max 6 per person)
   - ✅ Quantity selector enforces anti-scalping limit
   - ✅ Price updates in real-time
   - ✅ "Your Selection" cart appears

2. **Click "Buy Tickets"**
   - If not logged in, Guest Buying Flow opens
   - ✅ Should see auth options (Email/Phone/Google)

3. **Quick Sign-In**
   - Enter email: `buyer@example.com`
   - Enter name: `Test Buyer`
   - Click "Send OTP"
   - Enter any 6-digit OTP (e.g., `123456`)
   - ✅ Should move to payment step

4. **Payment Screen**
   - ✅ Should see transparent pricing breakdown:
     - Ticket Price
     - Convenience Fee (14%)
     - Platform Security Fee (6% - Non-refundable)
     - Total
   - ✅ Payment options: UPI, Card, Wallet, Apple Pay, Google Pay
   - Select any payment method

5. **Complete Payment**
   - Click "Pay Now ₹X,XXX"
   - ✅ Processing screen with status updates
   - ✅ "TICKETS SECURED!" with confetti 🎉
   - ✅ Multi-channel confirmation (Email, WhatsApp, Push)

---

### **Phase 3: My Tickets Hub**

1. **Access My Tickets**
   - After login, click "My Tickets" in header
   - Or go to: `http://localhost:3002/my-tickets`
   - ✅ Should see 4 tabs: Upcoming, Past, Resale, Wallet

2. **View Upcoming Tickets**
   - ✅ Beautiful cards with event banners
   - ✅ Countdown timers ("2 days, 5 hours")
   - ✅ Seat numbers displayed
   - ✅ Action buttons: Show QR, Gift, Resell, PDF

3. **Test One-Tap Actions**

   **a) Show QR (Entry Screen)**
   - Click "Show QR" on any ticket
   - ✅ Full-screen entry mode opens
   - ✅ HUGE QR code displayed
   - ✅ "Show to Staff" message
   - ✅ Event details visible
   - Click "Demo: Simulate Scan"
   - ✅ Bright green "WELCOME!" screen
   - ✅ Phone vibrates (if supported)

   **b) Gift/Transfer**
   - Click "Gift" on any ticket
   - ✅ Gift dialog opens
   - Enter friend's email/phone
   - ✅ Confirmation screen
   - ✅ Success message

   **c) Resell**
   - Click "Resell" on any ticket
   - ✅ Pricing suggestions (Quick Sale, Market, Premium)
   - ✅ Price slider working
   - ✅ Fee breakdown (5% platform fee)
   - ✅ "Listed Successfully!" confirmation

   **d) Download PDF**
   - Click "PDF" button
   - ✅ Should trigger download (mock)

4. **Wallet Tab**
   - Click "Wallet" tab
   - ✅ Balance displayed
   - ✅ "Withdraw to Bank" button
   - ✅ Transaction history

---

### **Phase 4: Day of Event (Entry)**

1. **Open Entry Screen**
   - Go to My Tickets → Click "Show QR"
   - ✅ Full-screen black background
   - ✅ HUGE QR code with glowing border
   - ✅ Event details visible
   - ✅ Seat number shown
   - ✅ "Show to Staff" message

2. **Simulate Scan**
   - Click "Demo: Simulate Scan"
   - ✅ Phone vibrates
   - ✅ Screen turns BRIGHT GREEN
   - ✅ "WELCOME!" in huge text
   - ✅ Your name with sparkles ✨
   - ✅ "Blockchain Verified" badge
   - ✅ Auto-dismisses after 4 seconds

---

## 🔗 **Quick Test URLs**

| Page | URL |
|------|-----|
| Homepage | http://localhost:3002 |
| Login | http://localhost:3002/login |
| Buyer Dashboard | http://localhost:3002/buyer |
| My Tickets | http://localhost:3002/my-tickets |
| Inspector | http://localhost:3002/inspector |

---

## 🧪 **Test Accounts**

### **Buyer Account (Default)**
- Email: `buyer@example.com` or any email
- Name: Any name
- Role: Automatically assigned as BUYER

### **Other Roles (for testing)**
- Admin: `admin@ticketchain.com`
- Organizer: `organizer@tikr.web3`
- Inspector: `inspector@tikr.web3`

---

## ✅ **Expected Results Checklist**

### **Phase 1: Browse**
- [ ] Homepage loads with events
- [ ] Can browse without login
- [ ] Event details page works
- [ ] Filters and search work

### **Phase 2: Buy**
- [ ] Quantity selector works (max 6)
- [ ] Guest buying flow opens
- [ ] OTP verification works
- [ ] Payment screen shows breakdown
- [ ] "TICKETS SECURED!" with confetti

### **Phase 3: My Tickets**
- [ ] My Tickets link in header
- [ ] 4 tabs visible
- [ ] Ticket cards with banners
- [ ] Countdown timers work
- [ ] Show QR opens entry screen
- [ ] Gift dialog works
- [ ] Resell dialog works

### **Phase 4: Entry**
- [ ] Full-screen QR display
- [ ] "Show to Staff" message
- [ ] Simulate scan works
- [ ] Green "WELCOME!" screen
- [ ] Vibration feedback

---

## 🐛 **Troubleshooting**

### **If events don't load:**
- Check backend is running on port 3001
- Check browser console for errors
- Try refreshing the page

### **If login fails:**
- Use any email format (e.g., `test@test.com`)
- Enter any 6-digit OTP
- Check console for errors

### **If My Tickets is empty:**
- This is expected for new accounts
- Mock data should show sample tickets
- Complete a purchase to see real tickets

---

## 🎉 **Success Criteria**

The buyer functionality is working correctly if:

1. ✅ Can browse events without login
2. ✅ Can complete ticket purchase in < 90 seconds
3. ✅ Transparent pricing breakdown visible
4. ✅ "TICKETS SECURED!" celebration appears
5. ✅ My Tickets hub accessible from header
6. ✅ All one-tap actions work (QR, Gift, Resell, PDF)
7. ✅ Entry screen shows huge QR
8. ✅ Green "WELCOME!" screen on scan

**Happy Testing! 🚀**