/**
 * Chat model class representing a chat message
 */
class Chat {
    constructor(data = {}) {
        this.id = data.id || this.generateId();
        this.fromUserId = data.fromUserId || '';
        this.toUserId = data.toUserId || '';
        this.message = data.message || '';
        this.timestamp = data.timestamp || new Date().toISOString();
        this.isRead = data.isRead || false;
        this.isEdited = data.isEdited || false;
        this.editedAt = data.editedAt || null;
        this.messageType = data.messageType || 'text'; // 'text', 'image', 'file'
        this.metadata = data.metadata || {}; // Additional data for different message types
    }

    /**
     * Generate unique chat message ID
     * @returns {string} Unique ID
     */
    generateId() {
        return 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Mark message as read
     */
    markAsRead() {
        this.isRead = true;
    }

    /**
     * Edit the message
     * @param {string} newMessage - New message content
     */
    edit(newMessage) {
        if (this.messageType !== 'text') {
            throw new Error('Only text messages can be edited');
        }
        
        this.message = newMessage;
        this.isEdited = true;
        this.editedAt = new Date().toISOString();
    }

    /**
     * Check if message was sent by specific user
     * @param {string} userId - User ID to check
     * @returns {boolean} True if sent by user
     */
    isSentBy(userId) {
        return this.fromUserId === userId;
    }

    /**
     * Check if message was received by specific user
     * @param {string} userId - User ID to check
     * @returns {boolean} True if received by user
     */
    isReceivedBy(userId) {
        return this.toUserId === userId;
    }

    /**
     * Get formatted timestamp
     * @returns {string} Formatted timestamp
     */
    getFormattedTime() {
        return UIHelper.formatTime(this.timestamp);
    }

    /**
     * Get formatted date
     * @returns {string} Formatted date
     */
    getFormattedDate() {
        return UIHelper.formatDate(this.timestamp);
    }

    /**
     * Get time ago string
     * @returns {string} Time ago string
     */
    getTimeAgo() {
        const now = new Date();
        const messageTime = new Date(this.timestamp);
        const diffMs = now - messageTime;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    }

    /**
     * Get message preview (truncated message)
     * @param {number} maxLength - Maximum length
     * @returns {string} Truncated message
     */
    getPreview(maxLength = 50) {
        switch (this.messageType) {
            case 'image':
                return '📷 Image';
            case 'file':
                return '📎 File';
            default:
                return UIHelper.truncateText(this.message, maxLength);
        }
    }

    /**
     * Validate message content
     * @returns {Object} Validation result
     */
    validate() {
        const errors = [];

        if (!this.fromUserId) {
            errors.push('From user ID is required');
        }

        if (!this.toUserId) {
            errors.push('To user ID is required');
        }

        if (this.fromUserId === this.toUserId) {
            errors.push('Cannot send message to yourself');
        }

        const validation = Validator.validateMessage(this.message);
        if (!validation.isValid) {
            errors.push(validation.message);
        }

        const validTypes = ['text', 'image', 'file'];
        if (!validTypes.includes(this.messageType)) {
            errors.push('Invalid message type');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Export chat data for storage
     * @returns {Object} Serializable chat data
     */
    toJSON() {
        return {
            id: this.id,
            fromUserId: this.fromUserId,
            toUserId: this.toUserId,
            message: this.message,
            timestamp: this.timestamp,
            isRead: this.isRead,
            isEdited: this.isEdited,
            editedAt: this.editedAt,
            messageType: this.messageType,
            metadata: this.metadata
        };
    }

    /**
     * Create Chat instance from stored data
     * @param {Object} data - Stored chat data
     * @returns {Chat} Chat instance
     */
    static fromJSON(data) {
        return new Chat(data);
    }

    /**
     * Create a new text message
     * @param {string} fromUserId - Sender user ID
     * @param {string} toUserId - Receiver user ID
     * @param {string} message - Message content
     * @returns {Chat} New chat instance
     */
    static createTextMessage(fromUserId, toUserId, message) {
        return new Chat({
            fromUserId,
            toUserId,
            message,
            messageType: 'text'
        });
    }

    /**
     * Create a new image message
     * @param {string} fromUserId - Sender user ID
     * @param {string} toUserId - Receiver user ID
     * @param {string} imageUrl - Image URL
     * @param {string} caption - Optional caption
     * @returns {Chat} New chat instance
     */
    static createImageMessage(fromUserId, toUserId, imageUrl, caption = '') {
        return new Chat({
            fromUserId,
            toUserId,
            message: caption,
            messageType: 'image',
            metadata: { imageUrl }
        });
    }

    /**
     * Create a new file message
     * @param {string} fromUserId - Sender user ID
     * @param {string} toUserId - Receiver user ID
     * @param {string} fileUrl - File URL
     * @param {string} fileName - File name
     * @param {number} fileSize - File size in bytes
     * @returns {Chat} New chat instance
     */
    static createFileMessage(fromUserId, toUserId, fileUrl, fileName, fileSize) {
        return new Chat({
            fromUserId,
            toUserId,
            message: fileName,
            messageType: 'file',
            metadata: { fileUrl, fileName, fileSize }
        });
    }

    /**
     * Get messages between two users
     * @param {string} userId1 - First user ID
     * @param {string} userId2 - Second user ID
     * @param {Array} messages - Array of messages
     * @param {number} limit - Optional limit
     * @returns {Array} Filtered and sorted messages
     */
    static getConversation(userId1, userId2, messages, limit = null) {
        let conversation = messages
            .filter(msg => 
                (msg.fromUserId === userId1 && msg.toUserId === userId2) ||
                (msg.fromUserId === userId2 && msg.toUserId === userId1)
            )
            .map(msg => Chat.fromJSON(msg))
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        if (limit) {
            conversation = conversation.slice(-limit);
        }

        return conversation;
    }

    /**
     * Get unread message count for a user
     * @param {string} userId - User ID
     * @param {Array} messages - Array of messages
     * @returns {number} Unread message count
     */
    static getUnreadCount(userId, messages) {
        return messages.filter(msg => 
            msg.toUserId === userId && !msg.isRead
        ).length;
    }

    /**
     * Get unread messages for a user
     * @param {string} userId - User ID
     * @param {Array} messages - Array of messages
     * @returns {Array} Unread messages
     */
    static getUnreadMessages(userId, messages) {
        return messages
            .filter(msg => msg.toUserId === userId && !msg.isRead)
            .map(msg => Chat.fromJSON(msg))
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }

    /**
     * Mark all messages as read for a conversation
     * @param {string} currentUserId - Current user ID
     * @param {string} otherUserId - Other user ID
     * @param {Array} messages - Array of messages
     * @returns {Array} Updated messages
     */
    static markConversationAsRead(currentUserId, otherUserId, messages) {
        return messages.map(msg => {
            if (msg.toUserId === currentUserId && msg.fromUserId === otherUserId && !msg.isRead) {
                const chatMsg = Chat.fromJSON(msg);
                chatMsg.markAsRead();
                return chatMsg.toJSON();
            }
            return msg;
        });
    }

    /**
     * Get conversation statistics
     * @param {string} userId1 - First user ID
     * @param {string} userId2 - Second user ID
     * @param {Array} messages - Array of messages
     * @returns {Object} Conversation statistics
     */
    static getConversationStats(userId1, userId2, messages) {
        const conversation = Chat.getConversation(userId1, userId2, messages);
        
        const totalMessages = conversation.length;
        const messagesByUser1 = conversation.filter(msg => msg.isSentBy(userId1)).length;
        const messagesByUser2 = conversation.filter(msg => msg.isSentBy(userId2)).length;
        const unreadByUser1 = conversation.filter(msg => 
            msg.isReceivedBy(userId1) && !msg.isRead
        ).length;
        const unreadByUser2 = conversation.filter(msg => 
            msg.isReceivedBy(userId2) && !msg.isRead
        ).length;

        const firstMessage = conversation[0];
        const lastMessage = conversation[conversation.length - 1];

        return {
            totalMessages,
            messagesByUser1,
            messagesByUser2,
            unreadByUser1,
            unreadByUser2,
            firstMessageDate: firstMessage ? firstMessage.timestamp : null,
            lastMessageDate: lastMessage ? lastMessage.timestamp : null
        };
    }

    /**
     * Search messages by content
     * @param {string} query - Search query
     * @param {Array} messages - Array of messages
     * @param {string} userId - Optional user ID filter
     * @returns {Array} Matching messages
     */
    static searchMessages(query, messages, userId = null) {
        if (!query || query.trim().length === 0) return [];

        const lowerQuery = query.toLowerCase();
        let filteredMessages = messages;

        if (userId) {
            filteredMessages = messages.filter(msg => 
                msg.fromUserId === userId || msg.toUserId === userId
            );
        }

        return filteredMessages
            .filter(msg => msg.message.toLowerCase().includes(lowerQuery))
            .map(msg => Chat.fromJSON(msg))
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    /**
     * Get recent conversations for a user
     * @param {string} userId - User ID
     * @param {Array} messages - Array of messages
     * @param {number} limit - Maximum number of conversations
     * @returns {Array} Recent conversations with last message
     */
    static getRecentConversations(userId, messages, limit = 10) {
        const userMessages = messages.filter(msg => 
            msg.fromUserId === userId || msg.toUserId === userId
        );

        const conversationMap = new Map();

        // Find the latest message for each conversation
        userMessages.forEach(msg => {
            const otherUserId = msg.fromUserId === userId ? msg.toUserId : msg.fromUserId;
            const existing = conversationMap.get(otherUserId);
            
            if (!existing || new Date(msg.timestamp) > new Date(existing.timestamp)) {
                conversationMap.set(otherUserId, msg);
            }
        });

        // Convert to array and sort by last message timestamp
        return Array.from(conversationMap.entries())
            .map(([otherUserId, lastMessage]) => ({
                otherUserId,
                lastMessage: Chat.fromJSON(lastMessage),
                unreadCount: Chat.getUnreadCount(userId, 
                    Chat.getConversation(userId, otherUserId, messages)
                        .map(chat => chat.toJSON())
                )
            }))
            .sort((a, b) => 
                new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp)
            )
            .slice(0, limit);
    }

    /**
     * Delete a message (soft delete)
     * @param {string} messageId - Message ID
     * @param {Array} messages - Array of messages
     * @returns {Array} Updated messages array
     */
    static deleteMessage(messageId, messages) {
        return messages.filter(msg => msg.id !== messageId);
    }

    /**
     * Get messages by date range
     * @param {string} startDate - Start date ISO string
     * @param {string} endDate - End date ISO string
     * @param {Array} messages - Array of messages
     * @returns {Array} Filtered messages
     */
    static getMessagesByDateRange(startDate, endDate, messages) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        return messages
            .filter(msg => {
                const msgDate = new Date(msg.timestamp);
                return msgDate >= start && msgDate <= end;
            })
            .map(msg => Chat.fromJSON(msg))
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }
}

// Export for global use
window.Chat = Chat;