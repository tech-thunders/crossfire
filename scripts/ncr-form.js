/**
 * NCR Form Handler
 * Handles form auto-fill, validation, and submission
 */

const NCRFormHandler = {
    /**
     * Initialize the form
     */
   init() {
    console.log('Initializing NCR Form');

    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('id');    
    
       if (editId) {
        // EDIT MODE
        console.log('Edit mode detected, ID:', editId);
        this.editMode = true;
        this.editingId = editId;
        
        // Wait for data, then load NCR
        const existingData = localStorage.getItem('ncr_records');
        if (existingData && existingData !== '[]') {
            this.loadNCRForEditing(editId);
        } else {
            window.addEventListener('ncr-data-loaded', () => {
                this.loadNCRForEditing(editId);
            });
        }
    } else {
        // CREATE MODE
        console.log('Create mode');
        this.editMode = false;
        this.editingId = null;
        
        // Check if data is already loaded in localStorage
        const existingData = localStorage.getItem('ncr_records');
        
        if (existingData && existingData !== '[]') {
            console.log('Data already in localStorage, filling values now...');
            this.fillAutoValues();
        } else {
            console.log('No data yet, waiting for JSON to load...');
            window.addEventListener('ncr-data-loaded', () => {
                console.log('Data loaded event received!');
                this.fillAutoValues();
            });
        }
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
        console.log('Auto-filling values...');
        
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
        
        console.log('Auto-fill complete!');
    },
/**
 * Load NCR data for editing
 */
loadNCRForEditing(id) {
    console.log('Loading NCR for editing:', id);
    
    // Get NCR from data manager
    const ncr = NCRDataManager.getNCRById(id);
    
    if (!ncr) {
        console.error('NCR not found:', id);
        alert('NCR not found!');
        window.location.href = 'index.html';
        return;
    }
    
    console.log('NCR loaded:', ncr.ncrNumber);
    
    // Fill header (read-only fields)
    document.getElementById('ncr-number-display').textContent = ncr.ncrNumber;
    document.getElementById('created-by-display').textContent = ncr.createdBy;
    document.getElementById('date-created-display').textContent = this.formatDate(new Date(ncr.dateCreated));
    
    // Fill form fields
    document.getElementById('po_number').value = ncr.poNumber || '';
    document.getElementById('sales_order').value = ncr.salesOrderNumber || '';
    document.getElementById('supplier_name').value = ncr.supplierName || '';
    document.getElementById('item_description').value = ncr.itemDescription || '';
    
    // Set process type radio
    if (ncr.processType === 'supplier') {
        document.getElementById('process_supplier').checked = true;
    } else {
        document.getElementById('process_wip').checked = true;
    }
    
    document.getElementById('qty_received').value = ncr.quantityReceived || '';
    document.getElementById('qty_defective').value = ncr.quantityDefective || '';
    document.getElementById('defect_description').value = ncr.defectDescription || '';
    
    // Set item status radio
    if (ncr.itemStatus === 'conforming') {
        document.getElementById('status_conforming').checked = true;
    } else {
        document.getElementById('status_nonconforming').checked = true;
    }
    
    // Set engineering required checkbox
    document.getElementById('engineering_required').checked = ncr.engineeringRequired || false;
    
    console.log('Form populated with NCR data');
},


    /**
     * Setup validation listeners
     */
    setupValidation() {
        console.log('Setting up validation...');
        
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
            console.log('Form validation passed!');
        } else {
            console.log('Form validation failed!');
            
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
            console.log('Please fix errors before submitting');
        }
    });
}
        
        // Save draft button
        if (saveDraftBtn) {
            saveDraftBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Saving draft');
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
        console.log('Showing preview modal');
        
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
        console.log('Closing preview modal');
        
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
    
    try {
        // Collect form data
        const formData = this.collectFormData();
        
        if (this.editMode) {
            // UPDATE MODE - Update existing NCR
            console.log('✏️ Updating existing NCR:', this.editingId);
            
            // Get existing NCR
            const existingNCR = NCRDataManager.getNCRById(this.editingId);
            
            // Create updated NCR object (keep original metadata)
            const updatedNCR = {
                ...existingNCR,
                // Update with form data
                poNumber: formData.poNumber,
                salesOrderNumber: formData.salesOrderNumber,
                supplierName: formData.supplierName,
                itemDescription: formData.itemDescription,
                processType: formData.processType,
                quantityReceived: parseInt(formData.quantityReceived),
                quantityDefective: parseInt(formData.quantityDefective),
                defectDescription: formData.defectDescription,
                itemStatus: formData.itemStatus,
                itemMarkedNonconforming: formData.itemStatus === 'nonconforming',
                engineeringRequired: formData.engineeringRequired,
                // Update stage if engineering requirement changed
                currentStage: formData.engineeringRequired ? 'engineering' : 'operations',
                // Update timestamp
                lastModified: new Date().toISOString()
            };
            
            // Update in localStorage
            NCRDataManager.updateNCR(this.editingId, updatedNCR);
            
            // Close modal
            this.closePreviewModal();
            
            // Show success message
            this.showSuccessToast(`NCR ${updatedNCR.ncrNumber} updated successfully!`);
            
            // Redirect after 2 seconds
            setTimeout(() => {
                window.location.href = 'view-ncr.html';
            }, 2000);
            
        } else {
            // CREATE MODE - Create new NCR
            console.log('✨ Creating new NCR');
            
            // Create NCR object with all fields
            const newNCR = NCRDataManager.createNCRFromFormData(formData);
            
            // Save to localStorage
            NCRDataManager.saveNCR(newNCR);
            
            // Close modal
            this.closePreviewModal();
            
            // Show success message
            this.showSuccessToast(`NCR ${newNCR.ncrNumber} saved successfully!`);
            
            // Redirect after 2 seconds
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        }
        
    } catch (error) {
        console.error('❌ Error saving NCR:', error);
        this.closePreviewModal();
        this.showErrorToast('Failed to save NCR. Please try again.');
    }
},
/**
 * Show success toast notification
 */
showSuccessToast(message) {
    this.showToast(message, 'success');
},

/**
 * Show error toast notification
 */
showErrorToast(message) {
    this.showToast(message, 'error');
},
/**
 * Show toast notification
 */
showToast(message, type = 'success') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="bi bi-${type === 'success' ? 'check-circle-fill' : 'exclamation-circle-fill'}"></i>
        <span>${message}</span>
    `;
    
    // Add to body
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}    

};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    NCRFormHandler.init();
});