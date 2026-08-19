import { Component } from 'react';
import Button from '@/components/ui/Button';
import { reportClientError } from '@/lib/clientError';

/**
 * Catches render / lazy-import failures so the site never stays a blank white page.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info?.componentStack);
    reportClientError(error, {
      source: 'error-boundary',
      path: typeof window !== 'undefined' ? window.location.pathname : '',
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 py-16 text-center">
          <p className="font-display text-lg font-bold text-navy">Something went wrong</p>
          <p className="max-w-md text-sm text-body">
            The page failed to load. This can happen after an update — a refresh usually fixes it.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button type="button" variant="dealerPrimary" onClick={this.handleReload}>
              Refresh page
            </Button>
            <Button type="button" variant="dealerSecondary" onClick={this.handleHome}>
              Go home
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/** Optional widgets — hide the block if it crashes; never blank the page. */
export function SoftBoundary({ children, fallback = null }) {
  return <ErrorBoundary fallback={fallback}>{children}</ErrorBoundary>;
}
