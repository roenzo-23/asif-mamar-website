/**
 * SkillTag component for displaying skill badges
 */
class SkillTag {
    constructor(skill, type = 'default', options = {}) {
        this.skill = skill;
        this.type = type; // 'offered', 'wanted', 'featured', 'default'
        this.options = {
            clickable: false,
            removable: false,
            size: 'normal', // 'small', 'normal', 'large'
            onClick: null,
            onRemove: null,
            ...options
        };
    }

    /**
     * Render the skill tag
     * @returns {string} HTML string
     */
    render() {
        const sizeClass = this.options.size !== 'normal' ? `skill-tag-${this.options.size}` : '';
        const clickableClass = this.options.clickable ? 'skill-tag-clickable' : '';
        const removableClass = this.options.removable ? 'skill-tag-removable' : '';
        
        return `
            <span class="skill-tag skill-${this.type} ${sizeClass} ${clickableClass} ${removableClass}" 
                  data-skill="${UIHelper.sanitizeHTML(this.skill)}">
                ${UIHelper.sanitizeHTML(this.skill)}
                ${this.options.removable ? '<i class="fas fa-times skill-tag-remove"></i>' : ''}
            </span>
        `;
    }

    /**
     * Create and return DOM element
     * @returns {HTMLElement} Skill tag element
     */
    createElement() {
        const container = document.createElement('div');
        container.innerHTML = this.render();
        const element = container.firstElementChild;
        
        this.attachEventListeners(element);
        
        return element;
    }

    /**
     * Attach event listeners
     * @param {HTMLElement} element - Tag element
     */
    attachEventListeners(element) {
        if (this.options.clickable && this.options.onClick) {
            element.addEventListener('click', (e) => {
                e.stopPropagation();
                this.options.onClick(this.skill);
            });
        }

        if (this.options.removable) {
            const removeBtn = element.querySelector('.skill-tag-remove');
            if (removeBtn) {
                removeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (this.options.onRemove) {
                        this.options.onRemove(this.skill);
                    }
                    element.remove();
                });
            }
        }
    }

    /**
     * Create multiple skill tags
     * @param {Array} skills - Array of skill strings
     * @param {string} type - Tag type
     * @param {Object} options - Tag options
     * @returns {Array} Array of SkillTag instances
     */
    static createMultiple(skills, type = 'default', options = {}) {
        return skills.map(skill => new SkillTag(skill, type, options));
    }

    /**
     * Render multiple skill tags into container
     * @param {Array} skills - Array of skill strings
     * @param {HTMLElement} container - Container element
     * @param {string} type - Tag type
     * @param {Object} options - Tag options
     */
    static renderIntoContainer(skills, container, type = 'default', options = {}) {
        if (!container) return;
        
        container.innerHTML = '';
        
        if (skills.length === 0) {
            container.innerHTML = '<span class="text-muted">No skills</span>';
            return;
        }

        const tags = SkillTag.createMultiple(skills, type, options);
        tags.forEach(tag => {
            container.appendChild(tag.createElement());
        });
    }

    /**
     * Get all unique skills from multiple arrays
     * @param {...Array} skillArrays - Multiple skill arrays
     * @returns {Array} Unique skills
     */
    static getUniqueSkills(...skillArrays) {
        const allSkills = skillArrays.flat();
        return [...new Set(allSkills.map(skill => skill.toLowerCase()))]
            .map(lowerSkill => allSkills.find(skill => skill.toLowerCase() === lowerSkill));
    }

    /**
     * Filter skills by query
     * @param {Array} skills - Skills array
     * @param {string} query - Search query
     * @returns {Array} Filtered skills
     */
    static filterSkills(skills, query) {
        if (!query) return skills;
        
        const lowerQuery = query.toLowerCase();
        return skills.filter(skill => 
            skill.toLowerCase().includes(lowerQuery)
        );
    }
}

// Add CSS for skill tag variations
const skillTagStyles = document.createElement('style');
skillTagStyles.textContent = `
    .skill-tag-small {
        font-size: 0.7rem;
        padding: 0.25rem 0.5rem;
    }
    
    .skill-tag-large {
        font-size: 0.9rem;
        padding: 0.5rem 1rem;
    }
    
    .skill-tag-clickable {
        cursor: pointer;
    }
    
    .skill-tag-clickable:hover {
        transform: translateY(-1px);
        box-shadow: var(--shadow-md);
    }
    
    .skill-tag-removable {
        padding-right: 2rem;
        position: relative;
    }
    
    .skill-tag-remove {
        position: absolute;
        right: 0.5rem;
        top: 50%;
        transform: translateY(-50%);
        cursor: pointer;
        font-size: 0.7rem;
        opacity: 0.7;
        transition: opacity var(--transition-fast);
    }
    
    .skill-tag-remove:hover {
        opacity: 1;
    }
    
    .text-muted {
        color: var(--text-muted);
        font-style: italic;
    }
`;
document.head.appendChild(skillTagStyles);

// Export for global use
window.SkillTag = SkillTag;