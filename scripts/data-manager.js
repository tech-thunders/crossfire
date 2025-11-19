/**
 * NCR Data Manager
 * Handles all data operations using localStorage
 */

const NCRDataManager = {
	// Storage keys
	STORAGE_KEYS: {
		NCRS: "ncr_records",
		CURRENT_USER: "ncr_current_user",
	},

	/**
	 * Initialize - Load JSON data into localStorage if first time
	 */
	init() {
		const existing = localStorage.getItem(this.STORAGE_KEYS.NCRS);

		if (!existing) {
			console.log("Seeding Data from json file");

			// Load the JSON file
			// NOTE: Using ncrData2.json (team agreed on 2024-11-09)

			fetch("data/logData.json")
				.then((response) => {
					if (!response.ok) {
						throw new Error("Failed to load JSON file");
					}
					return response.json();
				})
				.then((data) => {
					// Save to localStorage
					localStorage.setItem(this.STORAGE_KEYS.NCRS, JSON.stringify(data));
					// console.log('Loaded', data.length, 'NCRs from ncrData2.json');
					// console.log('Sample NCR:', data[0].ncrNumber, '-', data[0].supplierName);

					// Trigger a custom event so other code knows data is loaded
					window.dispatchEvent(new Event("ncr-data-loaded"));
				})
				.catch((error) => {
					console.error("Error loading", error);
					// Initialize with empty array as fallback
					localStorage.setItem(this.STORAGE_KEYS.NCRS, JSON.stringify([]));
				});
		} else {
			console.log("Data already exists in localStorage");
			const ncrs = JSON.parse(existing);
			console.log("Total NCRs:", ncrs.length);

			// Data already loaded, dispatch event immediately
			setTimeout(() => {
				window.dispatchEvent(new Event("ncr-data-loaded"));
			}, 0);
		}

		// Set default user
		if (!localStorage.getItem(this.STORAGE_KEYS.CURRENT_USER)) {
			localStorage.setItem(this.STORAGE_KEYS.CURRENT_USER, "Emma Johnson");
		}
	},

	/**
	 * Generate next NCR number in format YYYY-XXX
	 */
	generateNCRNumber() {
		const year = new Date().getFullYear();
		const allNCRs = this.getAllNCRs();

		// Filter NCRs from current year
		const currentYearNCRs = allNCRs.filter(
			(ncr) => ncr.ncrNumber && ncr.ncrNumber.startsWith(year.toString())
		);

		// Get next sequential number
		if (currentYearNCRs.length === 0) {
			// No NCRs this year, start with 001
			return `${year}-001`;
		}

		// Extract numbers from NCR numbers
		const numbers = currentYearNCRs.map((ncr) => {
			const parts = ncr.ncrNumber.split("-");
			return parseInt(parts[1]);
		});

		// Find highest number
		const highestNumber = Math.max(...numbers);

		// Next number
		const nextNumber = highestNumber + 1;

		// Format with leading zeros
		const formatted = String(nextNumber).padStart(3, "0");

		return `${year}-${formatted}`;
	},

	/**
	 * Get current user (placeholder until login system)
	 */
	getCurrentUser() {
		return (
			localStorage.getItem(this.STORAGE_KEYS.CURRENT_USER) || "Emma Johnson"
		);
	},

	/**
	 * Get all NCRs from localStorage
	 */
	getAllNCRs() {
		const data = localStorage.getItem(this.STORAGE_KEYS.NCRS);
		return data ? JSON.parse(data) : [];
	},

	/**
	 * Get NCR by ID
	 */
	getNCRById(id) {
		const ncrs = this.getAllNCRs();
		return ncrs.find((ncr) => ncr.id === id);
	},

	/**
	 * Get NCR by NCR Number
	 */
	getNCRByNumber(ncrNumber) {
		const ncrs = this.getAllNCRs();
		return ncrs.find((ncr) => ncr.ncrNumber === ncrNumber);
	},

	/**
	 * Save new NCR to localStorage
	 */
	saveNCR(ncrData) {
		const ncrs = this.getAllNCRs();

		// Generate unique ID if not exists
		if (!ncrData.id) {
			ncrData.id = this.generateUniqueId();
		}

		// Add timestamps
		if (!ncrData.dateCreated) {
			ncrData.dateCreated = new Date().toISOString();
		}
		ncrData.lastModified = new Date().toISOString();

		// Add to array
		ncrs.push(ncrData);

		// Save to localStorage
		localStorage.setItem(this.STORAGE_KEYS.NCRS, JSON.stringify(ncrs));

		console.log("✅ NCR saved:", ncrData.ncrNumber);
		return ncrData;
	},

	/**
	 * Update existing NCR
	 */
	updateNCR(id, updates) {
		const ncrs = this.getAllNCRs();
		const index = ncrs.findIndex((ncr) => ncr.id === id);

		if (index !== -1) {
			// Merge updates with existing data
			ncrs[index] = {
				...ncrs[index],
				...updates,
				lastModified: new Date().toISOString(),
			};

			// Save back to localStorage
			localStorage.setItem(this.STORAGE_KEYS.NCRS, JSON.stringify(ncrs));

			console.log("NCR updated:", ncrs[index].ncrNumber);
			return ncrs[index];
		}

		console.error("NCR not found:", id);
		return null;
	},

	/**
	 * Generate unique ID
	 */
	generateUniqueId() {
		return "ncr_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
	},

	/**
	 * Clear all data (for testing)
	 */
	clearAllData() {
		localStorage.removeItem(this.STORAGE_KEYS.NCRS);
		localStorage.removeItem(this.STORAGE_KEYS.CURRENT_USER);
		console.log("All data cleared");
	},
	/**
	 * Create NCR object from form data with all required fields
	 */
	createNCRFromFormData(formData) {
		const now = new Date().toISOString();
		const today = new Date().toISOString().split("T")[0];

		return {
			// Core IDs
			id: this.generateUniqueId(),
			ncrNumber: this.generateNCRNumber(),

			// Order Info
			poNumber: formData.poNumber || "",
			salesOrderNumber: formData.salesOrderNumber || "",

			// Supplier Info
			supplierName: formData.supplierName || "",

			// Item Details
			itemDescription: formData.itemDescription || "",
			processType: formData.processType || "supplier",

			// Defect Info
			defectDescription: formData.defectDescription || "",
			quantityReceived: parseInt(formData.quantityReceived) || 0,
			quantityDefective: parseInt(formData.quantityDefective) || 0,
			itemStatus: formData.itemStatus || "nonconforming",
			itemMarkedNonconforming: formData.itemStatus === "nonconforming",

			// Quality Assessment
			engineeringRequired: formData.engineeringRequired || false,
			qualityCompleted: true,
			qualityCompletedAt: now,

			// Audit Trail
			createdBy: this.getCurrentUser(),
			createdByEmail: "emma.johnson@crossfire.com",
			dateCreated: now,
			lastModified: now,
			inspectionDate: today,
			inspectorId: "EJ001",

			// Status
			status: "Active",
			currentStage: formData.engineeringRequired ? "engineering" : "operations",

			// Future fields (for later prototypes)
			closedBy: null,
			closedByEmail: null,
			dateClosed: null,
			resolutionSummary: null,
		};
	},
};

// Initialize when script loads
NCRDataManager.init();
