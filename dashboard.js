/**
 * Dashboard System for SkillSwap
 * Handles user profile display, skill matching, and user filtering
 */

class DashboardSystem {
    constructor() {
        this.currentUser = null;
        this.allUsers = [];
        this.filteredUsers = [];
        this.searchDebounceTimer = null;
        this.searchDebounceDelay = 500;
        this.isInitialized = false;
    }

    /**
     * Initialize the dashboard system
     * Sets up event listeners and loads initial data
     */
    init() {
        this.setupEventListeners();
        this.setupEditProfileModal();
        this.isInitialized = true;
        console.log('✅ Dashboard system initialized');
    }

    /**
     * Setup event listeners for dashboard functionality
     */
    setupEventListeners() {
        // Edit profile button
        document.getElementById('editProfileBtn')?.addEventListener('click', () => {
            this.showEditProfileModal();
        });

        // Edit profile form submission
        document.getElementById('editProfileForm')?.addEventListener('submit', (e) => {
            this.handleEditProfile(e);
        });

        // Close edit profile modal
        document.getElementById('closeEditModal')?.addEventListener('click', () => {
            this.hideEditProfileModal();
        });

        // Search and filter controls
        document.getElementById('searchSkills')?.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        document.getElementById('locationFilter')?.addEventListener('change', (e) => {
            this.applyFilters();
        });

        // Modal overlay click to close
        document.querySelector('#editProfileModal .modal-overlay')?.addEventListener('click', () => {
            this.hideEditProfileModal();
        });
    }

    /**
     * Setup edit profile modal with location suggestions
     */
    setupEditProfileModal() {
        // The location system will automatically handle the edit profile location input
        // since it's within a .location-input-container
    }

    /**
     * Load dashboard data for the current user
     */
    loadDashboard() {
        this.currentUser = window.authSystem?.getCurrentUser();
        
        if (!this.currentUser) {
            console.error('No current user found');
            return;
        }

        // Load user profile data
        this.displayUserProfile();
        
        // Load all users for skill matching
        this.loadAllUsers();
        
        // Setup location filter options
        this.setupLocationFilter();
        
        // Display initial user list
        this.displayUsers();
    }

    /**
     * Display current user's profile information
     */
    displayUserProfile() {
        if (!this.currentUser) return;

        // Update profile information
        const profileName = document.getElementById('profileName');
        const profileLocation = document.getElementById('profileLocation');
        const profileEmail = document.getElementById('profileEmail');
        
        if (profileName) profileName.textContent = this.currentUser.name;
        if (profileLocation) profileLocation.textContent = this.currentUser.location;
        if (profileEmail) profileEmail.textContent = this.currentUser.email;

        // Display skills
        this.displaySkills('skillsOffered', this.currentUser.skillsOffered, 'offered');
        this.displaySkills('skillsWanted', this.currentUser.skillsWanted, 'wanted');
    }

    /**
     * Display skills in the specified container
     * @param {string} containerId - ID of the container element
     * @param {Array} skills - Array of skill strings
     * @param {string} type - Type of skills ('offered' or 'wanted')
     */
    displaySkills(containerId, skills, type) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';

        if (!skills || skills.length === 0) {
            container.innerHTML = '<p class="text-muted">No skills listed</p>';
            return;
        }

        skills.forEach(skill => {
            const skillTag = document.createElement('span');
            skillTag.className = `skill-tag ${type}`;
            skillTag.textContent = skill;
            
            // Add click handler to search for this skill
            skillTag.addEventListener('click', () => {
                this.searchForSkill(skill);
            });
            
            container.appendChild(skillTag);
        });
    }

    /**
     * Load all users from localStorage (excluding current user)
     */
    loadAllUsers() {
        this.allUsers = window.authSystem?.getStoredUsers() || [];
        
        // Exclude current user from the list
        if (this.currentUser) {
            this.allUsers = this.allUsers.filter(user => user.id !== this.currentUser.id);
        }

        // Sort users by skill match relevance
        if (typeof sortUsersByRelevance === 'function') {
            this.allUsers = sortUsersByRelevance(this.allUsers, this.currentUser);
        }
        
        this.filteredUsers = [...this.allUsers];
    }

    /**
     * Setup location filter dropdown with unique locations
     */
    setupLocationFilter() {
        const locationFilter = document.getElementById('locationFilter');
        if (!locationFilter) return;

        // Get unique locations from all users
        let uniqueLocations = [];
        if (typeof getUniqueLocations === 'function') {
            uniqueLocations = getUniqueLocations(this.allUsers);
        } else {
            // Fallback if function not available
            const locations = this.allUsers.map(user => user.location);
            uniqueLocations = [...new Set(locations)].sort();
        }
        
        // Clear existing options (except "All Locations")
        locationFilter.innerHTML = '<option value="">All Locations</option>';
        
        // Add location options
        uniqueLocations.forEach(location => {
            const option = document.createElement('option');
            option.value = location;
            option.textContent = location;
            locationFilter.appendChild(option);
        });
    }

    /**
     * Handle search input with debouncing
     * @param {string} query - Search query
     */
    handleSearch(query) {
        // Clear previous debounce timer
        if (this.searchDebounceTimer) {
            clearTimeout(this.searchDebounceTimer);
        }

        // Set new debounce timer
        this.searchDebounceTimer = setTimeout(() => {
            this.applyFilters(query);
        }, this.searchDebounceDelay);
    }

    /**
     * Apply search and location filters
     * @param {string} searchQuery - Optional search query
     */
    applyFilters(searchQuery = null) {
        const skillQuery = searchQuery || document.getElementById('searchSkills')?.value || '';
        const locationFilter = document.getElementById('locationFilter')?.value || '';

        // Apply filters using data.js functions
        if (typeof searchUsers === 'function') {
            this.filteredUsers = searchUsers(this.allUsers, skillQuery, locationFilter);
        } else {
            // Fallback filtering
            this.filteredUsers = this.allUsers.filter(user => {
                const skillMatch = !skillQuery || 
                    [...user.skillsOffered, ...user.skillsWanted]
                        .some(skill => skill.toLowerCase().includes(skillQuery.toLowerCase()));
                const locationMatch = !locationFilter || user.location === locationFilter;
                return skillMatch && locationMatch;
            });
        }
        
        // Re-sort by relevance after filtering
        if (typeof sortUsersByRelevance === 'function') {
            this.filteredUsers = sortUsersByRelevance(this.filteredUsers, this.currentUser);
        }
        
        // Display filtered results
        this.displayUsers();
    }

    /**
     * Search for a specific skill
     * @param {string} skill - Skill to search for
     */
    searchForSkill(skill) {
        const searchInput = document.getElementById('searchSkills');
        if (searchInput) {
            searchInput.value = skill;
            this.applyFilters(skill);
        }
    }

    /**
     * Display users in the grid
     */
    displayUsers() {
        const usersGrid = document.getElementById('usersGrid');
        if (!usersGrid) return;

        // Clear existing content
        usersGrid.innerHTML = '';

        if (this.filteredUsers.length === 0) {
            this.displayEmptyState(usersGrid);
            return;
        }

        // Create user cards
        this.filteredUsers.forEach((user, index) => {
            const userCard = this.createUserCard(user, index);
            usersGrid.appendChild(userCard);
        });
    }

    /**
     * Display empty state when no users match filters
     * @param {HTMLElement} container - Container element
     */
    displayEmptyState(container) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <i class="fas fa-search"></i>
            <h3>No users found</h3>
            <p>Try adjusting your search criteria or location filter</p>
            <button class="btn btn-outline" onclick="document.getElementById('searchSkills').value = ''; document.getElementById('locationFilter').value = ''; window.dashboardSystem.applyFilters();">
                Clear Filters
            </button>
        `;
        container.appendChild(emptyState);
    }

    /**
     * Create a user card element
     * @param {Object} user - User object
     * @param {number} index - Index for animation delay
     * @returns {HTMLElement} User card element
     */
    createUserCard(user, index) {
        const card = document.createElement('div');
        card.className = 'user-card';
        card.style.animationDelay = `${index * 0.1}s`;

        // Calculate match score if available
        const matchScore = user.matchScore || 0;
        const matchBadge = matchScore > 0 ? `<div class="match-score">${matchScore}% Match</div>` : '';

        card.innerHTML = `
            ${matchBadge}
            <h4>${this.escapeHtml(user.name)}</h4>
            <div class="location">
                <i class="fas fa-map-marker-alt"></i>
                ${this.escapeHtml(user.location)}
            </div>
            
            <div class="skills">
                <h5>Can Teach</h5>
                <div class="skill-tags">
                    ${user.skillsOffered.slice(0, 3).map(skill => 
                        `<span class="skill-tag offered">${this.escapeHtml(skill)}</span>`
                    ).join('')}
                    ${user.skillsOffered.length > 3 ? `<span class="skill-tag more">+${user.skillsOffered.length - 3} more</span>` : ''}
                </div>
                
                <h5>Wants to Learn</h5>
                <div class="skill-tags">
                    ${user.skillsWanted.slice(0, 3).map(skill => 
                        `<span class="skill-tag wanted">${this.escapeHtml(skill)}</span>`
                    ).join('')}
                    ${user.skillsWanted.length > 3 ? `<span class="skill-tag more">+${user.skillsWanted.length - 3} more</span>` : ''}
                </div>
            </div>
            
            <div class="user-actions">
                <button class="btn btn-primary btn-full" onclick="window.dashboardSystem.connectWithUser('${user.id}')">
                    <i class="fas fa-handshake"></i>
                    Connect
                </button>
            </div>
        `;

        // Add click handlers for skill tags
        card.querySelectorAll('.skill-tag:not(.more)').forEach(tag => {
            tag.addEventListener('click', (e) => {
                e.stopPropagation();
                this.searchForSkill(tag.textContent);
            });
        });

        return card;
    }

    /**
     * Connect with a user (placeholder functionality)
     * @param {string} userId - ID of the user to connect with
     */
    connectWithUser(userId) {
        const user = this.allUsers.find(u => u.id === userId);
        if (!user) return;

        // Show connection confirmation
        if (window.authSystem) {
            window.authSystem.showToast(
                `Connection request sent to ${user.name}! 🎉`, 
                'success'
            );
        }

        // In a real app, this would send a connection request to the backend
        console.log(`Connection request sent to user: ${user.name} (${user.email})`);
    }

    /**
     * Show edit profile modal
     */
    showEditProfileModal() {
        if (!this.currentUser) return;

        const modal = document.getElementById('editProfileModal');
        if (!modal) return;
        
        // Populate form with current user data
        const editName = document.getElementById('editName');
        const editLocation = document.getElementById('editLocation');
        const editSkillsOffered = document.getElementById('editSkillsOffered');
        const editSkillsWanted = document.getElementById('editSkillsWanted');
        
        if (editName) editName.value = this.currentUser.name;
        if (editLocation) editLocation.value = this.currentUser.location;
        if (editSkillsOffered) editSkillsOffered.value = this.currentUser.skillsOffered.join(', ');
        if (editSkillsWanted) editSkillsWanted.value = this.currentUser.skillsWanted.join(', ');
        
        // Show modal
        modal.classList.remove('hidden');
        
        // Focus on first input
        setTimeout(() => {
            if (editName) editName.focus();
        }, 100);
    }

    /**
     * Hide edit profile modal
     */
    hideEditProfileModal() {
        const modal = document.getElementById('editProfileModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    /**
     * Handle edit profile form submission
     * @param {Event} e - Form submission event
     */
    handleEditProfile(e) {
        e.preventDefault();

        const name = document.getElementById('editName')?.value?.trim() || '';
        const location = document.getElementById('editLocation')?.value?.trim() || '';
        const skillsOffered = document.getElementById('editSkillsOffered')?.value?.trim() || '';
        const skillsWanted = document.getElementById('editSkillsWanted')?.value?.trim() || '';

        // Validation
        if (!name || name.length < 2) {
            window.authSystem?.showToast('Name must be at least 2 characters long', 'error');
            return;
        }

        if (!location || location.length < 2) {
            window.authSystem?.showToast('Please enter a valid location', 'error');
            return;
        }

        if (!skillsOffered || skillsOffered.length < 2) {
            window.authSystem?.showToast('Please enter at least one skill you can teach', 'error');
            return;
        }

        if (!skillsWanted || skillsWanted.length < 2) {
            window.authSystem?.showToast('Please enter at least one skill you want to learn', 'error');
            return;
        }

        // Set loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        window.authSystem?.setButtonLoading(submitBtn, 'Updating...');

        // Simulate API delay
        setTimeout(() => {
            // Update user data
            const updatedUser = {
                ...this.currentUser,
                name,
                location,
                skillsOffered: this.parseSkills(skillsOffered),
                skillsWanted: this.parseSkills(skillsWanted)
            };

            // Update in localStorage
            const success = window.authSystem?.updateUser(updatedUser);

            if (success) {
                // Update current user reference
                this.currentUser = window.authSystem?.getCurrentUser();
                
                // Refresh dashboard display
                this.displayUserProfile();
                this.loadAllUsers();
                this.displayUsers();
                
                // Hide modal and show success message
                this.hideEditProfileModal();
                window.authSystem?.showToast('Profile updated successfully!', 'success');
            } else {
                window.authSystem?.showToast('Failed to update profile. Please try again.', 'error');
            }

            window.authSystem?.removeButtonLoading(submitBtn);
        }, 1000);
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
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Get current user
     * @returns {Object|null} Current user object
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Refresh dashboard data
     */
    refresh() {
        this.loadDashboard();
    }

    /**
     * Clear all filters and show all users
     */
    clearFilters() {
        const searchInput = document.getElementById('searchSkills');
        const locationFilter = document.getElementById('locationFilter');
        
        if (searchInput) searchInput.value = '';
        if (locationFilter) locationFilter.value = '';
        
        this.applyFilters();
    }
}

// Initialize and make globally accessible
let dashboardSystem = new DashboardSystem();
window.dashboardSystem = dashboardSystem;