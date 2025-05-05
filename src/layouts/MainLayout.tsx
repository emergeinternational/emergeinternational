
import React from "react";
import ShopNavigation from "@/components/shop/ShopNavigation";
import ErrorBoundary from "@/components/shop/ErrorBoundary";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <ErrorBoundary fallback={
          <header className="bg-white shadow-sm">
            <div className="container mx-auto px-4 py-4">
              <h1 className="text-xl font-bold">Emerge Shop</h1>
            </div>
          </header>
        }>
          <header className="bg-white shadow-sm">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-bold">Emerge Shop</h1>
                <ShopNavigation />
              </div>
            </div>
          </header>
        </ErrorBoundary>
        
        {/* Main content */}
        <main>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
        
        {/* Footer */}
        <footer className="bg-white border-t mt-auto py-6">
          <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Emerge Shop. All rights reserved.
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
};

export default MainLayout;
