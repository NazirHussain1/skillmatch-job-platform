# How to Create an Admin User

Since the registration system defaults all new users to the 'jobseeker' role, you need to manually promote a user to admin role.

## Method 1: Using MongoDB Compass (GUI)

1. Open MongoDB Compass
2. Connect to your database: `mongodb+srv://nh534392_db_user:Nn2ybVWCIuFtEb2t@skillmatch-dev.tzycp3u.mongodb.net/`
3. Select the `skillmatch-db` database
4. Click on the `users` collection
5. Find the user you want to make admin
6. Click the edit icon (pencil)
7. Change the `role` field from `"jobseeker"` to `"admin"`
8. Click "Update"

## Method 2: Using MongoDB Shell

```bash
# Connect to MongoDB
mongosh "mongodb+srv://skillmatch-dev.tzycp3u.mongodb.net/" --username nh534392_db_user

# Switch to your database
use skillmatch-db

# Update user role by email
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

## Method 3: Using Node.js Script

Create a file `scripts/createAdmin.js`:

```javascript
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const User = require('../models/User.model');

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = process.argv[2];
    if (!email) {
      console.error('Please provide an email: node scripts/createAdmin.js user@example.com');
      process.exit(1);
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.error('User not found');
      process.exit(1);
    }

    user.role = 'admin';
    await user.save();

    console.log(`User ${email} is now an admin!`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createAdmin();
```

Run it:
```bash
cd backend
node scripts/createAdmin.js your-email@example.com
```

## Method 4: Direct Database Query (Quick)

If you have MongoDB CLI access:

```javascript
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

## Verification

After updating the role:

1. Log out of the application
2. Log back in with the admin user
3. You should now see admin navigation links:
   - Analytics
   - Users
   - All Jobs
4. Navigate to `/admin` to access the admin dashboard

## Admin Capabilities

Once you have admin access, you can:

- ✅ View platform analytics
- ✅ Manage all users (view, delete, change roles)
- ✅ Manage all jobs (view, delete)
- ✅ See detailed statistics
- ✅ View top employers
- ✅ Monitor recent activity

## Security Notes

- Only promote trusted users to admin role
- Admin users have full platform access
- Admins cannot delete or change their own role (safety feature)
- Keep admin credentials secure
- Consider creating a separate admin account for management tasks

## Testing Admin Features

1. Create a test user account
2. Promote it to admin using one of the methods above
3. Log in with the admin account
4. Test all admin features:
   - View analytics dashboard
   - Browse users
   - Delete a test user
   - Change a user's role
   - Browse all jobs
   - Delete a test job

## Troubleshooting

**Issue**: Admin links not showing after role change
- **Solution**: Log out and log back in to refresh the session

**Issue**: "Unauthorized" error when accessing admin routes
- **Solution**: Verify the user's role is exactly "admin" (lowercase) in the database

**Issue**: Cannot find user in database
- **Solution**: Make sure the user has registered and verified their email first

## Recommended Setup

For development:
1. Register a new account with email: `admin@skillmatch.com`
2. Verify the email
3. Promote to admin using Method 2 (MongoDB Shell)
4. Use this account for all admin testing

For production:
1. Create a dedicated admin account
2. Use a strong, unique password
3. Enable 2FA if implemented
4. Regularly audit admin actions
