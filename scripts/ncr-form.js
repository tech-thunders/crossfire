/**
 * NCR Form Handler (Create + Preview + Save)
 * Fully rewritten to match your updated NCR schema
 */

const NCRFormHandler = {
	editMode: false,
	editingId: null,

	init() {
		console.log("📌 NCR Form Init");

		const params = new URLSearchParams(window.location.search);
		const editId = params.get("id");

		if (editId) {
			this.editMode = true;
			this.editingId = editId;

			const existingData = localStorage.getItem("ncr_records");
			if (existingData && existingData !== "[]") {
				this.loadNCRForEditing(editId);
			} else {
				window.addEventListener("ncr-data-loaded", () => {
					this.loadNCRForEditing(editId);
				});
			}
		} else {
			this.editMode = false;

			const exists = localStorage.getItem("ncr_records");
			if (exists && exists !== "[]") {
				this.fillAutoValues();
			} else {
				window.addEventListener("ncr-data-loaded", () => {
					this.fillAutoValues();
				});
			}
		}

		this.setupValidation();
		this.setupFormSubmission();
	},

	/** ----------------------------
     * AUTO-FILL (Create Mode)
     -----------------------------*/
	fillAutoValues() {
		const number = NCRDataManager.generateNCRNumber();
		const today = new Date().toISOString().split("T")[0];
		const currentUser = NCRDataManager.getCurrentUser();

		document.getElementById("ncr-number-display").textContent = number;
		document.getElementById("date-created-display").textContent = today;
		document.getElementById("created-by-display").textContent = currentUser;
		document.getElementById("status-display").textContent = "Draft";
	},

	/** ----------------------------
     * LOAD NCR FOR EDITING
     -----------------------------*/
	loadNCRForEditing(id) {
		const ncr = NCRDataManager.getNCRById(id);
		if (!ncr) {
			ToastManager.error("Record not found");
			window.location.href = "view-ncr.html";
			return;
		}

		document.getElementById("ncr-number-display").textContent = ncr.ncrNumber;
		document.getElementById("created-by-display").textContent =
			this.getUserName(ncr.createdBy);
		document.getElementById("date-created-display").textContent =
			ncr.dateCreated;
		document.getElementById("status-display").textContent = ncr.status;

		// QUALITY
		document.getElementById("po_number").value = ncr.quality.poNumber;
		document.getElementById("sales_order").value = ncr.quality.salesOrderNumber;
		document.getElementById("supplier_name").value = ncr.supplierName;
		document.getElementById("item_description").value =
			ncr.quality.itemDescription;
		document.getElementById("qty_received").value =
			ncr.quality.quantityReceived;
		document.getElementById("qty_defective").value =
			ncr.quality.quantityDefective;
		document.getElementById("defect_description").value =
			ncr.quality.defectDescription;

		document.querySelector(
			`input[name="process_type"][value="${ncr.ncrType}"]`
		).checked = true;

		const statusVal = ncr.quality.itemMarkedNonconforming
			? "nonconforming"
			: "conforming";
		document.querySelector(
			`input[name="item_status"][value="${statusVal}"]`
		).checked = true;

		document.getElementById("engineering_required").checked =
			ncr.quality.engineeringRequired;
	},

	getUserName(id) {
		const users = JSON.parse(localStorage.getItem("users")) || [];
		const u = users.find((x) => x.userId === id);
		return u ? `${u.firstName} ${u.lastName}` : "Unknown User";
	},

	/** ----------------------------
     * VALIDATION
     -----------------------------*/
	setupValidation() {
		const ids = [
			"po_number",
			"sales_order",
			"supplier_name",
			"item_description",
			"qty_received",
			"qty_defective",
			"defect_description",
		];

		ids.forEach((id) => {
			const el = document.getElementById(id);
			el.addEventListener("blur", () => this.validateField(id));
			el.addEventListener("input", () => this.clearFieldError(id));
		});

		document
			.getElementById("qty_received")
			.addEventListener("input", () => this.validateQty());
		document
			.getElementById("qty_defective")
			.addEventListener("input", () => this.validateQty());

		document.querySelectorAll('input[name="process_type"]').forEach((radio) => {
			radio.addEventListener("change", () =>
				this.clearRadioError("process_type")
			);
		});

		document.querySelectorAll('input[name="item_status"]').forEach((radio) => {
			radio.addEventListener("change", () =>
				this.clearRadioError("item_status")
			);
		});
	},

	validateField(id) {
		const el = document.getElementById(id);
		const err = document.getElementById(id + "_error");

		if (el.value.trim() === "") {
			el.classList.add("error");
			err.classList.add("show");
			return false;
		}
		return true;
	},

	clearFieldError(fieldId) {
		const field = document.getElementById(fieldId);
		const errorElement = document.getElementById(fieldId + "_error");

		if (field && field.value.trim() !== "") {
			field.classList.remove("error");
			if (errorElement) {
				errorElement.classList.remove("show");
			}
		}
	},

	clearRadioError(group) {
		const errorElement = document.getElementById(group + "_error");
		if (errorElement) {
			errorElement.classList.remove("show");
		}
	},

	validateQty() {
		const r = +document.getElementById("qty_received").value;
		const d = +document.getElementById("qty_defective").value;

		const err = document.getElementById("qty_validation_error");

		if (d > r) {
			err.classList.add("show");
			return false;
		}
		err.classList.remove("show");
		return true;
	},

	validateRadio(group) {
		const radios = document.querySelectorAll(`input[name="${group}"]`);
		const selected = [...radios].some((r) => r.checked);
		const errorElement = document.getElementById(group + "_error");

		if (!selected) {
			if (errorElement) errorElement.classList.add("show");
			return false;
		}

		if (errorElement) errorElement.classList.remove("show");
		return true;
	},

	validateForm() {
		const ids = [
			"po_number",
			"sales_order",
			"supplier_name",
			"item_description",
			"qty_received",
			"qty_defective",
			"defect_description",
		];

		let ok = true;
		ids.forEach((id) => {
			if (!this.validateField(id)) ok = false;
		});

		if (!this.validateQty()) ok = false;
		if (!this.validateRadio("process_type")) ok = false;
		if (!this.validateRadio("item_status")) ok = false;

		return ok;
	},

	/** ----------------------------
     * SUBMISSION
     -----------------------------*/
	setupFormSubmission() {
		document.getElementById("submitForm").addEventListener("click", (e) => {
			e.preventDefault();
			if (this.validateForm()) this.showPreview();
		});
	},

	/** ----------------------------
     * PREVIEW MODAL
     -----------------------------*/
	showPreview() {
		const d = this.collectFormData();

		document.getElementById("preview-ncr-number").textContent = d.ncrNumber;
		document.getElementById("preview-date").textContent = d.dateCreated;
		document.getElementById("preview-user").textContent = d.createdBy;
		document.getElementById("preview-po").textContent = d.poNumber;
		document.getElementById("preview-so").textContent = d.salesOrderNumber;
		document.getElementById("preview-supplier").textContent = d.supplierName;
		document.getElementById("preview-item").textContent = d.itemDescription;
		document.getElementById("preview-process").textContent =
			d.processType === "supplier" ? "Supplier / Receiving" : "WIP";
		document.getElementById("preview-qty-received").textContent =
			d.quantityReceived;
		document.getElementById("preview-qty-defective").textContent =
			d.quantityDefective;
		document.getElementById("preview-defect").textContent = d.defectDescription;
		document.getElementById("preview-item-status").textContent =
			d.itemStatus === "conforming" ? "Conforming" : "Non-Conforming";
		document.getElementById("preview-engineering").textContent =
			d.engineeringRequired ? "Yes" : "No";

		document.getElementById("preview-modal").classList.add("show");
	},

	closePreviewModal() {
		document.getElementById("preview-modal").classList.remove("show");
	},

	/** ----------------------------
     * COLLECT FORM DATA
     -----------------------------*/
	collectFormData() {
		return {
			ncrNumber: document.getElementById("ncr-number-display").textContent,
			dateCreated: document.getElementById("date-created-display").textContent,
			createdBy: document.getElementById("created-by-display").textContent,

			poNumber: po_number.value.trim(),
			salesOrderNumber: sales_order.value.trim(),
			supplierName: supplier_name.value.trim(),
			itemDescription: item_description.value.trim(),

			processType: document.querySelector('input[name="process_type"]:checked')
				.value,

			quantityReceived: qty_received.value.trim(),
			quantityDefective: qty_defective.value.trim(),
			defectDescription: defect_description.value.trim(),

			itemStatus: document.querySelector('input[name="item_status"]:checked')
				.value,

			engineeringRequired: engineering_required.checked,
		};
	},

	/** ----------------------------
     * FINAL SAVE
     -----------------------------*/
	confirmAndSave() {
		const form = this.collectFormData();

		const newNCR = NCRDataManager.saveNewRecord(form);
		this.closePreviewModal();
		// this.showSuccessToast(`NCR ${newNCR.ncrNumber} created successfully!`);
		ToastManager.success(`NCR ${newNCR.ncrNumber} created successfully!`);
		window.location.href = "view-ncr.html";
	},
};

document.addEventListener("DOMContentLoaded", () => NCRFormHandler.init());

window.NCRFormHandler = NCRFormHandler;
