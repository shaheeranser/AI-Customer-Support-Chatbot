// Check if utils is already loaded
if (typeof AuthUtils === 'undefined') {
    console.log('Initializing AuthUtils...');
    
    class AuthUtils {
        static isLoggedIn() {
            try {
                return localStorage.getItem('currentUser') !== null;
            } catch (error) {
                console.error('Error checking login status:', error);
                return false;
            }
        }
        
        static getCurrentUser() {
            try {
                const user = localStorage.getItem('currentUser');
                return user ? JSON.parse(user) : null;
            } catch (error) {
                console.error('Error getting current user:', error);
                return null;
            }
        }
        
        static logout() {
            try {
                localStorage.removeItem('currentUser');
                window.location.href = 'login.html';
            } catch (error) {
                console.error('Error during logout:', error);
            }
        }
        
        static redirectIfLoggedIn() {
            if (this.isLoggedIn()) {
                window.location.href = 'liveChat.html';
            }
        }
        
        static redirectIfNotLoggedIn() {
            if (!this.isLoggedIn()) {
                window.location.href = 'login.html';
            }
        }
    }

    class FormValidator {
        static validateEmail(email) {
            try {
                const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return re.test(email);
            } catch (error) {
                console.error('Error validating email:', error);
                return false;
            }
        }
        
        static validatePassword(password) {
            try {
                return password && password.length >= 6;
            } catch (error) {
                console.error('Error validating password:', error);
                return false;
            }
        }
        
        static validateName(name) {
            try {
                return name && name.length >= 2;
            } catch (error) {
                console.error('Error validating name:', error);
                return false;
            }
        }
        
        static validatePhone(phone) {
            try {
                const re = /^[\+]?[1-9][\d]{0,15}$/;
                return re.test(phone.replace(/[\s\-\(\)]/g, ''));
            } catch (error) {
                console.error('Error validating phone:', error);
                return false;
            }
        }
    }

    class StorageManager {
        static getUsers() {
            try {
                const users = localStorage.getItem('users');
                return users ? JSON.parse(users) : [];
            } catch (error) {
                console.error('Error reading users from storage:', error);
                return [];
            }
        }
        
        static saveUser(user) {
            try {
                const users = this.getUsers();
                const existingUserIndex = users.findIndex(u => u.email === user.email);
                
                if (existingUserIndex !== -1) {
                    users[existingUserIndex] = user;
                } else {
                    users.push(user);
                }
                
                localStorage.setItem('users', JSON.stringify(users));
                return true;
            } catch (error) {
                console.error('Error saving user:', error);
                return false;
            }
        }
        
        static getUserByEmail(email) {
            try {
                const users = this.getUsers();
                return users.find(user => user.email.toLowerCase() === email.toLowerCase());
            } catch (error) {
                console.error('Error finding user by email:', error);
                return null;
            }
        }
    }

    // Initialize demo data if needed
    function initializeDemoData() {
        try {
            if (!localStorage.getItem('users')) {
                const demoUsers = [
                    {
                        name: 'Sarah Agent',
                        email: 'sarah@candacs.com',
                        password: 'password123',
                        phone: '+15551234567',
                        role: 'agent'
                    },
                    {
                        name: 'John Smith',
                        email: 'john@email.com',
                        password: 'password123',
                        phone: '+15559876543',
                        role: 'customer'
                    }
                ];
                localStorage.setItem('users', JSON.stringify(demoUsers));
                console.log('Demo data initialized');
            }
        } catch (error) {
            console.error('Error initializing demo data:', error);
        }
    }

    // Make classes globally available
    window.AuthUtils = AuthUtils;
    window.FormValidator = FormValidator;
    window.StorageManager = StorageManager;

    // Initialize when utils loads
    initializeDemoData();
    
    console.log('Auth utilities initialized successfully');
} else {
    console.log('AuthUtils already loaded');
}