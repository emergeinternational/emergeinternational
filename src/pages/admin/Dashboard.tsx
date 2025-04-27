
import React from "react";
import AdminLayout from "@/layouts/AdminLayout";
import StatsCard from "@/components/admin/StatsCard";
import EventsSection from "@/components/admin/EventsSection";
import PaymentsTable from "@/components/admin/PaymentsTable";
import ScrapedCoursesQueue from "@/components/admin/ScrapedCoursesQueue";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { 
  ShoppingCart, 
  Users, 
  Calendar,
  Heart,
  BookOpen,
  Award
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const Dashboard = () => {
  const { hasRole } = useAuth();
  
  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard 
          title="Total Users" 
          value="1,234"
          change="+12%"
          description="From last month"
          icon={<Users className="h-5 w-5 text-blue-600" />}
        />
        <StatsCard 
          title="Total Orders" 
          value="256"
          change="+5%"
          description="From last month"
          icon={<ShoppingCart className="h-5 w-5 text-green-600" />}
        />
        <StatsCard 
          title="Total Events" 
          value="32"
          change="-3%"
          description="From last month"
          icon={<Calendar className="h-5 w-5 text-purple-600" />}
        />
        <StatsCard 
          title="Total Donations" 
          value="ETB 45,000"
          change="+22%"
          description="From last month"
          icon={<Heart className="h-5 w-5 text-red-600" />}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg font-medium">Quick Links</CardTitle>
              <CardDescription>Access frequently used pages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link to="/admin/users" className="flex items-center p-2 hover:bg-gray-100 rounded-md">
                  <Users className="h-5 w-5 mr-2 text-gray-600" />
                  <span>Manage Users</span>
                </Link>
                <Link to="/admin/courses" className="flex items-center p-2 hover:bg-gray-100 rounded-md">
                  <BookOpen className="h-5 w-5 mr-2 text-gray-600" />
                  <span>Manage Courses</span>
                </Link>
                <Link to="/admin/events" className="flex items-center p-2 hover:bg-gray-100 rounded-md">
                  <Calendar className="h-5 w-5 mr-2 text-gray-600" />
                  <span>Schedule Events</span>
                </Link>
                <Link to="/admin/donations" className="flex items-center p-2 hover:bg-gray-100 rounded-md">
                  <Heart className="h-5 w-5 mr-2 text-gray-600" />
                  <span>View Donations</span>
                </Link>
                <Link to="/admin/certificates" className="flex items-center p-2 hover:bg-gray-100 rounded-md">
                  <Award className="h-5 w-5 mr-2 text-gray-600" />
                  <span>Manage Certificates</span>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <EventsSection />
        </div>
      </div>
      
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {hasRole(['admin', 'editor']) && (
          <div>
            <h2 className="text-lg font-medium mb-4">Pending Course Reviews</h2>
            <ScrapedCoursesQueue />
          </div>
        )}
        
        <div>
          <h2 className="text-lg font-medium mb-4">Recent Payments</h2>
          <PaymentsTable />
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
