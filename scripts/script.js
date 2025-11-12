const menuIcon = document.getElementById("menu-icon");
menuIcon.className = "bi bi-list";

let url = "./data/data.json";
let ncrLogs = [];

$.getJSON(url, function (ncrLogsData) {
	ncrLogs = ncrLogsData;
	console.log("Loaded JSON:", ncrLogs);
	populateTable(ncrLogs);
}).fail(function (jqxhr, textStatus, error) {
	console.error("Error loading JSON:", textStatus, error);
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
