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

//Function to display ncr logs on table with pagination
// function renderTable() {
// 	const data = getFilteredData();
// 	let rows = "";

// 	// To sort the data
// 	if (sortColumn !== null) {
// 		const keys = ["ncrNumber", "status", "dateCreated", "createdBy"];
// 		data.sort((a, b) => {
// 			const valA = a[keys[sortColumn]]
// 				? a[keys[sortColumn]].toString().toLowerCase()
// 				: "";
// 			const valB = b[keys[sortColumn]]
// 				? b[keys[sortColumn]].toString().toLowerCase()
// 				: "";
// 			if (valA < valB) return sortAsc ? -1 : 1;
// 			if (valA > valB) return sortAsc ? 1 : -1;
// 			return 0;
// 		});
// 	}
// 	// Adding pagination to the table data
// 	const start = (currentPage - 1) * rowsPerPage;
// 	const end = start + rowsPerPage;
// 	const pageData = data.slice(start, end);

// 	// Build rows
// 	$.each(pageData, function (_, log) {
// 		rows += `
//       <tr>
//         <td>${log.ncrNumber}</td>
//         <td><span class="status ${log.status.toLowerCase()}">${
// 			log.status
// 		}</span></td>
//         <td>${log.dateCreated}</td>
//         <td>${log.createdBy}</td>
//         <td><a href="edit-ncr.html?ncr=${log.ncrNumber}">View/Edit</a></td>
//       </tr>`;
// 	});

// 	$("#ncr-log-table-home").html(rows);
// 	renderPagination();
// }
// Function to filter in all NCR page
// function getFilteredData() {
// 	return ncrLogs.filter((log) => {
// 		const matchesSearch =
// 			log.ncrNumber.toLowerCase().includes(searchQuery) ||
// 			log.supplierName.toLowerCase().includes(searchQuery) ||
// 			log.createdBy.toLowerCase().includes(searchQuery);

// 		const matchesStatus =
// 			statusFilter === "All" ||
// 			log.status.toLowerCase() === statusFilter.toLowerCase();

// 		return matchesSearch && matchesStatus;
// 	});
// }

// Populate all log data
// function populateTable(logs) {
// 	let rowsHome = "";
// 	let rows = "";

// 	$.each(logs.slice(0, 10), function (_, log) {
// 		rowsHome += `
//       <tr>
//         <td>${log.ncrNumber}</td>
//         <td><span class="status ${log.status.toLowerCase()}">${
// 			log.status
// 		}</span></td>
//         <td>${log.dateCreated}</td>
//         <td>${log.createdBy}</td>
//         <td><a href="edit-ncr.html?ncr=${log.ncrNumber}">View/Edit</a></td>
//       </tr>
//     `;
// 	});
// 	$.each(logs, function (_, log) {
// 		rows += `
//       <tr>
//         <td>${log.ncrNumber}</td>
//         <td>${log.createdOn}</td>
//         <td>${log.supplier}</td>
//         <td><span class="status ${log.status.toLowerCase()}">${
// 			log.status
// 		}</span></td>
//         <td><a href="edit-ncr.html?ncr=${log.ncrNumber}">View/Edit</a></td>
//       </tr>
//     `;
// 	});

// 	$("#ncr-log-table-home").html(rowsHome);
// 	$("#ncr-logs-table").html(rows);
// }

function selectedLog(ncrNumber) {
	localStorage.setItem("selectedNCR", ncrNumber);
}

// Populate the data into Inpector Section
document.addEventListener("DOMContentLoaded", () => {
	const allRecords = JSON.parse(localStorage.getItem("ncr_records")) || [];
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

	document.getElementById("date-updated-eng").innerHTML = todayDate.toLocaleDateString();

});

const yesBtn = document.getElementById("yes-notification");
const noBtn = document.getElementById("no-notification");
document.getElementById("showMessageBox").style.display = "none";

yesBtn.addEventListener("change", () => {
	if(yesBtn.checked){
		document.getElementById("showMessageBox").style.display = "block"
	}
	
});
noBtn.addEventListener("change", () => {
	if(noBtn.checked){
		document.getElementById("showMessageBox").style.display = "none"
	}
	
});


