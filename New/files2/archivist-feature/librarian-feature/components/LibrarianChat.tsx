/**
 * Librarian Chat Component
 * Main interface for conversing with the AI librarian
 */

import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import { LibrarianMessage } from '../types/librarian';
import { librarianService } from '../services/librarianService';
import { librarianStorage } from '../services/librarianStorage';
import { buildLibrarianContext } from '../utils/contextBuilder';
import { Comic } from '../types/librarian';

interface LibrarianChatProps {
  comics: Comic[];
  className?: string;
}

export const LibrarianChat: React.FC<LibrarianChatProps> = ({ comics, className = '' }) => {
  const [messages, setMessages] = useState<LibrarianMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load or create conversation on mount
  useEffect(() => {
    const conversation = librarianStorage.getOrCreateActiveConversation();
    setConversationId(conversation.id);
    setMessages(conversation.messages);
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: LibrarianMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    // Add user message
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    librarianStorage.addMessage(conversationId, userMessage);
    setInput('');
    setIsLoading(true);

    try {
      // Build context from user's comics
      const context = buildLibrarianContext(comics);

      // Get AI response
      const response = await librarianService.chat(
        userMessage.content,
        context,
        updatedMessages
      );

      const assistantMessage: LibrarianMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
        context,
      };

      // Add assistant message
      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);
      librarianStorage.addMessage(conversationId, assistantMessage);

    } catch (error) {
      console.error('Failed to get librarian response:', error);
      
      const errorMessage: LibrarianMessage = {
        id: `msg_${Date.now()}_error`,
        role: 'assistant',
        content: "I'm having trouble responding right now. Please try again!",
        timestamp: Date.now(),
      };
      
      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-700 p-4 bg-gray-800">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h2 className="text-xl font-bold text-white">The Archivist</h2>
        </div>
        <p className="text-sm text-gray-400 mt-1">
          Your personal comic book guide
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-8">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-purple-400" />
            <p className="text-lg font-semibold mb-2">Ask me anything!</p>
            <p className="text-sm">
              I've cataloged every comic in existence and I know your collection.
            </p>
            <ul className="text-sm mt-3 space-y-1">
              <li>"What should I read next?"</li>
              <li>"Tell me about my reading stats"</li>
              <li>"What am I missing from Saga?"</li>
              <li>"Recommend something like Sandman"</li>
            </ul>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-100'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-purple-400 font-semibold">The Archivist</span>
                </div>
              )}
              <div className="prose prose-invert max-w-none text-sm">
                {message.content.split('\n').map((line, i) => (
                  <p key={i} className="mb-2 last:mb-0">
                    {line}
                  </p>
                ))}
              </div>
              <div className="text-xs opacity-60 mt-1">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                <span className="text-sm text-gray-300">Consulting the archives...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-700 p-4 bg-gray-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask The Archivist..."
            disabled={isLoading}
            className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2 transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send • Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default LibrarianChat;
