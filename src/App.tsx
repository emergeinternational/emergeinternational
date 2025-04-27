import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "./hooks/useCart";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import RoleBasedRoute from "./components/auth/RoleBasedRoute";
import TalentRegistration from "./pages/TalentRegistration";
import MediaSubmission from "./pages/MediaSubmission";

// Import all page components
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import EmailLogin from "./pages/EmailLogin";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Education from "./pages/Education";
import CourseDetail from "./pages/CourseDetail";
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
import EventsPage from "./pages/admin/EventsPage";
import DonationsPage from "./pages/admin/DonationsPage";
import OrdersPage from "./pages/admin/OrdersPage";
import SettingsPage from "./pages/admin/SettingsPage";
import TalentsPage from "./pages/admin/TalentsPage";
import CoursesPage from "./pages/admin/CoursesPage";
import PremiumCoursesPage from "./pages/admin/PremiumCoursesPage";

const queryClient = new QueryClient();

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  return !user ? <>{children}</> : <Navigate to="/" replace />;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
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
                
                <Route path="/education" element={<Education />} />
                <Route path="/education/course/:id" element={<CourseDetail />} />
                <Route path="/workshops" element={<Workshops />} />
                <Route path="/about" element={<About />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/contact" element={<Contact />} />
                
                <Route path="/shop" element={<PrivateRoute><Shop /></PrivateRoute>} />
                <Route path="/shop/product/:id" element={<PrivateRoute><ProductDetail /></PrivateRoute>} />
                <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
                <Route path="/donations" element={<PrivateRoute><Donations /></PrivateRoute>} />
                <Route path="/payment" element={<PrivateRoute><Payment /></PrivateRoute>} />
                <Route path="/events" element={<PrivateRoute><Events /></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                
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
                <Route path="/admin/talents" element={
                  <RoleBasedRoute allowedRoles={['admin', 'editor']}>
                    <TalentsPage />
                  </RoleBasedRoute>
                } />
                <Route path="/admin/events" element={
                  <RoleBasedRoute allowedRoles={['admin', 'editor']}>
                    <EventsPage />
                  </RoleBasedRoute>
                } />
                <Route path="/admin/donations" element={
                  <RoleBasedRoute allowedRoles={['admin', 'editor']}>
                    <DonationsPage />
                  </RoleBasedRoute>
                } />
                <Route path="/admin/orders" element={
                  <RoleBasedRoute allowedRoles={['admin', 'editor']}>
                    <OrdersPage />
                  </RoleBasedRoute>
                } />
                <Route path="/admin/settings" element={
                  <RoleBasedRoute allowedRoles={['admin']}>
                    <SettingsPage />
                  </RoleBasedRoute>
                } />
                
                <Route path="/talent-registration" element={<TalentRegistration />} />
                
                <Route path="/submit" element={<MediaSubmission />} />
                
                <Route 
                  path="/admin/courses" 
                  element={
                    <RoleBasedRoute allowedRoles={['admin', 'editor']}>
                      <CoursesPage />
                    </RoleBasedRoute>
                  } 
                />
                
                <Route 
                  path="/admin/premium-courses" 
                  element={
                    <RoleBasedRoute allowedRoles={['admin', 'editor']}>
                      <PremiumCoursesPage />
                    </RoleBasedRoute>
                  } 
                />
                
                <Route path="*" element={<Navigate to="/home" replace />} />
              </Routes>
            </TooltipProvider>
          </CartProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
