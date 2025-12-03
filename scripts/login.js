addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('.login-form');
    const usersSelect = document.getElementById('users');
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const selectedUser = usersSelect.value;
        alert(`Logged in as ${selectedUser}`);
        document.location.href="dashboard.html";
    });
});