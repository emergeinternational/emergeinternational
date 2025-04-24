
import { useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

const Donations = () => {
  const [selectedDesigner, setSelectedDesigner] = useState(0);
  const [selectedAmount, setSelectedAmount] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  
  const handleAmountSelect = (amount: string) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };
  
  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(e.target.value);
    setSelectedAmount("");
  };
  
  const designers = [
    {
      id: 1,
      name: "AMIRA TESFAYE",
      collections: 6,
      focus: "Sustainability Focused",
      goal: "ETB 15,000",
      image: "/placeholder.svg",
      bio: "Amira creates innovative designs using sustainable materials sourced from across Ethiopia. Her work has been featured in multiple African fashion weeks."
    },
    {
      id: 2,
      name: "KOFI MENSAH",
      collections: 4,
      focus: "Traditional Fusion",
      goal: "ETB 12,000",
      image: "/placeholder.svg",
      bio: "Kofi blends traditional West African patterns with modern silhouettes, creating unique pieces that honor heritage while embracing contemporary style."
    },
    {
      id: 3,
      name: "NALA OKAFOR",
      collections: 2,
      focus: "Innovative Textiles",
      goal: "ETB 20,000",
      image: "/placeholder.svg",
      bio: "As a textile innovator, Nala experiments with new materials and techniques to push the boundaries of African fashion design."
    }
  ];
  
  const sponsorshipLevels = [
    { name: "SILVER SPONSOR", amount: "ETB 1,000", perks: ["Digital certificate", "Designer newsletter"] },
    { name: "GOLD SPONSOR", amount: "ETB 5,000", perks: ["All Silver perks", "Exclusive event invites", "Meet & greet with designers"] },
    { name: "PLATINUM SPONSOR", amount: "ETB 10,000+", perks: ["All Gold perks", "Limited edition gift", "VIP fashion show access", "Brand acknowledgment"] }
  ];
  
  const currentDesigner = designers[selectedDesigner];

  return (
    <MainLayout>
      <section className="bg-emerge-darkBg text-white py-12">
        <div className="emerge-container">
          <h1 className="emerge-heading text-4xl mb-4">Donations</h1>
          <p className="max-w-2xl text-lg">
            Support emerging African fashion designers by contributing to their education, 
            resources, and growth opportunities.
          </p>
        </div>
      </section>
      
      <div className="emerge-container py-12">
        {/* Designer of the Month */}
        <section className="mb-16">
          <h2 className="emerge-heading text-3xl mb-8">DESIGNER OF THE MONTH</h2>
          
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/2">
              <div className="aspect-square bg-gray-100 mb-4">
                <img 
                  src={currentDesigner.image} 
                  alt={currentDesigner.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex gap-2 mb-4">
                {designers.map((designer, index) => (
                  <button
                    key={designer.id}
                    onClick={() => setSelectedDesigner(index)}
                    className={`w-3 h-3 rounded-full ${
                      index === selectedDesigner 
                        ? "bg-emerge-gold" 
                        : "bg-gray-300"
                    }`}
                    aria-label={`View ${designer.name}`}
                  />
                ))}
              </div>
            </div>
            
            <div className="lg:w-1/2">
              <h3 className="text-4xl font-serif mb-2">{currentDesigner.name}</h3>
              <div className="mb-6">
                <p className="mb-1">{currentDesigner.collections} Runway Collections</p>
                <p className="mb-1">{currentDesigner.focus}</p>
                <p className="mb-3">Goal: {currentDesigner.goal}</p>
                <p className="text-gray-700">{currentDesigner.bio}</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleAmountSelect("ETB 500")}
                    className={`py-2 px-4 border ${
                      selectedAmount === "ETB 500" 
                        ? "bg-emerge-gold border-emerge-darkGold text-black" 
                        : "border-emerge-gold/50 hover:border-emerge-gold"
                    } transition-colors`}
                  >
                    ETB 500
                  </button>
                  <button
                    onClick={() => handleAmountSelect("ETB 1,000")}
                    className={`py-2 px-4 border ${
                      selectedAmount === "ETB 1,000" 
                        ? "bg-emerge-gold border-emerge-darkGold text-black" 
                        : "border-emerge-gold/50 hover:border-emerge-gold"
                    } transition-colors`}
                  >
                    ETB 1,000
                  </button>
                  <button
                    onClick={() => handleAmountSelect("ETB 2,500")}
                    className={`py-2 px-4 border ${
                      selectedAmount === "ETB 2,500" 
                        ? "bg-emerge-gold border-emerge-darkGold text-black" 
                        : "border-emerge-gold/50 hover:border-emerge-gold"
                    } transition-colors`}
                  >
                    ETB 2,500
                  </button>
                </div>
                
                <div className="flex items-center">
                  <span className="mr-3">Custom:</span>
                  <input
                    type="text"
                    placeholder="ETB"
                    value={customAmount}
                    onChange={handleCustomAmountChange}
                    className="emerge-input max-w-xs"
                  />
                </div>
                
                <Link 
                  to="/payment" 
                  className="block w-full sm:w-auto sm:inline-block text-center emerge-button-primary mt-4"
                >
                  DONATE NOW
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* Sponsorship Levels */}
        <section>
          <h2 className="emerge-heading text-3xl mb-8">Support a Model's Journey</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sponsorshipLevels.map((level, index) => (
              <div 
                key={index} 
                className="border p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="text-xl font-medium mb-3">{level.name}</h3>
                <p className="text-2xl font-serif mb-4">{level.amount}</p>
                <ul className="list-disc list-inside text-gray-700 mb-6">
                  {level.perks.map((perk, i) => (
                    <li key={i} className="mb-1">{perk}</li>
                  ))}
                </ul>
                <Link 
                  to="/payment" 
                  className="block text-center py-2 px-4 bg-emerge-cream border border-emerge-gold/50 hover:bg-emerge-gold hover:text-black transition-colors"
                >
                  Become a {level.name.split(" ")[0]} Sponsor
                </Link>
              </div>
            ))}
          </div>
        </section>
        
        {/* Impact Report */}
        <section className="mt-16 bg-emerge-cream p-8">
          <h2 className="emerge-heading text-2xl mb-6">Your Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center mb-8">
            <div>
              <p className="text-4xl font-serif mb-2">45+</p>
              <p>Designers Supported</p>
            </div>
            <div>
              <p className="text-4xl font-serif mb-2">120</p>
              <p>Scholarships Awarded</p>
            </div>
            <div>
              <p className="text-4xl font-serif mb-2">18</p>
              <p>International Shows</p>
            </div>
          </div>
          <p className="max-w-2xl mx-auto text-center">
            Your donations directly impact the lives and careers of talented fashion designers 
            across Africa. We provide education, resources, mentorship, and international 
            exposure opportunities to help them succeed in the global fashion industry.
          </p>
        </section>
      </div>
    </MainLayout>
  );
};

export default Donations;
