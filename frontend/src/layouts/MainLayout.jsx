import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { 
  AppBar, 
  Box, 
  Toolbar, 
  Typography, 
  Button, 
  Container,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  useMediaQuery
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Home as HomeIcon,
  Science as ScienceIcon,
  Login as LoginIcon,
  PersonAdd as RegisterIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Footer from '../components/common/Footer';

const MainLayout = () => {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'));

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const menuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'Workshops', icon: <ScienceIcon />, path: '/workshops' },
  ];

  const authMenuItems = isAuthenticated
    ? [
        { 
          text: isAdmin ? 'Admin Dashboard' : 'Dashboard', 
          icon: <DashboardIcon />, 
          path: isAdmin ? '/admin' : '/dashboard' 
        },
        { text: 'Logout', icon: <LoginIcon />, action: logout }
      ]
    : [
        { text: 'Login', icon: <LoginIcon />, path: '/login' },
        { text: 'Register', icon: <RegisterIcon />, path: '/register' }
      ];

  const drawer = (
    <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
      <List>
        <ListItem>
          <Typography variant="h6" color="primary">
            Vijnana Dals
          </Typography>
        </ListItem>
        <Divider />
        {menuItems.map((item) => (
          <ListItem button key={item.text} component={RouterLink} to={item.path}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {authMenuItems.map((item) => (
          <ListItem 
            button 
            key={item.text} 
            component={item.path ? RouterLink : 'div'}
            to={item.path}
            onClick={item.action}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          {isMobile && (
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
              onClick={toggleDrawer(true)}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" component={RouterLink} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'white' }}>
            Vijnana Dals
          </Typography>
          
          {!isMobile && (
            <>
              <Button color="inherit" component={RouterLink} to="/" sx={{ mx: 1 }}>
                Home
              </Button>
              <Button color="inherit" component={RouterLink} to="/workshops" sx={{ mx: 1 }}>
                Workshops
              </Button>
              
              {isAuthenticated ? (
                <>
                  <Button 
                    color="inherit" 
                    component={RouterLink} 
                    to={isAdmin ? '/admin' : '/dashboard'}
                    sx={{ mx: 1 }}
                  >
                    {isAdmin ? 'Admin Dashboard' : 'Dashboard'}
                  </Button>
                  <Button color="inherit" onClick={logout} sx={{ mx: 1 }}>
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button color="inherit" component={RouterLink} to="/login" sx={{ mx: 1 }}>
                    Login
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="inherit" 
                    component={RouterLink} 
                    to="/register" 
                    sx={{ mx: 1 }}
                  >
                    Register
                  </Button>
                </>
              )}
            </>
          )}
        </Toolbar>
      </AppBar>
      
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        {drawer}
      </Drawer>
      
      <Container component="main" sx={{ py: 4, flexGrow: 1 }}>
        <Outlet />
      </Container>
      
      <Footer />
    </Box>
  );
};

export default MainLayout;