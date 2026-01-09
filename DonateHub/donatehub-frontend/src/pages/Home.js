import React, { useState, useEffect } from 'react';

import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  useMediaQuery,
  CircularProgress,
  Alert,
} from '@mui/material';
import { 
  Search, 
  Favorite, 
  LocalHospital, 
  AttachMoney, 
  Book, 
  Fastfood, 
  School, 
  Category, 
  AddCircle,
  ChevronLeft,
  ChevronRight,
  Circle,
  LocationOn
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useTheme } from '../context/ThemeContext';
import { donationAPI } from '../services/api'; // CORRECTED IMPORT

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { mode } = useTheme();
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('sm'));

  const heroImages = [
    '/images/hero1.jpg',
    '/images/hero2.jpg',
    '/images/hero3.jpg',
    '/images/hero4.jpg',
    '/images/hero5.jpg',
    '/images/hero6.jpg',
  ];

  const donationTypes = [
    { icon: <LocalHospital />, title: 'Blood Donation', desc: 'Save lives by donating blood', color: '#e53935', link: '/donate/blood' },
    { icon: <AttachMoney />, title: 'Cash Donation', desc: 'Monetary contributions', color: '#4caf50', link: '/donate/cash' },
    { icon: <Book />, title: 'Book Donation', desc: 'Share knowledge through books', color: '#2196f3', link: '/donate/books' },
    { icon: <Fastfood />, title: 'Food Donation', desc: 'Help fight hunger', color: '#ff9800', link: '/donate/food' },
    { icon: <School />, title: 'Knowledge Sharing', desc: 'Teach and mentor others', color: '#9c27b0', link: '/donate/knowledge' },
    { icon: <Category />, title: 'Physical Items', desc: 'Donate or sell items', color: '#795548', link: '/donate/items' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [heroImages.length]);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const response = await donationAPI.getAll({ limit: 12, page: 1 }); // Fetch up to 12 featured donations
      if (response.success) {
        setDonations(response.donations || []);
      } else {
        setError(response.message || 'Failed to load donations');
      }
    } catch (err) {
      setError('Failed to load donations from server');
      console.error('Error fetching donations:', err);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const getDonationPrice = (donation) => {
    if (donation.type === 'cash' && donation.cashDetails?.amount) {
      return `$${donation.cashDetails.amount}`;
    }
    return 'FREE';
  };

  const getCategoryLabel = (type) => {
    const labels = {
      blood: 'Blood Donation',
      cash: 'Cash Donation',
      food: 'Food Donation',
      books: 'Book Donation',
      knowledge: 'Knowledge Sharing',
      items: 'Physical Items'
    };
    return labels[type] || type;
  };

  return (
    <>
      <Header />
      <Box>
        {/* Hero Section */}
        <Box
          sx={{
            position: 'relative',
            height: isMobile ? '70vh' : '85vh',
            width: '100%',
            overflow: 'hidden',
            color: 'white',
            bgcolor: mode === 'dark' ? 'rgba(0,0,0,0.9)' : 'transparent',
          }}
        >
          {heroImages.map((image, index) => (
            <Box
              key={index}
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: `linear-gradient(rgba(0, 0, 0, ${mode === 'light' ? 0.6 : 0.8}), rgba(0, 0, 0, ${mode === 'light' ? 0.5 : 0.7})), url(${image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                opacity: index === currentSlide ? 1 : 0,
                transition: 'opacity 1s ease-in-out',
                zIndex: 1,
              }}
            />
          ))}
          
          <Container
            maxWidth="lg"
            sx={{
              position: 'relative',
              zIndex: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              px: { xs: 2, sm: 3, md: 4 },
            }}
          >
            <Box
              sx={{
                maxWidth: '800px',
                width: '100%',
                animation: 'fadeInUp 1s ease-out',
                '@keyframes fadeInUp': {
                  '0%': {
                    opacity: 0,
                    transform: 'translateY(20px)',
                  },
                  '100%': {
                    opacity: 1,
                    transform: 'translateY(0)',
                  },
                },
              }}
            >
              <Typography 
                variant={isMobile ? 'h3' : 'h2'} 
                gutterBottom 
                fontWeight="bold"
                sx={{
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                  mb: 2,
                }}
              >
                Share What You Can,<br />
                Help Those in Need
              </Typography>
              
              <Typography 
                variant={isMobile ? 'h6' : 'h5'} 
                paragraph
                sx={{
                  textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                  mb: 4,
                  opacity: 0.95,
                }}
              >
                Donate blood, money, food, books, knowledge, or items.<br />
                Make a difference in someone's life today.
              </Typography>
              
              <Box sx={{ 
                mt: 4, 
                display: 'flex', 
                gap: 2, 
                justifyContent: 'center',
                flexWrap: 'wrap' 
              }}>
                <Button
                  variant="contained"
                  size="large"
                  sx={{ 
                    bgcolor: '#e53935', 
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    '&:hover': { 
                      bgcolor: '#c62828',
                      transform: 'scale(1.05)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                  component={Link}
                  to="/listings"
                >
                  Start Donating
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{ 
                    borderColor: 'white', 
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    '&:hover': { 
                      borderColor: '#f5f5f5',
                      bgcolor: 'rgba(255,255,255,0.1)',
                      transform: 'scale(1.05)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                  component={Link}
                  to="/how-it-works"
                >
                  How It Works
                </Button>
              </Box>
            </Box>
          </Container>

          {/* Navigation */}
          <IconButton
            onClick={prevSlide}
            sx={{
              position: 'absolute',
              left: 20,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 3,
              color: 'white',
              bgcolor: 'rgba(0,0,0,0.3)',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.5)',
              },
              display: { xs: 'none', md: 'flex' },
            }}
          >
            <ChevronLeft fontSize="large" />
          </IconButton>
          
          <IconButton
            onClick={nextSlide}
            sx={{
              position: 'absolute',
              right: 20,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 3,
              color: 'white',
              bgcolor: 'rgba(0,0,0,0.3)',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.5)',
              },
              display: { xs: 'none', md: 'flex' },
            }}
          >
            <ChevronRight fontSize="large" />
          </IconButton>

          {/* Dots */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 30,
              left: 0,
              right: 0,
              zIndex: 3,
              display: 'flex',
              justifyContent: 'center',
              gap: 1,
            }}
          >
            {heroImages.map((_, index) => (
              <IconButton
                key={index}
                onClick={() => goToSlide(index)}
                size="small"
                sx={{
                  color: index === currentSlide ? '#e53935' : 'white',
                  p: 0.5,
                  '&:hover': {
                    color: '#e53935',
                  },
                }}
              >
                <Circle
                  sx={{
                    fontSize: index === currentSlide ? 12 : 8,
                    transition: 'all 0.3s ease',
                  }}
                />
              </IconButton>
            ))}
          </Box>

          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '100px',
              background: 'linear-gradient(transparent, rgba(0,0,0,0.3))',
              zIndex: 2,
            }}
          />
        </Box>

        {/* Search Bar */}
        <Container sx={{ mt: -6, mb: 6, position: 'relative', zIndex: 10 }}>
          <Paper 
            elevation={4} 
            sx={{ 
              p: 2, 
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            }}
          >
            <TextField
              fullWidth
              placeholder="Search for donations, items, or services..."
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Button 
                      variant="contained" 
                      color="primary"
                      sx={{ borderRadius: 2 }}
                    >
                      Search
                    </Button>
                  </InputAdornment>
                ),
                sx: { borderRadius: 2 }
              }}
            />
          </Paper>
        </Container>

        {/* Donation Categories */}
        <Container sx={{ mb: 8 }}>
          <Typography variant="h4" align="center" gutterBottom fontWeight="bold">
            Ways to Donate
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" paragraph>
            Choose from various donation categories
          </Typography>
          
          <Grid container spacing={3} justifyContent="center">
            {donationTypes.map((type, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  component={Link}
                  to={type.link}
                  sx={{
                    height: '280px',
                    display: 'flex',
                    flexDirection: 'column',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: '0 12px 24px rgba(0, 0, 0, 0.12)',
                    },
                  }}
                >
                  <CardContent sx={{ 
                    flexGrow: 1, 
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    boxSizing: 'border-box',
                  }}>
                    <Box
                      sx={{
                        width: '70px',
                        height: '70px',
                        borderRadius: '50%',
                        bgcolor: type.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '20px',
                        color: 'white',
                        minWidth: '70px',
                        minHeight: '70px',
                        maxWidth: '70px',
                        maxHeight: '70px',
                        overflow: 'hidden',
                      }}
                    >
                      {React.cloneElement(type.icon, { 
                        sx: { 
                          fontSize: 32,
                          width: '32px',
                          height: '32px'
                        } 
                      })}
                    </Box>
                    
                    <Typography 
                      variant="h5" 
                      gutterBottom 
                      fontWeight="bold" 
                      sx={{ 
                        textAlign: 'center',
                        fontSize: '1.25rem',
                        lineHeight: 1.3,
                        height: '2.6em',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 1,
                      }}
                    >
                      {type.title}
                    </Typography>
                    
                    <Typography 
                      color="text.secondary" 
                      sx={{ 
                        textAlign: 'center',
                        fontSize: '0.95rem',
                        lineHeight: 1.4,
                        height: '2.8em',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 3,
                      }}
                    >
                      {type.desc}
                    </Typography>
                    
                    <Button
                      variant="contained"
                      sx={{
                        bgcolor: type.color,
                        color: 'white',
                        borderRadius: '6px',
                        padding: '8px 24px',
                        fontWeight: 'bold',
                        minWidth: '140px',
                        '&:hover': {
                          bgcolor: type.color,
                          opacity: 0.9,
                        }
                      }}
                    >
                      Donate Now
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>

        {/* Featured Listings */}
        <Container sx={{ mb: 8 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" fontWeight="bold">
              Featured Listings
            </Typography>
            <Button component={Link} to="/listings" variant="outlined">
              View All
            </Button>
          </Box>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
          ) : donations.length === 0 ? (
            <Typography textAlign="center" color="text.secondary" py={4}>
              No donations available. Be the first to donate!
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {donations.slice(0, 4).map((donation) => (
                <Grid item xs={12} sm={6} md={3} key={donation._id}>
                  <Card sx={{ height: '100%', borderRadius: '12px' }}>
                    <CardMedia
                      component="img"
                      height="140"
                      image={donation.images?.[0]?.url || `https://source.unsplash.com/random/400x300?${donation.type}`}
                      alt={donation.title}
                      sx={{ borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}
                    />
                    <CardContent>
                      <Typography variant="h6" gutterBottom noWrap>
                        {donation.title}
                      </Typography>
                      <Typography color="text.secondary" gutterBottom>
                        {getCategoryLabel(donation.type)} • {donation.location}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                        <LocationOn fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {donation.location}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" color="primary">
                          {getDonationPrice(donation)}
                        </Typography>
                        <IconButton size="small">
                          <Favorite />
                        </IconButton>
                      </Box>
                      <Button
                        fullWidth
                        variant="outlined"
                        sx={{ mt: 2, borderRadius: '6px' }}
                        component={Link}
                        to={`/item/${donation._id}`}
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>

        {/* Call to Action */}
        <Box sx={{ 
          bgcolor: mode === 'light' ? '#e53935' : '#c62828',
          color: 'white', 
          py: 6, 
          textAlign: 'center',
          transition: 'background-color 0.3s ease',
        }}>
          <Container maxWidth="md">
            <Typography variant="h3" gutterBottom fontWeight="bold">
              Ready to Make a Difference?
            </Typography>
            <Typography variant="h6" paragraph>
              Join thousands of people who are changing lives through donations
            </Typography>
            <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<AddCircle />}
                sx={{ 
                  bgcolor: 'white', 
                  color: mode === 'light' ? '#e53935' : '#c62828',
                  borderRadius: '6px',
                  '&:hover': { bgcolor: '#f5f5f5' } 
                }}
                component={Link}
                to="/signup"
              >
                Join Now
              </Button>
              <Button
                variant="outlined"
                size="large"
                sx={{ 
                  borderColor: 'white', 
                  color: 'white', 
                  borderRadius: '6px',
                  '&:hover': { borderColor: '#f5f5f5' } 
                }}
                component={Link}
                to="/listings"
              >
                Browse Items
              </Button>
            </Box>
          </Container>
        </Box>

        {/* Stats Section */}
        <Box sx={{ 
          bgcolor: mode === 'light' ? '#f5f5f5' : '#1a1a1a',
          py: 8,
          transition: 'background-color 0.3s ease',
        }}>
          <Container>
            <Grid container spacing={4} justifyContent="center">
              <Grid item xs={6} sm={3} textAlign="center">
                <Typography variant="h3" color="primary" fontWeight="bold">
                  10,000+
                </Typography>
                <Typography variant="h6">Donations Made</Typography>
              </Grid>
              <Grid item xs={6} sm={3} textAlign="center">
                <Typography variant="h3" color="primary" fontWeight="bold">
                  5,000+
                </Typography>
                <Typography variant="h6">Happy Recipients</Typography>
              </Grid>
              <Grid item xs={6} sm={3} textAlign="center">
                <Typography variant="h3" color="primary" fontWeight="bold">
                  100+
                </Typography>
                <Typography variant="h6">Cities Covered</Typography>
              </Grid>
              <Grid item xs={6} sm={3} textAlign="center">
                <Typography variant="h3" color="primary" fontWeight="bold">
                  24/7
                </Typography>
                <Typography variant="h6">Support Available</Typography>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Box>
      <Footer />
    </>
  );
};

export default Home;