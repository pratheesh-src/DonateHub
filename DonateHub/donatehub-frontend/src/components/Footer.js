import React from 'react';
import { Box, Container, Grid, Typography, Link as MuiLink, IconButton } from '@mui/material';
import { Facebook, Twitter, Instagram, LinkedIn } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext'; // Add this import

const Footer = () => {
  const { mode } = useTheme(); // Get theme mode

  return (
    <Box
      sx={{
        bgcolor: mode === 'light' ? '#2c3e50' : '#1a1a1a',
        color: 'white',
        py: 6,
        mt: 'auto',
        transition: 'background-color 0.3s ease',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              ❤️ DonateHub
            </Typography>
            <Typography variant="body2">
              Making donations and helping others easier than ever.
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Quick Links
            </Typography>
            <Box>
              <Typography component={Link} to="/about" color="inherit" display="block" sx={{ textDecoration: 'none', mb: 1 }}>
                About Us
              </Typography>
              <Typography component={Link} to="/contact" color="inherit" display="block" sx={{ textDecoration: 'none', mb: 1 }}>
                Contact
              </Typography>
              <Typography component={Link} to="/faq" color="inherit" display="block" sx={{ textDecoration: 'none', mb: 1 }}>
                FAQ
              </Typography>
              <Typography component={Link} to="/privacy" color="inherit" display="block" sx={{ textDecoration: 'none' }}>
                Privacy Policy
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Categories
            </Typography>
            <Box>
              <Typography component={Link} to="/donate/blood" color="inherit" display="block" sx={{ textDecoration: 'none', mb: 1 }}>
                Blood Donation
              </Typography>
              <Typography component={Link} to="/donate/food" color="inherit" display="block" sx={{ textDecoration: 'none', mb: 1 }}>
                Food Donation
              </Typography>
              <Typography component={Link} to="/donate/books" color="inherit" display="block" sx={{ textDecoration: 'none', mb: 1 }}>
                Book Donation
              </Typography>
              <Typography component={Link} to="/donate/knowledge" color="inherit" display="block" sx={{ textDecoration: 'none' }}>
                Knowledge Sharing
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Connect With Us
            </Typography>
            <Box>
              <IconButton sx={{ color: 'white' }}>
                <Facebook />
              </IconButton>
              <IconButton sx={{ color: 'white' }}>
                <Twitter />
              </IconButton>
              <IconButton sx={{ color: 'white' }}>
                <Instagram />
              </IconButton>
              <IconButton sx={{ color: 'white' }}>
                <LinkedIn />
              </IconButton>
            </Box>
            <Typography variant="body2" sx={{ mt: 2 }}>
              Email: contact@donatehub.com
            </Typography>
            <Typography variant="body2">
              Phone: +1 (555) 123-4567
            </Typography>
          </Grid>
        </Grid>
        <Box sx={{ borderTop: `1px solid ${mode === 'light' ? '#34495e' : '#333'}`, mt: 4, pt: 3, textAlign: 'center' }}>
          <Typography variant="body2">
            © {new Date().getFullYear()} DonateHub. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;