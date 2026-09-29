import React, { useState, useRef, useEffect } from 'react';
import {
  HiOutlineSparkles,
  HiOutlineX,
  HiOutlinePaperAirplane,
  HiOutlineRefresh,
  HiOutlineTrash,
  HiOutlineMinus,
  HiOutlineArrowsExpand,
} from 'react-icons/hi';
import { aiService } from '../../services/aiService.js';

const QUICK_PROMPTS = [
  'Suggest a career roadmap for MERN',
  'Give me project ideas',
  'How do I prepare for a Node.js interview?',
  'What skills should I learn for a software developer role?',
  'Explain REST APIs',
];

export const AIChatbot = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "👋 Hi! I'm **AlumniConnect AI**, your dedicated career and technical learning assistant.\n\nI can help you with:\n- 🚀 **Career Roadmaps** & skill development\n- 💡 **Project Ideas** & system architecture\n- 💼 **Interview Preparation** & resume tips\n- 🤝 **Mentorship Preparation** for connecting with alumni\n\nHow can I help you today?",
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastFailedMessage, setLastFailedMessage] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [messages, isOpen, loading]);

  const handleSendMessage = async (textToSend) => {
    const query = typeof textToSend === 'string' ? textToSend.trim() : inputValue.trim();
    if (!query || loading) return;

    setError(null);
    setInputValue('');

    // Check if the query is already the last message (e.g. on Retry) to avoid duplicating
    let updatedMessages = messages;
    const lastMsg = messages[messages.length - 1];
    const isAlreadyLast = lastMsg && lastMsg.role === 'user' && lastMsg.content === query;

    if (!isAlreadyLast) {
      updatedMessages = [...messages, { role: 'user', content: query }];
      setMessages(updatedMessages);
    }
    setLoading(true);

    try {
      // Format history (prior conversation excluding the current query)
      const historyPayload = updatedMessages
        .slice(0, -1)
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const data = await aiService.chat({
        message: query,
        history: historyPayload,
      });

      if (data && data.success && data.message) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.message, model: data.model },
        ]);
        setLastFailedMessage(null);
        setError(null);
      } else {
        throw new Error(data?.message || 'Could not obtain response from AI assistant');
      }
    } catch (err) {
      console.error('[AI Assistant]', err);

      const rawMsg = (err?.message || '').toLowerCase();
      const isTimeout =
        err?.code === 'ECONNABORTED' ||
        err?.status === 504 ||
        rawMsg.includes('timeout') ||
        rawMsg.includes('longer than expected');

      const friendlyMsg = isTimeout
        ? 'AI Assistant is taking longer than expected. Please try again.'
        : err?.message || 'The AI Assistant is currently experiencing connection issues. Please try again.';

      setError(friendlyMsg);
      setLastFailedMessage(query);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (lastFailedMessage) {
      handleSendMessage(lastFailedMessage);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content:
          "Conversation cleared. How else can I assist you with your career or learning journey today?",
      },
    ]);
    setError(null);
    setLastFailedMessage(null);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed z-50 transition-all duration-300 ease-in-out flex flex-col bg-[#151E32] shadow-2xl shadow-black/80 border border-[#26334D] overflow-hidden ${
        isExpanded
          ? 'inset-4 md:inset-10 rounded-3xl'
          : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-[440px] h-[600px] max-h-[calc(100vh-2rem)] rounded-3xl'
      }`}
    >
      {/* Top Header Banner */}
      <div className="bg-[#151E32] px-5 py-4 text-[#F8FAFC] flex items-center justify-between flex-shrink-0 border-b border-[#26334D]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#202B40] flex items-center justify-center text-[#818CF8] border border-[#6366F1]/30 shadow-inner">
            <HiOutlineSparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold tracking-tight text-[#F8FAFC]">AlumniConnect AI</h3>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#6366F1]/20 text-[#818CF8] border border-[#6366F1]/30">
                Gemini
              </span>
            </div>
            <p className="text-[11px] text-[#94A3B8]">Career & Technical Guidance</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 text-[#94A3B8]">
          <button
            type="button"
            onClick={handleClearChat}
            className="p-1.5 rounded-lg hover:bg-[#202B40] hover:text-[#F8FAFC] transition-colors"
            title="Clear conversation"
          >
            <HiOutlineTrash className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="p-1.5 rounded-lg hover:bg-[#202B40] hover:text-[#F8FAFC] transition-colors hidden sm:block"
            title={isExpanded ? 'Minimize' : 'Expand'}
          >
            {isExpanded ? (
              <HiOutlineMinus className="w-4 h-4" />
            ) : (
              <HiOutlineArrowsExpand className="w-4 h-4" />
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#202B40] hover:text-[#F8FAFC] transition-colors"
            title="Close"
          >
            <HiOutlineX className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#0B1120]">
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={index}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-fade-in`}
            >
              <div className="flex items-start gap-2.5 max-w-[88%]">
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-[#202B40] text-[#818CF8] flex items-center justify-center flex-shrink-0 mt-0.5 border border-[#6366F1]/30 shadow-soft-sm">
                    <HiOutlineSparkles className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-soft-sm whitespace-pre-wrap ${
                    isUser
                      ? 'bg-[#6366F1] text-white rounded-br-none shadow-md'
                      : 'bg-[#151E32] text-[#CBD5E1] border border-[#26334D] rounded-tl-none shadow-md'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading / Thinking Indicator */}
        {loading && (
          <div className="flex items-start gap-2.5 max-w-[85%] animate-fade-in">
            <div className="w-7 h-7 rounded-lg bg-[#202B40] text-[#818CF8] flex items-center justify-center flex-shrink-0 mt-0.5 border border-[#6366F1]/30">
              <HiOutlineSparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-[#151E32] border border-[#26334D] p-3.5 rounded-2xl rounded-tl-none shadow-soft-sm flex items-center gap-2">
              <div className="flex space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-[#6366F1] animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-[#818CF8] animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]" />
              </div>
              <span className="text-xs font-semibold text-[#CBD5E1] ml-1">
                AlumniConnect AI is thinking...
              </span>
            </div>
          </div>
        )}

        {/* Error State Banner */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300 flex items-center justify-between gap-3 animate-fade-in">
            <span>{error}</span>
            {lastFailedMessage && (
              <button
                type="button"
                onClick={handleRetry}
                className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-semibold flex items-center gap-1 hover:bg-rose-500 transition-colors shadow-soft-sm flex-shrink-0"
              >
                <HiOutlineRefresh className="w-3.5 h-3.5" />
                Retry
              </button>
            )}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Carousel */}
      <div className="px-4 py-2.5 bg-[#151E32] border-t border-[#26334D] overflow-x-auto no-scrollbar flex items-center gap-2 flex-shrink-0">
        <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider flex-shrink-0">
          Suggestions:
        </span>
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            disabled={loading}
            onClick={() => handleSendMessage(prompt)}
            className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium bg-[#202B40] text-[#CBD5E1] hover:bg-[#6366F1]/20 hover:text-[#818CF8] hover:border-[#6366F1]/60 border border-[#334155] transition-all"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box Footer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 sm:p-4 bg-[#151E32] border-t border-[#26334D] flex items-center gap-2 flex-shrink-0"
      >
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask AlumniConnect AI a question..."
          disabled={loading}
          className="flex-1 rounded-xl border border-[#334155] bg-[#202B40] px-4 py-2.5 text-xs sm:text-sm text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] placeholder-[#64748B] disabled:bg-[#151E32]"
        />
        <button
          type="submit"
          disabled={loading || !inputValue.trim()}
          className="p-2.5 rounded-xl bg-[#6366F1] text-white hover:bg-[#4F46E5] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-soft-sm flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
          title="Send question"
        >
          <HiOutlinePaperAirplane className="w-5 h-5 rotate-90" />
        </button>
      </form>
    </div>
  );
};

export default AIChatbot;
