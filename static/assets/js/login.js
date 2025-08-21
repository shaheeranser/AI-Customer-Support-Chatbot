document.addEventListener('DOMContentLoaded', function() {
    console.log('Login page loaded');
    
    // Redirect if already logged in
    if (AuthUtils.isLoggedIn()) {
        console.log('User already logged in, redirecting to chat...');
        window.location.href = 'liveChat.html';
        return;
    }
    
    const loginForm = document.querySelector('.login-form');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.querySelector('.toggle-password');
    
    // Toggle password visibility
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', function() {
            console.log('Toggling password visibility');
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                togglePasswordBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
            } else {
                passwordInput.type = 'password';
                togglePasswordBtn.innerHTML = '<i class="fas fa-eye"></i>';
            }
        });
    }
    
    // Form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Login form submitted');
            
            const email = document.getElementById('email').value.trim();
            const password = passwordInput.value;
            
            // Clear previous errors
            clearErrors();
            
            // Validate form
            if (!validateLoginForm(email, password)) {
                console.log('Form validation failed');
                return;
            }
            
            console.log('Form validation passed');
            
            // Authenticate user
            const user = authenticateUser(email, password);
            
            if (user) {
                console.log('User authenticated successfully');
                // Save to localStorage and redirect to chat
                localStorage.setItem('currentUser', JSON.stringify(user));
                window.location.href = 'liveChat.html';
            } else {
                console.log('Authentication failed');
                showError('Invalid email or password');
            }
        });
    }
    
    function validateLoginForm(email, password) {
        let isValid = true;
        
        if (!email) {
            showError('email', 'Email is required');
            isValid = false;
        } else if (!FormValidator.validateEmail(email)) {
            showError('email', 'Please enter a valid email address');
            isValid = false;
        }
        
        if (!password) {
            showError('password', 'Password is required');
            isValid = false;
        } else if (!FormValidator.validatePassword(password)) {
            showError('password', 'Password must be at least 6 characters');
            isValid = false;
        }
        
        return isValid;
    }
    
    function authenticateUser(email, password) {
        try {
            const users = StorageManager.getUsers();
            const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
            
            if (user && user.password === password) {
                return user;
            }
            return null;
        } catch (error) {
            console.error('Authentication error:', error);
            return null;
        }
    }
    
    function showError(fieldId, message) {
        // For general errors
        if (fieldId === 'general') {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message general-error';
            errorDiv.textContent = message;
            loginForm.appendChild(errorDiv);
            return;
        }
        
        const field = document.getElementById(fieldId);
        if (field) {
            field.classList.add('error');
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = message;
            field.parentNode.appendChild(errorDiv);
        }
    }
    
    function clearErrors() {
        // Remove error messages
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(error => error.remove());
        
        // Remove error classes from inputs
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => input.classList.remove('error'));
    }
});