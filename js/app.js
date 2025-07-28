/**
 * SkillSwap Main Application
 * Entry point that initializes all components and handles application logic
 */
class SkillSwapApp {
    constructor() {
        this.currentUser = null;
        this.connectionGraph = null;
        this.currentSection = 'home';
        this.searchResults = [];
        this.currentMatches = [];
        this.currentChatUser = null;
        
        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        // Initialize storage and sample data
        storage.initializeSampleData();
        
        // Initialize UI
        UIHelper.initialize();
        
        // Initialize connection graph
        this.initializeConnectionGraph();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Check for existing user session
        this.checkUserSession();
        
        // Load initial data
        this.loadHomeData();
        
        console.log('SkillSwap app initialized successfully!');
    }

    /**
     * Initialize the connection graph visualization
     */
    initializeConnectionGraph() {
        try {
            this.connectionGraph = new ConnectionGraph('connectionGraph', {
                nodeRadius: 12,
                maxNodes: 15,
                animationSpeed: 0.015,
                backgroundColor: 'transparent'
            });
            
            // Update graph with real data
            const users = storage.getUsers();
            const connections = storage.getConnections();
            this.connectionGraph.updateFromUserData(users, connections);
        } catch (error) {
            console.warn('Connection graph initialization failed:', error);
        }
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        this.setupNavigationListeners();
        this.setupAuthListeners();
        this.setupSearchListeners();
        this.setupChatListeners();
        this.setupProfileListeners();
        this.setupModalListeners();
        this.setupThemeListeners();
    }

    /**
     * Setup navigation event listeners
     */
    setupNavigationListeners() {
        // Navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                if (section) {
                    this.navigateToSection(section);
                }
            });
        });

        // Hero actions
        const getStartedBtn = document.getElementById('getStartedBtn');
        if (getStartedBtn) {
            getStartedBtn.addEventListener('click', () => {
                if (this.currentUser) {
                    this.navigateToSection('search');
                } else {
                    UIHelper.showModal('registerModal');
                }
            });
        }

        const learnMoreBtn = document.getElementById('learnMoreBtn');
        if (learnMoreBtn) {
            learnMoreBtn.addEventListener('click', () => {
                this.showLearnMoreInfo();
            });
        }
    }

    /**
     * Setup authentication event listeners
     */
    setupAuthListeners() {
        // Login button
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                UIHelper.showModal('loginModal');
            });
        }

        // Register button
        const registerBtn = document.getElementById('registerBtn');
        if (registerBtn) {
            registerBtn.addEventListener('click', () => {
                UIHelper.showModal('registerModal');
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }

        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister();
            });
        }

        // Modal cross-links
        const showRegisterFromLogin = document.getElementById('showRegisterFromLogin');
        if (showRegisterFromLogin) {
            showRegisterFromLogin.addEventListener('click', (e) => {
                e.preventDefault();
                UIHelper.hideModal('loginModal');
                UIHelper.showModal('registerModal');
            });
        }

        const showLoginFromRegister = document.getElementById('showLoginFromRegister');
        if (showLoginFromRegister) {
            showLoginFromRegister.addEventListener('click', (e) => {
                e.preventDefault();
                UIHelper.hideModal('registerModal');
                UIHelper.showModal('loginModal');
            });
        }
    }

    /**
     * Setup search and filter event listeners
     */
    setupSearchListeners() {
        const skillSearch = document.getElementById('skillSearch');
        const locationFilter = document.getElementById('locationFilter');
        const skillTypeFilter = document.getElementById('skillTypeFilter');

        if (skillSearch) {
            const debouncedSearch = UIHelper.debounceSearch(() => {
                this.performSearch();
            }, 300);
            
            skillSearch.addEventListener('input', debouncedSearch);
        }

        if (locationFilter) {
            locationFilter.addEventListener('change', () => {
                this.performSearch();
            });
        }

        if (skillTypeFilter) {
            skillTypeFilter.addEventListener('change', () => {
                this.performSearch();
            });
        }
    }

    /**
     * Setup chat event listeners
     */
    setupChatListeners() {
        const messageInput = document.getElementById('messageInput');
        const sendMessage = document.getElementById('sendMessage');

        if (sendMessage) {
            sendMessage.addEventListener('click', () => {
                this.sendChatMessage();
            });
        }

        if (messageInput) {
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendChatMessage();
                }
            });
        }
    }

    /**
     * Setup profile event listeners
     */
    setupProfileListeners() {
        const editProfileBtn = document.getElementById('editProfileBtn');
        const editProfileForm = document.getElementById('editProfileForm');

        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', () => {
                this.showEditProfileModal();
            });
        }

        if (editProfileForm) {
            editProfileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleEditProfile();
            });
        }
    }

    /**
     * Setup modal event listeners
     */
    setupModalListeners() {
        const connectionForm = document.getElementById('connectionForm');
        
        if (connectionForm) {
            connectionForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleConnectionRequest();
            });
        }
    }

    /**
     * Setup theme toggle listener
     */
    setupThemeListeners() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                UIHelper.toggleTheme();
            });
        }
    }

    /**
     * Check for existing user session
     */
    checkUserSession() {
        const user = storage.getCurrentUser();
        if (user) {
            this.currentUser = new User(user);
            this.updateUIForLoggedInUser();
        }
    }

    /**
     * Handle user login
     */
    async handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const submitBtn = document.querySelector('#loginForm button[type="submit"]');

        const validation = Validator.validateLogin({ email, password });
        if (!validation.isValid) {
            UIHelper.displayFormErrors(validation, document.getElementById('loginForm'));
            return;
        }

        UIHelper.setButtonLoading(submitBtn, 'Logging in...');

        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            const user = storage.getUserByEmail(email);
            if (user && user.email === email) {
                // In a real app, you'd verify password hash
                this.currentUser = new User(user);
                storage.setCurrentUser(this.currentUser.getProfile());
                
                this.updateUIForLoggedInUser();
                UIHelper.hideModal('loginModal');
                UIHelper.clearForm(document.getElementById('loginForm'));
                UIHelper.showToast(`Welcome back, ${this.currentUser.name}!`, 'success');
                
                // Update graph and load user-specific data
                this.loadUserSpecificData();
            } else {
                UIHelper.showToast('Invalid email or password', 'error');
            }
        } catch (error) {
            UIHelper.showToast('Login failed. Please try again.', 'error');
        } finally {
            UIHelper.removeButtonLoading(submitBtn);
        }
    }

    /**
     * Handle user registration
     */
    async handleRegister() {
        const formData = {
            name: document.getElementById('registerName').value,
            email: document.getElementById('registerEmail').value,
            password: document.getElementById('registerPassword').value,
            location: document.getElementById('registerLocation').value,
            bio: document.getElementById('registerBio').value,
            skillsOffered: document.getElementById('registerSkillsOffered').value,
            skillsWanted: document.getElementById('registerSkillsWanted').value
        };

        const submitBtn = document.querySelector('#registerForm button[type="submit"]');
        
        // Check if email already exists
        if (storage.getUserByEmail(formData.email)) {
            UIHelper.showToast('An account with this email already exists', 'error');
            return;
        }

        const userResult = User.create(formData);
        if (!userResult.success) {
            UIHelper.displayFormErrors({ isValid: false, errors: userResult.errors }, 
                document.getElementById('registerForm'));
            return;
        }

        UIHelper.setButtonLoading(submitBtn, 'Creating account...');

        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Generate avatar if not provided
            if (!userResult.user.avatar) {
                userResult.user.avatar = Validator.generateDefaultAvatar(userResult.user.name);
            }

            storage.addUser(userResult.user.getProfile());
            this.currentUser = userResult.user;
            storage.setCurrentUser(this.currentUser.getProfile());

            this.updateUIForLoggedInUser();
            UIHelper.hideModal('registerModal');
            UIHelper.clearForm(document.getElementById('registerForm'));
            UIHelper.showToast(`Welcome to SkillSwap, ${this.currentUser.name}!`, 'success');
            
            // Update stats and load data
            this.updateStats();
            this.loadUserSpecificData();
            
            // Show onboarding
            this.showOnboardingTips();
        } catch (error) {
            UIHelper.showToast('Registration failed. Please try again.', 'error');
        } finally {
            UIHelper.removeButtonLoading(submitBtn);
        }
    }

    /**
     * Handle user logout
     */
    logout() {
        this.currentUser = null;
        storage.removeCurrentUser();
        this.updateUIForLoggedOutUser();
        UIHelper.showToast('You have been logged out', 'info');
        this.navigateToSection('home');
    }

    /**
     * Update UI for logged in user
     */
    updateUIForLoggedInUser() {
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const userMenu = document.getElementById('userMenu');
        const userName = document.getElementById('userName');
        const userAvatar = document.getElementById('userAvatar');

        if (loginBtn) loginBtn.classList.add('hidden');
        if (registerBtn) registerBtn.classList.add('hidden');
        if (userMenu) userMenu.classList.remove('hidden');
        
        if (userName) userName.textContent = this.currentUser.name;
        if (userAvatar) {
            userAvatar.src = this.currentUser.avatar || 
                UIHelper.generatePlaceholderAvatar(this.currentUser.name);
        }

        this.loadProfileData();
    }

    /**
     * Update UI for logged out user
     */
    updateUIForLoggedOutUser() {
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const userMenu = document.getElementById('userMenu');

        if (loginBtn) loginBtn.classList.remove('hidden');
        if (registerBtn) registerBtn.classList.remove('hidden');
        if (userMenu) userMenu.classList.add('hidden');
    }

    /**
     * Navigate to a specific section
     */
    navigateToSection(sectionId) {
        this.currentSection = sectionId;
        UIHelper.showSection(sectionId);

        // Load section-specific data
        switch (sectionId) {
            case 'home':
                this.loadHomeData();
                break;
            case 'search':
                this.loadSearchData();
                break;
            case 'matches':
                this.loadMatchesData();
                break;
            case 'chat':
                this.loadChatData();
                break;
            case 'profile':
                this.loadProfileData();
                break;
        }
    }

    /**
     * Load home section data
     */
    loadHomeData() {
        this.updateStats();
        this.loadLatestUsers();
        this.loadFeaturedSkills();
    }

    /**
     * Update statistics on home page
     */
    updateStats() {
        const users = storage.getUsers();
        const connections = storage.getConnections();
        const allSkills = new Set();
        
        users.forEach(user => {
            user.skillsOffered.forEach(skill => allSkills.add(skill));
            user.skillsWanted.forEach(skill => allSkills.add(skill));
        });

        const totalUsersEl = document.getElementById('totalUsers');
        const totalConnectionsEl = document.getElementById('totalConnections');
        const totalSkillsEl = document.getElementById('totalSkills');

        if (totalUsersEl) this.animateCounter(totalUsersEl, users.length);
        if (totalConnectionsEl) this.animateCounter(totalConnectionsEl, connections.length);
        if (totalSkillsEl) this.animateCounter(totalSkillsEl, allSkills.size);
    }

    /**
     * Animate counter with smooth transition
     */
    animateCounter(element, targetValue) {
        const startValue = 0;
        const duration = 2000;
        const increment = targetValue / (duration / 16);
        let currentValue = startValue;

        const updateCounter = () => {
            currentValue += increment;
            if (currentValue >= targetValue) {
                element.textContent = targetValue;
            } else {
                element.textContent = Math.floor(currentValue);
                requestAnimationFrame(updateCounter);
            }
        };

        updateCounter();
    }

    /**
     * Load latest active users
     */
    loadLatestUsers() {
        const users = storage.getUsers()
            .sort((a, b) => new Date(b.lastActive) - new Date(a.lastActive))
            .slice(0, 6);

        const container = document.getElementById('latestUsers');
        if (container) {
            UserCard.renderIntoContainer(users, container, {
                showConnectButton: !!this.currentUser,
                showBio: false,
                showLastActive: false,
                maxSkillsDisplay: 3
            });
        }
    }

    /**
     * Load featured skills
     */
    loadFeaturedSkills() {
        const users = storage.getUsers();
        const skillCounts = {};

        users.forEach(user => {
            user.skillsOffered.forEach(skill => {
                skillCounts[skill] = (skillCounts[skill] || 0) + 1;
            });
        });

        const featuredSkills = Object.entries(skillCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 12)
            .map(([skill]) => skill);

        const container = document.getElementById('featuredSkills');
        if (container) {
            container.innerHTML = featuredSkills
                .map(skill => `<span class="skill-tag featured">${skill}</span>`)
                .join('');
        }
    }

    /**
     * Load search section data
     */
    loadSearchData() {
        this.populateLocationFilter();
        this.performSearch();
    }

    /**
     * Populate location filter dropdown
     */
    populateLocationFilter() {
        const users = storage.getUsers();
        const locations = [...new Set(users.map(user => user.location))].sort();
        const locationFilter = document.getElementById('locationFilter');

        if (locationFilter) {
            // Keep the default "All Locations" option
            const currentOptions = Array.from(locationFilter.options).slice(1);
            
            // Remove existing location options
            currentOptions.forEach(option => option.remove());
            
            // Add new location options
            locations.forEach(location => {
                const option = document.createElement('option');
                option.value = location;
                option.textContent = location;
                locationFilter.appendChild(option);
            });
        }
    }

    /**
     * Perform search based on current filters
     */
    performSearch() {
        const query = document.getElementById('skillSearch')?.value || '';
        const location = document.getElementById('locationFilter')?.value || '';
        const skillType = document.getElementById('skillTypeFilter')?.value || '';

        let users = storage.getUsers();

        // Filter out current user
        if (this.currentUser) {
            users = users.filter(user => user.id !== this.currentUser.id);
        }

        // Apply filters
        if (query) {
            users = users.filter(user => {
                const searchableText = [
                    user.name,
                    user.bio,
                    user.location,
                    ...user.skillsOffered,
                    ...user.skillsWanted
                ].join(' ').toLowerCase();
                
                return searchableText.includes(query.toLowerCase());
            });
        }

        if (location) {
            users = users.filter(user => 
                user.location.toLowerCase().includes(location.toLowerCase())
            );
        }

        if (skillType) {
            users = users.filter(user => {
                if (skillType === 'offered') {
                    return user.skillsOffered.length > 0;
                } else if (skillType === 'wanted') {
                    return user.skillsWanted.length > 0;
                }
                return true;
            });
        }

        this.searchResults = users;
        this.displaySearchResults();
    }

    /**
     * Display search results
     */
    displaySearchResults() {
        const container = document.getElementById('searchResults');
        if (container) {
            UserCard.renderIntoContainer(this.searchResults, container, {
                showConnectButton: !!this.currentUser
            });
        }
    }

    /**
     * Load matches section data
     */
    loadMatchesData() {
        if (!this.currentUser) {
            const container = document.getElementById('matchesGrid');
            if (container) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-user-plus"></i>
                        <h3>Login Required</h3>
                        <p>Please login to see your skill matches</p>
                        <button class="btn btn-primary" onclick="UIHelper.showModal('loginModal')">
                            Login
                        </button>
                    </div>
                `;
            }
            return;
        }

        this.calculateMatches();
        this.displayMatches();
    }

    /**
     * Calculate user matches
     */
    calculateMatches() {
        const users = storage.getUsers()
            .filter(user => user.id !== this.currentUser.id);

        const currentUserObj = new User(this.currentUser);
        
        this.currentMatches = users
            .map(userData => {
                const user = new User(userData);
                const compatibility = currentUserObj.calculateCompatibility(user);
                const matchingSkills = currentUserObj.getMatchingSkills(user);
                
                return {
                    user: userData,
                    score: compatibility,
                    matchData: matchingSkills
                };
            })
            .filter(match => match.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 12);
    }

    /**
     * Display matches
     */
    displayMatches() {
        const container = document.getElementById('matchesGrid');
        if (!container) return;

        if (this.currentMatches.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>No matches found</h3>
                    <p>Try updating your skills or expanding your interests</p>
                    <button class="btn btn-primary" onclick="UIHelper.showModal('editProfileModal')">
                        Update Profile
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = '';
        
        this.currentMatches.forEach((match, index) => {
            const userCard = new UserCard(match.user);
            const matchCardHtml = userCard.renderAsMatch(match.score, match.matchData);
            
            const cardElement = document.createElement('div');
            cardElement.innerHTML = matchCardHtml;
            const matchCard = cardElement.firstElementChild;
            
            // Add event listeners
            userCard.attachEventListeners(matchCard);
            
            // Add stagger animation
            setTimeout(() => {
                container.appendChild(matchCard);
            }, index * 100);
        });
    }

    /**
     * Load chat data
     */
    loadChatData() {
        if (!this.currentUser) {
            const container = document.querySelector('.chat-container');
            if (container) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-comments"></i>
                        <h3>Login Required</h3>
                        <p>Please login to access your chats</p>
                        <button class="btn btn-primary" onclick="UIHelper.showModal('loginModal')">
                            Login
                        </button>
                    </div>
                `;
            }
            return;
        }

        this.loadChatList();
    }

    /**
     * Load chat list
     */
    loadChatList() {
        const connections = storage.getUserConnections(this.currentUser.id)
            .filter(conn => conn.status === 'accepted');
        
        const chatList = document.getElementById('chatList');
        if (!chatList) return;

        if (connections.length === 0) {
            chatList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-user-friends"></i>
                    <p>No connections yet</p>
                    <small>Connect with users to start chatting</small>
                </div>
            `;
            return;
        }

        chatList.innerHTML = '';
        
        connections.forEach(connection => {
            const otherUserId = connection.fromUserId === this.currentUser.id ? 
                connection.toUserId : connection.fromUserId;
            const otherUser = storage.getUserById(otherUserId);
            
            if (otherUser) {
                const chatItem = this.createChatItem(otherUser);
                chatList.appendChild(chatItem);
            }
        });
    }

    /**
     * Create chat item element
     */
    createChatItem(user) {
        const chatItem = document.createElement('div');
        chatItem.className = 'chat-item';
        chatItem.dataset.userId = user.id;
        
        const messages = storage.getChatMessages(this.currentUser.id, user.id);
        const lastMessage = messages[messages.length - 1];
        
        chatItem.innerHTML = `
            <img src="${user.avatar || UIHelper.generatePlaceholderAvatar(user.name)}" 
                 alt="${user.name}" 
                 class="chat-item-avatar">
            <div class="chat-item-info">
                <h5>${user.name}</h5>
                <p>${lastMessage ? UIHelper.truncateText(lastMessage.message, 50) : 'No messages yet'}</p>
            </div>
        `;
        
        chatItem.addEventListener('click', () => {
            this.openChat(user);
        });
        
        return chatItem;
    }

    /**
     * Open chat with specific user
     */
    openChat(user) {
        this.currentChatUser = user;
        
        // Update chat header
        const chatHeader = document.getElementById('chatHeader');
        if (chatHeader) {
            chatHeader.innerHTML = `
                <img src="${user.avatar || UIHelper.generatePlaceholderAvatar(user.name)}" 
                     alt="${user.name}" 
                     class="user-avatar" 
                     style="width: 2rem; height: 2rem; margin-right: 0.75rem;">
                ${user.name}
                <span style="color: var(--text-secondary); font-weight: normal; margin-left: 0.5rem;">
                    ${user.isOnline ? '• Online' : `• Last seen ${UIHelper.formatDate(user.lastActive)}`}
                </span>
            `;
        }
        
        // Update active chat item
        document.querySelectorAll('.chat-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-user-id="${user.id}"]`)?.classList.add('active');
        
        this.loadChatMessages(user.id);
    }

    /**
     * Load chat messages
     */
    loadChatMessages(userId) {
        const messages = storage.getChatMessages(this.currentUser.id, userId);
        const messagesContainer = document.getElementById('chatMessages');
        
        if (!messagesContainer) return;
        
        messagesContainer.innerHTML = '';
        
        if (messages.length === 0) {
            messagesContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-comment"></i>
                    <p>No messages yet</p>
                    <small>Start the conversation!</small>
                </div>
            `;
            return;
        }
        
        messages.forEach(message => {
            const messageElement = this.createMessageElement(message);
            messagesContainer.appendChild(messageElement);
        });
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    /**
     * Create message element
     */
    createMessageElement(message) {
        const isCurrentUser = message.fromUserId === this.currentUser.id;
        const sender = isCurrentUser ? this.currentUser : 
            storage.getUserById(message.fromUserId);
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isCurrentUser ? 'sent' : 'received'}`;
        
        messageDiv.innerHTML = `
            <img src="${sender.avatar || UIHelper.generatePlaceholderAvatar(sender.name)}" 
                 alt="${sender.name}" 
                 class="message-avatar">
            <div class="message-content">
                ${UIHelper.sanitizeHTML(message.message)}
                <div class="message-time">${UIHelper.formatTime(message.timestamp)}</div>
            </div>
        `;
        
        return messageDiv;
    }

    /**
     * Send chat message
     */
    sendChatMessage() {
        if (!this.currentChatUser) return;
        
        const messageInput = document.getElementById('messageInput');
        const message = messageInput?.value.trim();
        
        if (!message) return;
        
        const validation = Validator.validateMessage(message);
        if (!validation.isValid) {
            UIHelper.showToast(validation.message, 'error');
            return;
        }
        
        const messageObj = {
            id: 'msg-' + Date.now(),
            fromUserId: this.currentUser.id,
            toUserId: this.currentChatUser.id,
            message: message,
            timestamp: new Date().toISOString()
        };
        
        storage.addChatMessage(messageObj);
        
        // Clear input
        if (messageInput) messageInput.value = '';
        
        // Reload messages
        this.loadChatMessages(this.currentChatUser.id);
        
        // Show success feedback
        UIHelper.showToast('Message sent!', 'success', 2000);
    }

    /**
     * Load profile data
     */
    loadProfileData() {
        if (!this.currentUser) {
            const container = document.getElementById('profileContainer');
            if (container) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-user"></i>
                        <h3>Login Required</h3>
                        <p>Please login to view your profile</p>
                        <button class="btn btn-primary" onclick="UIHelper.showModal('loginModal')">
                            Login
                        </button>
                    </div>
                `;
            }
            return;
        }

        this.displayUserProfile();
    }

    /**
     * Display user profile
     */
    displayUserProfile() {
        const profileName = document.getElementById('profileName');
        const profileLocation = document.getElementById('profileLocation');
        const profileBio = document.getElementById('profileBio');
        const profileAvatar = document.getElementById('profileAvatar');
        const profileSkillsOffered = document.getElementById('profileSkillsOffered');
        const profileSkillsWanted = document.getElementById('profileSkillsWanted');

        if (profileName) profileName.textContent = this.currentUser.name;
        if (profileLocation) profileLocation.textContent = this.currentUser.location;
        if (profileBio) profileBio.textContent = this.currentUser.bio || 'No bio provided';
        if (profileAvatar) {
            profileAvatar.src = this.currentUser.avatar || 
                UIHelper.generatePlaceholderAvatar(this.currentUser.name);
        }

        if (profileSkillsOffered) {
            profileSkillsOffered.innerHTML = this.currentUser.skillsOffered.length > 0 ?
                this.currentUser.skillsOffered
                    .map(skill => `<span class="skill-tag skill-offered">${skill}</span>`)
                    .join('') :
                '<p class="text-muted">No skills offered yet</p>';
        }

        if (profileSkillsWanted) {
            profileSkillsWanted.innerHTML = this.currentUser.skillsWanted.length > 0 ?
                this.currentUser.skillsWanted
                    .map(skill => `<span class="skill-tag skill-wanted">${skill}</span>`)
                    .join('') :
                '<p class="text-muted">No skills wanted yet</p>';
        }
    }

    /**
     * Show edit profile modal
     */
    showEditProfileModal() {
        if (!this.currentUser) return;

        // Populate form with current data
        document.getElementById('editName').value = this.currentUser.name;
        document.getElementById('editLocation').value = this.currentUser.location;
        document.getElementById('editBio').value = this.currentUser.bio || '';
        document.getElementById('editSkillsOffered').value = this.currentUser.skillsOffered.join(', ');
        document.getElementById('editSkillsWanted').value = this.currentUser.skillsWanted.join(', ');

        UIHelper.showModal('editProfileModal');
    }

    /**
     * Handle edit profile form submission
     */
    async handleEditProfile() {
        const formData = {
            name: document.getElementById('editName').value,
            location: document.getElementById('editLocation').value,
            bio: document.getElementById('editBio').value,
            skillsOffered: document.getElementById('editSkillsOffered').value,
            skillsWanted: document.getElementById('editSkillsWanted').value
        };

        const validation = Validator.validateUserRegistration({
            ...formData,
            email: this.currentUser.email,
            password: 'dummy' // Skip password validation for edit
        });

        if (!validation.isValid) {
            UIHelper.displayFormErrors(validation, document.getElementById('editProfileForm'));
            return;
        }

        const submitBtn = document.querySelector('#editProfileForm button[type="submit"]');
        UIHelper.setButtonLoading(submitBtn, 'Saving...');

        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Update user data
            this.currentUser.update({
                name: validation.parsedData.name,
                location: validation.parsedData.location,
                bio: validation.parsedData.bio,
                skillsOffered: validation.parsedData.skillsOffered,
                skillsWanted: validation.parsedData.skillsWanted
            });

            // Update storage
            storage.updateUser(this.currentUser.id, this.currentUser.getProfile());
            storage.setCurrentUser(this.currentUser.getProfile());

            // Update UI
            this.updateUIForLoggedInUser();
            this.displayUserProfile();

            UIHelper.hideModal('editProfileModal');
            UIHelper.showToast('Profile updated successfully!', 'success');
        } catch (error) {
            UIHelper.showToast('Failed to update profile', 'error');
        } finally {
            UIHelper.removeButtonLoading(submitBtn);
        }
    }

    /**
     * Handle connection request
     */
    async handleConnectionRequest() {
        const form = document.getElementById('connectionForm');
        const targetUserId = form.dataset.targetUserId;
        const message = document.getElementById('connectionMessage').value;

        if (!targetUserId || !this.currentUser) return;

        const submitBtn = document.querySelector('#connectionForm button[type="submit"]');
        UIHelper.setButtonLoading(submitBtn, 'Sending...');

        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            const connection = {
                id: 'conn-' + Date.now(),
                fromUserId: this.currentUser.id,
                toUserId: targetUserId,
                status: 'accepted', // Auto-accept for demo
                message: message || '',
                timestamp: new Date().toISOString()
            };

            storage.addConnection(connection);

            UIHelper.hideModal('connectionModal');
            UIHelper.clearForm(form);
            UIHelper.showToast('Connection request sent!', 'success');

            // Refresh relevant data
            if (this.currentSection === 'matches') {
                this.loadMatchesData();
            }
        } catch (error) {
            UIHelper.showToast('Failed to send connection request', 'error');
        } finally {
            UIHelper.removeButtonLoading(submitBtn);
        }
    }

    /**
     * Load user-specific data after login
     */
    loadUserSpecificData() {
        // Update connection graph
        if (this.connectionGraph) {
            const users = storage.getUsers();
            const connections = storage.getConnections();
            this.connectionGraph.updateFromUserData(users, connections);
        }

        // Refresh current section
        this.navigateToSection(this.currentSection);
    }

    /**
     * Show onboarding tips for new users
     */
    showOnboardingTips() {
        setTimeout(() => {
            UIHelper.showToast('Welcome! Start by exploring the Search section to find skill matches.', 'info', 6000);
        }, 2000);
    }

    /**
     * Show learn more information
     */
    showLearnMoreInfo() {
        UIHelper.showToast('SkillSwap connects people to exchange knowledge and skills in their community!', 'info', 4000);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.skillSwapApp = new SkillSwapApp();
});

// Handle window resize for responsive components
window.addEventListener('resize', () => {
    if (window.skillSwapApp?.connectionGraph) {
        window.skillSwapApp.connectionGraph.resize();
    }
});