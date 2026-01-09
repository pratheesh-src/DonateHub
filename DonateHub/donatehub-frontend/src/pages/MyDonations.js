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
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs,
} from '@mui/material';
import {
  Edit,
  Delete,
  Visibility,
  Add,
  FilterList,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { donationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const MyDonations = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [donations, setDonations] = useState([]);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const statuses = ['all', 'pending', 'approved', 'completed', 'cancelled'];

  // Fetch user's donations
  useEffect(() => {
    const fetchDonations = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await donationAPI.getMyDonations();
        if (response.success) {
          setDonations(response.donations || []);
        } else {
          setError(response.message || 'Failed to fetch donations');
        }
      } catch (err) {
        setError(err.message || 'Failed to load donations');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDonations();
    }
  }, [user]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await donationAPI.deleteDonation(deleteId);
      if (response.success) {
        setDonations(donations.filter(d => d._id !== deleteId));
        setDeleteDialogOpen(false);
        setDeleteId(null);
      } else {
        setError(response.message || 'Failed to delete donation');
      }
    } catch (err) {
      setError(err.message || 'Error deleting donation');
      console.error(err);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeleteId(null);
  };

  // Filter donations by status
  const filteredDonations = tabValue === 0 
    ? donations 
    : donations.filter(d => d.status === statuses[tabValue]);

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      approved: 'success',
      completed: 'info',
      cancelled: 'error',
    };
    return colors[status] || 'default';
  };

  const getDonationTypeColor = (type) => {
    const colors = {
      blood: '#e53935',
      cash: '#4caf50',
      food: '#ff9800',
      books: '#2196f3',
      knowledge: '#9c27b0',
      items: '#607d8b',
    };
    return colors[type] || '#999';
  };

  if (loading) {
    return (
      <>
        <Header />
        <Container>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        </Container>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ py: 4, mb: 8 }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" fontWeight="bold">
            My Donations
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<Add />}
            component={Link}
            to="/sell"
            sx={{ bgcolor: '#e53935' }}
          >
            Create Donation
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

        {donations.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 8 }}>
              <Typography color="textSecondary" gutterBottom>
                You haven't created any donations yet
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<Add />}
                component={Link}
                to="/sell"
                sx={{ mt: 2 }}
              >
                Create Your First Donation
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Status Filter Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label={`All (${donations.length})`} />
                {statuses.slice(1).map((status, idx) => (
                  <Tab 
                    key={status}
                    label={`${status.charAt(0).toUpperCase() + status.slice(1)} (${
                      donations.filter(d => d.status === status).length
                    })`}
                  />
                ))}
              </Tabs>
            </Box>

            {/* Donations Grid */}
            <Grid container spacing={3}>
              {filteredDonations.map((donation) => (
                <Grid item xs={12} sm={6} md={4} key={donation._id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {donation.images && donation.images.length > 0 && (
                      <CardMedia
                        component="img"
                        height="200"
                        image={donation.images[0].url}
                        alt={donation.title}
                        sx={{ objectFit: 'cover' }}
                      />
                    )}
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="h6" component="div" sx={{ flex: 1 }}>
                          {donation.title}
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Chip
                          label={donation.type.charAt(0).toUpperCase() + donation.type.slice(1)}
                          size="small"
                          sx={{
                            bgcolor: getDonationTypeColor(donation.type),
                            color: 'white',
                            mr: 1,
                          }}
                        />
                        <Chip
                          label={donation.status}
                          size="small"
                          color={getStatusColor(donation.status)}
                          variant="outlined"
                        />
                      </Box>

                      <Typography color="textSecondary" variant="body2" sx={{ mb: 2 }}>
                        {donation.description.substring(0, 60)}...
                      </Typography>

                      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" color="textSecondary">
                          Views: {donation.views || 0}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Qty: {donation.quantity}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          startIcon={<Visibility />}
                          component={Link}
                          to={`/donation/${donation._id}`}
                          variant="outlined"
                          fullWidth
                        >
                          View
                        </Button>
                        <IconButton
                          size="small"
                          component={Link}
                          to={`/edit-donation/${donation._id}`}
                          title="Edit"
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick(donation._id)}
                          title="Delete"
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Container>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Donation</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this donation? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </>
  );
};

export default MyDonations;
