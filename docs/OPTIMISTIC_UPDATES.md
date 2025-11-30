# Optimistic Updates Guide

This document outlines the optimistic UI update strategy with proper rollback handling implemented across the application.

## Overview

Optimistic updates provide instant UI feedback by updating the interface immediately before the server confirms the action. If the server request fails, the UI automatically rolls back to the previous state.

**Benefits:**
- Instant user feedback
- Better perceived performance
- Improved user experience
- Reduced loading states

**Key Principle:** Always provide a rollback mechanism in case the server operation fails.

## Implementation Pattern

### Standard Optimistic Update with TanStack Query

```typescript
const mutation = useMutation({
  mutationFn: async (data) => {
    // Perform server operation
    const { error } = await supabase.from('table').insert(data);
    if (error) throw error;
  },
  
  // 1. OPTIMISTIC UPDATE (before server responds)
  onMutate: async (newData) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['data'] });
    
    // Snapshot previous value
    const previousData = queryClient.getQueryData(['data']);
    
    // Optimistically update cache
    queryClient.setQueryData(['data'], (old: any[]) => {
      return [...old, newData]; // Add new item immediately
    });
    
    // Return context for rollback
    return { previousData };
  },
  
  // 2. ROLLBACK (if server fails)
  onError: (err, newData, context) => {
    // Restore previous state
    if (context?.previousData) {
      queryClient.setQueryData(['data'], context.previousData);
    }
    
    // Show error to user
    toast({
      title: "Error",
      description: err.message,
      variant: "destructive",
    });
  },
  
  // 3. CONFIRM (after server succeeds)
  onSuccess: () => {
    // Invalidate and refetch to get server truth
    queryClient.invalidateQueries({ queryKey: ['data'] });
  },
});
```

## Implemented Optimistic Updates

### 1. Like/Unlike Posts

**Location**: `src/pages/Feed.tsx`

**What updates optimistically:**
- User's like list (add/remove post ID)
- Post's likes_count (+1 or -1)

**Rollback scenario:**
- Rate limit exceeded
- Network error
- Server error

```typescript
onMutate: async (postId: string) => {
  await queryClient.cancelQueries({ queryKey: ["feed-posts"] });
  const previousPosts = queryClient.getQueryData(["feed-posts"]);
  const previousLikes = queryClient.getQueryData(["user-post-likes"]);

  // Update UI immediately
  queryClient.setQueryData(["user-post-likes"], (old) => {
    const isLiked = old.includes(postId);
    return isLiked ? old.filter(id => id !== postId) : [...old, postId];
  });

  queryClient.setQueryData(["feed-posts"], (old) => {
    return old.map(post => 
      post.id === postId 
        ? { ...post, likes_count: post.likes_count + (isLiked ? -1 : 1) }
        : post
    );
  });

  return { previousPosts, previousLikes };
},

onError: (err, postId, context) => {
  // Rollback if failed
  if (context?.previousPosts) {
    queryClient.setQueryData(["feed-posts"], context.previousPosts);
  }
  if (context?.previousLikes) {
    queryClient.setQueryData(["user-post-likes"], context.previousLikes);
  }
},
```

### 2. Follow/Unfollow Users

**Locations**: 
- `src/pages/Search.tsx`
- `src/pages/FollowersList.tsx`
- `src/pages/UserProfile.tsx` (future)

**What updates optimistically:**
- User's following list (add/remove user ID)
- Follower/following counts
- Button state (Follow ↔ Following)

**Rollback scenario:**
- Rate limit exceeded
- User blocked
- Network error

```typescript
onMutate: async (userId: string) => {
  await queryClient.cancelQueries({ queryKey: ["user-follows"] });
  const previousFollows = queryClient.getQueryData(["user-follows"]);

  queryClient.setQueryData(["user-follows"], (old: string[]) => {
    const isFollowing = old.includes(userId);
    return isFollowing 
      ? old.filter(id => id !== userId) 
      : [...old, userId];
  });

  return { previousFollows };
},

onError: (err, userId, context) => {
  if (context?.previousFollows) {
    queryClient.setQueryData(["user-follows"], context.previousFollows);
  }
  toast({ title: "Error", description: err.message });
},
```

### 3. Add Comments

**Location**: `src/pages/Feed.tsx`

**What updates optimistically:**
- Comments list (add new comment)
- Comments count (+1)

**Future enhancement - not yet implemented:**

```typescript
onMutate: async (newComment) => {
  const previousComments = queryClient.getQueryData(["comments", postId]);
  
  // Add temporary comment with optimistic ID
  queryClient.setQueryData(["comments", postId], (old: any[]) => [
    ...old,
    {
      id: `temp-${Date.now()}`,
      ...newComment,
      created_at: new Date().toISOString(),
    }
  ]);

  return { previousComments };
},
```

### 4. Bookmark Posts

**Location**: `src/pages/Feed.tsx`

**Future enhancement:**

```typescript
onMutate: async (postId: string) => {
  const previousBookmarks = queryClient.getQueryData(["user-bookmarks"]);
  
  queryClient.setQueryData(["user-bookmarks"], (old: string[]) => {
    return old.includes(postId) 
      ? old.filter(id => id !== postId)
      : [...old, postId];
  });

  return { previousBookmarks };
},

onError: (err, postId, context) => {
  if (context?.previousBookmarks) {
    queryClient.setQueryData(["user-bookmarks"], context.previousBookmarks);
  }
},
```

## Best Practices

### 1. Always Cancel Outgoing Queries

```typescript
onMutate: async () => {
  // Prevent race conditions
  await queryClient.cancelQueries({ queryKey: ['data'] });
  // ... optimistic update
}
```

### 2. Snapshot Previous State

```typescript
// Capture state for rollback
const previousData = queryClient.getQueryData(['data']);
return { previousData }; // Pass to onError
```

### 3. Update All Related Queries

```typescript
// Update all queries that show this data
queryClient.setQueryData(['posts'], updateFn);
queryClient.setQueryData(['user-posts'], updateFn);
queryClient.setQueryData(['feed'], updateFn);
```

### 4. Handle Edge Cases

```typescript
queryClient.setQueryData(['data'], (old: any[] | undefined) => {
  // Handle undefined/null
  if (!old) return old;
  
  // Handle empty arrays
  if (old.length === 0) return [newItem];
  
  // Normal update
  return [...old, newItem];
});
```

### 5. Invalidate After Success

```typescript
onSuccess: () => {
  // Get fresh data from server
  queryClient.invalidateQueries({ queryKey: ['data'] });
}
```

## Anti-Patterns to Avoid

### ❌ No Rollback

```typescript
// BAD - no rollback on error
const mutation = useMutation({
  mutationFn: async () => await api.action(),
  onMutate: () => {
    queryClient.setQueryData(['data'], newData); // Optimistic update
  },
  // Missing onError with rollback!
});
```

### ❌ Not Canceling Queries

```typescript
// BAD - race condition possible
onMutate: () => {
  // Missing: await queryClient.cancelQueries()
  queryClient.setQueryData(['data'], newData);
}
```

### ❌ Not Returning Context

```typescript
// BAD - no way to rollback
onMutate: () => {
  const previous = queryClient.getQueryData(['data']);
  queryClient.setQueryData(['data'], newData);
  // Missing: return { previous };
}
```

### ❌ No Error Handling

```typescript
// BAD - user sees success but action failed
onMutate: () => {
  queryClient.setQueryData(['data'], newData);
},
// Missing onError handler!
```

## Advanced Patterns

### Pattern 1: Counter Updates

```typescript
// Increment/decrement counters optimistically
queryClient.setQueryData(['post', postId], (old: Post) => ({
  ...old,
  likes_count: old.likes_count + (isLiked ? -1 : 1),
  comments_count: old.comments_count + 1,
}));
```

### Pattern 2: List Additions

```typescript
// Add to beginning of list
queryClient.setQueryData(['posts'], (old: Post[]) => [
  newPost,
  ...old
]);

// Add to end of list
queryClient.setQueryData(['posts'], (old: Post[]) => [
  ...old,
  newPost
]);
```

### Pattern 3: List Removals

```typescript
queryClient.setQueryData(['posts'], (old: Post[]) => 
  old.filter(post => post.id !== deletedId)
);
```

### Pattern 4: Item Updates

```typescript
queryClient.setQueryData(['posts'], (old: Post[]) => 
  old.map(post => 
    post.id === updatedId 
      ? { ...post, ...updates }
      : post
  )
);
```

### Pattern 5: Nested Updates

```typescript
// Update nested objects
queryClient.setQueryData(['user'], (old: User) => ({
  ...old,
  profile: {
    ...old.profile,
    ...profileUpdates
  }
}));
```

## Testing Optimistic Updates

### Manual Testing

1. Enable network throttling (Chrome DevTools → Network → Slow 3G)
2. Perform action (like, follow, etc.)
3. Verify UI updates immediately
4. Wait for server response
5. Verify UI remains correct

### Testing Rollback

1. Perform action that will fail (e.g., like when offline)
2. Verify UI updates optimistically
3. Verify UI rolls back when error occurs
4. Verify error message shows

### Edge Cases to Test

- Multiple rapid actions
- Concurrent actions on same item
- Actions while offline
- Actions during slow network
- Actions that fail rate limiting

## Performance Considerations

### 1. Cancel Queries to Prevent Race Conditions

```typescript
await queryClient.cancelQueries({ queryKey: ['data'] });
```

### 2. Update Multiple Queries Efficiently

```typescript
// Update all at once, not sequentially
await Promise.all([
  queryClient.setQueryData(['query1'], update1),
  queryClient.setQueryData(['query2'], update2),
]);
```

### 3. Avoid Excessive Updates

```typescript
// ✅ Good - single update
queryClient.setQueryData(['posts'], (old) => 
  old.map(post => post.id === id ? {...post, liked: true, likes_count: post.likes_count + 1} : post)
);

// ❌ Bad - multiple updates
queryClient.setQueryData(['posts'], old => old.map(p => p.id === id ? {...p, liked: true} : p));
queryClient.setQueryData(['posts'], old => old.map(p => p.id === id ? {...p, likes_count: p.likes_count + 1} : p));
```

## Error Recovery Strategies

### Strategy 1: Silent Rollback

```typescript
onError: (err, variables, context) => {
  // Rollback without showing error for non-critical actions
  if (context?.previousData) {
    queryClient.setQueryData(['data'], context.previousData);
  }
  // Only log, don't show toast
  console.error('Optimistic update failed:', err);
}
```

### Strategy 2: Retry with Notification

```typescript
onError: (err, variables, context) => {
  // Rollback
  if (context?.previousData) {
    queryClient.setQueryData(['data'], context.previousData);
  }
  
  // Offer retry
  toast({
    title: "Action failed",
    description: "Would you like to try again?",
    action: <Button onClick={() => mutation.mutate(variables)}>Retry</Button>
  });
}
```

### Strategy 3: Queue for Later

```typescript
onError: (err, variables, context) => {
  // Rollback UI
  rollback(context);
  
  // Queue action for when back online
  if (!navigator.onLine) {
    queueForOffline(variables);
    toast({ title: "Saved for when you're back online" });
  }
}
```

## Debugging

### Enable Query DevTools

```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

### Log Optimistic Updates

```typescript
onMutate: async (data) => {
  console.log('Optimistic update:', data);
  // ... optimistic logic
},

onError: (err, data, context) => {
  console.log('Rolling back:', context);
  // ... rollback logic
},

onSuccess: () => {
  console.log('Confirmed by server');
}
```

## Related Hooks

### useOptimisticUpdate Hook

**Location**: `src/hooks/useOptimisticUpdate.ts`

Custom hook for managing optimistic updates outside of TanStack Query:

```typescript
const {
  data,
  addOptimistic,
  removeOptimistic,
  updateOptimistic,
  confirmUpdate,
  rollback
} = useOptimisticUpdate(initialData);

// Add item optimistically
addOptimistic(newItem);

// On success
confirmUpdate(serverData);

// On error
rollback();
```

## Future Enhancements

1. **Optimistic Comment Additions**
   - Show comment immediately
   - Assign temporary ID
   - Replace with server ID on success

2. **Optimistic Post Creation**
   - Show post in feed immediately
   - Mark as "Posting..." status
   - Update with server response

3. **Optimistic Profile Updates**
   - Update UI immediately
   - Show "Saving..." indicator
   - Confirm or rollback

4. **Offline Queue**
   - Queue failed actions when offline
   - Retry when connection restored
   - Show pending actions to user

5. **Conflict Resolution**
   - Detect concurrent updates
   - Merge changes intelligently
   - Ask user to resolve conflicts

## Related Documentation

- [Loading States Guide](./LOADING_STATES.md)
- [Error Handling Guide](./ERROR_HANDLING.md)
- [Rate Limiting Guide](./RATE_LIMITING.md)
- [Offline Support](./OFFLINE_SUPPORT.md)

## Resources

- [TanStack Query Optimistic Updates](https://tanstack.com/query/latest/docs/react/guides/optimistic-updates)
- [React Optimistic UI](https://react.dev/reference/react-dom/hooks/useOptimistic)
- [Optimistic UI Patterns](https://www.patterns.dev/posts/optimistic-ui)
