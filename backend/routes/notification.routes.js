const express = require('express');
const {
  getNotifications,
  markNotificationAsRead
} = require('../controllers/notification.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { notificationIdValidator } = require('../validators/notification.validator');

const router = express.Router();

router.use(protect);

router.get('/', getNotifications);
router.patch('/:id/read', notificationIdValidator, validate, markNotificationAsRead);

module.exports = router;
