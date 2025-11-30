# Loading States Guide

This document outlines the loading state strategy implemented across the application for better user experience.

## Overview

The application uses a comprehensive loading state system with:

1. **Skeleton Loaders** - Visual placeholders that match content structure
2. **Loading State Hooks** - Utilities for managing loading states
3. **Lazy Loading** - Components and images load on-demand
4. **Optimized Images** - Progressive image loading with placeholders

## Skeleton Components

### Available Skeletons

```tsx
import {
  PostSkeleton,
  CardSkeleton,
  ListItemSkeleton,
  WorkoutSkeleton,
  MealSkeleton,
  TableSkeleton,
  PhotoGridSkeleton,
  FormSkeleton,
  DashboardSkeleton,
  PageLoadingSkeleton,
} from '@/components/LoadingSkeleton';
```

### Usage Examples

#### Basic Card Loading
```tsx
{isLoading ? (
  <CardSkeleton />
) : (
  <Card>{content}</Card>
)}
```

#### Multiple Items Loading
```tsx
{isLoading ? (
  <>
    <WorkoutSkeleton />
    <WorkoutSkeleton />
    <WorkoutSkeleton />
  </>
) : (
  workouts.map(workout => <WorkoutCard key={workout.id} {...workout} />)
)}
```

#### Full Page Loading
```tsx
if (loading) {
  return <PageLoadingSkeleton />;
}

return <YourContent />;
```

## Loading State Hooks

### useLoadingState

For managing multiple loading operations:

```tsx
import { useLoadingState } from '@/hooks/useLoadingState';

function MyComponent() {
  const { setLoading, isLoading, withLoading } = useLoadingState();

  const fetchData = async () => {
    await withLoading('fetchData', async () => {
      const data = await api.getData();
      setData(data);
    });
  };

  const saveData = async () => {
    await withLoading('saveData', async () => {
      await api.saveData(data);
    });
  };

  return (
    <>
      {isLoading('fetchData') && <p>Loading data...</p>}
      <Button 
        onClick={saveData} 
        disabled={isLoading('saveData')}
      >
        {isLoading('saveData') ? 'Saving...' : 'Save'}
      </Button>
    </>
  );
}
```

### useSimpleLoading

For single operation loading:

```tsx
import { useSimpleLoading } from '@/hooks/useLoadingState';

function MyComponent() {
  const { isLoading, withLoading } = useSimpleLoading();

  const handleSubmit = async () => {
    await withLoading(async () => {
      await api.submit(data);
      toast.success('Submitted!');
    });
  };

  return (
    <Button onClick={handleSubmit} disabled={isLoading}>
      {isLoading ? 'Submitting...' : 'Submit'}
    </Button>
  );
}
```

## Best Practices

### 1. Match Skeleton to Content Structure

```tsx
// ✅ Good - skeleton matches actual content
{isLoading ? (
  <div className="space-y-4">
    <WorkoutSkeleton />
    <WorkoutSkeleton />
  </div>
) : (
  <div className="space-y-4">
    {workouts.map(w => <WorkoutCard key={w.id} {...w} />)}
  </div>
)}

// ❌ Bad - doesn't match structure
{isLoading ? <CardSkeleton /> : <WorkoutList />}
```

### 2. Use Specific Skeletons

```tsx
// ✅ Good - use appropriate skeleton type
{loadingMeals && <MealSkeleton />}
{loadingWorkouts && <WorkoutSkeleton />}

// ❌ Bad - generic skeleton for everything
{loading && <CardSkeleton />}
```

### 3. Show Partial Content While Loading More

```tsx
// ✅ Good - show existing data, skeleton for new data
<>
  {data.map(item => <Item key={item.id} {...item} />)}
  {loadingMore && <ListItemSkeleton />}
</>

// ❌ Bad - hide all content while loading more
{loadingMore ? <ListItemSkeleton /> : data.map(...)}
```

### 4. Provide Visual Feedback for Actions

```tsx
// ✅ Good - button shows loading state
<Button disabled={isUploading}>
  {isUploading ? (
    <>
      <Loader className="animate-spin mr-2" />
      Uploading...
    </>
  ) : (
    'Upload'
  )}
</Button>

// ❌ Bad - no feedback
<Button onClick={upload}>Upload</Button>
```

### 5. Handle Error States

```tsx
// ✅ Good - handle loading, error, and success states
{isLoading && <Skeleton />}
{error && <ErrorMessage error={error} />}
{data && <Content data={data} />}

// ❌ Bad - only handle loading state
{isLoading ? <Skeleton /> : <Content data={data} />}
```

## Lazy Loading

### Lazy Load Components

```tsx
import { LazyLoad } from '@/components/LazyLoad';

<LazyLoad 
  placeholder={<CardSkeleton />}
  onVisible={() => console.log('Component visible')}
>
  <HeavyComponent />
</LazyLoad>
```

### Lazy Load Images

```tsx
import { OptimizedImage } from '@/components/OptimizedImage';

<OptimizedImage
  src="/large-image.jpg"
  alt="Description"
  placeholder="/thumbnail.jpg" // Optional low-res placeholder
  priority={false} // true for above-the-fold images
/>
```

## Loading State Patterns

### Pagination Loading

```tsx
const [page, setPage] = useState(1);
const { isLoading } = useSimpleLoading();

{data.map(item => <Item key={item.id} {...item} />)}
{isLoading && (
  <>
    <ListItemSkeleton />
    <ListItemSkeleton />
    <ListItemSkeleton />
  </>
)}
```

### Infinite Scroll

```tsx
import { useInView } from 'react-intersection-observer';

const { ref, inView } = useInView();

useEffect(() => {
  if (inView && !isLoading && hasMore) {
    loadMore();
  }
}, [inView, isLoading, hasMore]);

return (
  <>
    {items.map(item => <Item key={item.id} {...item} />)}
    <div ref={ref}>
      {isLoading && <ListItemSkeleton />}
    </div>
  </>
);
```

### Optimistic Updates

```tsx
const { withLoading } = useSimpleLoading();

const handleLike = async () => {
  // Optimistically update UI
  setLiked(true);
  setLikesCount(prev => prev + 1);

  try {
    await withLoading(async () => {
      await api.like(postId);
    });
  } catch (error) {
    // Revert on error
    setLiked(false);
    setLikesCount(prev => prev - 1);
  }
};
```

## Performance Tips

### 1. Avoid Layout Shifts

Ensure skeletons match the size of actual content:

```tsx
<Skeleton className="h-20 w-full" /> // Matches actual content height
```

### 2. Limit Skeleton Count

Don't render excessive skeletons:

```tsx
// ✅ Good - reasonable number
{[...Array(3)].map((_, i) => <Skeleton key={i} />)}

// ❌ Bad - too many
{[...Array(100)].map((_, i) => <Skeleton key={i} />)}
```

### 3. Use Suspense Boundaries

Wrap lazy-loaded components in Suspense:

```tsx
<Suspense fallback={<PageLoadingSkeleton />}>
  <LazyComponent />
</Suspense>
```

### 4. Prefetch Critical Data

Start loading critical data early:

```tsx
useEffect(() => {
  // Prefetch on mount
  queryClient.prefetchQuery(['userData'], fetchUser);
}, []);
```

## Animation Considerations

Skeletons include subtle animations by default:

```tsx
// Default pulse animation
<Skeleton className="animate-pulse" />

// Fade in when content loads
<div className="animate-in fade-in-50 duration-300">
  {content}
</div>
```

Avoid excessive animation that could distract users or cause performance issues.

## Accessibility

Loading states should be accessible:

```tsx
// Use aria-live for status updates
<div aria-live="polite" aria-busy={isLoading}>
  {isLoading ? 'Loading...' : content}
</div>

// Use aria-label for loading indicators
<button disabled={isLoading} aria-label={isLoading ? 'Loading' : 'Submit'}>
  {isLoading ? <Spinner /> : 'Submit'}
</button>
```

## Testing Loading States

Always test loading states:

```tsx
// Simulate slow network
if (import.meta.env.DEV) {
  await new Promise(resolve => setTimeout(resolve, 2000));
}

// Test different loading durations
const MOCK_DELAY = {
  fast: 300,
  normal: 1000,
  slow: 3000,
};
```
