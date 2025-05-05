
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeAuth } from './services/shopAuthService.ts'

// Initialize auth on app load - wrapped in try-catch to prevent blank screens
try {
  // Call the auth initialization but catch any errors to prevent app from crashing
  const initAuth = async () => {
    try {
      await initializeAuth();
    } catch (error) {
      console.error("Failed to initialize auth, continuing with app startup:", error);
    }
    
    // Render the app regardless of auth initialization success
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )
  };
  
  initAuth();
} catch (error) {
  // Fallback rendering if something goes wrong with the auth initialization
  console.error("Critical error during app startup:", error);
  
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-red-500 p-4 border border-red-300 rounded">
          Shop module temporarily unavailable. Please try refreshing the page.
        </div>
      </div>
    </React.StrictMode>,
  )
}
