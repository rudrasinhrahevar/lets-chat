import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/useAuthStore";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const { register, isLoading, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  async function handleFormSubmit(e) {
    e.preventDefault();

    try {
      setError("");
      
      if (!name || !email || !password || !confirmPassword) {
        setError("Please fill in all fields");
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      if (password.length < 8) {
        setError("Password must be at least 8 characters");
        return;
      }

      const result = await register(name, email, password);
      const userId = result?.userId;
      if (!userId) {
        throw new Error("Missing userId from register response");
      }
      toast.success(result?.message || "OTP sent to your email. Please verify.");
      navigate("/verify-otp", { state: { userId, email } });
    } catch (e) {
      const errorMsg = e.response?.data?.message || "Failed to register";
      setError(errorMsg);
      toast.error(errorMsg);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-surface-50 dark:bg-gray-950 relative">
      
      {/* Decorative Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-primary-400/20 dark:bg-primary-900/20 blur-3xl"></div>
        <div className="absolute top-[10%] -left-[10%] w-[30%] h-[30%] rounded-full bg-primary-200/20 dark:bg-primary-800/10 blur-3xl"></div>
      </div>

      <div className="max-w-md w-full space-y-6 glass-panel p-10 rounded-3xl relative z-10 shadow-xl shadow-gray-200/40 dark:shadow-none">
        
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30 mb-6">
            <span className="text-white font-bold text-2xl">LC</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Create an account
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Join Let's Chat today.
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleFormSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ml-1" htmlFor="name">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="input-field w-full"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ml-1" htmlFor="email-address">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="input-field w-full"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ml-1" htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="input-field w-full"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ml-1" htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="input-field w-full"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary"
            >
              {isLoading ? "Creating account..." : "Sign up"}
            </button>
          </div>
          
          <div className="text-center mt-6">
            <span className="text-sm text-gray-500 dark:text-gray-400">Already have an account? </span>
            <Link
              to="/login"
              className="text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-500 hover:underline transition-all"
            >
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
