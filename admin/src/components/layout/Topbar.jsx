import { Search, Bell } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Topbar = () => {
  const location = useLocation();

  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/': return 'Overview';
      case '/users': return 'Users';
      case '/posts': return 'Posts';
      case '/articles': return 'Articles';
      case '/activities': return 'Activities';
      case '/guides': return 'Guides';
      case '/bookings': return 'Bookings';
      default: return 'Dashboard';
    }
  };

  return (
    <header className="h-14 border-b border-[#27272a] bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-40 px-8 flex items-center justify-between">
      {/* Breadcrumb / Title */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-zinc-500">Dashboard</span>
        <span className="text-zinc-600">/</span>
        <span className="font-medium text-white">{getPageTitle(location.pathname)}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Placeholder for future actions */}
      </div>
    </header>
  );
};

export default Topbar;
