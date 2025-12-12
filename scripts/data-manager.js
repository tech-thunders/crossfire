/**
 * NCR Data Manager
 * Handles NCR loading, creation, updating, and storage
 * Matches EXACT schema from logData.json
 */

const NCRDataManager = {
	STORAGE_KEYS: {
		NCRS: "ncr_records",
		CURRENT_USER: "ncr_current_user",
		USERS: "users",
	},

	/**
	 * Initialize base data if not present in localStorage
	 */
	init() {
		// Load users first
		if (!localStorage.getItem(this.STORAGE_KEYS.USERS)) {
			fetch("data/users.json")
				.then((res) => res.json())
				.then((data) =>
					localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(data))
				);
		}

		const stored = localStorage.getItem(this.STORAGE_KEYS.NCRS);

		if (!stored) {
			this.seedFromJSON();
			return;
		}

		// Validate schema
		if (!this.validateSchema()) {
			console.warn("Schema mismatch — resetting NCR data...");
			this.seedFromJSON();
			return;
		}

		// Schema OK
		console.log("NCR data schema matches — using localStorage");
		setTimeout(() => window.dispatchEvent(new Event("ncr-data-loaded")), 0);
	},

	validateSchema() {
		try {
			const stored = this.getAllNCRs();
			if (!Array.isArray(stored)) return false;
			if (stored.length === 0) return true; // empty is fine

			const sample = stored[0];

			// REQUIRED top-level keys from your schema
			const requiredKeys = [
				"ncrId",
				"ncrNumber",
				"supplierName",
				"ncrType",
				"currentStage",
				"status",
				"createdBy",
				"dateCreated",
				"lastUpdated",
				"quality",
				"engineering",
				"operations",
				"procurement",
			];

			for (const key of requiredKeys) {
				if (!(key in sample)) return false;
			}

			// REQUIRED nested quality keys
			const requiredQuality = [
				"poNumber",
				"salesOrderNumber",
				"itemDescription",
				"defectDescription",
				"quantityReceived",
				"quantityDefective",
				"itemMarkedNonconforming",
				"inspectionDate",
				"engineeringRequired",
				"completed",
				"inspectorId",
			];

			for (const key of requiredQuality) {
				if (!(key in sample.quality)) return false;
			}

			// REQUIRED engineering keys
			const requiredEng = [
				"engineerId",
				"dispositionType",
				"dispositionDetails",
				"dispositionDate",
				"drawingUpdateRequired",
				"originalRevNumber",
				"updatedRevNumber",
				"revisionDate",
			];

			for (const key of requiredEng) {
				if (!(key in sample.engineering)) return false;
			}

			return true; // schema matches
		} catch (err) {
			return false; // corrupted JSON or missing structure
		}
	},

	// --------------------------
	// Core Getters
	// --------------------------

	getAllNCRs() {
		return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.NCRS)) || [];
	},

	getUsers() {
		return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.USERS)) || [];
	},

	getCurrentUser() {
		return (
			localStorage.getItem(this.STORAGE_KEYS.CURRENT_USER) || "Michael Thompson"
		);
	},

	getNCRByNumber(ncrNumber) {
		return this.getAllNCRs().find((n) => n.ncrNumber === ncrNumber);
	},

	getNCRById(id) {
		return this.getAllNCRs().find((n) => n.ncrId === id);
	},

	// --------------------------
	// NCR Number Generator (NO SKIPS)
	// --------------------------

	generateNCRNumber() {
		const year = new Date().getFullYear().toString();
		const ncrs = this.getAllNCRs();

		const numbers = ncrs
			.filter((n) => n.ncrNumber.startsWith(year))
			.map((n) => Number(n.ncrNumber.split("-")[1]))
			.sort((a, b) => a - b);

		let next = 1;
		for (let i = 0; i < numbers.length; i++) {
			if (numbers[i] !== next) break;
			next++;
		}

		return `${year}-${String(next).padStart(3, "0")}`;
	},

	// --------------------------
	// NCR Creation
	// --------------------------

	createNCRFromForm(formData) {
		const users = this.getUsers();
		const randomUser = users[Math.floor(Math.random() * users.length)];

		const ncrNumber = this.generateNCRNumber();
		const today = new Date().toISOString().split("T")[0];
		const nowFull = new Date().toISOString();

		return {
			ncrId: Date.now(),
			ncrNumber,
			supplierName: formData.supplierName,
			ncrType: formData.processType,
			currentStage: "Quality",
			status: "Draft",

			createdBy: randomUser.userId,
			closedBy: null,
			dateCreated: today,
			dateClosed: null,
			lastUpdated: nowFull,

			quality: {
				qualityId: Date.now(),
				poNumber: formData.poNumber,
				salesOrderNumber: formData.salesOrderNumber,
				itemDescription: formData.itemDescription,
				defectDescription: formData.defectDescription,
				quantityReceived: Number(formData.quantityReceived),
				quantityDefective: Number(formData.quantityDefective),
				itemMarkedNonconforming: formData.itemStatus === "nonconforming",
				inspectionDate: today,
				engineeringRequired: formData.engineeringRequired || false,
				completed: false,
				completedAt: null,
				inspectorId: randomUser.userId,
			},

			engineering: {
				engineeringId: Date.now(),
				engineerId: null,
				dispositionType: "",
				dispositionDetails: "",
				dispositionDate: "",
				drawingUpdateRequired: null,
				originalRevNumber: "A1",
				updatedRevNumber: "A1",
				revisionDate: today,
				completed: false,
				completedAt: null,
			},

			operations: {
				operationsId: Date.now(),
				operationsManagerId: null,
				actionTaken: "",
				carRequired: false,
				carNumber: null,
				actionDate: "",
				completed: false,
				completedAt: null,
			},

			procurement: {
				procurementId: Date.now(),
				buyerId: null,
				supplierReturn: false,
				rmaNumber: null,
				carrierAccount: null,
				disposeOnSite: false,
				replacementDate: null,
				sapCompleted: false,
				creditExpected: false,
				billingSupplier: false,
				completed: false,
				completedAt: null,
			},
		};
	},

	saveNCR(ncrObject) {
		const ncrs = this.getAllNCRs();
		ncrs.push(ncrObject);
		localStorage.setItem(this.STORAGE_KEYS.NCRS, JSON.stringify(ncrs));
		addNotification(ncrObject.ncrNumber, "create");
		return ncrObject;
	},

	// --------------------------
	// Update NCR
	// --------------------------

	updateNCR(ncrNumber, updates) {
		const ncrs = this.getAllNCRs();
		const index = ncrs.findIndex((n) => n.ncrNumber === ncrNumber);

		if (index === -1) {
			console.error("NCR not found:", ncrNumber);
			return null;
		}

		ncrs[index] = {
			...ncrs[index],
			...updates,
			lastUpdated: new Date().toISOString(),
		};

		localStorage.setItem(this.STORAGE_KEYS.NCRS, JSON.stringify(ncrs));

		addNotification(ncrNumber, "update");
		return ncrs[index];
	},
	saveNewRecord(formData) {
		// Build record using your schema
		const newRecord = this.createNCRFromForm(formData);

		// Load existing records
		const records = this.getAllNCRs();

		// Add new record
		records.push(newRecord);

		// Save back to localStorage
		localStorage.setItem(this.STORAGE_KEYS.NCRS, JSON.stringify(records));

		// Create notification
		addNotification(newRecord.ncrNumber, "create");

		return newRecord;
	},
	// --------------------------
	// Clear Data
	// --------------------------

	clearAllData() {
		localStorage.removeItem(this.STORAGE_KEYS.NCRS);
		console.log("All NCR records cleared.");
	},
	buildNCRObject(form) {
		return {
			id: Date.now(),
			ncrNumber: form.ncrNumber,
			status: "Draft",
			dateCreated: form.dateCreated,
			createdBy: NCRDataManager.getCurrentUserId(),

			supplierName: form.supplierName,
			ncrType: form.processType,

			quality: {
				poNumber: form.poNumber,
				salesOrderNumber: form.salesOrderNumber,
				itemDescription: form.itemDescription,
				quantityReceived: form.quantityReceived,
				quantityDefective: form.quantityDefective,
				defectDescription: form.defectDescription,
				itemMarkedNonconforming: form.itemStatus === "nonconforming",
				engineeringRequired: form.engineeringRequired,
			},

			engineering: null,
			operations: null,
			history: [],
		};
	},
	seedFromJSON() {
		fetch("data/logData.json")
			.then((res) => res.json())
			.then((data) => {
				localStorage.setItem(this.STORAGE_KEYS.NCRS, JSON.stringify(data));

				window.dispatchEvent(new Event("ncr-data-loaded"));
			})
			.catch((err) => {
				console.error("Failed to seed NCR data:", err);
				localStorage.setItem(this.STORAGE_KEYS.NCRS, JSON.stringify([]));
			});
	},
};

// Initialize Manager
NCRDataManager.init();
