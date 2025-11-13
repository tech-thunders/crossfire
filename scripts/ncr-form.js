/**
 * NCR Form Handler
 * Handles form auto-fill, validation, and submission
 */

const NCRFormHandler = {
    /**
     * Initialize the form
     */
   init() {
    console.log('📝 Initializing NCR Form...');
    
    // Check if data is already loaded in localStorage
    const existingData = localStorage.getItem('ncr_records');
    
    if (existingData && existingData !== '[]') {
        // Data already exists - fill values immediately
        console.log('✅ Data already in localStorage, filling values now...');
        this.fillAutoValues();
    } else {
        // Data not loaded yet - wait for the load event
        console.log('⏳ No data yet, waiting for JSON to load...');
        window.addEventListener('ncr-data-loaded', () => {
            console.log('✅ Data loaded event received!');
            this.fillAutoValues();
        });
    }
    
    // Setup form validation
    this.setupValidation();
    
    // Setup form submission
    this.setupFormSubmission();
},

    /**
     * Auto-fill NCR number, date, and user
     */
    fillAutoValues() {
        console.log('🔄 Auto-filling values...');
        
        // 1. Generate NCR number
        const ncrNumber = NCRDataManager.generateNCRNumber();
        console.log('   NCR Number:', ncrNumber);
        
        // 2. Get current date
        const today = new Date();
        const formattedDate = this.formatDate(today);
        console.log('   Date:', formattedDate);
        
        // 3. Get current user
        const currentUser = NCRDataManager.getCurrentUser();
        console.log('   User:', currentUser);
        
        // 4. Show total existing NCRs
        const totalNCRs = NCRDataManager.getAllNCRs().length;
        console.log('   Existing NCRs:', totalNCRs);
        
        // 5. Update the HTML
        const ncrElement = document.getElementById('ncr-number-display');
        const dateElement = document.getElementById('date-created-display');
        const userElement = document.getElementById('created-by-display');
        
        if (ncrElement) {
            ncrElement.textContent = ncrNumber;
        }
        
        if (dateElement) {
            dateElement.textContent = formattedDate;
            dateElement.setAttribute('datetime', today.toISOString().split('T')[0]);
        }
        
        if (userElement) {
            userElement.textContent = currentUser;
        }
        
        console.log('✅ Auto-fill complete!');
    },

    /**
     * Setup validation listeners
     */
    setupValidation() {
        console.log('🔒 Setting up validation...');
        
        // Get all required fields
        const requiredFields = [
            'po_number',
            'sales_order',
            'supplier_name',
            'item_description',
            'qty_received',
            'qty_defective',
            'defect_description'
        ];
        
        // Add blur event (when user leaves field)
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('blur', () => {
                    this.validateField(fieldId);
                });
                
                // Also validate on input (real-time)
                field.addEventListener('input', () => {
                    this.clearFieldError(fieldId);
                });
            }
        });
        
        // Validate quantities in real-time
        const qtyReceived = document.getElementById('qty_received');
        const qtyDefective = document.getElementById('qty_defective');
        
        if (qtyReceived && qtyDefective) {
            qtyReceived.addEventListener('input', () => this.validateQuantities());
            qtyDefective.addEventListener('input', () => this.validateQuantities());
        }
    },

    /**
     * Validate a single field
     */
    validateField(fieldId) {
        const field = document.getElementById(fieldId);
        const errorElement = document.getElementById(fieldId + '_error');
        
        if (!field) return true;
        
        // Check if field is empty
        const value = field.value.trim();
        
        if (value === '') {
            // Show error
            field.classList.add('error');
            field.classList.remove('success');
            if (errorElement) {
                errorElement.classList.add('show');
            }
            return false;
        } else {
            // Clear error
            field.classList.remove('error');
            field.classList.add('success');
            if (errorElement) {
                errorElement.classList.remove('show');
            }
            return true;
        }
    },

    /**
     * Clear field error
     */
    clearFieldError(fieldId) {
        const field = document.getElementById(fieldId);
        const errorElement = document.getElementById(fieldId + '_error');
        
        if (field && field.value.trim() !== '') {
            field.classList.remove('error');
            if (errorElement) {
                errorElement.classList.remove('show');
            }
        }
    },

    /**
     * Validate quantities (defective <= received)
     */
    validateQuantities() {
        const qtyReceived = document.getElementById('qty_received');
        const qtyDefective = document.getElementById('qty_defective');
        const errorElement = document.getElementById('qty_validation_error');
        
        if (!qtyReceived || !qtyDefective) return true;
        
        const received = parseInt(qtyReceived.value) || 0;
        const defective = parseInt(qtyDefective.value) || 0;
        
        if (defective > received) {
            // Show error
            qtyDefective.classList.add('error');
            if (errorElement) {
                errorElement.classList.add('show');
            }
            return false;
        } else {
            // Clear error
            qtyDefective.classList.remove('error');
            if (errorElement) {
                errorElement.classList.remove('show');
            }
            return true;
        }
    },

    /**
     * Validate radio button groups
     */
    validateRadioGroup(groupName) {
        const radios = document.querySelectorAll(`input[name="${groupName}"]`);
        const errorElement = document.getElementById(groupName + '_error');
        const radioGroup = document.querySelector(`input[name="${groupName}"]`)?.closest('.radio-group');
        
        let isChecked = false;
        radios.forEach(radio => {
            if (radio.checked) {
                isChecked = true;
            }
        });
        
        if (!isChecked) {
            // Show error
            if (radioGroup) {
                radioGroup.classList.add('error');
            }
            if (errorElement) {
                errorElement.classList.add('show');
            }
            return false;
        } else {
            // Clear error
            if (radioGroup) {
                radioGroup.classList.remove('error');
            }
            if (errorElement) {
                errorElement.classList.remove('show');
            }
            return true;
        }
    },

    /**
     * Validate entire form
     */
    validateForm() {
        console.log('🔍 Validating form...');
        
        let isValid = true;
        
        // Validate text fields
        const requiredFields = [
            'po_number',
            'sales_order',
            'supplier_name',
            'item_description',
            'qty_received',
            'qty_defective',
            'defect_description'
        ];
        
        requiredFields.forEach(fieldId => {
            if (!this.validateField(fieldId)) {
                isValid = false;
            }
        });
        
        // Validate radio groups
        if (!this.validateRadioGroup('process_type')) {
            isValid = false;
        }
        
        if (!this.validateRadioGroup('item_status')) {
            isValid = false;
        }
        
        // Validate quantities
        if (!this.validateQuantities()) {
            isValid = false;
        }
        
        if (isValid) {
            console.log('✅ Form validation passed!');
        } else {
            console.log('❌ Form validation failed!');
            
            // Scroll to first error
            const firstError = document.querySelector('.error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstError.classList.add('shake');
                setTimeout(() => {
                    firstError.classList.remove('shake');
                }, 300);
            }
        }
        
        return isValid;
    },

    /**
     * Setup form submission
     */
    setupFormSubmission() {
        const submitBtn = document.getElementById('submitForm');
        const saveDraftBtn = document.getElementById('saveDraft');
        const form = document.querySelector('form');
        
        // Prevent default form submission
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
            });
        }
        
        // Submit button
        if (submitBtn) {
    submitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        if (this.validateForm()) {
            console.log('✅ Form is valid! Showing preview...');
            this.showPreviewModal();  // ← Show modal instead of alert!
        } else {
            console.log('❌ Please fix errors before submitting');
        }
    });
}
        
        // Save draft button
        if (saveDraftBtn) {
            saveDraftBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('💾 Saving draft...');
                alert('Save draft feature coming next!');
                // Later: Save as draft (no validation required)
            });
        }
    },

    /**
     * Format date as "Nov 09, 2025"
     */
    formatDate(date) {
        const options = {
            year: 'numeric',
            month: 'short',
            day: '2-digit'
        };
        return date.toLocaleDateString('en-US', options);
    },
     /**
     * Show preview modal with form data
     */
    showPreviewModal() {
        console.log('👁️ Showing preview modal...');
        
        // Get all form values
        const formData = this.collectFormData();
        
        // Populate modal with data
        document.getElementById('preview-ncr-number').textContent = formData.ncrNumber;
        document.getElementById('preview-date').textContent = formData.dateCreated;
        document.getElementById('preview-user').textContent = formData.createdBy;
        document.getElementById('preview-po').textContent = formData.poNumber;
        document.getElementById('preview-so').textContent = formData.salesOrderNumber;
        document.getElementById('preview-supplier').textContent = formData.supplierName;
        document.getElementById('preview-item').textContent = formData.itemDescription;
        document.getElementById('preview-process').textContent = formData.processType === 'supplier' ? 'Supplier / Receiving-Inspection' : 'WIP (Production Order)';
        document.getElementById('preview-qty-received').textContent = formData.quantityReceived;
        document.getElementById('preview-qty-defective').textContent = formData.quantityDefective;
        document.getElementById('preview-defect').textContent = formData.defectDescription;
        document.getElementById('preview-item-status').textContent = formData.itemStatus === 'conforming' ? 'Conforming' : 'Non-Conforming';
        document.getElementById('preview-engineering').textContent = formData.engineeringRequired ? 'Yes' : 'No';
        
        // Show modal
        const modal = document.getElementById('preview-modal');
        modal.classList.add('show');
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        // Close on ESC key
        document.addEventListener('keydown', this.handleEscKey);
        
        // Close on outside click
        modal.addEventListener('click', this.handleOutsideClick);
    },

    /**
     * Close preview modal
     */
    closePreviewModal() {
        console.log('❌ Closing preview modal...');
        
        const modal = document.getElementById('preview-modal');
        modal.classList.remove('show');
        
        // Re-enable body scroll
        document.body.style.overflow = 'auto';
        
        // Remove event listeners
        document.removeEventListener('keydown', this.handleEscKey);
        modal.removeEventListener('click', this.handleOutsideClick);
    },

    /**
     * Handle ESC key to close modal
     */
    handleEscKey(e) {
        if (e.key === 'Escape') {
            NCRFormHandler.closePreviewModal();
        }
    },

    /**
     * Handle click outside modal to close
     */
    handleOutsideClick(e) {
        if (e.target.id === 'preview-modal') {
            NCRFormHandler.closePreviewModal();
        }
    },

    /**
     * Collect all form data
     */
    collectFormData() {
        const processType = document.querySelector('input[name="process_type"]:checked');
        const itemStatus = document.querySelector('input[name="item_status"]:checked');
        const engineeringRequired = document.getElementById('engineering_required').checked;
        
        return {
            // Auto-generated
            ncrNumber: document.getElementById('ncr-number-display').textContent,
            dateCreated: document.getElementById('date-created-display').textContent,
            createdBy: document.getElementById('created-by-display').textContent,
            
            // From form
            poNumber: document.getElementById('po_number').value.trim(),
            salesOrderNumber: document.getElementById('sales_order').value.trim(),
            supplierName: document.getElementById('supplier_name').value.trim(),
            itemDescription: document.getElementById('item_description').value.trim(),
            processType: processType ? processType.value : '',
            quantityReceived: document.getElementById('qty_received').value,
            quantityDefective: document.getElementById('qty_defective').value,
            defectDescription: document.getElementById('defect_description').value.trim(),
            itemStatus: itemStatus ? itemStatus.value : '',
            engineeringRequired: engineeringRequired
        };
    },

    /**
     * Confirm and save NCR
     */
    confirmAndSave() {
        console.log('💾 Saving NCR...');
        
        // Close modal
        this.closePreviewModal();
        
        // TODO: Actually save the NCR
        alert('Save functionality coming next! 🎉');
    }

};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    NCRFormHandler.init();
});