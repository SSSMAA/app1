// frontend/src/components/RegistrationForm.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * @typedef {Object} FormData
 * @property {string} fullName - The full name of the registrant.
 * @property {string} age - The age of the registrant.
 * @property {string} phone - The phone number of the registrant.
 * @property {string} subject - The subject chosen by the registrant.
 */

/**
 * @typedef {Object} FormErrors
 * @property {string=} fullName - Error message for full name field.
 * @property {string=} age - Error message for age field.
 * @property {string=} phone - Error message for phone field.
 * @property {string=} subject - Error message for subject field.
 */

/**
 * RegistrationForm component handles user input for course registration.
 * It includes client-side validation and submits data to a backend API.
 * It also provides user feedback during and after submission.
 */
const RegistrationForm = () => {
  const { t } = useTranslation();

  /** @type {[FormData, React.Dispatch<React.SetStateAction<FormData>>]} */
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    phone: '',
    subject: '',
  });

  /** @type {[FormErrors, React.Dispatch<React.SetStateAction<FormErrors>>]} */
  const [errors, setErrors] = useState({});

  /** @type {[string, React.Dispatch<React.SetStateAction<string>>]} */
  const [submissionStatus, setSubmissionStatus] = useState(''); // User feedback message for submission status.

  /**
   * Handles input changes for form fields.
   * Updates the corresponding field in `formData`.
   * Clears any existing validation error for the field being changed.
   * Clears the overall submission status message.
   * @param {React.ChangeEvent<HTMLInputElement | HTMLSelectElement>} e - The input change event.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prevErrors => ({ ...prevErrors, [name]: '' }));
    }
    setSubmissionStatus(''); // Clear submission status on new input
  };

  /**
   * Validates the current form data.
   * Sets error messages in the `errors` state for any invalid fields.
   * Uses translation keys for error messages.
   * @returns {boolean} True if the form is valid, false otherwise.
   */
  const validateForm = () => {
    /** @type {FormErrors} */
    let formErrors = {};
    if (!formData.fullName.trim()) formErrors.fullName = t('validation.fullNameRequired');
    if (!formData.age) {
      formErrors.age = t('validation.ageRequired');
    } else if (isNaN(Number(formData.age)) || Number(formData.age) <= 0) { // Ensure age is a number before isNaN check
      formErrors.age = t('validation.ageInvalid');
    }
    if (!formData.phone.trim()) {
      formErrors.phone = t('validation.phoneRequired');
    } else if (!/^[0-9\s+-]+$/.test(formData.phone)) {
      formErrors.phone = t('validation.phoneInvalid');
    }
    if (!formData.subject) formErrors.subject = t('validation.subjectRequired');

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  /**
   * Handles the form submission.
   * Prevents default form submission, validates the form, and if valid,
   * sends a POST request to the `/api/register` endpoint.
   * Updates `submissionStatus` and `errors` based on the API response.
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionStatus(''); // Reset status

    if (!validateForm()) {
      setSubmissionStatus(t('validation.formError'));
      return;
    }

    setSubmissionStatus(t('submissionStatus.submitting'));
    try {
      const response = await fetch('/api/register', { // Proxied request
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json();

      if (response.ok) { // Typically 2xx status codes
        setSubmissionStatus(t('submissionStatus.success')); // Example key, add to JSON
        console.log('Registration successful:', responseData);
        setFormData({ fullName: '', age: '', phone: '', subject: '' }); // Reset form
        setErrors({});
      } else {
        // Handle errors from server (e.g., validation errors, server issues)
        const errorMsg = responseData.msg || t('submissionStatus.generalError'); // Example key, add to JSON
        const serverErrors = responseData.errors; // Array of error messages from backend validation

        /** @type {FormErrors} */
        let newErrors = { ...errors }; // Start with existing client-side errors (if any)
        if (serverErrors && Array.isArray(serverErrors)) {
            // Attempt to map server errors to form fields if possible (simplified mapping)
            serverErrors.forEach(errMsg => {
                if (errMsg.toLowerCase().includes('name') || errMsg.toLowerCase().includes('nom')) newErrors.fullName = errMsg;
                else if (errMsg.toLowerCase().includes('age') || errMsg.toLowerCase().includes('âge')) newErrors.age = errMsg;
                else if (errMsg.toLowerCase().includes('phone') || errMsg.toLowerCase().includes('téléphone')) newErrors.phone = errMsg;
                else if (errMsg.toLowerCase().includes('subject') || errMsg.toLowerCase().includes('matière')) newErrors.subject = errMsg;
            });
        }
         setErrors(newErrors);
        setSubmissionStatus(`${t('submissionStatus.failurePrefix')} ${errorMsg} ${serverErrors ? serverErrors.join(', ') : ''}`); // Example key
        console.error('Registration failed:', responseData);
      }
    } catch (error) {
      setSubmissionStatus(t('submissionStatus.networkError')); // Example key, add to JSON
      console.error('Network error or server is down:', error);
    }
  };

  return (
    <section id="registration" className="py-12 md:py-16 bg-gray-50">
      <div className="container mx-auto px-6">
        <h3 className="text-3xl font-bold text-center mb-8 text-gray-700">
          {t('registrationFormTitle')}
        </h3>
        <form
          onSubmit={handleSubmit}
          className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-lg"
          noValidate
        >
          {/* Full Name */}
          <div className="mb-6">
            <label htmlFor="fullName" className="block text-gray-700 font-semibold mb-2">{t('fullNameLabel')}</label>
            <input type="text" name="fullName" id="fullName" value={formData.fullName} onChange={handleChange} className={`w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`} required />
            {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
          </div>

          {/* Age */}
          <div className="mb-6">
            <label htmlFor="age" className="block text-gray-700 font-semibold mb-2">{t('ageLabel')}</label>
            <input type="number" name="age" id="age" value={formData.age} onChange={handleChange} className={`w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.age ? 'border-red-500' : 'border-gray-300'}`} required min="1"/>
            {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
          </div>

          {/* Phone Number */}
          <div className="mb-6">
            <label htmlFor="phone" className="block text-gray-700 font-semibold mb-2">{t('phoneLabel')}</label>
            <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} className={`w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`} required />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>

          {/* Subject/Course Choice */}
          <div className="mb-6">
            <label htmlFor="subject" className="block text-gray-700 font-semibold mb-2">{t('subjectLabel')}</label>
            <select name="subject" id="subject" value={formData.subject} onChange={handleChange} className={`w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.subject ? 'border-red-500' : 'border-gray-300'}`} required>
              <option value="">{t('subjectOptionDefault')}</option>
              <option value="programmation_python">{t('subjectOptionPython')}</option>
              <option value="robotique_arduino">{t('subjectOptionRobotics')}</option>
              <option value="developpement_web_html_css">{t('subjectOptionWeb')}</option>
              <option value="scratch_debutant">{t('subjectOptionScratch')}</option>
              <option value="autre">{t('subjectOptionOther')}</option>
            </select>
            {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
          </div>

          {/* Submission Status Message */}
          {submissionStatus && (
            <div className={`mb-4 p-3 rounded-lg text-center ${
              submissionStatus.startsWith(t('submissionStatus.success').substring(0,10)) ? 'bg-green-100 text-green-700' : // Check prefix
              (submissionStatus.startsWith(t('submissionStatus.failurePrefix').substring(0,5)) || submissionStatus.startsWith(t('submissionStatus.networkError').substring(0,5)) || submissionStatus.startsWith(t('validation.formError').substring(0,5))) ? 'bg-red-100 text-red-700' :
              'bg-blue-100 text-blue-700' // For "Soumission en cours..." or other neutral messages
            }`}>
              {submissionStatus}
            </div>
          )}

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg transition duration-300"
              disabled={submissionStatus === t('submissionStatus.submitting')} // Disable button during submission
            >
              {submissionStatus === t('submissionStatus.submitting') ? t('submissionStatus.sending') : t('submitBtn')}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default RegistrationForm;
