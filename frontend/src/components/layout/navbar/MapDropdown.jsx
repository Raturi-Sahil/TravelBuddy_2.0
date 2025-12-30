import { Activity, Bed, ChevronDown, Landmark, Plane,ShieldAlert, ShoppingBag, Users, UtensilsCrossed } from 'lucide-react';
import React, { useEffect,useRef } from 'react';

const MapDropdown = ({ isOpen, setIsOpen, currentPath, onNavigate }) => {
  const dropdownRef = useRef(null);

  const mapLinks = [
    { name: 'Nearby Traveller', path: '/map', icon: Users },
    { name: 'Nearby Activities', path: '/map/nearby-activities', icon: Activity },
    { name: 'Near Hotels', path: '/map/hotels', icon: Bed },
    { name: 'Tourist Places', path: '/map/tourist-places', icon: Landmark },
    { name: 'Food & Nightlife', path: '/map/food-nightlife', icon: UtensilsCrossed },
    { name: 'Shopping', path: '/map/shopping', icon: ShoppingBag },
    { name: 'Emergency', path: '/map/emergency', icon: ShieldAlert },
    { name: 'Transport', path: '/map/transport', icon: Plane },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsOpen]);

  const isActive = mapLinks.some(child => currentPath === child.path);

  return (
    <div className="relative z-50 flex-shrink-0" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-1 py-2 text-xs lg:text-sm font-medium transition-all duration-300 whitespace-nowrap group ${
          isActive
            ? 'text-amber-600'
            : 'text-gray-600 hover:text-amber-600'
        }`}
      >
        <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-amber-50' : 'group-hover:bg-gray-50'}`}>
             <Plane size={18} strokeWidth={2} className={`transition-transform duration-300 group-hover:-rotate-12 ${isActive ? 'text-amber-600' : 'text-gray-500 group-hover:text-amber-600'}`} />
        </div>
        <span className="hidden lg:inline group-hover:translate-x-0.5 transition-transform duration-300">Map</span>
        <ChevronDown size={14} className={`transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180 text-amber-600' : 'text-gray-400 group-hover:text-amber-600'}`} />
      </button>

      {isOpen && (
        <div className="absolute left-1/2 -translate-x-1/2 top-[calc(100%+0.5rem)] mt-2 z-[9999] w-72 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-3 ring-1 ring-gray-100">
             <div className="grid grid-cols-1 gap-1">
                 {mapLinks.map((child) => (
                  <button
                    key={child.name}
                    onClick={() => {
                      onNavigate(child.path);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left group/item ${
                        currentPath === child.path ? 'bg-amber-50 text-amber-700' : 'text-gray-600 hover:text-amber-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg transition-colors ${
                        currentPath === child.path ? 'bg-white shadow-sm text-amber-600' : 'bg-gray-100 text-gray-500 group-hover/item:bg-white group-hover/item:shadow-sm group-hover/item:text-amber-600'
                    }`}>
                      <child.icon size={18} />
                    </div>
                    <span className="text-sm font-medium">{child.name}</span>
                    {currentPath === child.path && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-500" />}
                  </button>
                ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapDropdown;
