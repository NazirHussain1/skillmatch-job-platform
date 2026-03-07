const User = require('../models/User.model');

const bootstrapAdmin = async () => {
  const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || '';
  const adminName = (process.env.ADMIN_NAME || 'System Admin').trim();

  if (!adminEmail || !adminPassword) {
    return;
  }

  if (adminPassword.length < 6) {
    return;
  }

  const existingAdmin = await User.findOne({ email: adminEmail }).select('+password');

  if (existingAdmin) {
    if (existingAdmin.role !== 'admin') {
      existingAdmin.role = 'admin';
      existingAdmin.isEmailVerified = true;
      await existingAdmin.save();
    }
    return;
  }

  await User.create({
    name: adminName,
    email: adminEmail,
    password: adminPassword,
    role: 'admin',
    isEmailVerified: true
  });
};

module.exports = bootstrapAdmin;
