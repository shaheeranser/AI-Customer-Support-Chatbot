// Wait for utils to load
function checkUtilsLoaded(callback) {
    if (typeof AuthUtils !== 'undefined' && 
        typeof FormValidator !== 'undefined' && 
        typeof StorageManager !== 'undefined') {
        callback();
    } else {
        setTimeout(() => checkUtilsLoaded(callback), 100);
    }
}

checkUtilsLoaded(function() {
    console.log('All utilities loaded, initializing profile...');
    
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Profile page loaded');
        
        // Redirect if not logged in
        if (!AuthUtils.isLoggedIn()) {
            console.log('User not logged in, redirecting to login...');
            window.location.href = 'login.html';
            return;
        }
        
        const currentUser = AuthUtils.getCurrentUser();
        if (!currentUser) {
            console.error('No user data found');
            window.location.href = 'login.html';
            return;
        }
        
        console.log('Current user:', currentUser);
        
        // Initialize profile with user data
        initializeProfile(currentUser);
        setupEventListeners();
    });
    
    function initializeProfile(user) {
        // Populate form fields
        document.getElementById('fullname').value = user.name || '';
        document.getElementById('email').value = user.email || '';
        document.getElementById('phone').value = user.phone || '';
        
        // Set avatar initials
        const initials = getInitials(user.name);
        document.querySelectorAll('.avatar, .account-avatar').forEach(avatar => {
            avatar.textContent = initials;
        });
        
        // Populate account info
        document.getElementById('profileName').textContent = user.name;
        document.getElementById('profileEmail').textContent = user.email;
        
        // Populate account plan details
        document.getElementById('accountPlan').textContent = user.plan || 'No Plan';
        document.getElementById('accountJoined').textContent = user.joined || 'Jan 2024';
        document.getElementById('accountStatus').textContent = user.status || 'Active';
        
        // Disable form initially
        toggleEditMode(false);
    }
    
    function setupEventListeners() {
        const saveBtn = document.querySelector('.save-btn');
        const togglePasswordBtn = document.querySelector('.toggle-password');
        const passwordInput = document.getElementById('password');
        const editBtn = document.querySelector('.edit-btn');
        
        // Toggle password visibility
        if (togglePasswordBtn && passwordInput) {
            togglePasswordBtn.addEventListener('click', function() {
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    togglePasswordBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
                } else {
                    passwordInput.type = 'password';
                    togglePasswordBtn.innerHTML = '<i class="fas fa-eye"></i>';
                }
            });
        }
        
        // Save profile changes
        if (saveBtn) {
            saveBtn.addEventListener('click', saveProfile);
        }
        
        // Edit button functionality
        if (editBtn) {
            editBtn.addEventListener('click', function() {
                toggleEditMode(true);
            });
        }
    }
    
    function saveProfile() {
        const currentUser = AuthUtils.getCurrentUser();
        const updatedUser = {
            ...currentUser,
            name: document.getElementById('fullname').value.trim(),
            phone: document.getElementById('phone').value.trim()
        };
        
        const newPassword = document.getElementById('password').value;
        if (newPassword && newPassword !== '••••••••') {
            if (!FormValidator.validatePassword(newPassword)) {
                showNotification('Password must be at least 6 characters', 'error');
                return;
            }
            updatedUser.password = newPassword;
        }
        
        // Validate inputs
        if (!FormValidator.validateName(updatedUser.name)) {
            showNotification('Please enter a valid name', 'error');
            return;
        }
        
        if (updatedUser.phone && !FormValidator.validatePhone(updatedUser.phone)) {
            showNotification('Please enter a valid phone number', 'error');
            return;
        }
        
        // Save updated user to all users list
        if (StorageManager.saveUser(updatedUser)) {
            // Update current user session
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            
            showNotification('Profile updated successfully', 'success');
            toggleEditMode(false);
            
            // Update displayed values
            document.getElementById('profileName').textContent = updatedUser.name;
            document.getElementById('profileEmail').textContent = updatedUser.email;
            
            // Clear password field
            document.getElementById('password').value = '••••••••';
        } else {
            showNotification('Failed to update profile', 'error');
        }
    }
    
    function toggleEditMode(enable) {
        const inputs = document.querySelectorAll('.profile-form input');
        const saveBtn = document.querySelector('.save-btn');
        const editBtn = document.querySelector('.edit-btn');
        
        inputs.forEach(input => {
            // Don't disable email field as it's used for authentication
            if (input.id !== 'email') {
                input.disabled = !enable;
            }
        });
        
        if (enable) {
            saveBtn.style.display = 'block';
            editBtn.style.display = 'none';
            document.getElementById('password').value = ''; // Clear placeholder when editing
        } else {
            saveBtn.style.display = 'none';
            editBtn.style.display = 'block';
            document.getElementById('password').value = '••••••••'; // Reset placeholder
        }
    }
    
    function getInitials(name) {
        if (!name) return 'US';
        return name.split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    }
    
    function showNotification(message, type) {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.padding = '15px 20px';
        notification.style.borderRadius = '5px';
        notification.style.color = 'white';
        notification.style.zIndex = '1000';
        notification.style.fontWeight = '500';
        
        if (type === 'success') {
            notification.style.background = '#27ae60';
        } else {
            notification.style.background = '#e74c3c';
        }
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
});