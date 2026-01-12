import { Outlet } from 'react-router-dom';
import { MessageCircle, X, Bot, ChevronDown, RotateCcw } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

import Footer from './Footer';
import NavBar from './Navbar';
import chatbotData from '../../data/chatbotData.json';

// Function to format message with bold text
const formatMessage = (text) => {
  if (!text) return null;

  // Split by newlines to handle each line
  const lines = text.split('\n');

  return lines.map((line, lineIndex) => {
    // Parse **bold** text
    const parts = [];
    let remaining = line;
    let key = 0;

    while (remaining.length > 0) {
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/);

      if (boldMatch) {
        const beforeBold = remaining.substring(0, boldMatch.index);
        if (beforeBold) {
          parts.push(<span key={key++}>{beforeBold}</span>);
        }
        parts.push(
          <span key={key++} className="font-bold text-gray-900">
            {boldMatch[1]}
          </span>
        );
        remaining = remaining.substring(boldMatch.index + boldMatch[0].length);
      } else {
        parts.push(<span key={key++}>{remaining}</span>);
        remaining = '';
      }
    }

    return (
      <span key={lineIndex}>
        {parts}
        {lineIndex < lines.length - 1 && <br />}
      </span>
    );
  });
};

const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentOptions, setCurrentOptions] = useState([]);
  const messagesEndRef = useRef(null);

  // Initialize with welcome message and main menu
  const initializeChat = () => {
    setMessages([
      {
        id: 1,
        type: 'bot',
        text: chatbotData.welcomeMessage,
        timestamp: new Date()
      }
    ]);
    setCurrentOptions(chatbotData.mainMenu.options);
  };

  useEffect(() => {
    if (messages.length === 0) {
      initializeChat();
    }
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentOptions]);

  const handleOptionClick = (option) => {
    // Add user's selection as a message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: option.label,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentOptions([]);
    setIsTyping(true);

    // Simulate bot typing delay
    setTimeout(() => {
      // Get the conversation for this option
      const conversationId = option.id;

      if (conversationId === 'main') {
        // Go back to main menu
        const botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          text: "Sure! Here's the main menu. What would you like to know about?",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
        setCurrentOptions(chatbotData.mainMenu.options);
      } else if (chatbotData.conversations[conversationId]) {
        // Show the conversation response
        const conversation = chatbotData.conversations[conversationId];
        const botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          text: conversation.message,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
        setCurrentOptions(conversation.options || []);
      }

      setIsTyping(false);
    }, 600 + Math.random() * 400);
  };

  const handleRestart = () => {
    setMessages([]);
    setTimeout(() => {
      initializeChat();
    }, 100);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Window */}
      <div
        className={`absolute bottom-20 right-0 transition-all duration-300 ${
          isOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto scale-100'
            : 'opacity-0 translate-y-4 pointer-events-none scale-95'
        }`}
      >
        <div className="w-[380px] max-w-[calc(100vw-48px)] h-[600px] max-h-[calc(100vh-150px)] bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">

          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 px-5 py-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-indigo-600" />
              </div>
              <div>
                <h3 className="text-white font-bold">{chatbotData.botName}</h3>
                <p className="text-indigo-200 text-xs">Always here to help</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleRestart}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                title="Restart conversation"
              >
                <RotateCcw className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <ChevronDown className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-end gap-2 ${
                  message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                } animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                {/* Avatar */}
                {message.type === 'bot' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}

                {/* Message Bubble */}
                <div className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-md shadow-lg'
                    : 'bg-white text-gray-800 shadow-md border border-gray-100 rounded-bl-md'
                }`}>
                  <div className="text-sm leading-relaxed">{formatMessage(message.text)}</div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-end gap-2 animate-in fade-in duration-200">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white shadow-md border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-md">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Options Buttons */}
            {!isTyping && currentOptions.length > 0 && (
              <div className="space-y-2 pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <p className="text-xs text-gray-500 font-medium ml-10 mb-2">Select an option:</p>
                <div className="flex flex-col gap-2 ml-10">
                  {currentOptions.map((option, index) => (
                    <button
                      key={option.id}
                      onClick={() => handleOptionClick(option)}
                      className="group flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-left text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:border-indigo-300 hover:text-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                      style={{
                        animationDelay: `${index * 50}ms`,
                        animation: 'fadeSlideIn 0.3s ease-out forwards',
                        opacity: 0
                      }}
                    >
                      <span className="flex-1">{option.label}</span>
                      <svg className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/80 flex-shrink-0">
            <p className="text-xs text-gray-500 text-center">
              Select an option above or{' '}
              <button
                onClick={handleRestart}
                className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline"
              >
                start over
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Pulse Ring Animation (only when closed) */}
      {!isOpen && (
        <>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 animate-ping opacity-20" />
          <div className="absolute inset-[-4px] rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 opacity-30 blur-md" />
        </>
      )}

      {/* Main Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group relative flex items-center justify-center w-16 h-16 rounded-full text-white shadow-2xl transition-all duration-300 ${
          isOpen
            ? 'bg-slate-800 hover:bg-slate-700'
            : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:scale-110 hover:shadow-indigo-500/50'
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <MessageCircle className="w-7 h-7 group-hover:scale-110 transition-transform" />
            {/* Online Indicator */}
            <div className="absolute top-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg">
              <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75" />
            </div>
          </>
        )}
      </button>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

const Layout = () => {
  return (
    <>
      <NavBar />
      <main>
        <Outlet />
      </main>
      <Footer />

      {/* Global Floating Chatbot */}
      <FloatingChatbot />
    </>
  );
};

export default Layout;