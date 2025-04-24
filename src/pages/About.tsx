
import MainLayout from "../layouts/MainLayout";
import { Heart, Globe, Rocket, Camera, Users, Video } from "lucide-react";

const About = () => {
  const missionSections = [
    {
      icon: Heart,
      title: "Empowering African Creatives",
      description: "We are committed to discovering, nurturing, and promoting talented fashion professionals across the African continent. From designers and models to photographers and videographers, our mission is to provide a global platform that showcases the incredible creativity and craftsmanship of emerging African talent."
    },
    {
      icon: Globe,
      title: "Global Market Access",
      description: "We break down barriers by connecting African creatives with international markets. Through our platform, fashion professionals gain exposure, build their portfolios, and access opportunities that were previously out of reach."
    },
    {
      icon: Rocket,
      title: "Education and Resources",
      description: "Education is at the core of our mission. We offer workshops, courses, and resources that equip fashion professionals with the skills, knowledge, and tools they need to succeed in the competitive global fashion industry."
    }
  ];

  const talentSections = [
    {
      icon: Users,
      title: "Models",
      description: "We support emerging models by providing training, professional development, and opportunities to work with established brands and designers. Our platform connects models with casting directors and agencies worldwide."
    },
    {
      icon: Camera,
      title: "Photographers",
      description: "Fashion photographers receive mentorship, technical training, and opportunities to build their portfolios. We facilitate collaborations with designers and models while showcasing their work to international publications."
    },
    {
      icon: Video,
      title: "Videographers",
      description: "Our support for videographers includes specialized training in fashion film production, access to industry-standard equipment, and opportunities to create content for fashion shows, brand campaigns, and digital platforms."
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
            We envision a future where African fashion professionals are recognized globally for their innovation, creativity, and unique cultural narratives. By providing education, resources, and market access, we aim to transform the fashion industry and create opportunities for all emerging talents in the ecosystem.
          </p>
        </section>

        <section className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-3xl font-serif mb-8 text-center">Supporting All Fashion Industry Talents</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {talentSections.map((section, index) => (
              <div key={index} className="bg-emerge-cream/30 p-6 rounded-lg">
                <div className="text-emerge-gold mb-4">
                  <section.icon size={36} strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-serif mb-3">{section.title}</h3>
                <p className="text-gray-700 text-sm">{section.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12 bg-emerge-darkBg text-white p-8 rounded-lg">
          <h2 className="text-3xl font-serif mb-6 text-center text-emerge-gold">Our Commitment</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl mb-4">Sustainability</h3>
              <p>We prioritize sustainable and ethical fashion practices, supporting creatives who embrace environmentally conscious and socially responsible approaches to their work.</p>
            </div>
            <div>
              <h3 className="text-xl mb-4">Cultural Preservation</h3>
              <p>We celebrate and preserve African creative traditions while encouraging innovation and contemporary interpretations of cultural heritage across all aspects of fashion.</p>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default About;
