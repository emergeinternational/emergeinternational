import { Link } from "react-router-dom";
import Logo from "./Logo";
import { Facebook, Instagram } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const sections = [
    {
      title: "Shop",
      links: [
        { label: "New Arrivals", href: "/shop" },
        { label: "Clothing", href: "/shop/clothing" },
        { label: "Footwear", href: "/shop/footwear" },
        { label: "Accessories", href: "/shop/accessories" }
      ]
    },
    {
      title: "Education",
      links: [
        { label: "Courses", href: "/education/courses" },
        { label: "Events", href: "/events" }
      ]
    },
    {
      title: "About",
      links: [
        { label: "Our Mission", href: "/about" },
        { label: "Designers", href: "/designers" },
        { label: "Donations", href: "/donations" },
        { label: "Contact Us", href: "/contact" }
      ]
    }
  ];

  const socialLinks = [
    {
      icon: Facebook,
      href: "https://facebook.com/emergeinternational",
      label: "Facebook"
    },
    {
      icon: Instagram,
      href: "https://instagram.com/emergeinternational",
      label: "Instagram"
    }
  ];

  return (
    <footer className="bg-emerge-darkBg text-white py-12 mt-12">
      <div className="emerge-container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <Logo className="mb-6" />
            <p className="text-gray-300 mb-4 max-w-xs">
              Supporting emerging fashion talent across the world through education, resources, and global market access.
            </p>
            <p className="text-gray-300 text-sm">
              Owned and operated by Casa Noir LLC, an American Company.
            </p>
            <div className="flex space-x-4 mt-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-emerge-gold transition-colors"
                  aria-label={social.label}
                >
                  <social.icon size={24} />
                </a>
              ))}
              <a
                href="https://tiktok.com/@emergeinternational"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-emerge-gold transition-colors"
                aria-label="TikTok"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                </svg>
              </a>
            </div>
          </div>

          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="text-emerge-gold font-serif text-lg mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.href} className="text-gray-300 hover:text-emerge-gold transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} Emerge International. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/terms" className="text-gray-400 hover:text-emerge-gold text-sm">
              Terms & Conditions
            </Link>
            <Link to="/privacy" className="text-gray-400 hover:text-emerge-gold text-sm">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
