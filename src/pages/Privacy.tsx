
import MainLayout from "../layouts/MainLayout";

const Privacy = () => {
  return (
    <MainLayout>
      <div className="emerge-container py-12">
        <h1 className="emerge-heading text-4xl mb-8">Privacy Policy</h1>
        
        <div className="prose max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">1. Information We Collect</h2>
            <p className="text-gray-700 mb-4">
              We collect information necessary for order processing, including name, email, shipping address, and payment details. We also collect anonymous usage data to improve our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-700 mb-4">
              Your information is used to process orders, communicate about purchases, and improve our services. We never sell personal data to third parties.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">3. International Data Transfer</h2>
            <p className="text-gray-700 mb-4">
              As a global marketplace, we transfer data internationally. We ensure appropriate safeguards are in place to protect your information according to GDPR and other privacy laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">4. Cookies and Tracking</h2>
            <p className="text-gray-700 mb-4">
              We use cookies for essential website functionality and analytics. You can control cookie preferences through your browser settings.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">5. Your Rights</h2>
            <p className="text-gray-700 mb-4">
              You have the right to access, correct, or delete your personal data. Contact us at privacy@emerge.com for any privacy-related requests.
            </p>
          </section>
        </div>
      </div>
    </MainLayout>
  );
};

export default Privacy;
