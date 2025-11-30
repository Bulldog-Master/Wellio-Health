# Empty States

This document describes the empty state implementation pattern used throughout the application.

## Overview

Empty states provide helpful guidance when there's no content to display, improving user experience and reducing confusion.

## EmptyState Component

**Location:** `src/components/EmptyState.tsx`

### Props
```typescript
interface EmptyStateProps {
  icon: LucideIcon;          // Icon to display
  title: string;             // Main message
  description: string;       // Helper text
  action?: {                 // Optional CTA
    label: string;
    onClick: () => void;
  };
}
```

### Usage Example
```typescript
import { EmptyState } from "@/components/EmptyState";
import { Calendar } from "lucide-react";

<EmptyState
  icon={Calendar}
  title="No events scheduled"
  description="Start by creating your first workout session"
  action={{
    label: "Create Event",
    onClick: () => navigate("/events/new")
  }}
/>
```

## Implementation Guidelines

### When to Use
- Zero state: First-time user experience
- No results: Search/filter returns empty
- Completed: All items finished/cleared
- Error recovery: After failed load

### Best Practices

1. **Be helpful**
   - Explain why it's empty
   - Provide next steps
   - Use friendly, encouraging tone

2. **Visual hierarchy**
   - Icon: Relevant to content type
   - Title: Clear, concise (3-6 words)
   - Description: Actionable guidance
   - Button: Single, clear CTA

3. **Consistency**
   - Use same component across app
   - Match icon to section theme
   - Maintain visual style

### Examples by Context

**First-Time User**
```typescript
<EmptyState
  icon={Dumbbell}
  title="Start your fitness journey"
  description="Log your first workout to begin tracking progress"
  action={{
    label: "Log Workout",
    onClick: () => navigate("/workout")
  }}
/>
```

**No Results**
```typescript
<EmptyState
  icon={Search}
  title="No results found"
  description="Try adjusting your filters or search terms"
  action={{
    label: "Clear Filters",
    onClick: clearFilters
  }}
/>
```

**All Complete**
```typescript
<EmptyState
  icon={CheckCircle}
  title="All caught up!"
  description="You've completed all your habits for today"
/>
```

**Error State**
```typescript
<EmptyState
  icon={AlertCircle}
  title="Unable to load content"
  description="Please check your connection and try again"
  action={{
    label: "Retry",
    onClick: refetch
  }}
/>
```

## Accessibility

The EmptyState component includes:
- Semantic HTML structure
- Proper heading hierarchy
- Keyboard-accessible buttons
- ARIA labels for icons
- Focus management

## Customization

For special cases, you can:

1. **Extend the component**
```typescript
<EmptyState
  icon={Trophy}
  title="No badges yet"
  description="Complete challenges to earn badges"
>
  <CustomBadgePreview />
</EmptyState>
```

2. **Custom styling**
```typescript
<div className="custom-wrapper">
  <EmptyState ... />
</div>
```

3. **Multiple actions**
```typescript
<EmptyState
  icon={Users}
  title="No friends yet"
  description="Connect with others to share your journey"
/>
<div className="flex gap-2 justify-center mt-4">
  <Button onClick={findFriends}>Find Friends</Button>
  <Button variant="outline" onClick={inviteFriends}>
    Invite Friends
  </Button>
</div>
```

## Current Usage

Empty states are implemented in:
- ✅ Bookmarks
- ✅ Activity Timeline
- ✅ Habits
- ✅ Challenges
- ✅ Messages
- ✅ Notifications
- ✅ Search Results
- ✅ User Profile (posts/badges tabs)

## Testing

When adding empty states:
1. Test with zero data
2. Verify action button works
3. Check responsive design
4. Validate accessibility
5. Test keyboard navigation
