let users = [];
let allRecords = [];
let currentUser = {};

const loadUsers = fetch("data/users.json")
	.then((res) => {
		if (!res.ok) throw new Error("Failed to load users.json");
		return res.json();
	})
	.then((json) => {
		allRecords = JSON.parse(localStorage.getItem("ncr_records")) || [];
		currentUser = JSON.parse(localStorage.getItem("currentUser")) || {};
		users = json;
		console.log(users);
	})
	.catch((err) => console.error("Error loading user data:", err));

function findUser(id) {
	if (!Array.isArray(users)) return null;
	return users.find((u) => u.userId === Number(id)) || null;
}
// Populate the data into Inspector Section
document.addEventListener("DOMContentLoaded", async () => {
	await loadUsers;

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

	if (!record.engineering.engineerId) {
		if (users.length > 0) {
			const selectedEngineer = users[0];

			record.engineering.engineerId = selectedEngineer.userId;

			localStorage.setItem("ncr_records", JSON.stringify(allRecords));
		}
	}

	const engineer = findUser(record.engineering.engineerId);
	document.getElementById(
		"engineerId"
	).innerHTML = `${engineer.firstName} ${engineer.lastName}`;
	document.getElementById("date-updated-eng").innerHTML = record.engineering
		.dispositionDate
		? record.engineering.dispositionDate
		: todayDate.toLocaleDateString();
	document.getElementById("revision-number").innerHTML =
		`#${record.engineering.originalRevNumber}` || "#";
	document.getElementById("updated-revision-number").textContent =
		`#${record.engineering.updatedRevNumber}` || "#";

	document.getElementById("revision-input").value =
		record.engineering.originalRevNumber || "";
	document.getElementById("updated-revision-input").value =
		record.engineering.updatedRevNumber || "";

	if (record.engineering.dispositionType) {
		const dispositionRadio = document.querySelector(
			`input[name="log-type"][value="${record.engineering.dispositionType.trim()}"]`
		);
		if (dispositionRadio) dispositionRadio.checked = true;
	}
	if (
		record.engineering.dispositionType === "Repair" ||
		record.engineering.dispositionType === "Rework"
	) {
		document.getElementById("disposition-message").style.display = "block";
		document.getElementById("disposition_description").value =
			record.engineering.dispositionDetails;
	}

	if (record.engineering.notificationRequired !== null) {
		const val = record.engineering.notificationRequired ? "yes" : "no";

		const radio = document.querySelector(
			`input[name="ncr-notification"][value="${val}"]`
		);

		if (radio) radio.checked = true;

		if (val === "yes") {
			document.getElementById("showMessageBox").style.display = "block";
			document.getElementById("engineer-message").value =
				record.engineering.engineerNote;
		}
	}
	if (record.engineering.drawingUpdateRequired !== null) {
		const val = record.engineering.drawingUpdateRequired ? "yes" : "no";

		const radio = document.querySelector(
			`input[name="drawing-update"][value="${val}"]`
		);

		if (radio) radio.checked = true;
	}

	// --------------------------------------------------------
	//populate operations
	const operationManager = findUser(record.operations.operationsManagerId);
	document.getElementById(
		"operationsManagerName"
	).innerHTML = `${operationManager.firstName} ${operationManager.lastName}`;
	document.getElementById("date-updated-ops").innerHTML =
		record.operations.completedAt;

	if (record.operations.operationDecision) {
		const decisionRadio = document.querySelector(
			`input[name="ops-decision"][value="${record.operations.operationDecision.trim()}"]`
		);
		if (decisionRadio) decisionRadio.checked = true;
	}

	if (record.operations.carRequired !== null) {
		const val = record.operations.carRequired ? "yes" : "no";

		const radio = document.querySelector(
			`input[name="car-required"][value="${val}"]`
		);

		if (radio) radio.checked = true;

		if (val === "yes") {
			document.getElementById("car-number-field").style.display = "block";
			document.getElementById("car-number").value = record.operations.carNumber;
		}
	}
	if (record.operations.followUpRequired !== null) {
		const val = record.operations.followUpRequired ? "yes" : "no";

		const radio = document.querySelector(
			`input[name="followup-required"][value="${val}"]`
		);

		if (radio) radio.checked = true;

		if (val === "yes") {
			document.getElementById("followup-details-field").style.display = "block";
			document.getElementById("followup-type").value =
				record.operations.followUpType;
			document.getElementById("followup-date").value =
				record.operations.followUpDate;
		}
	}
	if (record.operations.reInspected !== null) {
		const val = record.operations.reInspected ? "yes" : "no";

		const radio = document.querySelector(
			`input[name="reinspection"][value="${val}"]`
		);

		if (radio) radio.checked = true;
	}

	if (record.operations.actionDate !== null) {
		document.getElementById("ops-date").value = record.operations.actionDate;
	}

	//Populate purchasing
	const procurementOfficer = findUser(record.procurement.procurementOfficer);
	document.getElementById("procurementOfficer").textContent = procurementOfficer
		? `${procurementOfficer.firstName} ${procurementOfficer.lastName}`
		: "-";
	document.getElementById("date-updated-proc").textContent =
		record.procurement.completedAt || "-";

	if (record.procurement.supplierReturn !== null) {
		const val = record.procurement.supplierReturn ? "yes" : "no";

		const radio = document.querySelector(
			`input[name="supplier-return"][value="${val}"]`
		);

		if (radio) radio.checked = true;

		if (val === "yes") {
			document.getElementById("return-details-field").style.display = "block";
			document.getElementById("dispose-field").style.display = "none";

			document.getElementById("rma-number").value =
				record.procurement.rmaNumber || "";
			document.getElementById("carrier-info").value =
				record.procurement.carrierAccount || "";
		} else {
			document.getElementById("dispose-field").style.display = "block";
			document.getElementById("return-details-field").style.display = "none";

			document.getElementById("dispose-onsite").checked =
				record.procurement.disposeOnSite || false;
		}
	}
	// Replacement Date
	if (record.procurement.replacementDate) {
		document.getElementById("replacement-date").value =
			record.procurement.replacementDate;
	}
	document.getElementById("sap-completed").checked =
		record.procurement.sapCompleted || false;
	document.getElementById("credit-expected").checked =
		record.procurement.creditExpected || false;
	document.getElementById("billing-supplier").checked =
		record.procurement.billingSupplier || false;
	if (record.procurement.completedAt) {
		document.getElementById("procurement-date").value =
			record.procurement.completedAt;
	}
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
const dispositionDetails = document.getElementById("disposition-message");

const showDisposition = () => {
	const selected = document.querySelector('input[name="log-type"]:checked');
	console.log(selected.id);

	const shouldShow =
		selected && (selected.id === "repair" || selected.id === "rework");

	dispositionDetails.style.display = shouldShow ? "block" : "none";
};

dispositionDetails.style.display = "none";
logType.forEach((r) => r.addEventListener("change", showDisposition));

//Update Engineering Form
document
	.getElementById("submitEngineerForm")
	.addEventListener("click", function (e) {
		e.preventDefault();

		const selectedNCR = localStorage.getItem("selectedNCR");
		let allRecords = JSON.parse(localStorage.getItem("ncr_records")) || [];

		let record = allRecords.find((r) => r.ncrNumber === selectedNCR);
		if (!record) return alert("NCR not found");

		// get the new values
		const dispositionType =
			document.querySelector('input[name="log-type"]:checked')?.value || "";
		const requiresNotification =
			document.querySelector('input[name="ncr-notification"]:checked')
				?.value === "yes";
		const drawingUpdate =
			document.querySelector('input[name="drawing-update"]:checked')?.value ===
			"yes";
		const dispositionDetails = document.getElementById(
			"disposition_description"
		).value;
		const engineerMessage = document.getElementById("engineer-message").value;

		const originalRev = document.getElementById("revision-input").value.trim();
		const updatedRev = document
			.getElementById("updated-revision-input")
			.value.trim();

		const today = new Date().toISOString().split("T")[0];

		// update json data
		record.engineering.dispositionType = dispositionType;
		record.engineering.notificationRequired = requiresNotification;
		record.engineering.drawingUpdateRequired = drawingUpdate;
		record.engineering.dispositionDetails = dispositionDetails;
		record.engineering.engineerNote = engineerMessage;
		record.engineering.dispositionDate = today;
		record.engineering.originalRevNumber = originalRev;
		record.engineering.updatedRevNumber = updatedRev;

		// Save to localStorage
		localStorage.setItem("ncr_records", JSON.stringify(allRecords));

		addNotification(record.ncrNumber, "update");

		alert("NCR updated successfully");
		window.location.href = "edit-ncr.html";
	});

// Add to edit-ncr-script.js

// === OPERATIONS ===

//Car number
const carYes = document.getElementById("car-yes");
const carNo = document.getElementById("car-no");
const carNumberField = document.getElementById("car-number-field");

carYes.addEventListener("change", () => {
	if (carYes.checked) {
		carNumberField.style.display = "block";
	}
});
carNo.addEventListener("change", () => {
	if (carNo.checked) {
		carNumberField.style.display = "none";
	}
});

// Follow-up Details
const followYes = document.getElementById("followup-yes");
const followNo = document.getElementById("followup-no");
const followupDetails = document.getElementById("followup-details-field");

followYes.addEventListener("change", () => {
	if (followYes.checked) {
		followupDetails.style.display = "block";
	}
});

followNo.addEventListener("change", () => {
	if (followNo.checked) {
		followupDetails.style.display = "none";
	}
});
//Update Operations Form
document
	.getElementById("submitOperationsForm")
	.addEventListener("click", function (e) {
		e.preventDefault();

		const selectedNCR = localStorage.getItem("selectedNCR");
		let allRecords = JSON.parse(localStorage.getItem("ncr_records")) || [];

		let record = allRecords.find((r) => r.ncrNumber === selectedNCR);
		if (!record) return alert("NCR not found");

		// get the new values
		const operationDecision =
			document.querySelector('input[name="ops-decision"]:checked')?.value || "";
		const carRequired =
			document.querySelector('input[name="car-required"]:checked')?.value ===
			"yes";
		const carNumber = document.getElementById("car-number").value.trim();
		const followUpRequired =
			document.querySelector('input[name="followup-required"]:checked')
				?.value === "yes";
		const followupType = document.getElementById("followup-type").value.trim();
		const followupDate = document.getElementById("followup-date").value;
		const reInspected =
			document.querySelector('input[name="reinspection"]:checked')?.value ===
			"yes";
		const actionDate = document.getElementById("ops-date").value;

		const today = new Date().toISOString().split("T")[0];

		// update json data
		record.operations.operationDecision = operationDecision;
		record.operations.carRequired = carRequired;
		record.operations.carNumber = carNumber;

		record.operations.followUpRequired = followUpRequired;
		record.operations.followUpType = followupType;
		record.operations.followUpDate = followupDate;

		record.operations.reInspected = reInspected;
		record.operations.actionDate = actionDate;

		record.operations.completedAt = today;
		record.operations.operationsManagerId = currentUser.userId;

		// Save to localStorage
		localStorage.setItem("ncr_records", JSON.stringify(allRecords));

		addNotification(record.ncrNumber, "update");

		alert("NCR updated successfully");
		window.location.href = "edit-ncr.html";
	});

// === PROCUREMENT CONDITIONAL LOGIC ===

// Show/hide return details or dispose field
const returnYes = document.getElementById("return-yes");
const returnNo = document.getElementById("return-no");
const returnDetailsField = document.getElementById("return-details-field");
const disposeField = document.getElementById("dispose-field");

returnYes.addEventListener("change", () => {
	if (returnYes.checked) {
		returnDetailsField.style.display = "block";
		disposeField.style.display = "none";
	}
});

returnNo.addEventListener("change", () => {
	if (returnNo.checked) {
		returnDetailsField.style.display = "none";
		disposeField.style.display = "block";
	}
});

// --------------------------------------------------------
// UPDATE PURCHASING FORM
document
	.getElementById("submitProcurementForm")
	.addEventListener("click", function (e) {
		e.preventDefault();

		const selectedNCR = localStorage.getItem("selectedNCR");
		let allRecords = JSON.parse(localStorage.getItem("ncr_records")) || [];

		let record = allRecords.find((r) => r.ncrNumber === selectedNCR);
		if (!record) return alert("NCR not found");

		// get data from form
		const supplierReturn =
			document.querySelector('input[name="supplier-return"]:checked')?.value ===
			"yes";

		const rmaNumber = document.getElementById("rma-number").value.trim();
		const carrierInfo = document.getElementById("carrier-info").value.trim();

		const disposeOnsite =
			document.getElementById("dispose-onsite").checked || false;

		const replacementDate =
			document.getElementById("replacement-date").value || "";

		const sapCompleted =
			document.getElementById("sap-completed").checked || false;

		const creditExpected =
			document.getElementById("credit-expected").checked || false;

		const billingSupplier =
			document.getElementById("billing-supplier").checked || false;

		const procurementDate =
			document.getElementById("procurement-date").value || "";

		// update new data
		record.procurement.supplierReturn = supplierReturn;
		record.procurement.rmaNumber = supplierReturn ? rmaNumber : null;
		record.procurement.carrierAccount = supplierReturn ? carrierInfo : null;

		record.procurement.disposeOnSite = !supplierReturn ? disposeOnsite : false;

		record.procurement.replacementDate = replacementDate;
		record.procurement.sapCompleted = sapCompleted;
		record.procurement.creditExpected = creditExpected;
		record.procurement.billingSupplier = billingSupplier;

		record.procurement.completedAt = procurementDate;
		record.procurement.procurementOfficer = currentUser.userId;

		//close ncr
		record.status = "Closed";
		record.dateClosed = new Date().toISOString();
		record.closedBy = currentUser.userId;

		// save data
		localStorage.setItem("ncr_records", JSON.stringify(allRecords));

		addNotification(record.ncrNumber, "closed");

		alert("Purchasing data saved and NCR completed.");
		window.location.href = "view-ncr.html";
	});
