// addEventListener('DOMContentLoaded', () => {
//     const loginForm = document.querySelector('.login-form');
//     const usersSelect = document.getElementById('users');
//     loginForm.addEventListener('submit', (e) => {
//         e.preventDefault();
//         const selectedUser = usersSelect.value;
//         alert(`Logged in as ${selectedUser}`);
//         document.location.href="dashboard.html";
//     });
// });
// Login functionality
const DEMO_PASSWORD = '1234'; // Simple demo password

// Store users globally for validation
let allUsers = [];

document.addEventListener('DOMContentLoaded', async () => {
    const loginForm = document.querySelector('.login-form');
    const usersSelect = document.getElementById('users');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('errorMessage');
    const togglePassword = document.getElementById('togglePassword');
    const toggleIcon = document.getElementById('toggleIcon');

    // Load users from JSON file
    try {
        const response = await fetch('data/users.json');
        allUsers = await response.json();
        
        // Populate the dropdown with real users
        allUsers.forEach(user => {
            if (user.isActive) {
                const option = document.createElement('option');
                option.value = user.userId;
                option.textContent = `${user.firstName} ${user.lastName} (${user.department})`;
                option.dataset.username = user.username;
                option.dataset.department = user.department;
                option.dataset.email = user.email;
                option.dataset.firstName = user.firstName;
                option.dataset.lastName = user.lastName;
                usersSelect.appendChild(option);
            }
        });

        // fake user
        const fakeOption = document.createElement('option');
        fakeOption.value = 'fake-999';
        fakeOption.textContent = 'John Doe (Quality) FAKE';
        fakeOption.dataset.username = 'jdoe';
        fakeOption.dataset.department = 'Quality';
        fakeOption.dataset.email = 'john.doe@example.com';
        fakeOption.dataset.firstName = 'John';
        fakeOption.dataset.lastName = 'Doe';
        fakeOption.dataset.isFake = 'true'; 
        usersSelect.appendChild(fakeOption);
        
    } catch (error) {
        console.error('Error loading users:', error);
        showError('Failed to load users. Please refresh the page.');
    }

    // Password show/hide toggle
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        
        if (type === 'text') {
            toggleIcon.classList.remove('bi-eye');
            toggleIcon.classList.add('bi-eye-slash');
        } else {
            toggleIcon.classList.remove('bi-eye-slash');
            toggleIcon.classList.add('bi-eye');
        }
    });

    //form submission
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        
        hideError();
        
       
        const selectedUserId = usersSelect.value;
        const password = passwordInput.value;
        
        // Validation
        if (!selectedUserId) {
            showError('Please select a user');
            return;
        }
        
        
        if (!password) {
            showError('Please enter a password');
            return;
        }
        
        
        const selectedOption = usersSelect.options[usersSelect.selectedIndex];
        
        
        if (selectedOption.dataset.isFake === 'true') {
            showError('User does not exist. Please contact your administrator.');
            return;
        }
        
        
        const userExists = allUsers.find(user => user.userId === parseInt(selectedUserId));
        
        if (!userExists) {
            showError('User does not exist. Please contact your administrator.');
            return;
        }
        
        
        if (password !== DEMO_PASSWORD) {
            showError('Incorrect password. Please try again.');
            passwordInput.value = '';
            passwordInput.focus();
            return;
        }
        
       
        const userData = {
            userId: selectedUserId,
            username: selectedOption.dataset.username,
            firstName: selectedOption.dataset.firstName,
            lastName: selectedOption.dataset.lastName,
            department: selectedOption.dataset.department,
            email: selectedOption.dataset.email
        };
        
        
        localStorage.setItem('currentUser', JSON.stringify(userData));
        
        
        console.log('Login successful:', userData);

        // Rerouting to admin page if admin confirmed
        if (userData.department.toLowerCase() == "admin") {
            document.location.href="admin.html";
        } else {
            document.location.href="dashboard.html";
        }
    });

    // Helper functions
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.add('show');
    }

    function hideError() {
        errorMessage.textContent = '';
        errorMessage.classList.remove('show');
    }
});