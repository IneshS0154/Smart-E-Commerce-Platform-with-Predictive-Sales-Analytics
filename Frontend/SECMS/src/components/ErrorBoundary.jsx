import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full p-8 text-center animate-fade-in">
            <div className="mb-6">
              <svg 
                className="w-16 h-16 mx-auto text-red-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold uppercase tracking-wider mb-4">
              Something Went Wrong
            </h1>
            <p className="text-gray-600 mb-8">
              We're sorry, but something unexpected happened. Please try again.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={this.handleReload}
                className="bg-black text-white px-6 py-3 font-semibold uppercase tracking-wider transition-all duration-300 hover:bg-gray-800 active:scale-95"
              >
                Reload Page
              </button>
              <button
                onClick={this.handleGoHome}
                className="bg-white text-black border-2 border-black px-6 py-3 font-semibold uppercase tracking-wider transition-all duration-300 hover:bg-black hover:text-white active:scale-95"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
