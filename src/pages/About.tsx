
import MainLayout from "../layouts/MainLayout";
import { Heart, Globe, Rocket } from "lucide-react";

const About = () => {
  const missionSections = [
    {
      icon: Heart,
      title: "Empowering African Designers",
      description: "We are committed to discovering, nurturing, and promoting talented fashion designers across the African continent. Our mission is to provide a global platform that showcases the incredible creativity and craftsmanship of emerging African talent."
    },
    {
      icon: Globe,
      title: "Global Market Access",
      description: "We break down barriers by connecting African designers with international markets. Through our platform, designers gain exposure, build their brands, and access opportunities that were previously out of reach."
    },
    {
      icon: Rocket,
      title: "Education and Resources",
      description: "Education is at the core of our mission. We offer workshops, courses, and resources that equip designers with the skills, knowledge, and tools they need to succeed in the competitive global fashion industry."
    }
  ];

  return (
    <MainLayout>
      <div className="emerge-container py-12">
        <h1 className="emerge-heading text-4xl mb-8 text-center">Our Mission</h1>
        
        <section className="max-w-4xl mx-auto space-y-12">
          {missionSections.map((section, index) => (
            <div key={index} className="flex items-start space-x-6 bg-emerge-cream/50 p-6 rounded-lg">
              <div className="text-emerge-gold">
                <section.icon size={48} strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-2xl font-serif mb-4">{section.title}</h2>
                <p className="text-gray-700">{section.description}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-12 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-serif mb-6">Our Vision</h2>
          <p className="text-gray-700 leading-relaxed">
            We envision a future where African fashion designers are recognized globally for their innovation, sustainability, and unique cultural narratives. By providing education, resources, and market access, we aim to transform the fashion industry and create opportunities for emerging talents.
          </p>
        </section>

        <section className="mt-12 bg-emerge-darkBg text-white p-8 rounded-lg">
          <h2 className="text-3xl font-serif mb-6 text-center text-emerge-gold">Our Commitment</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl mb-4">Sustainability</h3>
              <p>We prioritize sustainable and ethical fashion practices, supporting designers who create environmentally conscious and socially responsible collections.</p>
            </div>
            <div>
              <h3 className="text-xl mb-4">Cultural Preservation</h3>
              <p>We celebrate and preserve African design traditions while encouraging innovation and contemporary interpretations of cultural heritage.</p>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default About;
