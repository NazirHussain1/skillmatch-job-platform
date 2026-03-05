const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const Conversation = require('../models/Conversation.model');
const Message = require('../models/Message.model');
const Application = require('../models/Application.model');

// @desc    Get or create conversation for an application
// @route   GET /api/chat/conversation/:applicationId
// @access  Private
const getOrCreateConversation = asyncHandler(async (req, res) => {
  const { applicationId } = req.params;
  
  // Get application with job details
  const application = await Application.findById(applicationId)
    .populate('job')
    .populate('applicant', 'name email');
  
  if (!application) {
    return res.status(404).json(
      ApiResponse.error('Application not found', 404)
    );
  }
  
  // Check if user is either the applicant or the employer
  const isApplicant = application.applicant._id.toString() === req.user._id.toString();
  const isEmployer = application.job.employer.toString() === req.user._id.toString();
  
  if (!isApplicant && !isEmployer) {
    return res.status(403).json(
      ApiResponse.error('Not authorized to access this conversation', 403)
    );
  }
  
  // Find or create conversation
  let conversation = await Conversation.findOne({ application: applicationId })
    .populate('participants', 'name email role profilePicture')
    .populate('lastMessage');
  
  if (!conversation) {
    conversation = await Conversation.create({
      participants: [application.applicant._id, application.job.employer],
      application: applicationId
    });
    
    conversation = await Conversation.findById(conversation._id)
      .populate('participants', 'name email role profilePicture')
      .populate('lastMessage');
  }
  
  return res.status(200).json(
    ApiResponse.success('Conversation retrieved successfully', conversation)
  );
});

// @desc    Get all conversations for current user
// @route   GET /api/chat/conversations
// @access  Private
const getConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({
    participants: req.user._id
  })
    .populate('participants', 'name email role profilePicture companyName')
    .populate('lastMessage')
    .populate({
      path: 'application',
      populate: {
        path: 'job',
        select: 'title company'
      }
    })
    .sort({ updatedAt: -1 });
  
  return res.status(200).json(
    ApiResponse.success('Conversations retrieved successfully', conversations)
  );
});

// @desc    Get messages for a conversation
// @route   GET /api/chat/messages/:conversationId
// @access  Private
const getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  
  // Check if user is participant
  const conversation = await Conversation.findById(conversationId);
  
  if (!conversation) {
    return res.status(404).json(
      ApiResponse.error('Conversation not found', 404)
    );
  }
  
  const isParticipant = conversation.participants.some(
    p => p.toString() === req.user._id.toString()
  );
  
  if (!isParticipant) {
    return res.status(403).json(
      ApiResponse.error('Not authorized to access this conversation', 403)
    );
  }
  
  const messages = await Message.find({ conversation: conversationId })
    .populate('sender', 'name email role profilePicture')
    .sort({ createdAt: 1 });
  
  return res.status(200).json(
    ApiResponse.success('Messages retrieved successfully', messages)
  );
});

// @desc    Send a message
// @route   POST /api/chat/messages
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
  const { conversationId, content } = req.body;
  
  // Check if user is participant
  const conversation = await Conversation.findById(conversationId);
  
  if (!conversation) {
    return res.status(404).json(
      ApiResponse.error('Conversation not found', 404)
    );
  }
  
  const isParticipant = conversation.participants.some(
    p => p.toString() === req.user._id.toString()
  );
  
  if (!isParticipant) {
    return res.status(403).json(
      ApiResponse.error('Not authorized to send messages in this conversation', 403)
    );
  }
  
  // Create message
  const message = await Message.create({
    conversation: conversationId,
    sender: req.user._id,
    content
  });
  
  // Update conversation's last message
  conversation.lastMessage = message._id;
  await conversation.save();
  
  // Populate message
  const populatedMessage = await Message.findById(message._id)
    .populate('sender', 'name email role profilePicture');
  
  return res.status(201).json(
    ApiResponse.success('Message sent successfully', populatedMessage)
  );
});

// @desc    Mark messages as read
// @route   PUT /api/chat/messages/read/:conversationId
// @access  Private
const markMessagesAsRead = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  
  // Check if user is participant
  const conversation = await Conversation.findById(conversationId);
  
  if (!conversation) {
    return res.status(404).json(
      ApiResponse.error('Conversation not found', 404)
    );
  }
  
  const isParticipant = conversation.participants.some(
    p => p.toString() === req.user._id.toString()
  );
  
  if (!isParticipant) {
    return res.status(403).json(
      ApiResponse.error('Not authorized', 403)
    );
  }
  
  // Mark all messages from other participants as read
  await Message.updateMany(
    {
      conversation: conversationId,
      sender: { $ne: req.user._id },
      read: false
    },
    { read: true }
  );
  
  return res.status(200).json(
    ApiResponse.success('Messages marked as read')
  );
});

module.exports = {
  getOrCreateConversation,
  getConversations,
  getMessages,
  sendMessage,
  markMessagesAsRead
};
