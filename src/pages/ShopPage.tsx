
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
  
  // Check auth status on component mount
  useEffect(() => {
    try {
      console.log("ShopPage component is rendering");
      
      const checkAuth = async () => {
        // Get initial synchronous status
        const authStatus = getAuthStatus();
        console.log("Auth status in ShopPage:", authStatus);
        
        // If authStatus includes role, set it
        if (authStatus) {
          setUserRole(authStatus.role || null);
        }
        
        setAuthChecked(true);
        setIsLoading(false);
      };
      
      checkAuth();
    } catch (error) {
      console.error("Error checking auth status:", error);
      setAuthChecked(true);
      setIsLoading(false);
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
  
  return (
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
      <Shop userRole={userRole} />
    </ErrorBoundary>
  );
};

export default ShopPage;
