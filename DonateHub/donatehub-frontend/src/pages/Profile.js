import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Avatar,
  Grid,
  Divider,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import {
  Edit,
  Save,
  Person,
  Email,
  Phone,
  LocationOn,
  DateRange,
  Favorite,
  ShoppingCart,
  School,
  Category,
  CameraAlt,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
    avatar: '',
  });

  // Mock user stats
  const userStats = [
    { label: 'Donations Made', value: 24, icon: <Favorite />, color: '#e53935' },
    { label: 'Items Sold', value: 12, icon: <ShoppingCart />, color: '#4caf50' },
    { label: 'Teaching Sessions', value: 5, icon: <School />, color: '#2196f3' },
    { label: 'Items Listed', value: 8, icon: <Category />, color: '#ff9800' },
  ];

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // In a real app, you would call an API to update the profile
      // For now, we'll simulate it
      setTimeout(() => {
        updateUser({ ...user, ...profileData });
        setIsEditing(false);
        setSuccess('Profile updated successfully!');
        setLoading(false);
      }, 1000);
    } catch (error) {
      setError('Failed to update profile');
      setLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({
          ...profileData,
          avatar: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                My Profile
              </Typography>
              <Typography color="text.secondary">
                Manage your account information and preferences
              </Typography>
            </Box>
            <Button
              variant={isEditing ? "contained" : "outlined"}
              startIcon={isEditing ? <Save /> : <Edit />}
              onClick={isEditing ? handleSave : () => setIsEditing(true)}
              disabled={loading}
            >
              {isEditing ? (loading ? 'Saving...' : 'Save Changes') : 'Edit Profile'}
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          {/* Profile Info */}
          <Grid container spacing={4}>
            {/* Left Column - Avatar and Stats */}
            <Grid item xs={12} md={4}>
              <Card sx={{ mb: 3 }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                    <Avatar
                      src={profileData.avatar || `https://ui-avatars.com/api/?name=${profileData.firstName}+${profileData.lastName}&background=e53935&color=fff`}
                      sx={{ width: 120, height: 120, mx: 'auto' }}
                    />
                    {isEditing && (
                      <>
                        <input
                          accept="image/*"
                          style={{ display: 'none' }}
                          id="avatar-upload"
                          type="file"
                          onChange={handleAvatarChange}
                        />
                        <label htmlFor="avatar-upload">
                          <IconButton
                            component="span"
                            sx={{
                              position: 'absolute',
                              bottom: 0,
                              right: 0,
                              bgcolor: '#e53935',
                              color: 'white',
                              '&:hover': {
                                bgcolor: '#c62828',
                              },
                            }}
                          >
                            <CameraAlt />
                          </IconButton>
                        </label>
                      </>
                    )}
                  </Box>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    {profileData.firstName} {profileData.lastName}
                  </Typography>
                  <Chip label="Verified Donor" color="success" size="small" sx={{ mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Member since {new Date().getFullYear() - 1}
                  </Typography>
                </CardContent>
              </Card>

              {/* Stats */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Your Impact
                  </Typography>
                  {userStats.map((stat, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          bgcolor: stat.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          mr: 2,
                        }}
                      >
                        {stat.icon}
                      </Box>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {stat.value}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {stat.label}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>

            {/* Right Column - Form */}
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Personal Information
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="First Name"
                        name="firstName"
                        value={profileData.firstName}
                        onChange={handleChange}
                        disabled={!isEditing}
                        InputProps={{
                          startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} />,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Last Name"
                        name="lastName"
                        value={profileData.lastName}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        value={profileData.email}
                        onChange={handleChange}
                        disabled
                        InputProps={{
                          startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />,
                        }}
                        helperText="Email cannot be changed"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Phone"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleChange}
                        disabled={!isEditing}
                        InputProps={{
                          startAdornment: <Phone sx={{ mr: 1, color: 'action.active' }} />,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Address"
                        name="address"
                        value={profileData.address}
                        onChange={handleChange}
                        disabled={!isEditing}
                        multiline
                        rows={2}
                        InputProps={{
                          startAdornment: <LocationOn sx={{ mr: 1, color: 'action.active' }} />,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Bio"
                        name="bio"
                        value={profileData.bio}
                        onChange={handleChange}
                        disabled={!isEditing}
                        multiline
                        rows={4}
                        placeholder="Tell us about yourself..."
                        helperText="Share your story and what motivates you to donate"
                      />
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 3 }} />

                  {/* Account Info */}
                  <Typography variant="h6" gutterBottom>
                    Account Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Member Since"
                        value={`${new Date().getFullYear() - 1}`}
                        disabled
                        InputProps={{
                          startAdornment: <DateRange sx={{ mr: 1, color: 'action.active' }} />,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="User Type"
                        value="Donor & Recipient"
                        disabled
                      />
                    </Grid>
                  </Grid>

                  {/* Action Buttons */}
                  {isEditing && (
                    <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                      <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={loading}
                      >
                        {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setIsEditing(false);
                          // Reset form
                          setProfileData({
                            firstName: user.firstName || '',
                            lastName: user.lastName || '',
                            email: user.email || '',
                            phone: user.phone || '',
                            address: user.address || '',
                            bio: user.bio || '',
                            avatar: user.avatar || '',
                          });
                        }}
                      >
                        Cancel
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>

              {/* Preferences Card */}
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Preferences
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Notification settings, privacy preferences, and other account settings
                  </Typography>
                  <Button variant="outlined">
                    Manage Preferences
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      </Container>
      <Footer />
    </>
  );
};

export default Profile;