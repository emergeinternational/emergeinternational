
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import Login from "./pages/Login";
import EmailLogin from "./pages/EmailLogin";
import Shop from "./pages/Shop";
import Education from "./pages/Education";
import Donations from "./pages/Donations";
import Payment from "./pages/Payment";
import Dashboard from "./pages/admin/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/email-login" element={<EmailLogin />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/education" element={<Education />} />
          <Route path="/donations" element={<Donations />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/admin" element={<Dashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
