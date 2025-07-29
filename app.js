/**
 * Main Application Controller for SkillSwap
 * Coordinates all systems and handles application initialization
 */

class SkillSwapApp {
    constructor() {
        this.systems = {
            auth: null,
            location: null,
            dashboard: null
        };
        
        this.isInitialized = false;
    }

    /**
     * Initialize the application - called from DOMContentLoaded
     */
    init() {
        console.log('🚀 Initializing SkillSwap Application...');
        
        try {
            // Direct initialization - no async needed
            this.initializeSystems();
            this.setupGlobalEventListeners();
            this.setupErrorHandling();
            this.setupResponsiveFeatures();
            this.setupKeyboardShortcuts();
            
            this.isInitialized = true;
            console.log('✅ SkillSwap Application initialized successfully!');
            
            // Show welcome message for first-time users
            setTimeout(() => this.checkFirstTimeUser(), 1000);
            
        } catch (error) {
            console.error('❌ Failed to initialize SkillSwap Application:', error);
            this.handleInitializationError(error);
        }
    }

    /**
     * Initialize all application systems
     */
    initializeSystems() {
        // Store system references - they should be available by now
        this.systems.auth = window.authSystem || null;
        this.systems.location = window.locationSystem || null;
        this.systems.dashboard = window.dashboardSystem || null;
        
        console.log('✅ Systems loaded:', {
            auth: !!this.systems.auth,
            location: !!this.systems.location,
            dashboard: !!this.systems.dashboard
        });
    }

    /**
     * Setup global event listeners
     */
    setupGlobalEventListeners() {
        // Handle window resize for responsive features
        window.addEventListener('resize', this.debounce(() => {
            this.handleWindowResize();
        }, 250));
        
        // Handle online/offline status
        window.addEventListener('online', () => {
            this.handleConnectionStatus(true);
        });
        
        window.addEventListener('offline', () => {
            this.handleConnectionStatus(false);
        });
        
        // Handle visibility change (tab switching)
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });

        console.log('✅ Global event listeners setup complete');
    }

    /**
     * Setup error handling
     */
    setupErrorHandling() {
        // Global error handler
        window.addEventListener('error', (e) => {
            this.handleGlobalError(e.error, e.filename, e.lineno);
        });
        
        // Unhandled promise rejections
        window.addEventListener('unhandledrejection', (e) => {
            this.handleUnhandledRejection(e.reason);
        });

        console.log('✅ Error handling setup complete');
    }

    /**
     * Setup responsive design features
     */
    setupResponsiveFeatures() {
        // Add mobile detection
        const isMobile = this.detectMobile();
        document.body.classList.toggle('mobile', isMobile);
        
        // Add touch device detection
        const isTouchDevice = this.detectTouchDevice();
        document.body.classList.toggle('touch-device', isTouchDevice);
        
        // Setup mobile-specific features
        if (isMobile) {
            this.setupMobileFeatures();
        }

        console.log('✅ Responsive features setup complete');
    }

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only handle shortcuts when not typing in inputs
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }
            
            // Handle keyboard shortcuts
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'k': // Ctrl/Cmd + K - Focus search
                        e.preventDefault();
                        this.focusSearch();
                        break;
                    case 'e': // Ctrl/Cmd + E - Edit profile
                        e.preventDefault();
                        this.openEditProfile();
                        break;
                    case '/': // Ctrl/Cmd + / - Show help
                        e.preventDefault();
                        this.showHelp();
                        break;
                }
            } else {
                switch (e.key) {
                    case 'Escape': // Escape - Close modals
                        this.closeAllModals();
                        break;
                }
            }
        });

        console.log('✅ Keyboard shortcuts setup complete');
    }

    /**
     * Check if this is a first-time user and show welcome message
     */
    checkFirstTimeUser() {
        const hasVisited = localStorage.getItem('skillswap_has_visited');
        
        if (!hasVisited && this.systems.auth && !this.systems.auth.isLoggedIn()) {
            localStorage.setItem('skillswap_has_visited', 'true');
            
            setTimeout(() => {
                this.showWelcomeMessage();
            }, 1000);
        }
    }

    /**
     * Show welcome message for new users
     */
    showWelcomeMessage() {
        const welcomeHtml = `
            <div class="welcome-tooltip">
                <div class="welcome-content">
                    <h3>👋 Welcome to SkillSwap!</h3>
                    <p>Connect with people to exchange skills and knowledge. Here's how to get started:</p>
                    <ul>
                        <li>🔍 <strong>Search:</strong> Use Ctrl+K to quickly search for skills</li>
                        <li>📍 <strong>Location:</strong> Smart location autocomplete helps you find local partners</li>
                        <li>🎯 <strong>Matching:</strong> We show compatibility scores based on your skills</li>
                        <li>✏️ <strong>Profile:</strong> Use Ctrl+E to edit your profile anytime</li>
                    </ul>
                    <div class="welcome-actions">
                        <button class="btn btn-primary" onclick="document.getElementById('heroSignupBtn').click(); this.closest('.welcome-tooltip').remove();">
                            Get Started
                        </button>
                        <button class="btn btn-outline" onclick="this.closest('.welcome-tooltip').remove();">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Add to body
        const welcomeDiv = document.createElement('div');
        welcomeDiv.innerHTML = welcomeHtml;
        welcomeDiv.className = 'welcome-overlay';
        document.body.appendChild(welcomeDiv);
        
        // Auto-remove after 15 seconds
        setTimeout(() => {
            if (welcomeDiv.parentNode) {
                welcomeDiv.remove();
            }
        }, 15000);
    }

    /**
     * Handle window resize events
     */
    handleWindowResize() {
        // Update mobile detection
        const isMobile = this.detectMobile();
        document.body.classList.toggle('mobile', isMobile);
        
        // Trigger resize events for other systems
        if (this.systems.location && this.systems.location.refresh) {
            this.systems.location.refresh();
        }
    }

    /**
     * Handle online/offline connection status
     */
    handleConnectionStatus(isOnline) {
        const statusMessage = isOnline ? 
            'You are back online! 🌐' : 
            'You are offline. Some features may not work. 📡';
        
        const statusType = isOnline ? 'success' : 'warning';
        
        if (this.systems.auth && this.systems.auth.showToast) {
            this.systems.auth.showToast(statusMessage, statusType);
        }
        
        // Update UI to reflect connection status
        document.body.classList.toggle('offline', !isOnline);
    }

    /**
     * Handle tab visibility changes
     */
    handleVisibilityChange() {
        if (document.hidden) {
            // Page is hidden (user switched tabs)
            console.log('Page hidden');
        } else {
            // Page is visible again
            console.log('Page visible');
            
            // Refresh data if user has been away for a while
            if (this.systems.auth && this.systems.auth.isLoggedIn() && this.systems.dashboard) {
                this.systems.dashboard.refresh();
            }
        }
    }

    /**
     * Handle global JavaScript errors
     */
    handleGlobalError(error, filename, lineno) {
        console.error('Global error occurred:', error, 'at', filename, ':', lineno);
        
        // Show user-friendly error message
        if (this.systems.auth && this.systems.auth.showToast) {
            this.systems.auth.showToast(
                'An unexpected error occurred. Please refresh the page if problems persist.', 
                'error'
            );
        }
    }

    /**
     * Handle unhandled promise rejections
     */
    handleUnhandledRejection(reason) {
        console.error('Unhandled promise rejection:', reason);
        
        // Show user-friendly error message
        if (this.systems.auth && this.systems.auth.showToast) {
            this.systems.auth.showToast(
                'Something went wrong. Please try again.', 
                'error'
            );
        }
    }

    /**
     * Handle initialization errors
     */
    handleInitializationError(error) {
        console.error('Initialization error details:', error);
        
        // Show basic error message without requiring systems to be loaded
        const errorDiv = document.createElement('div');
        errorDiv.innerHTML = `
            <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                        background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                        text-align: center; max-width: 400px; z-index: 9999;">
                <h3 style="color: #ef4444; margin-bottom: 1rem;">⚠️ Application Error</h3>
                <p style="margin-bottom: 1rem;">SkillSwap failed to initialize properly.</p>
                <p style="font-size: 0.875rem; color: #666; margin-bottom: 1rem;">
                    Error: ${error.message}
                </p>
                <button onclick="window.location.reload()" 
                        style="background: #4f46e5; color: white; border: none; padding: 0.5rem 1rem; 
                               border-radius: 4px; cursor: pointer;">
                    Reload Page
                </button>
            </div>
        `;
        document.body.appendChild(errorDiv);
    }

    /**
     * Detect if the user is on a mobile device
     */
    detectMobile() {
        return window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    /**
     * Detect if the device supports touch
     */
    detectTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    /**
     * Setup mobile-specific features
     */
    setupMobileFeatures() {
        // Add viewport meta tag if not present
        if (!document.querySelector('meta[name="viewport"]')) {
            const viewport = document.createElement('meta');
            viewport.name = 'viewport';
            viewport.content = 'width=device-width, initial-scale=1.0';
            document.head.appendChild(viewport);
        }
        
        // Prevent zoom on input focus for iOS
        if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
            const inputs = document.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                input.addEventListener('focus', () => {
                    if (input.style.fontSize !== '16px') {
                        input.style.fontSize = '16px';
                    }
                });
            });
        }
        
        console.log('✅ Mobile features setup complete');
    }

    /**
     * Focus on search input (keyboard shortcut handler)
     */
    focusSearch() {
        const searchInput = document.getElementById('searchSkills');
        if (searchInput && !searchInput.closest('.hidden')) {
            searchInput.focus();
        }
    }

    /**
     * Open edit profile modal (keyboard shortcut handler)
     */
    openEditProfile() {
        if (this.systems.auth && this.systems.auth.isLoggedIn() && this.systems.dashboard) {
            this.systems.dashboard.showEditProfileModal();
        }
    }

    /**
     * Show help/shortcuts modal
     */
    showHelp() {
        const helpHtml = `
            <div class="modal">
                <div class="modal-overlay" onclick="this.closest('.modal').remove()"></div>
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>⌨️ Keyboard Shortcuts</h3>
                        <button class="modal-close" onclick="this.closest('.modal').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="shortcuts-list">
                            <div class="shortcut-item">
                                <kbd>Ctrl</kbd> + <kbd>K</kbd>
                                <span>Focus search</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>Ctrl</kbd> + <kbd>E</kbd>
                                <span>Edit profile</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>Ctrl</kbd> + <kbd>/</kbd>
                                <span>Show this help</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>Esc</kbd>
                                <span>Close modals</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const helpDiv = document.createElement('div');
        helpDiv.innerHTML = helpHtml;
        document.body.appendChild(helpDiv.firstElementChild);
    }

    /**
     * Close all open modals
     */
    closeAllModals() {
        const modals = document.querySelectorAll('.modal:not(.hidden)');
        modals.forEach(modal => {
            if (modal.id === 'editProfileModal') {
                this.systems.dashboard?.hideEditProfileModal();
            } else {
                modal.classList.add('hidden');
            }
        });
    }

    /**
     * Utility function for debouncing
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Get application status
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            systems: {
                auth: !!this.systems.auth,
                location: !!this.systems.location,
                dashboard: !!this.systems.dashboard
            },
            user: this.systems.auth?.getCurrentUser() || null,
            isMobile: this.detectMobile(),
            isOnline: navigator.onLine
        };
    }

    /**
     * Restart the application
     */
    restart() {
        console.log('🔄 Restarting SkillSwap Application...');
        window.location.reload();
    }
}

// Add CSS for welcome message and shortcuts
const additionalStyles = `
    <style>
        .welcome-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 3000;
            backdrop-filter: blur(4px);
        }
        
        .welcome-tooltip {
            background: white;
            border-radius: 12px;
            padding: 2rem;
            max-width: 500px;
            margin: 1rem;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            animation: slideIn 0.4s ease;
        }
        
        .welcome-content h3 {
            margin-bottom: 1rem;
            color: var(--text-primary);
        }
        
        .welcome-content ul {
            text-align: left;
            margin: 1rem 0;
            padding-left: 1rem;
        }
        
        .welcome-content li {
            margin-bottom: 0.5rem;
            color: var(--text-secondary);
        }
        
        .welcome-actions {
            display: flex;
            gap: 1rem;
            margin-top: 1.5rem;
            justify-content: center;
        }
        
        .shortcuts-list {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        
        .shortcut-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem;
            background: var(--bg-secondary);
            border-radius: var(--radius-md);
        }
        
        kbd {
            background: var(--text-primary);
            color: white;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.75rem;
            font-family: monospace;
        }
        
        .match-score {
            position: absolute;
            top: 0.5rem;
            right: 0.5rem;
            background: var(--success-color);
            color: white;
            padding: 0.25rem 0.5rem;
            border-radius: var(--radius-sm);
            font-size: 0.75rem;
            font-weight: 600;
        }
        
        .user-card {
            position: relative;
        }
        
        .empty-state {
            grid-column: 1 / -1;
            text-align: center;
            padding: 3rem 1rem;
            color: var(--text-secondary);
        }
        
        .empty-state i {
            font-size: 3rem;
            margin-bottom: 1rem;
            opacity: 0.5;
        }
        
        .empty-state h3 {
            margin-bottom: 0.5rem;
            color: var(--text-primary);
        }
        
        .empty-state p {
            margin-bottom: 1.5rem;
        }
        
        .skill-tag.more {
            background: var(--text-muted);
            opacity: 0.7;
            cursor: default;
        }
        
        @media (max-width: 768px) {
            .welcome-tooltip {
                margin: 1rem;
                padding: 1.5rem;
            }
            
            .welcome-actions {
                flex-direction: column;
            }
        }
    </style>
`;

// Inject additional styles
document.head.insertAdjacentHTML('beforeend', additionalStyles);

// Initialize the application when DOM is ready
let skillSwapApp;

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing SkillSwap...');
    skillSwapApp = new SkillSwapApp();
    skillSwapApp.init();
});

// Make app globally accessible for debugging
window.skillSwapApp = skillSwapApp;

// Add helpful console messages
console.log(`
🎯 SkillSwap Application Loading...

Available Commands:
- skillSwapApp.getStatus() - Get app status
- skillSwapApp.restart() - Restart application

Keyboard Shortcuts:
- Ctrl+K: Focus search
- Ctrl+E: Edit profile  
- Ctrl+/: Show help
- Esc: Close modals
`);