import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SocketProvider } from 'contexts/SocketContext';
import { ThemeProvider } from 'contexts/ThemeContext';
import { useAuthStore } from 'store/useAuthStore';
import ProtectedRoute from 'routes/ProtectedRoute';
import AdminRoute from 'routes/AdminRoute';
import Login from 'pages/Auth/Login';
import Register from 'pages/Auth/Register';
import OTPVerify from 'pages/Auth/OTPVerify';
import ForgotPassword from 'pages/Auth/ForgotPassword';
import AppLayout from 'pages/App/AppLayout';
import AdminPanel from 'pages/Admin/AdminPanel';

function App() {
  const { isAuthenticated } = useAuthStore();
  return (
    <ThemeProvider>
      <BrowserRouter>
        <SocketProvider>
          <Routes>
            <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
            <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />
            <Route path="/verify-otp" element={<OTPVerify />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </SocketProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
