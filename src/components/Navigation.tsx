
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ShoppingBag, User, Settings } from "lucide-react";
import Logo from "./Logo";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface NavigationProps {
  variant?: "dark" | "light";
}

const Navigation = ({ variant = "light" }: NavigationProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, hasRole, userRole } = useAuth();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    console.log("Navigation auth state:", {
      isAuthenticated: !!user,
      userRole,
      userEmail: user?.email,
      isAdminLink: hasRole('admin')
    });
  }, [user, userRole, hasRole]);

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
          
          {user && userRole === 'admin' && (
            <>
              <Link
                to="/admin"
                onClick={handleAdminClick}
                className="text-emerge-gold hover:text-emerge-gold/80 transition-colors font-medium flex items-center"
                data-testid="admin-dashboard-link"
              >
                <Settings size={16} className="mr-1" />
                Admin Dashboard
              </Link>
              <Link
                to="/admin/premium-enrollments"
                onClick={handleAdminClick}
                className="text-emerge-gold hover:text-emerge-gold/80 transition-colors font-medium"
              >
                Premium Enrollments
              </Link>
              <Link
                to="/certificates"
                className="hover:text-emerge-gold transition-colors font-medium"
              >
                Certificates
              </Link>
            </>
          )}
          
          {user && userRole !== 'admin' && (
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
            
            {user && userRole === 'admin' && (
              <>
                <Link
                  to="/admin"
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleAdminClick();
                  }}
                  className="py-2 border-b border-gray-700 text-emerge-gold flex items-center"
                >
                  <Settings size={16} className="mr-2" />
                  Admin Dashboard
                </Link>
                <Link
                  to="/admin/premium-enrollments"
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleAdminClick();
                  }}
                  className="py-2 border-b border-gray-700 text-emerge-gold"
                >
                  Premium Enrollments
                </Link>
                <Link
                  to="/certificates"
                  onClick={() => setIsMenuOpen(false)}
                  className="py-2 border-b border-gray-700 hover:text-emerge-gold"
                >
                  Certificates
                </Link>
              </>
            )}
            
            {user && userRole !== 'admin' && (
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
