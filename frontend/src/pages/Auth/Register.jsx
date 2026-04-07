import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from 'store/useAuthStore';
import toast from 'react-hot-toast';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) return toast.error('Passwords do not match');
    if (password.length < 8) return toast.error('Password must be 8+ characters');
    try {
      const result = await register(name, email, password);
      toast.success('OTP sent to your email!');
      navigate('/verify-otp', { state: { userId: result.userId, email } });
    } catch (error) { toast.error(error.response?.data?.message || 'Registration failed'); }
  };

  return (
    <div className="min-h-screen bg-wa-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-wa-teal rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-wa-text">Create Account</h1>
          <p className="text-wa-text-sec mt-1">Join ChatApp today</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-wa-panel rounded-2xl p-6 space-y-4 shadow-xl">
          <div><label className="block text-sm text-wa-text-sec mb-1">Full Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-wa-input text-wa-text rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-wa-teal transition" placeholder="Your name" required /></div>
          <div><label className="block text-sm text-wa-text-sec mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-wa-input text-wa-text rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-wa-teal transition" placeholder="your@email.com" required /></div>
          <div><label className="block text-sm text-wa-text-sec mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-wa-input text-wa-text rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-wa-teal transition" placeholder="At least 8 characters" required /></div>
          <div><label className="block text-sm text-wa-text-sec mb-1">Confirm Password</label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} className="w-full bg-wa-input text-wa-text rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-wa-teal transition" placeholder="Repeat password" required /></div>
          <button type="submit" disabled={isLoading} className="w-full bg-wa-teal hover:bg-wa-teal-dk text-white font-semibold py-3 rounded-lg transition disabled:opacity-50">
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
          <p className="text-center text-wa-text-sec text-sm">Already have an account? <Link to="/login" className="text-wa-teal hover:underline">Sign in</Link></p>
        </form>
      </div>
    </div>
  );
}
