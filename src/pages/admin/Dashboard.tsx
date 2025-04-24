import { AlertTriangle } from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";
import StatsCard from "../../components/admin/StatsCard";
import PaymentsTable from "../../components/admin/PaymentsTable";
import EventsSection from "../../components/admin/EventsSection";

const Dashboard = () => {
  // Mock data
  const stats = [
    { label: "Total Users", value: "1,245", change: "+12%" },
    { label: "Active Subscriptions", value: "348", change: "+5%" },
    { label: "Monthly Donations", value: "ETB 45,600", change: "+18%" },
    { label: "Products Sold", value: "89", change: "+7%" },
  ];
  
  const recentPayments = [
    { id: "10472", name: "Abeba K.", city: "Addis Ababa", status: "pending" },
    { id: "10463", name: "Kifle M.", city: "Dire Dawa", status: "pending" },
  ];
  
  const upcomingEvents = [
    { id: 1, name: "Emerge Addis Fashion Show", date: "June 12, 2025", registrations: 45 },
    { id: 2, name: "Designer Workshop", date: "July 8, 2025", registrations: 23 },
  ];

  const handleActivatePayment = (id: string) => {
    console.log(`Activating payment ${id}`);
    // Add activation logic here
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>
        
        {/* TeleBirr Payments */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">CBEBirr Payments</h2>
          
          <div className="bg-emerge-cream p-4 rounded mb-5 flex items-start">
            <AlertTriangle className="text-yellow-600 mr-3 flex-shrink-0 mt-1" size={20} />
            <p>Review recent payment uploads</p>
          </div>
          
          <div className="bg-white rounded shadow overflow-hidden">
            <PaymentsTable 
              payments={recentPayments}
              onActivate={handleActivatePayment}
            />
          </div>
        </div>
        
        {/* Events */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Events</h2>
          <EventsSection events={upcomingEvents} />
        </div>
        
        {/* Recent Activity */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="bg-white p-5 rounded shadow">
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="w-2 h-2 rounded-full bg-emerge-gold mt-2 mr-3"></div>
                <div>
                  <p className="font-medium">New user registration</p>
                  <p className="text-gray-500 text-sm">Today, 10:45 AM</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 rounded-full bg-emerge-gold mt-2 mr-3"></div>
                <div>
                  <p className="font-medium">5 new orders received</p>
                  <p className="text-gray-500 text-sm">Yesterday, 4:30 PM</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 rounded-full bg-emerge-gold mt-2 mr-3"></div>
                <div>
                  <p className="font-medium">Payment confirmed for Workshop</p>
                  <p className="text-gray-500 text-sm">Yesterday, 2:15 PM</p>
                </div>
              </div>
            </div>
            
            <a href="/admin/activity" className="block text-emerge-gold mt-4 text-sm">
              View all activity
            </a>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
