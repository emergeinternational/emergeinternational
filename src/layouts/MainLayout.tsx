
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { usePageTitle } from "../utils/usePageTitle";

interface MainLayoutProps {
  children: React.ReactNode;
  variant?: "dark" | "light";
  hideFooter?: boolean;
}

const MainLayout = ({ children, variant = "light", hideFooter = false }: MainLayoutProps) => {
  usePageTitle(); // Add the hook here

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation variant={variant} />
      <main className="flex-grow pt-20">{children}</main>
      {!hideFooter && <Footer />}
    </div>
  );
};

export default MainLayout;
