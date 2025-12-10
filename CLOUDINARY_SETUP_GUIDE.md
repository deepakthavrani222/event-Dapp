# 🖼️ Cloudinary Integration Setup Guide

## What's Added:

### ✅ Backend Integration:
1. **Cloudinary Configuration** (`backend/lib/cloudinary/config.ts`)
2. **Image Upload API** (`backend/app/api/upload/image/route.ts`)
3. **Updated Event Model** with `imagePublicId` field
4. **Updated Organizer API** to handle image uploads

### ✅ Frontend Integration:
1. **ImageUpload Component** (`frontend/components/ui/image-upload.tsx`)
2. **Updated API Client** with upload methods
3. **Enhanced Create Event Form** with drag-and-drop image upload

---

## Setup Instructions:

### Step 1: Create Cloudinary Account

1. Go to: https://cloudinary.com/users/register/free
2. Sign up for a free account
3. Verify your email
4. Go to Dashboard

### Step 2: Get Your Credentials

From your Cloudinary Dashboard, copy:
- **Cloud Name**
- **API Key** 
- **API Secret**

### Step 3: Update Environment Variables

Update your `backend/.env` file:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME="your_actual_cloud_name"
CLOUDINARY_API_KEY="your_actual_api_key"
CLOUDINARY_API_SECRET="your_actual_api_secret"
```

**Replace the placeholder values with your actual Cloudinary credentials!**

### Step 4: Restart Backend

```bash
cd backend
npm run dev
```

---

## Features:

### 🎯 Image Upload Component:
- **Drag & Drop** support
- **Click to upload** functionality
- **File validation** (JPEG, PNG, WebP only)
- **Size limit** (10MB max)
- **Loading states** with progress
- **Preview** with remove option
- **Error handling** with user feedback

### 🔧 Backend API:
- **POST /api/upload/image** - Upload images
- **DELETE /api/upload/image** - Delete images
- **Automatic optimization** (resize, compress, format conversion)
- **Organized folders** (events, avatars, tickets)
- **Security validation** (file type, size, auth)

### 📁 Folder Structure:
```
ticketchain/
├── events/     # Event images
├── avatars/    # User profile pictures
└── tickets/    # Ticket templates
```

### 🎨 Image Transformations:
- **Event images**: 1200x800px, optimized quality
- **Avatars**: 400x400px, circular crop
- **Tickets**: 600x400px, optimized for display

---

## Usage:

### In Create Event Form:
1. Click the upload area or drag an image
2. Image uploads to Cloudinary automatically
3. Preview shows with remove option
4. URL and public ID saved to database

### API Usage:
```typescript
// Upload image
const response = await apiClient.uploadImage(file, 'event');

// Delete image
await apiClient.deleteImage(publicId);
```

---

## Testing:

### 1. Test Image Upload:
1. Go to `/organizer/create`
2. Try uploading an image (drag & drop or click)
3. Should see upload progress and preview
4. Check Cloudinary dashboard for uploaded image

### 2. Test Different File Types:
- ✅ JPEG/JPG files
- ✅ PNG files  
- ✅ WebP files
- ❌ GIF, SVG, PDF (should be rejected)

### 3. Test File Size Limits:
- ✅ Files under 10MB
- ❌ Files over 10MB (should show error)

---

## Benefits:

### 🚀 Performance:
- **CDN delivery** worldwide
- **Automatic optimization** (WebP, AVIF)
- **Responsive images** for different devices
- **Lazy loading** support

### 💾 Storage:
- **Cloud storage** (no server disk usage)
- **Automatic backups**
- **Version control** for images
- **Transformation caching**

### 🔒 Security:
- **Secure uploads** with authentication
- **File type validation**
- **Size limits** to prevent abuse
- **Public ID management** for deletion

---

## Free Tier Limits:

Cloudinary free tier includes:
- **25 GB** storage
- **25 GB** monthly bandwidth
- **1,000** transformations/month
- **Basic** image optimization

Perfect for development and small applications!

---

## Troubleshooting:

### Upload fails with "Invalid credentials":
- Check your Cloudinary credentials in `.env`
- Make sure you copied them correctly from dashboard
- Restart the backend server

### "File too large" error:
- Current limit is 10MB
- Reduce image size or compress before upload
- Adjust limit in `backend/app/api/upload/image/route.ts`

### Images not showing:
- Check if image URL is valid
- Verify Cloudinary account is active
- Check browser console for errors

---

## Next Steps:

1. **Set up your Cloudinary account**
2. **Add credentials to `.env`**
3. **Restart backend**
4. **Test image upload in create event form**
5. **Create your first event with a real image!**

All image handling is now professional-grade with Cloudinary! 🎉