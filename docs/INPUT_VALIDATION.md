# Input Validation Guide

This document outlines the comprehensive input validation strategy implemented across the application using Zod.

## Overview

All user inputs are validated both client-side using Zod schemas to prevent:
- Injection attacks (SQL, XSS)
- Data corruption
- Invalid data format
- Security vulnerabilities
- Poor user experience

## Validation Architecture

### Central Schema Library
All validation schemas are defined in `src/lib/validationSchemas.ts`. This centralized approach ensures:
- Consistency across the application
- Easy maintenance and updates
- Reusability
- Type safety with TypeScript

### Helper Function
```typescript
import { validateAndSanitize } from "@/lib/validationSchemas";

const validation = validateAndSanitize(schema, data);
if (validation.success === false) {
  // Handle error
  toast.error(validation.error);
  return;
}
// Use validation.data
```

## Implemented Validations

### 1. Authentication & Security
**Location**: `src/pages/Auth.tsx`

- **Email validation**: Format, length limits
- **Password validation**: Min 8 chars, uppercase, lowercase, number requirements
- **Name validation**: Length limits, allowed characters
- **TOTP codes**: 6-digit numeric validation
- **Backup codes**: Format validation

### 2. Medical Data
**Location**: `src/pages/MedicalHistory.tsx`

#### Medications
- Name: 1-200 characters
- Dosage: Valid format (e.g., "100mg", "2.5ml")
- Frequency: Max 100 characters
- Start date: Cannot be in future
- Notes: Max 1000 characters

#### Test Results
- Test name: 1-200 characters
- Date: Valid format, cannot be future
- Result value/unit: Reasonable limits
- Notes: Max 1000 characters

#### Medical Records
- Record name: 1-200 characters
- Category: Required, max 100 characters
- Date: Cannot be future
- Notes: Max 2000 characters

#### Symptoms
- Symptom name: 1-200 characters
- Severity: 1-10 scale
- Description: Max 1000 characters

### 3. Nutrition
**Location**: `src/pages/FoodLog.tsx`

#### Food Logging
- Meal type: Enum validation (breakfast, lunch, dinner, snack)
- Food name: 1-500 characters
- Calories: 0-10000 range
- Macros: Reasonable limits for protein, carbs, fat
- Date: Valid format

#### Meal Search
- Query: 2-100 characters
- Prevents overly short or long searches

### 4. Fitness & Tracking

#### Body Measurements
**Location**: `src/pages/BodyMeasurements.tsx`

- All measurements: 5-100 inches range
- At least one measurement required
- Notes: Max 1000 characters

#### Weight Tracking
**Location**: `src/pages/Weight.tsx`

- Weight: 50-1000 lbs range
- Period: Enum (morning/evening)
- Prevents unrealistic values

#### Habits
**Location**: `src/pages/Habits.tsx`

- Name: 2-100 characters
- Description: Max 500 characters
- Frequency: Enum (daily, weekly, monthly)
- Target count: 1-100 range

### 5. Trainer Profiles
**Location**: `src/pages/TrainerSetup.tsx`

- Bio: 50-2000 characters (ensures quality)
- Hourly rate: $10-$1000 range
- Experience: 0-50 years
- Location: Max 200 characters
- Specialties: Max 10, each max 100 chars
- Certifications: Max 15, each max 150 chars

### 6. Profile Updates
**Location**: `src/pages/Profile.tsx`

- Full name: Name schema validation
- Username: 3-30 chars, alphanumeric + underscore
- Age: 13-120 years
- Weight: 20-500 range
- Height: 50-300 range

### 7. Fundraisers
**Location**: `src/pages/Fundraisers.tsx`

- Title: 10-200 characters
- Description: 50-5000 characters
- Goal amount: $10-$1,000,000
- Category: Required, max 50 chars
- Location: Max 200 characters
- End date: Must be in future

### 8. Workout Logging
**Schema**: `workoutLogSchema`

- Type: 1-100 characters
- Duration: 1-600 minutes (10 hours max)
- Calories: 0-5000 range
- Notes: Max 1000 characters

### 9. Bookings
**Schema**: `bookingSchema`

- Trainer ID: UUID validation
- Type: Enum (session, program, consultation)
- Start time: Must be in future
- Notes: Max 500 characters

### 10. Contact/Support
**Schema**: `contactSchema`

- Name: Name schema validation
- Email: Email schema validation
- Subject: 5-200 characters
- Message: 20-2000 characters

## Best Practices

### 1. Always Validate Before Database Operations
```typescript
const validation = validateAndSanitize(schema, data);
if (validation.success === false) {
  toast.error(validation.error);
  return;
}

await supabase.from('table').insert(validation.data);
```

### 2. Provide Clear Error Messages
- Validation errors automatically show user-friendly messages
- Messages explain what's wrong and what's expected

### 3. Use Enums for Fixed Values
```typescript
z.enum(['option1', 'option2', 'option3'])
```

### 4. Set Reasonable Limits
- Consider real-world usage
- Prevent abuse while allowing legitimate use
- Balance security with usability

### 5. Optional vs Required Fields
```typescript
// Required
field: z.string().min(1, "Field is required")

// Optional
field: z.string().max(100).optional()

// Optional or null
field: z.number().optional().nullable()
```

## Security Considerations

### 1. Input Sanitization
- All strings are trimmed automatically
- Length limits prevent DoS attacks
- Type validation prevents injection

### 2. No Direct HTML Rendering
- Never use `dangerouslySetInnerHTML` with user input
- All user content is rendered as text

### 3. URL Validation
```typescript
import { urlSchema } from "@/lib/validationSchemas";

// Validates URL format and length
const validation = validateAndSanitize(urlSchema, userUrl);
```

### 4. External API Calls
- Always use `encodeURIComponent()` for URL parameters
- Validate before passing to external services
- Never log sensitive validated data

## Common Patterns

### Pattern 1: Form Submission
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const validation = validateAndSanitize(mySchema, formData);
  if (validation.success === false) {
    toast({ 
      title: "Validation Error",
      description: validation.error,
      variant: "destructive"
    });
    return;
  }

  // Use validation.data for database operations
  await supabase.from('table').insert(validation.data);
};
```

### Pattern 2: Search/Query Validation
```typescript
const handleSearch = async () => {
  const validation = validateAndSanitize(searchSchema, { query });
  if (validation.success === false) {
    toast.error(validation.error);
    return;
  }
  
  // Safe to use validation.data.query
  performSearch(validation.data.query);
};
```

### Pattern 3: Nested Object Validation
```typescript
const schema = z.object({
  parent: z.string(),
  nested: z.object({
    child: z.number()
  })
});
```

### Pattern 4: Array Validation
```typescript
const schema = z.object({
  items: z.array(z.string().max(100)).max(10)
});
```

## Testing Validation

### Manual Testing Checklist
- [ ] Test minimum length requirements
- [ ] Test maximum length requirements
- [ ] Test invalid formats (email, date, etc.)
- [ ] Test numeric ranges (min/max)
- [ ] Test required vs optional fields
- [ ] Test enum values
- [ ] Test special characters
- [ ] Test empty submissions
- [ ] Test extreme values

### Example Test Cases

#### Email Validation
- ✅ Valid: "user@example.com"
- ❌ Invalid: "notanemail"
- ❌ Invalid: "user@" (too short domain)
- ❌ Invalid: 256+ character email

#### Password Validation
- ✅ Valid: "MyPass123"
- ❌ Invalid: "short" (< 8 chars)
- ❌ Invalid: "alllowercase123" (no uppercase)
- ❌ Invalid: "ALLUPPERCASE123" (no lowercase)
- ❌ Invalid: "NoNumbers" (no digit)

#### Numeric Range Validation
- ✅ Valid: 100 (within range)
- ❌ Invalid: -5 (below min)
- ❌ Invalid: 10000 (above max)

## Extending Validation

### Adding New Schemas

1. Add schema to `src/lib/validationSchemas.ts`:
```typescript
export const myNewSchema = z.object({
  field1: z.string().min(1).max(100),
  field2: z.number().min(0),
});
```

2. Import and use in component:
```typescript
import { myNewSchema, validateAndSanitize } from "@/lib/validationSchemas";

const validation = validateAndSanitize(myNewSchema, data);
```

### Custom Validation Logic

```typescript
const schema = z.object({
  field: z.string()
}).refine((data) => {
  // Custom validation logic
  return someCondition;
}, {
  message: "Custom error message",
  path: ["field"] // Which field the error applies to
});
```

## Performance Considerations

- Validation is fast (microseconds)
- Minimal overhead for forms
- Prevents expensive database operations on invalid data
- Improves user experience with immediate feedback

## Future Improvements

1. **Server-side validation**: Add validation in edge functions
2. **File upload validation**: Add size and type checks
3. **Rate limiting integration**: Combine with rate limiting for API calls
4. **Custom error messages**: Per-field customization
5. **Internationalization**: Multi-language error messages

## Related Documentation

- [Error Handling Guide](./ERROR_HANDLING.md)
- [Security Best Practices](./SECURITY.md)
- [API Documentation](./API.md)

## Resources

- [Zod Documentation](https://zod.dev/)
- [OWASP Input Validation](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
