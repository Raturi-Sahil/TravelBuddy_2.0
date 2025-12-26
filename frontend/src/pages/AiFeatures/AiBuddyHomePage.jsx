import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, Briefcase, CloudSun, Compass, Sparkles, ArrowRight } from 'lucide-react';

const AiBuddyHomePage = () => {
  const navigate = useNavigate();

  const features = [
    {
      id: 'trip-planner',
      title: 'AI Trip Planner',
      description: 'Generate comprehensive day-by-day itineraries tailored to your interests and budget in seconds.',
      icon: <Map className="w-8 h-8 text-blue-600" />,
      color: 'bg-white hover:bg-blue-50/50',
      border: 'border-gray-200 hover:border-blue-200',
      link: '/ai-trip-planner',
      status: 'Available'
    },
    {
      id: 'packaging-planner',
      title: 'AI Packaging Planner',
      description: 'Get a personalized packing list based on your destination, weather, and planned activities.',
      icon: <Briefcase className="w-8 h-8 text-purple-600" />,
      color: 'bg-white hover:bg-purple-50/50',
      border: 'border-gray-200 hover:border-purple-200',
      link: '/ai-packaging-planner',
      status: 'Available'
    },
    {
      id: 'weather-planner',
      title: 'AI Weather Planner',
      description: 'Advanced weather insights for your trip duration with smart activity recommendations.',
      icon: <CloudSun className="w-8 h-8 text-amber-500" />,
      color: 'bg-white hover:bg-amber-50/50',
      border: 'border-gray-200 hover:border-amber-200',
      link: '/ai-weather-planner',
      status: 'Available'
    },
    {
      id: 'local-guide',
      title: 'AI Local Guide',
      description: 'Chat with an AI expert on local culture, hidden gems, and language tips.',
      icon: <Compass className="w-8 h-8 text-emerald-600" />,
      color: 'bg-white hover:bg-emerald-50/50',
      border: 'border-gray-200 hover:border-emerald-200',
      link: '/ai-local-guide',
      status: 'Available'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-amber-100 shadow-sm mb-6">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium text-amber-900">Powered by Advanced AI</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900">
            Your AI Travel Hub
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Explore our suite of intelligent tools designed to make every step of your journey seamless, personalized, and unforgettable.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {features.map((feature) => (
            <div
              key={feature.id}
              onClick={() => feature.status === 'Available' ? navigate(feature.link) : null}
              className={`group relative p-8 rounded-3xl border transition-all duration-300 backdrop-blur-md cursor-pointer
                ${feature.color} ${feature.border}
                ${feature.status !== 'Available' ? 'opacity-75 cursor-not-allowed grayscale-[0.3]' : 'hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-200/50'}
              `}
            >
              <div className="flex items-start justify-between mb-6">
                <div className={`p-3 rounded-2xl bg-gray-50 border border-gray-100 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                  {feature.icon}
                </div>
                {feature.status !== 'Available' && (
                  <span className="px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-500 rounded-full border border-gray-200">
                    {feature.status}
                  </span>
                )}
              </div>

              <h3 className="text-2xl font-bold mb-3 text-gray-900 group-hover:text-amber-600 transition-colors">
                {feature.title}
              </h3>

              <p className="text-gray-600 mb-6 leading-relaxed">
                {feature.description}
              </p>

              <div className={`flex items-center gap-2 font-semibold transition-colors
                ${feature.status === 'Available' ? 'text-blue-600 group-hover:text-blue-700' : 'text-gray-400'}
              `}>
                <span>{feature.status === 'Available' ? 'Try Now' : 'In Development'}</span>
                {feature.status === 'Available' && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AiBuddyHomePage;
