
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Initialize global error handler
window.addEventListener('error', (event) => {
  console.error('Global error handler:', event.error);
  
  // Log to server if in production
  if (import.meta.env.PROD) {
    try {
      fetch('/api/log-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: event.error?.message, 
          stack: event.error?.stack,
          source: event.filename,
          line: event.lineno,
          column: event.colno,
          timestamp: new Date().toISOString()
        })
      }).catch(console.error); // Silently catch fetch errors - we don't want error logging to cause more errors
    } catch (e) {
      // Do nothing - just prevent this from breaking the app
    }
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
