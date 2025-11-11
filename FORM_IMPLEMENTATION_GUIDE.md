# Form Implementation Guide

This guide explains how to implement and render forms created in the Contentstack Form Builder custom field on your website.

## Table of Contents

1. [Form Configuration Structure](#form-configuration-structure)
2. [TypeScript Types](#typescript-types)
3. [Backend API](#backend-api)
4. [Frontend Implementation](#frontend-implementation)
5. [Form Rendering](#form-rendering)
6. [Form Submission](#form-submission)
7. [Validation](#validation)
8. [Styling](#styling)

---

## Form Configuration Structure

When you select a form in the Contentstack custom field, it saves the following structure:

```json
{
  "formId": "uuid-here",
  "formName": "Contact Form",
  "formDescription": "Get in touch with us",
  "formConfig": {
    "name": "Contact Form",
    "description": "Get in touch with us",
    "fields": [
      {
        "id": "field-1",
        "type": "text",
        "label": "Full Name",
        "placeholder": "Enter your name",
        "required": true,
        "columnSpan": 12,
        "visualRow": 1,
        "mappedField": "full_name"
      },
      {
        "id": "field-2",
        "type": "email",
        "label": "Email Address",
        "placeholder": "your@email.com",
        "required": true,
        "columnSpan": 6,
        "visualRow": 2,
        "mappedField": "email"
      }
    ],
    "submitConfig": {
      "webServiceId": "uuid-here",
      "successMessage": "Thank you for your submission!",
      "errorMessage": "Something went wrong. Please try again."
    },
    "createdAt": "2025-11-09T...",
    "updatedAt": "2025-11-09T..."
  }
}
```

---

## TypeScript Types

### Core Types

```typescript
// Field option for select, radio, and checkbox fields
interface FieldOption {
  label: string;
  value: string;
  defaultChecked?: boolean; // For checkbox fields only
}

// Validation rules
interface ValidationRules {
  min?: number;      // Min length for text, min value for number, min date
  max?: number;      // Max length for text, max value for number, max date
  pattern?: string;  // Regex pattern for text validation
}

// Individual form field
interface FormField {
  id: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date';
  label: string;
  placeholder?: string;
  required?: boolean;
  columnSpan: number;        // 1-12 (based on 12-column grid)
  visualRow: number;         // Row number for layout
  mappedField?: string;      // Field name in web service/database
  options?: FieldOption[];   // For select, radio, checkbox
  validation?: ValidationRules;
  dateFormat?: string;       // For date fields (e.g., "MM/DD/YYYY")
  showDateFormatHelper?: boolean; // Show format hint below date field
}

// Submit configuration
interface SubmitConfig {
  webServiceId: string;
  successMessage?: string;
  errorMessage?: string;
}

// Complete form configuration
interface FormConfig {
  name: string;
  description?: string;
  fields: FormField[];
  submitConfig: SubmitConfig;
  createdAt: string;
  updatedAt: string;
}

// What Contentstack saves
interface FormFieldData {
  formId: string;
  formName: string;
  formDescription?: string;
  formConfig: FormConfig;
}
```

---

## Backend API

### Base URL

- **Local Development**: `http://localhost:3008`
- **Production**: `https://your-railway-url.up.railway.app`

### Endpoints

#### Health Check
```http
GET /health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-09T20:27:50.111Z",
  "service": "groundwork-services",
  "version": "1.0.0"
}
```

#### Submit Form
```http
POST /api/forms/:formId/submit
Content-Type: application/json

{
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone": "555-1234",
  "message": "Hello!"
}
```

**Request Body**: Object with keys matching the `mappedField` values from your form fields.

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Form submitted successfully"
}
```

**Error Response (400/500)**:
```json
{
  "error": "Error message here"
}
```

---

## Frontend Implementation

### 1. Environment Configuration

Create a `.env` file (or `.env.local`):

```bash
# Backend API URL
VITE_API_URL=http://localhost:3008
# or for production:
# VITE_API_URL=https://your-railway-url.up.railway.app

# Or if using Next.js:
NEXT_PUBLIC_API_URL=http://localhost:3008
```

### 2. API Client

Create a utility for API calls:

```typescript
// utils/api.ts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3008';

export async function submitForm(formId: string, data: Record<string, any>) {
  const response = await fetch(`${API_URL}/api/forms/${formId}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Submission failed' }));
    throw new Error(error.error || 'Failed to submit form');
  }

  return response.json();
}
```

---

## Form Rendering

### React Component Example

```typescript
// components/DynamicForm.tsx
import React, { useState } from 'react';
import { submitForm } from '../utils/api';
import type { FormConfig, FormField } from '../types/form';

interface DynamicFormProps {
  formData: {
    formId: string;
    formConfig: FormConfig;
  };
}

export function DynamicForm({ formData }: DynamicFormProps) {
  const { formId, formConfig } = formData;
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Group fields by visualRow
  const fieldsByRow = formConfig.fields.reduce((acc, field) => {
    const row = field.visualRow || 1;
    if (!acc[row]) acc[row] = [];
    acc[row].push(field);
    return acc;
  }, {} as Record<number, FormField[]>);

  const rows = Object.keys(fieldsByRow)
    .map(Number)
    .sort((a, b) => a - b);

  const handleChange = (field: FormField, value: any) => {
    const fieldName = field.mappedField || field.id;
    setFormValues(prev => ({ ...prev, [fieldName]: value }));
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
    }
  };

  const validateField = (field: FormField, value: any): string | null => {
    const { validation, required, type } = field;

    // Required validation
    if (required && !value) {
      return `${field.label} is required`;
    }

    if (!value || !validation) return null;

    // Type-specific validation
    if (type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Please enter a valid email address';
      }
    }

    if (type === 'tel') {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(value)) {
        return 'Please enter a valid phone number';
      }
    }

    // Min/Max validation
    if (validation.min !== undefined) {
      if (type === 'text' || type === 'textarea') {
        if (value.length < validation.min) {
          return `Minimum ${validation.min} characters required`;
        }
      } else if (type === 'number') {
        if (Number(value) < validation.min) {
          return `Minimum value is ${validation.min}`;
        }
      }
    }

    if (validation.max !== undefined) {
      if (type === 'text' || type === 'textarea') {
        if (value.length > validation.max) {
          return `Maximum ${validation.max} characters allowed`;
        }
      } else if (type === 'number') {
        if (Number(value) > validation.max) {
          return `Maximum value is ${validation.max}`;
        }
      }
    }

    // Pattern validation
    if (validation.pattern) {
      const regex = new RegExp(validation.pattern);
      if (!regex.test(value)) {
        return 'Invalid format';
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors: Record<string, string> = {};
    formConfig.fields.forEach(field => {
      const fieldName = field.mappedField || field.id;
      const value = formValues[fieldName];
      const error = validateField(field, value);
      if (error) {
        newErrors[fieldName] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit form
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      await submitForm(formId, formValues);
      setSubmitStatus('success');
      setFormValues({});
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const fieldName = field.mappedField || field.id;
    const value = formValues[fieldName] || '';
    const error = errors[fieldName];

    const commonProps = {
      id: field.id,
      name: fieldName,
      required: field.required,
      placeholder: field.placeholder,
      className: `form-input ${error ? 'error' : ''}`,
      'aria-invalid': !!error,
      'aria-describedby': error ? `${field.id}-error` : undefined,
    };

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            value={value}
            onChange={(e) => handleChange(field, e.target.value)}
            rows={4}
          />
        );

      case 'select':
        return (
          <select
            {...commonProps}
            value={value}
            onChange={(e) => handleChange(field, e.target.value)}
          >
            <option value="">-- Select --</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="radio-group">
            {field.options?.map((opt) => (
              <label key={opt.value} className="radio-label">
                <input
                  type="radio"
                  name={fieldName}
                  value={opt.value}
                  checked={value === opt.value}
                  onChange={(e) => handleChange(field, e.target.value)}
                  required={field.required}
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="checkbox-group">
            {field.options?.map((opt) => {
              // For checkboxes, value is an object with boolean values
              const checkboxValues = formValues[fieldName] || {};
              const isChecked = checkboxValues[opt.value] ?? opt.defaultChecked ?? false;

              return (
                <label key={opt.value} className="checkbox-label">
                  <input
                    type="checkbox"
                    name={`${fieldName}.${opt.value}`}
                    checked={isChecked}
                    onChange={(e) => {
                      const newCheckboxValues = {
                        ...checkboxValues,
                        [opt.value]: e.target.checked,
                      };
                      handleChange(field, newCheckboxValues);
                    }}
                  />
                  <span>{opt.label}</span>
                </label>
              );
            })}
          </div>
        );

      case 'date':
        return (
          <div>
            <input
              {...commonProps}
              type="text"
              value={value}
              onChange={(e) => handleChange(field, e.target.value)}
              placeholder={field.dateFormat || 'MM/DD/YYYY'}
            />
            {field.showDateFormatHelper && field.dateFormat && (
              <span className="field-helper">Format: {field.dateFormat}</span>
            )}
          </div>
        );

      default:
        return (
          <input
            {...commonProps}
            type={field.type}
            value={value}
            onChange={(e) => handleChange(field, e.target.value)}
          />
        );
    }
  };

  return (
    <div className="dynamic-form-container">
      <div className="form-header">
        <h2>{formConfig.name}</h2>
        {formConfig.description && <p>{formConfig.description}</p>}
      </div>

      <form onSubmit={handleSubmit} className="dynamic-form">
        {rows.map((rowNum) => (
          <div key={rowNum} className="form-row">
            {fieldsByRow[rowNum].map((field) => (
              <div
                key={field.id}
                className="form-field"
                style={{
                  gridColumn: `span ${field.columnSpan}`,
                }}
              >
                {field.label && (
                  <label htmlFor={field.id} className="field-label">
                    {field.label}
                    {field.required && <span className="required">*</span>}
                  </label>
                )}
                
                {renderField(field)}
                
                {errors[field.mappedField || field.id] && (
                  <span
                    id={`${field.id}-error`}
                    className="field-error"
                    role="alert"
                  >
                    {errors[field.mappedField || field.id]}
                  </span>
                )}
              </div>
            ))}
          </div>
        ))}

        {submitStatus === 'success' && (
          <div className="alert alert-success" role="alert">
            {formConfig.submitConfig.successMessage || 'Form submitted successfully!'}
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="alert alert-error" role="alert">
            {formConfig.submitConfig.errorMessage || 'Something went wrong. Please try again.'}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="submit-button"
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}
```

---

## Validation

### Client-Side Validation

The form component validates:
- **Required fields**: Checked on submit
- **Email format**: Using regex pattern
- **Phone format**: Basic pattern validation
- **Min/Max length**: For text fields
- **Min/Max value**: For number fields
- **Regex patterns**: Custom validation rules
- **Date formats**: Based on configured format

### Server-Side Validation

The backend API also validates:
- Form exists and is active
- Web service is configured
- Field mappings are correct
- Data types match expectations

---

## Styling

### CSS Example (using CSS Grid)

```css
/* Form Container */
.dynamic-form-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.form-header {
  margin-bottom: 2rem;
}

.form-header h2 {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.form-header p {
  color: #666;
  font-size: 1rem;
}

/* Form Grid */
.dynamic-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1rem;
}

/* Field Container */
.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-label {
  font-weight: 500;
  font-size: 0.875rem;
  color: #374151;
}

.field-label .required {
  color: #ef4444;
  margin-left: 0.25rem;
}

/* Input Styles */
.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input.error {
  border-color: #ef4444;
}

.form-input.error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

/* Textarea */
textarea.form-input {
  resize: vertical;
  min-height: 100px;
}

/* Select */
select.form-input {
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
  appearance: none;
}

/* Radio Buttons */
.radio-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.radio-label input[type="radio"] {
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
}

/* Checkboxes */
.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
}

/* Field Helper Text */
.field-helper {
  font-size: 0.875rem;
  color: #6b7280;
}

/* Error Message */
.field-error {
  font-size: 0.875rem;
  color: #ef4444;
}

/* Alerts */
.alert {
  padding: 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.alert-success {
  background-color: #d1fae5;
  color: #065f46;
  border: 1px solid #6ee7b7;
}

.alert-error {
  background-color: #fee2e2;
  color: #991b1b;
  border: 1px solid #fca5a5;
}

/* Submit Button */
.submit-button {
  padding: 0.75rem 2rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-button:hover {
  background-color: #2563eb;
}

.submit-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .form-field {
    grid-column: span 1 !important;
  }
}
```

---

## Tailwind CSS Example

If using Tailwind, here's the same component with Tailwind classes:

```typescript
// Replace className strings in the component above with:

// Container
<div className="max-w-7xl mx-auto px-4 py-8">

// Header
<div className="mb-8">
  <h2 className="text-3xl font-semibold mb-2">{formConfig.name}</h2>
  {formConfig.description && (
    <p className="text-gray-600">{formConfig.description}</p>
  )}
</div>

// Form
<form onSubmit={handleSubmit} className="space-y-6">

// Row
<div className="grid grid-cols-12 gap-4">

// Field
<div
  className="flex flex-col gap-2"
  style={{ gridColumn: `span ${field.columnSpan}` }}
>

// Label
<label className="text-sm font-medium text-gray-700">
  {field.label}
  {field.required && <span className="text-red-500 ml-1">*</span>}
</label>

// Input
<input
  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    error ? 'border-red-500' : 'border-gray-300'
  }`}
/>

// Textarea
<textarea
  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[100px] ${
    error ? 'border-red-500' : 'border-gray-300'
  }`}
/>

// Select
<select
  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white ${
    error ? 'border-red-500' : 'border-gray-300'
  }`}
>

// Radio Group
<div className="flex flex-col gap-3">
  <label className="flex items-center gap-2 cursor-pointer">
    <input type="radio" className="w-5 h-5 cursor-pointer" />
    <span>{opt.label}</span>
  </label>
</div>

// Checkbox Group
<div className="flex flex-col gap-3">
  <label className="flex items-center gap-2 cursor-pointer">
    <input type="checkbox" className="w-5 h-5 cursor-pointer" />
    <span>{opt.label}</span>
  </label>
</div>

// Error Message
<span className="text-sm text-red-500" role="alert">
  {error}
</span>

// Helper Text
<span className="text-sm text-gray-500">{helperText}</span>

// Success Alert
<div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-md text-sm">
  {message}
</div>

// Error Alert
<div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-md text-sm">
  {message}
</div>

// Submit Button
<button
  type="submit"
  disabled={isSubmitting}
  className="px-8 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
>
  {isSubmitting ? 'Submitting...' : 'Submit'}
</button>
```

---

## Usage in Your Website

### Getting Form Data from Contentstack

```typescript
// Example: Fetching a page with a form field
import ContentstackSDK from '@contentstack/delivery-sdk';

const stack = ContentstackSDK.stack({
  apiKey: 'your-api-key',
  deliveryToken: 'your-delivery-token',
  environment: 'your-environment',
});

async function getPageWithForm(entryUid: string) {
  const entry = await stack
    .contentType('page')
    .entry(entryUid)
    .includeReference('form_field') // Your custom field reference
    .fetch();

  return entry;
}

// Then in your component:
const pageData = await getPageWithForm('entry-uid');
const formData = pageData.form_field; // This is the FormFieldData object

<DynamicForm formData={formData} />
```

---

## Field Type Reference

| Type | Description | Special Props |
|------|-------------|---------------|
| `text` | Single-line text input | `validation.min`, `validation.max`, `validation.pattern` |
| `email` | Email input with validation | Auto-validates email format |
| `tel` | Phone number input | Auto-validates phone format |
| `number` | Numeric input | `validation.min`, `validation.max` |
| `textarea` | Multi-line text input | `validation.min`, `validation.max` |
| `select` | Dropdown selection | Requires `options[]` |
| `radio` | Radio button group | Requires `options[]` |
| `checkbox` | Checkbox group | Requires `options[]` with `defaultChecked` |
| `date` | Date input | `dateFormat`, `showDateFormatHelper` |

---

## Checkbox Field Special Handling

Checkbox fields work differently - each option maps to a boolean web service field:

```typescript
// Form field configuration:
{
  type: 'checkbox',
  label: 'Marketing Preferences',
  options: [
    { label: 'Email updates', value: 'email_opt_in', defaultChecked: true },
    { label: 'SMS notifications', value: 'sms_opt_in', defaultChecked: false },
  ]
}

// Submitted data:
{
  email_opt_in: true,
  sms_opt_in: false
}
```

---

## Common Integration Patterns

### 1. Contact Form
```typescript
<DynamicForm formData={contactFormData} />
```

### 2. Newsletter Signup
```typescript
<DynamicForm formData={newsletterFormData} />
```

### 3. Multi-Step Form
```typescript
const [step, setStep] = useState(1);
const [formData, setFormData] = useState({});

// Split form into multiple pages, collect data at each step
// Submit all data on final step
```

### 4. Form with Conditional Fields
```typescript
// You can extend the component to show/hide fields based on other field values
// Example: Show "Other" text field when "Other" is selected in dropdown
```

---

## Testing

### Test the Health Endpoint
```bash
curl http://localhost:3008/health
```

### Test Form Submission
```bash
curl -X POST http://localhost:3008/api/forms/YOUR_FORM_ID/submit \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test User",
    "email": "test@example.com"
  }'
```

---

## Troubleshooting

### Form doesn't submit
- Check browser console for errors
- Verify API URL is correct
- Ensure formId is valid
- Check network tab for failed requests

### Validation errors
- Ensure field names match `mappedField` values
- Check validation rules are reasonable
- Verify required fields have values

### CORS errors
- Add your website domain to `ALLOWED_ORIGINS` in backend `.env`
- Restart the backend server after changing `.env`

### Fields not rendering correctly
- Verify form configuration structure matches TypeScript types
- Check that `columnSpan` values don't exceed 12
- Ensure `visualRow` values are sequential

---

## Security Notes

✅ **What's secure:**
- Backend proxies web service requests
- API keys never exposed to frontend
- Service role keys kept server-side only

❌ **Don't do this:**
- Never send web service credentials to frontend
- Never commit `.env` files to git
- Never use service role keys in client-side code

---

## Additional Resources

- **Backend API Code**: `/Users/ericcrump/dev/groundwork-services`
- **Form Builder**: `/Users/ericcrump/dev/cs_app_library/src/containers/FullPage/sections/FormBuilder.tsx`
- **Custom Field**: `/Users/ericcrump/dev/cs_app_library/src/containers/FormField/FormField.tsx`
- **Railway Docs**: https://docs.railway.app
- **Contentstack Docs**: https://www.contentstack.com/docs

---

## Questions?

Reference this guide when implementing forms in your website project. The complete implementation is in this Cursor workspace if you need to reference the actual code.

