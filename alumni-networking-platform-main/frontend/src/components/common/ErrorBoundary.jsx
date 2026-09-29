import React, { Component } from 'react';
import { HiOutlineExclamationCircle, HiRefresh } from 'react-icons/hi';
import Button from './Button.jsx';

/**
 * React Error Boundary to catch render failures gracefully
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught render error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#0B1120] p-6 text-[#CBD5E1]">
          <div className="max-w-md w-full bg-[#151E32] rounded-3xl p-8 text-center shadow-2xl border border-[#26334D]">
            <div className="w-14 h-14 bg-rose-950/80 text-rose-400 border border-rose-800/60 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <HiOutlineExclamationCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-[#F8FAFC] mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-[#94A3B8] mb-6">
              An unexpected client error occurred. Please try reloading the page.
            </p>
            <Button
              variant="primary"
              icon={HiRefresh}
              onClick={this.handleReload}
              className="w-full bg-[#6366F1] hover:bg-[#4F46E5] text-white"
            >
              Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
