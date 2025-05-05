
import React from 'react';
import Shop from './Shop';
import ErrorBoundary from '@/components/shop/ErrorBoundary';
import { toast } from 'sonner';

const ShopPage: React.FC = () => {
  // Add this console log to detect if the component renders at all
  console.log("ShopPage component is rendering");
  
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
      {/* Debug indicator */}
      <div style={{ background: 'red', color: 'white', padding: '8px', textAlign: 'center' }}>
        ShopPage loaded
      </div>
      
      <Shop />
    </ErrorBoundary>
  );
};

export default ShopPage;
