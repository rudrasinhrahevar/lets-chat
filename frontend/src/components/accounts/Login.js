import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { currentUser, login, setError } = useAuth();

  useEffect(() => {
    if (currentUser) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  async function handleFormSubmit(e) {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);
      await login(email, password);
      navigate("/");
    } catch (e) {
      setError("Failed to login");
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-surface-50 dark:bg-gray-950">
      
      {/* Decorative Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary-400/20 dark:bg-primary-900/20 blur-3xl"></div>
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] rounded-full bg-primary-200/20 dark:bg-primary-800/10 blur-3xl"></div>
      </div>

      <div className="max-w-md w-full space-y-8 glass-panel p-10 rounded-3xl relative z-10 shadow-xl shadow-gray-200/40 dark:shadow-none">
        
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30 mb-6">
            <span className="text-white font-bold text-2xl">LC</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Please enter your details to sign in.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleFormSubmit}>
          <div className="space-y-4">
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
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ml-1" htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="input-field w-full"
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary"
            >
              Sign in
            </button>
          </div>
          
          <div className="text-center mt-6">
            <span className="text-sm text-gray-500 dark:text-gray-400">Don't have an account? </span>
            <Link
              to="/register"
              className="text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-500 hover:underline transition-all"
            >
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
