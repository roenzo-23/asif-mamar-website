/**
 * UserCard component for displaying user information in a card format
 */
class UserCard {
    constructor(user, options = {}) {
        this.user = user;
        this.options = {
            showConnectButton: true,
            showSkills: true,
            showBio: true,
            showLocation: true,
            showLastActive: true,
            maxBioLength: 100,
            maxSkillsDisplay: 5,
            cardClass: 'user-card',
            onConnect: null,
            onViewProfile: null,
            ...options
        };
    }

    /**
     * Generate the HTML for the user card
     * @returns {string} HTML string
     */
    render() {
        const currentUser = storage.getCurrentUser();
        const canConnect = currentUser ? 
            Validator.canUsersConnect(currentUser, this.user).canConnect : false;
        
        const isConnected = currentUser ? 
            storage.areUsersConnected(currentUser.id, this.user.id) : false;

        return `
            <div class="user-card ${this.options.cardClass}" data-user-id="${this.user.id}">
                <div class="user-card-header">
                    <img src="${this.user.avatar || UIHelper.generatePlaceholderAvatar(this.user.name)}" 
                         alt="${this.user.name}" 
                         class="user-card-avatar"
                         loading="lazy">
                    <div class="user-card-info">
                        <h4>${UIHelper.sanitizeHTML(this.user.name)}</h4>
                        ${this.options.showLocation ? `
                            <p><i class="fas fa-map-marker-alt"></i> ${UIHelper.sanitizeHTML(this.user.location)}</p>
                        ` : ''}
                        ${this.options.showLastActive ? `
                            <p class="last-active">
                                <i class="fas fa-clock"></i> 
                                Active ${UIHelper.formatDate(this.user.lastActive)}
                            </p>
                        ` : ''}
                    </div>
                    ${this.user.isOnline ? '<div class="online-indicator"></div>' : ''}
                </div>

                ${this.options.showBio && this.user.bio ? `
                    <div class="user-card-bio">
                        ${UIHelper.truncateText(UIHelper.sanitizeHTML(this.user.bio), this.options.maxBioLength)}
                    </div>
                ` : ''}

                ${this.options.showSkills ? this.renderSkills() : ''}

                <div class="user-card-actions">
                    ${this.options.showConnectButton && currentUser && canConnect ? `
                        <button class="btn btn-primary connect-btn" data-action="connect">
                            <i class="fas fa-handshake"></i> Connect
                        </button>
                    ` : ''}
                    ${isConnected ? `
                        <button class="btn btn-success" disabled>
                            <i class="fas fa-check"></i> Connected
                        </button>
                    ` : ''}
                    <button class="btn btn-outline view-profile-btn" data-action="view-profile">
                        <i class="fas fa-user"></i> View Profile
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Render skills section
     * @returns {string} Skills HTML
     */
    renderSkills() {
        const skillsOffered = this.user.skillsOffered.slice(0, this.options.maxSkillsDisplay);
        const skillsWanted = this.user.skillsWanted.slice(0, this.options.maxSkillsDisplay);
        
        let skillsHtml = '<div class="user-card-skills">';
        
        if (skillsOffered.length > 0) {
            skillsHtml += `
                <div class="skill-section">
                    <h5>Offers</h5>
                    <div class="skill-tags">
                        ${skillsOffered.map(skill => 
                            `<span class="skill-tag skill-offered">${UIHelper.sanitizeHTML(skill)}</span>`
                        ).join('')}
                        ${this.user.skillsOffered.length > this.options.maxSkillsDisplay ? 
                            `<span class="skill-tag more">+${this.user.skillsOffered.length - this.options.maxSkillsDisplay}</span>` : ''}
                    </div>
                </div>
            `;
        }
        
        if (skillsWanted.length > 0) {
            skillsHtml += `
                <div class="skill-section">
                    <h5>Wants to Learn</h5>
                    <div class="skill-tags">
                        ${skillsWanted.map(skill => 
                            `<span class="skill-tag skill-wanted">${UIHelper.sanitizeHTML(skill)}</span>`
                        ).join('')}
                        ${this.user.skillsWanted.length > this.options.maxSkillsDisplay ? 
                            `<span class="skill-tag more">+${this.user.skillsWanted.length - this.options.maxSkillsDisplay}</span>` : ''}
                    </div>
                </div>
            `;
        }
        
        skillsHtml += '</div>';
        return skillsHtml;
    }

    /**
     * Create and return a DOM element for the user card
     * @returns {HTMLElement} User card element
     */
    createElement() {
        const cardContainer = document.createElement('div');
        cardContainer.innerHTML = this.render();
        const cardElement = cardContainer.firstElementChild;
        
        this.attachEventListeners(cardElement);
        this.addAnimations(cardElement);
        
        return cardElement;
    }

    /**
     * Attach event listeners to the card element
     * @param {HTMLElement} cardElement - Card DOM element
     */
    attachEventListeners(cardElement) {
        // Connect button
        const connectBtn = cardElement.querySelector('.connect-btn');
        if (connectBtn) {
            connectBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleConnect();
            });
        }

        // View profile button
        const viewProfileBtn = cardElement.querySelector('.view-profile-btn');
        if (viewProfileBtn) {
            viewProfileBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleViewProfile();
            });
        }

        // Card click for profile view
        cardElement.addEventListener('click', () => {
            this.handleViewProfile();
        });

        // Skill tag clicks
        const skillTags = cardElement.querySelectorAll('.skill-tag:not(.more)');
        skillTags.forEach(tag => {
            tag.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleSkillClick(tag.textContent.trim());
            });
        });
    }

    /**
     * Add animations to the card
     * @param {HTMLElement} cardElement - Card DOM element
     */
    addAnimations(cardElement) {
        // Add entrance animation
        cardElement.classList.add('animate-fade-in-up');
        
        // Add hover effects
        cardElement.addEventListener('mouseenter', () => {
            cardElement.style.transform = 'translateY(-5px)';
        });
        
        cardElement.addEventListener('mouseleave', () => {
            cardElement.style.transform = 'translateY(0)';
        });
    }

    /**
     * Handle connect button click
     */
    handleConnect() {
        if (this.options.onConnect) {
            this.options.onConnect(this.user);
        } else {
            // Default connect behavior
            this.showConnectionModal();
        }
    }

    /**
     * Handle view profile button click
     */
    handleViewProfile() {
        if (this.options.onViewProfile) {
            this.options.onViewProfile(this.user);
        } else {
            // Default view profile behavior
            this.showUserProfile();
        }
    }

    /**
     * Handle skill tag click
     * @param {string} skill - Clicked skill
     */
    handleSkillClick(skill) {
        // Navigate to search with skill filter
        UIHelper.showSection('search');
        const searchInput = document.getElementById('skillSearch');
        if (searchInput) {
            searchInput.value = skill;
            searchInput.dispatchEvent(new Event('input'));
        }
    }

    /**
     * Show connection modal
     */
    showConnectionModal() {
        const currentUser = storage.getCurrentUser();
        if (!currentUser) {
            UIHelper.showToast('Please login to connect with users', 'warning');
            return;
        }

        // Fill connection modal with user info
        const connectionInfo = document.getElementById('connectionInfo');
        if (connectionInfo) {
            connectionInfo.innerHTML = `
                <img src="${this.user.avatar || UIHelper.generatePlaceholderAvatar(this.user.name)}" 
                     alt="${this.user.name}">
                <div class="connection-info-text">
                    <h4>Connect with ${UIHelper.sanitizeHTML(this.user.name)}</h4>
                    <p>${UIHelper.sanitizeHTML(this.user.location)}</p>
                </div>
            `;
        }

        // Store target user ID for form submission
        const connectionForm = document.getElementById('connectionForm');
        if (connectionForm) {
            connectionForm.dataset.targetUserId = this.user.id;
        }

        UIHelper.showModal('connectionModal');
    }

    /**
     * Show user profile (can be extended to show in modal or navigate to profile page)
     */
    showUserProfile() {
        // For now, just show a toast with user info
        // In a real app, this might navigate to a detailed profile page
        UIHelper.showToast(`Viewing ${this.user.name}'s profile`, 'info');
        
        // You could implement a detailed profile modal here
        console.log('User profile:', this.user);
    }

    /**
     * Update card with new user data
     * @param {Object} newUserData - Updated user data
     */
    update(newUserData) {
        this.user = { ...this.user, ...newUserData };
        
        // Find the card element and update it
        const cardElement = document.querySelector(`[data-user-id="${this.user.id}"]`);
        if (cardElement) {
            cardElement.outerHTML = this.render();
            
            // Reattach event listeners to the new element
            const newCardElement = document.querySelector(`[data-user-id="${this.user.id}"]`);
            if (newCardElement) {
                this.attachEventListeners(newCardElement);
            }
        }
    }

    /**
     * Remove card from DOM
     */
    remove() {
        const cardElement = document.querySelector(`[data-user-id="${this.user.id}"]`);
        if (cardElement) {
            // Add exit animation
            cardElement.style.transition = 'all 0.3s ease';
            cardElement.style.opacity = '0';
            cardElement.style.transform = 'scale(0.9)';
            
            setTimeout(() => {
                if (cardElement.parentNode) {
                    cardElement.parentNode.removeChild(cardElement);
                }
            }, 300);
        }
    }

    /**
     * Create a compact version of the user card
     * @returns {string} Compact card HTML
     */
    renderCompact() {
        return `
            <div class="user-card compact" data-user-id="${this.user.id}">
                <img src="${this.user.avatar || UIHelper.generatePlaceholderAvatar(this.user.name)}" 
                     alt="${this.user.name}" 
                     class="user-card-avatar">
                <div class="user-card-info">
                    <h5>${UIHelper.sanitizeHTML(this.user.name)}</h5>
                    <p>${UIHelper.sanitizeHTML(this.user.location)}</p>
                </div>
                ${this.user.isOnline ? '<div class="online-indicator"></div>' : ''}
            </div>
        `;
    }

    /**
     * Create match card variant with compatibility score
     * @param {number} matchScore - Compatibility score
     * @param {Object} matchData - Match analysis data
     * @returns {string} Match card HTML
     */
    renderAsMatch(matchScore, matchData) {
        return `
            <div class="match-card" data-user-id="${this.user.id}">
                <div class="match-score">${matchScore}%</div>
                
                <div class="user-card-header">
                    <img src="${this.user.avatar || UIHelper.generatePlaceholderAvatar(this.user.name)}" 
                         alt="${this.user.name}" 
                         class="user-card-avatar">
                    <div class="match-info">
                        <h4>${UIHelper.sanitizeHTML(this.user.name)}</h4>
                        <p><i class="fas fa-map-marker-alt"></i> ${UIHelper.sanitizeHTML(this.user.location)}</p>
                    </div>
                </div>

                <div class="match-skills">
                    <div class="match-skill-section">
                        <h6>You can teach</h6>
                        <div class="skill-tags">
                            ${matchData.canTeach.map(skill => 
                                `<span class="skill-tag skill-offered">${UIHelper.sanitizeHTML(skill)}</span>`
                            ).join('')}
                        </div>
                    </div>
                    <div class="match-skill-section">
                        <h6>You can learn</h6>
                        <div class="skill-tags">
                            ${matchData.canLearn.map(skill => 
                                `<span class="skill-tag skill-wanted">${UIHelper.sanitizeHTML(skill)}</span>`
                            ).join('')}
                        </div>
                    </div>
                </div>

                <div class="user-card-actions">
                    <button class="btn btn-primary connect-btn" data-action="connect">
                        <i class="fas fa-handshake"></i> Connect
                    </button>
                    <button class="btn btn-outline view-profile-btn" data-action="view-profile">
                        <i class="fas fa-user"></i> Profile
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Static method to create multiple user cards
     * @param {Array} users - Array of user objects
     * @param {Object} options - Card options
     * @returns {Array} Array of UserCard instances
     */
    static createMultiple(users, options = {}) {
        return users.map(user => new UserCard(user, options));
    }

    /**
     * Static method to render multiple cards into a container
     * @param {Array} users - Array of user objects
     * @param {HTMLElement} container - Container element
     * @param {Object} options - Card options
     */
    static renderIntoContainer(users, container, options = {}) {
        if (!container) return;

        container.innerHTML = '';
        
        if (users.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <h3>No users found</h3>
                    <p>Try adjusting your search criteria</p>
                </div>
            `;
            return;
        }

        const cards = UserCard.createMultiple(users, options);
        cards.forEach((card, index) => {
            const cardElement = card.createElement();
            
            // Add stagger animation delay
            setTimeout(() => {
                container.appendChild(cardElement);
            }, index * 50);
        });
    }
}

// Add CSS for online indicator
const style = document.createElement('style');
style.textContent = `
    .user-card {
        position: relative;
    }
    
    .online-indicator {
        position: absolute;
        top: 1rem;
        right: 1rem;
        width: 12px;
        height: 12px;
        background-color: var(--success-color);
        border-radius: 50%;
        border: 2px solid var(--bg-primary);
        animation: pulse 2s infinite;
    }
    
    .user-card.compact {
        padding: 1rem;
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    
    .user-card.compact .user-card-avatar {
        width: 2.5rem;
        height: 2.5rem;
    }
    
    .user-card.compact .user-card-info h5 {
        margin: 0 0 0.25rem 0;
        font-size: 0.875rem;
    }
    
    .user-card.compact .user-card-info p {
        margin: 0;
        font-size: 0.75rem;
        color: var(--text-secondary);
    }
    
    .empty-state {
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
    
    .last-active {
        font-size: 0.75rem !important;
        color: var(--text-muted) !important;
    }
    
    .skill-section {
        margin-bottom: 0.75rem;
    }
    
    .skill-section:last-child {
        margin-bottom: 0;
    }
    
    .skill-section h5 {
        font-size: 0.75rem;
        margin-bottom: 0.5rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-muted);
    }
    
    .skill-tag.more {
        background-color: var(--text-muted);
        font-size: 0.7rem;
    }
`;
document.head.appendChild(style);

// Export for global use
window.UserCard = UserCard;