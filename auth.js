/**
 * Authentication System for SkillSwap
 * Handles user registration, login, logout using localStorage
 */

class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.storageKeys = {
            users: 'skillswap_users',
            currentUser: 'skillswap_current_user'
        };
        this.isInitialized = false;
    }

    /**
     * Initialize the authentication system
     * Sets up event listeners and checks for existing session
     */
    init() {
        this.setupEventListeners();
        this.checkExistingSession();
        this.initializeSampleUsers();
        this.isInitialized = true;
        console.log('✅ Auth system initialized');
    }

    /**
     * Setup event listeners for authentication forms and buttons
     */
    setupEventListeners() {
        // Navigation button listeners
        document.getElementById('loginBtn')?.addEventListener('click', () => {
            this.showLoginPage();
        });

        document.getElementById('signupBtn')?.addEventListener('click', () => {
            this.showSignupPage();
        });

        document.getElementById('heroLoginBtn')?.addEventListener('click', () => {
            this.showLoginPage();
        });

        document.getElementById('heroSignupBtn')?.addEventListener('click', () => {
            this.showSignupPage();
        });

        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            this.logout();
        });

        // Form submission listeners
        document.getElementById('loginForm')?.addEventListener('submit', (e) => {
            this.handleLogin(e);
        });

        document.getElementById('signupForm')?.addEventListener('submit', (e) => {
            this.handleSignup(e);
        });

        // Cross-form navigation
        document.getElementById('showSignupFromLogin')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showSignupPage();
        });

        document.getElementById('showLoginFromSignup')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showLoginPage();
        });
    }

    /**
     * Check if user is already logged in (from localStorage)
     */
    checkExistingSession() {
        const savedUser = localStorage.getItem(this.storageKeys.currentUser);
        if (savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
                this.updateUIForLoggedInUser();
                this.showDashboard();
            } catch (error) {
                console.error('Error parsing saved user data:', error);
                localStorage.removeItem(this.storageKeys.currentUser);
            }
        }
    }

    /**
     * Initialize sample users if none exist
     */
    initializeSampleUsers() {
        const existingUsers = this.getStoredUsers();
        if (existingUsers.length === 0 && typeof SAMPLE_USERS !== 'undefined') {
            // Store sample users in localStorage
            localStorage.setItem(this.storageKeys.users, JSON.stringify(SAMPLE_USERS));
        }
    }

    /**
     * Handle user login
     * @param {Event} e - Form submission event
     */
    handleLogin(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const email = formData.get('email') || document.getElementById('loginEmail').value;
        const password = formData.get('password') || document.getElementById('loginPassword').value;

        // Basic validation
        if (!email || !password) {
            this.showToast('Please fill in all fields', 'error');
            return;
        }

        if (!this.validateEmail(email)) {
            this.showToast('Please enter a valid email address', 'error');
            return;
        }

        // Set loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        this.setButtonLoading(submitBtn, 'Logging in...');

        // Simulate API delay
        setTimeout(() => {
            const user = this.authenticateUser(email, password);
            
            if (user) {
                this.loginUser(user);
                this.showToast('Login successful! Welcome back.', 'success');
                this.showDashboard();
            } else {
                this.showToast('Invalid email or password', 'error');
            }
            
            this.removeButtonLoading(submitBtn);
        }, 1000);
    }

    /**
     * Handle user signup
     * @param {Event} e - Form submission event
     */
    handleSignup(e) {
        e.preventDefault();
        
        const name = document.getElementById('signupName').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value;
        const location = document.getElementById('signupLocation').value.trim();
        const skillsOffered = document.getElementById('signupSkillsOffered').value.trim();
        const skillsWanted = document.getElementById('signupSkillsWanted').value.trim();

        // Validation
        const validationResult = this.validateSignupData({
            name, email, password, location, skillsOffered, skillsWanted
        });

        if (!validationResult.isValid) {
            this.showToast(validationResult.message, 'error');
            return;
        }

        // Check if user already exists
        if (this.userExists(email)) {
            this.showToast('An account with this email already exists', 'error');
            return;
        }

        // Set loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        this.setButtonLoading(submitBtn, 'Creating Account...');

        // Simulate API delay
        setTimeout(() => {
            const newUser = this.createUser({
                name, email, password, location, skillsOffered, skillsWanted
            });

            if (newUser) {
                this.loginUser(newUser);
                this.showToast('Account created successfully! Welcome to SkillSwap.', 'success');
                this.showDashboard();
            } else {
                this.showToast('Failed to create account. Please try again.', 'error');
            }
            
            this.removeButtonLoading(submitBtn);
        }, 1500);
    }

    /**
     * Authenticate user with email and password
     * @param {string} email - User's email
     * @param {string} password - User's password
     * @returns {Object|null} User object if authenticated, null otherwise
     */
    authenticateUser(email, password) {
        const users = this.getStoredUsers();
        return users.find(user => 
            user.email.toLowerCase() === email.toLowerCase() && 
            user.password === password
        ) || null;
    }

    /**
     * Create a new user account
     * @param {Object} userData - User registration data
     * @returns {Object|null} Created user object or null if failed
     */
    createUser(userData) {
        try {
            const users = this.getStoredUsers();
            
            const newUser = {
                id: 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
                name: userData.name,
                email: userData.email.toLowerCase(),
                password: userData.password, // In production, this should be hashed
                location: userData.location,
                skillsOffered: this.parseSkills(userData.skillsOffered),
                skillsWanted: this.parseSkills(userData.skillsWanted),
                joinDate: new Date().toISOString().split('T')[0]
            };

            users.push(newUser);
            localStorage.setItem(this.storageKeys.users, JSON.stringify(users));
            
            return newUser;
        } catch (error) {
            console.error('Error creating user:', error);
            return null;
        }
    }

    /**
     * Log in a user (set as current user)
     * @param {Object} user - User object
     */
    loginUser(user) {
        // Don't store password in current user session
        const sessionUser = { ...user };
        delete sessionUser.password;
        
        this.currentUser = sessionUser;
        localStorage.setItem(this.storageKeys.currentUser, JSON.stringify(sessionUser));
        this.updateUIForLoggedInUser();
    }

    /**
     * Log out the current user
     */
    logout() {
        this.currentUser = null;
        localStorage.removeItem(this.storageKeys.currentUser);
        this.updateUIForLoggedOutUser();
        this.showLandingPage();
        this.showToast('You have been logged out successfully', 'success');
    }

    /**
     * Check if a user with given email exists
     * @param {string} email - Email to check
     * @returns {boolean} True if user exists
     */
    userExists(email) {
        const users = this.getStoredUsers();
        return users.some(user => user.email.toLowerCase() === email.toLowerCase());
    }

    /**
     * Get all stored users from localStorage
     * @returns {Array} Array of user objects
     */
    getStoredUsers() {
        try {
            const users = localStorage.getItem(this.storageKeys.users);
            return users ? JSON.parse(users) : [];
        } catch (error) {
            console.error('Error getting stored users:', error);
            return [];
        }
    }

    /**
     * Update user data in localStorage
     * @param {Object} updatedUser - Updated user data
     * @returns {boolean} Success status
     */
    updateUser(updatedUser) {
        try {
            const users = this.getStoredUsers();
            const userIndex = users.findIndex(user => user.id === updatedUser.id);
            
            if (userIndex !== -1) {
                users[userIndex] = { ...users[userIndex], ...updatedUser };
                localStorage.setItem(this.storageKeys.users, JSON.stringify(users));
                
                // Update current user if it's the same user
                if (this.currentUser && this.currentUser.id === updatedUser.id) {
                    const sessionUser = { ...users[userIndex] };
                    delete sessionUser.password;
                    this.currentUser = sessionUser;
                    localStorage.setItem(this.storageKeys.currentUser, JSON.stringify(sessionUser));
                }
                
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error updating user:', error);
            return false;
        }
    }

    /**
     * Parse comma-separated skills string into array
     * @param {string} skillsString - Comma-separated skills
     * @returns {Array} Array of trimmed skill strings
     */
    parseSkills(skillsString) {
        return skillsString
            .split(',')
            .map(skill => skill.trim())
            .filter(skill => skill.length > 0);
    }

    /**
     * Validate signup form data
     * @param {Object} data - Form data to validate
     * @returns {Object} Validation result with isValid and message
     */
    validateSignupData(data) {
        if (!data.name || data.name.length < 2) {
            return { isValid: false, message: 'Name must be at least 2 characters long' };
        }

        if (!this.validateEmail(data.email)) {
            return { isValid: false, message: 'Please enter a valid email address' };
        }

        if (!data.password || data.password.length < 6) {
            return { isValid: false, message: 'Password must be at least 6 characters long' };
        }

        if (!data.location || data.location.length < 2) {
            return { isValid: false, message: 'Please enter a valid location' };
        }

        if (!data.skillsOffered || data.skillsOffered.length < 2) {
            return { isValid: false, message: 'Please enter at least one skill you can teach' };
        }

        if (!data.skillsWanted || data.skillsWanted.length < 2) {
            return { isValid: false, message: 'Please enter at least one skill you want to learn' };
        }

        return { isValid: true, message: 'Valid' };
    }

    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} True if valid email format
     */
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Show landing page
     */
    showLandingPage() {
        this.hideAllPages();
        document.getElementById('landingPage').classList.remove('hidden');
        document.getElementById('landingPage').classList.add('active');
    }

    /**
     * Show login page
     */
    showLoginPage() {
        this.hideAllPages();
        document.getElementById('loginPage').classList.remove('hidden');
        document.getElementById('loginPage').classList.add('active');
    }

    /**
     * Show signup page
     */
    showSignupPage() {
        this.hideAllPages();
        document.getElementById('signupPage').classList.remove('hidden');
        document.getElementById('signupPage').classList.add('active');
    }

    /**
     * Show dashboard page
     */
    showDashboard() {
        this.hideAllPages();
        document.getElementById('dashboardPage').classList.remove('hidden');
        document.getElementById('dashboardPage').classList.add('active');
        
        // Load dashboard data
        if (window.dashboardSystem && window.dashboardSystem.isInitialized) {
            window.dashboardSystem.loadDashboard();
        }
    }

    /**
     * Hide all pages
     */
    hideAllPages() {
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => {
            page.classList.add('hidden');
            page.classList.remove('active');
        });
    }

    /**
     * Update UI for logged in user
     */
    updateUIForLoggedInUser() {
        // Hide login/signup buttons
        const loginBtn = document.getElementById('loginBtn');
        const signupBtn = document.getElementById('signupBtn');
        if (loginBtn) loginBtn.classList.add('hidden');
        if (signupBtn) signupBtn.classList.add('hidden');
        
        // Show user menu
        const userMenu = document.getElementById('userMenu');
        if (userMenu) userMenu.classList.remove('hidden');
        
        // Update user name
        const userName = document.getElementById('userName');
        if (userName && this.currentUser) {
            userName.textContent = this.currentUser.name;
        }
    }

    /**
     * Update UI for logged out user
     */
    updateUIForLoggedOutUser() {
        // Show login/signup buttons
        const loginBtn = document.getElementById('loginBtn');
        const signupBtn = document.getElementById('signupBtn');
        if (loginBtn) loginBtn.classList.remove('hidden');
        if (signupBtn) signupBtn.classList.remove('hidden');
        
        // Hide user menu
        const userMenu = document.getElementById('userMenu');
        if (userMenu) userMenu.classList.add('hidden');
    }

    /**
     * Set button loading state
     * @param {HTMLElement} button - Button element
     * @param {string} loadingText - Text to show while loading
     */
    setButtonLoading(button, loadingText) {
        if (!button) return;
        button.disabled = true;
        button.dataset.originalText = button.textContent;
        button.textContent = loadingText;
        button.classList.add('loading');
    }

    /**
     * Remove button loading state
     * @param {HTMLElement} button - Button element
     */
    removeButtonLoading(button) {
        if (!button) return;
        button.disabled = false;
        button.textContent = button.dataset.originalText || 'Submit';
        button.classList.remove('loading');
        delete button.dataset.originalText;
    }

    /**
     * Show toast notification
     * @param {string} message - Message to show
     * @param {string} type - Type of toast (success, error, info)
     */
    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        if (!toast) return;
        
        const toastMessage = toast.querySelector('.toast-message');
        const toastIcon = toast.querySelector('.toast-icon');
        
        if (!toastMessage || !toastIcon) return;
        
        // Set message
        toastMessage.textContent = message;
        
        // Set icon and styling based on type
        toast.className = `toast ${type}`;
        
        switch (type) {
            case 'success':
                toastIcon.className = 'toast-icon fas fa-check-circle';
                break;
            case 'error':
                toastIcon.className = 'toast-icon fas fa-exclamation-circle';
                break;
            default:
                toastIcon.className = 'toast-icon fas fa-info-circle';
        }
        
        // Show toast
        toast.classList.add('show');
        
        // Hide after 4 seconds
        setTimeout(() => {
            toast.classList.remove('show');
        }, 4000);
    }

    /**
     * Get current user
     * @returns {Object|null} Current user object or null
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Check if user is logged in
     * @returns {boolean} True if user is logged in
     */
    isLoggedIn() {
        return this.currentUser !== null;
    }
}

// Initialize and make globally accessible
let authSystem = new AuthSystem();
window.authSystem = authSystem;