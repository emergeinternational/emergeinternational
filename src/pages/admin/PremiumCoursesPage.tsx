
import { useAuth } from "@/hooks/useAuth";
import AdminLayout from "@/layouts/AdminLayout";
import PremiumCourseUploadForm from "@/components/admin/PremiumCourseUploadForm";

const PremiumCoursesPage = () => {
  const { hasRole } = useAuth();

  if (!hasRole(['admin', 'editor'])) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Premium Courses Management</h1>
        <PremiumCourseUploadForm />
      </div>
    </AdminLayout>
  );
};

export default PremiumCoursesPage;
