import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from 'services/api';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSendOTP = async (e) => {
    e.preventDefault();
    try { const { data } = await api.post('/auth/forgot-password', { email }); setUserId(data.userId); setStep(2); toast.success('Reset OTP sent!'); }
    catch (error) { toast.error(error.response?.data?.message || 'Failed'); }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    try { await api.post('/auth/reset-password', { userId, otp, newPassword }); toast.success('Password reset! Please login.'); setStep(3); }
    catch (error) { toast.error(error.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="min-h-screen bg-wa-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8"><h1 className="text-2xl font-bold text-wa-text">Reset Password</h1></div>
        <div className="bg-wa-panel rounded-2xl p-6 space-y-4 shadow-xl">
          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-wa-input text-wa-text rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-wa-teal" placeholder="Your email" required />
              <button type="submit" className="w-full bg-wa-teal hover:bg-wa-teal-dk text-white font-semibold py-3 rounded-lg transition">Send OTP</button>
            </form>
          )}
          {step === 2 && (
            <form onSubmit={handleReset} className="space-y-4">
              <input type="text" value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} className="w-full bg-wa-input text-wa-text rounded-lg px-4 py-3 text-center text-xl tracking-widest outline-none focus:ring-2 focus:ring-wa-teal" placeholder="OTP" required />
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-wa-input text-wa-text rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-wa-teal" placeholder="New password (8+ chars)" required />
              <button type="submit" className="w-full bg-wa-teal hover:bg-wa-teal-dk text-white font-semibold py-3 rounded-lg transition">Reset Password</button>
            </form>
          )}
          {step === 3 && (
            <div className="text-center py-4"><p className="text-wa-text mb-4">✅ Password reset successfully!</p>
              <Link to="/login" className="text-wa-teal hover:underline font-semibold">Go to Login</Link></div>
          )}
          <p className="text-center"><Link to="/login" className="text-wa-text-sec text-sm hover:text-wa-teal">Back to Login</Link></p>
        </div>
      </div>
    </div>
  );
}
