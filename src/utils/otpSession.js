// Stores the Firebase confirmation object in memory (not in navigation params)
// because passing non-serializable objects through navigation causes warnings.
let _confirmation = null;
let _formData = null;

export const otpSession = {
    setConfirmation: (c) => { _confirmation = c; },
    getConfirmation: () => _confirmation,
    setFormData: (d) => { _formData = d; },
    getFormData: () => _formData,
    clear: () => { _confirmation = null; _formData = null; },
};
