import { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getConversations, getOrCreateConversation, getMessages, sendMessage as sendMsg, addMessage, markMessagesAsRead } from '../features/chat/chatSlice';
import { useSocket } from '../context/SocketContext';
import { MessageCircle, Send, User } from 'lucide-react';
import { getOptimizedCloudinaryUrl } from '../utils/cloudinary';
import SkeletonLoader from '../components/SkeletonLoader';

// Chat Message Skeleton Loader with realistic variations
const ChatMessageSkeleton = ({ count = 4 }) => {
  // Predefined widths for realistic variation
  const widths = ['180px', '240px', '200px', '280px', '160px', '220px', '260px', '190px'];
  
  return (
    <div className="space-y-3 sm:space-y-4">
      {[...Array(count)].map((_, index) => {
        const isLeft = index % 2 === 0;
        const width = widths[index % widths.length];
        
        return (
          <div key={index} className={`flex ${isLeft ? 'justify-start' : 'justify-end'} animate-pulse`}>
            <div className="max-w-[85%] sm:max-w-[70%]">
              <div 
                className={`rounded-lg p-3 ${isLeft ? 'bg-gray-200' : 'bg-blue-200'}`} 
                style={{ width, minHeight: '64px' }}
              >
                <div className={`h-3 ${isLeft ? 'bg-gray-300' : 'bg-blue-300'} rounded w-full mb-2`}></div>
                <div className={`h-3 ${isLeft ? 'bg-gray-300' : 'bg-blue-300'} rounded w-3/4 mb-2`}></div>
                <div className={`h-2 ${isLeft ? 'bg-gray-300' : 'bg-blue-300'} rounded w-16 mt-2`}></div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

function Chat() {
  const dispatch = useDispatch();
  const socket = useSocket();
  const [searchParams] = useSearchParams();
  const applicationId = searchParams.get('application');
  
  const { user } = useSelector((state) => state.auth);
  const { conversations, messages, isLoading } = useSelector((state) => state.chat);
  
  const [messageInput, setMessageInput] = useState('');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    dispatch(getConversations());
  }, [dispatch]);

  useEffect(() => {
    if (applicationId) {
      dispatch(getOrCreateConversation(applicationId)).then((result) => {
        if (result.payload) {
          setSelectedConversation(result.payload);
          setIsLoadingMessages(true);
          dispatch(getMessages(result.payload._id)).finally(() => {
            setIsLoadingMessages(false);
          });
        }
      });
    }
  }, [applicationId, dispatch]);

  useEffect(() => {
    if (selectedConversation && socket) {
      socket.emit('join-conversation', selectedConversation._id);
      dispatch(markMessagesAsRead(selectedConversation._id));

      return () => {
        socket.emit('leave-conversation', selectedConversation._id);
      };
    }
  }, [selectedConversation, socket, dispatch]);

  useEffect(() => {
    if (socket) {
      socket.on('receive-message', (message) => {
        dispatch(addMessage(message));
        scrollToBottom();
      });

      socket.on('user-typing', () => {
        setIsTyping(true);
      });

      socket.on('user-stop-typing', () => {
        setIsTyping(false);
      });

      return () => {
        socket.off('receive-message');
        socket.off('user-typing');
        socket.off('user-stop-typing');
      };
    }
  }, [socket, dispatch]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest'
      });
    }
  };

  const handleSelectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    setIsLoadingMessages(true);
    try {
      await dispatch(getMessages(conversation._id)).unwrap();
    } catch (error) {
      toast.error('Failed to load messages');
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageInput.trim() || !selectedConversation) return;

    try {
      const result = await dispatch(sendMsg({
        conversationId: selectedConversation._id,
        content: messageInput
      })).unwrap();

      // Emit socket event
      if (socket) {
        socket.emit('send-message', {
          conversationId: selectedConversation._id,
          message: result
        });
      }

      setMessageInput('');
    } catch (error) {
      toast.error(error || 'Failed to send message');
    }
  };

  const handleTyping = () => {
    if (socket && selectedConversation) {
      socket.emit('typing', {
        conversationId: selectedConversation._id,
        userId: user._id
      });
    }
  };

  const handleStopTyping = () => {
    if (socket && selectedConversation) {
      socket.emit('stop-typing', {
        conversationId: selectedConversation._id,
        userId: user._id
      });
    }
  };

  const getOtherParticipant = (conversation) => {
    return conversation.participants.find(p => p._id !== user._id);
  };

  const activeParticipant = selectedConversation ? getOtherParticipant(selectedConversation) : null;

  return (
    <div className="h-[calc(100vh-8rem)] lg:h-[calc(100vh-10rem)] flex flex-col lg:flex-row gap-3 sm:gap-4">
      {/* Conversations List */}
      <aside className="w-full lg:w-1/3 card overflow-y-auto max-h-60 sm:max-h-72 lg:max-h-none scroll-smooth" aria-label="Conversations sidebar">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Messages</h2>
        
        {isLoading ? (
          <div className="space-y-2">
            <SkeletonLoader type="list" count={4} />
          </div>
        ) : conversations.length > 0 ? (
          <ul className="space-y-2" role="list" aria-label="Conversations list">
            {conversations.map((conversation) => {
              const otherUser = getOtherParticipant(conversation);
              const hasUnread = conversation.unreadCount > 0;
              
              return (
                <li
                  key={conversation._id}
                  role="listitem"
                >
                  <div
                    onClick={() => handleSelectConversation(conversation)}
                    className={`p-3 sm:p-4 rounded-lg cursor-pointer transition-all duration-200 relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                      selectedConversation?._id === conversation._id
                        ? 'bg-blue-50 ring-2 ring-blue-500 ring-inset'
                        : 'hover:bg-gray-50 active:bg-gray-100'
                    }`}
                    role="button"
                    tabIndex={0}
                    aria-label={`Conversation with ${otherUser?.companyName || otherUser?.name}${hasUnread ? `, ${conversation.unreadCount} unread messages` : ''}`}
                    aria-current={selectedConversation?._id === conversation._id ? 'true' : undefined}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSelectConversation(conversation);
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                          {otherUser?.profilePicture ? (
                            <img
                              src={getOptimizedCloudinaryUrl(otherUser.profilePicture, {
                                width: 96,
                                height: 96,
                                crop: 'fill',
                                gravity: 'face'
                              })}
                              alt={otherUser?.name || 'User'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" aria-hidden="true" />
                          )}
                        </div>
                        {hasUnread && (
                          <span 
                            className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white"
                            aria-label={`${conversation.unreadCount} unread messages`}
                            role="status"
                          >
                            {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm sm:text-base truncate ${hasUnread ? 'font-bold text-gray-900' : 'font-semibold text-gray-900'}`}>
                          {otherUser?.companyName || otherUser?.name}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">
                          {conversation.application?.job?.title}
                        </p>
                        {conversation.lastMessage && (
                          <p className={`text-xs text-gray-500 truncate mt-0.5 ${hasUnread ? 'font-medium' : ''}`}>
                            {conversation.lastMessage.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="text-center py-8 sm:py-12">
            <MessageCircle className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" aria-hidden="true" />
            <p className="text-sm sm:text-base text-gray-600">No conversations yet</p>
          </div>
        )}
      </aside>

      {/* Chat Area */}
      <main className="flex-1 card flex flex-col min-h-0 relative" aria-label="Chat area">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <header className="flex-shrink-0 border-b pb-3 sm:pb-4 mb-3 sm:mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                  {activeParticipant?.profilePicture ? (
                    <img
                      src={getOptimizedCloudinaryUrl(activeParticipant.profilePicture, {
                        width: 96,
                        height: 96,
                        crop: 'fill',
                        gravity: 'face'
                      })}
                      alt={`${activeParticipant.name}'s profile picture`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" aria-hidden="true" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-sm sm:text-base text-gray-900 truncate">
                    {activeParticipant?.companyName || activeParticipant?.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">
                    {selectedConversation.application?.job?.title}
                  </p>
                </div>
              </div>
            </header>

            {/* Messages Container */}
            <div 
              className="flex-1 overflow-y-auto scroll-smooth overscroll-contain mb-3 sm:mb-4 px-1" 
              role="log" 
              aria-live="polite" 
              aria-atomic="false"
              aria-label="Chat messages"
              aria-relevant="additions"
            >
              <div className="space-y-3 sm:space-y-4">
                {isLoadingMessages ? (
                  <ChatMessageSkeleton count={5} />
                ) : (
                  <>
                    {messages.map((message) => {
                      const isOwnMessage = message.sender._id === user._id;
                      return (
                        <article
                          key={message._id}
                          className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                          role="article"
                          aria-label={`Message from ${isOwnMessage ? 'you' : message.sender.name}`}
                        >
                          <div
                            className={`max-w-[85%] sm:max-w-[70%] rounded-lg p-3 shadow-sm transition-all duration-200 hover:shadow-md ${
                              isOwnMessage
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                            }`}
                          >
                            <p className="text-sm sm:text-base break-words leading-relaxed">{message.content}</p>
                            <time 
                              className={`text-[10px] sm:text-xs mt-1.5 block ${
                                isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                              }`}
                              dateTime={message.createdAt}
                              aria-label={`Sent at ${new Date(message.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}`}
                            >
                              {new Date(message.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </time>
                          </div>
                        </article>
                      );
                    })}
                    {isTyping && (
                      <div className="flex justify-start animate-in fade-in duration-200" role="status" aria-live="polite" aria-label="User is typing">
                        <div className="bg-gray-100 rounded-lg p-3 shadow-sm">
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} aria-hidden="true"></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} aria-hidden="true"></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} aria-hidden="true"></span>
                            <span className="sr-only">Typing...</span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} aria-hidden="true" />
                  </>
                )}
              </div>
            </div>

            {/* Message Input - Fixed at bottom on mobile and tablet */}
            <form 
              onSubmit={handleSendMessage} 
              className="flex-shrink-0 flex gap-2 sticky bottom-0 left-0 right-0 bg-white pt-3 border-t border-gray-100 sm:pt-0 sm:border-t-0"
            >
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onFocus={handleTyping}
                onBlur={handleStopTyping}
                placeholder="Type a message..."
                className="flex-1 input-field text-sm sm:text-base transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                aria-label="Type your message"
                disabled={isLoadingMessages}
              />
              <button
                type="submit"
                disabled={!messageInput.trim() || isLoadingMessages}
                className="btn-primary flex items-center gap-2 px-3 sm:px-4 py-2 text-sm sm:text-base flex-shrink-0 transition-all duration-200 hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" aria-hidden="true" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" aria-hidden="true" />
              <p className="text-sm sm:text-base text-gray-600">Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Chat;
