import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Logo from "../components/Logo";
import RoleGuide from "../components/admin/RoleGuide";
import { 
  ChevronLeft, 
  Home, 
  Users, 
  Calendar, 
  Heart,
  LogOut,
  Settings,
  AlertCircle,
  ShoppingCart,
  UserCheck
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";

interface AdminLayoutProps {
  children: React.ReactNode;
}

type UserRole = 'admin' | 'editor' | 'viewer' | 'user';

interface NavItem {
  icon: JSX.Element;
  label: string;
  path: string;
  requiredRoles: UserRole[];
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, userRole, hasRole } = useAuth();
  const { toast } = useToast();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showRoleGuide, setShowRoleGuide] = useState(false);

  const sidebarItems: NavItem[] = [
    { icon: <Home size={20} />, label: "Dashboard", path: "/admin", requiredRoles: ['admin', 'editor', 'viewer'] },
    { icon: <Users size={20} />, label: "Users", path: "/admin/users", requiredRoles: ['admin'] },
    { icon: <UserCheck size={20} />, label: "Talents", path: "/admin/talents", requiredRoles: ['admin', 'editor'] },
    { icon: <Calendar size={20} />, label: "Events", path: "/admin/events", requiredRoles: ['admin', 'editor'] },
    { icon: <Heart size={20} />, label: "Donations", path: "/admin/donations", requiredRoles: ['admin', 'editor'] },
    { icon: <ShoppingCart size={20} />, label: "Orders", path: "/admin/orders", requiredRoles: ['admin', 'editor'] },
    { icon: <Settings size={20} />, label: "Settings", path: "/admin/settings", requiredRoles: ['admin'] },
  ];

  useEffect(() => {
    if (user && userRole && !hasRole(['admin', 'editor', 'viewer'])) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin area.",
        variant: "destructive"
      });
      navigate("/");
    }
  }, [user, userRole, hasRole, navigate, toast]);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "An error occurred while signing out.",
        variant: "destructive"
      });
    }
  };

  const getUserInitials = () => {
    if (!user?.email) return "U";
    return user.email.substring(0, 1).toUpperCase();
  };

  return (
    <div className="flex h-screen bg-emerge-cream">
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
          {sidebarItems.map((item) => {
            if (!hasRole(item.requiredRoles)) return null;

            return (
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
            );
          })}
        </div>

        {!isSidebarCollapsed && userRole && (
          <div className="px-4 py-2 border-t border-gray-800 text-xs text-gray-500 flex items-center justify-between">
            <div>{userRole.toUpperCase()} ROLE</div>
            <button 
              onClick={() => setShowRoleGuide(true)}
              className="text-gray-500 hover:text-white transition-colors"
            >
              <AlertCircle size={14} />
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-medium">ADMIN PANEL</h1>
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-sm text-gray-600 hover:text-emerge-gold">
                View Site
              </Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Avatar className="h-8 w-8 cursor-pointer">
                    <AvatarFallback className="bg-emerge-gold text-black">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    {user?.email}
                    <p className="text-xs text-gray-500 mt-1">
                      {userRole?.toUpperCase()} ROLE
                    </p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    Your Profile
                  </DropdownMenuItem>
                  {hasRole(['admin']) && (
                    <DropdownMenuItem onClick={() => navigate('/admin/settings')}>
                      Admin Settings
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-500">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4">{children}</main>
      </div>

      <Sheet open={showRoleGuide} onOpenChange={setShowRoleGuide}>
        <SheetContent side="right" className="w-[400px] sm:w-[540px]">
          <SheetHeader className="mb-5">
            <SheetTitle>Role Permissions Guide</SheetTitle>
            <SheetDescription>
              Understanding the different role permissions in the admin panel
            </SheetDescription>
          </SheetHeader>
          <RoleGuide />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AdminLayout;
