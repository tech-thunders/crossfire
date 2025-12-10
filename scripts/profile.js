/**
 * Profile Page Handler
 * Manages view/edit modes and profile updates
 */

let currentUser = null;
let isEditMode = false;

// Auth Check - Must be first
(function() {
  const userData = localStorage.getItem('currentUser');
  if (!userData) {
    window.location.replace('index.html');
    return;
  }
})();

// ==========================================
// LOAD PROFILE DATA
// ==========================================

function loadProfile() {
  currentUser = UserManager.getCurrentUser();
  
  if (!currentUser) {
    window.location.href = 'index.html';
    return;
  }

  displayProfile();
}

function displayProfile() {
  if (!currentUser) return;

  // Update navbar
  document.getElementById('userName').textContent = currentUser.firstName;
  document.getElementById('profileName').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
  document.getElementById('profileDepartment').textContent = currentUser.department;

  // Update profile page header
  document.getElementById('profileFullName').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
  document.getElementById('profileRole').textContent = currentUser.department;

  // Update VIEW MODE values
  document.getElementById('detailFirstName').textContent = currentUser.firstName;
  document.getElementById('detailLastName').textContent = currentUser.lastName;
  document.getElementById('detailEmail').textContent = currentUser.email;
  document.getElementById('detailDepartment').textContent = currentUser.department;
  document.getElementById('detailUsername').textContent = currentUser.username;
  document.getElementById('detailUserId').textContent = currentUser.userId;

  // Update EDIT MODE input values (so they're ready when user clicks edit)
  document.getElementById('editFirstName').value = currentUser.firstName;
  document.getElementById('editLastName').value = currentUser.lastName;
  document.getElementById('editEmail').value = currentUser.email;
}

// ==========================================
// EDIT MODE TOGGLE
// ==========================================

function enterEditMode() {
  isEditMode = true;
  
  // Add class to body to trigger CSS changes
  document.body.classList.add('editing');
  
  // Toggle button visibility
  document.getElementById('viewModeButtons').style.display = 'none';
  document.getElementById('editModeButtons').style.display = 'flex';
  
  // Clear any previous errors
  clearAllErrors();
}

function cancelEdit() {
  isEditMode = false;
  
  // Remove editing class
  document.body.classList.remove('editing');
  
  // Toggle button visibility
  document.getElementById('viewModeButtons').style.display = 'flex';
  document.getElementById('editModeButtons').style.display = 'none';
  
  // Reset input values to original
  document.getElementById('editFirstName').value = currentUser.firstName;
  document.getElementById('editLastName').value = currentUser.lastName;
  document.getElementById('editEmail').value = currentUser.email;
  
  // Clear errors
  clearAllErrors();
}

// ==========================================
// VALIDATION
// ==========================================

function validateFirstName() {
  const input = document.getElementById('editFirstName');
  const error = document.getElementById('firstNameError');
  const value = input.value.trim();
  
  if (value === '') {
    input.classList.add('error');
    error.classList.add('show');
    return false;
  }
  
  input.classList.remove('error');
  error.classList.remove('show');
  return true;
}

function validateLastName() {
  const input = document.getElementById('editLastName');
  const error = document.getElementById('lastNameError');
  const value = input.value.trim();
  
  if (value === '') {
    input.classList.add('error');
    error.classList.add('show');
    return false;
  }
  
  input.classList.remove('error');
  error.classList.remove('show');
  return true;
}

function validateEmail() {
  const input = document.getElementById('editEmail');
  const error = document.getElementById('emailError');
  const value = input.value.trim();
  
  // Email regex pattern
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (value === '' || !emailPattern.test(value)) {
    input.classList.add('error');
    error.classList.add('show');
    return false;
  }
  
  input.classList.remove('error');
  error.classList.remove('show');
  return true;
}

function clearAllErrors() {
  const inputs = document.querySelectorAll('.edit-input');
  const errors = document.querySelectorAll('.error-message');
  
  inputs.forEach(input => input.classList.remove('error'));
  errors.forEach(error => error.classList.remove('show'));
}

// ==========================================
// SAVE PROFILE
// ==========================================

function saveProfile() {
  // Validate all fields
  const isFirstNameValid = validateFirstName();
  const isLastNameValid = validateLastName();
  const isEmailValid = validateEmail();
  
  if (!isFirstNameValid || !isLastNameValid || !isEmailValid) {
    alert('Please fix the errors before saving');
    return;
  }
  
  // Get new values
  const newFirstName = document.getElementById('editFirstName').value.trim();
  const newLastName = document.getElementById('editLastName').value.trim();
  const newEmail = document.getElementById('editEmail').value.trim();
  
  // Check if anything actually changed
  if (
    newFirstName === currentUser.firstName &&
    newLastName === currentUser.lastName &&
    newEmail === currentUser.email
  ) {
    alert('No changes detected');
    cancelEdit();
    return;
  }
  
  // Prepare updates object
  const updates = {
    firstName: newFirstName,
    lastName: newLastName,
    email: newEmail
  };
  
  // Use UserManager to update (this updates BOTH users array AND currentUser)
  const success = UserManager.updateUserProfile(currentUser.userId, updates);
  
  if (success) {
    // Reload current user data
    currentUser = UserManager.getCurrentUser();
    
    // Update display
    displayProfile();
    
    // Exit edit mode
    cancelEdit();
    
    // Show success message
    alert('Profile updated successfully! ✓');
  } else {
    alert('Failed to update profile. Please try again.');
  }
}

// ==========================================
// OTHER FUNCTIONS
// ==========================================

function toggleProfileMenu() {
  const popup = document.getElementById('profilePopup');
  const notificationPopup = document.getElementById('notificationPopup');
  notificationPopup.classList.add('hidden');
  popup.classList.toggle('hidden');
}

function logout() {
  localStorage.removeItem('currentUser');
  window.location.href = 'index.html';
}

function goBack() {
  window.location.href = 'dashboard.html';
}

// ==========================================
// EVENT LISTENERS
// ==========================================

// Real-time validation as user types
document.addEventListener('DOMContentLoaded', function() {
  loadProfile();
  
  // Add input event listeners for real-time validation
  document.getElementById('editFirstName').addEventListener('input', validateFirstName);
  document.getElementById('editLastName').addEventListener('input', validateLastName);
  document.getElementById('editEmail').addEventListener('input', validateEmail);
  
  // Close popup when clicking outside
  document.addEventListener('click', function(event) {
    const profilePopup = document.getElementById('profilePopup');
    const profileButton = document.querySelector('.navbar-profile');
    
    if (!profileButton.contains(event.target) && !profilePopup.contains(event.target)) {
      profilePopup.classList.add('hidden');
    }
  });
});

