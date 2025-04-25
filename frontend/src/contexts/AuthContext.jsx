import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from './SnackbarContext';

const AuthContext = createContext({
  user: null,
  login: () => {},
  logout: () => {},
  register: () => {},
  isAuthenticated: false,
  isAdmin: false,
  isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { showMessage } = useSnackbar();

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    const loadUser = async () => {
      if (token) {
        try {
          const response = await axios.get('/api/auth/me', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          setUser(response.data);
        } catch (error) {
          console.error('Error loading user:', error);
          localStorage.removeItem('token');
        }
      }
      
      setIsLoading(false);
    };
    
    loadUser();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await axios.post('/api/auth/login', credentials);
      const { access_token } = response.data;
      
      localStorage.setItem('token', access_token);
      
      // Get user data
      const userResponse = await axios.get('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      });
      
      setUser(userResponse.data);
      
      showMessage('Login successful!', 'success');
      
      // Redirect based on user role
      if (userResponse.data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      
      let message = 'Login failed. Please check your credentials.';
      if (error.response && error.response.data && error.response.data.detail) {
        message = error.response.data.detail;
      }
      
      showMessage(message, 'error');
      return false;
    }
  };

  const register = async (userData) => {
    try {
      await axios.post('/api/auth/register', userData);
      showMessage('Registration successful! Please log in.', 'success');
      navigate('/login');
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      
      let message = 'Registration failed. Please try again.';
      if (error.response && error.response.data && error.response.data.detail) {
        message = error.response.data.detail;
      }
      
      showMessage(message, 'error');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
    showMessage('You have been logged out', 'success');
  };

  const value = {
    user,
    login,
    logout,
    register,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};