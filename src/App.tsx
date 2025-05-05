import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';
import BlogPage from '@/pages/BlogPage';
import ShopPage from '@/pages/ShopPage';
import AuthCallbackPage from '@/pages/AuthCallbackPage';
import ProfilePage from '@/pages/ProfilePage';
import { useAuth } from '@/hooks/useAuth';
import PricingPage from '@/pages/PricingPage';
import LegalPage from '@/pages/LegalPage';
import ShopV2Page from '@/pages/ShopV2Page';

const App: React.FC = () => {
  return (
    <div className="App">
      <div className="min-h-screen">
        <Suspense fallback={<div>Loading...</div>}>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/legal" element={<LegalPage />} />
              <Route path="/auth-callback" element={<AuthCallbackPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              
              {/* Add our new ShopV2 route */}
              <Route path="/shop-v2" element={<ShopV2Page />} />
              
            </Routes>
            
          </BrowserRouter>
        </Suspense>
      </div>
    </div>
  );
};

export default App;
