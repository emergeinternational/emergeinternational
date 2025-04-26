
import MainLayout from "../layouts/MainLayout";
import { Heart, Globe, Rocket, Camera, Users, Video } from "lucide-react";

const About = () => {
  const missionSections = [
    {
      icon: Heart,
      title: "Empowering Global Creative Talent",
      description: "We are committed to discovering, nurturing, and promoting talented creative professionals worldwide, with a special focus on the vibrant and influential African creative scene. From designers and artists to performers and content creators, our mission is to provide a platform that celebrates creativity and innovation from diverse cultural perspectives."
    },
    {
      icon: Globe,
      title: "Global Market Access",
      description: "We connect creative professionals with international markets, with particular emphasis on showcasing Africa's rich cultural heritage and contemporary innovations. Through our platform, creative professionals gain exposure, build their portfolios, and access opportunities in the global creative ecosystem."
    },
    {
      icon: Rocket,
      title: "Education and Resources",
      description: "Education is at the core of our mission. We offer workshops, courses, and resources that equip creative professionals with the skills, knowledge, and tools they need to succeed in the competitive global industries, while celebrating and promoting Africa's significant influence on worldwide creative trends."
    }
  ];

  const talentSections = [
    {
      icon: Users,
      title: "Models",
      description: "We support both emerging and established models globally, with special initiatives focused on Africa's dynamic modeling industry. Our platform provides comprehensive training, professional development, and connections with international casting directors and agencies."
    },
    {
      icon: Camera,
      title: "Photographers",
      description: "Creative photographers receive expert mentorship and technical training while gaining opportunities to showcase diverse cultural perspectives through their work. We facilitate collaborations between international talents and help build impressive portfolios that resonate with global publications."
    },
    {
      icon: Video,
      title: "Videographers",
      description: "Our support for videographers spans worldwide, offering specialized training in content production, access to industry-standard equipment, and opportunities to create content that celebrates both local traditions and contemporary global trends."
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
            We envision a truly inclusive global creative industry that celebrates diversity, innovation, and cultural exchange. While maintaining a strong commitment to amplifying Africa's extraordinary influence and talent across fashion, arts, and entertainment, our platform welcomes and connects professionals from every corner of the world. We foster collaboration across cultures, industries, and creative expressions, driving global excellence and innovation.
          </p>
        </section>

        <section className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-3xl font-serif mb-8 text-center">Supporting All Creative Talents</h2>
          <p className="text-gray-700 text-center max-w-3xl mx-auto mb-8">
            We are dedicated to empowering a diverse community of creative professionals — including models, designers, photographers, videographers, artists, entertainers, and more — from across the globe. Our platform offers specialized training, mentorship, professional development, and international exposure. With a strong foundation rooted in Africa's dynamic creative energy, we foster opportunities that connect emerging and established talents with the global stage.
          </p>
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
              <p>We champion sustainable, ethical practices across fashion, arts, and entertainment. We support creators who embrace environmentally conscious methods and socially responsible storytelling, drawing inspiration from Africa's longstanding traditions of sustainable craftsmanship and innovation.</p>
            </div>
            <div>
              <h3 className="text-xl mb-4">Cultural Exchange</h3>
              <p>We promote meaningful cultural exchange across creative industries, highlighting Africa's profound and growing impact on the global landscape. We celebrate diverse traditions while encouraging contemporary innovation, creating a vibrant, interconnected community of artists, designers, models, and storytellers around the world.</p>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default About;
