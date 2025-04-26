 import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { loadPlantData } from '../../data/csvData';
import { uploadImage } from '../../config/cloudinary';

const PlantPage = () => {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('commonName');
  const [filteredPlants, setFilteredPlants] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        console.log('Fetching plant data...');
        const data = await loadPlantData();
        console.log('Loaded plant data:', data);
        
        if (!data || data.length === 0) {
          throw new Error('No plant data available');
        }
        
        setPlants(data);
        setFilteredPlants(data);
        setLoading(false);
      } catch (err) {
        console.error('Error loading plant data:', err);
        setError('Failed to load plant data. Please try again later.');
        setLoading(false);
      }
    };

    fetchPlants();
  }, []);

  useEffect(() => {
    let result = plants;

    // Apply search filter
    if (searchQuery) {
      result = result.filter(plant =>
        plant.commonName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plant.scientificName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plant.medicinalUses.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'commonName':
          return (a.commonName || '').toLowerCase().localeCompare((b.commonName || '').toLowerCase());
        case 'scientificName':
          return (a.scientificName || '').toLowerCase().localeCompare((b.scientificName || '').toLowerCase());
        case 'region':
          return (a.region || '').toLowerCase().localeCompare((b.region || '').toLowerCase());
        default:
          return 0;
      }
    });

    setFilteredPlants(result);
  }, [plants, searchQuery, sortBy]);

  const handlePlantClick = (plant) => {
    setSelectedPlant(plant);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedPlant(null);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setUploadError('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

      try {
        setUploading(true);
      
      // Get filename without extension and convert to lowercase for matching
      const fileName = selectedFile.name.split('.')[0].toLowerCase().trim();
      console.log('Uploading file:', fileName);

      // Check if filename matches any existing plant's common name
      const matchingPlant = plants.find(plant => {
        const plantName = plant.commonName.toLowerCase().trim();
        // Remove any special characters and spaces for better matching
        const cleanFileName = fileName.replace(/[^a-z0-9]/g, '');
        const cleanPlantName = plantName.replace(/[^a-z0-9]/g, '');
        
        return cleanPlantName === cleanFileName || 
               cleanPlantName.includes(cleanFileName) || 
               cleanFileName.includes(cleanPlantName);
      });

      // Upload image to Cloudinary using unsigned upload with preset
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('upload_preset', 'vedgarden');
      formData.append('folder', 'samples/ecommerce');

      const response = await fetch('https://api.cloudinary.com/v1_1/ddgzlt0bz/image/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      const imageUrl = data.secure_url;
      console.log('Image uploaded successfully:', imageUrl);

      if (matchingPlant) {
        console.log('Found matching plant:', matchingPlant.commonName);
        // Update the matching plant with the new image
        const updatedPlant = {
          ...matchingPlant,
          imageUrl: imageUrl
        };
        
        // Update plants array with the new image
        setPlants(prevPlants => 
          prevPlants.map(plant => 
            plant.id === matchingPlant.id ? updatedPlant : plant
          )
        );
        
        // Set filtered plants to only show the matching plant
        setFilteredPlants([updatedPlant]);
        
        // Update search query to match the plant name
        setSearchQuery(matchingPlant.commonName);
        
        // Show success message with plant name
        setUploadError(`Successfully updated image for ${matchingPlant.commonName}`);
      } else {
        // Create a new plant entry with the uploaded image
        const newPlant = {
          id: Date.now().toString(),
          commonName: selectedFile.name.split('.')[0], // Use filename as common name
          scientificName: 'Unknown',
          medicinalUses: 'To be determined',
          plantFamily: 'Unknown',
          region: 'Unknown',
          partsUsed: 'Unknown',
          preparationMethods: 'Unknown',
          chemicalConstituents: 'Unknown',
          precautions: 'Unknown',
          imageUrl: imageUrl
        };

        // Add the new plant to the existing plants
        setPlants(prevPlants => [...prevPlants, newPlant]);
        // Set filtered plants to only show the new plant
        setFilteredPlants([newPlant]);
        // Update search query to match the new plant name
        setSearchQuery(newPlant.commonName);
        
        // Show success message
        setUploadError(`Created new plant entry: ${newPlant.commonName}`);
      }
      
      setSelectedFile(null);
      setPreviewUrl(null);
      setUploadDialogOpen(false);
      } catch (error) {
        console.error('Error uploading image:', error);
      setUploadError(error.message || 'Failed to upload image. Please try again.');
      } finally {
        setUploading(false);
      }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box mb={3} display="flex" gap={2} alignItems="center">
        <TextField
          label="Search Plants"
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <FormControl variant="outlined" sx={{ minWidth: 200 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            label="Sort By"
          >
            <MenuItem value="commonName">Common Name</MenuItem>
            <MenuItem value="scientificName">Scientific Name</MenuItem>
            <MenuItem value="region">Region</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setUploadDialogOpen(true)}
        >
          Upload Plant Image
        </Button>
      </Box>

      <Grid container spacing={3}>
        {filteredPlants.map((plant) => (
          <Grid item xs={12} sm={6} md={4} key={plant.id}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3
                }
              }}
              onClick={() => handlePlantClick(plant)}
            >
              <CardMedia
                component="img"
                height="200"
                image={plant.imageUrl}
                alt={plant.commonName}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {plant.commonName}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    {plant.scientificName}
                  </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedPlant && (
          <>
            <DialogTitle>{selectedPlant.commonName}</DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mt: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <CardMedia
                    component="img"
                    height="300"
                    image={selectedPlant.imageUrl}
                    alt={selectedPlant.commonName}
                    sx={{ objectFit: 'cover', borderRadius: 1 }}
                  />
                </Box>
                <Box sx={{ flex: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Scientific Name: {selectedPlant.scientificName}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    <strong>Medicinal Uses:</strong> {selectedPlant.medicinalUses}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    <strong>Plant Family:</strong> {selectedPlant.plantFamily}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    <strong>Region:</strong> {selectedPlant.region}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    <strong>Parts Used:</strong> {selectedPlant.partsUsed}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    <strong>Preparation Methods:</strong> {selectedPlant.preparationMethods}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    <strong>Chemical Constituents:</strong> {selectedPlant.chemicalConstituents}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Precautions:</strong> {selectedPlant.precautions}
                  </Typography>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)}>
        <DialogTitle>Upload Plant Image</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <input
              accept="image/*"
              type="file"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              id="image-upload"
            />
            <label htmlFor="image-upload">
              <Button variant="contained" component="span" fullWidth>
                Select Image
              </Button>
            </label>
            {previewUrl && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <img
                  src={previewUrl}
                  alt="Preview"
                  style={{ maxWidth: '100%', maxHeight: '200px' }}
                />
              </Box>
            )}
            {uploadError && (
              <Alert severity={uploadError.includes('Successfully') ? 'success' : 'error'} sx={{ mt: 2 }}>
                {uploadError}
              </Alert>
            )}
                </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleUpload}
            disabled={uploading || !selectedFile}
            variant="contained"
            color="primary"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
                </Box>
  );
};

export default PlantPage; 