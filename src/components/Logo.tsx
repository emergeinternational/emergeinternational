
import { Link } from "react-router-dom";

interface LogoProps {
  variant?: "dark" | "light" | "gold";
  className?: string;
}

const Logo = ({ variant = "gold", className = "" }: LogoProps) => {
  const getColorClass = () => {
    switch (variant) {
      case "dark":
        return "text-emerge-darkBg";
      case "light":
        return "text-white";
      case "gold":
      default:
        return "text-emerge-gold";
    }
  };

  return (
    <Link to="/" className={`block ${className}`}>
      <div className={`font-serif tracking-wider ${getColorClass()}`}>
        <h1 className="text-2xl md:text-3xl font-medium">EMERGE</h1>
        <p className="text-xs tracking-widest">INTERNATIONAL</p>
      </div>
    </Link>
  );
};

export default Logo;
