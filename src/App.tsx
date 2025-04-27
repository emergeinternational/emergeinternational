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
import EventDetail from "./pages/EventDetail";
import Profile from "./pages/Profile";
import Certificates from "./pages/Certificates";
import Dashboard from "./pages/admin/Dashboard";
import Users from "./pages/admin/Users";
import Orders from "./pages/admin/Orders";
import Settings from "./pages/admin/Settings";
import Landing from "./pages/Landing";
import TestAuthPage from "./pages/TestAuthPage";
import TalentsPage from "./pages/admin/TalentsPage";
import EventsPage from "./pages/admin/EventsPage";

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
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <CartProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/home" element={<Home />} />
                
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
                <Route path="/events/:id" element={<EventDetail />} />
                
                <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
                <Route path="/donations" element={<PrivateRoute><Donations /></PrivateRoute>} />
                <Route path="/payment" element={<PrivateRoute><Payment /></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                <Route path="/certificates" element={<PrivateRoute><Certificates /></PrivateRoute>} />
                <Route path="/my-premium-courses" element={<PrivateRoute><MyPremiumCourses /></PrivateRoute>} />
                
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
                <Route path="/admin/donations" element={
                  <RoleBasedRoute allowedRoles={['admin', 'editor']}>
                    <Donations />
                  </RoleBasedRoute>
                } />
                <Route path="/admin/orders" element={
                  <RoleBasedRoute allowedRoles={['admin', 'editor']}>
                    <Orders />
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
                
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </TooltipProvider>
          </CartProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
