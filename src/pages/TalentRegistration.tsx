
import { useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { Globe, Search, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import MediaSubmissionForm from "@/components/media/MediaSubmissionForm";

const TalentRegistration = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const benefits = [
    {
      icon: Search,
      title: "Get Discovered",
      description: "Join our database of exceptional talent and get noticed by top brands and agencies."
    },
    {
      icon: Globe,
      title: "International Exposure",
      description: "Connect with opportunities worldwide through our global network of industry professionals."
    },
    {
      icon: TrendingUp,
      title: "Professional Growth",
      description: "Access exclusive casting calls and opportunities to advance your career."
    }
  ];

  const handleSubmitSuccess = () => {
    setIsSubmitted(true);
    
    // Scroll to the top of the success message
    setTimeout(() => {
      window.scrollTo({ 
        top: document.querySelector('.emerge-container.max-w-3xl')?.getBoundingClientRect().top,
        behavior: 'smooth'
      });
    }, 100);
  };

  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="relative min-h-[60vh] flex items-center justify-center bg-emerge-darkBg text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/30 z-10" />
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&q=80&w=2070&h=1000')"
          }}
        />
        <div className="emerge-container relative z-20 text-center py-20">
          <h1 className="text-4xl md:text-6xl font-serif mb-6">
            Are You the Next Big Talent?
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto">
            Join our international database for castings, campaigns, and live events.
          </p>
        </div>
      </div>

      {/* Benefits Section */}
      <section className="py-20 bg-emerge-cream">
        <div className="emerge-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="text-center p-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerge-gold text-white mb-4">
                  <benefit.icon size={32} />
                </div>
                <h3 className="text-xl font-serif text-emerge-darkBg mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Form Section */}
      <section className="py-20">
        <div className="emerge-container max-w-3xl">
          {isSubmitted ? (
            <div className="text-center p-8 bg-emerge-cream rounded-lg">
              <h2 className="text-2xl font-serif text-emerge-darkBg mb-4">
                Thank You for Registering!
              </h2>
              <p className="text-gray-600 mb-6">
                Your application has been successfully submitted. We will review your information and contact you regarding upcoming opportunities.
              </p>
              <Button
                onClick={() => setIsSubmitted(false)}
                variant="outline"
              >
                Submit Another Application
              </Button>
            </div>
          ) : (
            <MediaSubmissionForm onSubmitSuccess={handleSubmitSuccess} />
          )}
        </div>
      </section>

      {/* FAQ Section Placeholder */}
      <section className="py-20 bg-emerge-cream">
        <div className="emerge-container text-center">
          <h2 className="text-3xl font-serif text-emerge-darkBg mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600">
            Coming soon - Check back for detailed information about our casting process.
          </p>
        </div>
      </section>
      
      {/* Make sure toast notifications are visible */}
      <Toaster />
    </MainLayout>
  );
};

export default TalentRegistration;
