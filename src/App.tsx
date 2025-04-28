
import React from 'react';
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
import PremiumCoursesListPage from "./pages/PremiumCoursesListPage";
import MyPremiumCourses from "./pages/MyPremiumCourses";
import PremiumEnrollmentsPage from "./pages/admin/PremiumEnrollmentsPage";
import CoursesPage from "./pages/admin/CoursesPage";
import PremiumCoursesPage from "./pages/admin/PremiumCoursesPage";
import ProductsPage from "./pages/admin/ProductsPage";
import CreativeProfessionalsPage from "./pages/admin/DesignersPage";
import DonationsManagementPage from "./pages/admin/DonationsManagementPage";
import Login from "./pages/Login";
import EmailLogin from "./pages/EmailLogin";
import Home from "./pages/Home";
import Education from "./pages/Education";
import CourseDetail from "./pages/CourseDetail";
import Workshops from "./pages/Workshops";
import About from "./pages/About";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Contact from "./pages/Contact";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Donations from "./pages/Donations";
import Payment from "./pages/Payment";
import Events from "./pages/Events";
import EventsPage from "./pages/admin/EventsPage";
import Profile from "./pages/Profile";
import Certificates from "./pages/Certificates";
import Dashboard from "./pages/admin/Dashboard";
import Users from "./pages/admin/UsersPage";
import OrdersPage from "./pages/admin/OrdersPage";
import Settings from "./pages/admin/Settings";
import Landing from "./pages/Landing";
import TestAuthPage from "./pages/TestAuthPage";
import TalentsPage from "./pages/admin/TalentsPage";
import EventPayment from "./pages/EventPayment";

// Create a fresh QueryClient instance
const queryClient = new QueryClient();

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  console.log("PrivateRoute check: user authenticated =", !!user);
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  console.log("PublicRoute check: user authenticated =", !!user);
  return !user ? <>{children}</> : <Navigate to="/" replace />;
};

const App = () => {
  // Create a new QueryClient for each rendering of App
  // This helps prevent potential issues with stale React contexts
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AuthProvider>
            <CartProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <Routes>
                  {/* Home routes - make sure Landing is the default route */}
                  <Route path="/" element={<Landing />} />
                  <Route path="/home" element={<Home />} />
                  
                  {/* Public routes */}
                  <Route path="/education" element={<Education />} />
                  <Route path="/education/course/:id" element={<CourseDetail />} />
                  <Route path="/workshops" element={<Workshops />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/test-auth" element={<TestAuthPage />} />
                  <Route path="/talent-registration" element={<TalentRegistration />} />
                  <Route path="/submit" element={<MediaSubmission />} />
                  <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                  <Route path="/email-login" element={<PublicRoute><EmailLogin /></PublicRoute>} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/shop/product/:id" element={<ProductDetail />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/event-payment/:eventId" element={<EventPayment />} />
                  <Route path="/payment" element={<Payment />} />
                  
                  {/* Protected routes */}
                  <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
                  <Route path="/donations" element={<PrivateRoute><Donations /></PrivateRoute>} />
                  <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                  <Route path="/certificates" element={<PrivateRoute><Certificates /></PrivateRoute>} />
                  <Route path="/my-premium-courses" element={<PrivateRoute><MyPremiumCourses /></PrivateRoute>} />
                  
                  {/* Admin routes */}
                  <Route path="/admin" element={
                    <RoleBasedRoute allowedRoles={['admin', 'editor', 'viewer']}>
                      <Dashboard />
                    </RoleBasedRoute>
                  } />
                  <Route path="/admin/users" element={
                    <RoleBasedRoute allowedRoles={['admin']}>
                      <Users />
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
                  <Route path="/admin/products" element={
                    <RoleBasedRoute allowedRoles={['admin', 'editor']}>
                      <ProductsPage />
                    </RoleBasedRoute>
                  } />
                  <Route path="/admin/creative-professionals" element={
                    <RoleBasedRoute allowedRoles={['admin', 'editor']}>
                      <CreativeProfessionalsPage />
                    </RoleBasedRoute>
                  } />
                  <Route path="/admin/donations" element={
                    <RoleBasedRoute allowedRoles={['admin', 'editor']}>
                      <DonationsManagementPage />
                    </RoleBasedRoute>
                  } />
                  <Route path="/admin/orders" element={
                    <RoleBasedRoute allowedRoles={['admin', 'editor']}>
                      <OrdersPage />
                    </RoleBasedRoute>
                  } />
                  <Route path="/admin/settings" element={
                    <RoleBasedRoute allowedRoles={['admin']}>
                      <Settings />
                    </RoleBasedRoute>
                  } />
                  <Route path="/admin/courses" element={
                    <RoleBasedRoute allowedRoles={['admin', 'editor']}>
                      <CoursesPage />
                    </RoleBasedRoute>
                  } />
                  <Route path="/admin/premium-courses" element={
                    <RoleBasedRoute allowedRoles={['admin', 'editor']}>
                      <PremiumCoursesPage />
                    </RoleBasedRoute>
                  } />
                  <Route path="/admin/premium-enrollments" element={
                    <RoleBasedRoute allowedRoles={['admin']}>
                      <PremiumEnrollmentsPage />
                    </RoleBasedRoute>
                  } />
                  
                  {/* Fallback route */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </TooltipProvider>
            </CartProvider>
          </AuthProvider>
        </Router>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
