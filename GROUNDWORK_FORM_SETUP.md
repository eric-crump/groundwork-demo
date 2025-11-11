# Groundwork Form Integration - Setup Complete ✅

This project has been successfully configured to use the Contentstack Groundwork Form custom field.

## What Was Set Up

### 1. **Type Definitions** (`src/types/form.ts`)
TypeScript interfaces for form configuration structure including:
- `FormFieldData` - Main form data structure from Contentstack
- `FormConfig` - Form configuration with fields and submit settings
- `FormField` - Individual field definitions
- `FieldOption` - Options for select/radio/checkbox fields

### 2. **API Utility** (`src/utils/formApi.js`)
Handles form submissions to your backend API:
- `submitForm(formId, data)` - Submit form data
- `checkApiHealth()` - Check if backend is running

### 3. **Dynamic Form Component** (`src/components/DynamicForm.jsx`)
Fully featured form renderer that:
- Renders all form field types (text, email, tel, number, textarea, select, radio, checkbox, date)
- Handles validation (required, min/max, patterns, email format)
- Manages form state and submission
- Displays success/error messages
- Responsive layout using CSS Grid (12-column)
- Special handling for checkbox fields (expands to individual boolean fields)

### 4. **Styling** (`src/app/globals.css`)
Complete Tailwind CSS styling for:
- Form layout and responsive grid
- All input types
- Error states
- Success/error alerts
- Submit button states

### 5. **Homepage Integration** (`src/app/[locale]/page.jsx`)
Updated to:
- Import and render `DynamicForm` component
- Display form when `groundwork_form` field exists
- Show helpful message when no form is configured

---

## Required: Environment Configuration

Create a `.env.local` file in the project root with:

```bash
# Groundwork Backend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3008

# For production, use your Railway URL:
# NEXT_PUBLIC_API_URL=https://your-railway-url.up.railway.app
```

---

## Your Form Data Structure

Based on the JSON you provided, here's how the form data flows:

### From Contentstack:
```javascript
entry.groundwork_form = {
  formId: "cb04699e-4f8a-406f-af5f-f34ec5855f42",
  formName: "Collect User Info",
  formDescription: "Collect a user's contact details...",
  formConfig: {
    name: "Collect User Info",
    description: "...",
    fields: [ /* array of field definitions */ ],
    submitConfig: {
      webServiceId: "831c06b0-50f2-4105-9c6f-631ab3f83f9d",
      webServiceName: "User Info",
      successMessage: "Thank you!",
      errorMessage: "There was an error..."
    }
  }
}
```

### Submitted to Backend:
Based on your form, the component will submit:
```javascript
{
  "first": "John",              // from first_name field (mappedField: "first")
  "last": "Doe",                // from last_name field (mappedField: "last")
  "address": "123 Main St",     // from address field
  "city": "Indianapolis",       // from city field
  "state": "IN",                // from state select
  "options.agreeTerms": true,   // from checkbox option 1
  "options.agreeMarketing": false // from checkbox option 2
}
```

**Note:** Checkbox fields are automatically expanded - each option becomes a separate boolean field in the submitted data.

---

## How It Works

### 1. **Page Loads**
- Fetches the "homepage" content type from Contentstack
- Looks for `groundwork_form` field in the entry

### 2. **Form Renders**
- DynamicForm component receives the form configuration
- Groups fields by `visualRow` for layout
- Uses `columnSpan` (1-12) for responsive grid layout
- Initializes default checkbox values from `defaultChecked`

### 3. **User Interaction**
- Client-side validation on field blur and submit
- Validation rules from field configuration
- Error messages displayed inline

### 4. **Form Submission**
- Validates all fields
- Transforms checkbox groups to individual boolean fields
- POSTs to: `${API_URL}/api/forms/${formId}/submit`
- Shows success/error message
- Clears form on success

---

## Field Types Supported

| Type | Description | Example |
|------|-------------|---------|
| `text` | Single-line text | First name, last name |
| `email` | Email with validation | Email address |
| `tel` | Phone number | Phone number |
| `number` | Numeric input | Age, quantity |
| `textarea` | Multi-line text | Address, comments |
| `select` | Dropdown selection | State, country |
| `radio` | Radio button group | Gender, size |
| `checkbox` | Checkbox group | Terms, preferences |
| `date` | Date input | Birth date |

---

## Testing Your Setup

### 1. **Start the Backend**
Make sure your Groundwork backend service is running:
```bash
cd /Users/ericcrump/dev/groundwork-services
npm run dev
```

### 2. **Start Next.js**
```bash
npm run dev
```

### 3. **View the Form**
Navigate to your homepage (e.g., `http://localhost:3000/en`)

### 4. **Test Submission**
Fill out and submit the form. Check:
- Browser console for logs
- Network tab for API request
- Backend logs for received data

---

## Customization

### Changing Form Styles
Edit `src/app/globals.css` - all form styles are in the `@layer components` section.

### Adding Custom Validation
Extend the `validateField` function in `src/components/DynamicForm.jsx`.

### Adding New Field Types
Add cases to the `renderField` switch statement in `src/components/DynamicForm.jsx`.

### Modifying Submit Behavior
Update the `handleSubmit` function to add custom logic before/after submission.

---

## Integration with Other Content Types

To use forms on other pages:

```javascript
// In any page component
import DynamicForm from "@/components/DynamicForm";

export default function MyPage() {
  const [entry, setEntry] = useState(null);
  
  // Fetch your content...
  
  return (
    <div>
      {/* Your page content */}
      
      {/* Render form if it exists in the entry */}
      {entry?.my_form_field && (
        <DynamicForm formData={entry.my_form_field} />
      )}
    </div>
  );
}
```

---

## Backend API

### Endpoint
```
POST /api/forms/:formId/submit
```

### Request Body
JSON object with field names (from `mappedField` or `name`) as keys.

### Response
```javascript
// Success
{ "success": true, "message": "Form submitted successfully" }

// Error
{ "error": "Error message here" }
```

---

## Troubleshooting

### Form doesn't appear
- Check if `groundwork_form` field exists in Contentstack entry
- Verify entry is published
- Check browser console for errors

### Submission fails
- Verify backend is running (`http://localhost:3008/health`)
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Look at Network tab for error details
- Check CORS settings if using different domains

### Styling looks wrong
- Ensure Tailwind CSS is properly configured
- Check `globals.css` is imported in layout
- Verify no conflicting styles

### Validation not working
- Check field configuration in Contentstack
- Verify `required` and `validation` properties
- Review browser console for errors

---

## File Structure

```
src/
├── app/
│   ├── [locale]/
│   │   └── page.jsx           # Homepage with form integration
│   └── globals.css            # Form styles
├── components/
│   └── DynamicForm.jsx        # Main form component
├── types/
│   └── form.ts                # TypeScript type definitions
└── utils/
    └── formApi.js             # API utility functions
```

---

## Next Steps

1. ✅ Create `.env.local` with your API URL
2. ✅ Start your backend service
3. ✅ Test the form on your homepage
4. Add forms to other content types as needed
5. Customize styling to match your brand
6. Deploy to production

---

## Reference Documentation

For complete implementation details, see `FORM_IMPLEMENTATION_GUIDE.md`.

For questions or issues, reference the implementation files above.

**Happy coding! 🚀**

