import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import { ArrowBack, SaveAs } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { donationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const EditDonation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [donation, setDonation] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    quantity: 1,
    location: '',
    type: '',
    status: 'pending',
    tags: [],
    bloodDetails: {},
    cashDetails: {},
    foodDetails: {},
    bookDetails: {},
    knowledgeDetails: {},
    itemDetails: {},
  });

  // Fetch donation details
  useEffect(() => {
    const fetchDonation = async () => {
      try {
        setLoading(true);
        const response = await donationAPI.getDonation(id);
        if (response.success && response.donation) {
          setDonation(response.donation);
          setFormData({
            title: response.donation.title || '',
            description: response.donation.description || '',
            quantity: response.donation.quantity || 1,
            location: response.donation.location || '',
            type: response.donation.type || '',
            status: response.donation.status || 'pending',
            tags: response.donation.tags || [],
            bloodDetails: response.donation.bloodDetails || {},
            cashDetails: response.donation.cashDetails || {},
            foodDetails: response.donation.foodDetails || {},
            bookDetails: response.donation.bookDetails || {},
            knowledgeDetails: response.donation.knowledgeDetails || {},
            itemDetails: response.donation.itemDetails || {},
          });
        } else {
          setError('Donation not found');
        }
      } catch (err) {
        setError('Failed to fetch donation details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDonation();
    }
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNestedChange = (category, field, value) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const response = await donationAPI.updateDonation(id, formData);
      
      if (response.success) {
        setSuccess('Donation updated successfully!');
        setTimeout(() => {
          navigate(`/donation/${id}`);
        }, 1500);
      } else {
        setError(response.message || 'Failed to update donation');
      }
    } catch (err) {
      setError(err.message || 'Error updating donation');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this donation? This action cannot be undone.')) {
      try {
        setSaving(true);
        const response = await donationAPI.deleteDonation(id);
        
        if (response.success) {
          setSuccess('Donation deleted successfully!');
          setTimeout(() => {
            navigate('/dashboard');
          }, 1500);
        } else {
          setError(response.message || 'Failed to delete donation');
        }
      } catch (err) {
        setError(err.message || 'Error deleting donation');
        console.error(err);
      } finally {
        setSaving(false);
      }
    }
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

  if (!donation) {
    return (
      <>
        <Header />
        <Container>
          <Box sx={{ py: 4 }}>
            <Alert severity="error">Donation not found</Alert>
            <Button 
              startIcon={<ArrowBack />}
              onClick={() => navigate(-1)}
              sx={{ mt: 2 }}
            >
              Go Back
            </Button>
          </Box>
        </Container>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <Container maxWidth="md" sx={{ py: 4, mb: 8 }}>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button 
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
            variant="outlined"
          >
            Back
          </Button>
          <Typography variant="h4" fontWeight="bold">
            Edit Donation
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Paper elevation={2} sx={{ p: 4 }}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Basic Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Donation title"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  label="Type"
                >
                  <MenuItem value="blood">Blood Donation</MenuItem>
                  <MenuItem value="cash">Cash Donation</MenuItem>
                  <MenuItem value="food">Food Donation</MenuItem>
                  <MenuItem value="books">Book Donation</MenuItem>
                  <MenuItem value="knowledge">Knowledge Sharing</MenuItem>
                  <MenuItem value="items">Physical Items</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={4}
                placeholder="Detailed description"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Quantity"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleInputChange}
                inputProps={{ min: 1 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Pickup location"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  label="Status"
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Type-specific fields */}
            {formData.type === 'blood' && (
              <>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Blood Details
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Blood Type</InputLabel>
                    <Select
                      value={formData.bloodDetails.bloodType || ''}
                      onChange={(e) => handleNestedChange('bloodDetails', 'bloodType', e.target.value)}
                      label="Blood Type"
                    >
                      <MenuItem value="A+">A+</MenuItem>
                      <MenuItem value="A-">A-</MenuItem>
                      <MenuItem value="B+">B+</MenuItem>
                      <MenuItem value="B-">B-</MenuItem>
                      <MenuItem value="AB+">AB+</MenuItem>
                      <MenuItem value="AB-">AB-</MenuItem>
                      <MenuItem value="O+">O+</MenuItem>
                      <MenuItem value="O-">O-</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}

            {formData.type === 'cash' && (
              <>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Cash Details
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Amount"
                    type="number"
                    value={formData.cashDetails.amount || ''}
                    onChange={(e) => handleNestedChange('cashDetails', 'amount', e.target.value)}
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Grid>
              </>
            )}

            {formData.type === 'food' && (
              <>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Food Details
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Food Type</InputLabel>
                    <Select
                      value={formData.foodDetails.foodType || ''}
                      onChange={(e) => handleNestedChange('foodDetails', 'foodType', e.target.value)}
                      label="Food Type"
                    >
                      <MenuItem value="perishable">Perishable</MenuItem>
                      <MenuItem value="non_perishable">Non-Perishable</MenuItem>
                      <MenuItem value="cooked">Cooked</MenuItem>
                      <MenuItem value="packaged">Packaged</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}

            {/* Action Buttons */}
            <Grid item xs={12} sx={{ display: 'flex', gap: 2, pt: 3 }}>
              <Button
                variant="contained"
                startIcon={<SaveAs />}
                onClick={handleSave}
                disabled={saving}
                sx={{ flex: 1 }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={handleDelete}
                disabled={saving}
              >
                Delete Donation
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>
      <Footer />
    </>
  );
};

export default EditDonation;
