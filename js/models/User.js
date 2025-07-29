/**
 * User model class representing a user in the SkillSwap platform
 */
class User {
    constructor(data = {}) {
        this.id = data.id || this.generateId();
        this.name = data.name || '';
        this.email = data.email || '';
        this.location = data.location || '';
        this.bio = data.bio || '';
        this.skillsOffered = data.skillsOffered || [];
        this.skillsWanted = data.skillsWanted || [];
        this.avatar = data.avatar || this.generateDefaultAvatar();
        this.joinDate = data.joinDate || new Date().toISOString();
        this.lastActive = data.lastActive || new Date().toISOString();
        this.isOnline = data.isOnline || false;
    }

    /**
     * Generate unique user ID
     * @returns {string} Unique ID
     */
    generateId() {
        return 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Generate default avatar based on name
     * @returns {string} Avatar URL
     */
    generateDefaultAvatar() {
        if (this.name) {
            return Validator.generateDefaultAvatar(this.name);
        }
        return 'https://api.dicebear.com/7.x/initials/svg?seed=User&backgroundColor=4f46e5&color=ffffff';
    }

    /**
     * Update user data
     * @param {Object} data - Updated user data
     */
    update(data) {
        Object.keys(data).forEach(key => {
            if (this.hasOwnProperty(key) && key !== 'id') {
                this[key] = data[key];
            }
        });
        this.lastActive = new Date().toISOString();
    }

    /**
     * Get user's full profile data
     * @returns {Object} Complete user profile
     */
    getProfile() {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            location: this.location,
            bio: this.bio,
            skillsOffered: this.skillsOffered,
            skillsWanted: this.skillsWanted,
            avatar: this.avatar,
            joinDate: this.joinDate,
            lastActive: this.lastActive,
            isOnline: this.isOnline
        };
    }

    /**
     * Get public profile data (without sensitive information)
     * @returns {Object} Public profile data
     */
    getPublicProfile() {
        return {
            id: this.id,
            name: this.name,
            location: this.location,
            bio: this.bio,
            skillsOffered: this.skillsOffered,
            skillsWanted: this.skillsWanted,
            avatar: this.avatar,
            joinDate: this.joinDate,
            lastActive: this.lastActive,
            isOnline: this.isOnline
        };
    }

    /**
     * Check if user has a specific skill offered
     * @param {string} skill - Skill to check
     * @returns {boolean} True if user offers the skill
     */
    hasSkillOffered(skill) {
        return this.skillsOffered.some(s => 
            s.toLowerCase().includes(skill.toLowerCase())
        );
    }

    /**
     * Check if user wants to learn a specific skill
     * @param {string} skill - Skill to check
     * @returns {boolean} True if user wants to learn the skill
     */
    wantsToLearnSkill(skill) {
        return this.skillsWanted.some(s => 
            s.toLowerCase().includes(skill.toLowerCase())
        );
    }

    /**
     * Get matching skills with another user
     * @param {User} otherUser - Other user to compare with
     * @returns {Object} Matching skills object
     */
    getMatchingSkills(otherUser) {
        const myOfferedTheirWanted = this.skillsOffered.filter(skill =>
            otherUser.skillsWanted.some(wantedSkill =>
                wantedSkill.toLowerCase().includes(skill.toLowerCase()) ||
                skill.toLowerCase().includes(wantedSkill.toLowerCase())
            )
        );

        const theirOfferedMyWanted = otherUser.skillsOffered.filter(skill =>
            this.skillsWanted.some(wantedSkill =>
                wantedSkill.toLowerCase().includes(skill.toLowerCase()) ||
                skill.toLowerCase().includes(wantedSkill.toLowerCase())
            )
        );

        return {
            canTeach: myOfferedTheirWanted,
            canLearn: theirOfferedMyWanted,
            matchScore: myOfferedTheirWanted.length + theirOfferedMyWanted.length
        };
    }

    /**
     * Calculate compatibility score with another user
     * @param {User} otherUser - Other user to compare with
     * @returns {number} Compatibility score (0-100)
     */
    calculateCompatibility(otherUser) {
        const matching = this.getMatchingSkills(otherUser);
        const totalPossibleMatches = Math.max(
            this.skillsOffered.length + this.skillsWanted.length,
            otherUser.skillsOffered.length + otherUser.skillsWanted.length,
            1
        );
        
        let score = (matching.matchScore / totalPossibleMatches) * 100;
        
        // Bonus for same location
        if (this.location && otherUser.location && 
            this.location.toLowerCase().includes(otherUser.location.toLowerCase())) {
            score += 10;
        }

        // Bonus for recent activity
        const daysSinceActive = Math.abs(new Date() - new Date(otherUser.lastActive)) / (1000 * 60 * 60 * 24);
        if (daysSinceActive < 7) {
            score += 5;
        }

        return Math.min(Math.round(score), 100);
    }

    /**
     * Search skills by query
     * @param {string} query - Search query
     * @returns {Object} Search results
     */
    searchSkills(query) {
        const lowerQuery = query.toLowerCase();
        
        const offeredMatches = this.skillsOffered.filter(skill =>
            skill.toLowerCase().includes(lowerQuery)
        );
        
        const wantedMatches = this.skillsWanted.filter(skill =>
            skill.toLowerCase().includes(lowerQuery)
        );

        return {
            offered: offeredMatches,
            wanted: wantedMatches,
            hasMatches: offeredMatches.length > 0 || wantedMatches.length > 0
        };
    }

    /**
     * Add a skill to offered skills
     * @param {string} skill - Skill to add
     */
    addOfferedSkill(skill) {
        if (!this.skillsOffered.includes(skill)) {
            this.skillsOffered.push(skill);
            this.lastActive = new Date().toISOString();
        }
    }

    /**
     * Remove a skill from offered skills
     * @param {string} skill - Skill to remove
     */
    removeOfferedSkill(skill) {
        this.skillsOffered = this.skillsOffered.filter(s => s !== skill);
        this.lastActive = new Date().toISOString();
    }

    /**
     * Add a skill to wanted skills
     * @param {string} skill - Skill to add
     */
    addWantedSkill(skill) {
        if (!this.skillsWanted.includes(skill)) {
            this.skillsWanted.push(skill);
            this.lastActive = new Date().toISOString();
        }
    }

    /**
     * Remove a skill from wanted skills
     * @param {string} skill - Skill to remove
     */
    removeWantedSkill(skill) {
        this.skillsWanted = this.skillsWanted.filter(s => s !== skill);
        this.lastActive = new Date().toISOString();
    }

    /**
     * Update online status
     * @param {boolean} isOnline - Online status
     */
    setOnlineStatus(isOnline) {
        this.isOnline = isOnline;
        if (isOnline) {
            this.lastActive = new Date().toISOString();
        }
    }

    /**
     * Get time since last active
     * @returns {string} Formatted time string
     */
    getTimeSinceActive() {
        return UIHelper.formatDate(this.lastActive);
    }

    /**
     * Check if user profile is complete
     * @returns {Object} Completion status
     */
    getProfileCompleteness() {
        const fields = [
            { name: 'name', value: this.name, weight: 20 },
            { name: 'location', value: this.location, weight: 15 },
            { name: 'bio', value: this.bio, weight: 15 },
            { name: 'skillsOffered', value: this.skillsOffered.length > 0, weight: 25 },
            { name: 'skillsWanted', value: this.skillsWanted.length > 0, weight: 25 }
        ];

        let completedWeight = 0;
        const missingFields = [];

        fields.forEach(field => {
            if (field.value) {
                completedWeight += field.weight;
            } else {
                missingFields.push(field.name);
            }
        });

        return {
            percentage: completedWeight,
            isComplete: completedWeight === 100,
            missingFields: missingFields
        };
    }

    /**
     * Validate user data
     * @returns {Object} Validation result
     */
    validate() {
        return Validator.validateUserRegistration({
            name: this.name,
            email: this.email,
            location: this.location,
            bio: this.bio,
            skillsOffered: this.skillsOffered.join(', '),
            skillsWanted: this.skillsWanted.join(', ')
        });
    }

    /**
     * Export user data for storage
     * @returns {Object} Serializable user data
     */
    toJSON() {
        return this.getProfile();
    }

    /**
     * Create User instance from stored data
     * @param {Object} data - Stored user data
     * @returns {User} User instance
     */
    static fromJSON(data) {
        return new User(data);
    }

    /**
     * Create a new user with basic validation
     * @param {Object} userData - User registration data
     * @returns {Object} Result with user instance or errors
     */
    static create(userData) {
        const validation = Validator.validateUserRegistration(userData);
        
        if (!validation.isValid) {
            return {
                success: false,
                errors: validation.errors
            };
        }

        const user = new User({
            name: validation.parsedData.name,
            email: validation.parsedData.email,
            location: validation.parsedData.location,
            bio: validation.parsedData.bio || '',
            skillsOffered: validation.parsedData.skillsOffered,
            skillsWanted: validation.parsedData.skillsWanted
        });

        return {
            success: true,
            user: user
        };
    }

    /**
     * Compare two users for sorting
     * @param {User} a - First user
     * @param {User} b - Second user
     * @param {string} sortBy - Sort criteria
     * @returns {number} Comparison result
     */
    static compare(a, b, sortBy = 'name') {
        switch (sortBy) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'location':
                return a.location.localeCompare(b.location);
            case 'joinDate':
                return new Date(b.joinDate) - new Date(a.joinDate);
            case 'lastActive':
                return new Date(b.lastActive) - new Date(a.lastActive);
            default:
                return 0;
        }
    }
}

// Export for global use
window.User = User;