const createNcrMenu = document.getElementById("create-ncr-menu");

document.addEventListener("DOMContentLoaded", () => {
	const currentUser = JSON.parse(localStorage.getItem("currentUser")) || {};

	if (currentUser.department.toLowerCase() === "quality")
		createNcrMenu.style.display = "block";
	console.log(currentUser.department);
});
