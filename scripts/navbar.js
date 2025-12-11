/**
 * Shared Navbar Functionality
 * Used across all pages with navbar
 */

// ==========================================
// PROFILE DROPDOWN TOGGLE
// ==========================================

function toggleProfileMenu() {
  const popup = document.getElementById('profilePopup');
  const notificationPopup = document.getElementById('notificationPopup');
  
  // Close notifications if open
  if (notificationPopup) {
    notificationPopup.classList.add('hidden');
  }
  
  // Toggle profile dropdown
  popup.classList.toggle('hidden');
}

// ==========================================
// CLOSE DROPDOWNS WHEN CLICKING OUTSIDE
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
  // Close dropdowns when clicking outside
  document.addEventListener('click', function(event) {
    const profilePopup = document.getElementById('profilePopup');
    const profileButton = document.querySelector('.navbar-profile');
    const notificationPopup = document.getElementById('notificationPopup');
    const notificationButton = document.querySelector('.navbar-notification');
    
    // Close profile popup if clicking outside
    if (profileButton && profilePopup) {
      if (!profileButton.contains(event.target) && !profilePopup.contains(event.target)) {
        profilePopup.classList.add('hidden');
      }
    }
    
    // Close notification popup if clicking outside
    if (notificationButton && notificationPopup) {
      if (!notificationButton.contains(event.target) && !notificationPopup.contains(event.target)) {
        notificationPopup.classList.add('hidden');
      }
    }
  });
});

// ==========================================
// LOGOUT FUNCTION
// ==========================================

function logout() {
  localStorage.removeItem('currentUser');
  window.location.href = 'index.html';
}

// ==========================================
// LOAD USER INFO IN NAVBAR
// ==========================================

function loadNavbarUserInfo() {
  // Check if UserManager exists first
  if (typeof UserManager === 'undefined') {
    console.warn('UserManager not loaded yet');
    return;
  }
  
  const currentUser = UserManager.getCurrentUser();
  
  if (!currentUser) {
    return;
  }
  
  // Update navbar user info
  const userNameElement = document.getElementById('userName');
  const profileNameElement = document.getElementById('profileName');
  const profileDepartmentElement = document.getElementById('profileDepartment');
  
  if (userNameElement) {
    userNameElement.textContent = currentUser.firstName;
  }
  
  if (profileNameElement) {
    profileNameElement.textContent = `${currentUser.firstName} ${currentUser.lastName}`;
  }
  
  if (profileDepartmentElement) {
    profileDepartmentElement.textContent = currentUser.department;
  }
}

// Auto-load user info when page loads
document.addEventListener('DOMContentLoaded', function() {
  loadNavbarUserInfo();
});