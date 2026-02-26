import express from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from './notification.controller.js';
import { protect } from '../../middlewares/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getNotifications);
router.put('/mark-all-read', markAllAsRead);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

export default router;
