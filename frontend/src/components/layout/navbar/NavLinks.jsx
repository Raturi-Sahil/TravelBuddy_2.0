import { BookOpen, Calendar, Camera, Compass, MapPin } from 'lucide-react';
import React, { useState } from 'react';

import MapDropdown from './MapDropdown';

const NavLinks = ({ currentPath, onNavigate }) => {
  const [isMapDropdownOpen, setIsMapDropdownOpen] = useState(false);

  // Define nav items (Ai Buddy is handled separately in main Navbar)
  const navItems = [
    { name: 'Read Article', path: '/read-article', icon: BookOpen },
    { 
      name: 'Map', 
      path: '/map', 
      icon: MapPin, 
      isDropdown: true 
    },
    { name: 'Traveler Posts', path: '/user-posts', icon: Camera },
    { name: 'Activities', path: '/activities', icon: Calendar },
    { name: 'Local Guides', path: '/guides', icon: Compass },
  ];

  return (
    <div className="hidden md:flex items-center justify-center space-x-1 lg:space-x-2 xl:space-x-3 2xl:space-x-4 flex-1 min-w-0">
      {navItems.map((item) => {
        if (item.isDropdown) {
          return (
            <MapDropdown 
              key={item.name}
              isOpen={isMapDropdownOpen} 
              setIsOpen={setIsMapDropdownOpen} 
              currentPath={currentPath} 
              onNavigate={onNavigate} 
            />
          );
        }

        const isActive = currentPath === item.path;

        return (
          <button
            key={item.name}
            onClick={() => onNavigate(item.path)}
            className={`relative flex items-center space-x-1.5 px-3 py-2 text-xs lg:text-sm font-medium transition-all duration-300 rounded-xl group overflow-hidden ${
              isActive
                ? 'text-amber-600 bg-amber-50'
                : 'text-gray-600 hover:text-amber-600 hover:bg-gray-50'
            }`}
          >
            <item.icon 
                size={18} 
                strokeWidth={2} 
                className={`transition-transform duration-300 flex-shrink-0 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} 
            />
            <span className="hidden lg:inline whitespace-nowrap">{item.name}</span>
            
            {/* Active Indicator */}
            {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-full mx-3 mb-1"></span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default NavLinks;
