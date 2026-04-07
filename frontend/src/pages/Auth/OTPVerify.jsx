import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from 'store/useAuthStore';
import toast from 'react-hot-toast';

export default function OTPVerify() {
  const [otp, setOtp] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOTP } = useAuthStore();
  const { userId, email } = location.state || {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) return toast.error('Invalid session. Please register again.');
    try {
      await verifyOTP(userId, otp);
      toast.success('Email verified! Welcome!');
      navigate('/');
    } catch (error) { toast.error(error.response?.data?.message || 'Verification failed'); }
  };

  return (
    <div className="min-h-screen bg-wa-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-wa-teal rounded-full flex items-center justify-center mx-auto mb-4"><span className="text-3xl">🔐</span></div>
          <h1 className="text-2xl font-bold text-wa-text">Verify Email</h1>
          <p className="text-wa-text-sec mt-1">Enter the OTP sent to {email || 'your email'}</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-wa-panel rounded-2xl p-6 space-y-4 shadow-xl">
          <input type="text" value={otp} onChange={e => setOtp(e.target.value)} maxLength={6}
            className="w-full bg-wa-input text-wa-text rounded-lg px-4 py-4 text-center text-2xl tracking-[0.5em] outline-none focus:ring-2 focus:ring-wa-teal" placeholder="000000" required />
          <button type="submit" className="w-full bg-wa-teal hover:bg-wa-teal-dk text-white font-semibold py-3 rounded-lg transition">Verify OTP</button>
          <p className="text-center text-wa-text-sec text-xs">Check your console if in development mode</p>
        </form>
      </div>
    </div>
  );
}
