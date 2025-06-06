import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Error Boundary
import ErrorBoundary from './components/ErrorBoundary.jsx'

// Performance monitoring (Development only)
if (import.meta.env.DEV) {
  // Development only performance logging
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        console.log(`🚀 ${entry.name}: ${entry.duration.toFixed(2)}ms`)
      })
    })
    observer.observe({ entryTypes: ['measure', 'navigation'] })
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)