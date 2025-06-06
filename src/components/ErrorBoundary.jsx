import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
            {/* Error Icon */}
            <div className="text-6xl mb-4">😵</div>
            
            {/* Error Title */}
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              เกิดข้อผิดพลาด
            </h1>
            
            {/* Error Message */}
            <p className="text-gray-600 mb-6">
              แอปพลิเคชันเกิดปัญหาไม่คาดคิด กรุณารีเฟรชหน้าเว็บใหม่
            </p>
            
            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm text-red-600 hover:text-red-800">
                  ดูรายละเอียดข้อผิดพลาด
                </summary>
                <div className="mt-2 p-4 bg-red-50 rounded-lg text-xs">
                  <div className="font-semibold text-red-800 mb-2">Error:</div>
                  <div className="text-red-700 mb-4">{this.state.error.toString()}</div>
                  
                  <div className="font-semibold text-red-800 mb-2">Stack Trace:</div>
                  <pre className="text-red-600 whitespace-pre-wrap overflow-auto max-h-32">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              </details>
            )}
            
            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gradient-to-r from-shrimp-500 to-shrimp-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-shrimp-600 hover:to-shrimp-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                🔄 รีเฟรชหน้าเว็บ
              </button>
              
              <button
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                className="w-full bg-white text-shrimp-600 border-2 border-shrimp-500 px-6 py-3 rounded-xl font-semibold hover:bg-shrimp-50 transition-all duration-300"
              >
                ลองอีกครั้ง
              </button>
            </div>
            
            {/* App Info */}
            <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-500">
              ราคากุ้ง 22 ไซต์ • React + Vite
            </div>
          </div>
        </div>
      )
    }

    // Normal render
    return this.props.children
  }
}

export default ErrorBoundary