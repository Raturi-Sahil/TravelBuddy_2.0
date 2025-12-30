import { Globe, Map, Plane } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const Preloader = ({ onFinish }) => {
  const [show, setShow] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        // Random increment for more realistic feel
        return prev + Math.random() * 10;
      });
    }, 150);

    // Initial delay before fading out
    const timer = setTimeout(() => {
      setFadeOut(true);
    }, 2500);

    // Remove from DOM
    const cleanup = setTimeout(() => {
      setShow(false);
      if (onFinish) onFinish();
    }, 3000);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(timer);
      clearTimeout(cleanup);
    };
  }, [onFinish]);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gray-50 overflow-hidden transition-all duration-700 ease-in-out ${
        fadeOut ? 'opacity-0 scale-110 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background Animated Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-200/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-200/20 rounded-full blur-[100px] animate-pulse delay-700"></div>

        {/* Floating Icons Background */}
        <div className="absolute top-20 left-20 opacity-10 animate-bounce delay-100">
          <Map size={48} className="text-amber-500" />
        </div>
        <div className="absolute bottom-40 right-20 opacity-10 animate-bounce delay-300">
           <Globe size={64} className="text-orange-500" />
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Main Logo Container with Orbit Animation */}
        <div className="relative mb-12">
          {/* Central Logo */}
          <div className="w-24 h-24 bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl shadow-2xl flex items-center justify-center transform rotate-3 transition-transform hover:scale-105 z-20 relative">
             <Globe className="text-white w-12 h-12" strokeWidth={1.5} />
          </div>

          {/* Decorative Rings */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-orange-200 rounded-full animate-ping opacity-20"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border border-amber-100 rounded-full"></div>

          {/* Orbiting Plane */}
          <div className="absolute inset-[-40px] animate-spin-slow">
            <div className="absolute top-1/2 -right-3 transform -translate-y-1/2 rotate-90">
               <Plane className="text-amber-600 w-8 h-8 drop-shadow-lg" fill="currentColor" />
            </div>
          </div>
        </div>

        {/* Text Branding */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-amber-700 to-gray-900 tracking-tighter animate-fade-in-up">
            TravelBuddy
          </h1>

          <p className="text-gray-500 text-sm font-medium tracking-widest uppercase animate-pulse">
            Discovering the world
          </p>
        </div>

        {/* Custom Progress Bar */}
        <div className="mt-8 w-64 h-1.5 bg-gray-200 rounded-full overflow-hidden relative">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-500 to-orange-600 transition-all duration-300 ease-out rounded-full"
            style={{ width: `${Math.min(progress, 100)}%` }}
          >
             <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-r from-transparent to-white/50 skew-x-12 opacity-50"></div>
          </div>
        </div>

        {/* Percentage Text */}
        <div className="mt-2 text-xs font-semibold text-amber-600 font-mono">
           {Math.min(Math.round(progress), 100)}%
        </div>
      </div>

      {/* CSS for custom animations if not in tailwind config */}
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        .animate-fade-in-up {
           animation: fadeInUp 0.8s ease-out forwards;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Preloader;
