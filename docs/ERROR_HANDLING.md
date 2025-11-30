# Error Handling Guide

This document outlines the comprehensive error handling strategy implemented in the application.

## Overview

The application uses a multi-layered error handling approach:

1. **Global Error Boundaries** - Catch React component errors at the app level
2. **Route Error Boundaries** - Isolate errors to specific routes
3. **Async Error Boundaries** - Handle async operation failures inline
4. **useErrorHandler Hook** - Consistent error handling in components
5. **Global Error Handlers** - Catch unhandled promise rejections and window errors
6. **Backend Error Logging** - Track all errors for monitoring and debugging

## Error Boundaries

### Global Error Boundary

Wraps the entire application and catches all unhandled React errors:

```tsx
// Already implemented in main.tsx
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

### Route Error Boundary

Isolates errors to specific routes, allowing navigation to other parts of the app:

```tsx
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';

<Route 
  path="/medical" 
  element={
    <RouteErrorBoundary>
      <ProtectedRoute>
        <Layout>
          <MedicalHistory />
        </Layout>
      </ProtectedRoute>
    </RouteErrorBoundary>
  } 
/>
```

### Async Error Boundary

For handling async operations with inline error display:

```tsx
import { AsyncErrorBoundary } from '@/components/AsyncErrorBoundary';

<AsyncErrorBoundary onRetry={fetchData}>
  <DataComponent />
</AsyncErrorBoundary>
```

## useErrorHandler Hook

### Basic Usage

```tsx
import { useErrorHandler } from '@/hooks/useErrorHandler';

function MyComponent() {
  const { handleError, safeAsync } = useErrorHandler({
    showToast: true,
    toastTitle: 'Failed to load data',
  });

  const fetchData = async () => {
    try {
      const response = await api.getData();
      return response;
    } catch (error) {
      handleError(error, 'Could not fetch your data');
    }
  };
}
```

### Safe Async Pattern

Returns `[error, data]` tuple for clean error handling:

```tsx
const loadUserProfile = async () => {
  const [error, profile] = await safeAsync(async () => {
    return await supabase
      .from('profiles')
      .select('*')
      .single();
  });

  if (error) {
    // Error already logged and toast shown
    return;
  }

  // Use profile data
  setProfile(profile);
};
```

### Wrap Async Functions

Automatically wrap async functions with error handling:

```tsx
const { wrapAsync } = useErrorHandler();

const handleSubmit = wrapAsync(async (data) => {
  await supabase.from('posts').insert(data);
  toast.success('Posted successfully!');
});
```

## Error Logging

All errors are automatically logged to the backend with:

- Error message and stack trace
- Component stack (for React errors)
- User ID (if authenticated)
- URL and user agent
- Severity level (low/medium/high/critical)
- Custom context data

### Manual Error Logging

```tsx
import { logError } from '@/lib/errorTracking';

try {
  // risky operation
} catch (error) {
  logError(error, undefined, {
    operation: 'payment-processing',
    amount: paymentAmount,
  });
}
```

## Error Severity Levels

The system automatically determines error severity:

- **Critical**: Auth failures, network errors, TypeErrors
- **High**: Database errors, payment errors, security errors
- **Medium**: Validation errors, 404s, permission errors
- **Low**: Other errors

## Best Practices

### 1. Use Error Boundaries for UI Components

```tsx
// ✅ Good
<ErrorBoundary>
  <ComplexFeature />
</ErrorBoundary>

// ❌ Bad - no error boundary
<ComplexFeature />
```

### 2. Handle Async Operations Consistently

```tsx
// ✅ Good
const { safeAsync } = useErrorHandler();
const [error, data] = await safeAsync(() => fetchData());

// ❌ Bad - inconsistent error handling
try {
  const data = await fetchData();
} catch (e) {
  console.log(e); // Not logged to backend
}
```

### 3. Provide User-Friendly Error Messages

```tsx
// ✅ Good
handleError(error, 'We couldn\'t save your workout. Please try again.');

// ❌ Bad
handleError(error, error.message); // May show technical jargon
```

### 4. Add Context to Errors

```tsx
// ✅ Good
logError(error, undefined, {
  feature: 'meal-logging',
  mealType: 'breakfast',
  timestamp: Date.now(),
});

// ❌ Bad - no context
logError(error);
```

### 5. Test Error Scenarios

Always test:
- Network failures
- Invalid data
- Authentication errors
- Rate limit errors
- Permission errors

## Monitoring

Error logs are stored in the `error_logs` table and can be viewed by admins. The system automatically:

- Cleans up old resolved errors (30 days)
- Cleans up old low/medium severity errors (90 days)
- Indexes by severity, user, and timestamp for fast queries

## Global Error Handlers

The application sets up global handlers for:

- Unhandled promise rejections
- Window errors
- Console errors (in production)

These are automatically initialized in `main.tsx`.

## Error Recovery

### Retry Mechanisms

```tsx
const [retryCount, setRetryCount] = useState(0);

const fetchWithRetry = async () => {
  try {
    const data = await fetchData();
    setRetryCount(0); // Reset on success
    return data;
  } catch (error) {
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
      setTimeout(fetchWithRetry, 1000 * (retryCount + 1)); // Exponential backoff
    } else {
      handleError(error);
    }
  }
};
```

### Fallback UI

Always provide fallback UI for critical features:

```tsx
<ErrorBoundary
  fallback={
    <div className="p-4 text-center">
      <p>This feature is temporarily unavailable.</p>
      <Button onClick={() => window.location.reload()}>
        Refresh Page
      </Button>
    </div>
  }
>
  <CriticalFeature />
</ErrorBoundary>
```

## Testing Error Handling

```tsx
// Simulate errors in development
if (import.meta.env.DEV) {
  // Force error
  throw new Error('Test error');
  
  // Force async error
  Promise.reject(new Error('Test async error'));
  
  // Force unhandled rejection
  new Promise(() => {
    throw new Error('Unhandled');
  });
}
```
