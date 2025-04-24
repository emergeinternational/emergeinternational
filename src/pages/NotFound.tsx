
import { Link } from "react-router-dom";
import Logo from "../components/Logo";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-emerge-cream">
      <Logo className="mb-8" />
      
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-serif mb-4">404</h1>
        <p className="text-2xl mb-6">Page Not Found</p>
        <p className="mb-8 text-gray-600">
          The page you are looking for might have been removed, had its name changed, 
          or is temporarily unavailable.
        </p>
        
        <Link to="/" className="emerge-button-primary inline-block">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
