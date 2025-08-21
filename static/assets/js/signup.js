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
    console.log('All utilities loaded, initializing signup...');
    
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Signup page loaded');
        
        // Redirect if already logged in
        if (AuthUtils.isLoggedIn()) {
            console.log('User already logged in, redirecting to chat...');
            window.location.href = 'liveChat.html';
            return;
        }
        
        const signupForm = document.querySelector('.signup-form');
        
        // Form submission
        if (signupForm) {
            signupForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const nameInput = this.querySelector('input[type="text"]');
                const emailInput = this.querySelector('input[type="email"]');
                const passwordInputs = this.querySelectorAll('input[type="password"]');
                
                const name = nameInput ? nameInput.value.trim() : '';
                const email = emailInput ? emailInput.value.trim() : '';
                const password = passwordInputs[0] ? passwordInputs[0].value : '';
                const confirmPassword = passwordInputs[1] ? passwordInputs[1].value : '';
                
                // Validate form
                if (!validateSignupForm(name, email, password, confirmPassword)) {
                    return;
                }
                
                // Create user object
                const user = {
                    name,
                    email,
                    password,
                    createdAt: new Date().toISOString(),
                    role: 'customer'
                };
                
                // Save user
                if (StorageManager.saveUser(user)) {
                    // Show success message and redirect to login page
                    showNotification('Account created successfully! Please login.', 'success');
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 2000);
                } else {
                    showError('Failed to create account. Please try again.');
                }
            });
        }
        
        function validateSignupForm(name, email, password, confirmPassword) {
            // Reset previous errors
            clearErrors();
            
            let isValid = true;
            
            if (!FormValidator.validateName(name)) {
                showError('name', 'Please enter a valid name (at least 2 characters)');
                isValid = false;
            }
            
            if (!FormValidator.validateEmail(email)) {
                showError('email', 'Please enter a valid email address');
                isValid = false;
            }
            
            if (!FormValidator.validatePassword(password)) {
                showError('password', 'Password must be at least 6 characters long');
                isValid = false;
            }
            
            if (password !== confirmPassword) {
                showError('confirmPassword', 'Passwords do not match');
                isValid = false;
            }
            
            // Check if email already exists
            const existingUser = StorageManager.getUserByEmail(email);
            if (existingUser) {
                showError('email', 'This email is already registered');
                isValid = false;
            }
            
            return isValid;
        }
        
        function showError(fieldType, message) {
            const fields = {
                'name': 'input[type="text"]',
                'email': 'input[type="email"]',
                'password': 'input[type="password"]:first-of-type',
                'confirmPassword': 'input[type="password"]:last-of-type'
            };
            
            const field = document.querySelector(fields[fieldType]);
            if (!field) {
                // Show general error
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message general-error';
                errorDiv.textContent = message;
                errorDiv.style.color = '#e74c3c';
                errorDiv.style.fontSize = '14px';
                errorDiv.style.marginTop = '10px';
                errorDiv.style.textAlign = 'center';
                
                signupForm.appendChild(errorDiv);
                return;
            }
            
            // Add error class to input
            field.classList.add('error');
            
            // Create error message
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = message;
            errorDiv.style.color = '#e74c3c';
            errorDiv.style.fontSize = '14px';
            errorDiv.style.marginTop = '5px';
            
            field.parentNode.appendChild(errorDiv);
        }
        
        function clearErrors() {
            // Remove error messages
            const errorMessages = document.querySelectorAll('.error-message');
            errorMessages.forEach(error => error.remove());
            
            // Remove error classes from inputs
            const errorInputs = document.querySelectorAll('.error');
            errorInputs.forEach(input => input.classList.remove('error'));
        }
        
        function showNotification(message, type) {
            // Create notification element
            const notification = document.createElement('div');
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
});