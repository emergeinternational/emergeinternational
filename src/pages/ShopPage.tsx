
import React, { useState, useEffect } from 'react';
import Shop from './Shop';
import ErrorBoundary from '@/components/shop/ErrorBoundary';
import { toast } from 'sonner';
import { getAuthStatus, hasShopAdminAccess } from '@/services/shopAuthService';
import { getShopSystemSettings } from '@/services/shopSystemService';
import { Loader2 } from 'lucide-react';
import { useShopSafeguard } from '@/hooks/useShopSafeguard';

const ShopPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(false);
  
  // Activate the safeguard hook to monitor dependencies
  useShopSafeguard();
  
  // Check auth status and system settings on component mount
  useEffect(() => {
    try {
      console.log("ShopPage component is rendering");
      
      const checkAuthAndSettings = async () => {
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
        
        // Check if diagnostics should be shown
        const enableDiagnostics = new URLSearchParams(window.location.search).get('diagnostics') === 'true';
        
        if (enableDiagnostics) {
          // Only show diagnostics if user is admin, otherwise ignore the parameter
          const canAccessDiagnostics = hasShopAdminAccess();
          
          if (canAccessDiagnostics) {
            setShowDiagnostics(true);
          } else {
            console.warn("Non-admin user attempted to access diagnostics mode");
            // Don't show error to user to avoid revealing that diagnostics exist
          }
        } else {
          // If no URL parameter, check system settings for admins
          if (authStatus.isAdmin) {
            try {
              const settings = await getShopSystemSettings();
              setShowDiagnostics(settings.diagnosticsEnabled || false);
            } catch (settingsError) {
              console.error("Error loading system settings:", settingsError);
              // Default to not showing diagnostics if settings can't be loaded
            }
          }
        }
        
        setAuthChecked(true);
        setIsLoading(false);
      };
      
      checkAuthAndSettings();
      
      // Add diagnostics parameter tracking
      const handlePopState = () => {
        const diagnosticsParam = new URLSearchParams(window.location.search).get('diagnostics') === 'true';
        const canAccessDiagnostics = hasShopAdminAccess();
        
        if (diagnosticsParam && canAccessDiagnostics) {
          setShowDiagnostics(true);
        }
      };
      
      window.addEventListener('popstate', handlePopState);
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
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
      {/* Pass user role and diagnostics flag to Shop component */}
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
        <Shop 
          userRole={userRole} 
          showDiagnostics={showDiagnostics}
        />
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
