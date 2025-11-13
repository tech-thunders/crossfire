const menuIcon = document.getElementById("menu-icon");
menuIcon.className = "bi bi-list";
document.getElementById("rd1").checked = true;

let url = "./data/data.json";
let ncrLogs = [];
let currentPage = 1;
const rowsPerPage = 5;
let sortColumn = null;
let sortAsc = true;
let searchQuery = "";
let statusFilter = "All";

$.getJSON(url, function (ncrLogsData) {
	ncrLogs = ncrLogsData;
	populateTable(ncrLogs);
	renderTable();
	renderPagination();
});

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
function renderTable() {
	const data = getFilteredData();
	let rows = "";

	// To sort the data
	if (sortColumn !== null) {
		const keys = ["ncrNumber", "status", "dateCreated", "createdBy"];
		data.sort((a, b) => {
			const valA = a[keys[sortColumn]]
				? a[keys[sortColumn]].toString().toLowerCase()
				: "";
			const valB = b[keys[sortColumn]]
				? b[keys[sortColumn]].toString().toLowerCase()
				: "";
			if (valA < valB) return sortAsc ? -1 : 1;
			if (valA > valB) return sortAsc ? 1 : -1;
			return 0;
		});
	}
	// Adding pagination to the table data
	const start = (currentPage - 1) * rowsPerPage;
	const end = start + rowsPerPage;
	const pageData = data.slice(start, end);

	// Build rows
	$.each(pageData, function (_, log) {
		rows += `
      <tr>
        <td>${log.ncrNumber}</td>
        <td><span class="status ${log.status.toLowerCase()}">${
			log.status
		}</span></td>
        <td>${log.dateCreated}</td>
        <td>${log.createdBy}</td>
        <td><a href="edit-ncr.html?ncr=${log.ncrNumber}">View/Edit</a></td>
      </tr>`;
	});

	$("#ncr-log-table-home").html(rows);
	renderPagination();
}
// Function to filter in all NCR page
function getFilteredData() {
	return ncrLogs.filter((log) => {
		const matchesSearch =
			log.ncrNumber.toLowerCase().includes(searchQuery) ||
			log.supplierName.toLowerCase().includes(searchQuery) ||
			log.createdBy.toLowerCase().includes(searchQuery);

		const matchesStatus =
			statusFilter === "All" ||
			log.status.toLowerCase() === statusFilter.toLowerCase();

		return matchesSearch && matchesStatus;
	});
}

// Populate all log data
function populateTable(logs) {
	let rowsHome = "";
	let rows = "";

	$.each(logs.slice(0, 10), function (_, log) {
		rowsHome += `
      <tr>
        <td>${log.ncrNumber}</td>
        <td><span class="status ${log.status.toLowerCase()}">${
			log.status
		}</span></td>
        <td>${log.dateCreated}</td>
        <td>${log.createdBy}</td>
        <td><a href="edit-ncr.html?ncr=${log.ncrNumber}">View/Edit</a></td>
      </tr>
    `;
	});
	$.each(logs, function (_, log) {
		rows += `
      <tr>
        <td>${log.ncrNumber}</td>
        <td>${log.createdOn}</td>
        <td>${log.supplier}</td>
        <td><span class="status ${log.status.toLowerCase()}">${
			log.status
		}</span></td>
        <td><a href="edit-ncr.html?ncr=${log.ncrNumber}">View/Edit</a></td>
      </tr>
    `;
	});

	$("#ncr-log-table-home").html(rowsHome);
	$("#ncr-logs-table").html(rows);
}
