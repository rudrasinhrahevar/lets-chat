import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from 'store/useAuthStore';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await login(email, password);
      if (result?.requiresTwoStep) { navigate('/verify-2fa', { state: { userId: result.userId } }); return; }
      toast.success('Welcome back!');
      navigate('/');
    } catch (error) { toast.error(error.response?.data?.message || 'Login failed'); }
  };

  return (
    <div className="min-h-screen bg-wa-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-wa-teal rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-wa-text">Welcome Back</h1>
          <p className="text-wa-text-sec mt-1">Sign in to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-wa-panel rounded-2xl p-6 space-y-4 shadow-xl">
          <div>
            <label className="block text-sm text-wa-text-sec mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full bg-wa-input text-wa-text rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-wa-teal transition" placeholder="Enter your email" required />
          </div>
          <div>
            <label className="block text-sm text-wa-text-sec mb-1">Password</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                className="w-full bg-wa-input text-wa-text rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-wa-teal transition" placeholder="Enter your password" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-wa-icon hover:text-wa-text">
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          <div className="text-right"><Link to="/forgot-password" className="text-sm text-wa-teal hover:underline">Forgot password?</Link></div>
          <button type="submit" disabled={isLoading}
            className="w-full bg-wa-teal hover:bg-wa-teal-dk text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
          <p className="text-center text-wa-text-sec text-sm">
            Don't have an account? <Link to="/register" className="text-wa-teal hover:underline">Sign up</Link>
          </p>
        </form>
        <p className="text-center text-wa-text-sec text-xs mt-4">Demo: admin@demo.com / Admin@123 or user1@demo.com / User@123</p>
      </div>
    </div>
  );
}
