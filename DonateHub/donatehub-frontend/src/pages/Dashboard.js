import React, { useState, useEffect } from 'react';
import Person from '@mui/icons-material/Person';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  IconButton,
  Paper,
  LinearProgress,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  AddCircle,
  Favorite,
  ShoppingCart,
  History,
  Notifications,
  LocalHospital,
  AttachMoney,
  Book,
  Fastfood,
  School,
  Category,
  Edit,
  Delete,
  CheckCircle,
  Pending,
  Cancel,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState(null);

  // Fetch dashboard data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await userAPI.getDashboardStats();
        if (response.success) {
          setDashboardData(response);
        } else {
          setError(response.message || 'Failed to fetch dashboard data');
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError(err.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
      case 'Active':
      case 'approved':
        return 'success';
      case 'Pending':
      case 'pending':
        return 'warning';
      case 'Sold':
      case 'Canceled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
      case 'Active':
      case 'approved':
        return <CheckCircle color="success" />;
      case 'Pending':
      case 'pending':
        return <Pending color="warning" />;
      case 'Sold':
      case 'Canceled':
        return <Cancel color="error" />;
      default:
        return null;
    }
  };

  return (
    <>
      <Header />
      <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Welcome back, {dashboardData?.user?.firstName || user?.firstName || 'User'}! 👋
          </Typography>
          <Typography color="text.secondary">
            Here's what's happening with your donations today
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Quick Actions */}
            <Box sx={{ mb: 4 }}>
              <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<AddCircle />}
                      component={Link}
                      to="/sell"
                      sx={{ bgcolor: '#e53935' }}
                    >
                      Donate Item
                    </Button>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<LocalHospital />}
                      component={Link}
                      to="/donate/blood"
                    >
                      Donate Blood
                    </Button>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<School />}
                      component={Link}
                      to="/donate/knowledge"
                    >
                      Teach Something
                    </Button>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<ShoppingCart />}
                      component={Link}
                      to="/listings"
                    >
                  Browse Items
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {dashboardData?.quickStats && (
            <>
              <Grid item xs={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          bgcolor: '#e53935',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          mr: 2,
                        }}
                      >
                        <Favorite />
                      </Box>
                      <Box>
                        <Typography variant="h4" fontWeight="bold">
                          {dashboardData.quickStats.totalDonations}
                        </Typography>
                        <Typography color="text.secondary">
                          Total Donations
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          bgcolor: '#2196f3',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          mr: 2,
                        }}
                      >
                        <Category />
                      </Box>
                      <Box>
                        <Typography variant="h4" fontWeight="bold">
                          {dashboardData.quickStats.itemsListed}
                        </Typography>
                        <Typography color="text.secondary">
                          Items Listed
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          bgcolor: '#4caf50',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          mr: 2,
                        }}
                      >
                        <ShoppingCart />
                      </Box>
                      <Box>
                        <Typography variant="h4" fontWeight="bold">
                          {dashboardData.quickStats.itemsReceived}
                        </Typography>
                        <Typography color="text.secondary">
                          Items Received
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          bgcolor: '#9c27b0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          mr: 2,
                        }}
                      >
                        <School />
                      </Box>
                      <Box>
                        <Typography variant="h4" fontWeight="bold">
                          {dashboardData.quickStats.teachingSessions}
                        </Typography>
                        <Typography color="text.secondary">
                          Teaching Sessions
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </>
          )}
        </Grid>

        {/* Main Content with Tabs */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper elevation={2} sx={{ borderRadius: 2 }}>
              <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tab label="My Listings" />
                <Tab label="Pending Requests" />
                <Tab label="Activity History" />
              </Tabs>

              <Box sx={{ p: 3 }}>

                {tabValue === 0 && (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">Your Listings</Typography>
                      <Button
                        variant="contained"
                        startIcon={<AddCircle />}
                        component={Link}
                        to="/sell"
                        size="small"
                        sx={{ bgcolor: '#e53935' }}
                      >
                        Add New
                      </Button>
                    </Box>
                    <List>
                      {dashboardData?.donations && dashboardData.donations.length > 0 ? (
                        dashboardData.donations.map((listing) => (
                          <ListItem
                            key={listing.id}
                            secondaryAction={
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <IconButton edge="end" size="small">
                                  <Edit />
                                </IconButton>
                                <IconButton edge="end" size="small">
                                  <Delete />
                                </IconButton>
                              </Box>
                            }
                            sx={{
                              borderBottom: 1,
                              borderColor: 'divider',
                              py: 2,
                            }}
                          >
                            <ListItemAvatar>
                              <Avatar
                                src={listing.image}
                                sx={{ bgcolor: 'primary.main' }}
                              >
                                {!listing.image && <Category />}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="subtitle1" fontWeight="bold">
                                    {listing.title}
                                  </Typography>
                                  <Chip
                                    label={listing.status}
                                    size="small"
                                    color={getStatusColor(listing.status)}
                                    icon={getStatusIcon(listing.status)}
                                  />
                                </Box>
                              }
                              secondary={
                                <>
                                  <Typography variant="body2" color="text.secondary">
                                    {listing.type} • {listing.views} views
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Listed on {listing.listedDate}
                                  </Typography>
                                </>
                              }
                            />
                          </ListItem>
                        ))
                      ) : (
                        <Box sx={{ py: 3, textAlign: 'center' }}>
                          <Typography color="text.secondary">No listings yet. Start donating!</Typography>
                        </Box>
                      )}
                    </List>
                  </Box>
                )}

                {tabValue === 1 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Pending Requests
                    </Typography>
                    <List>
                      {dashboardData?.pendingRequests && dashboardData.pendingRequests.length > 0 ? (
                        dashboardData.pendingRequests.map((request) => (
                          <ListItem
                            key={request.id}
                            secondaryAction={
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                {request.status === 'pending' && (
                                  <>
                                    <Button size="small" variant="contained" color="success">
                                      Approve
                                    </Button>
                                    <Button size="small" variant="outlined" color="error">
                                      Reject
                                    </Button>
                                  </>
                                )}
                                {request.status === 'approved' && (
                                  <Chip label="Approved" color="success" size="small" />
                                )}
                              </Box>
                            }
                            sx={{
                              borderBottom: 1,
                              borderColor: 'divider',
                              py: 2,
                            }}
                          >
                            <ListItemAvatar>
                              <Avatar>
                                <Person />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Typography variant="subtitle1" fontWeight="bold">
                                  {request.item}
                                </Typography>
                              }
                              secondary={
                                <>
                                  <Typography variant="body2" color="text.secondary">
                                    Requested by {request.requester}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Requested on {request.requestDate}
                                  </Typography>
                                </>
                              }
                            />
                          </ListItem>
                        ))
                      ) : (
                        <Box sx={{ py: 3, textAlign: 'center' }}>
                          <Typography color="text.secondary">
                            {dashboardData?.quickStats?.pendingRequests === 0 ? 'No pending requests' : 'Loading...'}
                          </Typography>
                        </Box>
                      )}
                    </List>
                  </Box>
                )}

                {tabValue === 2 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Recent Activity
                    </Typography>
                    <List>
                      {dashboardData?.notifications && dashboardData.notifications.length > 0 ? (
                        dashboardData.notifications.map((activity, index) => (
                          <ListItem
                            key={index}
                            sx={{
                              borderBottom: 1,
                              borderColor: 'divider',
                              py: 2,
                            }}
                          >
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: '#e53935' }}>
                                <Notifications />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Typography variant="subtitle1">
                                  {activity.title}
                                </Typography>
                              }
                              secondary={
                                <>
                                  <Typography variant="body2" color="text.secondary">
                                    {activity.message}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {activity.timeAgo}
                                  </Typography>
                                </>
                              }
                            />
                          </ListItem>
                        ))
                      ) : (
                        <Box sx={{ py: 3, textAlign: 'center' }}>
                          <Typography color="text.secondary">No recent activity</Typography>
                        </Box>
                      )}
                    </List>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Right Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Donation Goal */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Your Donation Impact
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {dashboardData?.donationImpact?.label || 'Monthly Donation Goal'}
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={dashboardData?.donationImpact?.progress || 0}
                    sx={{ height: 8, borderRadius: 4, mb: 1 }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">
                      ${dashboardData?.donationImpact?.current || 0} / ${dashboardData?.donationImpact?.goal || 100}
                    </Typography>
                    <Typography variant="body2" color="primary">
                      {dashboardData?.donationImpact?.progress || 0}%
                    </Typography>
                  </Box>
                </Box>
                <Button fullWidth variant="outlined" sx={{ mt: 2 }}>
                  View Full Report
                </Button>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">Notifications</Typography>
                  <IconButton size="small">
                    <Notifications />
                  </IconButton>
                </Box>
                <List dense>
                  {dashboardData?.notifications && dashboardData.notifications.length > 0 ? (
                    dashboardData.notifications.slice(0, 3).map((notif, index) => (
                      <ListItem key={index} sx={{ py: 1 }}>
                        <ListItemText
                          primary={notif.title}
                          secondary={notif.timeAgo}
                          primaryTypographyProps={{ variant: 'body2' }}
                          secondaryTypographyProps={{ variant: 'caption' }}
                        />
                      </ListItem>
                    ))
                  ) : (
                    <ListItem sx={{ py: 1 }}>
                      <ListItemText
                        primary="No notifications"
                        primaryTypographyProps={{ variant: 'body2', color: 'textSecondary' }}
                      />
                    </ListItem>
                  )}
                </List>
                <Button fullWidth variant="text" size="small" sx={{ mt: 1 }}>
                  See All Notifications
                </Button>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Links
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button component={Link} to="/profile" variant="text" sx={{ justifyContent: 'flex-start' }}>
                    Edit Profile
                  </Button>
                  <Button component={Link} to="/settings" variant="text" sx={{ justifyContent: 'flex-start' }}>
                    Account Settings
                  </Button>
                  <Button component={Link} to="/my-donations" variant="text" sx={{ justifyContent: 'flex-start' }}>
                    My Donations
                  </Button>
                  <Button component={Link} to="/help" variant="text" sx={{ justifyContent: 'flex-start' }}>
                    Help & Support
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
          </>
        )}
      </Container>
      <Footer />
    </>
  );
};

export default Dashboard;