const menuIcon = document.getElementById("menu-icon");
menuIcon.className = "bi bi-list";
document.getElementById("rd2").checked = true;

function toggleMenu() {
	const navLinks = document.querySelector(".navbar-links");
	if (navLinks.style.display === "" || navLinks.style.display === "none") {
		navLinks.style.display = "grid";
		menuIcon.className = "bi bi-x";
	} else {
		navLinks.style.display = "none";
		menuIcon.className = "bi bi-list";
	}
}

function selectedLog(ncrNumber) {
	localStorage.setItem("selectedNCR", ncrNumber);
}

