const express = require('express');
const {
  getOrCreateConversation,
  getConversations,
  getMessages,
  sendMessage,
  markMessagesAsRead
} = require('../controllers/chat.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Conversation routes
router.get('/conversations', getConversations);
router.get('/conversation/:applicationId', getOrCreateConversation);

// Message routes
router.get('/messages/:conversationId', getMessages);
router.post('/messages', sendMessage);
router.put('/messages/read/:conversationId', markMessagesAsRead);

module.exports = router;
