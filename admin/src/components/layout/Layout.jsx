import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#0f0f23]">
      <Sidebar />
      <main className="ml-72 p-8 min-h-screen">
        {/* Background gradient effects */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-72 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-3xl"></div>
        </div>
        {children}
      </main>
    </div>
  );
};

export default Layout;
