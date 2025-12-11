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
function applyRoleBasedAccess() {
	if (!currentUser || !currentUser.department) return;

	const department = currentUser.department.toLowerCase();

	const sections = {
		quality: "quality-dept",
		engineering: "engineering-dept",
		operations: "operations-dept",
		purchasing: "purchasing-dept",
	};

	for (const id of Object.values(sections)) {
		document.getElementById(id).style.display = "none";
	}

	switch (department) {
		case "quality":
			document.getElementById("quality-dept").style.display = "block";
			break;
		case "engineering":
			document.getElementById("quality-dept").style.display = "block";
			document.getElementById("engineering-dept").style.display = "block";
			break;
		case "operations":
			document.getElementById("quality-dept").style.display = "block";
			document.getElementById("engineering-dept").style.display = "block";
			document.getElementById("operations-dept").style.display = "block";
			break;
		case "purchasing":
		case "admin":
			document.getElementById("quality-dept").style.display = "block";
			document.getElementById("engineering-dept").style.display = "block";
			document.getElementById("operations-dept").style.display = "block";
			document.getElementById("purchasing-dept").style.display = "block";
			break;
		default:
			document.getElementById("quality-dept").style.display = "block";
	}

	for (const [dept, id] of Object.entries(sections)) {
		const section = document.getElementById(id);
		const inputs = section.querySelectorAll("input, textarea, select, button");
		const isEditable = department === dept || department === "admin";
		inputs.forEach((input) => {
			if (input.type !== "checkbox") {
				input.disabled = !isEditable;
			}
		});
	}
}
// Populate the data into Quality Section
document.addEventListener("DOMContentLoaded", async () => {
	await loadUsers;

	const selectedNCR = localStorage.getItem("selectedNCR");

	if (!selectedNCR || allRecords.length === 0) {
		console.log("No NCR data found.");
		return;
	}
	const record = allRecords.find((r) => r.ncrNumber === selectedNCR);
	if (!record) {
		alert(`No record found for ${selectedNCR.toUpperCase()}`);
		return;
	}

	console.log(record);
	const user = findUser(record.createdBy);

	// Role-based control
	applyRoleBasedAccess();

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
// --------------------------------------------------------
// SUBMIT QUALITY FORM
function getQualityFormValues() {
	return {
		poNumber: document.getElementById("po_number").value.trim(),
		salesOrder: document.getElementById("sales_order").value.trim(),
		supplierName: document.getElementById("supplier_name").value.trim(),
		itemDescription: document.getElementById("item_description").value.trim(),
		processType:
			document.querySelector('input[name="process_type"]:checked')?.value || "",
		qtyReceived: document.getElementById("qty_received").value,
		qtyDefective: document.getElementById("qty_defective").value,
		defectDescription: document
			.getElementById("defect_description")
			.value.trim(),
		itemStatus:
			document.querySelector('input[name="item_status"]:checked')?.value || "",
		engineeringRequired: document.getElementById("engineering_required").checked
			? "Yes"
			: "No",
	};
}

function populateNCRInfoPreview() {
	const selectedNCR = localStorage.getItem("selectedNCR");
	const record = allRecords.find((r) => r.ncrNumber === selectedNCR);
	if (!record) return;

	const user = findUser(record.createdBy);
	document.getElementById("preview-ncr-number").textContent =
		record.ncrNumber || "-";
	document.getElementById("preview-date").textContent = record.dateCreated
		? new Date(record.dateCreated).toISOString().split("T")[0]
		: "-";
	document.getElementById("preview-user").textContent = user
		? `${user.firstName} ${user.lastName}`
		: "-";
	document.getElementById("preview-status").textContent =
		record.status || "Draft";
}

function populateQualityPreview(values) {
	document.getElementById("preview-po").textContent = values.poNumber;
	document.getElementById("preview-so").textContent = values.salesOrder;
	document.getElementById("preview-supplier").textContent = values.supplierName;
	document.getElementById("preview-item").textContent = values.itemDescription;
	document.getElementById("preview-process").textContent =
		values.processType === "supplier"
			? "Supplier / Receiving Inspection"
			: "WIP (Production Order)";

	document.getElementById("preview-qty-received").textContent =
		values.qtyReceived;
	document.getElementById("preview-qty-defective").textContent =
		values.qtyDefective;
	document.getElementById("preview-defect").textContent =
		values.defectDescription;

	document.getElementById("preview-item-status").textContent =
		values.itemStatus === "conforming" ? "Conforming" : "Non-Conforming";

	document.getElementById("preview-engineering").textContent =
		values.engineeringRequired;
}

document.getElementById("submitForm").addEventListener("click", function (e) {
	e.preventDefault();

	if (!validateQualityForm()) return;

	const values = getQualityFormValues();
	const content = buildQualityPreviewContent(values);
	PreviewModal.populateContent(content);
	document.getElementById("modal-confirm-btn").innerHTML =
		'<i class="bi bi-check-circle"></i> Publish';
	PreviewModal.open();

	PreviewModal.setConfirmAction(() => {
		saveQualityToLocalStorage(values);
		PreviewModal.close();
		alert("Saved and sent to engineer");
		location.reload();
	});
});

function saveQualityToLocalStorage(values) {
	const selectedNCR = localStorage.getItem("selectedNCR");
	let allRecords = JSON.parse(localStorage.getItem("ncr_records")) || [];
	let record = allRecords.find((r) => r.ncrNumber === selectedNCR);

	if (!record) return;

	record.quality.poNumber = values.poNumber;
	record.quality.salesOrderNumber = values.salesOrder;
	record.supplierName = values.supplierName;
	record.quality.itemDescription = values.itemDescription;
	record.ncrType = values.processType;
	record.quality.quantityReceived = values.qtyReceived;
	record.quality.quantityDefective = values.qtyDefective;
	record.quality.defectDescription = values.defectDescription;
	record.quality.itemMarkedNonconforming =
		values.itemStatus === "nonconforming";
	record.quality.engineeringRequired = values.engineeringRequired === "Yes";

	// Update status to indicate sent to engineer
	record.currentStage = "Engineering";

	localStorage.setItem("ncr_records", JSON.stringify(allRecords));
}

function validateEngineeringForm() {
	let isValid = true;
	const errors = [];

	const dispositionType = document.querySelector(
		'input[name="log-type"]:checked'
	);
	if (!dispositionType) {
		document
			.querySelectorAll('input[name="log-type"]')
			.forEach((radio) => radio.classList.add("error"));
		errors.push("Disposition Type is required");
		isValid = false;
	} else {
		document
			.querySelectorAll('input[name="log-type"]')
			.forEach((radio) => radio.classList.remove("error"));
	}

	const originalRev = document.getElementById("revision-input").value.trim();
	if (!originalRev) {
		document.getElementById("revision-input").classList.add("error");
		errors.push("Original Revision is required");
		isValid = false;
	} else {
		document.getElementById("revision-input").classList.remove("error");
	}

	const updatedRev = document
		.getElementById("updated-revision-input")
		.value.trim();
	if (!updatedRev) {
		document.getElementById("updated-revision-input").classList.add("error");
		errors.push("Updated Revision is required");
		isValid = false;
	} else {
		document.getElementById("updated-revision-input").classList.remove("error");
	}

	if (
		dispositionType &&
		(dispositionType.value === "Repair" || dispositionType.value === "Rework")
	) {
		const dispositionDetails = document
			.getElementById("disposition_description")
			.value.trim();
		if (!dispositionDetails) {
			document.getElementById("disposition_description").classList.add("error");
			errors.push("Disposition Details are required for Repair or Rework");
			isValid = false;
		} else {
			document
				.getElementById("disposition_description")
				.classList.remove("error");
		}
	}

	if (!isValid) {
		alert("Please correct the following errors:\n" + errors.join("\n"));
	}
	return isValid;
}

//SUBMIT ENGINEERING FORM
document
	.getElementById("submitEngineerForm")
	.addEventListener("click", function (e) {
		e.preventDefault();

		if (!validateEngineeringForm()) return;

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

		const values = {
			dispositionType,
			requiresNotification,
			drawingUpdate,
			dispositionDetails,
			engineerMessage,
			originalRev,
			updatedRev,
		};

		const content = buildEngineeringPreviewContent(values);
		PreviewModal.populateContent(content);
		document.getElementById("modal-confirm-btn").innerHTML =
			'<i class="bi bi-check-circle"></i> Publish';
		PreviewModal.open();

		PreviewModal.setConfirmAction(() => {
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
			record.currentStage = "Operations";

			// Save to localStorage
			localStorage.setItem("ncr_records", JSON.stringify(allRecords));

			addNotification(record.ncrNumber, "update");

			PreviewModal.close();
			alert("NCR updated successfully");
			window.location.href = "edit-ncr.html";
		});
	});

function validateOperationsForm() {
	let isValid = true;
	const errors = [];

	const operationDecision = document.querySelector(
		'input[name="ops-decision"]:checked'
	);
	if (!operationDecision) {
		document
			.querySelectorAll('input[name="ops-decision"]')
			.forEach((radio) => radio.classList.add("error"));
		errors.push("Operation Decision is required");
		isValid = false;
	} else {
		document
			.querySelectorAll('input[name="ops-decision"]')
			.forEach((radio) => radio.classList.remove("error"));
	}

	const carRequired = document.querySelector(
		'input[name="car-required"]:checked'
	);
	if (carRequired && carRequired.value === "yes") {
		const carNumber = document.getElementById("car-number").value.trim();
		if (!carNumber) {
			document.getElementById("car-number").classList.add("error");
			errors.push("CAR Number is required when CAR is required");
			isValid = false;
		} else {
			document.getElementById("car-number").classList.remove("error");
		}
	}

	const followUpRequired = document.querySelector(
		'input[name="followup-required"]:checked'
	);
	if (followUpRequired && followUpRequired.value === "yes") {
		const followupType = document.getElementById("followup-type").value.trim();
		if (!followupType) {
			document.getElementById("followup-type").classList.add("error");
			errors.push("Follow-up Type is required when follow-up is required");
			isValid = false;
		} else {
			document.getElementById("followup-type").classList.remove("error");
		}

		const followupDate = document.getElementById("followup-date").value;
		if (!followupDate) {
			document.getElementById("followup-date").classList.add("error");
			errors.push("Follow-up Date is required when follow-up is required");
			isValid = false;
		} else {
			document.getElementById("followup-date").classList.remove("error");
		}
	}

	const actionDate = document.getElementById("ops-date").value;
	if (!actionDate) {
		document.getElementById("ops-date").classList.add("error");
		errors.push("Action Date is required");
		isValid = false;
	} else {
		document.getElementById("ops-date").classList.remove("error");
	}

	if (!isValid) {
		alert("Please correct the following errors:\n" + errors.join("\n"));
	}
	return isValid;
}

//SUBMIT OPERATIONS FORM
document
	.getElementById("submitOperationsForm")
	.addEventListener("click", function (e) {
		e.preventDefault();

		if (!validateOperationsForm()) return;

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

		const values = {
			operationDecision,
			carRequired,
			carNumber,
			followUpRequired,
			followupType,
			followupDate,
			reInspected,
			actionDate,
		};

		const content = buildOperationsPreviewContent(values);
		PreviewModal.populateContent(content);
		document.getElementById("modal-confirm-btn").innerHTML =
			'<i class="bi bi-check-circle"></i> Publish';
		PreviewModal.open();

		PreviewModal.setConfirmAction(() => {
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

			record.currentStage = "Purchasing";

			// Save to localStorage
			localStorage.setItem("ncr_records", JSON.stringify(allRecords));

			addNotification(record.ncrNumber, "update");

			PreviewModal.close();
			alert("NCR updated successfully");
			window.location.href = "edit-ncr.html";
		});
	});

// SUBMIT PURCHASING FORM
function getProcurementFormValues() {
	return {
		supplierReturn:
			document.querySelector('input[name="supplier-return"]:checked')?.value ===
			"yes",
		rmaNumber: document.getElementById("rma-number").value.trim(),
		carrierInfo: document.getElementById("carrier-info").value.trim(),
		disposeOnsite: document.getElementById("dispose-onsite").checked || false,
		replacementDate: document.getElementById("replacement-date").value || "",
		sapCompleted: document.getElementById("sap-completed").checked || false,
		creditExpected: document.getElementById("credit-expected").checked || false,
		billingSupplier:
			document.getElementById("billing-supplier").checked || false,
		procurementDate: document.getElementById("procurement-date").value || "",
	};
}

function validateProcurementForm() {
	let isValid = true;
	const errors = [];

	const procurementDate = document.getElementById("procurement-date").value;
	if (!procurementDate) {
		document.getElementById("procurement-date").classList.add("error");
		errors.push("Procurement Date is required");
		isValid = false;
	} else {
		document.getElementById("procurement-date").classList.remove("error");
	}

	const supplierReturn = document.querySelector(
		'input[name="supplier-return"]:checked'
	);
	if (supplierReturn && supplierReturn.value === "yes") {
		const rmaNumber = document.getElementById("rma-number").value.trim();
		if (!rmaNumber) {
			document.getElementById("rma-number").classList.add("error");
			errors.push("RMA Number is required when Supplier Return is Yes");
			isValid = false;
		} else {
			document.getElementById("rma-number").classList.remove("error");
		}

		const carrierInfo = document.getElementById("carrier-info").value.trim();
		if (!carrierInfo) {
			document.getElementById("carrier-info").classList.add("error");
			errors.push("Carrier Account is required when Supplier Return is Yes");
			isValid = false;
		} else {
			document.getElementById("carrier-info").classList.remove("error");
		}
	}

	if (!isValid) {
		alert("Please correct the following errors:\n" + errors.join("\n"));
	}
	return isValid;
}

document
	.getElementById("submitProcurementForm")
	.addEventListener("click", function (e) {
		e.preventDefault();

		if (!validateProcurementForm()) return;

		const values = getProcurementFormValues();
		const content = buildProcurementPreviewContent(values);
		PreviewModal.populateContent(content);
		PreviewModal.open();

		PreviewModal.setConfirmAction(() => {
			saveProcurementToLocalStorage(values);
			PreviewModal.close();
			alert("Purchasing data saved and NCR completed.");
			window.location.href = "view-ncr.html";
		});
	});

function saveProcurementToLocalStorage(values) {
	const selectedNCR = localStorage.getItem("selectedNCR");
	let allRecords = JSON.parse(localStorage.getItem("ncr_records")) || [];
	let record = allRecords.find((r) => r.ncrNumber === selectedNCR);
	if (!record) return;

	// update new data
	record.procurement.supplierReturn = values.supplierReturn;
	record.procurement.rmaNumber = values.supplierReturn
		? values.rmaNumber
		: null;
	record.procurement.carrierAccount = values.supplierReturn
		? values.carrierInfo
		: null;
	record.procurement.disposeOnSite = !values.supplierReturn
		? values.disposeOnsite
		: false;
	record.procurement.replacementDate = values.replacementDate;
	record.procurement.sapCompleted = values.sapCompleted;
	record.procurement.creditExpected = values.creditExpected;
	record.procurement.billingSupplier = values.billingSupplier;
	record.procurement.completedAt = values.procurementDate;
	record.procurement.procurementOfficer = currentUser.userId;

	//close ncr
	record.status = "Closed";
	record.dateClosed = new Date().toISOString();
	record.closedBy = currentUser.userId;

	// save data
	localStorage.setItem("ncr_records", JSON.stringify(allRecords));

	addNotification(record.ncrNumber, "closed");
}

//----------------------------------------------------------
//Preview Modal
const PreviewModal = {
	open() {
		document.getElementById("preview-modal").style.display = "flex";
	},
	close() {
		document.getElementById("preview-modal").style.display = "none";
	},
	setConfirmAction(callback) {
		const btn = document.getElementById("modal-confirm-btn");
		btn.replaceWith(btn.cloneNode(true));
		const newBtn = document.getElementById("modal-confirm-btn");
		newBtn.addEventListener("click", callback);
	},
	populateContent(content) {
		document.getElementById("modal-body-content").innerHTML = content;
	},
};
//---------------------------------------
// Quality Section Preview Content Builder
function buildQualityPreviewContent(values) {
	const selectedNCR = localStorage.getItem("selectedNCR");
	const record = allRecords.find((r) => r.ncrNumber === selectedNCR);
	if (!record) return "";

	const user = findUser(record.createdBy);
	const userName = user ? `${user.firstName} ${user.lastName}` : "-";
	const dateCreated = record.dateCreated
		? new Date(record.dateCreated).toISOString().split("T")[0]
		: "-";
	const status = record.status || "Draft";

	return `
		<div class="preview-section">
			<h3>NCR Information</h3>
			<div class="preview-grid">
				<div class="preview-item">
					<span class="preview-label">NCR Number:</span>
					<span class="preview-value">${record.ncrNumber || "-"}</span>
				</div>
				<div class="preview-item">
					<span class="preview-label">Date Created:</span>
					<span class="preview-value">${dateCreated}</span>
				</div>
				<div class="preview-item">
					<span class="preview-label">Created By:</span>
					<span class="preview-value">${userName}</span>
				</div>
				<div class="preview-item">
					<span class="preview-label">Status:</span>
					<span class="preview-value">${status}</span>
				</div>
			</div>
		</div>

		<div class="preview-section">
			<h3>Order Information</h3>
			<div class="preview-grid">
				<div class="preview-item">
					<span class="preview-label">PO Number:</span>
					<span class="preview-value">${values.poNumber}</span>
				</div>
				<div class="preview-item">
					<span class="preview-label">Sales Order:</span>
					<span class="preview-value">${values.salesOrder}</span>
				</div>
			</div>
		</div>

		<div class="preview-section">
			<h3>Supplier Information</h3>
			<div class="preview-grid">
				<div class="preview-item full-width">
					<span class="preview-label">Supplier Name:</span>
					<span class="preview-value">${values.supplierName}</span>
				</div>
			</div>
		</div>

		<div class="preview-section">
			<h3>Item Details</h3>
			<div class="preview-grid">
				<div class="preview-item full-width">
					<span class="preview-label">Item Description:</span>
					<span class="preview-value">${values.itemDescription}</span>
				</div>
				<div class="preview-item">
					<span class="preview-label">Process Type:</span>
					<span class="preview-value">${
						values.processType === "supplier"
							? "Supplier / Receiving Inspection"
							: "WIP (Production Order)"
					}</span>
				</div>
			</div>
		</div>

		<div class="preview-section">
			<h3>Defect Information</h3>
			<div class="preview-grid">
				<div class="preview-item">
					<span class="preview-label">Quantity Received:</span>
					<span class="preview-value">${values.qtyReceived}</span>
				</div>
				<div class="preview-item">
					<span class="preview-label">Quantity Defective:</span>
					<span class="preview-value">${values.qtyDefective}</span>
				</div>
				<div class="preview-item full-width">
					<span class="preview-label">Defect Description:</span>
					<span class="preview-value">${values.defectDescription}</span>
				</div>
			</div>
		</div>

		<div class="preview-section">
			<h3>Quality Assessment</h3>
			<div class="preview-grid">
				<div class="preview-item">
					<span class="preview-label">Item Status:</span>
					<span class="preview-value">${
						values.itemStatus === "conforming" ? "Conforming" : "Non-Conforming"
					}</span>
				</div>
				<div class="preview-item">
					<span class="preview-label">Engineering Required:</span>
					<span class="preview-value">${values.engineeringRequired}</span>
				</div>
			</div>
		</div>
	`;
}

//---------------------------------------
// Engineering Section Preview Content Builder
function buildEngineeringPreviewContent(values) {
	const selectedNCR = localStorage.getItem("selectedNCR");
	const record = allRecords.find((r) => r.ncrNumber === selectedNCR);
	if (!record) return "";

	const user = findUser(record.createdBy);
	const userName = user ? `${user.firstName} ${user.lastName}` : "-";
	const dateCreated = record.dateCreated
		? new Date(record.dateCreated).toISOString().split("T")[0]
		: "-";
	const status = record.status || "Draft";

	return `
		<div class="preview-section">
			<h3>NCR Information</h3>
			<div class="preview-grid">
				<div class="preview-item">
					<span class="preview-label">NCR Number:</span>
					<span class="preview-value">${record.ncrNumber || "-"}</span>
				</div>
				<div class="preview-item">
					<span class="preview-label">Date Created:</span>
					<span class="preview-value">${dateCreated}</span>
				</div>
				<div class="preview-item">
					<span class="preview-label">Created By:</span>
					<span class="preview-value">${userName}</span>
				</div>
				<div class="preview-item">
					<span class="preview-label">Status:</span>
					<span class="preview-value">${status}</span>
				</div>
			</div>
		</div>
		<div class="preview-section">
			<h3>Engineering Disposition</h3>
			<div class="preview-grid">
				<div class="preview-item">
					<span class="preview-label">Disposition Type:</span>
					<span class="preview-value">${values.dispositionType}</span>
				</div>
				<div class="preview-item">
					<span class="preview-label">Notification Required:</span>
					<span class="preview-value">${values.requiresNotification ? "Yes" : "No"}</span>
				</div>
				<div class="preview-item">
					<span class="preview-label">Drawing Update Required:</span>
					<span class="preview-value">${values.drawingUpdate ? "Yes" : "No"}</span>
				</div>
				<div class="preview-item full-width">
					<span class="preview-label">Disposition Details:</span>
					<span class="preview-value">${values.dispositionDetails || "-"}</span>
				</div>
				<div class="preview-item full-width">
					<span class="preview-label">Engineer Message:</span>
					<span class="preview-value">${values.engineerMessage || "-"}</span>
				</div>
				<div class="preview-item">
					<span class="preview-label">Original Revision:</span>
					<span class="preview-value">${values.originalRev || "-"}</span>
				</div>
				<div class="preview-item">
					<span class="preview-label">Updated Revision:</span>
					<span class="preview-value">${values.updatedRev || "-"}</span>
				</div>
			</div>
		</div>
	`;
}

//---------------------------------------
// Quality Section Preview Builder
function buildQualityPreview(record) {
	document.getElementById("preview-ncr-number").textContent = record.ncrNumber;
	document.getElementById("preview-date").textContent = record.dateCreated;
	document.getElementById("preview-user").textContent = findUser(
		record.createdBy
	).firstName;

	document.getElementById("preview-po").textContent = record.quality.poNumber;
	document.getElementById("preview-so").textContent =
		record.quality.salesOrderNumber;
	document.getElementById("preview-supplier").textContent = record.supplierName;

	document.getElementById("preview-item").textContent =
		record.quality.itemDescription;
	document.getElementById("preview-process").textContent =
		record.ncrType.toUpperCase();

	document.getElementById("preview-qty-received").textContent =
		record.quality.quantityReceived;
	document.getElementById("preview-qty-defective").textContent =
		record.quality.quantityDefective;
	document.getElementById("preview-defect").textContent =
		record.quality.defectDescription;

	document.getElementById("preview-status").textContent = "Active";
}
//---------------------------------------
//Engineering Section Preview Builder
function buildEngineeringPreview(record) {
	document.getElementById("preview-ncr-number").textContent = record.ncrNumber;

	document.getElementById("preview-item").textContent =
		record.engineering.dispositionType;
	document.getElementById("preview-process").textContent = record.engineering
		.notificationRequired
		? "Customer notif required"
		: "No notification";

	document.getElementById("preview-defect").textContent =
		record.engineering.engineerNote || "-";
}

//---------------------------------------
//Operations Section Preview Builder
function buildOperationsPreview(record) {
	document.getElementById("preview-po").textContent =
		record.operations.operationDecision;
	document.getElementById("preview-so").textContent = record.operations
		.followUpRequired
		? "Follow-up Required"
		: "No follow-up";

	document.getElementById("preview-defect").textContent = record.operations
		.reInspected
		? "Reinspection OK"
		: "Reinspection Failed";
}

//---------------------------------------
//Procurement Section Preview Builder
function buildProcurementPreview(record) {
	document.getElementById("preview-item").textContent = record.procurement
		.supplierReturn
		? "Return to Supplier"
		: "Dispose on Site";

	document.getElementById("preview-process").textContent =
		record.procurement.replacementDate;

	document.getElementById("preview-defect").textContent = record.procurement
		.billingSupplier
		? "Billing Supplier"
		: "No billing";
}

//---------------------------------------
// Operations Section Preview Content Builder
function buildOperationsPreviewContent(values) {
	const selectedNCR = localStorage.getItem("selectedNCR");
	const record = allRecords.find((r) => r.ncrNumber === selectedNCR);
	if (!record) return "";

	const user = findUser(record.createdBy);
	const userName = user ? `${user.firstName} ${user.lastName}` : "-";
	const dateCreated = record.dateCreated
		? new Date(record.dateCreated).toISOString().split("T")[0]
		: "-";
	const status = record.status || "Draft";

	return `
		<div class="preview-section">
			<h3>NCR Information</h3>
			<div class="preview-grid">
				<div class="preview-item">
					<span class="preview-label">NCR Number:</span>
					<span class="preview-value">${record.ncrNumber || "-"}</span>
				</div>
				<div class="preview-item">
					<span class="preview-label">Date Created:</span>
					<span class="preview-value">${dateCreated}</span>
				</div>
				<div class="preview-item">
					<span class="preview-label">Created By:</span>
					<span class="preview-value">${userName}</span>
				</div>
				<div class="preview-item">
					<span class="preview-label">Status:</span>
					<span class="preview-value">${status}</span>
				</div>
			</div>
		</div>
		<div class="preview-section">
			<h3>Operations Disposition</h3>
			<div class="preview-grid">
				<div class="preview-item full-width">
					<span class="preview-label">Operation Decision:</span>
					<span class="preview-value">${values.operationDecision}</span>
				</div>
				<div class="preview-item">
					<span class="preview-label">CAR Required:</span>
					<span class="preview-value">${values.carRequired ? "Yes" : "No"}</span>
				</div>
				<div class="preview-item">
					<span class="preview-label">CAR Number:</span>
					<span class="preview-value">${values.carNumber || "-"}</span>
				</div>
				<div class="preview-item">
					<span class="preview-label">Follow-up Required:</span>
					<span class="preview-value">${values.followUpRequired ? "Yes" : "No"}</span>
				</div>
				<div class="preview-item">
					<span class="preview-label">Follow-up Type:</span>
					<span class="preview-value">${values.followupType || "-"}</span>
				</div>
				<div class="preview-item">
					<span class="preview-label">Follow-up Date:</span>
					<span class="preview-value">${values.followupDate || "-"}</span>
				</div>
				<div class="preview-item">
					<span class="preview-label">Re-inspected:</span>
					<span class="preview-value">${values.reInspected ? "Yes" : "No"}</span>
				</div>
				<div class="preview-item">
					<span class="preview-label">Action Date:</span>
					<span class="preview-value">${values.actionDate || "-"}</span>
				</div>
			</div>
		</div>
	`;
}

//---------------------------------------
// Procurement Section Preview Content Builder
function buildProcurementPreviewContent(values) {
	const selectedNCR = localStorage.getItem("selectedNCR");
	const record = allRecords.find((r) => r.ncrNumber === selectedNCR);
	if (!record) return "";

	const user = findUser(record.createdBy);
	const userName = user ? `${user.firstName} ${user.lastName}` : "-";
	const dateCreated = record.dateCreated
		? new Date(record.dateCreated).toISOString().split("T")[0]
		: "-";
	const status = record.status || "Draft";

	const engineer = findUser(record.engineering.engineerId);
	const engineerName = engineer
		? `${engineer.firstName} ${engineer.lastName}`
		: "-";

	const operationManager = findUser(record.operations.operationsManagerId);
	const operationManagerName = operationManager
		? `${operationManager.firstName} ${operationManager.lastName}`
		: "-";

	const procurementOfficer = findUser(record.procurement.procurementOfficer);
	const procurementOfficerName = procurementOfficer
		? `${procurementOfficer.firstName} ${procurementOfficer.lastName}`
		: "-";

	return `
		<div class="preview-section">
			<h3>NCR Information</h3>
			<div class="preview-grid">
				<div class="preview-item">
					<span class="preview-label">NCR Number:</span>
					<span class="preview-value">${record.ncrNumber || "-"}</span>
				</div>
				<div class="preview-item">
					<span class="preview-label">Date Created:</span>
					<span class="preview-value">${dateCreated}</span>
				</div>
				<div class="preview-item">
					<span class="preview-label">Created By:</span>
					<span class="preview-value">${userName}</span>
				</div>
				<div class="preview-item">
					<span class="preview-label">Status:</span>
					<span class="preview-value">${status}</span>
				</div>
			</div>
		</div>

		<div class="preview-section">
			<h3>Order Information</h3>
			<div class="preview-grid">
				<div class="preview-item">
					<span class="preview-label">PO Number:</span>
					<span class="preview-value">${record.quality.poNumber || "-"}</span>
				</div>
				<div class="preview-item">
					<span class="preview-label">Sales Order:</span>
					<span class="preview-value">${record.quality.salesOrderNumber || "-"}</span>
				</div>
			</div>
		</div>

		<div class="preview-section">
			<h3>Supplier Information</h3>
			<div class="preview-grid">
				<div class="preview-item full-width">
					<span class="preview-label">Supplier Name:</span>
					<span class="preview-value">${record.supplierName || "-"}</span>
				</div>
			</div>
		</div>

		<div class="preview-section">
			<h3>Item Details</h3>
			<div class="preview-grid">
				<div class="preview-item full-width">
					<span class="preview-label">Item Description:</span>
					<span class="preview-value">${record.quality.itemDescription || "-"}</span>
				</div>
				<div class="preview-item">
					<span class="preview-label">Process Type:</span>
					<span class="preview-value">${
						record.ncrType === "supplier"
							? "Supplier / Receiving Inspection"
							: "WIP (Production Order)"
					}</span>
				</div>
			</div>
		</div>

		<div class="preview-section">
			<h3>Defect Information</h3>
			<div class="preview-grid">
				<div class="preview-item">
					<span class="preview-label">Quantity Received:</span>
					<span class="preview-value">${record.quality.quantityReceived || "-"}</span>
				</div>
				<div class="preview-item">
					<span class="preview-label">Quantity Defective:</span>
					<span class="preview-value">${record.quality.quantityDefective || "-"}</span>
				</div>
				<div class="preview-item full-width">
					<span class="preview-label">Defect Description:</span>
					<span class="preview-value">${record.quality.defectDescription || "-"}</span>
				</div>
			</div>
		</div>

		<div class="preview-section">
			<h3>Quality Assessment</h3>
			<div class="preview-grid">
				<div class="preview-item">
					<span class="preview-label">Item Status:</span>
					<span class="preview-value">${
						record.quality.itemMarkedNonconforming
							? "Non-Conforming"
							: "Conforming"
					}</span>
				</div>
				<div class="preview-item">
					<span class="preview-label">Engineering Required:</span>
					<span class="preview-value">${
						record.quality.engineeringRequired ? "Yes" : "No"
					}</span>
				</div>
			</div>
		</div>

		<div class="preview-section">
			<h3>Engineering Disposition</h3>
			<div class="preview-grid">
				<div class="preview-item">
					<span class="preview-label">Engineer:</span>
					<span class="preview-value">${engineerName}</span>
				</div>
				<div class="preview-item">
					<span class="preview-label">Disposition Type:</span>
					<span class="preview-value">${record.engineering.dispositionType || "-"}</span>
				</div>
				<div class="preview-item">
					<span class="preview-label">Notification Required:</span>
					<span class="preview-value">${
						record.engineering.notificationRequired ? "Yes" : "No"
					}</span>
				</div>
				<div class="preview-item">
					<span class="preview-label">Drawing Update Required:</span>
					<span class="preview-value">${
						record.engineering.drawingUpdateRequired ? "Yes" : "No"
					}</span>
				</div>
				<div class="preview-item full-width">
					<span class="preview-label">Disposition Details:</span>
					<span class="preview-value">${
						record.engineering.dispositionDetails || "-"
					}</span>
				</div>
				<div class="preview-item full-width">
					<span class="preview-label">Engineer Message:</span>
					<span class="preview-value">${record.engineering.engineerNote || "-"}</span>
				</div>
				<div class="preview-item">
					<span class="preview-label">Original Revision:</span>
					<span class="preview-value">${
						record.engineering.originalRevNumber || "-"
					}</span>
				</div>
				<div class="preview-item">
					<span class="preview-label">Updated Revision:</span>
					<span class="preview-value">${record.engineering.updatedRevNumber || "-"}</span>
				</div>
				<div class="preview-item">
					<span class="preview-label">Disposition Date:</span>
					<span class="preview-value">${record.engineering.dispositionDate || "-"}</span>
				</div>
			</div>
		</div>

		<div class="preview-section">
			<h3>Operations Disposition</h3>
			<div class="preview-grid">
				<div class="preview-item">
					<span class="preview-label">Operations Manager:</span>
					<span class="preview-value">${operationManagerName}</span>
				</div>
				<div class="preview-item full-width">
					<span class="preview-label">Operation Decision:</span>
					<span class="preview-value">${record.operations.operationDecision || "-"}</span>
				</div>
				<div class="preview-item">
					<span class="preview-label">CAR Required:</span>
					<span class="preview-value">${
						record.operations.carRequired ? "Yes" : "No"
					}</span>
				</div>
				<div class="preview-item">
					<span class="preview-label">CAR Number:</span>
					<span class="preview-value">${record.operations.carNumber || "-"}</span>
				</div>
				<div class="preview-item">
					<span class="preview-label">Follow-up Required:</span>
					<span class="preview-value">${
						record.operations.followUpRequired ? "Yes" : "No"
					}</span>
				</div>
				<div class="preview-item">
					<span class="preview-label">Follow-up Type:</span>
					<span class="preview-value">${record.operations.followUpType || "-"}</span>
				</div>
				<div class="preview-item">
					<span class="preview-label">Follow-up Date:</span>
					<span class="preview-value">${record.operations.followUpDate || "-"}</span>
				</div>
				<div class="preview-item">
					<span class="preview-label">Re-inspected:</span>
					<span class="preview-value">${
						record.operations.reInspected ? "Yes" : "No"
					}</span>
				</div>
				<div class="preview-item">
					<span class="preview-label">Action Date:</span>
					<span class="preview-value">${record.operations.actionDate || "-"}</span>
				</div>
				<div class="preview-item">
					<span class="preview-label">Completed At:</span>
					<span class="preview-value">${record.operations.completedAt || "-"}</span>
				</div>
			</div>
		</div>

		<div class="preview-section">
			<h3>Procurement Disposition</h3>
			<div class="preview-grid">
				<div class="preview-item">
					<span class="preview-label">Procurement Officer:</span>
					<span class="preview-value">${procurementOfficerName}</span>
				</div>
				<div class="preview-item">
					<span class="preview-label">Supplier Return:</span>
					<span class="preview-value">${values.supplierReturn ? "Yes" : "No"}</span>
				</div>
				<div class="preview-item">
					<span class="preview-label">RMA Number:</span>
					<span class="preview-value">${values.rmaNumber || "-"}</span>
				</div>
				<div class="preview-item">
					<span class="preview-label">Carrier Account:</span>
					<span class="preview-value">${values.carrierInfo || "-"}</span>
				</div>
				<div class="preview-item">
					<span class="preview-label">Dispose On Site:</span>
					<span class="preview-value">${values.disposeOnsite ? "Yes" : "No"}</span>
				</div>
				<div class="preview-item">
					<span class="preview-label">Replacement Date:</span>
					<span class="preview-value">${values.replacementDate || "-"}</span>
				</div>
				<div class="preview-item">
					<span class="preview-label">SAP Completed:</span>
					<span class="preview-value">${values.sapCompleted ? "Yes" : "No"}</span>
				</div>
				<div class="preview-item">
					<span class="preview-label">Credit Expected:</span>
					<span class="preview-value">${values.creditExpected ? "Yes" : "No"}</span>
				</div>
				<div class="preview-item">
					<span class="preview-label">Billing Supplier:</span>
					<span class="preview-value">${values.billingSupplier ? "Yes" : "No"}</span>
				</div>
				<div class="preview-item">
					<span class="preview-label">Procurement Date:</span>
					<span class="preview-value">${values.procurementDate || "-"}</span>
				</div>
			</div>
		</div>
	`;
}
