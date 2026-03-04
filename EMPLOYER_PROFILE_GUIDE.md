# Employer Profile Features

## Overview

Employers now have dedicated company information fields in their profiles, allowing them to showcase their company to potential candidates.

## Features Added ✅

### Backend Changes
- ✅ Added employer-specific fields to User model:
  - `companyName` - Company name
  - `companyWebsite` - Company website URL
  - `companyDescription` - About the company
  - `companyLogo` - Company logo image URL
- ✅ Updated `updateProfile` endpoint to handle employer fields
- ✅ Created `uploadCompanyLogo` endpoint (employer-only)
- ✅ Added route `POST /api/users/profile/company-logo`
- ✅ Logo stored in Cloudinary folder: `skillmatch/company-logos`
- ✅ Logo optimized: 400x400px, auto quality

### Frontend Changes
- ✅ Added employer company information section to Profile page
- ✅ Company logo upload with preview
- ✅ Company name input field
- ✅ Company website input field (with clickable link)
- ✅ Company description textarea
- ✅ Only visible for employer role
- ✅ Edit/view modes for all fields
- ✅ Upload button for logo

## User Model Schema

### Employer Fields

```javascript
{
  // ... existing fields
  companyName: {
    type: String,
    default: ''
  },
  companyWebsite: {
    type: String,
    default: ''
  },
  companyDescription: {
    type: String,
    default: ''
  },
  companyLogo: {
    type: String,
    default: ''
  }
}
```

## API Endpoints

### PUT /api/users/profile

**Request (Employer):**
```json
{
  "name": "John Doe",
  "email": "john@company.com",
  "bio": "HR Manager",
  "location": "New York",
  "companyName": "Tech Corp",
  "companyWebsite": "https://techcorp.com",
  "companyDescription": "Leading technology company..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@company.com",
    "role": "employer",
    "companyName": "Tech Corp",
    "companyWebsite": "https://techcorp.com",
    "companyDescription": "Leading technology company...",
    "companyLogo": "https://res.cloudinary.com/..."
  }
}
```

### POST /api/users/profile/company-logo

**Authorization:** Bearer token (employer only)

**Request:**
- Content-Type: multipart/form-data
- Body: FormData with 'companyLogo' file

**Response (Success):**
```json
{
  "success": true,
  "message": "Company logo uploaded successfully",
  "data": {
    "companyLogo": "https://res.cloudinary.com/..."
  }
}
```

**Response (Error - Not Employer):**
```json
{
  "success": false,
  "message": "Only employers can upload company logos",
  "statusCode": 403
}
```

## Frontend Profile Page

### Employer Section

The company information section appears only for users with `role: 'employer'`.

**Fields:**
1. **Company Logo**
   - Image upload with preview
   - Default: Briefcase icon
   - Size: 24x24 display, 400x400 stored
   - Upload button appears when file selected

2. **Company Name**
   - Text input
   - Placeholder: "Your Company Name"
   - View mode: Shows name or "Not specified"

3. **Company Website**
   - URL input
   - Placeholder: "https://www.example.com"
   - View mode: Clickable link or "Not specified"

4. **Company Description**
   - Textarea (4 rows)
   - Placeholder: "Tell us about your company..."
   - View mode: Shows description or "No description added yet."

### Edit Mode

When employer clicks "Edit Profile":
- All fields become editable
- Logo upload button appears
- Can change all company information
- Save/Cancel buttons at top

### View Mode

When not editing:
- Company logo displayed (or default icon)
- Company name shown
- Website shown as clickable link
- Description shown as text
- Clean, professional layout

## Logo Upload Flow

1. **Select Logo**
   - Click "Choose Logo" button
   - Select image file (max 5MB)
   - Preview appears immediately

2. **Upload Logo**
   - Click "Upload Logo" button
   - Shows "Uploading..." state
   - Uploads to Cloudinary
   - Updates profile automatically
   - Shows success toast

3. **Logo Processing**
   - Uploaded to `skillmatch/company-logos` folder
   - Resized to 400x400px (fit, not crop)
   - Auto quality optimization
   - Old logo deleted from Cloudinary

## Validation

### Company Website
- Must be valid URL format
- Should start with http:// or https://
- Frontend validates on input
- Backend accepts any string (flexible)

### Company Logo
- File type: Images only (jpg, png, gif, webp)
- Max size: 5MB
- Validated on frontend and backend
- Cloudinary handles format conversion

### Company Name
- No specific validation
- Can be any string
- Recommended: Official company name

### Company Description
- No length limit
- Can include line breaks
- Recommended: 2-3 paragraphs

## Use Cases

### 1. New Employer Registration
1. Register as employer
2. Verify email
3. Login
4. Go to Profile
5. Click "Edit Profile"
6. Fill company information
7. Upload company logo
8. Save changes

### 2. Update Company Info
1. Login as employer
2. Go to Profile
3. Click "Edit Profile"
4. Update any field
5. Save changes

### 3. Change Company Logo
1. Login as employer
2. Go to Profile
3. Click "Edit Profile"
4. Click "Choose Logo"
5. Select new image
6. Click "Upload Logo"
7. Logo updates immediately

## Display in Job Listings

Company information can be used to enhance job listings:
- Show company logo next to job
- Display company name
- Link to company website
- Show company description

**Note:** This requires updating the Job model and listings page (future enhancement).

## Security

### Authorization
- Only employers can upload company logos
- Checked in backend middleware
- Returns 403 if non-employer tries

### File Validation
- Type checking (images only)
- Size limit (5MB)
- Cloudinary handles security

### Data Privacy
- Company info visible to all users
- No sensitive data stored
- Website URLs validated

## Testing

### Manual Testing Steps

1. **Test as Employer**
   - Register/login as employer
   - Go to profile
   - Verify company section visible
   - Edit and save company info
   - Upload company logo
   - Verify all fields save correctly

2. **Test as Jobseeker**
   - Register/login as jobseeker
   - Go to profile
   - Verify company section NOT visible
   - Verify no access to logo upload

3. **Test Logo Upload**
   - Select valid image
   - Verify preview works
   - Upload logo
   - Verify success message
   - Refresh page
   - Verify logo persists

4. **Test Validation**
   - Try uploading non-image file
   - Try uploading >5MB file
   - Verify error messages
   - Try invalid website URL
   - Verify validation works

### Test Cases

- ✅ Employer can see company section
- ✅ Jobseeker cannot see company section
- ✅ Employer can edit company info
- ✅ Employer can upload logo
- ✅ Logo preview works
- ✅ Logo upload saves to Cloudinary
- ✅ Old logo deleted on new upload
- ✅ Company website shows as link
- ✅ All fields save correctly
- ✅ Non-employer cannot upload logo
- ✅ File validation works
- ✅ Size validation works

## Future Enhancements

Potential improvements:
- [ ] Show company info in job listings
- [ ] Add company size field
- [ ] Add industry/category field
- [ ] Add founded year field
- [ ] Add company social media links
- [ ] Create dedicated company profile page
- [ ] Allow multiple company images/gallery
- [ ] Add company verification badge
- [ ] Show company stats (jobs posted, applications)
- [ ] Add company reviews/ratings
- [ ] Create company search/directory
- [ ] Add company followers feature

## Troubleshooting

### Company Section Not Showing
- Check user role is 'employer'
- Refresh page
- Check browser console for errors

### Logo Upload Fails
- Check file size (<5MB)
- Check file type (image)
- Verify Cloudinary credentials
- Check backend logs

### Logo Not Displaying
- Check Cloudinary URL is valid
- Verify image uploaded successfully
- Check browser network tab
- Try different image format

### Website Link Not Working
- Ensure URL includes http:// or https://
- Check URL is valid
- Verify link opens in new tab

## Configuration

Required in `backend/.env.local`:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Database Migration

Existing users will have empty employer fields by default:
- `companyName: ''`
- `companyWebsite: ''`
- `companyDescription: ''`
- `companyLogo: ''`

No migration script needed - fields are optional.

## Best Practices

### For Employers
1. Use high-quality company logo
2. Provide complete company information
3. Keep website URL up to date
4. Write clear, professional description
5. Update info when company changes

### For Developers
1. Validate file uploads
2. Optimize images before upload
3. Delete old images from Cloudinary
4. Handle errors gracefully
5. Show loading states
6. Provide helpful error messages

## Support

If employers have issues:
1. Check role is set to 'employer'
2. Verify email is verified
3. Try different browser
4. Clear browser cache
5. Check file size and type
6. Contact support with details
