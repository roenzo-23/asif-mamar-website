/**
 * Validation utility class for form inputs and data validation
 */
class Validator {
    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} True if valid email
     */
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validate password strength
     * @param {string} password - Password to validate
     * @returns {Object} Validation result with isValid and message
     */
    static validatePassword(password) {
        if (!password || password.length < 6) {
            return {
                isValid: false,
                message: 'Password must be at least 6 characters long'
            };
        }

        return {
            isValid: true,
            message: 'Password is valid'
        };
    }

    /**
     * Validate required field
     * @param {string} value - Value to validate
     * @param {string} fieldName - Name of the field for error message
     * @returns {Object} Validation result
     */
    static validateRequired(value, fieldName = 'Field') {
        if (!value || value.trim().length === 0) {
            return {
                isValid: false,
                message: `${fieldName} is required`
            };
        }

        return {
            isValid: true,
            message: ''
        };
    }

    /**
     * Validate name format
     * @param {string} name - Name to validate
     * @returns {Object} Validation result
     */
    static validateName(name) {
        if (!name || name.trim().length < 2) {
            return {
                isValid: false,
                message: 'Name must be at least 2 characters long'
            };
        }

        if (name.length > 50) {
            return {
                isValid: false,
                message: 'Name cannot exceed 50 characters'
            };
        }

        const nameRegex = /^[a-zA-Z\s'-]+$/;
        if (!nameRegex.test(name)) {
            return {
                isValid: false,
                message: 'Name can only contain letters, spaces, hyphens, and apostrophes'
            };
        }

        return {
            isValid: true,
            message: 'Name is valid'
        };
    }

    /**
     * Validate location format
     * @param {string} location - Location to validate
     * @returns {Object} Validation result
     */
    static validateLocation(location) {
        if (!location || location.trim().length < 2) {
            return {
                isValid: false,
                message: 'Location must be at least 2 characters long'
            };
        }

        if (location.length > 100) {
            return {
                isValid: false,
                message: 'Location cannot exceed 100 characters'
            };
        }

        return {
            isValid: true,
            message: 'Location is valid'
        };
    }

    /**
     * Validate bio length and content
     * @param {string} bio - Bio to validate
     * @returns {Object} Validation result
     */
    static validateBio(bio) {
        if (bio && bio.length > 500) {
            return {
                isValid: false,
                message: 'Bio cannot exceed 500 characters'
            };
        }

        return {
            isValid: true,
            message: 'Bio is valid'
        };
    }

    /**
     * Validate skills array
     * @param {string} skillsString - Comma-separated skills string
     * @returns {Object} Validation result with parsed skills
     */
    static validateSkills(skillsString) {
        if (!skillsString || skillsString.trim().length === 0) {
            return {
                isValid: false,
                message: 'At least one skill is required',
                skills: []
            };
        }

        const skills = skillsString
            .split(',')
            .map(skill => skill.trim())
            .filter(skill => skill.length > 0);

        if (skills.length === 0) {
            return {
                isValid: false,
                message: 'At least one skill is required',
                skills: []
            };
        }

        if (skills.length > 10) {
            return {
                isValid: false,
                message: 'Maximum 10 skills allowed',
                skills: skills.slice(0, 10)
            };
        }

        // Check individual skill length
        for (const skill of skills) {
            if (skill.length > 30) {
                return {
                    isValid: false,
                    message: 'Each skill cannot exceed 30 characters',
                    skills: skills
                };
            }
        }

        return {
            isValid: true,
            message: 'Skills are valid',
            skills: skills
        };
    }

    /**
     * Validate user registration data
     * @param {Object} userData - User data to validate
     * @returns {Object} Validation result
     */
    static validateUserRegistration(userData) {
        const errors = [];

        // Validate name
        const nameValidation = this.validateName(userData.name);
        if (!nameValidation.isValid) {
            errors.push(nameValidation.message);
        }

        // Validate email
        if (!this.isValidEmail(userData.email)) {
            errors.push('Please enter a valid email address');
        }

        // Validate password
        const passwordValidation = this.validatePassword(userData.password);
        if (!passwordValidation.isValid) {
            errors.push(passwordValidation.message);
        }

        // Validate location
        const locationValidation = this.validateLocation(userData.location);
        if (!locationValidation.isValid) {
            errors.push(locationValidation.message);
        }

        // Validate bio (optional)
        if (userData.bio) {
            const bioValidation = this.validateBio(userData.bio);
            if (!bioValidation.isValid) {
                errors.push(bioValidation.message);
            }
        }

        // Validate skills offered
        const skillsOfferedValidation = this.validateSkills(userData.skillsOffered);
        if (!skillsOfferedValidation.isValid) {
            errors.push(`Skills Offered: ${skillsOfferedValidation.message}`);
        }

        // Validate skills wanted
        const skillsWantedValidation = this.validateSkills(userData.skillsWanted);
        if (!skillsWantedValidation.isValid) {
            errors.push(`Skills Wanted: ${skillsWantedValidation.message}`);
        }

        return {
            isValid: errors.length === 0,
            errors: errors,
            parsedData: {
                ...userData,
                skillsOffered: skillsOfferedValidation.skills,
                skillsWanted: skillsWantedValidation.skills
            }
        };
    }

    /**
     * Validate login data
     * @param {Object} loginData - Login data to validate
     * @returns {Object} Validation result
     */
    static validateLogin(loginData) {
        const errors = [];

        if (!this.isValidEmail(loginData.email)) {
            errors.push('Please enter a valid email address');
        }

        if (!loginData.password || loginData.password.length === 0) {
            errors.push('Password is required');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Validate message content
     * @param {string} message - Message to validate
     * @returns {Object} Validation result
     */
    static validateMessage(message) {
        if (!message || message.trim().length === 0) {
            return {
                isValid: false,
                message: 'Message cannot be empty'
            };
        }

        if (message.length > 1000) {
            return {
                isValid: false,
                message: 'Message cannot exceed 1000 characters'
            };
        }

        return {
            isValid: true,
            message: 'Message is valid'
        };
    }

    /**
     * Sanitize HTML to prevent XSS
     * @param {string} html - HTML string to sanitize
     * @returns {string} Sanitized HTML
     */
    static sanitizeHTML(html) {
        const temp = document.createElement('div');
        temp.textContent = html;
        return temp.innerHTML;
    }

    /**
     * Validate file upload (for avatar)
     * @param {File} file - File to validate
     * @returns {Object} Validation result
     */
    static validateImageFile(file) {
        if (!file) {
            return {
                isValid: false,
                message: 'No file selected'
            };
        }

        // Check file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            return {
                isValid: false,
                message: 'Only JPEG, PNG, and GIF images are allowed'
            };
        }

        // Check file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
            return {
                isValid: false,
                message: 'Image size must be less than 5MB'
            };
        }

        return {
            isValid: true,
            message: 'Image is valid'
        };
    }

    /**
     * Generate random avatar URL if none provided
     * @param {string} name - User's name for generating avatar
     * @returns {string} Avatar URL
     */
    static generateDefaultAvatar(name) {
        // Use a service like Gravatar or generate initials-based avatar
        const initials = name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
        
        // Using DiceBear for avatar generation
        return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(initials)}&backgroundColor=4f46e5&color=ffffff`;
    }

    /**
     * Validate search query
     * @param {string} query - Search query to validate
     * @returns {Object} Validation result
     */
    static validateSearchQuery(query) {
        if (!query || query.trim().length === 0) {
            return {
                isValid: false,
                message: 'Search query cannot be empty'
            };
        }

        if (query.length > 100) {
            return {
                isValid: false,
                message: 'Search query cannot exceed 100 characters'
            };
        }

        return {
            isValid: true,
            message: 'Search query is valid'
        };
    }

    /**
     * Check if user is eligible to connect with another user
     * @param {Object} currentUser - Current user object
     * @param {Object} targetUser - Target user object
     * @returns {Object} Eligibility result
     */
    static canUsersConnect(currentUser, targetUser) {
        if (!currentUser || !targetUser) {
            return {
                canConnect: false,
                message: 'Invalid user data'
            };
        }

        if (currentUser.id === targetUser.id) {
            return {
                canConnect: false,
                message: 'Cannot connect with yourself'
            };
        }

        // Check if already connected
        if (storage.areUsersConnected(currentUser.id, targetUser.id)) {
            return {
                canConnect: false,
                message: 'Already connected with this user'
            };
        }

        return {
            canConnect: true,
            message: 'Can connect with this user'
        };
    }

    /**
     * Format validation errors for display
     * @param {Array} errors - Array of error messages
     * @returns {string} Formatted error message
     */
    static formatErrors(errors) {
        if (!errors || errors.length === 0) {
            return '';
        }

        if (errors.length === 1) {
            return errors[0];
        }

        return errors.map((error, index) => `${index + 1}. ${error}`).join('\n');
    }

    /**
     * Debounce function for real-time validation
     * @param {Function} func - Function to debounce
     * @param {number} delay - Delay in milliseconds
     * @returns {Function} Debounced function
     */
    static debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }
}

// Export for global use
window.Validator = Validator;