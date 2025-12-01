# Translation Guide - Best Practices & Process

## Overview

This guide documents learnings from implementing Spanish translations and establishes best practices for future language additions.

---

## 🚨 IMPORTANT: Automatic Translation Monitoring

The app now has **built-in translation monitoring** that runs automatically in development:

### Missing Key Detection
When you use a translation key that doesn't exist, you'll see a console warning:
```
⚠️ MISSING TRANSLATION: [es] feature:new_key
```

### Translation Parity Report
On app startup, the console shows a report comparing EN ↔ ES:
```
🌐 Translation Parity Report
Comparing en → es
  [common] Missing in es: ["new_key", "another_key"]
Total keys missing in es: 2
```

### How to Use During Development
1. Open browser DevTools → Console
2. Look for `⚠️` or `🌐` warnings
3. Add missing keys to the appropriate JSON files
4. Refresh to verify fixes

---

## Pre-Translation Checklist

### 1. Audit All Files First

Before writing ANY translation code, run a complete audit:

```bash
# Find all hardcoded strings in pages
grep -rn "\"[A-Z][a-z]" src/pages/ --include="*.tsx" | grep -v "import\|className\|console\|http"

# Find all hardcoded strings in components
grep -rn "\"[A-Z][a-z]" src/components/ --include="*.tsx" | grep -v "import\|className\|console"

# Find toast messages
grep -rn "toast({" src/ --include="*.tsx" -A 2

# Find placeholder text
grep -rn "placeholder=" src/ --include="*.tsx"
```

### 2. Create Translation Inventory

Document ALL strings before starting:

| Page/Component | String Count | Namespace | Priority |
|----------------|--------------|-----------|----------|
| Feed.tsx       | 25           | feed      | High     |
| Auth.tsx       | 40           | auth      | High     |
| Workout.tsx    | 150          | workout   | High     |
| etc...         |              |           |          |

---

## Namespace Strategy

### Core Namespaces (Always Use)

```
common.json     - Shared across ALL pages (loading, error, save, cancel, etc.)
auth.json       - Authentication flows
errors.json     - All error messages
```

### Feature Namespaces

```
fitness.json    - General fitness terms (workout, exercise, reps, sets)
nutrition.json  - Food/nutrition terms
social.json     - Social features (follow, like, comment, share)
settings.json   - Settings & preferences
```

### Page-Specific Namespaces (Use Sparingly)

Only create page-specific namespaces for pages with 20+ unique strings:

```
workout.json    - Workout page specific
feed.json       - Feed page specific
profile.json    - Profile page specific
```

### Namespace Naming Rules

1. Always lowercase: `workout.json` not `Workout.json`
2. Use underscores for multi-word: `challenges_page.json`
3. Keep names short but descriptive

---

## Common Strings (MUST be in common.json)

These strings appear everywhere - NEVER duplicate them:

```json
{
  "loading": "Loading...",
  "error": "Error",
  "success": "Success",
  "save": "Save",
  "cancel": "Cancel",
  "delete": "Delete",
  "edit": "Edit",
  "create": "Create",
  "update": "Update",
  "submit": "Submit",
  "close": "Close",
  "back": "Back",
  "next": "Next",
  "previous": "Previous",
  "search": "Search",
  "filter": "Filter",
  "sort": "Sort",
  "view": "View",
  "share": "Share",
  "copy": "Copy",
  "copied": "Copied!",
  "confirm": "Confirm",
  "yes": "Yes",
  "no": "No",
  "ok": "OK",
  "done": "Done",
  "retry": "Retry",
  "refresh": "Refresh",
  "anonymous": "Anonymous",
  "unknown": "Unknown",
  "none": "None",
  "all": "All",
  "today": "Today",
  "yesterday": "Yesterday",
  "tomorrow": "Tomorrow",
  "days": "days",
  "hours": "hours",
  "minutes": "minutes",
  "seconds": "seconds",
  "pts": "pts",
  "followers": "followers",
  "following": "following",
  "points": "points"
}
```

---

## Translation Key Naming Conventions

### Rules

1. **Always snake_case**: `user_profile` not `userProfile`
2. **Action verbs for buttons**: `save_changes`, `delete_item`
3. **Descriptive for labels**: `email_address`, `phone_number`
4. **Suffix for types**:
   - `_title` for headings
   - `_description` for descriptions
   - `_placeholder` for input placeholders
   - `_error` for error messages
   - `_success` for success messages
   - `_empty` for empty states
   - `_loading` for loading states

### Examples

```json
{
  "profile_title": "Your Profile",
  "profile_description": "Manage your account settings",
  "email_placeholder": "Enter your email",
  "email_error_invalid": "Please enter a valid email",
  "save_success": "Changes saved successfully",
  "no_items_empty": "No items found",
  "fetching_loading": "Fetching data..."
}
```

---

## Implementation Process

### Step 1: Create ALL Translation Files First

Before touching any component, create all JSON files:

```
src/i18n/locales/
├── en/
│   ├── common.json      ✓ Create first
│   ├── auth.json        ✓
│   ├── errors.json      ✓
│   ├── [feature].json   ✓
│   └── ...
└── es/
    ├── common.json      ✓ Create simultaneously
    ├── auth.json        ✓
    ├── errors.json      ✓
    ├── [feature].json   ✓
    └── ...
```

### Step 2: Register All Namespaces in Config

Update `src/i18n/config.ts` with ALL namespaces at once:

```typescript
// Add all imports
import commonEN from './locales/en/common.json';
import commonES from './locales/es/common.json';
// ... all others

const resources = {
  en: {
    common: commonEN,
    // ... all namespaces
  },
  es: {
    common: commonES,
    // ... all namespaces
  },
};

// Register all namespaces
ns: ['common', 'auth', 'errors', 'fitness', 'nutrition', ...],
```

### Step 3: Update Components in Batches

Update 5-10 related components simultaneously using parallel tool calls:

```typescript
// Standard pattern for every component
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation(['common', 'feature']);
  
  return (
    <div>
      <h1>{t('feature:page_title')}</h1>
      <Button>{t('common:save')}</Button>
    </div>
  );
};
```

---

## String Patterns to Watch For

### Toast Messages (HIGH PRIORITY)

```typescript
// BEFORE
toast({ title: "Success!", description: "Item saved" });

// AFTER
toast({ 
  title: t('common:success'), 
  description: t('feature:item_saved') 
});
```

### Conditional Text

```typescript
// BEFORE
{isLoading ? "Loading..." : "Submit"}

// AFTER
{isLoading ? t('common:loading') : t('common:submit')}
```

### Pluralization

```typescript
// BEFORE
`${count} item${count !== 1 ? 's' : ''}`

// AFTER - Use i18next plural feature
t('common:items', { count })

// In JSON:
{
  "items_one": "{{count}} item",
  "items_other": "{{count}} items"
}
```

### Dynamic Values

```typescript
// BEFORE
`Welcome back, ${name}!`

// AFTER
t('auth:welcome_back', { name })

// In JSON:
{
  "welcome_back": "Welcome back, {{name}}!"
}
```

### Date Formatting

```typescript
// Use date-fns with locale
import { es } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

const { i18n } = useTranslation();
const locale = i18n.language?.startsWith('es') ? es : undefined;

format(date, 'PPP', { locale });
```

---

## Testing Checklist

After translating each page:

- [ ] Switch language - all text translates
- [ ] Check for layout breaks (Spanish is ~20% longer)
- [ ] Verify all placeholders translate
- [ ] Test all toast messages
- [ ] Check error states
- [ ] Verify empty states
- [ ] Test button text doesn't overflow
- [ ] Check dropdown/select items
- [ ] Test form validation messages
- [ ] Verify date/time formatting

---

## Common Mistakes to Avoid

### ❌ DON'T

```typescript
// Hardcoded in attributes
<Button aria-label="Close">

// String concatenation
const msg = "Hello " + name;

// Duplicating common strings in feature namespaces
// (put "Loading..." in common.json, not every file)

// Creating too many small namespaces
// (consolidate related features)

// Forgetting toast messages
toast({ title: "Error" }); // WRONG

// Inline conditional strings
{error && <p>Something went wrong</p>}
```

### ✅ DO

```typescript
// Translate attributes
<Button aria-label={t('common:close')}>

// Use interpolation
t('common:greeting', { name })

// Reuse common namespace
t('common:loading')

// Consolidate namespaces
// fitness.json includes workout, exercise, etc.

// Translate all toasts
toast({ title: t('common:error') });

// Translate conditionals
{error && <p>{t('errors:something_wrong')}</p>}
```

---

## Adding a New Language

### Process

1. Copy entire `en/` folder to new locale (e.g., `fr/`)
2. Translate all JSON files
3. Import all files in `config.ts`
4. Add to resources object
5. Test every page

### Estimated Timeline

| Phase | Tasks | Time |
|-------|-------|------|
| Setup | Create files, configure | 1 hour |
| Core Pages | Auth, Dashboard, Feed | 2-3 hours |
| Feature Pages | Workout, Food, Profile | 3-4 hours |
| Settings & Edge Cases | All remaining | 2-3 hours |
| Testing | Full app review | 1-2 hours |
| **Total** | | **9-13 hours** |

---

## File Structure Reference

```
src/i18n/
├── config.ts                 # i18n configuration
└── locales/
    ├── en/                   # English (source)
    │   ├── common.json       # Shared strings
    │   ├── auth.json         # Authentication
    │   ├── errors.json       # Error messages
    │   ├── fitness.json      # Fitness features
    │   ├── nutrition.json    # Food/nutrition
    │   ├── social.json       # Social features
    │   ├── settings.json     # Settings
    │   ├── profile.json      # Profile page
    │   ├── workout.json      # Workout page
    │   ├── feed.json         # Feed page
    │   └── ...
    ├── es/                   # Spanish
    │   └── (mirror en/)
    ├── fr/                   # French
    ├── de/                   # German
    ├── pt/                   # Portuguese
    └── zh/                   # Chinese
```

---

## Quick Reference Commands

```bash
# Count strings per file
wc -l src/i18n/locales/en/*.json

# Find missing translations (compare EN vs ES)
diff <(jq -r 'keys[]' src/i18n/locales/en/common.json | sort) \
     <(jq -r 'keys[]' src/i18n/locales/es/common.json | sort)

# Find components without useTranslation
grep -L "useTranslation" src/pages/*.tsx

# Find remaining hardcoded strings
grep -rn '"[A-Z][a-z].*"' src/pages/ --include="*.tsx" | grep -v import | grep -v className
```

---

## Lessons Learned

1. **Audit first, code second** - Scan everything before writing translation code
2. **Batch processing is faster** - Update 10 files at once, not 1 at a time
3. **Common namespace is king** - Centralize repeated strings
4. **Test incrementally** - Don't wait until the end to test
5. **Document as you go** - Track what's done and what's remaining
6. **Plan namespace structure upfront** - Changing namespaces later is painful

---

## Ongoing Maintenance

### When Adding New Features

**ALWAYS follow this workflow:**

1. **Before coding the feature:**
   - Create translation keys in EN JSON first
   - Create matching keys in ES JSON (and other languages)
   - Use `t('namespace:key')` in your component from the start

2. **During development:**
   - Watch browser console for `⚠️ MISSING TRANSLATION` warnings
   - Fix missing keys immediately, don't defer

3. **Before committing:**
   - Check console for translation parity report
   - Ensure no missing keys in any language

### When Modifying Existing Features

1. If you change a string's meaning → Update ALL language files
2. If you add a new string → Add to ALL language files
3. If you remove a string → Remove from ALL language files

### Translation Utilities Available

Located in `src/lib/translationUtils.ts`:

```typescript
import { 
  getMissingKeys,      // Get all missing keys collected during session
  clearMissingKeys,    // Clear the collection
  compareTranslations, // Compare two language objects
  validateTranslations,// Full parity check (runs automatically in dev)
  generateTranslationTemplate // Generate template for new language
} from '@/lib/translationUtils';

// Example: Generate a template for French from English
import { resources } from '@/i18n/config';
const frenchTemplate = generateTranslationTemplate(resources.en.common);
console.log(JSON.stringify(frenchTemplate, null, 2));
```

### Adding a New Language

1. Copy all files from `en/` to new locale folder
2. Use `generateTranslationTemplate()` to create placeholders
3. Translate each file
4. Add imports to `config.ts`
5. Add to `resources` object
6. Run app and check parity report

---

## Troubleshooting

### "Translation key not found" in production
- Check that the namespace is registered in `config.ts`
- Verify the key exists in ALL language files
- Check for typos in key names

### Console shows many missing keys
- Run parity check: keys may exist in EN but not ES
- Use the comparison output to identify which files need updates

### Translations not updating after changes
- Hard refresh the browser (Ctrl+Shift+R)
- Check that i18n config was rebuilt

---

*Last Updated: December 2024*
*Based on Spanish translation implementation*
*Includes automatic translation monitoring utilities*
