import { useUser } from "@clerk/clerk-react";

// Import all section components
import AIFeaturesSection from './components/AIFeaturesSection';
import ContentCreationSection from './components/ContentCreationSection';
import CTASection from './components/CTASection';
import FeaturesSection from './components/FeaturesSection';
import HeroSection from './components/HeroSection';
import MapSection from './components/MapSection';
import NotSignedInView from './components/NotSignedInView';
import ServicesSection from './components/ServicesSection';

function HomePage() {
  const { isSignedIn } = useUser();

  // Show sign-in prompt for unauthenticated users
  if (!isSignedIn) {
    return <NotSignedInView />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-900">
      {/* Hero Section with Animated Slides */}
      <HeroSection />

      {/* All Services Section */}
      <ServicesSection />

      {/* AI Features Section */}
      <AIFeaturesSection />

      {/* Interactive Map Section */}
      <MapSection />

      {/* Content Creation Section */}
      <ContentCreationSection />

      {/* Why Choose TravelBuddy */}
      <FeaturesSection />

      {/* Call to Action */}
      <CTASection />
    </div>
  );
}

export default HomePage;