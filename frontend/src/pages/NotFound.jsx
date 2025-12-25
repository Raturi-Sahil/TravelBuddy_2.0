import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft, MapPin, Compass } from "lucide-react";

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-amber-500/5 to-orange-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Floating icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <MapPin className="absolute top-20 left-[15%] w-8 h-8 text-amber-500/20 animate-bounce" style={{ animationDelay: '0.5s' }} />
        <Compass className="absolute top-32 right-[20%] w-10 h-10 text-orange-500/20 animate-bounce" style={{ animationDelay: '1s' }} />
        <MapPin className="absolute bottom-32 left-[25%] w-6 h-6 text-amber-500/20 animate-bounce" style={{ animationDelay: '1.5s' }} />
        <Compass className="absolute bottom-20 right-[15%] w-8 h-8 text-orange-500/20 animate-bounce" style={{ animationDelay: '0.3s' }} />
      </div>

      <div className="relative z-10 text-center max-w-2xl mx-auto">
        {/* 404 Number */}
        <div className="relative mb-8">
          <h1 className="text-[180px] sm:text-[220px] font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 text-[180px] sm:text-[220px] font-black text-amber-500/10 blur-xl leading-none">
            404
          </div>
        </div>

        {/* Message */}
        <div className="space-y-4 mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Oops! Lost in the wilderness
          </h2>
          <p className="text-lg text-gray-400 max-w-md mx-auto">
            The page you're looking for seems to have wandered off the trail.
            Let's get you back on track!
          </p>
        </div>

        {/* Illustration */}
        <div className="mb-10 flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center shadow-2xl shadow-amber-500/30">
              <Compass className="w-12 h-12 text-white animate-spin-slow" style={{ animationDuration: '8s' }} />
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-20 h-3 bg-black/20 rounded-full blur-sm"></div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center justify-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Go Back
          </button>
          <button
            onClick={() => navigate('/')}
            className="group flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all duration-300 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40"
          >
            <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Back to Home
          </button>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-gray-500 text-sm mb-4">Or try one of these popular pages:</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {[
              { name: 'Activities', path: '/activities' },
              { name: 'Profile', path: '/profile' },
              { name: 'Posts', path: '/user-posts' },
              { name: 'Map', path: '/map' },
            ].map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all duration-200"
              >
                {link.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Custom animation for slow spin */}
      <style>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default NotFound;
