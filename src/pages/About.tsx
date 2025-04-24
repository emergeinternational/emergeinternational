
import MainLayout from "../layouts/MainLayout";
import { Heart, Globe, Rocket, Camera, Users, Video } from "lucide-react";

const About = () => {
  const missionSections = [
    {
      icon: Heart,
      title: "Empowering Global Creative Talent",
      description: "We are committed to discovering, nurturing, and promoting talented fashion professionals worldwide, with a special focus on the vibrant and influential African fashion scene. From designers and models to photographers and videographers, our mission is to provide a platform that celebrates creativity and craftsmanship from diverse cultural perspectives."
    },
    {
      icon: Globe,
      title: "Global Market Access",
      description: "We connect creative professionals with international markets, with particular emphasis on showcasing Africa's rich fashion heritage and contemporary innovations. Through our platform, fashion professionals gain exposure, build their portfolios, and access opportunities in the global fashion ecosystem."
    },
    {
      icon: Rocket,
      title: "Education and Resources",
      description: "Education is at the core of our mission. We offer workshops, courses, and resources that equip fashion professionals with the skills, knowledge, and tools they need to succeed in the competitive global fashion industry, while celebrating and promoting Africa's significant influence on worldwide fashion trends."
    }
  ];

  const talentSections = [
    {
      icon: Users,
      title: "Models",
      description: "We support emerging models globally, with special initiatives focused on Africa's dynamic modeling industry. Our platform provides comprehensive training, professional development, and connections with international casting directors and agencies."
    },
    {
      icon: Camera,
      title: "Photographers",
      description: "Fashion photographers receive expert mentorship and technical training while gaining opportunities to showcase diverse cultural perspectives through their work. We facilitate collaborations between international talents and help build impressive portfolios that resonate with global publications."
    },
    {
      icon: Video,
      title: "Videographers",
      description: "Our support for videographers spans worldwide, offering specialized training in fashion film production, access to industry-standard equipment, and opportunities to create content that celebrates both local traditions and contemporary global trends."
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
            We envision a truly inclusive global fashion industry that celebrates diversity and cultural exchange. While we maintain a strong focus on amplifying Africa's extraordinary influence and talent in the worldwide fashion scene, our platform embraces and connects creative professionals from all corners of the globe, fostering cross-cultural collaboration and innovation.
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
              <p>We champion sustainable and ethical fashion practices worldwide, supporting creatives who embrace environmentally conscious and socially responsible approaches in their work, while drawing inspiration from Africa's rich heritage of sustainable craftsmanship.</p>
            </div>
            <div>
              <h3 className="text-xl mb-4">Cultural Exchange</h3>
              <p>We facilitate meaningful cultural exchange in the fashion industry, with particular emphasis on showcasing Africa's profound influence on global fashion. We celebrate diverse creative traditions while encouraging innovation and contemporary interpretations that enrich the international fashion landscape.</p>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default About;
