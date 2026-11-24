import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[VERITAS ErrorBoundary Caught]:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-[#0b0e17] border border-amber-500/50 rounded-2xl p-6 text-center space-y-3 font-mono text-xs my-4 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
          <h3 className="text-sm font-bold text-slate-100">
            {this.props.fallbackTitle || 'Component Visualizer Notice'}
          </h3>
          <p className="text-slate-400 max-w-md mx-auto text-[11px] leading-relaxed">
            {this.state.error?.message || 'A recoverable rendering issue occurred. Click below to reload telemetry.'}
          </p>
          <div className="pt-2">
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/50 text-xs font-semibold cursor-pointer transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Component</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
