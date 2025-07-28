/**
 * Smart Location Suggestion System
 * Provides autocomplete functionality for location input fields
 */

class LocationSuggestionSystem {
    constructor() {
        this.activeInput = null;
        this.activeSuggestions = null;
        this.debounceTimer = null;
        this.debounceDelay = 300; // milliseconds
        this.isInitialized = false;
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    /**
     * Initialize the location suggestion system
     * Sets up event listeners for all location inputs
     */
    init() {
        this.setupLocationInputs();
        this.setupGlobalClickHandler();
        this.isInitialized = true;
        console.log('✅ Location system initialized');
    }

    /**
     * Setup event listeners for location input fields
     * Automatically detects inputs within location-input-container
     */
    setupLocationInputs() {
        const locationContainers = document.querySelectorAll('.location-input-container');
        
        locationContainers.forEach(container => {
            const input = container.querySelector('input');
            const suggestionsDiv = container.querySelector('.location-suggestions');
            
            if (input && suggestionsDiv) {
                this.attachInputListeners(input, suggestionsDiv);
            }
        });
    }

    /**
     * Attach event listeners to a specific location input
     * @param {HTMLElement} input - The input element
     * @param {HTMLElement} suggestionsDiv - The suggestions container
     */
    attachInputListeners(input, suggestionsDiv) {
        // Input event for real-time suggestions
        input.addEventListener('input', (e) => {
            this.handleInputChange(e.target, suggestionsDiv);
        });

        // Focus event to show suggestions if input has value
        input.addEventListener('focus', (e) => {
            if (e.target.value.trim().length >= 2) {
                this.showSuggestions(e.target, suggestionsDiv);
            }
        });

        // Keyboard navigation
        input.addEventListener('keydown', (e) => {
            this.handleKeyNavigation(e, suggestionsDiv);
        });

        // Blur event to hide suggestions (with delay for clicks)
        input.addEventListener('blur', () => {
            setTimeout(() => {
                this.hideSuggestions(suggestionsDiv);
            }, 150);
        });
    }

    /**
     * Handle input change with debouncing
     * @param {HTMLElement} input - The input element
     * @param {HTMLElement} suggestionsDiv - The suggestions container
     */
    handleInputChange(input, suggestionsDiv) {
        const query = input.value.trim();
        
        // Clear previous debounce timer
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        // Set new debounce timer
        this.debounceTimer = setTimeout(() => {
            if (query.length >= 2) {
                this.showSuggestions(input, suggestionsDiv, query);
            } else {
                this.hideSuggestions(suggestionsDiv);
            }
        }, this.debounceDelay);
    }

    /**
     * Show location suggestions
     * @param {HTMLElement} input - The input element
     * @param {HTMLElement} suggestionsDiv - The suggestions container
     * @param {string} query - The search query (optional, uses input value if not provided)
     */
    showSuggestions(input, suggestionsDiv, query = null) {
        const searchQuery = query || input.value.trim();
        
        if (searchQuery.length < 2) {
            this.hideSuggestions(suggestionsDiv);
            return;
        }

        // Get location suggestions from data.js
        if (typeof getLocationSuggestions !== 'function') {
            console.warn('getLocationSuggestions function not available');
            return;
        }

        const suggestions = getLocationSuggestions(searchQuery);

        if (suggestions.length === 0) {
            this.hideSuggestions(suggestionsDiv);
            return;
        }

        // Clear existing suggestions
        suggestionsDiv.innerHTML = '';

        // Create suggestion elements
        suggestions.forEach((location, index) => {
            const suggestionElement = this.createSuggestionElement(location, index === 0);
            suggestionsDiv.appendChild(suggestionElement);
        });

        // Show suggestions container
        suggestionsDiv.classList.add('show');
        this.activeInput = input;
        this.activeSuggestions = suggestionsDiv;

        // Setup click handlers for suggestions
        this.setupSuggestionClickHandlers(suggestionsDiv, input);
    }

    /**
     * Create a suggestion element
     * @param {string} location - The location string
     * @param {boolean} isFirst - Whether this is the first suggestion (for highlighting)
     * @returns {HTMLElement} The suggestion element
     */
    createSuggestionElement(location, isFirst = false) {
        const suggestionDiv = document.createElement('div');
        suggestionDiv.className = `location-suggestion${isFirst ? ' highlighted' : ''}`;
        suggestionDiv.dataset.location = location;

        // Split location into city and region for better display
        const parts = location.split(', ');
        const city = parts[0];
        const region = parts.slice(1).join(', ');

        suggestionDiv.innerHTML = `
            <i class="fas fa-map-marker-alt"></i>
            <div class="suggestion-content">
                <div class="suggestion-city">${city}</div>
                ${region ? `<div class="suggestion-region">${region}</div>` : ''}
            </div>
        `;

        return suggestionDiv;
    }

    /**
     * Setup click handlers for suggestion elements
     * @param {HTMLElement} suggestionsDiv - The suggestions container
     * @param {HTMLElement} input - The input element
     */
    setupSuggestionClickHandlers(suggestionsDiv, input) {
        const suggestions = suggestionsDiv.querySelectorAll('.location-suggestion');
        
        suggestions.forEach(suggestion => {
            suggestion.addEventListener('click', () => {
                this.selectSuggestion(suggestion, input, suggestionsDiv);
            });

            // Hover effect
            suggestion.addEventListener('mouseenter', () => {
                this.highlightSuggestion(suggestion);
            });
        });
    }

    /**
     * Select a suggestion and fill the input
     * @param {HTMLElement} suggestionElement - The clicked suggestion
     * @param {HTMLElement} input - The input element
     * @param {HTMLElement} suggestionsDiv - The suggestions container
     */
    selectSuggestion(suggestionElement, input, suggestionsDiv) {
        const location = suggestionElement.dataset.location;
        
        // Fill the input with selected location
        input.value = location;
        
        // Hide suggestions
        this.hideSuggestions(suggestionsDiv);
        
        // Trigger input event to notify other parts of the app
        input.dispatchEvent(new Event('input', { bubbles: true }));
        
        // Show selection feedback
        this.showSelectionFeedback(input);
    }

    /**
     * Hide location suggestions
     * @param {HTMLElement} suggestionsDiv - The suggestions container
     */
    hideSuggestions(suggestionsDiv) {
        suggestionsDiv.classList.remove('show');
        suggestionsDiv.innerHTML = '';
        this.activeInput = null;
        this.activeSuggestions = null;
    }

    /**
     * Handle keyboard navigation for suggestions
     * @param {KeyboardEvent} e - The keyboard event
     * @param {HTMLElement} suggestionsDiv - The suggestions container
     */
    handleKeyNavigation(e, suggestionsDiv) {
        if (!suggestionsDiv.classList.contains('show')) return;

        const suggestions = suggestionsDiv.querySelectorAll('.location-suggestion');
        const currentHighlighted = suggestionsDiv.querySelector('.location-suggestion.highlighted');
        let newIndex = -1;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                if (currentHighlighted) {
                    const currentIndex = Array.from(suggestions).indexOf(currentHighlighted);
                    newIndex = Math.min(currentIndex + 1, suggestions.length - 1);
                } else {
                    newIndex = 0;
                }
                this.highlightSuggestionByIndex(suggestions, newIndex);
                break;

            case 'ArrowUp':
                e.preventDefault();
                if (currentHighlighted) {
                    const currentIndex = Array.from(suggestions).indexOf(currentHighlighted);
                    newIndex = Math.max(currentIndex - 1, 0);
                    this.highlightSuggestionByIndex(suggestions, newIndex);
                }
                break;

            case 'Enter':
                e.preventDefault();
                if (currentHighlighted) {
                    this.selectSuggestion(currentHighlighted, e.target, suggestionsDiv);
                }
                break;

            case 'Escape':
                e.preventDefault();
                this.hideSuggestions(suggestionsDiv);
                break;
        }
    }

    /**
     * Highlight a suggestion by index
     * @param {NodeList} suggestions - All suggestion elements
     * @param {number} index - Index to highlight
     */
    highlightSuggestionByIndex(suggestions, index) {
        // Remove existing highlights
        suggestions.forEach(s => s.classList.remove('highlighted'));
        
        // Add highlight to new suggestion
        if (suggestions[index]) {
            suggestions[index].classList.add('highlighted');
        }
    }

    /**
     * Highlight a specific suggestion
     * @param {HTMLElement} suggestionElement - The suggestion to highlight
     */
    highlightSuggestion(suggestionElement) {
        // Remove existing highlights
        const allSuggestions = suggestionElement.parentNode.querySelectorAll('.location-suggestion');
        allSuggestions.forEach(s => s.classList.remove('highlighted'));
        
        // Add highlight to this suggestion
        suggestionElement.classList.add('highlighted');
    }

    /**
     * Show visual feedback when a location is selected
     * @param {HTMLElement} input - The input element
     */
    showSelectionFeedback(input) {
        // Add temporary success styling
        input.style.borderColor = '#10b981';
        input.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
        
        // Remove styling after animation
        setTimeout(() => {
            input.style.borderColor = '';
            input.style.boxShadow = '';
        }, 1000);
    }

    /**
     * Setup global click handler to hide suggestions when clicking outside
     */
    setupGlobalClickHandler() {
        document.addEventListener('click', (e) => {
            // Check if click is outside location input containers
            const locationContainer = e.target.closest('.location-input-container');
            
            if (!locationContainer && this.activeSuggestions) {
                this.hideSuggestions(this.activeSuggestions);
            }
        });
    }

    /**
     * Programmatically set a location for an input
     * @param {string} inputId - The ID of the input element
     * @param {string} location - The location to set
     */
    setLocation(inputId, location) {
        const input = document.getElementById(inputId);
        if (input) {
            input.value = location;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            this.showSelectionFeedback(input);
        }
    }

    /**
     * Get current location from an input
     * @param {string} inputId - The ID of the input element
     * @returns {string} The current location value
     */
    getLocation(inputId) {
        const input = document.getElementById(inputId);
        return input ? input.value.trim() : '';
    }

    /**
     * Validate if a location exists in the database
     * @param {string} location - The location to validate
     * @returns {boolean} Whether the location is valid
     */
    validateLocation(location) {
        if (typeof CITIES_DATABASE === 'undefined') return true; // Fallback
        const normalizedLocation = location.toLowerCase().trim();
        return CITIES_DATABASE.some(city => 
            city.toLowerCase() === normalizedLocation
        );
    }

    /**
     * Clear all location inputs
     */
    clearAllInputs() {
        const locationInputs = document.querySelectorAll('.location-input-container input');
        locationInputs.forEach(input => {
            input.value = '';
        });
    }

    /**
     * Refresh the system (re-setup inputs)
     */
    refresh() {
        this.setupLocationInputs();
    }
}

// Initialize the location suggestion system
let locationSystem = new LocationSuggestionSystem();

// Make locationSystem globally accessible for other modules
window.locationSystem = locationSystem;