document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const loginLink = document.getElementById('loginLink');
    const registerLink = document.getElementById('registerLink');
    const homeLoginBtn = document.getElementById('homeLoginBtn');
    const homeRegisterBtn = document.getElementById('homeRegisterBtn');
    const goToLoginLink = document.getElementById('goToLoginLink');
    const goToRegisterLink = document.getElementById('goToRegisterLink');
    const goToLoginAfterRegister = document.getElementById('goToLoginAfterRegister');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    // Section elements
    const homeSection = document.getElementById('homeSection');
    const loginSection = document.getElementById('loginSection');
    const registerSection = document.getElementById('registerSection');
    const kitchensinkSection = document.getElementById('kitchensinkSection');
    const adminSection = document.getElementById('adminSection');
    
    // Authentication state
    let authToken = localStorage.getItem('authToken');
    let currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    // Navigation
    loginLink.addEventListener('click', showLogin);
    registerLink.addEventListener('click', showRegister);
    homeLoginBtn.addEventListener('click', showLogin);
    homeRegisterBtn.addEventListener('click', showRegister);
    goToLoginLink.addEventListener('click', showLogin);
    goToRegisterLink.addEventListener('click', showRegister);
    goToLoginAfterRegister.addEventListener('click', showLogin);
    logoutBtn.addEventListener('click', logout);
    
    // Initialize the app
    initializeAuth();
    
    // Form submissions
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        login();
    });
    
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        register();
    });
    
    // Functions
    function initializeAuth() {
        if (authToken) {
            updateUIForAuthenticatedUser();
        } else {
            updateUIForUnauthenticatedUser();
            showHome();
        }
    }
    
    function updateUIForAuthenticatedUser() {
        document.querySelectorAll('.auth-required').forEach(elem => {
            elem.style.display = 'block';
        });
        document.querySelectorAll('.auth-not-required').forEach(elem => {
            elem.style.display = 'none';
        });
        
        // Check if user has admin role
        if (currentUser.roles && currentUser.roles.includes('ROLE_ADMIN')) {
            document.querySelectorAll('.admin-only').forEach(elem => {
                elem.style.display = 'block';
            });
        } else {
            document.querySelectorAll('.admin-only').forEach(elem => {
                elem.style.display = 'none';
            });
        }
    }
    
    function updateUIForUnauthenticatedUser() {
        document.querySelectorAll('.auth-required').forEach(elem => {
            elem.style.display = 'none';
        });
        document.querySelectorAll('.auth-not-required').forEach(elem => {
            elem.style.display = 'block';
        });
        document.querySelectorAll('.admin-only').forEach(elem => {
            elem.style.display = 'none';
        });
    }
    
    function showSection(section) {
        homeSection.style.display = 'none';
        loginSection.style.display = 'none';
        registerSection.style.display = 'none';
        kitchensinkSection.style.display = 'none';
        adminSection.style.display = 'none';
        
        section.style.display = 'block';
    }
    
    function showHome() {
        showSection(homeSection);
    }
    
    function showLogin() {
        showSection(loginSection);
        document.getElementById('loginError').style.display = 'none';
        loginForm.reset();
    }
    
    function showRegister() {
        showSection(registerSection);
        document.getElementById('registerError').style.display = 'none';
        document.getElementById('registerSuccess').style.display = 'none';
        registerForm.reset();
    }
    
    function showKitchenSink() {
        showSection(kitchensinkSection);
        // Trigger loading contacts (implemented in kitchensink.js)
        if (typeof loadUserContacts === 'function') {
            loadUserContacts();
        }
    }
    
    function showAdmin() {
        showSection(adminSection);
        // Trigger loading admin data (implemented in admin.js)
        if (typeof loadAdminData === 'function') {
            loadAdminData();
        }
    }
    
    function login() {
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        
        // Validate form
        if (!username || !password) {
            document.getElementById('loginError').textContent = 'Username and password are required.';
            document.getElementById('loginError').style.display = 'block';
            return;
        }
        
        fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Invalid credentials');
            }
            return response.json();
        })
        .then(data => {
            // Store auth data
            localStorage.setItem('authToken', data.accessToken);
            localStorage.setItem('currentUser', JSON.stringify({
                username: data.username,
                roles: data.roles
            }));
            
            // Update auth state
            authToken = data.accessToken;
            currentUser = {
                username: data.username,
                roles: data.roles
            };
            
            // Update UI
            updateUIForAuthenticatedUser();
            
            // Show appropriate section based on role
            if (currentUser.roles.includes('ROLE_ADMIN')) {
                showAdmin();
            } else {
                showKitchenSink();
            }
        })
        .catch(error => {
            document.getElementById('loginError').textContent = 'Login failed: ' + error.message;
            document.getElementById('loginError').style.display = 'block';
        });
    }
    
    function register() {
        const username = document.getElementById('registerUsername').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        
        // Validate form
        if (!username || !email || !password) {
            document.getElementById('registerError').textContent = 'All fields are required.';
            document.getElementById('registerError').style.display = 'block';
            return;
        }
        
        if (password !== confirmPassword) {
            document.getElementById('registerError').textContent = 'Passwords do not match.';
            document.getElementById('registerError').style.display = 'block';
            return;
        }
        
        if (username.length < 3 || username.length > 50) {
            document.getElementById('registerError').textContent = 'Username must be between 3 and 50 characters.';
            document.getElementById('registerError').style.display = 'block';
            return;
        }
        
        if (password.length < 6 || password.length > 40) {
            document.getElementById('registerError').textContent = 'Password must be between 6 and 40 characters.';
            document.getElementById('registerError').style.display = 'block';
            return;
        }
        
        fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password }),
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.message || 'Registration failed'); });
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('registerError').style.display = 'none';
            document.getElementById('registerSuccess').style.display = 'block';
            registerForm.reset();
        })
        .catch(error => {
            document.getElementById('registerError').textContent = error.message;
            document.getElementById('registerError').style.display = 'block';
        });
    }
    
    function logout() {
        // Clear auth data
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        
        // Update auth state
        authToken = null;
        currentUser = {};
        
        // Update UI
        updateUIForUnauthenticatedUser();
        showHome();
    }
    
    // Expose functions to global scope for use in other JS files
    window.authToken = authToken;
    window.currentUser = currentUser;
    window.showKitchenSink = showKitchenSink;
    window.showAdmin = showAdmin;
    
    // Set up event listeners for navigation
    document.getElementById('kitchensinkLink').addEventListener('click', showKitchenSink);
    document.getElementById('adminLink').addEventListener('click', showAdmin);
});