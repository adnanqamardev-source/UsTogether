'use client';

import { Component, ReactNode } from 'react';
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ChunkLoadErrors happen when the browser holds HTML from a previous deploy
 * whose hashed JS chunks no longer exist on the server. Retrying the same
 * URL would fail forever, so reload once to fetch fresh HTML — that resolves
 * it. The sessionStorage flag prevents a reload loop if the chunk genuinely
 * 404s (e.g. offline); in that case the fallback UI is shown instead.
 */
function isChunkLoadError(error: Error | null): boolean {
  if (!error) return false;
  return (
    error.name === 'ChunkLoadError' ||
    /loading chunk|failed to load chunk|dynamically imported module/i.test(error.message)
  );
}

const CHUNK_RELOAD_KEY = 'ustogether-chunk-reloaded';

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    if (isChunkLoadError(error) && typeof window !== 'undefined') {
      try {
        if (!window.sessionStorage.getItem(CHUNK_RELOAD_KEY)) {
          window.sessionStorage.setItem(CHUNK_RELOAD_KEY, '1');
          window.location.reload();
        } else {
          window.sessionStorage.removeItem(CHUNK_RELOAD_KEY);
        }
      } catch {
        // sessionStorage unavailable (private mode) — fall through to UI.
      }
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
          <div className="text-6xl mb-4">😢</div>
          <h2 className="text-2xl font-bold text-white mb-2">Something went wrong</h2>
          <p className="text-[#716969] mb-6 max-w-md">
            We encountered an unexpected error. This has been logged and we'll look into it.
          </p>
          <div className="flex items-center gap-3">
            <Button variant="primary" size="md" onClick={this.handleReset}>
              Try Again
            </Button>
            <Button variant="secondary" size="md" onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
