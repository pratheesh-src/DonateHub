import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Avatar,
  Container,
  Badge,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Brightness4,
  Brightness7,
} from '@mui/icons-material';
import { useTheme } from '../context/ThemeContext'; // Add this import

const Header = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('token');
  const { mode, toggleTheme } = useTheme(); // Get theme context

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const donationCategories = [
    { name: 'Blood', path: '/donate/blood' },
    { name: 'Cash', path: '/donate/cash' },
    { name: 'Books', path: '/donate/books' },
    { name: 'Food', path: '/donate/food' },
    { name: 'Knowledge', path: '/donate/knowledge' },
    { name: 'Items', path: '/donate/items' },
  ];

  return (
    <AppBar position="sticky">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2, display: { xs: 'block', md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              mr: 2,
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            ❤️ DonateHub
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {donationCategories.map((category) => (
              <Button
                key={category.name}
                component={Link}
                to={category.path}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                {category.name}
              </Button>
            ))}
            <Button
              component={Link}
              to="/listings"
              sx={{ my: 2, color: 'white', display: 'block' }}
            >
              Browse Items
            </Button>
            <Button
              component={Link}
              to="/sell"
              sx={{ my: 2, color: 'white', display: 'block' }}
            >
              Sell Item
            </Button>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Theme Toggle Button */}
            <IconButton 
              onClick={toggleTheme} 
              color="inherit"
              sx={{ ml: 1 }}
              aria-label="toggle theme"
            >
              {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
            </IconButton>

            <IconButton color="inherit">
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            {isLoggedIn ? (
              <>
                <IconButton onClick={handleMenu} color="inherit">
                  <Avatar sx={{ width: 32, height: 32, bgcolor: '#ffffff', color: mode === 'light' ? '#e53935' : '#1a1a1a' }}>
                    <PersonIcon />
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  <MenuItem component={Link} to="/dashboard">Dashboard</MenuItem>
                  <MenuItem component={Link} to="/profile">Profile</MenuItem>
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button
                  color="inherit"
                  component={Link}
                  to="/login"
                  sx={{ border: '1px solid white' }}
                >
                  Login
                </Button>
                <Button
                  variant="contained"
                  sx={{ 
                    bgcolor: 'white', 
                    color: mode === 'light' ? '#e53935' : '#1a1a1a',
                    '&:hover': { bgcolor: '#f5f5f5' } 
                  }}
                  component={Link}
                  to="/signup"
                >
                  Sign Up
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;