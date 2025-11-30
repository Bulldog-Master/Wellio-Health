# Offline Support

This document describes the offline support implementation in the application.

## Overview

The app provides seamless offline functionality using:
- Network status detection
- Action queueing for offline operations
- Automatic retry when reconnected
- Visual feedback for network status

## Components

### Network Detection

**`useNetworkOnline` Hook**
- Detects online/offline status
- Used throughout app for connectivity checks

**`OfflineIndicator` Component**
- Shows persistent banner when offline
- Displays success notification when reconnected
- Auto-dismisses after 3 seconds when online

### Offline Queue

**`useOfflineQueue` Hook**
```typescript
const { addToQueue, queueLength, processing } = useOfflineQueue();

// Queue an action
addToQueue(
  () => mutation.mutateAsync(data),
  "Save post"
);
```

**Features:**
- Queues actions when offline
- Persists queue in localStorage
- Automatically processes when online
- Provides processing status

## Implementation Examples

### Basic Usage
```typescript
import { useOfflineQueue } from "@/hooks/useOfflineQueue";

const { addToQueue } = useOfflineQueue();

const handleSave = async () => {
  if (!navigator.onLine) {
    addToQueue(
      () => supabase.from("posts").insert(data),
      "Create post"
    );
    toast({ title: "Queued for sync when online" });
    return;
  }
  
  // Normal save logic
};
```

### With React Query
```typescript
const mutation = useMutation({
  mutationFn: async (data) => {
    const { error } = await supabase
      .from("posts")
      .insert(data);
    if (error) throw error;
  },
  onError: (error) => {
    if (!navigator.onLine) {
      addToQueue(
        () => mutation.mutateAsync(data),
        "Save post"
      );
    }
  }
});
```

## User Experience

### When Going Offline
1. Persistent banner appears at top
2. Actions are queued automatically
3. User can continue using app
4. Queue count displayed (optional)

### When Reconnecting
1. "Back online" notification shown
2. Queued actions processed automatically
3. UI updates reflect synced changes
4. Notification dismisses after 3s

## Best Practices

1. **Always check connectivity** before critical operations
2. **Provide feedback** when actions are queued
3. **Handle errors gracefully** when queue processing fails
4. **Don't queue read operations** - only mutations
5. **Clear queue on logout** to prevent cross-user data

## Limitations

- Queue persists in localStorage (per-browser)
- Actions must be serializable
- No conflict resolution for concurrent edits
- Queue size limited by localStorage capacity

## Future Improvements

- IndexedDB for larger queues
- Conflict detection and resolution
- Progress indicators for queue processing
- Selective retry for failed items
