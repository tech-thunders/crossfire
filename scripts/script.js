const menuIcon = document.getElementById("menu-icon");
const popup = document.getElementById("notificationPopup");
popup.classList.add("hidden");
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

// Notification popup
function closePopUp(){
	popup.classList.toggle("hidden");
}


function selectedLog(ncrNumber) {
	localStorage.setItem("selectedNCR", ncrNumber);
}

