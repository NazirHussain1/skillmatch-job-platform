const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const Notification = require('../models/Notification.model');

// @desc    Get notifications for logged in user
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(30);

  const unreadCount = await Notification.countDocuments({
    userId: req.user._id,
    isRead: false
  });

  return res.status(200).json(
    ApiResponse.success('Notifications retrieved successfully', {
      notifications,
      unreadCount
    })
  );
});

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
const markNotificationAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    userId: req.user._id
  });

  if (!notification) {
    return res.status(404).json(
      ApiResponse.error('Notification not found', 404)
    );
  }

  notification.isRead = true;
  await notification.save();

  return res.status(200).json(
    ApiResponse.success('Notification marked as read', notification)
  );
});

module.exports = {
  getNotifications,
  markNotificationAsRead
};
