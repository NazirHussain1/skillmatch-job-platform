const express = require('express');
const {
  getAllUsers,
  deleteUser,
  getAllJobs,
  deleteJobAdmin,
  getAnalytics,
  updateUserRole,
  approveJob,
  rejectJob,
  getJobsByStatus
} = require('../controllers/admin.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// All routes require admin role
router.use(protect);
router.use(authorize('admin'));

// User management
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/role', updateUserRole);

// Job management
router.get('/jobs', getAllJobs);
router.get('/jobs/status/:status', getJobsByStatus);
router.delete('/jobs/:id', deleteJobAdmin);
router.put('/jobs/:id/approve', approveJob);
router.put('/jobs/:id/reject', rejectJob);

// Analytics
router.get('/analytics', getAnalytics);

module.exports = router;
