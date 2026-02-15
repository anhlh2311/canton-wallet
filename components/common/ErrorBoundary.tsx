import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangleIcon, RefreshCwIcon } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center h-full p-6 bg-background text-center">
          <AlertTriangleIcon className="w-10 h-10 text-destructive mb-4" />
          <h2 className="text-sm font-semibold text-foreground mb-1">Something went wrong</h2>
          <p className="text-xs text-muted-foreground mb-4 max-w-[280px]">
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-xs font-medium"
          >
            <RefreshCwIcon className="w-3.5 h-3.5" /> Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
