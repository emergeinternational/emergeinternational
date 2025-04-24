
import MainLayout from "../layouts/MainLayout";

const Terms = () => {
  return (
    <MainLayout>
      <div className="emerge-container py-12">
        <h1 className="emerge-heading text-4xl mb-8">Terms & Conditions</h1>
        
        <div className="prose max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">1. Introduction</h2>
            <p className="text-gray-700 mb-4">
              Welcome to Emerge International. By accessing and using our website, you accept and agree to be bound by these Terms and Conditions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">2. International Shipping</h2>
            <p className="text-gray-700 mb-4">
              We offer worldwide shipping. Delivery times and costs vary by destination. Import duties and taxes may apply according to local regulations.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">3. Product Information</h2>
            <p className="text-gray-700 mb-4">
              All products are handcrafted by emerging African designers. While we strive for accuracy, slight variations in colors, materials, and sizes may occur.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">4. Pricing and Payments</h2>
            <p className="text-gray-700 mb-4">
              Prices are listed in Ethiopian Birr (ETB). We accept various payment methods including major credit cards and PayPal. All prices exclude import duties and taxes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">5. Returns and Refunds</h2>
            <p className="text-gray-700 mb-4">
              We accept returns within 30 days of delivery. Items must be unused and in original packaging. International returns must follow our return shipping guidelines.
            </p>
          </section>
        </div>
      </div>
    </MainLayout>
  );
};

export default Terms;
