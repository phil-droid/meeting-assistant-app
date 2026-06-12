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

  /**
   * =========================
   * LOAD CONVERSATIONS
   * =========================
   */
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

  /**
   * =========================
   * CREATE NEW CONVERSATION
   * =========================
   */
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

      setConversations(prev => [newConversation, ...prev]);
      setCurrentConversation(newConversation);
      setMessages([]);
      setConversationTitle('');
      setShowNewConversation(false);

      toast.success('Conversation started');
    } catch (error) {
      toast.error('Failed to start conversation');
    }
  };

  /**
   * =========================
   * LOAD HISTORY
   * =========================
   */
  const loadConversation = async (conversation) => {
    try {
      setCurrentConversation(conversation);

      const response = await chatbotService.getHistory(conversation._id);
      setMessages(response.data.data.messages || []);
    } catch (error) {
      toast.error('Failed to load conversation');
    }
  };

  /**
   * =========================
   * SEND MESSAGE (OPTIMIZED)
   * =========================
   */
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputMessage.trim() || !currentConversation) return;

    const messageToSend = inputMessage;
    setInputMessage('');
    setLoading(true);

    // optimistic UI (user message)
    setMessages(prev => [
      ...prev,
      { role: 'user', content: messageToSend }
    ]);

    try {
      const response = await chatbotService.sendMessage(
        currentConversation._id,
        messageToSend
      );

      const assistantMessage = {
        role: 'assistant',
        content: response.data.data.assistantMessage
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      toast.error('Failed to send message');

      // rollback last user message
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  /**
   * =========================
   * DELETE CONVERSATION
   * =========================
   */
  const handleDeleteConversation = async (id) => {
    if (!window.confirm('Are you sure you want to delete this conversation?')) return;

    try {
      await chatbotService.deleteConversation(id);

      setConversations(prev => prev.filter(c => c._id !== id));

      if (currentConversation?._id === id) {
        setCurrentConversation(null);
        setMessages([]);
      }

      toast.success('Conversation deleted');
    } catch (error) {
      toast.error('Failed to delete conversation');
    }
  };

  /**
   * =========================
   * UI
   * =========================
   */
  return (
    <div className="flex h-full">

      {/* SIDEBAR */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">

        <div className="p-4 border-b">
          <button
            onClick={() => setShowNewConversation(true)}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg"
          >
            <PlusIcon className="h-5 w-5" />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.map((c) => (
            <div
              key={c._id}
              onClick={() => loadConversation(c)}
              className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                currentConversation?._id === c._id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex justify-between">
                <h3 className="text-sm font-semibold truncate">
                  {c.title}
                </h3>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteConversation(c._id);
                  }}
                  className="text-red-600"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-1">
                {c.messageCount || 0} messages
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 flex flex-col bg-white">

        {currentConversation ? (
          <>
            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">

              {messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-20">
                  Start your meeting assistant chat
                </div>
              ) : (
                messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex ${
                      m.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`p-3 rounded-lg max-w-md ${
                        m.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-black'
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                ))
              )}

              {loading && (
                <div className="text-gray-400 text-sm">
                  AI is thinking...
                </div>
              )}
            </div>

            {/* INPUT */}
            <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
              <input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="flex-1 border p-2 rounded-lg"
                placeholder="Ask about your meeting..."
              />

              <button
                disabled={loading}
                className="bg-blue-600 text-white px-4 rounded-lg"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select or create a conversation
          </div>
        )}
      </div>

      {/* MODAL */}
      {showNewConversation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">

            <h2 className="text-lg font-bold mb-3">
              New Conversation
            </h2>

            <input
              value={conversationTitle}
              onChange={(e) => setConversationTitle(e.target.value)}
              className="w-full border p-2 rounded-lg mb-4"
              placeholder="Enter title"
            />

            <div className="flex gap-2">
              <button
                onClick={handleNewConversation}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg"
              >
                Create
              </button>

              <button
                onClick={() => setShowNewConversation(false)}
                className="flex-1 bg-gray-300 py-2 rounded-lg"
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