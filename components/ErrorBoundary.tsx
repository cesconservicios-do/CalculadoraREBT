import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message || 'Error desconocido' };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary capturó un error:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, message: '' });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center gap-6 p-10 text-center bg-slate-900">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
            <AlertTriangle className="text-red-500" size={28} />
          </div>
          <div>
            <h3 className="text-white font-black uppercase italic text-lg mb-2">Se ha producido un error</h3>
            <p className="text-slate-500 text-xs max-w-md">{this.state.message}</p>
          </div>
          <button
            onClick={this.handleReset}
            aria-label="Reintentar"
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase transition-all"
          >
            <RotateCcw size={14} /> Reintentar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
