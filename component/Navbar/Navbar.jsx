import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import Auth from '../Auth/Auth';
import { useAuth } from '../../context/AuthContext';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  Container,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { 
  Logout, 
  Home as HomeIcon, 
  LocalFlorist, 
  Healing, 
  MedicalServices, 
  ShoppingCart, 
  Person,
  Menu as MenuIcon
} from '@mui/icons-material';

const Navbar = () => {
  const [showAuth, setShowAuth] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleLoginClick = () => {
    setShowAuth(true);
  };

  const handleCloseAuth = () => {
    setShowAuth(false);
  };

  const handleLoginSuccess = () => {
    setShowAuth(false);
    navigate('/form');
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const handleMenuClick = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const navItems = [
    { label: 'Home', icon: <HomeIcon />, path: '/' },
    { label: 'Plants', icon: <LocalFlorist />, path: '/plants' },
    { label: 'Diseases', icon: <Healing />, path: '/diseases' },
    { label: 'Symptom Checker', icon: <MedicalServices />, path: '/symptoms' },
    { label: 'Shop', icon: <ShoppingCart />, path: '/shop' },
  ];

  const renderMobileMenu = (
    <Drawer
      anchor="right"
      open={mobileMenuOpen}
      onClose={() => setMobileMenuOpen(false)}
    >
      <Box sx={{ width: 250 }}>
        <List>
          {navItems.map((item) => (
            <ListItem 
              button 
              key={item.label} 
              onClick={() => handleMenuClick(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItem>
          ))}
          
          {currentUser ? (
            <>
              <ListItem button onClick={() => handleMenuClick('/profile')}>
                <ListItemIcon><Person /></ListItemIcon>
                <ListItemText primary="Profile" />
              </ListItem>
              <ListItem button onClick={handleLogout}>
                <ListItemIcon><Logout /></ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItem>
            </>
          ) : (
            <>
              <ListItem button onClick={() => handleMenuClick('/login')}>
                <ListItemText primary="Login" />
              </ListItem>
              <ListItem button onClick={() => handleMenuClick('/register')}>
                <ListItemText primary="Register" />
              </ListItem>
            </>
          )}
        </List>
      </Box>
    </Drawer>
  );

  return (
    <>
      <AppBar position="fixed" sx={{ bgcolor: '#2e7d32', zIndex: 1200 }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* Logo */}
            <Typography 
              variant="h5" 
              component={Link} 
              to="/"
              sx={{ 
                flexGrow: { xs: 1, md: 0 },
                fontWeight: 700, 
                letterSpacing: '0.1rem',
                color: 'white',
                textDecoration: 'none',
                mr: { md: 5 }
              }}
            >
              VedGarden
            </Typography>

            {/* Desktop Navigation */}
            {!isMobile && (
              <Box sx={{ display: 'flex', flexGrow: 1 }}>
                {navItems.map((item) => (
                  <Button 
                    key={item.label}
                    color="inherit" 
                    component={Link} 
                    to={item.path}
                    startIcon={item.icon}
                    sx={{ mx: 0.5 }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>
            )}

            {/* Auth Buttons or User Menu */}
            {!isMobile && (
              <Box sx={{ display: 'flex' }}>
                {currentUser ? (
                  <>
                    <Button 
                      color="inherit" 
                      component={Link} 
                      to="/profile"
                      startIcon={<Person />}
                      sx={{ ml: 1 }}
                    >
                      Profile
                    </Button>
                    <Button 
                      color="inherit" 
                      onClick={handleLogout}
                      startIcon={<Logout />}
                      sx={{ ml: 1 }}
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      color="inherit" 
                      component={Link} 
                      to="/login"
                      sx={{ ml: 1 }}
                    >
                      Login
                    </Button>
                    <Button 
                      color="inherit" 
                      component={Link} 
                      to="/register"
                      sx={{ ml: 1 }}
                    >
                      Register
                    </Button>
                  </>
                )}
              </Box>
            )}

            {/* Mobile Menu Button */}
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open menu"
                edge="end"
                onClick={() => setMobileMenuOpen(true)}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Menu */}
      {renderMobileMenu}

      {/* Add a toolbar spacer for fixed position navbar */}
      <Toolbar />

      {/* Auth Modal */}
      {showAuth && (
        <div className="auth-modal">
          <div className="auth-modal-content">
            <button className="close-button" onClick={handleCloseAuth}>×</button>
            <Auth onClose={handleCloseAuth} onLoginSuccess={handleLoginSuccess} />
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;