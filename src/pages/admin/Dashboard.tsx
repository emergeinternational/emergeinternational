
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

// Mock data for demo purposes
const mockEvents = [
  { id: 1, title: "Workshop: Web Development Basics", date: "2025-05-10", attendees: 25 },
  { id: 2, title: "Tech Conference", date: "2025-05-15", attendees: 120 },
  { id: 3, title: "Design Principles Workshop", date: "2025-05-22", attendees: 45 }
];

const mockPayments = [
  { id: 1, user: "jane.doe@example.com", amount: "ETB 1,200", date: "2025-04-20", status: "completed" },
  { id: 2, user: "john.smith@example.com", amount: "ETB 750", date: "2025-04-22", status: "pending" },
  { id: 3, user: "alice.wonder@example.com", amount: "ETB 2,500", date: "2025-04-23", status: "completed" }
];

const Dashboard = () => {
  const { hasRole } = useAuth();
  
  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard 
          label="Total Users" 
          value="1,234"
          trend="+12%"
          trendLabel="From last month"
          icon={<Users className="h-5 w-5 text-blue-600" />}
        />
        <StatsCard 
          label="Total Orders" 
          value="256"
          trend="+5%"
          trendLabel="From last month"
          icon={<ShoppingCart className="h-5 w-5 text-green-600" />}
        />
        <StatsCard 
          label="Total Events" 
          value="32"
          trend="-3%"
          trendLabel="From last month"
          icon={<Calendar className="h-5 w-5 text-purple-600" />}
        />
        <StatsCard 
          label="Total Donations" 
          value="ETB 45,000"
          trend="+22%"
          trendLabel="From last month"
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
          <EventsSection events={mockEvents} />
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
          <PaymentsTable payments={mockPayments} onActivate={() => {}} />
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
