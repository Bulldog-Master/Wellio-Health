# Translation Patterns & Best Practices

## Discovered During Spanish Implementation

---

## COMMON STRING PATTERNS

### 1. Toast Messages
```typescript
// BEFORE (hardcoded)
toast({ title: "Profile updated" })
toast({ title: "Error", description: "Failed to save" })

// AFTER (translated)
toast({ title: t('profile:profile_updated') })
toast({ 
  title: t('errors:error'), 
  description: t('errors:failed_to_save') 
})
```

### 2. Form Placeholders
```typescript
// BEFORE
<Input placeholder="Enter your name" />

// AFTER
<Input placeholder={t('common:enter_name')} />
```

### 3. Button Text
```typescript
// BEFORE
<Button>Save Changes</Button>

// AFTER  
<Button>{t('common:save_changes')}</Button>
```

### 4. Conditional Text
```typescript
// BEFORE
{isLoading ? "Loading..." : "Load More"}

// AFTER
{isLoading ? t('common:loading') : t('common:load_more')}
```

### 5. Dynamic Text with Variables
```typescript
// BEFORE
`You have ${count} new messages`

// AFTER
t('messages:new_messages_count', { count })
// In JSON: "new_messages_count": "You have {{count}} new messages"
```

### 6. Plural Handling
```typescript
// BEFORE
`${count} ${count === 1 ? 'item' : 'items'}`

// AFTER
t('common:items', { count })
// In JSON with i18next plurals:
// "items_one": "{{count}} item",
// "items_other": "{{count}} items"
```

---

## FILE ORGANIZATION PATTERNS

### Small Component (<100 lines)
- Use 1-2 namespaces max
- Import at top: `const { t } = useTranslation(['common', 'errors'])`

### Medium Page (100-500 lines)  
- Use 2-4 namespaces
- Group related functionality

### Large Page (500+ lines)
- Use 4-6 namespaces
- Consider splitting into smaller components
- Examples: Workout.tsx needs ['common', 'fitness', 'errors', 'workout']

---

## NAMING CONVENTIONS

### Keys should be:
1. **Lowercase with underscores**: `save_changes` not `saveChanges`
2. **Descriptive**: `upload_profile_photo` not `upload`
3. **Grouped logically**: `form_*` for form fields
4. **Action-based for buttons**: `click_to_save`, `submit_form`

### Namespace Organization:
- `common` - Used everywhere (Save, Cancel, Loading, Error)
- `errors` - All error messages
- `{feature}` - Feature-specific (profile, workout, messages)

---

## COMMON PITFALLS TO AVOID

### ❌ DON'T:
```typescript
// Hardcoded strings in attributes
<Button aria-label="Close dialog">

// Concatenated strings
const message = "Hello " + name + "!";

// Template literals with hardcoded text
`Your score is ${score} points`

// Hardcoded empty state messages
{items.length === 0 && <p>No items found</p>}
```

### ✅ DO:
```typescript
// Translate all UI-facing strings
<Button aria-label={t('common:close_dialog')}>

// Use translation with variables
t('common:greeting', { name })

// Use interpolation
t('common:score_display', { score })

// Translate empty states
{items.length === 0 && <p>{t('common:no_items_found')}</p>}
```

---

## TESTING CHECKLIST

After translating a page:

- [ ] Switch language - does everything translate?
- [ ] Check for layout breaks (Spanish is ~20% longer than English)
- [ ] Verify placeholders translate
- [ ] Test all toast messages
- [ ] Check error messages display correctly
- [ ] Verify dynamic text (counts, names) works
- [ ] Test empty states
- [ ] Check button text doesn't overflow
- [ ] Verify dropdown/menu items translate
- [ ] Test form validation messages

---

## STRING EXTRACTION TOOL (NEEDED)

### Proposed Features:
1. Scan all .tsx files
2. Extract strings from:
   - JSX text content
   - String attributes (placeholder, title, etc.)
   - toast() calls
   - Error messages
3. Generate translation key suggestions
4. Output to JSON format
5. Detect missing translations
6. Report coverage percentage

### Command:
```bash
npm run extract-strings --lang=es --output=./temp-translations.json
npm run check-coverage --lang=es
```

---

## REUSABLE COMPONENTS LIBRARY

### Create translated components to reduce repetition:

```typescript
// TranslatedButton.tsx
export const SaveButton = () => (
  <Button>{t('common:save')}</Button>
);

export const CancelButton = () => (
  <Button variant="outline">{t('common:cancel')}</Button>
);

// Usage
import { SaveButton, CancelButton } from '@/components/TranslatedButtons';
```

---

## WORKFLOW FOR NEXT LANGUAGE

1. **Copy Spanish structure** - Use ES as template
2. **Run string extraction tool** - Find any missed strings  
3. **Generate translation files** - All JSON files at once
4. **Translate systematically** - Use same page order
5. **Test as you go** - Don't wait until end
6. **Document new patterns** - Add to this file
7. **Improve tooling** - Make it easier each time
