/**
 * User Manager - Single Source of Truth for User Data
 * Handles user loading, updating, and synchronization
 * Works with existing login.js and data-manager.js
 */

const UserManager = {
    STORAGE_KEYS: {
        USERS: 'users',              // Same key as data-manager.js
        CURRENT_USER: 'currentUser'   // Same key as login.js
    },

    /**
     * Initialize - Load users from JSON if not in localStorage
     * (This is already handled by data-manager.js, but we keep it for safety)
     */
    init() {
        if (!localStorage.getItem(this.STORAGE_KEYS.USERS)) {
            fetch('data/users.json')
                .then(res => res.json())
                .then(data => {
                    localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(data));
                    console.log('Users loaded from JSON');
                })
                .catch(err => console.error('Failed to load users:', err));
        } else {
            console.log('Users already in localStorage');
        }
    },

    /**
     * Get all users from localStorage
     */
    getAllUsers() {
        return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.USERS)) || [];
    },

    /**
     * Get current logged-in user
     */
    getCurrentUser() {
        const userData = localStorage.getItem(this.STORAGE_KEYS.CURRENT_USER);
        return userData ? JSON.parse(userData) : null;
    },

    /**
     * Find a user by userId
     */
    getUserById(userId) {
        const users = this.getAllUsers();
        return users.find(u => u.userId === parseInt(userId));
    },

    /**
     * Update user profile (BOTH in users array AND currentUser)
     * This is the KEY function for your editable profile!
     */
    updateUserProfile(userId, updates) {
        // 1. Get all users
        const users = this.getAllUsers();
        
        // 2. Find the user to update
        const userIndex = users.findIndex(u => u.userId === parseInt(userId));
        
        if (userIndex === -1) {
            console.error('User not found:', userId);
            return false;
        }

        // 3. Update the user in the array
        users[userIndex] = {
            ...users[userIndex],
            ...updates,
            lastUpdated: new Date().toISOString()
        };

        // 4. Save updated users array back to localStorage
        localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users));
        console.log('Users array updated');

        // 5. If this is the current user, update currentUser too!
        const currentUser = this.getCurrentUser();
        if (currentUser && currentUser.userId === userId) {
            const updatedCurrentUser = {
                ...currentUser,
                ...updates
            };
            localStorage.setItem(
                this.STORAGE_KEYS.CURRENT_USER, 
                JSON.stringify(updatedCurrentUser)
            );
            console.log('✅ Current user session updated');
        }

        return true;
    },

    /**
     * Get user's full name (helper function)
     */
    getUserFullName(userId) {
        const user = this.getUserById(userId);
        return user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
    },

    /**
     * Sync currentUser with users array (useful after login or reload)
     * Call this if you want to refresh currentUser from the users array
     */
    syncCurrentUser() {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return false;

        const latestUserData = this.getUserById(currentUser.userId);
        if (latestUserData) {
            // Update currentUser with latest data from users array
            const syncedUser = {
                userId: latestUserData.userId,
                username: latestUserData.username,
                firstName: latestUserData.firstName,
                lastName: latestUserData.lastName,
                department: latestUserData.department,
                email: latestUserData.email
            };
            localStorage.setItem(
                this.STORAGE_KEYS.CURRENT_USER,
                JSON.stringify(syncedUser)
            );
            console.log('✅ Current user synced with users array');
            return true;
        }
        return false;
    }
};

// Initialize on load
UserManager.init();

