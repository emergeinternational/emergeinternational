
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import RoleBasedRoute from './components/auth/RoleBasedRoute';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Education from './pages/Education';
import Workshops from './pages/Workshops';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import EventPayment from './pages/EventPayment';
import Donations from './pages/Donations';
import TalentRegistration from './pages/TalentRegistration';
import MediaSubmission from './pages/MediaSubmission';
import Login from './pages/Login';
import EmailLogin from './pages/EmailLogin';
import Profile from './pages/Profile';
import Cart from './pages/Cart';
import Payment from './pages/Payment';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Dashboard from './pages/admin/Dashboard';
import UsersPage from './pages/admin/UsersPage';
import EventsPage from './pages/admin/EventsPage';
import TalentsPage from './pages/admin/TalentsPage';
import DonationsManagementPage from './pages/admin/DonationsPage';
import CoursesPage from './pages/admin/CoursesPage';
import PremiumCoursesPage from './pages/admin/PremiumCoursesPage';
import PremiumEnrollmentsPage from './pages/admin/PremiumEnrollmentsPage';
import OrdersPage from './pages/admin/OrdersPage';
import ProductsPage from './pages/admin/ProductsPage';
import DesignersPage from './pages/admin/DesignersPage';
import SettingsPage from './pages/admin/SettingsPage';
import TestAuthPage from './pages/TestAuthPage';
import NotFound from './pages/NotFound';
import Certificates from './pages/Certificates';
import CourseDetail from './pages/CourseDetail';
import PremiumCoursesListPage from './pages/PremiumCoursesListPage';
import MyPremiumCourses from './pages/MyPremiumCourses';
import ScrapedCoursesPage from './pages/admin/ScrapedCoursesPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:productId" element={<ProductDetail />} />
          <Route path="/education" element={<Education />} />
          <Route path="/workshops" element={<Workshops />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:eventId" element={<EventDetails />} />
          <Route path="/event-payment/:eventId" element={<EventPayment />} />
          <Route path="/donations" element={<Donations />} />
          <Route path="/talent-registration" element={<TalentRegistration />} />
          <Route path="/media-submission" element={<MediaSubmission />} />
          <Route path="/courses/:courseId" element={<CourseDetail />} />
          <Route path="/certificates" element={<Certificates />} />
          <Route path="/premium-courses" element={<PremiumCoursesListPage />} />
          <Route path="/my-premium-courses" element={<MyPremiumCourses />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/email-login" element={<EmailLogin />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/payment" element={<Payment />} />
          
          {/* Legal Routes */}
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          
          {/* Admin Routes */}
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
              <EventsPage />
            </RoleBasedRoute>
          } />
          
          <Route path="/admin/talents" element={
            <RoleBasedRoute allowedRoles={['admin', 'editor']}>
              <TalentsPage />
            </RoleBasedRoute>
          } />
          
          <Route path="/admin/donations" element={
            <RoleBasedRoute allowedRoles={['admin', 'editor']}>
              <DonationsManagementPage />
            </RoleBasedRoute>
          } />
          
          <Route path="/admin/courses" element={
            <RoleBasedRoute allowedRoles={['admin', 'editor']}>
              <CoursesPage />
            </RoleBasedRoute>
          } />
          
          <Route path="/admin/scraped-courses" element={
            <RoleBasedRoute allowedRoles={['admin', 'editor']}>
              <ScrapedCoursesPage />
            </RoleBasedRoute>
          } />
          
          <Route path="/admin/premium-courses" element={
            <RoleBasedRoute allowedRoles={['admin', 'editor']}>
              <PremiumCoursesPage />
            </RoleBasedRoute>
          } />
          
          <Route path="/admin/premium-enrollments" element={
            <RoleBasedRoute allowedRoles={['admin', 'editor']}>
              <PremiumEnrollmentsPage />
            </RoleBasedRoute>
          } />
          
          <Route path="/admin/orders" element={
            <RoleBasedRoute allowedRoles={['admin', 'editor']}>
              <OrdersPage />
            </RoleBasedRoute>
          } />
          
          <Route path="/admin/products" element={
            <RoleBasedRoute allowedRoles={['admin', 'editor']}>
              <ProductsPage />
            </RoleBasedRoute>
          } />
          
          <Route path="/admin/designers" element={
            <RoleBasedRoute allowedRoles={['admin', 'editor']}>
              <DesignersPage />
            </RoleBasedRoute>
          } />
          
          <Route path="/admin/settings" element={
            <RoleBasedRoute allowedRoles={['admin']}>
              <SettingsPage />
            </RoleBasedRoute>
          } />
          
          {/* Test Routes */}
          <Route path="/test-auth" element={<TestAuthPage />} />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
