
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Logo from "../components/Logo";
import { ChevronLeft, Home, Users, Calendar, Heart } from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const sidebarItems = [
    { icon: <Home size={20} />, label: "Dashboard", path: "/admin" },
    { icon: <Calendar size={20} />, label: "Events", path: "/admin/events" },
    { icon: <Users size={20} />, label: "Users", path: "/admin/users" },
    { icon: <Heart size={20} />, label: "Donations", path: "/admin/donations" },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="flex h-screen bg-emerge-cream">
      {/* Sidebar */}
      <div 
        className={`bg-emerge-darkBg text-white flex flex-col transition-all duration-300 ${
          isSidebarCollapsed ? "w-20" : "w-64"
        }`}
      >
        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
          {!isSidebarCollapsed && <Logo className="mb-0" />}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className={`p-1 rounded-md hover:bg-gray-700 ${isSidebarCollapsed ? "mx-auto" : ""}`}
          >
            <ChevronLeft
              size={20}
              className={`transform transition-transform ${
                isSidebarCollapsed ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        <div className="flex-1 py-6">
          {sidebarItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 ${
                isActive(item.path)
                  ? "bg-black text-emerge-gold"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              } transition-colors`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {!isSidebarCollapsed && (
                <span className="ml-3 whitespace-nowrap">{item.label}</span>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-medium">ADMIN PANEL</h1>
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-sm text-gray-600 hover:text-emerge-gold">
                View Site
              </Link>
              <div className="h-6 w-6 rounded-full bg-emerge-gold" />
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
