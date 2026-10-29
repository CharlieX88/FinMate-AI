import { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  Send, Bot, User, Loader2, Plus, MessageSquare, 
  ShieldAlert, Trash2 
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const AIChat = () => {
  const { user } = useAuth();
  
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch chats on mount
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await api.get('/chats');
        setSessions(res.data.chats);
        if (res.data.chats.length > 0) {
          setActiveSessionId(res.data.chats[0]._id);
        }
      } catch (error) {
        console.error("Failed to load chats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchChats();
  }, []);

  const activeSession = sessions.find(s => s._id === activeSessionId);
  const messages = activeSession ? activeSession.messages : [
    { role: 'assistant', content: `Hi ${user?.name?.split(' ')[0] || 'there'}! I'm your FinMate Mentor. How can I help you today?` }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => { scrollToBottom(); }, [messages, isLoading]);

  const handleNewChat = () => {
    setActiveSessionId(null);
    setInput('');
  };

  const handleDeleteSession = async (e, sessionId) => {
    e.stopPropagation();
    if (!window.confirm("Delete this chat?")) return;
    try {
      await api.delete(`/chats/${sessionId}`);
      const updated = sessions.filter(s => s._id !== sessionId);
      setSessions(updated);
      if (activeSessionId === sessionId) {
        setActiveSessionId(updated.length > 0 ? updated[0]._id : null);
      }
    } catch (error) {
      alert('Failed to delete chat');
    }
  };

  const handleSend = async (messageText) => {
    const messageToSend = messageText || input;
    if (!messageToSend.trim() || isLoading) return;

    setInput('');
    setIsLoading(true);

    const userMessage = { role: 'user', content: messageToSend };

    // If it's a brand new chat
    if (!activeSessionId) {
      const initialMessages = [
        { role: 'assistant', content: `Hi ${user?.name?.split(' ')[0] || 'there'}! I'm your FinMate Mentor. How can I help you today?` },
        userMessage
      ];
      
      const tempId = 'temp-' + Date.now();
      setSessions(prev => [
        { _id: tempId, title: messageToSend.slice(0, 25) + '...', messages: initialMessages },
        ...prev
      ]);
      setActiveSessionId(tempId);

      try {
        const res = await api.post('/ai/chat', {
          message: messageToSend,
          history: [] 
        });

        const aiMessage = { role: 'assistant', content: res.data.reply };
        const finalMessages = [...initialMessages, aiMessage];

        const dbRes = await api.post('/chats', {
          title: messageToSend.slice(0, 25) + '...',
          messages: finalMessages
        });

        setSessions(prev => prev.map(s => s._id === tempId ? dbRes.data.chat : s));
        setActiveSessionId(dbRes.data.chat._id);
      } catch (error) {
        alert("AI Error.");
        setSessions(prev => prev.filter(s => s._id !== tempId));
        setActiveSessionId(null);
      } finally {
        setIsLoading(false);
      }
    } else {
      const updatedMessages = [...messages, userMessage];
      setSessions(prev => prev.map(s => s._id === activeSessionId ? { ...s, messages: updatedMessages } : s));

      try {
        const res = await api.post('/ai/chat', {
          message: messageToSend,
          history: messages.slice(-6)
        });
        
        const aiMessage = { role: 'assistant', content: res.data.reply };
        const finalMessages = [...updatedMessages, aiMessage];

        setSessions(prev => prev.map(s => s._id === activeSessionId ? { ...s, messages: finalMessages } : s));
        await api.put(`/chats/${activeSessionId}`, { messages: finalMessages });
      } catch (error) {
        alert("AI Error.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const suggestedQuestions = [
    "I want to take a 20 Lakh loan for higher studies abroad. For how many months should I take it?",
    "Should I prepay my home loan or invest in a SIP?",
    "Explain the Section 80C tax benefits.",
    "How can I improve my CIBIL score from 650?"
  ];

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white dark:bg-dark-card rounded-3xl border border-gray-100 dark:border-dark-border shadow-xl overflow-hidden">
      
      {/* --- LEFT SIDEBAR: Chat History --- */}
      <div className="w-64 border-r border-gray-100 dark:border-dark-border flex flex-col hidden md:flex bg-gray-50 dark:bg-dark-bg/50">
        <div className="p-4">
          <button 
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30 text-sm"
          >
            <Plus className="w-4 h-4" /> New Chat
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-3 space-y-1 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center py-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div></div>
          ) : sessions.length === 0 ? (
            <p className="text-center text-xs text-gray-500 mt-4">No previous chats.</p>
          ) : (
            sessions.map((session) => (
              <div
                key={session._id}
                onClick={() => setActiveSessionId(session._id)}
                className={`w-full flex items-center justify-between group px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                  activeSessionId === session._id 
                    ? 'bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm text-primary-600 dark:text-primary-400 font-medium' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-dark-card/50'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  <div className="truncate text-sm">{session.title}</div>
                </div>
                <button 
                  onClick={(e) => handleDeleteSession(e, session._id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* --- RIGHT AREA: Main Chat --- */}
      <div className="flex-1 flex flex-col relative w-full">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-dark-border bg-white/80 dark:bg-dark-card/80 backdrop-blur-md flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center border border-primary-500/20">
              <Bot className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">AI Mentor</h2>
              <p className="text-xs text-gray-500">Ask anything about finance</p>
            </div>
          </div>
        </div>

        {/* Disclaimer Bar */}
        <div className="bg-orange-50 dark:bg-orange-500/10 px-4 py-2 flex items-center justify-center gap-2 border-b border-orange-100 dark:border-orange-500/20">
          <ShieldAlert className="w-4 h-4 text-orange-500" />
          <span className="text-[11px] text-orange-700 dark:text-orange-400 font-medium">Educational only. AI does not provide financial guarantees.</span>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
          
          {/* Empty State */}
          {messages.length === 1 && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto pt-10 pb-20">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-xl shadow-primary-500/30 mb-6">
                <Bot className="w-8 h-8 text-white" />
              </motion.div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Hi, I'm Mentor 👋</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-md">
                Ask me anything about personal finance, loans, or budgeting. I can explain concepts clearly in English or Hinglish.
              </p>
              
              <div className="flex flex-col w-full max-w-lg gap-3">
                {suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(q)}
                    className="p-3 text-sm text-left bg-white dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl hover:border-primary-500/50 hover:bg-primary-50 dark:hover:bg-primary-500/5 transition-all text-gray-700 dark:text-gray-300 shadow-sm"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Bubbles */}
          {messages.length > 1 && messages.map((msg, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center shrink-0 border border-primary-500/20">
                  <Bot className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
              )}
              
              <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-3 md:p-4 shadow-sm overflow-hidden ${
                msg.role === 'user' 
                  ? 'bg-primary-600 text-white rounded-tr-sm' 
                  : 'bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-tl-sm text-gray-800 dark:text-gray-200'
              }`}>
                {msg.role === 'user' ? (
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                ) : (
                  <div className="prose prose-sm dark:prose-invert max-w-none 
                    prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white prose-headings:text-base prose-h1:text-lg prose-h2:text-base
                    prose-p:leading-relaxed prose-p:text-sm prose-p:my-2
                    prose-li:text-sm prose-li:my-1
                    prose-strong:text-primary-600 dark:prose-strong:text-primary-400
                    prose-table:w-full prose-table:border-collapse prose-table:my-3 prose-table:text-sm
                    prose-th:bg-gray-50 dark:prose-th:bg-dark-bg prose-th:p-2 prose-th:text-left prose-th:border prose-th:border-gray-200 dark:prose-th:border-gray-700
                    prose-td:p-2 prose-td:border prose-td:border-gray-200 dark:prose-td:border-gray-700
                  ">
                    {/* 👈 Yahan sanitizer laga diya hai: Agar AI <br> bhejta hai toh use nayi line mein badal do */}
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content.replace(/<br\s*\/?>/gi, '\n')}
                    </ReactMarkdown>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-800 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </div>
              )}
            </motion.div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center shrink-0 border border-primary-500/20">
                <Bot className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="bg-white dark:bg-dark-card rounded-2xl rounded-tl-sm p-3 border border-gray-100 dark:border-dark-border flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-dark-card border-t border-gray-100 dark:border-dark-border z-10">
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="max-w-3xl mx-auto relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about finance..."
              className="w-full bg-gray-100 dark:bg-dark-bg border border-transparent focus:border-primary-500/50 rounded-2xl pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white transition-all shadow-inner text-sm"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-1.5 top-1.5 bottom-1.5 bg-primary-600 text-white aspect-square rounded-xl hover:bg-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-primary-500/30"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
          <p className="text-center text-[10px] text-gray-400 mt-2">AI can make mistakes. Verify important information.</p>
        </div>
      </div>
    </div>
  );
};

export default AIChat;