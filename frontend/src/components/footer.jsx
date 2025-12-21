import {
  ArrowRight,
  Calendar,
  Compass,
  Facebook,
  FileText,
  Globe,
  Heart,
  HelpCircle,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Plane,
  Shield,
  Star,
  Twitter,
  Users,
  Youtube} from 'lucide-react';
import React, { useState } from 'react';

function Footer() {
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = () => {
    if (email.trim()) {
      console.log('Newsletter signup:', email);
      setEmail('');
      // Add newsletter signup logic here
    }
  };

  const handleNavigation = (path) => {
    console.log(`Navigating to: ${path}`);
    // Add navigation logic here
  };

  const quickLinks = [
    { name: 'Discover', path: '/', icon: Compass },
    { name: 'Map', path: '/map', icon: MapPin },
    { name: 'Activities', path: '/activities', icon: Calendar },
    { name: 'Connections', path: '/connections', icon: Users },
    { name: 'Messages', path: '/messages', icon: MessageCircle }
  ];

  const supportLinks = [
    { name: 'Help Center', path: '/help', icon: HelpCircle },
    { name: 'Safety Tips', path: '/safety', icon: Shield },
    { name: 'How it Works', path: '/how-it-works', icon: Star },
    { name: 'Contact Us', path: '/contact', icon: Mail }
  ];

  const legalLinks = [
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Terms of Service', path: '/terms' },
    { name: 'Cookie Policy', path: '/cookies' },
    { name: 'Community Guidelines', path: '/guidelines' },
    { name: 'Refund Policy', path: '/refund' }
  ];

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, url: 'https://facebook.com' },
    { name: 'Twitter', icon: Twitter, url: 'https://twitter.com' },
    { name: 'Instagram', icon: Instagram, url: 'https://instagram.com' },
    { name: 'YouTube', icon: Youtube, url: 'https://youtube.com' }
  ];

  const popularDestinations = [
    'Tokyo, Japan',
    'Paris, France',
    'Bali, Indonesia',
    'New York, USA',
    'London, UK',
    'Barcelona, Spain'
  ];

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-amber-600 p-2 rounded-lg">
                <Globe className="text-white" size={24} />
              </div>
              <div>
                <span className="text-xl font-bold text-amber-600">
                  TravelBuddy
                </span>
                <div className="text-xs text-gray-500 -mt-1">Find your travel buddy</div>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              Connect with fellow travelers, discover amazing destinations, and create unforgettable memories together. Your next adventure is just a connection away.
            </p>

            {/* Social Links */}
            <div className="flex space-x-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  className="bg-white p-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-gray-600 hover:text-amber-600 border border-gray-200 hover:border-amber-300"
                  aria-label={social.name}
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Compass size={16} className="mr-2 text-amber-600" />
              Explore
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => handleNavigation(link.path)}
                    className="flex items-center text-gray-600 hover:text-amber-600 transition-colors duration-200 text-sm group"
                  >
                    <link.icon size={14} className="mr-2 opacity-60 group-hover:opacity-100" />
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <HelpCircle size={16} className="mr-2 text-amber-600" />
              Support
            </h3>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => handleNavigation(link.path)}
                    className="flex items-center text-gray-600 hover:text-amber-600 transition-colors duration-200 text-sm group"
                  >
                    <link.icon size={14} className="mr-2 opacity-60 group-hover:opacity-100" />
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>

            {/* Contact Info */}
            <div className="mt-6 space-y-2">
              <div className="flex items-center text-gray-600 text-sm">
                <Mail size={14} className="mr-2 text-amber-600" />
                hello@travelbuddy.com
              </div>
              <div className="flex items-center text-gray-600 text-sm">
                <Phone size={14} className="mr-2 text-amber-600" />
                +1 (555) 123-4567
              </div>
            </div>
          </div>

          {/* Newsletter & Popular Destinations */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Mail size={16} className="mr-2 text-amber-600" />
              Stay Updated
            </h3>

            {/* Newsletter Signup */}
            <div className="mb-6">
              <p className="text-gray-600 text-sm mb-3">
                Get travel tips and discover new destinations
              </p>
              <div className="flex">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                <button
                  onClick={handleNewsletterSubmit}
                  className="bg-amber-600 text-white px-4 py-2 rounded-r-lg hover:bg-amber-700 transition-all duration-200 flex items-center"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* Popular Destinations */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center text-sm">
                <Plane size={14} className="mr-2 text-amber-600" />
                Popular Destinations
              </h4>
              <ul className="space-y-2">
                {popularDestinations.map((destination) => (
                  <li key={destination}>
                    <button
                      onClick={() => handleNavigation(`/destination/${destination.toLowerCase().replace(/[^a-z0-9]/g, '-')}`)}
                      className="text-gray-600 hover:text-amber-600 transition-colors duration-200 text-xs block hover:underline"
                    >
                      {destination}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">

            {/* Copyright */}
            <div className="flex items-center text-gray-600 text-sm">
              <span>© 2025 TravelBuddy. Made with</span>
              <Heart size={14} className="mx-1 text-red-500 fill-current" />
              <span>for travelers worldwide</span>
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap justify-center lg:justify-end space-x-6">
              {legalLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => handleNavigation(link.path)}
                  className="text-gray-600 hover:text-amber-600 transition-colors duration-200 text-sm"
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