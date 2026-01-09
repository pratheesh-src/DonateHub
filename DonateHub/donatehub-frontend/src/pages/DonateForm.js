import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  IconButton,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  AddPhotoAlternate,
  LocalHospital,
  AttachMoney,
  Book,
  Fastfood,
  School,
  Category,
  LocationOn,
  Tag,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { donationAPI } from '../services/api'; // This is already correct

const DonateForm = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeStep, setActiveStep] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    type: type || '',
    title: '',
    description: '',
    quantity: 1,
    location: '',
    coordinates: { lat: null, lng: null },
    tags: [],
    tagInput: '',
    
    // Type-specific details
    bloodDetails: {
      bloodType: '',
      lastDonationDate: '',
      healthConditions: [],
      hemoglobinLevel: '',
      eligibleToDonate: true,
    },
    cashDetails: {
      amount: '',
      currency: 'USD',
      paymentMethod: 'cash',
    },
    foodDetails: {
      foodType: '',
      category: '',
      expirationDate: '',
      servings: '',
      dietaryRestrictions: [],
    },
    bookDetails: {
      bookTitle: '',
      author: '',
      isbn: '',
      genre: '',
      condition: 'good',
    },
    knowledgeDetails: {
      subject: '',
      expertiseLevel: 'intermediate',
      duration: '',
      online: true,
      format: 'online',
    },
    itemDetails: {
      condition: 'good',
      brand: '',
      model: '',
      estimatedValue: '',
      category: '',
    },
  });

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const steps = ['Basic Info', 'Details', 'Images & Tags', 'Review'];

  const donationTypeIcons = {
    blood: <LocalHospital />,
    cash: <AttachMoney />,
    books: <Book />,
    food: <Fastfood />,
    knowledge: <School />,
    items: <Category />,
  };

  const donationTypeTitles = {
    blood: 'Blood Donation',
    cash: 'Cash Donation',
    books: 'Book Donation',
    food: 'Food Donation',
    knowledge: 'Knowledge Sharing',
    items: 'Item Donation',
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle nested object changes
  const handleNestedChange = (category, field, value) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }

    const newImages = [...images, ...files];
    setImages(newImages);

    // Create previews
    const newPreviews = files.map(file => ({
      url: URL.createObjectURL(file),
      name: file.name
    }));
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  // Remove image
  const removeImage = (index) => {
    const newImages = [...images];
    const newPreviews = [...imagePreviews];
    
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  // Handle tags
  const handleTagAdd = () => {
    if (formData.tagInput.trim() && formData.tags.length < 10) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, prev.tagInput.trim()],
        tagInput: ''
      }));
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Prepare form data
      const donationData = {
        type: formData.type,
        title: formData.title,
        description: formData.description,
        quantity: parseInt(formData.quantity),
        location: formData.location,
        coordinates: formData.coordinates,
        tags: formData.tags,
        images: images,
        [`${formData.type}Details`]: formData[`${formData.type}Details`]
      };

      // Send to API
      const response = await donationAPI.createDonation(donationData); // This is correct
      
      if (response.success) {
        setSuccess('Donation created successfully!');
        
        // Redirect after 2 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (err) {
      setError(err.message || 'Failed to create donation');
      console.error('Donation creation error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Render step content
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Blood Donation for Emergency"
                  helperText="A clear, descriptive title for your donation"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  multiline
                  rows={4}
                  placeholder="Describe what you're donating in detail..."
                  helperText="Provide as much detail as possible"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Quantity"
                  name="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  inputProps={{ min: 1 }}
                  helperText="How many units are available?"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., New York, NY"
                  helperText="Where is this donation available?"
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              {donationTypeTitles[formData.type]} Details
            </Typography>
            
            {/* Blood Donation Details */}
            {formData.type === 'blood' && (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Blood Type</InputLabel>
                    <Select
                      value={formData.bloodDetails.bloodType}
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
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Donation Date"
                    type="date"
                    value={formData.bloodDetails.lastDonationDate}
                    onChange={(e) => handleNestedChange('bloodDetails', 'lastDonationDate', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Health Conditions"
                    placeholder="Separate conditions with commas"
                    value={formData.bloodDetails.healthConditions.join(', ')}
                    onChange={(e) => handleNestedChange('bloodDetails', 'healthConditions', e.target.value.split(',').map(item => item.trim()))}
                  />
                </Grid>
              </Grid>
            )}

            {/* Cash Donation Details */}
            {formData.type === 'cash' && (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Amount"
                    type="number"
                    value={formData.cashDetails.amount}
                    onChange={(e) => handleNestedChange('cashDetails', 'amount', e.target.value)}
                    inputProps={{ min: 0 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Currency</InputLabel>
                    <Select
                      value={formData.cashDetails.currency}
                      onChange={(e) => handleNestedChange('cashDetails', 'currency', e.target.value)}
                      label="Currency"
                    >
                      <MenuItem value="USD">USD</MenuItem>
                      <MenuItem value="EUR">EUR</MenuItem>
                      <MenuItem value="GBP">GBP</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            )}

            {/* Food Donation Details */}
            {formData.type === 'food' && (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Food Type</InputLabel>
                    <Select
                      value={formData.foodDetails.foodType}
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
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={formData.foodDetails.category}
                      onChange={(e) => handleNestedChange('foodDetails', 'category', e.target.value)}
                      label="Category"
                    >
                      <MenuItem value="vegetables">Vegetables</MenuItem>
                      <MenuItem value="fruits">Fruits</MenuItem>
                      <MenuItem value="grains">Grains</MenuItem>
                      <MenuItem value="dairy">Dairy</MenuItem>
                      <MenuItem value="meat">Meat</MenuItem>
                      <MenuItem value="baked_goods">Baked Goods</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Expiration Date"
                    type="date"
                    value={formData.foodDetails.expirationDate}
                    onChange={(e) => handleNestedChange('foodDetails', 'expirationDate', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Servings"
                    type="number"
                    value={formData.foodDetails.servings}
                    onChange={(e) => handleNestedChange('foodDetails', 'servings', e.target.value)}
                    inputProps={{ min: 0 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Dietary Restrictions"
                    placeholder="Separate restrictions with commas (e.g., gluten-free, vegan)"
                    value={formData.foodDetails.dietaryRestrictions.join(', ')}
                    onChange={(e) => handleNestedChange('foodDetails', 'dietaryRestrictions', e.target.value.split(',').map(item => item.trim()))}
                  />
                </Grid>
              </Grid>
            )}

            {/* Book Donation Details */}
            {formData.type === 'books' && (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Book Title"
                    value={formData.bookDetails.bookTitle}
                    onChange={(e) => handleNestedChange('bookDetails', 'bookTitle', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Author"
                    value={formData.bookDetails.author}
                    onChange={(e) => handleNestedChange('bookDetails', 'author', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="ISBN"
                    value={formData.bookDetails.isbn}
                    onChange={(e) => handleNestedChange('bookDetails', 'isbn', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Genre"
                    value={formData.bookDetails.genre}
                    onChange={(e) => handleNestedChange('bookDetails', 'genre', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Condition</InputLabel>
                    <Select
                      value={formData.bookDetails.condition}
                      onChange={(e) => handleNestedChange('bookDetails', 'condition', e.target.value)}
                      label="Condition"
                    >
                      <MenuItem value="new">New</MenuItem>
                      <MenuItem value="like-new">Like New</MenuItem>
                      <MenuItem value="good">Good</MenuItem>
                      <MenuItem value="fair">Fair</MenuItem>
                      <MenuItem value="poor">Poor</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            )}

            {/* Knowledge Sharing Details */}
            {formData.type === 'knowledge' && (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Subject"
                    value={formData.knowledgeDetails.subject}
                    onChange={(e) => handleNestedChange('knowledgeDetails', 'subject', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Expertise Level</InputLabel>
                    <Select
                      value={formData.knowledgeDetails.expertiseLevel}
                      onChange={(e) => handleNestedChange('knowledgeDetails', 'expertiseLevel', e.target.value)}
                      label="Expertise Level"
                    >
                      <MenuItem value="beginner">Beginner</MenuItem>
                      <MenuItem value="intermediate">Intermediate</MenuItem>
                      <MenuItem value="advanced">Advanced</MenuItem>
                      <MenuItem value="expert">Expert</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Duration (hours)"
                    type="number"
                    value={formData.knowledgeDetails.duration}
                    onChange={(e) => handleNestedChange('knowledgeDetails', 'duration', e.target.value)}
                    inputProps={{ min: 0 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Format</InputLabel>
                    <Select
                      value={formData.knowledgeDetails.format}
                      onChange={(e) => handleNestedChange('knowledgeDetails', 'format', e.target.value)}
                      label="Format"
                    >
                      <MenuItem value="online">Online</MenuItem>
                      <MenuItem value="in_person">In Person</MenuItem>
                      <MenuItem value="hybrid">Hybrid</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            )}

            {/* Item Donation Details */}
            {formData.type === 'items' && (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Condition</InputLabel>
                    <Select
                      value={formData.itemDetails.condition}
                      onChange={(e) => handleNestedChange('itemDetails', 'condition', e.target.value)}
                      label="Condition"
                    >
                      <MenuItem value="new">New</MenuItem>
                      <MenuItem value="like-new">Like New</MenuItem>
                      <MenuItem value="good">Good</MenuItem>
                      <MenuItem value="fair">Fair</MenuItem>
                      <MenuItem value="needs-repair">Needs Repair</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Brand"
                    value={formData.itemDetails.brand}
                    onChange={(e) => handleNestedChange('itemDetails', 'brand', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Model"
                    value={formData.itemDetails.model}
                    onChange={(e) => handleNestedChange('itemDetails', 'model', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Estimated Value"
                    type="number"
                    value={formData.itemDetails.estimatedValue}
                    onChange={(e) => handleNestedChange('itemDetails', 'estimatedValue', e.target.value)}
                    inputProps={{ min: 0 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Category"
                    value={formData.itemDetails.category}
                    onChange={(e) => handleNestedChange('itemDetails', 'category', e.target.value)}
                  />
                </Grid>
              </Grid>
            )}
            
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Images & Tags
            </Typography>
            
            {/* Image Upload */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" gutterBottom>
                Upload Images (Max 5)
              </Typography>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="image-upload"
                type="file"
                multiple
                onChange={handleImageUpload}
              />
              <label htmlFor="image-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUpload />}
                  fullWidth
                  sx={{ height: 100, mb: 2 }}
                >
                  Click to upload images
                </Button>
              </label>
              
              {/* Image Previews */}
              <Grid container spacing={2}>
                {imagePreviews.map((preview, index) => (
                  <Grid item xs={6} sm={4} md={3} key={index}>
                    <Box sx={{ position: 'relative' }}>
                      <Avatar
                        src={preview.url}
                        variant="rounded"
                        sx={{ width: '100%', height: 100 }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => removeImage(index)}
                        sx={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          bgcolor: 'rgba(0,0,0,0.5)',
                          color: 'white',
                          '&:hover': {
                            bgcolor: 'rgba(0,0,0,0.7)',
                          },
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Tags */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Add Tags
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Add tag"
                  value={formData.tagInput}
                  onChange={(e) => setFormData(prev => ({ ...prev, tagInput: e.target.value }))}
                  onKeyPress={(e) => e.key === 'Enter' && handleTagAdd()}
                />
                <Button
                  variant="contained"
                  onClick={handleTagAdd}
                  disabled={!formData.tagInput.trim() || formData.tags.length >= 10}
                >
                  Add
                </Button>
              </Box>
              
              {/* Display tags */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    onDelete={() => handleTagRemove(tag)}
                    icon={<Tag />}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Your Donation
            </Typography>
            
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  {formData.title}
                </Typography>
                <Typography color="text.secondary" paragraph>
                  {formData.description}
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Type:</Typography>
                    <Typography>{donationTypeTitles[formData.type]}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Quantity:</Typography>
                    <Typography>{formData.quantity}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Location:</Typography>
                    <Typography>{formData.location}</Typography>
                  </Grid>
                </Grid>
                
                {formData.tags.length > 0 && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2">Tags:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                      {formData.tags.map((tag, index) => (
                        <Chip key={index} label={tag} size="small" />
                      ))}
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  // Handle next/back steps
  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handleSubmit();
    } else {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  return (
    <>
      <Header />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: '#e53935',
                mx: 'auto',
                mb: 2,
              }}
            >
              {donationTypeIcons[type]}
            </Avatar>
            <Typography variant="h4" gutterBottom>
              Create {donationTypeTitles[type]} Donation
            </Typography>
            <Typography color="text.secondary">
              Fill out the form below to create your donation
            </Typography>
          </Box>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {renderStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>
            
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} />}
            >
              {loading ? 'Processing...' : activeStep === steps.length - 1 ? 'Submit Donation' : 'Next'}
            </Button>
          </Box>
        </Paper>
      </Container>
      <Footer />
    </>
  );
};

export default DonateForm;