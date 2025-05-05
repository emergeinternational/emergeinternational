
import React, { useState, useEffect } from 'react';
import Shop from './Shop';
import ErrorBoundary from '@/components/shop/ErrorBoundary';
import { toast } from 'sonner';
import { getAuthStatus } from '@/services/shopAuthService';
import { Loader2 } from 'lucide-react';

const ShopPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  
  // Check auth status on component mount
  useEffect(() => {
    try {
      console.log("ShopPage component is rendering");
      
      const checkAuth = async () => {
        // Get initial synchronous status
        const authStatus = getAuthStatus();
        console.log("Auth status in ShopPage:", authStatus);
        
        // Extract user role based on permissions
        let role = null;
        if (authStatus.isAdmin) {
          role = 'admin';
        } else if (authStatus.isEditor) {
          role = 'editor';
        }
        
        setUserRole(role);
        setAuthChecked(true);
        setIsLoading(false);
      };
      
      checkAuth();
    } catch (error) {
      console.error("Error checking auth status:", error);
      setAuthChecked(true);
      setIsLoading(false);
      setHasError(true);
      toast.error("Failed to verify user permissions");
    }
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-emerge-gold" />
          <p>Loading Shop...</p>
        </div>
      </div>
    );
  }

  // Default layout fallback if the component is rendered outside its expected layout
  const FallbackLayout: React.FC<{children: React.ReactNode}> = ({ children }) => {
    return (
      <div style={{ padding: '2rem' }} className="min-h-screen bg-gray-50">
        {children}
      </div>
    );
  };
  
  // Determine if we're rendering within a parent layout
  const needsFallbackLayout = () => {
    // Check if we're at the root level without a layout
    return document.querySelector('main, header, footer') === null;
  };
  
  const content = (
    <ErrorBoundary
      fallback={
        <div className="container mx-auto p-8">
          <div className="bg-red-600 text-white p-4 mb-4 rounded-md">
            <h2 className="text-lg font-bold">Shop Error</h2>
            <p>An error occurred while loading the Shop page. Please try again later.</p>
          </div>
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      }
    >
      {/* Pass user role to Shop component */}
      {hasError ? (
        <div className="container mx-auto p-8">
          <h2 className="text-xl font-bold mb-4">Shop is temporarily unavailable</h2>
          <p className="mb-4">Please check back shortly.</p>
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      ) : (
        <Shop userRole={userRole} />
      )}
    </ErrorBoundary>
  );
  
  // Render with fallback layout if needed
  return needsFallbackLayout() ? (
    <FallbackLayout>{content}</FallbackLayout>
  ) : (
    content
  );
};

export default ShopPage;
