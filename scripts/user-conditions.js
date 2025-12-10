const createNcrMenu = document.getElementById("create-ncr-menu");
const adminPanelMenu = document.getElementById("admin-panel");

document.addEventListener("DOMContentLoaded", () => {
	const currentUser = JSON.parse(localStorage.getItem("currentUser")) || {};

	adminPanelMenu.style.display = "none";
	createNcrMenu.style.display = "none";

	if (currentUser.department.toLowerCase() === "quality")
		createNcrMenu.style.display = "block";
	console.log(currentUser.department.toLowerCase());

	if (currentUser.department.toLowerCase() === "admin")
        adminPanelMenu.style.display = "block";
    console.log(currentUser.department.toLowerCase());

	//Section to be opened based on user department
	switch (currentUser.department.toLowerCase()) {
		case "quality":
			document.getElementById("rd1").checked = true;
			break;
		case "engineering":
			document.getElementById("rd2").checked = true;
			break;
		case "operations":
			document.getElementById("rd3").checked = true;
			break;
		case "purchasing":
			document.getElementById("rd4").checked = true;
			break;
		default:
			document.getElementById("rd1").checked = true;
	}

	//sections to be visible based on user department
	switch (currentUser.department.toLowerCase()) {
		case "quality":
			document.getElementById("engineering-dept").style.display = "none";
			document.getElementById("operations-dept").style.display = "none";
			document.getElementById("purchasing-dept").style.display = "none";
			break;
		case "engineering":
			document.getElementById("operations-dept").style.display = "none";
			document.getElementById("purchasing-dept").style.display = "none";
			break;
		case "operations":
			document.getElementById("purchasing-dept").style.display = "none";
			break;

		default:
			break;
	}
});
