
import { Link } from "react-router-dom";
import Logo from "./Logo";

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
        { label: "Workshops", href: "/education/workshops" },
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

  return (
    <footer className="bg-emerge-darkBg text-white py-12 mt-12">
      <div className="emerge-container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <Logo className="mb-6" />
            <p className="text-gray-300 mb-4 max-w-xs">
              Supporting emerging fashion talent across Africa through education,
              resources, and global market access.
            </p>
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
