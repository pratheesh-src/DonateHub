import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  FormHelperText,
  InputAdornment,
  Chip,
  Alert,
  Card,
  CardMedia,
} from '@mui/material';
import {
  AddPhotoAlternate,
  Category,
  AttachMoney,
  Description,
  LocationOn,
  AddCircle,
  RemoveCircle,
} from '@mui/icons-material';
import Header from '../components/Header';
import Footer from '../components/Footer';

const SellItem = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    condition: 'good',
    location: '',
    images: [],
    isFree: false,
    quantity: 1,
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  const categories = [
    'Clothing',
    'Electronics',
    'Books',
    'Furniture',
    'Food',
    'Services',
    'Blood Donation',
    'Teaching',
    'Other',
  ];

  const conditions = [
    { value: 'new', label: 'New' },
    { value: 'good', label: 'Like New' },
    { value: 'used', label: 'Used - Good' },
    { value: 'fair', label: 'Used - Fair' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const handleSwitchChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.checked,
    });
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove),
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    // In a real app, you would upload to cloud storage
    // For now, we'll just simulate by creating object URLs
    const imageUrls = files.map(file => URL.createObjectURL(file));
    setFormData({
      ...formData,
      images: [...formData.images, ...imageUrls],
    });
  };

  const handleRemoveImage = (index) => {
    const newImages = [...formData.images];
    URL.revokeObjectURL(newImages[index]);
    newImages.splice(index, 1);
    setFormData({
      ...formData,
      images: newImages,
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.isFree && !formData.price) newErrors.price = 'Price is required for non-free items';
    if (formData.price && parseFloat(formData.price) < 0) newErrors.price = 'Price cannot be negative';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Mock submission
    console.log('Form submitted:', formData);
    setSuccess('Item listed successfully! It will be visible to others after review.');
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setFormData({
        title: '',
        description: '',
        category: '',
        price: '',
        condition: 'good',
        location: '',
        images: [],
        isFree: false,
        quantity: 1,
        tags: [],
      });
      setSuccess('');
    }, 3000);
  };

  return (
    <>
      <Header />
      <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
              List an Item
            </Typography>
            <Typography color="text.secondary">
              Share what you can - list items for donation or sale
            </Typography>
          </Box>

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            {/* Images Upload */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Images
              </Typography>
              <Grid container spacing={2}>
                {formData.images.map((image, index) => (
                  <Grid item xs={6} sm={4} md={3} key={index}>
                    <Card sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="100"
                        image={image}
                        alt={`Item ${index + 1}`}
                      />
                      <Button
                        size="small"
                        onClick={() => handleRemoveImage(index)}
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          minWidth: 'auto',
                          padding: '2px',
                          bgcolor: 'rgba(0,0,0,0.5)',
                          color: 'white',
                          '&:hover': {
                            bgcolor: 'rgba(0,0,0,0.7)',
                          },
                        }}
                      >
                        ×
                      </Button>
                    </Card>
                  </Grid>
                ))}
                <Grid item xs={6} sm={4} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    component="label"
                    sx={{
                      height: '100%',
                      minHeight: '100px',
                      borderStyle: 'dashed',
                      borderWidth: 2,
                      borderColor: 'grey.300',
                      '&:hover': {
                        borderColor: 'grey.400',
                      },
                    }}
                  >
                    <Box sx={{ textAlign: 'center' }}>
                      <AddPhotoAlternate sx={{ fontSize: 40, color: 'grey.500' }} />
                      <Typography variant="body2" color="text.secondary">
                        Add Photo
                      </Typography>
                    </Box>
                    <input
                      type="file"
                      hidden
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </Button>
                </Grid>
              </Grid>
              <FormHelperText>Add up to 8 photos. First image will be the cover.</FormHelperText>
            </Box>

            {/* Basic Information */}
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Item Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  error={!!errors.title}
                  helperText={errors.title}
                  placeholder="e.g., Winter Jacket, Mathematics Tutor, etc."
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  multiline
                  rows={4}
                  error={!!errors.description}
                  helperText={errors.description}
                  placeholder="Describe your item in detail..."
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth required error={!!errors.category}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    label="Category"
                    startAdornment={<Category sx={{ mr: 1, color: 'action.active' }} />}
                  >
                    {categories.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.category && <FormHelperText>{errors.category}</FormHelperText>}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Condition</InputLabel>
                  <Select
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    label="Condition"
                  >
                    {conditions.map((cond) => (
                      <MenuItem key={cond.value} value={cond.value}>
                        {cond.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Price Section */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isFree}
                        onChange={handleSwitchChange}
                        name="isFree"
                      />
                    }
                    label="This item is free"
                  />
                </Box>
              </Grid>

              {!formData.isFree && (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    type="number"
                    required
                    error={!!errors.price}
                    helperText={errors.price}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AttachMoney />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              )}

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Quantity Available"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  type="number"
                  InputProps={{
                    inputProps: { min: 1 },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  error={!!errors.location}
                  helperText={errors.location}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOn />
                      </InputAdornment>
                    ),
                  }}
                  placeholder="e.g., New York, NY or Online"
                />
              </Grid>

              {/* Tags */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Tags
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Add tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  />
                  <Button onClick={handleAddTag} variant="outlined">
                    Add
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formData.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      onDelete={() => handleRemoveTag(tag)}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Grid>
            </Grid>

            {/* Submit Buttons */}
            <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => window.history.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={<AddCircle />}
                sx={{ bgcolor: '#e53935' }}
              >
                List Item
              </Button>
            </Box>

            {/* Help Text */}
            <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Tips for successful listings:</strong>
                <ul>
                  <li>Use clear, well-lit photos</li>
                  <li>Be honest about the condition</li>
                  <li>Set a fair price or mark as free</li>
                  <li>Respond promptly to inquiries</li>
                </ul>
              </Typography>
            </Box>
          </form>
        </Paper>
      </Container>
      <Footer />
    </>
  );
};

export default SellItem;