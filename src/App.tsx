import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Root from "./routes/root";
import ErrorPage from "./error-page";
import Index from "./routes/index";
import Contact from "./routes/contact";
import Talent from "./pages/Talent";
import Admin from "./pages/Admin";
import AdminLayout from "./layouts/AdminLayout";
import CoursesPage from "./pages/admin/CoursesPage";
import CourseDetailPage from "./pages/admin/CourseDetailPage";
import PremiumCoursesPage from "./pages/admin/PremiumCoursesPage";
import PremiumCourseDetailPage from "./pages/admin/PremiumCourseDetailPage";
import PageLockManagementPage from "./pages/admin/PageLockManagementPage";
import { Toaster } from "@/components/ui/toaster"
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PremiumCourseProvider } from './context/PremiumCourseContext';
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import ProductManagementPage from "./pages/admin/ProductManagementPage";

const App: React.FC = () => {
  const { isLoggedIn } = useAuth();

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Root />,
      errorElement: <ErrorPage />,
      children: [
        {
          index: true,
          element: <Index />,
        },
        {
          path: "contact",
          element: <Contact />,
        },
        {
          path: "talent",
          element: <Talent />,
        },
      ],
    },
    {
      path: "/admin",
      element: <ProtectedRoute isLoggedIn={isLoggedIn}><AdminLayout /></ProtectedRoute>,
      errorElement: <ErrorPage />,
      children: [
        {
          index: true,
          element: <ProtectedRoute isLoggedIn={isLoggedIn}><Admin /></ProtectedRoute>,
        },
        {
          path: "courses",
          element: <ProtectedRoute isLoggedIn={isLoggedIn}><CoursesPage /></ProtectedRoute>,
        },
        {
          path: "courses/:courseId",
          element: <ProtectedRoute isLoggedIn={isLoggedIn}><CourseDetailPage /></ProtectedRoute>,
        },
        {
          path: "premium-courses",
          element: <ProtectedRoute isLoggedIn={isLoggedIn}><PremiumCourseProvider><PremiumCoursesPage /></PremiumCourseProvider></ProtectedRoute>,
        },
        {
          path: "premium-courses/:courseId",
          element: <ProtectedRoute isLoggedIn={isLoggedIn}><PremiumCourseProvider><PremiumCourseDetailPage /></PremiumCourseProvider></ProtectedRoute>,
        },
        {
          path: "page-lock-management",
          element: <ProtectedRoute isLoggedIn={isLoggedIn}><PageLockManagementPage /></ProtectedRoute>,
        },
      ],
    },
    {
      path: "/login",
      element: <LoginPage />,
    },
    // Add new routes for the Shop module
    {
      path: "/shop",
      element: <Shop />,
    },
    {
      path: "/shop/product/:id",
      element: <ProductDetail />,
    },
    {
      path: "/admin/product-management",
      element: <ProductManagementPage />,
    },
  ]);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
};

export default App;
