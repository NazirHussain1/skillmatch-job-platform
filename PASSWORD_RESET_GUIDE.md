# Password Reset Functionality

## Features Added ✅

### Backend Changes
- ✅ Added `resetPasswordToken` and `resetPasswordExpire` fields to User model
- ✅ Created `getResetPasswordToken()` method in User model
- ✅ Installed nodemailer for sending emails
- ✅ Created `sendEmail` utility function
- ✅ Added `POST /api/auth/forgot-password` endpoint
- ✅ Added `POST /api/auth/reset-password/:token` endpoint
- ✅ Token expires in 10 minutes
- ✅ Secure token hashing using SHA256

### Frontend Changes
- ✅ Created Forgot Password page
- ✅ Created Reset Password page
- ✅ Added "Forgot password?" link to Login page
- ✅ Added routes for password reset pages
- ✅ Auto-login after successful password reset
- ✅ Success/error toast notifications
- ✅ Loading states and validation

## User Flow

### 1. Forgot Password
1. User clicks "Forgot password?" on login page
2. Enters email address
3. Clicks "Send Reset Link"
4. Receives confirmation message
5. Checks email for reset link

### 2. Reset Password
1. User clicks link in email
2. Redirected to reset password page
3. Enters new password (min 6 characters)
4. Confirms password
5. Clicks "Reset Password"
6. Auto-logged in and redirected to dashboard

## API Endpoints

### POST /api/auth/forgot-password

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Password reset email sent",
  "data": {
    "email": "user@example.com"
  }
}
```

**Response (Error - User Not Found):**
```json
{
  "success": false,
  "message": "No user found with this email",
  "statusCode": 404
}
```

### POST /api/auth/reset-password/:token

**Request:**
```json
{
  "password": "newpassword123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Password reset successful",
  "data": {
    "_id": "...",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "jobseeker",
    "token": "jwt-token-here"
  }
}
```

**Response (Error - Invalid/Expired Token):**
```json
{
  "success": false,
  "message": "Invalid or expired reset token",
  "statusCode": 400
}
```

## Email Configuration

### Using Gmail

1. **Enable 2-Factor Authentication**
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Create App Password**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the generated 16-character password

3. **Update .env.local**
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password
EMAIL_FROM=noreply@skillmatch.com
EMAIL_FROM_NAME=SkillMatch
FRONTEND_URL=http://localhost:3000
```

### Using Other Email Services

#### SendGrid
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
```

#### Mailgun
```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=your-mailgun-username
EMAIL_PASS=your-mailgun-password
```

#### Outlook/Hotmail
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
```

## Email Template

The reset email includes:
- Personalized greeting with user's name
- Clear call-to-action button
- Plain text link as fallback
- Expiration notice (10 minutes)
- Professional styling
- Security notice

Example:
```
Hi John,

You requested to reset your password. Click the button below to reset it:

[Reset Password Button]

Or copy and paste this link:
http://localhost:3000/reset-password/abc123...

This link will expire in 10 minutes.

If you didn't request this, please ignore this email.
```

## Security Features

### Token Generation
- Uses crypto.randomBytes(20) for random token
- Token is hashed with SHA256 before storing
- Only hashed version stored in database
- Original token sent in email

### Token Validation
- Token must match hashed version in database
- Token must not be expired (10 minutes)
- Token is deleted after successful reset
- One-time use only

### Password Security
- Minimum 6 characters required
- Password is hashed with bcrypt before saving
- Old password is overwritten
- User is auto-logged in with new password

## Frontend Pages

### Forgot Password Page
**Route:** `/forgot-password`

Features:
- Email input with validation
- Loading state during submission
- Success screen after email sent
- Link back to login
- Responsive design

### Reset Password Page
**Route:** `/reset-password/:token`

Features:
- New password input
- Confirm password input
- Show/hide password toggles
- Password strength requirement (6+ chars)
- Password match validation
- Loading state during reset
- Success screen with auto-redirect
- Link back to login
- Responsive design

## Testing

### Manual Testing Steps

1. **Test Forgot Password**
   - Go to login page
   - Click "Forgot password?"
   - Enter valid email
   - Check email inbox
   - Verify email received

2. **Test Reset Password**
   - Click link in email
   - Enter new password
   - Confirm password
   - Submit form
   - Verify auto-login
   - Verify redirect to dashboard

3. **Test Expired Token**
   - Wait 10+ minutes after requesting reset
   - Try to use reset link
   - Should show error message

4. **Test Invalid Token**
   - Modify token in URL
   - Try to reset password
   - Should show error message

5. **Test Password Validation**
   - Try password < 6 characters
   - Try mismatched passwords
   - Should show validation errors

### Test Cases

- ✅ Valid email sends reset link
- ✅ Invalid email shows error
- ✅ Email contains correct reset link
- ✅ Reset link works within 10 minutes
- ✅ Reset link expires after 10 minutes
- ✅ Invalid token shows error
- ✅ Password must be 6+ characters
- ✅ Passwords must match
- ✅ Successful reset logs user in
- ✅ User redirected to dashboard
- ✅ Old password no longer works
- ✅ New password works for login
- ✅ Token deleted after use
- ✅ Cannot reuse same token

## Troubleshooting

### Email Not Sending

**Check:**
1. Email credentials in `.env.local`
2. App password (not regular password for Gmail)
3. 2FA enabled for Gmail
4. SMTP host and port correct
5. Backend console for errors

**Common Issues:**
- "Invalid login" → Wrong email/password
- "Connection timeout" → Wrong host/port
- "Authentication failed" → Need app password

### Email Goes to Spam

**Solutions:**
1. Add sender to contacts
2. Mark as "Not Spam"
3. Use custom domain email (production)
4. Configure SPF/DKIM records (production)

### Token Expired

**User sees:** "Invalid or expired reset token"

**Solutions:**
1. Request new reset link
2. Check email within 10 minutes
3. Don't refresh reset page multiple times

### Reset Link Not Working

**Check:**
1. Token in URL is complete
2. Link not broken across lines in email
3. Token hasn't been used already
4. Token hasn't expired

## Production Considerations

### Email Service
- Use professional email service (SendGrid, Mailgun, AWS SES)
- Configure custom domain
- Set up SPF, DKIM, DMARC records
- Monitor email delivery rates

### Security
- Use HTTPS for all URLs
- Set secure cookie flags
- Implement rate limiting on endpoints
- Log password reset attempts
- Add CAPTCHA to prevent abuse

### Token Expiration
- Current: 10 minutes
- Adjust based on needs
- Consider user timezone
- Send reminder before expiration

### Email Template
- Use professional email template service
- Add company branding
- Include support contact
- Make mobile-responsive
- Test across email clients

## Environment Variables

Required in `backend/.env.local`:

```env
# Frontend URL
FRONTEND_URL=http://localhost:3000

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@skillmatch.com
EMAIL_FROM_NAME=SkillMatch
```

## Database Schema

### User Model Updates

```javascript
{
  // ... existing fields
  resetPasswordToken: String,
  resetPasswordExpire: Date
}
```

### Methods

```javascript
// Generate reset token
userSchema.methods.getResetPasswordToken = function() {
  const resetToken = crypto.randomBytes(20).toString('hex');
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  return resetToken;
};
```

## Future Enhancements

Potential improvements:
- [ ] Add password strength meter
- [ ] Send confirmation email after reset
- [ ] Add security questions
- [ ] Track password reset history
- [ ] Notify user of suspicious activity
- [ ] Add rate limiting (max 3 requests/hour)
- [ ] Add CAPTCHA to prevent bots
- [ ] Support multiple email templates
- [ ] Add SMS verification option
- [ ] Implement account recovery flow
- [ ] Add password reset analytics

## Support

If users have issues:
1. Check spam folder
2. Request new reset link
3. Try different browser
4. Clear browser cache
5. Contact support with email address
