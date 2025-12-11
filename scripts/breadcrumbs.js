// Breadcrumbs Manager
// Dynamically updates breadcrumb navigation with context-specific information

/**
 * Updates the breadcrumb with the current NCR number from localStorage
 */
function updateBreadcrumb() {
  const selectedNCR = localStorage.getItem("selectedNCR");
  const breadcrumbCurrent = document.getElementById('breadcrumb-current');
  
  if (selectedNCR && breadcrumbCurrent) {
    breadcrumbCurrent.textContent = `NCR #${selectedNCR}`;
  } else if (breadcrumbCurrent && !selectedNCR) {
    // Fallback if no NCR is selected
    breadcrumbCurrent.textContent = 'Edit NCR';
  }
}

// Initialize breadcrumb on page load
document.addEventListener('DOMContentLoaded', () => {
  updateBreadcrumb();
});