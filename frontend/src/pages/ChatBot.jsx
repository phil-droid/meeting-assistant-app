import React, { useEffect, useState } from 'react';
import { chatbotService } from '../services/api';
import toast from 'react-hot-toast';
import { PlusIcon, TrashIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

function ChatBot() {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [conversationTitle, setConversationTitle] = useState('');

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await chatbotService.getConversations();
      setConversations(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch conversations');
    }
  };

  const handleNewConversation = async () => {
    if (!conversationTitle.trim()) {
      toast.error('Please enter a title');
      return;
    }
    try {
      const response = await chatbotService.startConversation({
        title: conversationTitle,
        context: 'Meeting assistance'
      });
      const newConversation = response.data.data;
      setConversations([...conversations, newConversation]);
      setCurrentConversation(newConversation);
      setMessages([]);
      setConversationTitle('');
      setShowNewConversation(false);
      toast.success('Conversation started');
    } catch (error) {
      toast.error('Failed to start conversation');
    }
  };

  const loadConversation = async (conversation) => {
    try {
      setCurrentConversation(conversation);
      const response = await chatbotService.getHistory(conversation.id);
      setMessages(response.data.data.messages || []);
    } catch (error) {
      toast.error('Failed to load conversation');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !currentConversation) return;

    const userMessage = { role: 'user', content: inputMessage };
    setMessages([...messages, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await chatbotService.sendMessage(currentConversation.id, inputMessage);
      const assistantMessage = {
        role: 'assistant',
        content: response.data.data.assistantMessage
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast.error('Failed to send message');
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConversation = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await chatbotService.deleteConversation(id);
        if (currentConversation?.id === id) {
          setCurrentConversation(null);
          setMessages([]);
        }
        setConversations(conversations.filter(c => c.id !== id));
        toast.success('Conversation deleted');
      } catch (error) {
        toast.error('Failed to delete conversation');
      }
    }
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b">
          <button
            onClick={() => setShowNewConversation(true)}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map(conversation => (
            <div
              key={conversation.id}
              onClick={() => loadConversation(conversation)}
              className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                currentConversation?.id === conversation.id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-semibold text-gray-900 text-sm truncate flex-1">
                  {conversation.title}
                </h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteConversation(conversation.id);
                  }}
                  className="text-red-600 hover:text-red-700 flex-shrink-0"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">{conversation.messageCount} messages</p>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {currentConversation ? (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <p className="text-lg font-semibold mb-2">Start the conversation</p>
                    <p className="text-sm">Ask me about your meeting insights, action items, or anything else!</p>
                  </div>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md p-4 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))
              )}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 p-4">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !inputMessage.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <p className="text-lg font-semibold mb-2">No conversation selected</p>
              <p className="text-sm">Start a new chat or select an existing one</p>
            </div>
          </div>
        )}
      </div>

      {/* New Conversation Modal */}
      {showNewConversation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">New Conversation</h2>
            <input
              type="text"
              value={conversationTitle}
              onChange={(e) => setConversationTitle(e.target.value)}
              placeholder="Conversation title (e.g., Team Meeting Q4)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-4"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleNewConversation}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg"
              >
                Start Chat
              </button>
              <button
                onClick={() => setShowNewConversation(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-bold py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatBot;
