import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-64 rounded-3xl border border-rose-500/20 bg-rose-500/5 p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4">
            <AlertTriangle className="w-7 h-7 text-rose-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Something went wrong</h3>
          <p className="text-sm text-text-muted mb-6 max-w-md">
            {this.state.error?.message || 'An unexpected error occurred. Please try refreshing the page.'}
          </p>
          <div className="flex gap-3">
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-primary-light transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
