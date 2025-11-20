let users = [];
let allRecords = [];

const loadUsers = fetch("data/users.json")
	.then((res) => {
		if (!res.ok) throw new Error("Failed to load users.json");
		return res.json();
	})
	.then((json) => {
		allRecords = JSON.parse(localStorage.getItem("ncr_records")) || [];
		users = json;
		console.log(users);
	})
	.catch((err) => console.error("Error loading user data:", err));

function findUser(id) {
	if (!Array.isArray(users)) return null;
	return users.find((u) => u.userId === id) || null;
}
// Populate the data into Inspector Section
document.addEventListener("DOMContentLoaded", async () => {
	await loadUsers;

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
	// const user = users && users.find((u) => u.userId === record.createdBy);
	const user = findUser(record.createdBy);

	//Header
	document.getElementById("ncr-number-display").textContent =
		record.ncrNumber || "";
	document.getElementById("created-by-display").textContent = user
		? `${user?.firstName} ${user?.lastName}`
		: "";
	document.getElementById("date-created-display").textContent =
		record.dateCreated
			? new Date(record.dateCreated).toISOString().split("T")[0]
			: "";
	document.getElementById("status-display").textContent = record.status || "";

	//Form

	document.getElementById("po_number").value = record.quality.poNumber || "";
	document.getElementById("sales_order").value =
		record.quality.salesOrderNumber || "";
	document.getElementById("supplier_name").value = record.supplierName || "";
	document.getElementById("item_description").value =
		record.quality.itemDescription || "";
	document.getElementById("qty_received").value =
		record.quality.quantityReceived || "";
	document.getElementById("qty_defective").value =
		record.quality.quantityDefective || "";
	document.getElementById("defect_description").value =
		record.quality.defectDescription || "";

	if (record.ncrType) {
		const processRadio = document.querySelector(
			`input[name="process_type"][value="${record.ncrType.trim()}"]`
		);
		if (processRadio) processRadio.checked = true;
	}
	// --------------------------------------------------------
	// Quality Assessment
	if (record.quality.itemMarkedNonconforming) {
		const isConforming = record.quality.itemMarkedNonconforming
			? "conforming"
			: "nonconforming";
		console.log(isConforming);

		const conformingRadio = document.querySelector(
			`input[name="item_status"][value="${isConforming.trim()}"]`
		);
		if (conformingRadio) conformingRadio.checked = true;
	}
	// Require Engineering
	if (record.quality.engineeringRequired)
		document.getElementById("engineering_required").checked = true;

	// --------------------------------------------------------
	// Engineering Form

	//Populate Updated On Date
	const todayDate = new Date();
	console.log(todayDate.toLocaleDateString());

	const engineer = findUser(record.engineering.engineerId);
	document.getElementById(
		"engineerId"
	).innerHTML = `${engineer.firstName} ${engineer.lastName}`;
	document.getElementById("date-updated-eng").innerHTML = record.engineering
		.dispositionDate
		? record.engineering.dispositionDate
		: todayDate.toLocaleDateString();
	document.getElementById("revision-number").innerHTML =
		record.engineering.originalRevNumber || "";
	document.getElementById("updated-revision-number").textContent =
		record.engineering.updatedRevNumber || "";

	if (record.engineering.dispositionType) {
		const dispositionRadio = document.querySelector(
			`input[name="log-type"][value="${record.engineering.dispositionType.trim()}"]`
		);
		if (dispositionRadio) dispositionRadio.checked = true;
	}

	if (record.engineering.notificationRequired !== null) {
		const val = record.engineering.notificationRequired ? "yes" : "no";

		const radio = document.querySelector(
			`input[name="ncr-notification"][value="${val}"]`
		);

		if (radio) radio.checked = true;
	}
	if (record.engineering.drawingUpdateRequired !== null) {
		const val = record.engineering.drawingUpdateRequired ? "yes" : "no";

		const radio = document.querySelector(
			`input[name="drawing-update"][value="${val}"]`
		);

		if (radio) radio.checked = true;
	}

	// --------------------------------------------------------
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
