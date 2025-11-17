const menuIcon = document.getElementById("menu-icon");
menuIcon.className = "bi bi-list";
document.getElementById("rd2").checked = true;

// let url = "./data/data.json";
// let ncrLogs = [];
// let currentPage = 1;
// const rowsPerPage = 5;
// let sortColumn = null;
// let sortAsc = true;
// let searchQuery = "";
// let statusFilter = "All";

// $.getJSON(url, function (ncrLogsData) {
// 	ncrLogs = ncrLogsData;
// 	populateTable(ncrLogs);
// 	renderTable();
// 	renderPagination();
// });

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

// Populate the data into Inpector Section
document.addEventListener("DOMContentLoaded", () => {
	const allRecords = JSON.parse(localStorage.getItem("ncr_records")) || [];

	// document.getElementById("total-ncr-summary").textContent = allRecords.length;
	// document.getElementById("active-ncr").textContent = allRecords.filter((r) => r.ncrNumber = "2025-001").length;
	const selectedNCR = localStorage.getItem("selectedNCR");

	// First checking if there is a selected ncr number and if we have all mock data in the localStorage
	if (!selectedNCR || allRecords.length === 0) {
		console.log("No NCR data found.");
		return;
	}
	//Then finding the ncrNumber in the list of data and save it as a record
	const record = allRecords.find((r) => r.ncrNumber === selectedNCR);
	if (!record) {
		alert(`No record found for ${selectedNCR.toUpperCase()}`);
		return;
	}

	console.log(record);
	// If the records are found then populate the data
	//Header
	document.getElementById("ncr-number-display").textContent =
		record.ncrNumber || "";
	document.getElementById("ncr-number-displayy").textContent =
		record.ncrNumber || "";
	document.getElementById("created-by-display").textContent =
		record.createdBy || "";
	document.getElementById("date-created-display").textContent =
		record.dateCreated
			? new Date(record.dateCreated).toISOString().split("T")[0]
			: "";
	document.getElementById("status-display").textContent = record.status || "";

	//Form

	document.getElementById("po_number").value = record.poNumber || "";
	document.getElementById("sales_order").value = record.salesOrderNumber || "";
	document.getElementById("supplier_name").value = record.supplierName || "";
	document.getElementById("item_description").value =
		record.itemDescription || "";
	document.getElementById("qty_received").value = record.quantityReceived || "";
	document.getElementById("qty_defective").value =
		record.quantityDefective || "";
	document.getElementById("defect_description").value =
		record.defectDescription || "";

	if (record.processType) {
		const processRadio = document.querySelector(
			`input[name="process_type"][value="${record.processType}"]`
		);
		if (processRadio) processRadio.checked = true;
	}

	// Engineering Form

	//Populate Updated On Date
	const todayDate = new Date();
	console.log(todayDate.toLocaleDateString());

	document.getElementById("date-updated-eng").innerHTML =
		todayDate.toLocaleDateString();
});

// Customer require notification NCR
const yesBtn = document.getElementById("yes-notification");
const noBtn = document.getElementById("no-notification");
document.getElementById("showMessageBox").style.display = "none";

yesBtn.addEventListener("change", () => {
	if (yesBtn.checked) {
		document.getElementById("showMessageBox").style.display = "block";
	}
});
noBtn.addEventListener("change", () => {
	if (noBtn.checked) {
		document.getElementById("showMessageBox").style.display = "none";
	}
});

// Disposition Sequence if Repair or Rework
const logType = document.querySelectorAll('input[name="log-type"]');
const dispositionMessage = document.getElementById("disposition-message");

const showDisposition = () => {
	const selected = document.querySelector('input[name="log-type"]:checked');
	console.log(selected.id);

	const shouldShow =
		selected && (selected.id === "repair" || selected.id === "rework");

	dispositionMessage.style.display = shouldShow ? "block" : "none";
};

dispositionMessage.style.display = "none";
logType.forEach((r) => r.addEventListener("change", showDisposition));

