/**
 * UI utility class for DOM manipulation and user interface helpers
 */
class UIHelper {
    /**
     * Show a modal by ID
     * @param {string} modalId - Modal element ID
     */
    static showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
            
            // Focus first input if exists
            const firstInput = modal.querySelector('input, textarea, select');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
    }

    /**
     * Hide a modal by ID
     * @param {string} modalId - Modal element ID
     */
    static hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    }

    /**
     * Hide all modals
     */
    static hideAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.classList.remove('show');
        });
        document.body.style.overflow = '';
    }

    /**
     * Show a toast notification
     * @param {string} message - Toast message
     * @param {string} type - Toast type (success, error, warning, info)
     * @param {number} duration - Duration in milliseconds
     */
    static showToast(message, type = 'info', duration = 4000) {
        const toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) return;

        const toastId = `toast-${Date.now()}`;
        const toast = document.createElement('div');
        toast.id = toastId;
        toast.className = `toast ${type}`;
        
        const iconMap = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        toast.innerHTML = `
            <i class="toast-icon ${iconMap[type] || iconMap.info}"></i>
            <div class="toast-content">
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="UIHelper.hideToast('${toastId}')">
                <i class="fas fa-times"></i>
            </button>
        `;

        toastContainer.appendChild(toast);

        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 10);

        // Auto-hide
        setTimeout(() => this.hideToast(toastId), duration);
    }

    /**
     * Hide a toast notification
     * @param {string} toastId - Toast element ID
     */
    static hideToast(toastId) {
        const toast = document.getElementById(toastId);
        if (toast) {
            toast.classList.add('hide');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }
    }

    /**
     * Switch between sections
     * @param {string} sectionId - Section ID to show
     */
    static showSection(sectionId) {
        // Hide all sections
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            section.classList.remove('active');
        });

        // Remove active class from nav links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
        });

        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Activate corresponding nav link
        const targetNavLink = document.querySelector(`[data-section="${sectionId}"]`);
        if (targetNavLink) {
            targetNavLink.classList.add('active');
        }

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /**
     * Toggle theme between light and dark
     */
    static toggleTheme() {
        const currentTheme = storage.getTheme();
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        storage.setTheme(newTheme);

        // Update theme toggle icon
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        }

        this.showToast(`Switched to ${newTheme} theme`, 'success', 2000);
    }

    /**
     * Initialize theme from storage
     */
    static initializeTheme() {
        const theme = storage.getTheme();
        document.documentElement.setAttribute('data-theme', theme);

        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
    }

    /**
     * Add loading state to button
     * @param {HTMLElement} button - Button element
     * @param {string} loadingText - Loading text
     */
    static setButtonLoading(button, loadingText = 'Loading...') {
        if (!button) return;

        button.disabled = true;
        button.dataset.originalText = button.textContent;
        button.innerHTML = `<span class="loading-spinner"></span> ${loadingText}`;
    }

    /**
     * Remove loading state from button
     * @param {HTMLElement} button - Button element
     */
    static removeButtonLoading(button) {
        if (!button) return;

        button.disabled = false;
        button.textContent = button.dataset.originalText || 'Submit';
        delete button.dataset.originalText;
    }

    /**
     * Animate element entrance
     * @param {HTMLElement} element - Element to animate
     * @param {string} animationType - Animation type
     */
    static animateIn(element, animationType = 'fade-in') {
        if (!element) return;

        element.classList.add(`animate-${animationType}`);
    }

    /**
     * Animate element with stagger effect
     * @param {NodeList} elements - Elements to animate
     * @param {number} delay - Delay between animations
     */
    static animateStagger(elements, delay = 100) {
        elements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add('animate-fade-in-up');
            }, index * delay);
        });
    }

    /**
     * Scroll to element smoothly
     * @param {string|HTMLElement} target - Element or selector
     * @param {number} offset - Offset from top
     */
    static scrollTo(target, offset = 0) {
        const element = typeof target === 'string' ? document.querySelector(target) : target;
        if (!element) return;

        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }

    /**
     * Format date for display
     * @param {string|Date} date - Date to format
     * @returns {string} Formatted date
     */
    static formatDate(date) {
        const dateObj = new Date(date);
        const now = new Date();
        const diffTime = Math.abs(now - dateObj);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else if (diffDays < 30) {
            const weeks = Math.floor(diffDays / 7);
            return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
        } else {
            return dateObj.toLocaleDateString();
        }
    }

    /**
     * Format time for display
     * @param {string|Date} time - Time to format
     * @returns {string} Formatted time
     */
    static formatTime(time) {
        const timeObj = new Date(time);
        return timeObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    /**
     * Truncate text with ellipsis
     * @param {string} text - Text to truncate
     * @param {number} maxLength - Maximum length
     * @returns {string} Truncated text
     */
    static truncateText(text, maxLength = 100) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    /**
     * Generate placeholder avatar with initials
     * @param {string} name - Name for initials
     * @returns {string} SVG data URL
     */
    static generatePlaceholderAvatar(name) {
        const initials = name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

        const colors = [
            '#4f46e5', '#7c3aed', '#db2777', '#dc2626',
            '#ea580c', '#d97706', '#059669', '#0891b2'
        ];
        
        const color = colors[Math.abs(name.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % colors.length];

        const svg = `
            <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" fill="${color}"/>
                <text x="50" y="50" font-family="Arial, sans-serif" font-size="40" 
                      font-weight="bold" fill="white" text-anchor="middle" 
                      dominant-baseline="central">${initials}</text>
            </svg>
        `;

        return `data:image/svg+xml;base64,${btoa(svg)}`;
    }

    /**
     * Validate and display form errors
     * @param {Object} validationResult - Validation result object
     * @param {HTMLElement} form - Form element
     */
    static displayFormErrors(validationResult, form) {
        // Clear previous errors
        const errorElements = form.querySelectorAll('.form-error');
        errorElements.forEach(el => el.remove());

        if (validationResult.isValid) return;

        // Display errors
        if (validationResult.errors && validationResult.errors.length > 0) {
            const errorContainer = document.createElement('div');
            errorContainer.className = 'form-error';
            errorContainer.style.cssText = `
                background-color: var(--error-color);
                color: white;
                padding: 0.75rem;
                border-radius: var(--radius-md);
                margin-bottom: 1rem;
                font-size: 0.875rem;
            `;
            
            if (validationResult.errors.length === 1) {
                errorContainer.textContent = validationResult.errors[0];
            } else {
                errorContainer.innerHTML = validationResult.errors
                    .map(error => `• ${error}`)
                    .join('<br>');
            }

            form.insertBefore(errorContainer, form.firstChild);
        }
    }

    /**
     * Clear form data
     * @param {HTMLElement} form - Form element
     */
    static clearForm(form) {
        if (!form) return;

        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            if (input.type === 'checkbox' || input.type === 'radio') {
                input.checked = false;
            } else {
                input.value = '';
            }
        });

        // Clear errors
        const errorElements = form.querySelectorAll('.form-error');
        errorElements.forEach(el => el.remove());
    }

    /**
     * Setup intersection observer for scroll animations
     */
    static setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        const animatedElements = document.querySelectorAll('.scroll-fade-in');
        animatedElements.forEach(el => observer.observe(el));
    }

    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy
     */
    static async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showToast('Copied to clipboard!', 'success', 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
            this.showToast('Failed to copy text', 'error', 2000);
        }
    }

    /**
     * Preload image
     * @param {string} src - Image source URL
     * @returns {Promise} Promise that resolves when image loads
     */
    static preloadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }

    /**
     * Debounced search function
     * @param {Function} searchFunction - Function to execute
     * @param {number} delay - Delay in milliseconds
     * @returns {Function} Debounced function
     */
    static debounceSearch(searchFunction, delay = 300) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => searchFunction.apply(this, args), delay);
        };
    }

    /**
     * Handle responsive navigation
     */
    static setupMobileNav() {
        const navToggle = document.createElement('button');
        navToggle.className = 'nav-toggle';
        navToggle.innerHTML = '<i class="fas fa-bars"></i>';
        navToggle.style.display = 'none';

        // Add to navigation
        const navActions = document.querySelector('.nav-actions');
        if (navActions) {
            navActions.prepend(navToggle);
        }

        // Show/hide on mobile
        const checkMobile = () => {
            if (window.innerWidth <= 768) {
                navToggle.style.display = 'block';
            } else {
                navToggle.style.display = 'none';
            }
        };

        window.addEventListener('resize', checkMobile);
        checkMobile();

        // Toggle menu
        navToggle.addEventListener('click', () => {
            const navMenu = document.querySelector('.nav-menu');
            if (navMenu) {
                navMenu.classList.toggle('show');
            }
        });
    }

    /**
     * Initialize all UI components
     */
    static initialize() {
        this.initializeTheme();
        this.setupScrollAnimations();
        this.setupMobileNav();

        // Setup modal close handlers
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideAllModals();
            }
            
            if (e.target.classList.contains('modal-close') || e.target.closest('.modal-close')) {
                const modalId = e.target.closest('.modal').id;
                if (modalId) {
                    this.hideModal(modalId);
                }
            }
        });

        // Setup escape key handler
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideAllModals();
            }
        });
    }
}

// Export for global use
window.UIHelper = UIHelper;