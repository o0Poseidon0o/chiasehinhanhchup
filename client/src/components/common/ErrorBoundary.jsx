import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Potonow Application Error:', error, errorInfo);
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
        <div className="min-h-screen bg-[#0a0b0e] text-[#f8fafc] flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#141720] border border-amber-500/30 rounded-3xl p-6 sm:p-8 text-center shadow-2xl space-y-5">
            <div className="inline-flex p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">Đã xảy ra sự cố hiển thị</h2>
              <p className="text-xs text-gray-400 leading-relaxed">
                Hệ thống gặp sự cố tải trang tạm thời. Vui lòng bấm thử lại hoặc quay lại trang chủ.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 bg-[#0c0d12] border border-[#2b3245] rounded-xl text-left text-[11px] text-red-400 font-mono overflow-x-auto max-h-24">
                {this.state.error.message}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-amber-950 font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-lg shadow-amber-500/20 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Tải lại trang</span>
              </button>

              <button
                onClick={this.handleGoHome}
                className="flex-1 py-2.5 px-4 bg-[#0c0d12] hover:bg-[#1a202c] border border-[#2b3245] text-gray-300 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Về trang chủ</span>
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
