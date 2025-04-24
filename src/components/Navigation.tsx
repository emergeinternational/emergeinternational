
import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ShoppingBag, User, Home, Settings } from "lucide-react";
import Logo from "./Logo";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "./ui/button";

interface NavigationProps {
  variant?: "dark" | "light";
}

const Navigation = ({ variant = "light" }: NavigationProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, hasRole } = useAuth();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "Education", href: "/education" },
    { name: "Donations", href: "/donations" },
    { name: "Events", href: "/events" },
  ];

  const bgClass = variant === "dark" ? "bg-emerge-darkBg" : "bg-white";
  const textClass = variant === "dark" ? "text-white" : "text-emerge-darkBg";
  const logoVariant = variant === "dark" ? "gold" : "gold";

  return (
    <nav className={`${bgClass} ${textClass} fixed w-full z-50 top-0`}>
      <div className="emerge-container py-4 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1 md:hidden"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <Logo variant={logoVariant} />
        </div>

        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="hover:text-emerge-gold transition-colors font-medium"
            >
              {link.name}
            </Link>
          ))}
          
          {/* Admin link - only visible to admin users */}
          {user && hasRole('admin') && (
            <Link
              to="/admin"
              className="text-emerge-gold hover:text-emerge-gold transition-colors font-medium flex items-center"
            >
              <Settings size={16} className="mr-1" />
              Admin
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
            
            {/* Admin link in mobile menu - only visible to admin users */}
            {user && hasRole('admin') && (
              <Link
                to="/admin"
                onClick={() => setIsMenuOpen(false)}
                className="py-2 border-b border-gray-700 text-emerge-gold flex items-center"
              >
                <Settings size={16} className="mr-2" />
                Admin Panel
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
