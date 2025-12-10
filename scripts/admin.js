let users = [];

function loadUsers() {
    fetch('data/users.json')
        .then((response) => response.json())
        .then((data) => {
            users = data;
            populateUserTable();
        })
        .catch((error) => console.error('Error loading users:', error));
}

//Populate user table with the data
function populateUserTable() {
    const userTable = document.getElementById("userTable");
    userTable.innerHTML = "";

    users.forEach((user) => {
        const row = document.createElement("tr");

        row.innerHTML = `
      <td>${user.firstName}</td>
      <td>${user.lastName}</td>
      <td>${user.email}</td>
      <td>${user.department}</td>
      <td style="text-align: center;">
        <button class="btn btn-primary" onclick="editUser(${user.userId})">Edit</button>
        <button class="btn btn-danger" onclick="confirmDelete(${user.userId})">Delete</button>
      </td>
    `;
        userTable.appendChild(row);
    });
}

//Add User
document.getElementById("addNewUser").onclick = function () {
    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const email = document.getElementById("email").value;
    const department = document.getElementById("department").value;

    // Validate the inputs
    if (!firstName || !lastName || !email || !department) {
        alert("All fields are required.");
        return;
    }

    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailPattern.test(email)) {
        alert("Please enter a valid email address.");
        return;
    }

    document.getElementById("addFirstName").value = firstName;
    document.getElementById("addLastName").value = lastName;
    document.getElementById("addEmail").value = email;
    document.getElementById("addDepartment").value = department;

    $('#addUserModal').modal('show');
}

//Confirm add action
document.getElementById("confirmAddUserBtn").onclick = function () {
    const firstName = document.getElementById("addFirstName").value;
    const lastName = document.getElementById("addLastName").value;
    const email = document.getElementById("addEmail").value;
    const department = document.getElementById("addDepartment").value;

    // Validate the inputs
    if (!firstName || !lastName || !email || !department) {
        alert("All fields are required.");
        return;
    }

    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailPattern.test(email)) {
        alert("Please enter a valid email address.");
        return;
    }

    //Create a new user
    const newUser = {
        userId: users.length + 1,
        firstName,
        lastName,
        email,
        username: email.split('@')[0],
        department,
        isActive: true,
    };

    users.push(newUser);

    document.getElementById("addUserForm").reset();
    $('#addUserModal').modal('hide');

    populateUserTable();
    clearInputFields();
};

//Edit user
function editUser(userId) {
    const user = users.find((user) => user.userId === userId);
    if (user) {
        document.getElementById("modalFirstName").value = user.firstName;
        document.getElementById("modalLastName").value = user.lastName;
        document.getElementById("modalEmail").value = user.email;
        document.getElementById("modalDepartment").value = user.department;

        userToEdit = user;

        $('#editUserConfirmationModal').modal('show');
    }
}

//Confirm edit action 
document.getElementById("confirmEditUserBtn").onclick = function () {
    const firstName = document.getElementById("modalFirstName").value;
    const lastName = document.getElementById("modalLastName").value;
    const email = document.getElementById("modalEmail").value;
    const department = document.getElementById("modalDepartment").value;

    //Validate the inputs
    if (!firstName || !lastName || !email || !department) {
        alert("All fields are required.");
        return;
    }

    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailPattern.test(email)) {
        alert("Please enter a valid email address.");
        return;
    }

    userToEdit.firstName = firstName;
    userToEdit.lastName = lastName;
    userToEdit.email = email;
    userToEdit.department = department;

    populateUserTable();

    $('#editUserConfirmationModal').modal('hide');
};

//Delete action
function confirmDelete(userId) {
    userToDelete = userId;

    $('#deleteConfirmationModal').modal('show');
}

//Confirm delete action
function deleteUser() {
    const index = users.findIndex((user) => user.userId === userToDelete);
    if (index !== -1) {
        users.splice(index, 1);
        populateUserTable();
    }

    $('#deleteConfirmationModal').modal('hide');
}

function clearInputFields() {
    document.getElementById("firstName").value = "";
    document.getElementById("lastName").value = "";
    document.getElementById("email").value = "";
    document.getElementById("department").value = "";
}

document.addEventListener("DOMContentLoaded", loadUsers);