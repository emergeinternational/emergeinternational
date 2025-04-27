
import { Link } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import UpcomingWorkshops from "@/components/education/UpcomingWorkshops";

const Home = () => {
  const workshops = [
    {
      id: "1",
      name: "Fashion Design & Model Collaboration",
      date: "May 15, 2025",
      location: "Addis Ababa",
      spots: 8
    },
    {
      id: "2",
      name: "Fashion Photography Essentials",
      date: "May 20, 2025",
      location: "Online Workshop",
      spots: 15
    }
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-emerge-darkBg text-white relative">
        <div className="emerge-container py-20 md:py-32 flex flex-col items-center">
          <h1 className="emerge-heading text-4xl md:text-6xl mb-6 text-center">
            EMERGE INTERNATIONAL
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl text-center">
            Supporting emerging fashion talent across Africa - from visionary designers and runway models to creative photographers and industry professionals - through education, resources, and global market access.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/shop" className="emerge-button-primary">
              Shop Designer Collections
            </Link>
            <Link to="/education" className="emerge-button-secondary">
              Industry Education
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="emerge-container">
          <h2 className="emerge-heading text-3xl mb-8">Featured Designer Collections</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { id: 1, name: "Designer Collection: Emerge Series", price: "ETB 4,800", image: "/placeholder.svg" },
              { id: 2, name: "Runway Accessories", price: "ETB 12,500", image: "/placeholder.svg" },
              { id: 3, name: "Catwalk Collection", price: "ETB 4,800", image: "/placeholder.svg" },
              { id: 4, name: "Editorial Pieces", price: "ETB 12,500", image: "/placeholder.svg" }
            ].map(product => (
              <Link to={`/shop/product/${product.id}`} key={product.id} className="group">
                <div className="bg-gray-100 aspect-square mb-4 overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="font-medium">{product.name}</h3>
                <p className="text-gray-700">{product.price}</p>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link to="/shop" className="emerge-button-primary">
              View All Collections
            </Link>
          </div>
        </div>
      </section>

      {/* Education Section */}
      <section className="py-16 bg-emerge-cream">
        <div className="emerge-container">
          <h2 className="emerge-heading text-3xl mb-8">Industry Education & Workshops</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { id: 1, name: "Fashion Design & Model Collaboration", level: "Beginner", image: "/placeholder.svg" },
              { id: 2, name: "Fashion Photography Essentials", level: "Intermediate", image: "/placeholder.svg" },
              { id: 3, name: "Runway & Editorial Excellence", level: "Advanced", image: "/placeholder.svg" }
            ].map(course => (
              <Link to={`/education/course/${course.id}`} key={course.id} className="bg-white group shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={course.image} 
                    alt={course.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <span className="text-xs text-gray-500">{course.level}</span>
                  <h3 className="font-medium text-lg">{course.name}</h3>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link to="/education" className="emerge-button-primary">
              Explore All Courses
            </Link>
          </div>
        </div>
      </section>

      {/* Upcoming Workshops Section */}
      <section className="py-16">
        <div className="emerge-container">
          <UpcomingWorkshops workshops={workshops} showAllWorkshops={false} />
        </div>
      </section>

      {/* Donation Feature */}
      <section className="py-16 bg-emerge-darkBg text-white">
        <div className="emerge-container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="emerge-heading text-3xl mb-4">Support Emerging Fashion Talent</h2>
            <p className="mb-8">
              Your donations directly fund scholarships, resources, and opportunities for talented 
              fashion designers, models, photographers, and industry professionals across Africa.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Link 
                to="/donations" 
                className="px-8 py-3 bg-emerge-gold hover:bg-emerge-darkGold text-black font-medium rounded-sm transition-all duration-200"
              >
                ETB 500
              </Link>
              <Link 
                to="/donations" 
                className="px-8 py-3 bg-emerge-gold hover:bg-emerge-darkGold text-black font-medium rounded-sm transition-all duration-200"
              >
                ETB 1,000
              </Link>
              <Link 
                to="/donations" 
                className="px-8 py-3 bg-emerge-gold hover:bg-emerge-darkGold text-black font-medium rounded-sm transition-all duration-200"
              >
                ETB 2,500
              </Link>
            </div>
            <Link to="/donations" className="emerge-button-secondary">
              Donate Now
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16">
        <div className="emerge-container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="emerge-heading text-3xl mb-4">Join Our Fashion Community</h2>
            <p className="mb-6">
              Stay updated on new designer collections, model castings, photography exhibitions, and industry workshops.
            </p>
            <form className="flex flex-col sm:flex-row gap-2 w-full max-w-md mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 py-2 px-4 border border-gray-300 focus:outline-none focus:border-emerge-gold"
              />
              <button 
                type="submit" 
                className="bg-emerge-gold hover:bg-emerge-darkGold text-black font-medium py-2 px-6 transition-all duration-200"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Home;
