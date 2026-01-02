import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Compass } from 'lucide-react';
import toast from 'react-hot-toast';
import { login } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { loginAdmin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await login(email, password);
      const { token } = response.data.data;
      loginAdmin(token, email);
      toast.success('Welcome back');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b] selection:bg-indigo-500/30">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white text-black mb-6 shadow-2xl shadow-white/10">
            <Compass className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back</h1>
          <p className="text-sm text-zinc-400 mt-2">Enter your credentials to access the admin panel</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2.5 bg-[#09090b] border border-[#27272a] rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all text-sm"
              placeholder="admin@travelbuddy.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2.5 bg-[#09090b] border border-[#27272a] rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all text-sm"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-2.5 bg-white text-black text-sm font-semibold rounded-lg hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 focus:ring-offset-[#09090b] disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-6 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                Sign In <LogIn className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center mt-8 text-xs text-zinc-600">
          Protected System • Authorized Personnel Only
        </p>
      </div>
    </div>
  );
};

export default Login;
