import {
  ArrowRight,
  BookOpen,
  Bot,
  Calendar,
  Camera,
  Compass,
  Facebook,
  Globe,
  Heart,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Shield,
  Twitter,
  Youtube
} from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Footer() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      // Add newsletter signup logic here
      setEmail('');
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    window.scrollTo(0, 0);
  };

  const exploreLinks = [
    { name: 'Activities', path: '/activities', icon: Calendar },
    { name: 'Local Guides', path: '/guides', icon: Compass },
    { name: 'Traveler Posts', path: '/user-posts', icon: Camera },
    { name: 'Travel Articles', path: '/read-article', icon: BookOpen },
  ];

  const featureLinks = [
    { name: 'Interactive Map', path: '/map', icon: MapPin },
    { name: 'AI Trip Buddy', path: '/ai-buddy', icon: Bot },
    { name: 'Find Companions', path: '/', icon: Globe },
  ];

  const legalLinks = [
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Terms of Service', path: '/terms' },
    { name: 'Cookie Policy', path: '/cookies' },
    { name: 'Safety Tips', path: '/safety' },
  ];

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, url: 'https://facebook.com' },
    { name: 'Twitter', icon: Twitter, url: 'https://twitter.com' },
    { name: 'Instagram', icon: Instagram, url: 'https://instagram.com' },
    { name: 'YouTube', icon: Youtube, url: 'https://youtube.com' }
  ];

  return (
    <footer className="bg-gray-900 text-white mt-auto border-t border-gray-800">
      {/* Upper Footer - Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12">

          {/* Brand Column (4 columns) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-2.5 rounded-xl shadow-lg shadow-amber-900/20">
                <Globe className="text-white" size={24} />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  TravelBuddy
                </span>
                <div className="text-xs text-amber-500 uppercase tracking-wider font-semibold mt-0.5">Explore Together</div>
              </div>
            </div>

            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              Your ultimate companion for discovering the world. Connect with travelers, find local guides, and create unforgettable adventures powered by AI.
            </p>

            <div className="flex space-x-4 pt-2">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-800 p-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-amber-600 transition-all duration-300 group"
                  aria-label={social.name}
                >
                  <social.icon size={18} className="transform group-hover:scale-110 transition-transform" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Column 1 - Explore (2 columns) */}
          <div className="lg:col-span-2">
            <h3 className="font-bold text-lg text-white mb-6">Explore</h3>
            <ul className="space-y-4">
              {exploreLinks.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => handleNavigation(link.path)}
                    className="flex items-center text-gray-400 hover:text-amber-500 transition-colors duration-200 text-sm group w-full text-left"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Links Column 2 - Features (3 columns) */}
          <div className="lg:col-span-3">
            <h3 className="font-bold text-lg text-white mb-6">Features</h3>
            <ul className="space-y-4">
              {featureLinks.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => handleNavigation(link.path)}
                    className="flex items-center text-gray-400 hover:text-amber-500 transition-colors duration-200 text-sm group w-full text-left"
                  >
                    <link.icon size={16} className="mr-3 text-gray-600 group-hover:text-amber-500 transition-colors" />
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-8">
               <h3 className="font-bold text-lg text-white mb-4">Contact</h3>
               <div className="space-y-3">
                 <div className="flex items-center text-gray-400 text-sm group cursor-pointer hover:text-white transition-colors">
                    <Mail size={16} className="mr-3 text-amber-600" />
                    hello@travelbuddy.com
                 </div>
                 <div className="flex items-center text-gray-400 text-sm group cursor-pointer hover:text-white transition-colors">
                    <Phone size={16} className="mr-3 text-amber-600" />
                    +1 (555) 123-4567
                 </div>
               </div>
            </div>
          </div>

          {/* Newsletter Column (3 columns) */}
          <div className="lg:col-span-3">
            <h3 className="font-bold text-lg text-white mb-6">Stay Updated</h3>
            <p className="text-gray-400 text-sm mb-4">
              Subscribe to get the latest travel tips, destination guides, and exclusive offers.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all placeholder-gray-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold py-2.5 px-4 rounded-xl shadow-lg shadow-amber-900/30 hover:shadow-amber-900/50 transition-all duration-300 flex items-center justify-center group"
              >
                <span>Subscribe</span>
                <ArrowRight size={16} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
            <div className="mt-6 flex items-center space-x-2 text-xs text-gray-500">
              <Shield size={12} className="text-green-500" />
              <span>Your data is secure. No spam.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer - Copyright & Legal */}
      <div className="border-t border-gray-800 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">

            {/* Copyright */}
            <div className="flex items-center text-gray-500 text-sm">
              <span>© {new Date().getFullYear()} TravelBuddy. Made with</span>
              <Heart size={14} className="mx-1.5 text-red-500 fill-red-500 animate-pulse" />
              <span>for travelers.</span>
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
              {legalLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => handleNavigation(link.path)}
                  className="text-gray-500 hover:text-amber-500 transition-colors duration-200 text-sm font-medium"
                >
                  {link.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;