# Profile Testing Guide

## ⚠️ CRITICAL: Cloudinary Setup Required First!

**Before testing ANY file uploads (profile pictures, company logos, resumes), you MUST configure Cloudinary:**

### Step-by-Step Cloudinary Setup:

1. **Sign up for Cloudinary** (free account):
   - Go to https://cloudinary.com
   - Click "Sign Up" and create a free account
   - Verify your email

2. **Get your credentials**:
   - Login to Cloudinary Dashboard
   - You'll see your credentials on the dashboard:
     - Cloud Name
     - API Key
     - API Secret

3. **Update backend/.env.local**:
   ```env
   CLOUDINARY_CLOUD_NAME=your-actual-cloud-name
   CLOUDINARY_API_KEY=your-actual-api-key
   CLOUDINARY_API_SECRET=your-actual-api-secret
   ```
   Replace the placeholder values with your actual credentials from step 2.

4. **Restart backend server**:
   - Stop the backend server (if running)
   - Run `npm run dev` in the backend folder again

**⚠️ Without Cloudinary configured, ALL file uploads will fail!**

---

## ✅ Profile Features - Complete Testing Checklist

### Job Seeker Profile Features

#### 1. Basic Profile Information
- [ ] **View Profile**: Navigate to Profile page
- [ ] **Edit Mode**: Click "Edit Profile" button
- [ ] **Update Name**: Change name and save
- [ ] **Update Email**: Change email and save
- [ ] **Update Location**: Add/change location
- [ ] **Update Bio**: Add/change bio text
- [ ] **Cancel Changes**: Click cancel to revert changes

#### 2. Profile Picture Upload
- [ ] **View Current Picture**: See existing profile picture or initials
- [ ] **Select New Picture**: Click camera icon, choose image
- [ ] **Preview Image**: See preview before upload
- [ ] **Upload Picture**: Click "Upload Photo" button
- [ ] **Verify Upload**: Check if picture updates successfully
- [ ] **File Size Validation**: Try uploading >5MB file (should fail)
- [ ] **File Type Validation**: Try uploading non-image file (should fail)

#### 3. Skills Management
- [ ] **View Skills**: See list of current skills
- [ ] **Add Skill**: Type skill name and click + button
- [ ] **Add Skill (Enter Key)**: Type skill and press Enter
- [ ] **Remove Skill**: Click X on skill tag
- [ ] **Duplicate Prevention**: Try adding same skill twice (should prevent)
- [ ] **Empty State**: View when no skills added

#### 4. Experience Management
- [ ] **View Experience**: See list of work experience
- [ ] **Add Experience**: Click "Add Experience" button
- [ ] **Fill Experience Details**:
  - Job Title
  - Company Name
  - Location
  - Start Date
  - End Date
  - Current Job checkbox
  - Description
- [ ] **Current Job**: Check "Currently working here" (disables end date)
- [ ] **Edit Experience**: Modify existing experience
- [ ] **Remove Experience**: Click trash icon to delete
- [ ] **Empty State**: View when no experience added

#### 5. Education Management
- [ ] **View Education**: See list of education
- [ ] **Add Education**: Click "Add Education" button
- [ ] **Fill Education Details**:
  - School/University
  - Degree
  - Field of Study
  - Start Date
  - End Date
  - Currently studying checkbox
  - Description
- [ ] **Current Education**: Check "Currently studying here"
- [ ] **Edit Education**: Modify existing education
- [ ] **Remove Education**: Click trash icon to delete
- [ ] **Empty State**: View when no education added

#### 6. Resume Upload
- [ ] **View Current Resume**: See "Current Resume" section if exists
- [ ] **View Resume Link**: Click "View Resume" to open in new tab
- [ ] **Select Resume File**: Click "Choose File" button
- [ ] **See File Name**: Verify selected file name appears
- [ ] **Upload Resume**: Click "Upload" button
- [ ] **Verify Upload**: Check success message
- [ ] **File Size Validation**: Try uploading >10MB file (should fail)
- [ ] **File Type Validation**: Try uploading non-PDF/DOC/DOCX (should fail)
- [ ] **Supported Formats**: Test PDF, DOC, DOCX uploads

---

### Employer Profile Features

#### 1. Basic Profile Information
- [ ] **View Profile**: Navigate to Profile page
- [ ] **Edit Mode**: Click "Edit Profile" button
- [ ] **Update Name**: Change name and save
- [ ] **Update Email**: Change email and save
- [ ] **Update Location**: Add/change location
- [ ] **Update Bio**: Add/change bio text

#### 2. Profile Picture Upload
- [ ] **View Current Picture**: See existing profile picture or initials
- [ ] **Select New Picture**: Click camera icon, choose image
- [ ] **Preview Image**: See preview before upload
- [ ] **Upload Picture**: Click "Upload Photo" button
- [ ] **Verify Upload**: Check if picture updates successfully

#### 3. Company Information Section
- [ ] **View Company Section**: See "Company Information" card
- [ ] **Company Logo**:
  - [ ] View current logo or placeholder
  - [ ] Click "Choose Logo" button
  - [ ] Select logo image
  - [ ] See preview
  - [ ] Click "Upload Logo"
  - [ ] Verify upload success
- [ ] **Company Name**:
  - [ ] View current company name
  - [ ] Edit company name
  - [ ] Save changes
- [ ] **Company Website**:
  - [ ] View current website
  - [ ] Edit website URL
  - [ ] Click website link (opens in new tab)
  - [ ] Save changes
- [ ] **Company Description**:
  - [ ] View current description
  - [ ] Edit description (textarea)
  - [ ] Save changes

#### 4. Skills, Experience, Education
- [ ] Same as Job Seeker (all features available)

---

### Common Features (Both Roles)

#### 1. Save Functionality
- [ ] **Save Button**: Click "Save Changes" button
- [ ] **Loading State**: See "Saving..." text during save
- [ ] **Success Message**: See "Profile updated successfully" toast
- [ ] **Error Handling**: See error message if save fails
- [ ] **Profile Refresh**: Data persists after page refresh

#### 2. Cancel Functionality
- [ ] **Cancel Button**: Click "Cancel" button
- [ ] **Revert Changes**: All changes reverted to original values
- [ ] **Exit Edit Mode**: Returns to view mode

#### 3. Validation
- [ ] **Required Fields**: Name and email are required
- [ ] **Email Format**: Valid email format required
- [ ] **URL Format**: Valid URL for company website
- [ ] **Date Validation**: Valid dates for experience/education

#### 4. Responsive Design
- [ ] **Desktop View**: Test on desktop (>1024px)
- [ ] **Tablet View**: Test on tablet (768px-1024px)
- [ ] **Mobile View**: Test on mobile (<768px)
- [ ] **Form Layout**: All fields accessible on mobile
- [ ] **Buttons**: All buttons clickable on mobile

---

## Testing Scenarios

### Scenario 1: New Job Seeker Profile Setup
1. Register as job seeker
2. Navigate to Profile
3. Click "Edit Profile"
4. Upload profile picture
5. Fill in basic info (name, location, bio)
6. Add 3-5 skills
7. Add 1-2 work experiences
8. Add 1-2 education entries
9. Upload resume (PDF)
10. Click "Save Changes"
11. Verify all data saved correctly
12. Refresh page and verify data persists

### Scenario 2: New Employer Profile Setup
1. Register as employer
2. Navigate to Profile
3. Click "Edit Profile"
4. Upload profile picture
5. Fill in basic info (name, location, bio)
6. Upload company logo
7. Fill company information:
   - Company name
   - Company website
   - Company description
8. Add skills
9. Click "Save Changes"
10. Verify all data saved correctly
11. Refresh page and verify data persists

### Scenario 3: Update Existing Profile
1. Login with existing account
2. Navigate to Profile
3. Click "Edit Profile"
4. Modify several fields
5. Click "Cancel" - verify changes reverted
6. Click "Edit Profile" again
7. Modify fields again
8. Click "Save Changes"
9. Verify updates saved
10. Refresh and verify persistence

### Scenario 4: File Upload Testing
1. **Profile Picture**:
   - Upload valid image (JPG, PNG)
   - Try uploading >5MB image (should fail)
   - Try uploading non-image file (should fail)
   
2. **Company Logo** (Employer):
   - Upload valid logo
   - Try uploading >5MB image (should fail)
   - Try uploading non-image file (should fail)

3. **Resume** (Job Seeker):
   - Upload PDF resume
   - Upload DOC resume
   - Upload DOCX resume
   - Try uploading >10MB file (should fail)
   - Try uploading image file (should fail)

### Scenario 5: Experience/Education Management
1. Click "Edit Profile"
2. Click "Add Experience"
3. Fill all fields
4. Check "Currently working here"
5. Verify end date disabled
6. Uncheck "Currently working here"
7. Verify end date enabled
8. Add another experience
9. Remove first experience
10. Save changes
11. Repeat for Education section

---

## Expected Behavior

### Success Cases
✅ Profile updates save successfully
✅ Toast notification shows "Profile updated successfully"
✅ Changes persist after page refresh
✅ Images upload to Cloudinary
✅ Resume uploads successfully
✅ Skills can be added/removed
✅ Experience/Education can be added/edited/removed
✅ Cancel button reverts all changes
✅ Form validation works correctly

### Error Cases
❌ File size exceeds limit → Error toast
❌ Invalid file type → Error toast
❌ Network error → Error toast with message
❌ Invalid email format → Validation error
❌ Invalid URL format → Validation error
❌ Required fields empty → Cannot save

---

## API Endpoints Used

### Profile Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile

### File Uploads
- `POST /api/users/profile/picture` - Upload profile picture
- `POST /api/users/profile/company-logo` - Upload company logo (employer)
- `POST /api/users/profile/resume` - Upload resume (job seeker)

---

## Troubleshooting

### Issue: Profile not updating
**Solution**: 
1. Check browser console for errors
2. Check backend logs
3. Verify API endpoints are working
4. Check Redux state in Redux DevTools

### Issue: Image upload fails
**Solution**:
1. Verify Cloudinary credentials in `.env.local`
2. Check file size (<5MB for images)
3. Check file type (must be image)
4. Check backend logs for Cloudinary errors

### Issue: Resume upload fails
**Solution**:
1. Verify Cloudinary credentials
2. Check file size (<10MB)
3. Check file type (PDF, DOC, DOCX only)
4. Check backend logs

### Issue: Changes not persisting
**Solution**:
1. Check if "Save Changes" button was clicked
2. Check for error messages
3. Verify MongoDB connection
4. Check backend logs for save errors

---

## Browser Console Commands

### Check Redux State
```javascript
// In browser console
window.store.getState().user
```

### Check Auth State
```javascript
window.store.getState().auth
```

### Check Profile Data
```javascript
window.store.getState().user.profile
```

---

## Test Data Examples

### Job Seeker Profile
```
Name: John Doe
Email: john@example.com
Location: New York, NY
Bio: Experienced software developer with 5 years in web development

Skills: JavaScript, React, Node.js, MongoDB, Express

Experience:
- Title: Senior Developer
  Company: Tech Corp
  Location: New York, NY
  From: 2020-01-01
  To: Present
  Current: Yes
  Description: Leading frontend development team

Education:
- School: MIT
  Degree: Bachelor of Science
  Field: Computer Science
  From: 2015-09-01
  To: 2019-05-31
  Description: Graduated with honors
```

### Employer Profile
```
Name: Jane Smith
Email: jane@company.com
Location: San Francisco, CA
Bio: HR Manager at TechStart Inc.

Company Name: TechStart Inc.
Company Website: https://www.techstart.com
Company Description: Leading technology startup focused on AI solutions

Skills: Recruitment, HR Management, Team Building
```

---

**Testing Complete! ✅**

All profile features should work correctly for both Job Seekers and Employers.
