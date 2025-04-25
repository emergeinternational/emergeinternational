
import { useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { Toaster } from "@/components/ui/toaster";
import MediaSubmissionForm from "../components/media/MediaSubmissionForm";

const MediaSubmission = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmitSuccess = () => {
    setIsSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="relative min-h-[40vh] flex items-center justify-center bg-black text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50 z-10" />
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=2070&h=1000')"
          }}
        />
        <div className="emerge-container relative z-20 text-center py-16">
          <h1 className="text-3xl md:text-5xl font-serif mb-4">
            Submit Your Emerge Entry
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto">
            This is your moment. Upload your photo, video, or portfolio to be considered for global visibility 
            through the Emerge International platform. Submissions are reviewed for modeling, performance, or designer features.
          </p>
        </div>
      </div>

      {/* Form Section */}
      <section className="py-16 bg-black text-white">
        <div className="emerge-container max-w-3xl">
          {isSubmitted ? (
            <div className="text-center p-8 border border-emerge-gold rounded-lg">
              <h2 className="text-2xl font-serif text-emerge-gold mb-4">
                Thank You for Your Submission!
              </h2>
              <p className="text-gray-300 mb-6">
                Your entry has been successfully submitted for review. Our team will evaluate your submission and contact you if selected.
              </p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="px-6 py-2 bg-emerge-gold text-black font-medium rounded hover:bg-yellow-500 transition-colors"
              >
                Submit Another Entry
              </button>
            </div>
          ) : (
            <MediaSubmissionForm onSubmitSuccess={handleSubmitSuccess} />
          )}
        </div>
      </section>
      
      <Toaster />
    </MainLayout>
  );
};

export default MediaSubmission;
