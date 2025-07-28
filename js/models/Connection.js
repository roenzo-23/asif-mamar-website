/**
 * Connection model class representing a connection between users
 */
class Connection {
    constructor(data = {}) {
        this.id = data.id || this.generateId();
        this.fromUserId = data.fromUserId || '';
        this.toUserId = data.toUserId || '';
        this.status = data.status || 'pending'; // 'pending', 'accepted', 'rejected'
        this.message = data.message || '';
        this.timestamp = data.timestamp || new Date().toISOString();
        this.acceptedAt = data.acceptedAt || null;
        this.rejectedAt = data.rejectedAt || null;
    }

    /**
     * Generate unique connection ID
     * @returns {string} Unique ID
     */
    generateId() {
        return 'conn-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Accept the connection
     */
    accept() {
        this.status = 'accepted';
        this.acceptedAt = new Date().toISOString();
        this.rejectedAt = null;
    }

    /**
     * Reject the connection
     */
    reject() {
        this.status = 'rejected';
        this.rejectedAt = new Date().toISOString();
        this.acceptedAt = null;
    }

    /**
     * Check if connection is pending
     * @returns {boolean} True if pending
     */
    isPending() {
        return this.status === 'pending';
    }

    /**
     * Check if connection is accepted
     * @returns {boolean} True if accepted
     */
    isAccepted() {
        return this.status === 'accepted';
    }

    /**
     * Check if connection is rejected
     * @returns {boolean} True if rejected
     */
    isRejected() {
        return this.status === 'rejected';
    }

    /**
     * Get the other user ID in the connection
     * @param {string} currentUserId - Current user ID
     * @returns {string} Other user ID
     */
    getOtherUserId(currentUserId) {
        return this.fromUserId === currentUserId ? this.toUserId : this.fromUserId;
    }

    /**
     * Check if current user is the sender
     * @param {string} currentUserId - Current user ID
     * @returns {boolean} True if current user is sender
     */
    isSentBy(currentUserId) {
        return this.fromUserId === currentUserId;
    }

    /**
     * Check if current user is the receiver
     * @param {string} currentUserId - Current user ID
     * @returns {boolean} True if current user is receiver
     */
    isReceivedBy(currentUserId) {
        return this.toUserId === currentUserId;
    }

    /**
     * Get formatted timestamp
     * @returns {string} Formatted timestamp
     */
    getFormattedTimestamp() {
        return UIHelper.formatDate(this.timestamp);
    }

    /**
     * Get formatted accepted date
     * @returns {string} Formatted accepted date
     */
    getFormattedAcceptedDate() {
        return this.acceptedAt ? UIHelper.formatDate(this.acceptedAt) : '';
    }

    /**
     * Get connection duration (if accepted)
     * @returns {number} Duration in days
     */
    getConnectionDuration() {
        if (!this.isAccepted()) return 0;
        
        const acceptedDate = new Date(this.acceptedAt);
        const now = new Date();
        const diffTime = Math.abs(now - acceptedDate);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    /**
     * Export connection data for storage
     * @returns {Object} Serializable connection data
     */
    toJSON() {
        return {
            id: this.id,
            fromUserId: this.fromUserId,
            toUserId: this.toUserId,
            status: this.status,
            message: this.message,
            timestamp: this.timestamp,
            acceptedAt: this.acceptedAt,
            rejectedAt: this.rejectedAt
        };
    }

    /**
     * Create Connection instance from stored data
     * @param {Object} data - Stored connection data
     * @returns {Connection} Connection instance
     */
    static fromJSON(data) {
        return new Connection(data);
    }

    /**
     * Create a new connection request
     * @param {string} fromUserId - Sender user ID
     * @param {string} toUserId - Receiver user ID
     * @param {string} message - Optional message
     * @returns {Connection} New connection instance
     */
    static createRequest(fromUserId, toUserId, message = '') {
        return new Connection({
            fromUserId,
            toUserId,
            message,
            status: 'pending'
        });
    }

    /**
     * Validate connection data
     * @param {Object} data - Connection data to validate
     * @returns {Object} Validation result
     */
    static validate(data) {
        const errors = [];

        if (!data.fromUserId) {
            errors.push('From user ID is required');
        }

        if (!data.toUserId) {
            errors.push('To user ID is required');
        }

        if (data.fromUserId === data.toUserId) {
            errors.push('Cannot connect to yourself');
        }

        if (data.message && data.message.length > 500) {
            errors.push('Message cannot exceed 500 characters');
        }

        const validStatuses = ['pending', 'accepted', 'rejected'];
        if (data.status && !validStatuses.includes(data.status)) {
            errors.push('Invalid connection status');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Check if users are already connected
     * @param {string} userId1 - First user ID
     * @param {string} userId2 - Second user ID
     * @param {Array} connections - Array of connections
     * @returns {Connection|null} Existing connection or null
     */
    static findExisting(userId1, userId2, connections) {
        return connections.find(conn =>
            (conn.fromUserId === userId1 && conn.toUserId === userId2) ||
            (conn.fromUserId === userId2 && conn.toUserId === userId1)
        ) || null;
    }

    /**
     * Get connections for a specific user
     * @param {string} userId - User ID
     * @param {Array} connections - Array of connections
     * @param {string} status - Optional status filter
     * @returns {Array} Filtered connections
     */
    static getForUser(userId, connections, status = null) {
        let userConnections = connections.filter(conn =>
            conn.fromUserId === userId || conn.toUserId === userId
        );

        if (status) {
            userConnections = userConnections.filter(conn => conn.status === status);
        }

        return userConnections.map(conn => Connection.fromJSON(conn));
    }

    /**
     * Get pending connection requests for a user
     * @param {string} userId - User ID
     * @param {Array} connections - Array of connections
     * @returns {Object} Sent and received pending requests
     */
    static getPendingRequests(userId, connections) {
        const pending = connections.filter(conn => conn.status === 'pending');
        
        const sent = pending.filter(conn => conn.fromUserId === userId)
            .map(conn => Connection.fromJSON(conn));
        
        const received = pending.filter(conn => conn.toUserId === userId)
            .map(conn => Connection.fromJSON(conn));

        return { sent, received };
    }

    /**
     * Get connection statistics for a user
     * @param {string} userId - User ID
     * @param {Array} connections - Array of connections
     * @returns {Object} Connection statistics
     */
    static getStats(userId, connections) {
        const userConnections = connections.filter(conn =>
            conn.fromUserId === userId || conn.toUserId === userId
        );

        const accepted = userConnections.filter(conn => conn.status === 'accepted');
        const pending = userConnections.filter(conn => conn.status === 'pending');
        const sent = userConnections.filter(conn => 
            conn.fromUserId === userId && conn.status === 'pending'
        );
        const received = userConnections.filter(conn => 
            conn.toUserId === userId && conn.status === 'pending'
        );

        return {
            total: userConnections.length,
            accepted: accepted.length,
            pending: pending.length,
            sent: sent.length,
            received: received.length
        };
    }

    /**
     * Sort connections by various criteria
     * @param {Array} connections - Array of connections
     * @param {string} sortBy - Sort criteria
     * @returns {Array} Sorted connections
     */
    static sort(connections, sortBy = 'timestamp') {
        const connectionsArray = connections.map(conn => 
            conn instanceof Connection ? conn : Connection.fromJSON(conn)
        );

        switch (sortBy) {
            case 'timestamp':
                return connectionsArray.sort((a, b) => 
                    new Date(b.timestamp) - new Date(a.timestamp)
                );
            case 'acceptedAt':
                return connectionsArray.sort((a, b) => {
                    if (!a.acceptedAt && !b.acceptedAt) return 0;
                    if (!a.acceptedAt) return 1;
                    if (!b.acceptedAt) return -1;
                    return new Date(b.acceptedAt) - new Date(a.acceptedAt);
                });
            case 'status':
                const statusOrder = { pending: 0, accepted: 1, rejected: 2 };
                return connectionsArray.sort((a, b) => 
                    statusOrder[a.status] - statusOrder[b.status]
                );
            default:
                return connectionsArray;
        }
    }
}

// Export for global use
window.Connection = Connection;