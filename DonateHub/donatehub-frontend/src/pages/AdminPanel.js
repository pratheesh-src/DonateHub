import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Avatar,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  Search,
  Edit,
  Delete,
  CheckCircle,
  Cancel,
  Person,
  LocalHospital,
  AttachMoney,
  Book,
  Fastfood,
  School,
  Category,
  BarChart,
  People,
  Inventory,
  TrendingUp,
} from '@mui/icons-material';
import Header from '../components/Header';
import Footer from '../components/Footer';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [filter, setFilter] = useState('all');

  // Mock data
  const [users, setUsers] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user', status: 'active', joinDate: '2024-01-01', donations: 5 },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'admin', status: 'active', joinDate: '2024-01-02', donations: 12 },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'user', status: 'suspended', joinDate: '2024-01-03', donations: 3 },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'user', status: 'active', joinDate: '2024-01-04', donations: 8 },
  ]);

  const [donations, setDonations] = useState([
    { id: 1, user: 'John Doe', type: 'blood', amount: '1 unit', status: 'completed', date: '2024-01-15' },
    { id: 2, user: 'Jane Smith', type: 'cash', amount: '$50', status: 'completed', date: '2024-01-14' },
    { id: 3, user: 'Bob Johnson', type: 'books', amount: '3 books', status: 'pending', date: '2024-01-13' },
    { id: 4, user: 'Alice Brown', type: 'food', amount: '5 kg', status: 'completed', date: '2024-01-12' },
    { id: 5, user: 'John Doe', type: 'knowledge', amount: '2 hours', status: 'approved', date: '2024-01-11' },
    { id: 6, user: 'Jane Smith', type: 'items', amount: '1 item', status: 'rejected', date: '2024-01-10' },
  ]);

  const [listings, setListings] = useState([
    { id: 1, title: 'Winter Jacket', category: 'clothing', user: 'John Doe', price: 'Free', status: 'active', views: 45 },
    { id: 2, title: 'Mathematics Tutor', category: 'teaching', user: 'Jane Smith', price: '$10/hr', status: 'active', views: 23 },
    { id: 3, title: 'Used Laptop', category: 'electronics', user: 'Bob Johnson', price: '$150', status: 'sold', views: 89 },
    { id: 4, title: 'Food Donation', category: 'food', user: 'Alice Brown', price: 'Free', status: 'pending', views: 12 },
  ]);

  const stats = {
    totalUsers: 1254,
    activeUsers: 1056,
    totalDonations: 3478,
    pendingDonations: 23,
    totalListings: 892,
    activeListings: 745,
    totalRevenue: '$12,450',
    monthlyGrowth: '12.5%',
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'completed':
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'suspended':
      case 'rejected':
      case 'sold':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'completed':
      case 'approved':
        return <CheckCircle color="success" />;
      case 'pending':
        return <Cancel color="warning" />;
      case 'suspended':
      case 'rejected':
      case 'sold':
        return <Cancel color="error" />;
      default:
        return null;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'blood':
        return <LocalHospital />;
      case 'cash':
        return <AttachMoney />;
      case 'books':
        return <Book />;
      case 'food':
        return <Fastfood />;
      case 'knowledge':
        return <School />;
      case 'items':
        return <Category />;
      default:
        return <Category />;
    }
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setOpenDialog(true);
  };

  const handleDelete = (id, type) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      switch (type) {
        case 'user':
          setUsers(users.filter(user => user.id !== id));
          break;
        case 'donation':
          setDonations(donations.filter(donation => donation.id !== id));
          break;
        case 'listing':
          setListings(listings.filter(listing => listing.id !== id));
          break;
      }
    }
  };

  const handleStatusChange = (id, type, newStatus) => {
    switch (type) {
      case 'user':
        setUsers(users.map(user => 
          user.id === id ? { ...user, status: newStatus } : user
        ));
        break;
      case 'donation':
        setDonations(donations.map(donation =>
          donation.id === id ? { ...donation, status: newStatus } : donation
        ));
        break;
      case 'listing':
        setListings(listings.map(listing =>
          listing.id === id ? { ...listing, status: newStatus } : listing
        ));
        break;
    }
  };

  const filteredDonations = donations.filter(donation => {
    if (filter !== 'all' && donation.status !== filter) return false;
    if (searchTerm) {
      return donation.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
             donation.type.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  const filteredListings = listings.filter(listing => {
    if (filter !== 'all' && listing.status !== filter) return false;
    if (searchTerm) {
      return listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
             listing.user.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  const filteredUsers = users.filter(user => {
    if (filter !== 'all' && user.status !== filter) return false;
    if (searchTerm) {
      return user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             user.email.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  const renderTable = () => {
    switch (activeTab) {
      case 'users':
        return (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Join Date</TableCell>
                  <TableCell>Donations</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar>
                          <Person />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">{user.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {user.id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip 
                        label={user.role} 
                        size="small" 
                        color={user.role === 'admin' ? 'primary' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={user.status}
                        size="small"
                        color={getStatusColor(user.status)}
                        icon={getStatusIcon(user.status)}
                      />
                    </TableCell>
                    <TableCell>{user.joinDate}</TableCell>
                    <TableCell>{user.donations}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small" onClick={() => handleEdit(user)}>
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(user.id, 'user')}>
                          <Delete fontSize="small" />
                        </IconButton>
                        {user.status === 'active' ? (
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleStatusChange(user.id, 'user', 'suspended')}
                          >
                            Suspend
                          </Button>
                        ) : (
                          <Button
                            size="small"
                            variant="outlined"
                            color="success"
                            onClick={() => handleStatusChange(user.id, 'user', 'active')}
                          >
                            Activate
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );

      case 'donations':
        return (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Donation</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDonations.map((donation) => (
                  <TableRow key={donation.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ color: 'primary.main' }}>
                          {getTypeIcon(donation.type)}
                        </Box>
                        <Typography variant="subtitle2">
                          {donation.type.charAt(0).toUpperCase() + donation.type.slice(1)} Donation
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{donation.user}</TableCell>
                    <TableCell>
                      <Chip 
                        label={donation.type} 
                        size="small" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{donation.amount}</TableCell>
                    <TableCell>
                      <Chip 
                        label={donation.status}
                        size="small"
                        color={getStatusColor(donation.status)}
                        icon={getStatusIcon(donation.status)}
                      />
                    </TableCell>
                    <TableCell>{donation.date}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small" onClick={() => handleEdit(donation)}>
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(donation.id, 'donation')}>
                          <Delete fontSize="small" />
                        </IconButton>
                        {donation.status === 'pending' && (
                          <>
                            <Button
                              size="small"
                              variant="outlined"
                              color="success"
                              onClick={() => handleStatusChange(donation.id, 'donation', 'approved')}
                            >
                              Approve
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              onClick={() => handleStatusChange(donation.id, 'donation', 'rejected')}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );

      case 'listings':
        return (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Item</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Views</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredListings.map((listing) => (
                  <TableRow key={listing.id}>
                    <TableCell>
                      <Typography variant="subtitle2">{listing.title}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={listing.category} 
                        size="small" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{listing.user}</TableCell>
                    <TableCell>
                      <Typography 
                        color={listing.price === 'Free' ? 'success.main' : 'primary'}
                        fontWeight="bold"
                      >
                        {listing.price}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={listing.status}
                        size="small"
                        color={getStatusColor(listing.status)}
                        icon={getStatusIcon(listing.status)}
                      />
                    </TableCell>
                    <TableCell>{listing.views}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small" onClick={() => handleEdit(listing)}>
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(listing.id, 'listing')}>
                          <Delete fontSize="small" />
                        </IconButton>
                        {listing.status === 'pending' && (
                          <>
                            <Button
                              size="small"
                              variant="outlined"
                              color="success"
                              onClick={() => handleStatusChange(listing.id, 'listing', 'active')}
                            >
                              Approve
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              onClick={() => handleStatusChange(listing.id, 'listing', 'rejected')}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Header />
      <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Admin Dashboard
          </Typography>
          <Typography color="text.secondary">
            Manage users, donations, and listings
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={6} sm={3}>
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
                    <People />
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.totalUsers}
                    </Typography>
                    <Typography color="text.secondary">
                      Total Users
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="success.main">
                  +{stats.activeUsers} active
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={3}>
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
                    <LocalHospital />
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.totalDonations}
                    </Typography>
                    <Typography color="text.secondary">
                      Total Donations
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="warning.main">
                  {stats.pendingDonations} pending
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={3}>
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
                    <Inventory />
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.totalListings}
                    </Typography>
                    <Typography color="text.secondary">
                      Total Listings
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="success.main">
                  {stats.activeListings} active
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={3}>
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
                    <TrendingUp />
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.totalRevenue}
                    </Typography>
                    <Typography color="text.secondary">
                      Total Revenue
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="success.main">
                  ↑ {stats.monthlyGrowth} growth
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs and Controls */}
        <Paper elevation={2} sx={{ mb: 3, borderRadius: 2 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant={activeTab === 'dashboard' ? 'contained' : 'outlined'}
                  onClick={() => setActiveTab('dashboard')}
                  startIcon={<BarChart />}
                >
                  Dashboard
                </Button>
                <Button
                  variant={activeTab === 'users' ? 'contained' : 'outlined'}
                  onClick={() => setActiveTab('users')}
                  startIcon={<People />}
                >
                  Users
                </Button>
                <Button
                  variant={activeTab === 'donations' ? 'contained' : 'outlined'}
                  onClick={() => setActiveTab('donations')}
                  startIcon={<LocalHospital />}
                >
                  Donations
                </Button>
                <Button
                  variant={activeTab === 'listings' ? 'contained' : 'outlined'}
                  onClick={() => setActiveTab('listings')}
                  startIcon={<Inventory />}
                >
                  Listings
                </Button>
              </Box>

              {activeTab !== 'dashboard' && (
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <TextField
                    size="small"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ width: 200 }}
                  />
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={filter}
                      label="Status"
                      onChange={(e) => setFilter(e.target.value)}
                    >
                      <MenuItem value="all">All Status</MenuItem>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                      <MenuItem value="suspended">Suspended</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              )}
            </Box>
          </Box>

          {/* Table Content */}
          <Box sx={{ p: 3 }}>
            {activeTab === 'dashboard' ? (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Recent Activity
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Recent Donations
                        </Typography>
                        <List>
                          {donations.slice(0, 5).map((donation) => (
                            <ListItem key={donation.id}>
                              <ListItemText
                                primary={donation.type.charAt(0).toUpperCase() + donation.type.slice(1) + ' Donation'}
                                secondary={`By ${donation.user} - ${donation.date}`}
                              />
                              <Chip
                                label={donation.status}
                                size="small"
                                color={getStatusColor(donation.status)}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Recent Listings
                        </Typography>
                        <List>
                          {listings.slice(0, 5).map((listing) => (
                            <ListItem key={listing.id}>
                              <ListItemText
                                primary={listing.title}
                                secondary={`By ${listing.user} - ${listing.category}`}
                              />
                              <Typography color="primary" fontWeight="bold">
                                {listing.price}
                              </Typography>
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            ) : (
              renderTable()
            )}
          </Box>
        </Paper>

        {/* Export Button */}
        {activeTab !== 'dashboard' && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="outlined">
              Export as CSV
            </Button>
          </Box>
        )}
      </Container>

      {/* Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>
          Edit {selectedItem?.name || selectedItem?.title || 'Item'}
        </DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Box sx={{ pt: 2 }}>
              <Typography>
                Edit functionality would be implemented here.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setOpenDialog(false)}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
      <Footer />
    </>
  );
};

export default AdminPanel;