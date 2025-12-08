import { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { logError } from '@/lib/errorTracking';

interface Props {
  children: ReactNode;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Lightweight error boundary for async operations
 * Shows inline error message with retry option
 */
export class AsyncErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logError(error, errorInfo, {
      componentName: 'AsyncErrorBoundary',
      type: 'async-operation',
    });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    this.props.onRetry?.();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span className="flex-1">
              {this.state.error?.message || 'An unexpected error occurred'}
            </span>
            {this.props.onRetry && (
              <Button 
                onClick={this.handleRetry} 
                variant="outline" 
                size="sm"
                className="ml-4"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Retry
              </Button>
            )}
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}
