import { Route, Routes, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Home from './Pages/Home';
import Result from './Pages/result';
import ScanMethods from './Pages/scanmethods';
import UserLogin from './Pages/userlogin';
import UserSignup from './Pages/usersignup';
import DoctorLogin from './Pages/doclogin';
import DoctorSignup from './Pages/docsignup';
import ResetPassword from './Pages/Resetpassword';
import ForgotPassword from './Pages/forget';
import Doctors from './Pages/doctors';
import Chatbot from './Pages/chatbot';
import UserDashboard from './Pages/userdash';
import AdminDashboard from './Pages/admindash';
import DoctorDashboard from './Pages/dctrdash';
import AuthHandler from './Pages/AuthHandler';

const roleHome = {
  admin: '/admindash',
  doctor: '/dctrdash',
  user: '/userdash',
};

const ProtectedRoute = ({ children, allowedRoles, loginPath = '/userlogin' }) => {
  const { isAuthenticated, role, user } = useSelector((state) => state.auth);
  const hasSession = Boolean(isAuthenticated && user && localStorage.getItem('token'));

  if (!hasSession) {
    return <Navigate to={loginPath} replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to={roleHome[role] || '/'} replace />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/userlogin" element={<UserLogin />} />
      <Route path="/usersignup" element={<UserSignup />} />
      <Route path="/doclogin" element={<DoctorLogin />} />
      <Route path="/docsignup" element={<DoctorSignup />} />
      <Route path="/forget" element={<ForgotPassword />} />
      <Route path="/reset" element={<ResetPassword />} />
      <Route path="/auth" element={<AuthHandler />} />

      <Route
        path="/userdash"
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <UserDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/chatbot"
        element={
          <ProtectedRoute allowedRoles={['user', 'admin']}>
            <Chatbot />
          </ProtectedRoute>
        }
      />
      <Route
        path="/result"
        element={
          <ProtectedRoute allowedRoles={['user', 'admin']}>
            <Result />
          </ProtectedRoute>
        }
      />
      <Route
        path="/scan"
        element={
          <ProtectedRoute allowedRoles={['user', 'admin']}>
            <ScanMethods />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctors"
        element={
          <ProtectedRoute allowedRoles={['user', 'doctor', 'admin']}>
            <Doctors />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dctrdash"
        element={
          <ProtectedRoute allowedRoles={['doctor']} loginPath="/doclogin">
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admindash"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
