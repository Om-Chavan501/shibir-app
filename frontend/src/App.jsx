import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Public pages
import Home from './pages/Home';
import WorkshopList from './pages/WorkshopList';
import WorkshopDetail from './pages/WorkshopDetail';
import Register from './pages/Register';
import Login from './pages/Login';
import Registration from './pages/Registration';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// User pages
import UserDashboard from './pages/user/Dashboard';
import UserProfile from './pages/user/Profile';
import UserRegistrations from './pages/user/Registrations';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminWorkshops from './pages/admin/Workshops';
import AdminWorkshopForm from './pages/admin/WorkshopForm';
import AdminRegistrations from './pages/admin/Registrations';
import AdminUsers from './pages/admin/Users';

// Layout components
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Guards
import PrivateRoute from './components/auth/PrivateRoute';
import AdminRoute from './components/auth/AdminRoute';

function App() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="workshops" element={<WorkshopList />} />
        <Route path="workshops/:id" element={<WorkshopDetail />} />
        <Route path="register" element={<Register />} />
        <Route path="login" element={<Login />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />
        <Route path="registration/:workshopId" element={<Registration />} />
      </Route>
      
      {/* User dashboard routes */}
      <Route 
        path="/dashboard" 
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<UserDashboard />} />
        <Route path="profile" element={<UserProfile />} />
        <Route path="registrations" element={<UserRegistrations />} />
      </Route>
      
      {/* Admin routes */}
      <Route 
        path="/admin" 
        element={
          <AdminRoute>
            <DashboardLayout isAdmin={true} />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="workshops" element={<AdminWorkshops />} />
        <Route path="workshops/new" element={<AdminWorkshopForm />} />
        <Route path="workshops/edit/:id" element={<AdminWorkshopForm />} />
        <Route path="registrations" element={<AdminRegistrations />} />
        <Route path="users" element={<AdminUsers />} />
      </Route>
      
      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;