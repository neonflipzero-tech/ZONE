import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  language: 'en' | 'id';
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      const isId = this.props.language === 'id';
      let errorMessage = this.state.error?.message || '';
      let displayMessage = isId ? 'Terjadi kesalahan yang tidak terduga.' : 'An unexpected error occurred.';
      
      // Check if it's a Firestore error JSON
      try {
        if (errorMessage.startsWith('{')) {
          const errData = JSON.parse(errorMessage);
          if (errData.error && errData.error.includes('insufficient permissions')) {
            displayMessage = isId 
              ? 'Izin tidak cukup untuk melakukan operasi ini. Silakan hubungi admin.' 
              : 'Insufficient permissions to perform this operation. Please contact an admin.';
          }
        }
      } catch (e) {
        // Not a JSON error, use default
      }

      return (
        <div className="flex flex-col items-center justify-center h-screen bg-black p-6 text-center">
          <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mb-6">
            <span className="text-3xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter italic">
            {isId ? 'WADUH, ADA MASALAH!' : 'OOPS, SOMETHING WENT WRONG!'}
          </h1>
          <p className="text-gray-400 mb-8 max-w-xs">
            {displayMessage}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-white text-black font-black rounded-xl uppercase tracking-widest active:scale-95 transition-transform"
          >
            {isId ? 'MUAT ULANG' : 'RELOAD APP'}
          </button>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <pre className="mt-8 p-4 bg-zinc-900 rounded-lg text-left text-[10px] text-rose-400 overflow-auto max-w-full">
              {this.state.error.stack}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
