import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Grid,
  Avatar,
  IconButton,
  Alert,
  CircularProgress,
  Chip,
  Rating,
  Divider,
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  LocationOn,
  Person,
  Phone,
  Email,
  ArrowBack,
  Share,
  Edit,
  Delete,
} from '@mui/icons-material';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { donationAPI } from '../services/api'; // CORRECTED IMPORT

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { mode } = useTheme();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState(null);
  const [error, setError] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        setLoading(true);
        const response = await donationAPI.getDonation(id); // CORRECTED
        if (response.success) {
          setItem(response.donation);
        } else {
          setError(response.message || 'Item not found');
        }
      } catch (err) {
        // Provide clearer feedback for auth/permission issues
        console.error('Item fetch error:', err);
        const status = err.status || err?.data?.status || null;
        if (status === 401) {
          setError('You must be logged in to view this donation. Please login.');
        } else if (status === 403) {
          setError('Access denied. This donation is not public. If this is your listing, view it from My Donations.');
        } else {
          setError('Failed to fetch item details. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchItemDetails();
    }
  }, [id]);

  const handleFavorite = async () => {
    try {
      const response = await donationAPI.toggleFavorite(id); // CORRECTED
      if (response.success) {
        setIsFavorite(!isFavorite);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleEditDonation = () => {
    navigate(`/edit-donation/${id}`);
  };

  const handleDeleteDonation = async () => {
    if (window.confirm('Are you sure you want to delete this donation? This action cannot be undone.')) {
      try {
        const response = await donationAPI.deleteDonation(id);
        if (response.success) {
          alert('Donation deleted successfully!');
          navigate('/my-donations');
        } else {
          alert(response.message || 'Failed to delete donation');
        }
      } catch (error) {
        alert('Error deleting donation');
        console.error(error);
      }
    }
  };
  const handleRequest = async () => {
    try {
      const response = await donationAPI.requestDonation(id, {}); // CORRECTED
      if (response.success) {
        alert('Request sent successfully!');
      }
    } catch (error) {
      alert('Failed to send request');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !item) {
    return (
      <>
        <Header />
        <Container sx={{ py: 4, textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error || 'Item not found'}
          </Alert>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<ArrowBack />}
              onClick={() => navigate('/listings')}
            >
              Back to Listings
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/my-donations')}
            >
              View My Donations
            </Button>
            <Button
              variant="text"
              onClick={() => setShowDiagnostics(s => !s)}
            >
              {showDiagnostics ? 'Hide Auth Info' : 'Show Auth Info'}
            </Button>
          </Box>

          {showDiagnostics && (
            <Box sx={{ textAlign: 'left', maxWidth: 800, mx: 'auto', mt: 2 }}>
              <Typography variant="subtitle2">Auth diagnostic</Typography>
              <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                <strong>Token:</strong> {localStorage.getItem('token') || '—'}
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>
                <strong>User:</strong> {JSON.stringify(user || JSON.parse(localStorage.getItem('user') || 'null'), null, 2) || '—'}
              </Typography>
            </Box>
          )}
        </Container>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/listings')}
          sx={{ mb: 3 }}
        >
          Back to Listings
        </Button>

        <Grid container spacing={4}>
          {/* Left Column - Images */}
          <Grid item xs={12} md={7}>
            <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
              <Box sx={{ position: 'relative' }}>
                <Box
                  component="img"
                  src={item.images?.[0]?.url || 'https://source.unsplash.com/random/800x600?donation'}
                  alt={item.title}
                  sx={{
                    width: '100%',
                    height: '400px',
                    objectFit: 'cover',
                    borderRadius: 1,
                  }}
                />
                <IconButton
                  sx={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    bgcolor: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'rgba(0,0,0,0.7)',
                    },
                  }}
                  onClick={handleFavorite}
                >
                  {isFavorite ? <Favorite color="error" /> : <FavoriteBorder />}
                </IconButton>
              </Box>
              
              {/* Thumbnail images if available */}
              {item.images && item.images.length > 1 && (
                <Grid container spacing={1} sx={{ mt: 2 }}>
                  {item.images.slice(0, 4).map((image, index) => (
                    <Grid item xs={3} key={index}>
                      <Box
                        component="img"
                        src={image.url}
                        alt={`${item.title} ${index + 1}`}
                        sx={{
                          width: '100%',
                          height: '80px',
                          objectFit: 'cover',
                          borderRadius: 1,
                          cursor: 'pointer',
                          '&:hover': {
                            opacity: 0.8,
                          },
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}
            </Paper>
          </Grid>

          {/* Right Column - Details */}
          <Grid item xs={12} md={5}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" fontWeight="bold">
                  {item.title}
                </Typography>
                <Chip 
                  label={item.type} 
                  color="primary" 
                  sx={{ textTransform: 'capitalize' }}
                />
              </Box>

              <Typography color="text.secondary" paragraph>
                {item.description}
              </Typography>

              <Divider sx={{ my: 2 }} />

              {/* Details */}
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Quantity
                  </Typography>
                  <Typography variant="h6">
                    {item.quantity}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Location
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LocationOn fontSize="small" />
                    <Typography>{item.location}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip 
                    label={item.status} 
                    color={
                      item.status === 'approved' ? 'success' :
                      item.status === 'pending' ? 'warning' :
                      item.status === 'rejected' ? 'error' : 'default'
                    }
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Views
                  </Typography>
                  <Typography>{item.views || 0}</Typography>
                </Grid>
              </Grid>

              {/* Donor Info */}
              {item.donor && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Typography variant="h6" gutterBottom>
                    Donor Information
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ bgcolor: '#e53935' }}>
                      <Person />
                    </Avatar>
                    <Box>
                      <Typography fontWeight="bold">
                        {item.donor.firstName} {item.donor.lastName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.donor.email}
                      </Typography>
                      {item.donor.rating && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Rating value={item.donor.rating} readOnly size="small" />
                          <Typography variant="body2">
                            {item.donor.rating.toFixed(1)}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </>
              )}

              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Tags
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {item.tags.map((tag, index) => (
                      <Chip key={index} label={tag} size="small" />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Action Buttons */}
              <Box sx={{ mt: 4 }}>
                {/* Owner Controls */}
                {user && item.donor && user._id === item.donor._id ? (
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        startIcon={<Edit />}
                        onClick={handleEditDonation}
                        sx={{ py: 1.5 }}
                      >
                        Edit Donation
                      </Button>
                      <Button
                        fullWidth
                        variant="outlined"
                        color="error"
                        startIcon={<Delete />}
                        onClick={handleDeleteDonation}
                        sx={{ py: 1.5 }}
                      >
                        Delete
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box>
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      onClick={handleRequest}
                      disabled={item.status !== 'approved'}
                      sx={{ mb: 2, py: 1.5 }}
                    >
                      Request This Item
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="large"
                      startIcon={<Share />}
                      sx={{ py: 1.5 }}
                    >
                      Share
                    </Button>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
      <Footer />
    </>
  );
};

export default ItemDetail;