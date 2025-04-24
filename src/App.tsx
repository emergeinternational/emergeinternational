
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "./hooks/useCart";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import RoleBasedRoute from "./components/auth/RoleBasedRoute";

// Import all page components
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import EmailLogin from "./pages/EmailLogin";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Education from "./pages/Education";
import Donations from "./pages/Donations";
import Payment from "./pages/Payment";
import Dashboard from "./pages/admin/Dashboard";
import UsersPage from "./pages/admin/UsersPage";
import Events from "./pages/Events";
import Profile from "./pages/Profile";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import About from "./pages/About";
import Workshops from "./pages/Workshops";
import Contact from "./pages/Contact";

const queryClient = new QueryClient();

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  return !user ? <>{children}</> : <Navigate to="/" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/email-login" element={<PublicRoute><EmailLogin /></PublicRoute>} />
              <Route path="/home" element={<Landing />} />
              
              {/* Public Routes - Accessible without authentication */}
              <Route path="/education" element={<Education />} />
              <Route path="/workshops" element={<Workshops />} />
              <Route path="/about" element={<About />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/contact" element={<Contact />} />
              
              {/* Protected Routes - Require authentication */}
              <Route path="/shop" element={<PrivateRoute><Shop /></PrivateRoute>} />
              <Route path="/shop/product/:id" element={<PrivateRoute><ProductDetail /></PrivateRoute>} />
              <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
              <Route path="/donations" element={<PrivateRoute><Donations /></PrivateRoute>} />
              <Route path="/payment" element={<PrivateRoute><Payment /></PrivateRoute>} />
              <Route path="/events" element={<PrivateRoute><Events /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
              
              {/* Admin Routes - Require specific roles */}
              <Route path="/admin" element={
                <RoleBasedRoute allowedRoles={['admin', 'editor', 'viewer']}>
                  <Dashboard />
                </RoleBasedRoute>
              } />
              <Route path="/admin/users" element={
                <RoleBasedRoute allowedRoles={['admin']}>
                  <UsersPage />
                </RoleBasedRoute>
              } />
              <Route path="/admin/events" element={
                <RoleBasedRoute allowedRoles={['admin', 'editor']}>
                  <Dashboard />
                </RoleBasedRoute>
              } />
              <Route path="/admin/donations" element={
                <RoleBasedRoute allowedRoles={['admin', 'editor']}>
                  <Dashboard />
                </RoleBasedRoute>
              } />
              
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
