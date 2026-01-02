import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  BookOpen,
  Calendar,
  MapPin,
  CalendarCheck,
  LogOut,
  Compass,
  Settings
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { logout } = useAuth();

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Overview' },
    { to: '/users', icon: Users, label: 'Users' },
    { to: '/posts', icon: FileText, label: 'Posts' },
    { to: '/articles', icon: BookOpen, label: 'Articles' },
    { to: '/activities', icon: Calendar, label: 'Activities' },
    { to: '/guides', icon: MapPin, label: 'Guides' },
    { to: '/bookings', icon: CalendarCheck, label: 'Bookings' },
  ];

  return (
    <aside className="fixed left-0 top-0 w-64 h-screen bg-[#09090b] border-r border-[#27272a] flex flex-col z-50">
      {/* Brand */}
      <div className="h-14 flex items-center px-6 border-b border-[#27272a]">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded bg-white flex items-center justify-center text-[#09090b]">
            <Compass className="w-4 h-4" />
          </div>
          <span className="text-sm font-semibold tracking-wide text-white">TravelBuddy<span className="text-zinc-500">Admin</span></span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-0.5 overflow-y-auto">
        <div className="px-3 mb-2">
          <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Platform</p>
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium transition-colors ${
                isActive
                  ? 'bg-[#27272a] text-white'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#27272a]/50'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-500'}`} />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User / Logout */}
      <div className="p-3 border-t border-[#27272a]">
        <div className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-[#27272a]/50 transition-colors group cursor-pointer" onClick={logout}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-medium text-zinc-400 border border-zinc-700">
              AD
            </div>
            <div>
              <p className="text-xs font-medium text-white">Admin User</p>
              <p className="text-[10px] text-zinc-500">admin@travelbuddy.com</p>
            </div>
          </div>
          <LogOut className="w-4 h-4 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity hover:text-white" />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
