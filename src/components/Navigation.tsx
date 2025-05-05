
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ShoppingBag, User, Settings } from "lucide-react";
import Logo from "./Logo";
import { getAuthStatus } from "@/services/shopAuthService"; // Changed to local shopAuthService
import { useToast } from "@/hooks/use-toast";

interface NavigationProps {
  variant?: "dark" | "light";
}

const Navigation = ({ variant = "light" }: NavigationProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // @override:shop-isolation
  // Using local auth service instead of global useAuth hook
  const { isAuthenticated: userExists, isAdmin, userId } = getAuthStatus();
  const user = userExists ? { id: userId } : null;
  const location = useLocation();
  const { toast } = useToast();

  // Simplified role check for shop module isolation
  const hasRole = (roles: string | string[]) => {
    if (Array.isArray(roles)) {
      return isAdmin && roles.includes('admin');
    }
    return isAdmin && roles === 'admin';
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Events", href: "/events" },
    { name: "Shop", href: "/shop" },
    { name: "Education", href: "/education" },
    { name: "Talent", href: "/talent-registration" },
  ];

  const bgClass = variant === "dark" ? "bg-emerge-darkBg" : "bg-white";
  const textClass = variant === "dark" ? "text-white" : "text-emerge-darkBg";
  const logoVariant = variant === "dark" ? "gold" : "gold";

  const handleAdminClick = () => {
    if (!hasRole('admin')) {
      toast({
        title: "Access Denied",
        description: "You don't have admin permissions",
        variant: "destructive"
      });
    }
  };

  return (
    <nav className={`${bgClass} ${textClass} fixed w-full z-50 top-0`}>
      <div className="emerge-container py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1 md:hidden"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <Link to="/">
            <Logo variant={logoVariant} />
          </Link>
        </div>

        <div className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="hover:text-emerge-gold transition-colors font-medium"
            >
              {link.name}
            </Link>
          ))}
          
          {user && (
            <Link
              to="/my-premium-courses"
              className="hover:text-emerge-gold transition-colors font-medium"
            >
              My Premium Courses
            </Link>
          )}
          
          {user && hasRole(['admin', 'editor']) && (
            <Link
              to="/admin"
              className="text-emerge-gold hover:text-emerge-gold/80 transition-colors font-medium flex items-center"
              data-testid="admin-dashboard-link"
            >
              <Settings size={16} className="mr-1" />
              Admin Panel
            </Link>
          )}
          
          {user && (
            <Link
              to="/certificates"
              className="hover:text-emerge-gold transition-colors font-medium"
            >
              Certificates
            </Link>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <Link to="/cart" className="p-1">
            <ShoppingBag size={20} />
          </Link>
          <Link to={user ? "/profile" : "/login"} className="p-1">
            <User size={20} />
          </Link>
        </div>
      </div>

      {isMenuOpen && (
        <div className={`${bgClass} absolute w-full pb-4 md:hidden z-30`}>
          <div className="emerge-container flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="py-2 border-b border-gray-700 hover:text-emerge-gold"
              >
                {link.name}
              </Link>
            ))}
            
            {user && (
              <Link
                to="/my-premium-courses"
                onClick={() => setIsMenuOpen(false)}
                className="py-2 border-b border-gray-700 hover:text-emerge-gold"
              >
                My Premium Courses
              </Link>
            )}
            
            {user && hasRole(['admin', 'editor']) && (
              <Link
                to="/admin"
                onClick={() => {
                  setIsMenuOpen(false);
                }}
                className="py-2 border-b border-gray-700 text-emerge-gold flex items-center"
              >
                <Settings size={16} className="mr-2" />
                Admin Panel
              </Link>
            )}
            
            {user && (
              <Link
                to="/certificates"
                onClick={() => setIsMenuOpen(false)}
                className="py-2 border-b border-gray-700 hover:text-emerge-gold"
              >
                Certificates
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
