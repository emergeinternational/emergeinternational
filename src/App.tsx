import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./hooks/useCart";
import { AuthProvider } from "./hooks/useAuth";

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
import NotFound from "./pages/NotFound";
import Events from "./pages/Events";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import About from "./pages/About";
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Landing />} />
              <Route path="/email-login" element={<EmailLogin />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/shop/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/education" element={<Education />} />
              <Route path="/donations" element={<Donations />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/admin" element={<Dashboard />} />
              <Route path="/events" element={<Events />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/about" element={<About />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
