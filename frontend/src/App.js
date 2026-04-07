import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { SocketProvider } from 'contexts/SocketContext';
import { ThemeProvider } from 'contexts/ThemeContext';
import { useAuthStore } from 'store/useAuthStore';
import ProtectedRoute from 'routes/ProtectedRoute';
import AdminRoute from 'routes/AdminRoute';

// ─── Lazy-loaded pages (code split per route) ───
const Login = lazy(() => import('pages/Auth/Login'));
const Register = lazy(() => import('pages/Auth/Register'));
const OTPVerify = lazy(() => import('pages/Auth/OTPVerify'));
const ForgotPassword = lazy(() => import('pages/Auth/ForgotPassword'));
const AppLayout = lazy(() => import('pages/App/AppLayout'));
const AdminPanel = lazy(() => import('pages/Admin/AdminPanel'));

// ─── Loading fallback (skeleton) ───
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-screen bg-wa-bg">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-3 border-wa-teal border-t-transparent rounded-full animate-spin" />
        <p className="text-wa-text-sec text-sm animate-pulse">Loading...</p>
      </div>
    </div>
  );
}

function App() {
  const { isAuthenticated } = useAuthStore();
  return (
    <ThemeProvider>
      <BrowserRouter>
        <SocketProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
              <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />
              <Route path="/verify-otp" element={<OTPVerify />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>} />
              <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Suspense>
        </SocketProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
