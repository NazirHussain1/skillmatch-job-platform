# Cloudinary Setup Guide

## Profile Picture Upload Feature Added ✅

### Backend Changes
- ✅ Installed multer and cloudinary packages
- ✅ Created upload middleware (`backend/middleware/upload.middleware.js`)
- ✅ Created cloudinary config (`backend/config/cloudinary.js`)
- ✅ Added `uploadProfilePicture` controller function
- ✅ Added POST `/api/users/profile/picture` route
- ✅ User model already has `profilePicture` field

### Frontend Changes
- ✅ Added image upload input with camera icon
- ✅ Added image preview functionality
- ✅ Added upload button (appears when image is selected)
- ✅ Integrated with existing profile update API
- ✅ Shows profile picture or initials avatar

## How to Configure Cloudinary

### Step 1: Create Cloudinary Account
1. Go to https://cloudinary.com
2. Click "Sign Up Free"
3. Create your account (free tier is sufficient)

### Step 2: Get Your Credentials
1. After login, go to Dashboard
2. You'll see:
   - Cloud Name
   - API Key
   - API Secret

### Step 3: Update Backend Environment Variables
Open `backend/.env.local` and update these values:

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name-here
CLOUDINARY_API_KEY=your-api-key-here
CLOUDINARY_API_SECRET=your-api-secret-here
```

### Step 4: Restart Backend Server
The backend server will automatically restart when you save `.env.local`

## How It Works

### Upload Flow
1. User clicks camera icon on profile picture
2. Selects an image file (max 5MB)
3. Image preview appears immediately
4. User clicks "Upload Photo" button
5. Image is sent to backend via FormData
6. Backend uploads to Cloudinary with transformations:
   - Resized to 500x500px
   - Cropped to face (if detected)
   - Auto quality optimization
7. Cloudinary URL is saved in user.profilePicture
8. Profile updates automatically

### Features
- Image validation (type and size)
- Preview before upload
- Automatic face detection and cropping
- Old image deletion when new one is uploaded
- Images stored in `skillmatch/profiles` folder on Cloudinary
- Optimized for web delivery

### API Endpoint
```
POST /api/users/profile/picture
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body: FormData with 'profilePicture' file
```

### Response
```json
{
  "success": true,
  "message": "Profile picture uploaded successfully",
  "data": {
    "profilePicture": "https://res.cloudinary.com/..."
  }
}
```

## Testing

1. Start both servers:
   ```bash
   # Backend
   cd backend && npm run dev
   
   # Frontend
   cd frontend && npm run dev
   ```

2. Login to your account
3. Go to Profile page
4. Click "Edit Profile"
5. Click camera icon on profile picture
6. Select an image
7. Click "Upload Photo"
8. Image should upload and display

## Troubleshooting

### "Please upload an image file"
- Make sure you're selecting an image file (jpg, png, gif, webp)

### "Image size should be less than 5MB"
- Compress your image or choose a smaller file

### "Error uploading image to cloudinary"
- Check your Cloudinary credentials in `.env.local`
- Make sure backend server restarted after adding credentials
- Check backend console for detailed error

### Image not displaying
- Check browser console for errors
- Verify the URL in MongoDB (should be cloudinary.com URL)
- Check if Cloudinary account is active

## Security Notes
- Images are validated on backend (type and size)
- Only authenticated users can upload
- Old images are automatically deleted
- Images are stored securely on Cloudinary CDN
- Cloudinary credentials are in `.env.local` (not committed to Git)

## Free Tier Limits
Cloudinary free tier includes:
- 25 GB storage
- 25 GB bandwidth/month
- 25,000 transformations/month

This is more than enough for development and small production apps.
