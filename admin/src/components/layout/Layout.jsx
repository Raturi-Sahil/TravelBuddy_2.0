import Sidebar from './Sidebar';
import Topbar from './Topbar';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-200 font-sans selection:bg-indigo-500/30">
      <Sidebar />
      <div className="pl-64 flex flex-col min-h-screen">
        <Topbar />
        <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
