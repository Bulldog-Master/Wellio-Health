# Accessibility

This document describes the accessibility features implemented throughout the application.

## Overview

The app follows WCAG 2.1 Level AA guidelines to ensure usability for all users, including those using assistive technologies.

## Core Features

### Keyboard Navigation

**App-wide Shortcuts** (`useAppKeyboardShortcuts`)
- `Alt + H`: Home/Dashboard
- `Alt + F`: Feed
- `Alt + S`: Search
- `Alt + N`: Notifications
- `Alt + P`: Profile
- `Alt + M`: Messages

**Component-level** (`useKeyboardNavigation`)
- Custom shortcuts per page
- Escape to close modals
- Tab navigation through interactive elements
- Arrow keys for list navigation

### Focus Management

**Skip Links** (`SkipToContent`)
- Skip to main content
- Skip to navigation
- Visible on focus only

**Focus Trapping** (`src/lib/accessibility.ts`)
```typescript
import { trapFocus } from "@/lib/accessibility";

// In modal/dialog
useEffect(() => {
  const cleanup = trapFocus(dialogRef.current);
  return cleanup;
}, []);
```

### Screen Reader Support

**Announcements** (`announceToScreenReader`)
```typescript
import { announceToScreenReader } from "@/lib/accessibility";

// After action
announceToScreenReader("Post published successfully");

// For errors
announceToScreenReader(
  "Failed to save changes", 
  "assertive"
);
```

**ARIA Labels** (`getAriaLabel`)
```typescript
import { getAriaLabel } from "@/lib/accessibility";

<button aria-label={getAriaLabel("Delete", "workout")}>
  <Trash className="w-4 h-4" />
</button>
```

### Semantic HTML

All components use proper semantic HTML:
- `<main>` for main content
- `<nav>` for navigation
- `<article>` for posts
- `<section>` for content sections
- `<button>` for clickable actions (not divs)
- `<h1>-<h6>` with proper hierarchy

### Color and Contrast

**Design System Tokens**
- All colors meet WCAG AA contrast ratios
- Defined in `src/index.css`
- Semantic color names (primary, muted, etc.)
- Dark mode support

**Never use direct colors:**
```typescript
// ❌ Wrong
<div className="text-white bg-gray-800">

// ✅ Correct
<div className="text-foreground bg-background">
```

### Form Accessibility

**Labels and Descriptions**
```typescript
<Label htmlFor="email">Email</Label>
<Input 
  id="email"
  aria-describedby="email-description"
/>
<p id="email-description" className="text-sm text-muted-foreground">
  We'll never share your email
</p>
```

**Error Messages**
```typescript
<Input
  aria-invalid={!!error}
  aria-describedby="email-error"
/>
{error && (
  <p id="email-error" role="alert" className="text-destructive">
    {error.message}
  </p>
)}
```

**Required Fields**
```typescript
<Label htmlFor="name">
  Name <span className="text-destructive" aria-label="required">*</span>
</Label>
<Input id="name" required aria-required="true" />
```

### Interactive Elements

**Buttons**
- Always include visible or aria-label text
- Proper focus states
- Disabled state clearly indicated

```typescript
<Button
  aria-label="Like post"
  disabled={isLoading}
  aria-busy={isLoading}
>
  <Heart className="w-4 h-4" />
  <span className="sr-only">Like</span>
</Button>
```

**Links**
- Descriptive text (no "click here")
- External links indicated
- Visited state styling

```typescript
<a 
  href={url}
  target="_blank"
  rel="noopener noreferrer"
  aria-label={`${title} (opens in new tab)`}
>
  {title}
</a>
```

### Loading States

**Skeleton Screens** (`LoadingSkeleton`)
```typescript
<LoadingSkeleton />
```

**Loading Indicators**
```typescript
<div role="status" aria-live="polite">
  {isLoading && <Spinner aria-label="Loading posts" />}
</div>
```

### Error Handling

**Error Boundaries** (`ErrorBoundary`, `AsyncErrorBoundary`)
- Catch and display errors gracefully
- Provide recovery actions
- Log errors for debugging

**User-Friendly Messages**
```typescript
import { formatErrorForScreenReader } from "@/lib/accessibility";

toast({
  title: "Error",
  description: formatErrorForScreenReader(error.message),
  variant: "destructive"
});
```

## Testing Checklist

When building features, verify:

### Keyboard
- [ ] All interactive elements are keyboard accessible
- [ ] Tab order is logical
- [ ] Focus indicators are visible
- [ ] Escape closes modals/dropdowns
- [ ] Enter activates buttons/links

### Screen Reader
- [ ] All images have alt text
- [ ] Form fields have labels
- [ ] Error messages are announced
- [ ] Dynamic content updates are announced
- [ ] Buttons have clear purposes

### Visual
- [ ] Text meets contrast requirements (4.5:1)
- [ ] Focus states are visible
- [ ] UI works at 200% zoom
- [ ] No color-only indicators
- [ ] Dark mode maintains accessibility

### Structure
- [ ] Proper heading hierarchy (h1 → h2 → h3)
- [ ] Landmarks used correctly (main, nav, aside)
- [ ] Lists use proper markup (ul/ol/li)
- [ ] Tables have headers

## Tools

**Browser Extensions**
- axe DevTools
- WAVE
- Lighthouse

**Screen Readers**
- NVDA (Windows)
- JAWS (Windows)
- VoiceOver (macOS/iOS)
- TalkBack (Android)

**Testing Commands**
```bash
# Lighthouse accessibility audit
npm run lighthouse

# axe-core testing
npm run test:a11y
```

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Checklist](https://webaim.org/standards/wcag/checklist)
- [A11y Project](https://www.a11yproject.com/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

## Future Improvements

- [ ] Add more keyboard shortcuts
- [ ] Implement reduced motion preferences
- [ ] Add high contrast mode
- [ ] Improve mobile screen reader experience
- [ ] Add accessibility statement page
