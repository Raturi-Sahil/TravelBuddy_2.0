import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Map,
  Briefcase,
  CloudSun,
  Compass,
  Sparkles,
  ArrowRight,
  Zap,
  Bot,
  Brain,
  Rocket,
  Star,
  Globe,
  MessageCircle
} from 'lucide-react';

const AiBuddyHomePage = () => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Animated particles effect
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const generateParticles = () => {
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 2,
        duration: Math.random() * 20 + 10,
        delay: Math.random() * 5,
      }));
      setParticles(newParticles);
    };
    generateParticles();
  }, []);

  const handleMouseMove = (e, cardId) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
    setHoveredCard(cardId);
  };

  const features = [
    {
      id: 'trip-planner',
      title: 'AI Trip Planner',
      description: 'Generate comprehensive day-by-day itineraries tailored to your interests, budget, and travel style in seconds.',
      icon: Map,
      gradient: 'from-blue-500 via-indigo-500 to-purple-600',
      glowColor: 'rgba(99, 102, 241, 0.4)',
      bgGradient: 'from-blue-50 to-indigo-50',
      iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
      link: '/ai-trip-planner',
      status: 'Available',
      stats: '10k+ Trips Planned',
      backgroundImage: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80'
    },
    {
      id: 'packaging-planner',
      title: 'AI Packing Planner',
      description: 'Get a personalized, activity-specific packing list based on destination weather and your planned activities.',
      icon: Briefcase,
      gradient: 'from-purple-500 via-fuchsia-500 to-pink-500',
      glowColor: 'rgba(168, 85, 247, 0.4)',
      bgGradient: 'from-purple-50 to-fuchsia-50',
      iconBg: 'bg-gradient-to-br from-purple-500 to-fuchsia-600',
      link: '/ai-packaging-planner',
      status: 'Available',
      stats: '5k+ Lists Created',
      backgroundImage: 'https://images.unsplash.com/photo-1553531384-cc64ac80f931?w=800&q=80'
    },
    {
      id: 'weather-planner',
      title: 'AI Weather Planner',
      description: 'Advanced weather insights for your entire trip with smart activity recommendations for any condition.',
      icon: CloudSun,
      gradient: 'from-amber-400 via-orange-500 to-red-500',
      glowColor: 'rgba(251, 146, 60, 0.4)',
      bgGradient: 'from-amber-50 to-orange-50',
      iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600',
      link: '/ai-weather-planner',
      status: 'Available',
      stats: '15k+ Forecasts',
      backgroundImage: 'https://images.unsplash.com/photo-1504253163759-c23fccaebb55?w=800&q=80'
    },
    {
      id: 'local-guide',
      title: 'AI Local Guide',
      description: 'Chat with an AI expert on local culture, hidden gems, authentic experiences, and language tips.',
      icon: Compass,
      gradient: 'from-emerald-400 via-teal-500 to-cyan-600',
      glowColor: 'rgba(20, 184, 166, 0.4)',
      bgGradient: 'from-emerald-50 to-teal-50',
      iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
      link: '/ai-local-guide',
      status: 'Available',
      stats: '8k+ Guides Generated',
      backgroundImage: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80'
    }
  ];

  const stats = [
    { icon: Globe, value: '150+', label: 'Countries Covered' },
    { icon: MessageCircle, value: '50k+', label: 'AI Conversations' },
    { icon: Star, value: '4.9', label: 'User Rating' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 pt-24 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">

      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-violet-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse"
             style={{ animationDuration: '8s' }} />
        <div className="absolute top-[40%] right-[-15%] w-[500px] h-[500px] bg-gradient-to-br from-amber-400/15 to-orange-400/15 rounded-full blur-3xl animate-pulse"
             style={{ animationDuration: '10s', animationDelay: '2s' }} />
        <div className="absolute bottom-[-10%] left-[30%] w-[400px] h-[400px] bg-gradient-to-br from-emerald-400/15 to-teal-400/15 rounded-full blur-3xl animate-pulse"
             style={{ animationDuration: '12s', animationDelay: '4s' }} />

        {/* Floating Particles */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 opacity-30"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animation: `float ${particle.duration}s ease-in-out infinite`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-20px) rotate(5deg); }
          50% { transform: translateY(-10px) rotate(-5deg); }
          75% { transform: translateY(-30px) rotate(3deg); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        .shimmer-text {
          background: linear-gradient(
            90deg,
            #1e293b 0%,
            #6366f1 25%,
            #8b5cf6 50%,
            #6366f1 75%,
            #1e293b 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 4s linear infinite;
        }
        .card-glow {
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .card-glow:hover {
          transform: translateY(-8px) scale(1.02);
        }
      `}</style>

      <div className="relative z-10 max-w-7xl mx-auto">

        {/* Hero Section */}
        <div className="text-center mb-20">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 backdrop-blur-sm border border-indigo-100 shadow-lg shadow-indigo-100/50 mb-8 group hover:scale-105 transition-all duration-300">
            <div className="relative">
              <Bot className="w-5 h-5 text-indigo-600" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </div>
            <span className="text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Powered by Advanced AI
            </span>
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
          </div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
            <span className="text-slate-900">Your </span>
            <span className="shimmer-text">AI Travel</span>
            <span className="text-slate-900"> Hub</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed">
            Experience the future of travel planning with our intelligent AI tools.
            From itineraries to packing, weather insights to local tips —
            <span className="text-indigo-600 font-semibold"> everything you need in one place.</span>
          </p>

          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-12">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="flex items-center gap-3 px-6 py-3 bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300"
              >
                <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100">
                  <stat.icon className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="text-left">
                  <div className="text-xl font-bold text-slate-900">{stat.value}</div>
                  <div className="text-xs text-slate-500 font-medium">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-16">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            const isHovered = hoveredCard === feature.id;

            return (
              <div
                key={feature.id}
                onClick={() => feature.status === 'Available' ? navigate(feature.link) : null}
                onMouseMove={(e) => handleMouseMove(e, feature.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className={`card-glow group relative overflow-hidden rounded-3xl cursor-pointer
                  ${feature.status !== 'Available' ? 'opacity-60 cursor-not-allowed' : ''}
                `}
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {/* Background Image */}
                <div className="absolute inset-0 overflow-hidden rounded-3xl">
                  <img
                    src={feature.backgroundImage}
                    alt={feature.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Dark Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 group-hover:from-black/70 group-hover:via-black/30 transition-all duration-500`} />
                  {/* Color Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-30 group-hover:opacity-40 transition-opacity duration-500`} />
                </div>

                {/* Hover Glow Effect */}
                {isHovered && (
                  <div
                    className="absolute inset-0 transition-opacity duration-300 rounded-3xl"
                    style={{
                      background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, ${feature.glowColor} 0%, transparent 50%)`,
                    }}
                  />
                )}

                {/* Card Content */}
                <div className="relative p-8 h-full flex flex-col min-h-[320px]">

                  {/* Top Section */}
                  <div className="flex items-start justify-between mb-6">
                    {/* Icon */}
                    <div className={`relative p-4 rounded-2xl ${feature.iconBg} shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                      <IconComponent className="w-8 h-8 text-white" />
                      {/* Glow ring */}
                      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-500`} />
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-xs font-semibold text-slate-700">{feature.status}</span>
                    </div>
                  </div>

                  {/* Content - Push to bottom */}
                  <div className="mt-auto">
                    <h3 className="text-2xl md:text-3xl font-bold mb-3 text-white drop-shadow-lg group-hover:scale-[1.02] transition-transform duration-300 origin-left">
                      {feature.title}
                    </h3>

                    <p className="text-white/85 mb-6 leading-relaxed text-sm md:text-base drop-shadow">
                      {feature.description}
                    </p>

                    {/* Stats & CTA */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/20">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-medium text-white/80">{feature.stats}</span>
                      </div>

                      <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/95 backdrop-blur-sm text-slate-900 font-semibold text-sm shadow-lg group-hover:shadow-xl group-hover:scale-105 group-hover:bg-white transition-all duration-300">
                        <span>Explore</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </button>
                    </div>
                  </div>

                  {/* Decorative Elements */}
                  <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${feature.gradient} rounded-full opacity-10 group-hover:opacity-20 group-hover:scale-150 transition-all duration-700`} />
                  <div className={`absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-br ${feature.gradient} rounded-full opacity-5 group-hover:opacity-10 group-hover:scale-150 transition-all duration-700`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 p-8 md:p-12 text-center shadow-2xl shadow-indigo-500/30">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,white_25%,white_50%,transparent_50%,transparent_75%,white_75%)] bg-[length:60px_60px]" />
          </div>

          {/* Floating Icons */}
          <div className="absolute top-4 left-8 animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}>
            <Brain className="w-8 h-8 text-white/20" />
          </div>
          <div className="absolute bottom-8 right-12 animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}>
            <Rocket className="w-10 h-10 text-white/20" />
          </div>
          <div className="absolute top-12 right-20 animate-bounce" style={{ animationDelay: '2s', animationDuration: '3.5s' }}>
            <Sparkles className="w-6 h-6 text-white/30" />
          </div>

          <div className="relative z-10">
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
              Ready to Transform Your Travel Experience?
            </h2>
            <p className="text-indigo-100 max-w-2xl mx-auto mb-8 text-lg">
              Join thousands of travelers who plan smarter, pack better, and explore deeper with AI.
            </p>
            <button
              onClick={() => navigate('/ai-trip-planner')}
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-indigo-600 font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              <span>Start Planning Now</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiBuddyHomePage;