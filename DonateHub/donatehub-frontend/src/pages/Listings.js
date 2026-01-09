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
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Chip,
  IconButton,
  CircularProgress,
  Paper,
} from '@mui/material';
import {
  Search,
  FilterList,
  Favorite,
  FavoriteBorder,
  LocationOn,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useTheme } from '../context/ThemeContext';
import { donationAPI } from '../services/api'; // CORRECTED IMPORT

const Listings = () => {
  const { mode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [donations, setDonations] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    location: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 12,
    // no default status filter here - backend decides visibility based on auth
  });

  // Fetch donations when filters change
  useEffect(() => {
    const fetchDonations = async () => {
      try {
        setLoading(true);
        const response = await donationAPI.getAllDonations(filters); // CORRECTED
        if (response.success) {
          setDonations(response.donations || []);
          setTotalPages(response.pagination?.pages || 1);
        }
      } catch (error) {
        console.error('Error fetching donations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, [filters]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      handleFilterChange('search', e.target.value);
    }
  };

  const handlePageChange = (event, value) => {
    handleFilterChange('page', value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFavorite = async (id) => {
    try {
      await donationAPI.toggleFavorite(id); // CORRECTED
      // Update local state if needed
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const donationTypeColors = {
    blood: '#e53935',
    cash: '#4caf50',
    books: '#2196f3',
    food: '#ff9800',
    knowledge: '#9c27b0',
    items: '#795548',
  };

  return (
    <>
      <Header />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Browse Donations
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Discover items donated by our community
        </Typography>

        {/* Filters */}
        <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search donations..."
                variant="outlined"
                onKeyPress={handleSearch}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  label="Type"
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="blood">Blood</MenuItem>
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="books">Books</MenuItem>
                  <MenuItem value="food">Food</MenuItem>
                  <MenuItem value="knowledge">Knowledge</MenuItem>
                  <MenuItem value="items">Items</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Location"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                placeholder="City, State"
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  label="Sort By"
                >
                  <MenuItem value="createdAt">Newest</MenuItem>
                  <MenuItem value="views">Most Viewed</MenuItem>
                  <MenuItem value="quantity">Quantity</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<FilterList />}
                onClick={() => {/* Apply filters */}}
                sx={{ height: '56px' }}
              >
                Filter
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Loading State */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Results Count */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                Showing {donations.length} donations
              </Typography>
              <Chip 
                label={`Page ${filters.page} of ${totalPages}`} 
                color="primary" 
                variant="outlined"
              />
            </Box>

            {/* Donations Grid */}
            {donations.length > 0 ? (
              <Grid container spacing={3}>
                {donations.map((donation) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={donation._id}>
                    <Card sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 6,
                      },
                    }}>
                      <Box sx={{ position: 'relative' }}>
                        <CardMedia
                          component="img"
                          height="160"
                          image={donation.images?.[0]?.url || 'https://source.unsplash.com/random/400x300?donation'}
                          alt={donation.title}
                          sx={{ borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}
                        />
                        <Chip
                          label={donation.type}
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 10,
                            left: 10,
                            bgcolor: donationTypeColors[donation.type] || '#666',
                            color: 'white',
                            fontWeight: 'bold',
                            textTransform: 'capitalize',
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
                          size="small"
                          onClick={() => handleFavorite(donation._id)}
                        >
                          <FavoriteBorder fontSize="small" />
                        </IconButton>
                      </Box>
                      
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" gutterBottom noWrap>
                          {donation.title}
                        </Typography>
                        
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          paragraph
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            mb: 2,
                          }}
                        >
                          {donation.description}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                          <LocationOn fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {donation.location}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="body1" fontWeight="bold">
                            Quantity: {donation.quantity}
                          </Typography>
                          <Chip 
                            label={donation.status} 
                            size="small"
                            color={
                              donation.status === 'approved' ? 'success' :
                              donation.status === 'pending' ? 'warning' :
                              donation.status === 'rejected' ? 'error' : 'default'
                            }
                          />
                        </Box>
                        
                        <Button
                          fullWidth
                          variant="contained"
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
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No donations found
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Try adjusting your filters or check back later.
                </Typography>
                <Button
                  variant="contained"
                  component={Link}
                  to="/donate/blood"
                  sx={{ mt: 2 }}
                >
                  Create First Donation
                </Button>
              </Box>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                <Pagination
                  count={totalPages}
                  page={filters.page}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}
          </>
        )}
      </Container>
      <Footer />
    </>
  );
};

export default Listings;