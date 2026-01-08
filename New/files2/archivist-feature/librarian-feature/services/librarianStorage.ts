/**
 * Librarian Storage Service
 * Manages conversation history and preferences in localStorage
 */

import { LibrarianConversation, LibrarianMessage } from '../types/librarian';

const STORAGE_KEYS = {
  CONVERSATIONS: 'continuity_librarian_conversations',
  ACTIVE_CONVERSATION: 'continuity_librarian_active',
  PREFERENCES: 'continuity_librarian_preferences',
};

export class LibrarianStorageService {
  /**
   * Save a conversation
   */
  saveConversation(conversation: LibrarianConversation): void {
    try {
      const conversations = this.getAllConversations();
      const existingIndex = conversations.findIndex(c => c.id === conversation.id);

      if (existingIndex >= 0) {
        conversations[existingIndex] = {
          ...conversation,
          updatedAt: Date.now(),
        };
      } else {
        conversations.push({
          ...conversation,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }

      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
    } catch (error) {
      console.error('Failed to save conversation:', error);
    }
  }

  /**
   * Get all conversations
   */
  getAllConversations(): LibrarianConversation[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load conversations:', error);
      return [];
    }
  }

  /**
   * Get a specific conversation by ID
   */
  getConversation(id: string): LibrarianConversation | null {
    const conversations = this.getAllConversations();
    return conversations.find(c => c.id === id) || null;
  }

  /**
   * Delete a conversation
   */
  deleteConversation(id: string): void {
    try {
      const conversations = this.getAllConversations();
      const filtered = conversations.filter(c => c.id !== id);
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(filtered));

      // Clear active if it was deleted
      if (this.getActiveConversationId() === id) {
        this.clearActiveConversation();
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  }

  /**
   * Add a message to a conversation
   */
  addMessage(conversationId: string, message: LibrarianMessage): void {
    const conversation = this.getConversation(conversationId);
    if (conversation) {
      conversation.messages.push(message);
      
      // Auto-title the conversation based on first user message
      if (!conversation.title && message.role === 'user') {
        conversation.title = this.generateConversationTitle(message.content);
      }
      
      this.saveConversation(conversation);
    }
  }

  /**
   * Generate a short title from the first message
   */
  private generateConversationTitle(content: string): string {
    const maxLength = 50;
    const cleaned = content.trim().replace(/\s+/g, ' ');
    
    if (cleaned.length <= maxLength) {
      return cleaned;
    }
    
    return cleaned.substring(0, maxLength - 3) + '...';
  }

  /**
   * Create a new conversation
   */
  createConversation(): LibrarianConversation {
    const conversation: LibrarianConversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.saveConversation(conversation);
    this.setActiveConversation(conversation.id);
    
    return conversation;
  }

  /**
   * Get or create active conversation
   */
  getOrCreateActiveConversation(): LibrarianConversation {
    const activeId = this.getActiveConversationId();
    
    if (activeId) {
      const conversation = this.getConversation(activeId);
      if (conversation) {
        return conversation;
      }
    }

    return this.createConversation();
  }

  /**
   * Set active conversation ID
   */
  setActiveConversation(id: string): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_CONVERSATION, id);
  }

  /**
   * Get active conversation ID
   */
  getActiveConversationId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_CONVERSATION);
  }

  /**
   * Clear active conversation
   */
  clearActiveConversation(): void {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_CONVERSATION);
  }

  /**
   * Clear all conversations
   */
  clearAllConversations(): void {
    localStorage.removeItem(STORAGE_KEYS.CONVERSATIONS);
    this.clearActiveConversation();
  }

  /**
   * Get conversation count
   */
  getConversationCount(): number {
    return this.getAllConversations().length;
  }

  /**
   * Get total message count across all conversations
   */
  getTotalMessageCount(): number {
    const conversations = this.getAllConversations();
    return conversations.reduce((sum, conv) => sum + conv.messages.length, 0);
  }

  /**
   * Export conversations as JSON
   */
  exportConversations(): string {
    const conversations = this.getAllConversations();
    return JSON.stringify(conversations, null, 2);
  }

  /**
   * Import conversations from JSON
   */
  importConversations(jsonData: string): boolean {
    try {
      const conversations = JSON.parse(jsonData) as LibrarianConversation[];
      
      // Validate structure
      if (!Array.isArray(conversations)) {
        throw new Error('Invalid data format');
      }

      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
      return true;
    } catch (error) {
      console.error('Failed to import conversations:', error);
      return false;
    }
  }
}

// Export singleton instance
export const librarianStorage = new LibrarianStorageService();
