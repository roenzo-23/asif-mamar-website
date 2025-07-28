/**
 * LocalStorage utility class for managing data persistence
 */
class StorageManager {
    constructor() {
        this.keys = {
            USERS: 'skillswap_users',
            CURRENT_USER: 'skillswap_current_user',
            CONNECTIONS: 'skillswap_connections',
            CHATS: 'skillswap_chats',
            THEME: 'skillswap_theme'
        };
    }

    /**
     * Get data from localStorage
     * @param {string} key - Storage key
     * @param {*} defaultValue - Default value if key doesn't exist
     * @returns {*} Parsed data or default value
     */
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.warn('Error parsing stored data:', error);
            return defaultValue;
        }
    }

    /**
     * Set data in localStorage
     * @param {string} key - Storage key
     * @param {*} value - Data to store
     */
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Error storing data:', error);
        }
    }

    /**
     * Remove data from localStorage
     * @param {string} key - Storage key
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Error removing data:', error);
        }
    }

    /**
     * Clear all app data from localStorage
     */
    clear() {
        try {
            Object.values(this.keys).forEach(key => {
                localStorage.removeItem(key);
            });
        } catch (error) {
            console.error('Error clearing data:', error);
        }
    }

    /**
     * Get all users
     * @returns {Array} Array of user objects
     */
    getUsers() {
        return this.get(this.keys.USERS, []);
    }

    /**
     * Save users array
     * @param {Array} users - Array of user objects
     */
    setUsers(users) {
        this.set(this.keys.USERS, users);
    }

    /**
     * Add a new user
     * @param {Object} user - User object
     */
    addUser(user) {
        const users = this.getUsers();
        users.push(user);
        this.setUsers(users);
    }

    /**
     * Update an existing user
     * @param {string} userId - User ID
     * @param {Object} userData - Updated user data
     */
    updateUser(userId, userData) {
        const users = this.getUsers();
        const userIndex = users.findIndex(user => user.id === userId);
        if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], ...userData };
            this.setUsers(users);
        }
    }

    /**
     * Get user by ID
     * @param {string} userId - User ID
     * @returns {Object|null} User object or null
     */
    getUserById(userId) {
        const users = this.getUsers();
        return users.find(user => user.id === userId) || null;
    }

    /**
     * Get user by email
     * @param {string} email - User email
     * @returns {Object|null} User object or null
     */
    getUserByEmail(email) {
        const users = this.getUsers();
        return users.find(user => user.email === email) || null;
    }

    /**
     * Get current logged in user
     * @returns {Object|null} Current user object or null
     */
    getCurrentUser() {
        return this.get(this.keys.CURRENT_USER);
    }

    /**
     * Set current logged in user
     * @param {Object} user - User object
     */
    setCurrentUser(user) {
        this.set(this.keys.CURRENT_USER, user);
    }

    /**
     * Remove current user (logout)
     */
    removeCurrentUser() {
        this.remove(this.keys.CURRENT_USER);
    }

    /**
     * Get all connections
     * @returns {Array} Array of connection objects
     */
    getConnections() {
        return this.get(this.keys.CONNECTIONS, []);
    }

    /**
     * Save connections array
     * @param {Array} connections - Array of connection objects
     */
    setConnections(connections) {
        this.set(this.keys.CONNECTIONS, connections);
    }

    /**
     * Add a new connection
     * @param {Object} connection - Connection object
     */
    addConnection(connection) {
        const connections = this.getConnections();
        connections.push(connection);
        this.setConnections(connections);
    }

    /**
     * Get connections for a specific user
     * @param {string} userId - User ID
     * @returns {Array} Array of connections
     */
    getUserConnections(userId) {
        const connections = this.getConnections();
        return connections.filter(conn => 
            conn.fromUserId === userId || conn.toUserId === userId
        );
    }

    /**
     * Check if two users are connected
     * @param {string} userId1 - First user ID
     * @param {string} userId2 - Second user ID
     * @returns {boolean} True if connected
     */
    areUsersConnected(userId1, userId2) {
        const connections = this.getConnections();
        return connections.some(conn =>
            (conn.fromUserId === userId1 && conn.toUserId === userId2) ||
            (conn.fromUserId === userId2 && conn.toUserId === userId1)
        );
    }

    /**
     * Get all chats
     * @returns {Array} Array of chat objects
     */
    getChats() {
        return this.get(this.keys.CHATS, []);
    }

    /**
     * Save chats array
     * @param {Array} chats - Array of chat objects
     */
    setChats(chats) {
        this.set(this.keys.CHATS, chats);
    }

    /**
     * Add a new chat message
     * @param {Object} message - Message object
     */
    addChatMessage(message) {
        const chats = this.getChats();
        chats.push(message);
        this.setChats(chats);
    }

    /**
     * Get chat messages between two users
     * @param {string} userId1 - First user ID
     * @param {string} userId2 - Second user ID
     * @returns {Array} Array of messages
     */
    getChatMessages(userId1, userId2) {
        const chats = this.getChats();
        return chats.filter(chat =>
            (chat.fromUserId === userId1 && chat.toUserId === userId2) ||
            (chat.fromUserId === userId2 && chat.toUserId === userId1)
        ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }

    /**
     * Get theme preference
     * @returns {string} Theme preference ('light' or 'dark')
     */
    getTheme() {
        return this.get(this.keys.THEME, 'light');
    }

    /**
     * Set theme preference
     * @param {string} theme - Theme preference ('light' or 'dark')
     */
    setTheme(theme) {
        this.set(this.keys.THEME, theme);
    }

    /**
     * Initialize with sample data if empty
     */
    initializeSampleData() {
        const users = this.getUsers();
        if (users.length === 0) {
            const sampleUsers = [
                {
                    id: 'user-1',
                    name: 'Alex Johnson',
                    email: 'alex@example.com',
                    location: 'San Francisco, CA',
                    bio: 'Full-stack developer passionate about teaching and learning new technologies.',
                    skillsOffered: ['JavaScript', 'React', 'Node.js', 'Python'],
                    skillsWanted: ['Machine Learning', 'DevOps', 'UI/UX Design'],
                    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
                    joinDate: new Date('2023-01-15').toISOString(),
                    lastActive: new Date().toISOString()
                },
                {
                    id: 'user-2',
                    name: 'Sarah Chen',
                    email: 'sarah@example.com',
                    location: 'New York, NY',
                    bio: 'Data scientist and ML engineer who loves sharing knowledge about AI and statistics.',
                    skillsOffered: ['Python', 'Machine Learning', 'Data Analysis', 'Statistics'],
                    skillsWanted: ['Web Development', 'Mobile Development', 'Cloud Computing'],
                    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b17c?w=150&h=150&fit=crop&crop=face',
                    joinDate: new Date('2023-02-20').toISOString(),
                    lastActive: new Date().toISOString()
                },
                {
                    id: 'user-3',
                    name: 'Michael Rodriguez',
                    email: 'michael@example.com',
                    location: 'Austin, TX',
                    bio: 'UI/UX designer with a background in psychology, focused on human-centered design.',
                    skillsOffered: ['UI/UX Design', 'Figma', 'Adobe Creative Suite', 'User Research'],
                    skillsWanted: ['Frontend Development', 'Animation', 'Branding'],
                    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
                    joinDate: new Date('2023-03-10').toISOString(),
                    lastActive: new Date().toISOString()
                },
                {
                    id: 'user-4',
                    name: 'Emily Davis',
                    email: 'emily@example.com',
                    location: 'Seattle, WA',
                    bio: 'DevOps engineer passionate about automation and cloud infrastructure.',
                    skillsOffered: ['DevOps', 'AWS', 'Docker', 'Kubernetes', 'CI/CD'],
                    skillsWanted: ['Security', 'Blockchain', 'Mobile Development'],
                    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
                    joinDate: new Date('2023-03-25').toISOString(),
                    lastActive: new Date().toISOString()
                },
                {
                    id: 'user-5',
                    name: 'David Kim',
                    email: 'david@example.com',
                    location: 'Los Angeles, CA',
                    bio: 'Mobile app developer specializing in React Native and Flutter.',
                    skillsOffered: ['React Native', 'Flutter', 'iOS Development', 'Android Development'],
                    skillsWanted: ['Backend Development', 'Database Design', 'API Development'],
                    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
                    joinDate: new Date('2023-04-05').toISOString(),
                    lastActive: new Date().toISOString()
                }
            ];

            this.setUsers(sampleUsers);

            // Add some sample connections
            const sampleConnections = [
                {
                    id: 'conn-1',
                    fromUserId: 'user-1',
                    toUserId: 'user-2',
                    status: 'accepted',
                    message: 'Hi! I\'d love to learn about machine learning from you.',
                    timestamp: new Date('2023-05-01').toISOString()
                },
                {
                    id: 'conn-2',
                    fromUserId: 'user-3',
                    toUserId: 'user-1',
                    status: 'accepted',
                    message: 'Would love to exchange design knowledge for web dev skills!',
                    timestamp: new Date('2023-05-03').toISOString()
                }
            ];

            this.setConnections(sampleConnections);

            // Add some sample chat messages
            const sampleChats = [
                {
                    id: 'msg-1',
                    fromUserId: 'user-1',
                    toUserId: 'user-2',
                    message: 'Hi Sarah! Thanks for accepting my connection request.',
                    timestamp: new Date('2023-05-01T10:00:00').toISOString()
                },
                {
                    id: 'msg-2',
                    fromUserId: 'user-2',
                    toUserId: 'user-1',
                    message: 'Hi Alex! I\'m excited to help you learn ML. When would you like to start?',
                    timestamp: new Date('2023-05-01T10:15:00').toISOString()
                }
            ];

            this.setChats(sampleChats);
        }
    }

    /**
     * Export all data for backup
     * @returns {Object} All stored data
     */
    exportData() {
        return {
            users: this.getUsers(),
            connections: this.getConnections(),
            chats: this.getChats(),
            theme: this.getTheme()
        };
    }

    /**
     * Import data from backup
     * @param {Object} data - Data to import
     */
    importData(data) {
        if (data.users) this.setUsers(data.users);
        if (data.connections) this.setConnections(data.connections);
        if (data.chats) this.setChats(data.chats);
        if (data.theme) this.setTheme(data.theme);
    }
}

// Create global instance
window.storage = new StorageManager();