import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ErrorPage } from '@/pages/ErrorPage';

interface Props {
  children: ReactNode;
  /** Optional custom fallback. */
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Catches uncaught render-time errors in any subtree and shows the branded
 * ErrorPage instead of a blank screen. Used in main.tsx to wrap the entire app,
 * and inside DashboardLayout to keep the sidebar visible when a sub-page crashes.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, info);
  }

  reset = () => this.setState({ hasError: false, error: undefined });

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <ErrorPage
          code="Error"
          title="Something broke"
          message={this.state.error?.message ?? 'An unexpected error occurred while rendering this page.'}
          onRetry={this.reset}
        />
      );
    }
    return this.props.children;
  }
}
