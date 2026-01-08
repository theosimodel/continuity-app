/**
 * Archivist Chat Component
 * Main interface for conversing with The Archivist AI
 */

import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import { LibrarianMessage, ArchivistRecommendation } from '../types/librarian';
import { librarianService, parseArchivistResponse } from '../services/librarianService';
import { librarianStorage } from '../services/librarianStorage';
import { buildLibrarianContext } from '../utils/contextBuilder';
import { Comic, ReadState } from '../types';
import RecommendationCard from './RecommendationCard';

interface ArchivistChatProps {
  comics: Comic[];
  className?: string;
  onAddToCollection?: (comic: Comic, state: ReadState) => Promise<void>;
}

// Quick action chips for common queries
const quickChips = [
  { label: 'Help me get started', query: "I'm new to comics. How should I get started?" },
  { label: 'Essential comics', query: 'What are some essential comics everyone should read?' },
  { label: 'Popular right now', query: 'What comic series are popular right now?' },
  { label: 'Top creators', query: 'Who are legendary comic creators I should know?' },
];

export const ArchivistChat: React.FC<ArchivistChatProps> = ({ comics, className = '', onAddToCollection }) => {
  const [messages, setMessages] = useState<LibrarianMessage[]>([]);
  const [input, setInput] = useState('');
  const [parsedRecommendations, setParsedRecommendations] = useState<Map<string, ArchivistRecommendation[]>>(new Map());
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

      // Parse response to extract recommendations
      const parsed = parseArchivistResponse(response);

      const assistantMessage: LibrarianMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        role: 'assistant',
        content: parsed.message, // Store only the message part (without JSON)
        timestamp: Date.now(),
        context,
      };

      // Store recommendations keyed by message ID
      if (parsed.recommendations.length > 0) {
        setParsedRecommendations(prev => {
          const newMap = new Map(prev);
          newMap.set(assistantMessage.id, parsed.recommendations);
          return newMap;
        });
      }

      // Add assistant message
      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);
      librarianStorage.addMessage(conversationId, assistantMessage);

    } catch (error) {
      console.error('Failed to get archivist response:', error);

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
      <div className="border-b border-white/[0.08] p-4 bg-[#0F141C]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#8B5CF6]" />
          <h2 className="text-xl font-bold text-white/[0.92]">The Archivist</h2>
        </div>
        <p className="text-sm text-white/70 mt-1">
          Your personal comic book guide
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0B0F14]">
        {messages.length === 0 && (
          <div className="text-center text-white/70 mt-8">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-[#8B5CF6]" />
            <p className="text-lg font-semibold mb-2 text-white/[0.92]">Ask me anything!</p>
            <p className="text-sm">
              Ask about creators, runs, reading order, or recommendations.
            </p>
          </div>
        )}

        {messages.map((message) => {
          const recommendations = message.role === 'assistant' ? parsedRecommendations.get(message.id) : undefined;

          return (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-[rgba(139,92,246,0.14)] border border-[rgba(139,92,246,0.35)] text-white/[0.92]'
                    : 'bg-[#121A24] text-white/[0.92]'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
                    <span className="text-xs text-[#8B5CF6] font-semibold">The Archivist</span>
                  </div>
                )}
                <div className="prose prose-invert max-w-none text-sm">
                  {message.content.split('\n').map((line, i) => (
                    <p key={i} className="mb-2 last:mb-0">
                      {line}
                    </p>
                  ))}
                </div>

                {/* Render recommendation cards if present */}
                {recommendations && recommendations.length > 0 && onAddToCollection && (
                  <div className="mt-3 space-y-2">
                    {recommendations.map((rec, idx) => (
                      <RecommendationCard
                        key={`${message.id}-rec-${idx}`}
                        recommendation={rec}
                        onAddToCollection={onAddToCollection}
                        existingComics={comics}
                      />
                    ))}
                  </div>
                )}

                <div className="text-xs text-white/[0.45] mt-1">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#121A24] rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#8B5CF6]" />
                <span className="text-sm text-white/70">Consulting the archives...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/[0.08] p-4 bg-[#0F141C]">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask The Archivist..."
            disabled={isLoading}
            className="flex-1 bg-white/[0.04] border border-white/[0.08] text-white/[0.92] placeholder:text-white/[0.45] rounded-lg px-4 py-2 focus:outline-none focus:border-[rgba(139,92,246,0.55)] focus:ring-4 focus:ring-[rgba(139,92,246,0.35)] disabled:opacity-50 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`rounded-lg px-4 py-2 transition-colors ${
              input.trim()
                ? 'bg-white/[0.06] hover:bg-white/[0.09] text-[#8B5CF6]'
                : 'bg-transparent text-white/70 hover:bg-white/[0.06]'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Quick Action Chips */}
        <div className="flex flex-wrap gap-2 mt-3">
          {quickChips.map((chip) => (
            <button
              key={chip.label}
              onClick={() => setInput(chip.query)}
              disabled={isLoading}
              className="text-xs px-3 py-1.5 rounded-md bg-[#67D8C6] text-[#0B0F14] font-medium hover:bg-[#53C8B6] transition-all disabled:opacity-50"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ArchivistChat;
