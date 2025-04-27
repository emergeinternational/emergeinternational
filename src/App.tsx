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
                <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
                <Route path="/email-login" element={<PublicRoute><EmailLoginPage /></PublicRoute>} />
                <Route path="/home" element={<HomePage />} />
                
                <Route path="/education" element={<EducationPage />} />
                <Route path="/education/course/:id" element={<CourseDetailPage />} />
                <Route path="/workshops" element={<WorkshopsPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/contact" element={<ContactPage />} />
                
                <Route path="/shop" element={<PrivateRoute><ShopPage /></PrivateRoute>} />
                <Route path="/shop/product/:id" element={<PrivateRoute><ProductDetailPage /></PrivateRoute>} />
                <Route path="/cart" element={<PrivateRoute><CartPage /></PrivateRoute>} />
                <Route path="/donations" element={<PrivateRoute><DonationsPage /></PrivateRoute>} />
                <Route path="/payment" element={<PrivateRoute><PaymentPage /></PrivateRoute>} />
                <Route path="/events" element={<PrivateRoute><EventsPage /></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
                
                <Route path="/admin" element={
                  <RoleBasedRoute allowedRoles={['admin', 'editor', 'viewer']}>
                    <DashboardPage />
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
