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
                      <PremiumCoursesListPage />
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
