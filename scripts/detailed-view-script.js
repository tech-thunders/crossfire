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

// Populate the data into each section
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

	applyRoleBasedViewAccess();
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

function applyRoleBasedViewAccess() {
	if (!currentUser || !currentUser.department) return;

	const department = currentUser.department.toLowerCase();

	const sections = {
		quality: ["quality"],
		engineering: ["quality", "engineering"],
		operations: ["quality", "engineering", "operations"],
		purchasing: ["quality", "engineering", "operations", "purchasing"],
		admin: ["quality", "engineering", "operations", "purchasing"],
	};

	const allowedSections = sections[department] || [];

	const allSections = ["quality", "engineering", "operations", "purchasing"];
	allSections.forEach((section) => {
		const sectionElement = document.getElementById(`${section}-dept`);
		if (sectionElement) {
			if (allowedSections.includes(section)) {
				sectionElement.style.display = "block";
			} else {
				sectionElement.style.display = "none";
			}
		}
	});

	// Open the department section by default
	const deptToRd = {
		quality: "rd1",
		engineering: "rd2",
		operations: "rd3",
		purchasing: "rd4",
		admin: "rd4",
	};
	const rdId = deptToRd[department];
	if (rdId) {
		const checkbox = document.getElementById(rdId);
		if (checkbox) {
			checkbox.checked = true;
		}
	}
}
