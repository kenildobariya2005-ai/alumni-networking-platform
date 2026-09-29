import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  HiOutlineChatAlt2,
  HiOutlinePaperAirplane,
  HiOutlineSearch,
  HiOutlineCheck,
  HiOutlineCheckCircle,
  HiOutlineUser,
  HiOutlineArrowLeft,
} from 'react-icons/hi';
import useAuth from '../../hooks/useAuth.js';
import useSocket from '../../hooks/useSocket.js';
import { messageService } from '../../services/messageService.js';
import Button from '../../components/common/Button.jsx';
import Loader from '../../components/common/Loader.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';

export const Chat = () => {
  const { userId: routeUserId } = useParams();
  const { user } = useAuth();
  const { socket, isUserOnline, isConnected } = useSocket();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [activePartnerId, setActivePartnerId] = useState(routeUserId || null);
  const [activePartner, setActivePartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch all conversations list
  const fetchConversations = useCallback(async () => {
    try {
      setLoadingConversations(true);
      const data = await messageService.getMyConversations();
      if (data?.data?.conversations) {
        setConversations(data.data.conversations);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  // Fetch conversation messages with active partner
  const fetchMessages = useCallback(
    async (partnerId) => {
      if (!partnerId) return;
      try {
        setLoadingMessages(true);
        const data = await messageService.getConversation(partnerId, { limit: 100 });
        if (data?.data) {
          setMessages(data.data.messages || []);
          if (data.data.participant) {
            setActivePartner(data.data.participant);
          }
          // Mark conversation as read in backend
          messageService.markConversationAsRead(partnerId).catch(() => {});
        }
      } catch (err) {
        toast.error('Failed to load conversation history');
      } finally {
        setLoadingMessages(false);
      }
    },
    []
  );

  // Initial load
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Handle route param changes
  useEffect(() => {
    if (routeUserId) {
      setActivePartnerId(routeUserId);
      fetchMessages(routeUserId);
    }
  }, [routeUserId, fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isPartnerTyping]);

  // Setup Socket.io Event Listeners
  useEffect(() => {
    if (!socket) return;

    // 1. New message received
    const handleReceiveMessage = (newMessage) => {
      const senderId = newMessage.sender?._id?.toString() || newMessage.sender?.toString();
      const receiverId = newMessage.receiver?._id?.toString() || newMessage.receiver?.toString();

      // If message is from or to the current active chat partner
      if (senderId === activePartnerId || receiverId === activePartnerId) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === newMessage._id)) return prev;
          return [...prev, newMessage];
        });

        // If I am the recipient and active in this chat, mark read via socket & REST
        if (receiverId === user?._id?.toString()) {
          socket.emit('message:read', {
            conversationWithUserId: activePartnerId,
          });
        }
      }

      // Update conversations list summary
      fetchConversations();
    };

    // 2. Message read receipt from recipient
    const handleMessageRead = (payload) => {
      const { readerId } = payload;
      if (readerId === activePartnerId) {
        setMessages((prev) =>
          prev.map((m) =>
            m.sender?._id?.toString() === user?._id?.toString()
              ? { ...m, isRead: true }
              : m
          )
        );
      }
    };

    // 3. Partner started typing
    const handleTypingStart = (payload) => {
      if (payload.senderId === activePartnerId) {
        setIsPartnerTyping(true);
      }
    };

    // 4. Partner stopped typing
    const handleTypingStop = (payload) => {
      if (payload.senderId === activePartnerId) {
        setIsPartnerTyping(false);
      }
    };

    socket.on('message:receive', handleReceiveMessage);
    socket.on('message:read', handleMessageRead);
    socket.on('conversation:read', handleMessageRead);
    socket.on('typing:start', handleTypingStart);
    socket.on('typing:stop', handleTypingStop);

    return () => {
      socket.off('message:receive', handleReceiveMessage);
      socket.off('message:read', handleMessageRead);
      socket.off('conversation:read', handleMessageRead);
      socket.off('typing:start', handleTypingStart);
      socket.off('typing:stop', handleTypingStop);
    };
  }, [socket, activePartnerId, user, fetchConversations]);

  // Handle typing indicator trigger
  const handleInputChange = (e) => {
    setMessageInput(e.target.value);

    if (!socket || !activePartnerId) return;

    socket.emit('typing:start', { receiverId: activePartnerId });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing:stop', { receiverId: activePartnerId });
    }, 2000);
  };

  // Send message handler
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !activePartnerId) return;

    const trimmed = messageInput.trim();
    setMessageInput('');

    if (socket) {
      socket.emit('typing:stop', { receiverId: activePartnerId });
    }

    try {
      setSending(true);

      // Attempt sending via Socket with fallback to REST
      if (socket && isConnected) {
        socket.emit(
          'message:send',
          {
            receiverId: activePartnerId,
            message: trimmed,
          },
          (response) => {
            if (response && response.success && response.data) {
              setMessages((prev) => [...prev, response.data]);
              fetchConversations();
            }
          }
        );
      } else {
        // REST fallback
        const res = await messageService.sendMessage({
          receiverId: activePartnerId,
          message: trimmed,
        });
        if (res?.data?.message) {
          setMessages((prev) => [...prev, res.data.message]);
          fetchConversations();
        }
      }
    } catch (err) {
      toast.error('Failed to deliver message');
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery.trim()) return true;
    return c.partner?.fullName
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase().trim());
  });

  return (
    <div className="h-[calc(100vh-140px)] min-h-[550px] bg-[#1E293B] rounded-3xl border border-[#26334D] shadow-soft-lg overflow-hidden flex animate-fade-in text-[#CBD5E1]">
      {/* Left Column: Conversations List */}
      <div
        className={`w-full md:w-80 lg:w-96 border-r border-[#26334D] bg-[#131B2E] flex flex-col ${
          activePartnerId ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Search Header */}
        <div className="p-4 border-b border-[#26334D]">
          <div className="relative">
            <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#334155] bg-[#202B40] text-xs sm:text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-slate-500"
            />
          </div>
        </div>

        {/* Conversations Scrollable List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#26334D]/80">
          {loadingConversations ? (
            <div className="py-12 flex justify-center">
              <Loader size="sm" message="Loading conversations..." />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#94A3B8]">
              No conversations yet. Start a chat with alumni mentors or project team members!
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const partner = conv.partner || {};
              const isSelected = conv._id === activePartnerId;
              const online = isUserOnline(partner._id);

              return (
                <div
                  key={conv._id}
                  onClick={() => {
                    setActivePartnerId(partner._id);
                    navigate(`/chat/${partner._id}`);
                  }}
                  className={`p-3.5 sm:p-4 flex items-start gap-3 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-primary-950/60 border-l-4 border-primary-500'
                      : 'hover:bg-[#202B40]/60'
                  }`}
                >
                  {/* Partner Avatar + Online Indicator */}
                  <div className="relative flex-shrink-0">
                    {partner.profilePicture ? (
                      <img
                        src={partner.profilePicture}
                        alt={partner.fullName || 'User'}
                        className="w-11 h-11 rounded-2xl object-cover border border-[#334155]"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-2xl bg-primary-950/80 text-primary-300 font-bold flex items-center justify-center text-sm border border-primary-800/50">
                        {partner.fullName?.charAt(0) || 'U'}
                      </div>
                    )}
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-[#131B2E] ${
                        online ? 'bg-emerald-500' : 'bg-slate-600'
                      }`}
                    />
                  </div>

                  {/* Partner Name & Last Message */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                        {partner.fullName || 'User'}
                      </h4>
                      {conv.lastMessage?.createdAt && (
                        <span className="text-[10px] text-[#94A3B8]">
                          {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-1">
                      <p className="text-xs text-[#94A3B8] truncate">
                        {conv.lastMessage?.message || 'Started a conversation'}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="flex-shrink-0 min-w-[18px] h-[18px] px-1 bg-primary-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-sm">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Chat Pane */}
      <div
        className={`flex-1 flex flex-col bg-[#0F172A] ${
          activePartnerId ? 'flex' : 'hidden md:flex'
        }`}
      >
        {activePartnerId ? (
          <>
            {/* Chat Pane Header */}
            <div className="h-16 px-4 sm:px-6 bg-[#131B2E] border-b border-[#26334D] flex items-center justify-between flex-shrink-0 text-white">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setActivePartnerId(null);
                    navigate('/chat');
                  }}
                  className="p-1.5 rounded-lg text-[#94A3B8] hover:bg-[#202B40] hover:text-[#F8FAFC] md:hidden"
                >
                  <HiOutlineArrowLeft className="w-5 h-5" />
                </button>

                <div className="relative">
                  {activePartner?.profilePicture ? (
                    <img
                      src={activePartner.profilePicture}
                      alt={activePartner.fullName || 'User'}
                      className="w-9 h-9 rounded-xl object-cover border border-[#334155]"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-primary-950/80 text-primary-300 font-bold flex items-center justify-center text-xs border border-primary-800/50">
                      {activePartner?.fullName?.charAt(0) || <HiOutlineUser className="w-4 h-4" />}
                    </div>
                  )}
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-[#131B2E] ${
                      isUserOnline(activePartnerId) ? 'bg-emerald-500' : 'bg-slate-600'
                    }`}
                  />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white">
                    {activePartner?.fullName || 'Chat'}
                  </h3>
                  <p className="text-[10px] text-[#94A3B8] capitalize">
                    {isUserOnline(activePartnerId) ? (
                      <span className="text-emerald-400 font-semibold">Online</span>
                    ) : (
                      'Offline'
                    )}{' '}
                    &bull; {activePartner?.role || 'Member'}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-[#0F172A]">
              {loadingMessages ? (
                <div className="py-12 flex justify-center">
                  <Loader size="sm" message="Loading messages..." />
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-950/70 text-indigo-400 flex items-center justify-center mb-2 border border-indigo-800/50">
                    <HiOutlineChatAlt2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white">
                    Say hello to {activePartner?.fullName || 'your peer'}!
                  </h4>
                  <p className="text-xs text-[#94A3B8] mt-1 max-w-xs">
                    Start a conversation regarding mentorship, career guidance, or project collaboration.
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const senderId =
                    msg.sender?._id?.toString() || msg.sender?.toString();
                  const isMe = senderId === user?._id?.toString();

                  return (
                    <div
                      key={msg._id}
                      className={`flex flex-col ${
                        isMe ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] sm:max-w-[70%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-soft-sm ${
                          isMe
                            ? 'bg-primary-600 text-white rounded-br-none shadow-md'
                            : 'bg-[#1E293B] text-slate-100 border border-[#334155]/80 rounded-bl-none shadow-md'
                        }`}
                      >
                        <p className="whitespace-pre-line">{msg.message}</p>
                      </div>

                      <div className="flex items-center gap-1 mt-1 text-[10px] text-[#94A3B8] px-1">
                        <span>
                          {msg.createdAt
                            ? new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : ''}
                        </span>
                        {isMe && (
                          <span>
                            {msg.isRead ? (
                              <HiOutlineCheckCircle className="w-3 h-3 text-emerald-400" title="Read" />
                            ) : (
                              <HiOutlineCheck className="w-3 h-3 text-[#94A3B8]" title="Sent" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}

              {/* Typing indicator */}
              {isPartnerTyping && (
                <div className="flex items-center gap-2 text-xs text-[#94A3B8] italic py-1">
                  <span className="w-2 h-2 rounded-full bg-[#94A3B8] animate-bounce" />
                  <span>{activePartner?.fullName || 'User'} is typing...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 sm:p-4 bg-[#131B2E] border-t border-[#26334D] flex items-center gap-2"
            >
              <input
                type="text"
                value={messageInput}
                onChange={handleInputChange}
                placeholder="Type a message..."
                className="flex-1 rounded-xl border border-[#334155] bg-[#202B40] px-4 py-2.5 text-xs sm:text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-slate-500"
              />
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={!messageInput.trim()}
                isLoading={sending}
                icon={HiOutlinePaperAirplane}
              >
                <span className="hidden sm:inline">Send</span>
              </Button>
            </form>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-3xl bg-[#202B40] text-[#94A3B8] flex items-center justify-center mb-3 border border-[#334155]">
              <HiOutlineChatAlt2 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white">
              Direct Messages
            </h3>
            <p className="text-xs text-[#94A3B8] max-w-sm mt-1">
              Select a conversation from the sidebar or click "Message" on any mentor or peer profile to begin chatting.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;

