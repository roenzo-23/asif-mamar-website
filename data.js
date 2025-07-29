/**
 * Static Data for SkillSwap Platform
 * Contains predefined lists for location suggestions and sample users
 */

// Global Cities Database for Smart Location Suggestions
const CITIES_DATABASE = [
    // United States
    'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ',
    'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA', 'Dallas, TX', 'San Jose, CA',
    'Austin, TX', 'Jacksonville, FL', 'Fort Worth, TX', 'Columbus, OH', 'Charlotte, NC',
    'San Francisco, CA', 'Indianapolis, IN', 'Seattle, WA', 'Denver, CO', 'Washington, DC',
    'Boston, MA', 'El Paso, TX', 'Nashville, TN', 'Detroit, MI', 'Oklahoma City, OK',
    'Portland, OR', 'Las Vegas, NV', 'Memphis, TN', 'Louisville, KY', 'Baltimore, MD',
    'Milwaukee, WI', 'Albuquerque, NM', 'Tucson, AZ', 'Fresno, CA', 'Sacramento, CA',
    'Mesa, AZ', 'Kansas City, MO', 'Atlanta, GA', 'Long Beach, CA', 'Colorado Springs, CO',
    'Raleigh, NC', 'Miami, FL', 'Virginia Beach, VA', 'Omaha, NE', 'Oakland, CA',
    'Minneapolis, MN', 'Tulsa, OK', 'Arlington, TX', 'Tampa, FL', 'New Orleans, LA',

    // International Cities
    'London, UK', 'Paris, France', 'Berlin, Germany', 'Madrid, Spain', 'Rome, Italy',
    'Amsterdam, Netherlands', 'Vienna, Austria', 'Prague, Czech Republic', 'Budapest, Hungary',
    'Stockholm, Sweden', 'Copenhagen, Denmark', 'Oslo, Norway', 'Helsinki, Finland',
    'Dublin, Ireland', 'Brussels, Belgium', 'Zurich, Switzerland', 'Barcelona, Spain',
    'Milan, Italy', 'Munich, Germany', 'Frankfurt, Germany', 'Warsaw, Poland',
    
    'Toronto, Canada', 'Vancouver, Canada', 'Montreal, Canada', 'Calgary, Canada',
    'Ottawa, Canada', 'Edmonton, Canada', 'Winnipeg, Canada', 'Quebec City, Canada',
    
    'Sydney, Australia', 'Melbourne, Australia', 'Brisbane, Australia', 'Perth, Australia',
    'Auckland, New Zealand', 'Wellington, New Zealand', 'Christchurch, New Zealand',
    
    'Tokyo, Japan', 'Osaka, Japan', 'Kyoto, Japan', 'Yokohama, Japan', 'Nagoya, Japan',
    'Seoul, South Korea', 'Busan, South Korea', 'Singapore', 'Hong Kong',
    'Taipei, Taiwan', 'Bangkok, Thailand', 'Manila, Philippines', 'Jakarta, Indonesia',
    'Kuala Lumpur, Malaysia', 'Ho Chi Minh City, Vietnam', 'Hanoi, Vietnam',
    
    'Mumbai, India', 'Delhi, India', 'Bangalore, India', 'Hyderabad, India', 
    'Chennai, India', 'Kolkata, India', 'Pune, India', 'Ahmedabad, India',
    
    'Shanghai, China', 'Beijing, China', 'Guangzhou, China', 'Shenzhen, China',
    'Chengdu, China', 'Hangzhou, China', 'Nanjing, China', 'Xi\'an, China',
    
    'São Paulo, Brazil', 'Rio de Janeiro, Brazil', 'Brasília, Brazil', 'Salvador, Brazil',
    'Buenos Aires, Argentina', 'Santiago, Chile', 'Lima, Peru', 'Bogotá, Colombia',
    'Mexico City, Mexico', 'Guadalajara, Mexico', 'Monterrey, Mexico',
    
    'Cairo, Egypt', 'Lagos, Nigeria', 'Johannesburg, South Africa', 'Cape Town, South Africa',
    'Nairobi, Kenya', 'Casablanca, Morocco', 'Tel Aviv, Israel', 'Dubai, UAE',
    'Riyadh, Saudi Arabia', 'Doha, Qatar', 'Kuwait City, Kuwait', 'Istanbul, Turkey',
    'Moscow, Russia', 'St. Petersburg, Russia'
];

// Sample Users Database
const SAMPLE_USERS = [
    {
        id: 'user-1',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        location: 'San Francisco, CA',
        skillsOffered: ['JavaScript', 'React', 'Node.js', 'Web Design'],
        skillsWanted: ['Python', 'Machine Learning', 'Data Science', 'DevOps'],
        joinDate: '2024-01-15'
    },
    {
        id: 'user-2',
        name: 'Michael Chen',
        email: 'michael.chen@email.com',
        location: 'New York, NY',
        skillsOffered: ['Python', 'Django', 'Machine Learning', 'Data Analysis'],
        skillsWanted: ['JavaScript', 'React', 'Mobile Development', 'UI/UX Design'],
        joinDate: '2024-01-20'
    },
    {
        id: 'user-3',
        name: 'Emily Rodriguez',
        email: 'emily.rodriguez@email.com',
        location: 'Austin, TX',
        skillsOffered: ['UI/UX Design', 'Figma', 'Adobe Creative Suite', 'Prototyping'],
        skillsWanted: ['Frontend Development', 'CSS Animations', 'Vue.js', 'TypeScript'],
        joinDate: '2024-02-01'
    },
    {
        id: 'user-4',
        name: 'David Kim',
        email: 'david.kim@email.com',
        location: 'Seattle, WA',
        skillsOffered: ['DevOps', 'AWS', 'Docker', 'Kubernetes', 'CI/CD'],
        skillsWanted: ['Blockchain', 'Cybersecurity', 'Go Programming', 'Terraform'],
        joinDate: '2024-02-05'
    },
    {
        id: 'user-5',
        name: 'Lisa Thompson',
        email: 'lisa.thompson@email.com',
        location: 'Los Angeles, CA',
        skillsOffered: ['Digital Marketing', 'SEO', 'Content Strategy', 'Social Media'],
        skillsWanted: ['Web Analytics', 'Email Marketing', 'Graphic Design', 'Video Editing'],
        joinDate: '2024-02-10'
    },
    {
        id: 'user-6',
        name: 'Alex Martinez',
        email: 'alex.martinez@email.com',
        location: 'Chicago, IL',
        skillsOffered: ['Mobile Development', 'React Native', 'Flutter', 'iOS Development'],
        skillsWanted: ['Backend Development', 'Database Design', 'API Development', 'Cloud Computing'],
        joinDate: '2024-02-12'
    },
    {
        id: 'user-7',
        name: 'Jennifer Lee',
        email: 'jennifer.lee@email.com',
        location: 'Boston, MA',
        skillsOffered: ['Data Science', 'R Programming', 'Statistics', 'Data Visualization'],
        skillsWanted: ['Deep Learning', 'Natural Language Processing', 'Big Data', 'Scala'],
        joinDate: '2024-02-15'
    },
    {
        id: 'user-8',
        name: 'Robert Wilson',
        email: 'robert.wilson@email.com',
        location: 'Denver, CO',
        skillsOffered: ['Photography', 'Video Production', 'Photo Editing', 'Drone Piloting'],
        skillsWanted: ['3D Modeling', 'Animation', 'Audio Production', 'Color Grading'],
        joinDate: '2024-02-18'
    },
    {
        id: 'user-9',
        name: 'Amanda Davis',
        email: 'amanda.davis@email.com',
        location: 'Portland, OR',
        skillsOffered: ['Project Management', 'Agile Methodology', 'Scrum', 'Team Leadership'],
        skillsWanted: ['Product Management', 'Business Analysis', 'Data-driven Decision Making', 'UX Research'],
        joinDate: '2024-02-20'
    },
    {
        id: 'user-10',
        name: 'Carlos Sanchez',
        email: 'carlos.sanchez@email.com',
        location: 'Miami, FL',
        skillsOffered: ['Spanish Language', 'Translation', 'Cultural Consulting', 'International Business'],
        skillsWanted: ['Portuguese', 'French', 'Cross-cultural Communication', 'Market Research'],
        joinDate: '2024-02-22'
    },
    {
        id: 'user-11',
        name: 'Rachel Green',
        email: 'rachel.green@email.com',
        location: 'Nashville, TN',
        skillsOffered: ['Music Production', 'Audio Engineering', 'Songwriting', 'Guitar'],
        skillsWanted: ['Piano', 'Music Theory', 'Live Sound', 'Studio Management'],
        joinDate: '2024-02-25'
    },
    {
        id: 'user-12',
        name: 'Kevin O\'Connor',
        email: 'kevin.oconnor@email.com',
        location: 'Philadelphia, PA',
        skillsOffered: ['Cybersecurity', 'Ethical Hacking', 'Network Security', 'Risk Assessment'],
        skillsWanted: ['Cloud Security', 'Incident Response', 'Compliance', 'Security Architecture'],
        joinDate: '2024-02-28'
    },
    {
        id: 'user-13',
        name: 'Samantha Wright',
        email: 'samantha.wright@email.com',
        location: 'San Diego, CA',
        skillsOffered: ['Yoga Instruction', 'Meditation', 'Wellness Coaching', 'Nutrition'],
        skillsWanted: ['Pilates', 'Personal Training', 'Mental Health Counseling', 'Holistic Health'],
        joinDate: '2024-03-01'
    },
    {
        id: 'user-14',
        name: 'James Robinson',
        email: 'james.robinson@email.com',
        location: 'Phoenix, AZ',
        skillsOffered: ['Blockchain Development', 'Smart Contracts', 'Cryptocurrency', 'DeFi'],
        skillsWanted: ['NFT Development', 'Web3', 'Tokenomics', 'Solidity Advanced'],
        joinDate: '2024-03-03'
    },
    {
        id: 'user-15',
        name: 'Michelle Brown',
        email: 'michelle.brown@email.com',
        location: 'Atlanta, GA',
        skillsOffered: ['Public Speaking', 'Presentation Skills', 'Communication', 'Leadership'],
        skillsWanted: ['Negotiation', 'Conflict Resolution', 'Executive Coaching', 'Team Building'],
        joinDate: '2024-03-05'
    }
];

/**
 * Function to get location suggestions based on user input
 * @param {string} query - User's input query
 * @param {number} limit - Maximum number of suggestions to return
 * @returns {Array} Array of matching city suggestions
 */
function getLocationSuggestions(query, limit = 8) {
    if (!query || query.length < 2) return [];
    
    const normalizedQuery = query.toLowerCase().trim();
    
    // Filter cities that match the query
    const matches = CITIES_DATABASE.filter(city => 
        city.toLowerCase().includes(normalizedQuery)
    );
    
    // Sort by relevance (exact matches first, then starts with, then contains)
    matches.sort((a, b) => {
        const aLower = a.toLowerCase();
        const bLower = b.toLowerCase();
        
        // Exact match
        if (aLower === normalizedQuery) return -1;
        if (bLower === normalizedQuery) return 1;
        
        // Starts with query
        if (aLower.startsWith(normalizedQuery) && !bLower.startsWith(normalizedQuery)) return -1;
        if (bLower.startsWith(normalizedQuery) && !aLower.startsWith(normalizedQuery)) return 1;
        
        // Default alphabetical sort
        return a.localeCompare(b);
    });
    
    return matches.slice(0, limit);
}

/**
 * Function to get sample users (excluding current user)
 * @param {string} excludeUserId - Current user ID to exclude from results
 * @returns {Array} Array of sample users
 */
function getSampleUsers(excludeUserId = null) {
    return SAMPLE_USERS.filter(user => user.id !== excludeUserId);
}

/**
 * Function to search users by skill or location
 * @param {Array} users - Array of users to search
 * @param {string} skillQuery - Skill search query
 * @param {string} locationFilter - Location filter
 * @returns {Array} Filtered array of users
 */
function searchUsers(users, skillQuery = '', locationFilter = '') {
    let filteredUsers = users;
    
    // Filter by skill query
    if (skillQuery.trim()) {
        const normalizedQuery = skillQuery.toLowerCase().trim();
        filteredUsers = filteredUsers.filter(user => {
            const allSkills = [...user.skillsOffered, ...user.skillsWanted]
                .join(' ').toLowerCase();
            return allSkills.includes(normalizedQuery) || 
                   user.name.toLowerCase().includes(normalizedQuery);
        });
    }
    
    // Filter by location
    if (locationFilter.trim()) {
        const normalizedLocation = locationFilter.toLowerCase().trim();
        filteredUsers = filteredUsers.filter(user => 
            user.location.toLowerCase().includes(normalizedLocation)
        );
    }
    
    return filteredUsers;
}

/**
 * Function to get unique locations from user database
 * @param {Array} users - Array of users
 * @returns {Array} Array of unique locations
 */
function getUniqueLocations(users) {
    const locations = users.map(user => user.location);
    return [...new Set(locations)].sort();
}

/**
 * Function to calculate skill match score between two users
 * @param {Object} user1 - First user
 * @param {Object} user2 - Second user
 * @returns {number} Match score (0-100)
 */
function calculateSkillMatchScore(user1, user2) {
    // Find skills that user1 offers and user2 wants
    const user1CanTeachUser2 = user1.skillsOffered.filter(skill =>
        user2.skillsWanted.some(wantedSkill => 
            skill.toLowerCase().includes(wantedSkill.toLowerCase()) ||
            wantedSkill.toLowerCase().includes(skill.toLowerCase())
        )
    );
    
    // Find skills that user2 offers and user1 wants
    const user2CanTeachUser1 = user2.skillsOffered.filter(skill =>
        user1.skillsWanted.some(wantedSkill => 
            skill.toLowerCase().includes(wantedSkill.toLowerCase()) ||
            wantedSkill.toLowerCase().includes(skill.toLowerCase())
        )
    );
    
    const totalMatches = user1CanTeachUser2.length + user2CanTeachUser1.length;
    const maxPossibleMatches = Math.max(
        user1.skillsOffered.length + user1.skillsWanted.length,
        user2.skillsOffered.length + user2.skillsWanted.length
    );
    
    let score = maxPossibleMatches > 0 ? (totalMatches / maxPossibleMatches) * 100 : 0;
    
    // Bonus for same location
    if (user1.location === user2.location) {
        score += 10;
    }
    
    return Math.min(Math.round(score), 100);
}

/**
 * Function to sort users by skill match relevance
 * @param {Array} users - Array of users to sort
 * @param {Object} currentUser - Current user for comparison
 * @returns {Array} Sorted array of users
 */
function sortUsersByRelevance(users, currentUser) {
    if (!currentUser) return users;
    
    return users
        .map(user => ({
            ...user,
            matchScore: calculateSkillMatchScore(currentUser, user)
        }))
        .sort((a, b) => b.matchScore - a.matchScore);
}