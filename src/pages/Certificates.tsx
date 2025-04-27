
import { useEffect } from "react";
import MainLayout from "@/layouts/MainLayout";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import UserCertificateList from "@/components/certificates/UserCertificateList";
import { Loader2 } from "lucide-react";

const Certificates = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login", { replace: true });
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <MainLayout>
      <div className="emerge-container pt-24 pb-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="emerge-heading text-3xl mb-8">Your Certificates</h1>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <UserCertificateList />
          </div>
        </div>
      </div>
      <Toaster />
    </MainLayout>
  );
};

export default Certificates;
