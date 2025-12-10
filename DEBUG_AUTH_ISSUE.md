# 🔍 Debug Authentication Issue

## Step 1: Check if you're logged in

Open browser console (F12) and run:

```javascript
// Check if token exists
console.log('Token:', localStorage.getItem('token'));

// Check if user data exists
console.log('User logged in:', !!localStorage.getItem('token'));
```

## Step 2: Check network requests

1. Open DevTools (F12)
2. Go to Network tab
3. Try uploading an image
4. Look for the `/api/upload/image` request
5. Check the **Request Headers** - should have `Authorization: Bearer <token>`

## Step 3: Manual test

If no token, try logging in again:

1. **Logout** (clear localStorage or incognito window)
2. **Login as organizer**: `organizer@test.com`
3. **Check console** for token after login
4. **Try upload again**

## Step 4: Test API directly

In browser console, test the upload API:

```javascript
// Get token
const token = localStorage.getItem('token');
console.log('Token exists:', !!token);

// Test upload endpoint
fetch('/api/upload/image', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: new FormData() // Empty form data for test
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

## Expected Results:

- **If logged in**: Should see token in localStorage
- **If token exists**: Should see Authorization header in network request
- **If API works**: Should get different error (like "No file provided" instead of "No token provided")

Let me know what you see in each step!