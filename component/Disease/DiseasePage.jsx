import React, { useState, useEffect } from 'react';
import { Container, Grid, Card, CardContent, Typography, Box, CircularProgress, Alert, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { loadDiseaseData } from '../../data/csvData';

const DiseasePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('disease');
  const [diseases, setDiseases] = useState([]);
  const [filteredDiseases, setFilteredDiseases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDiseases = async () => {
      try {
        setLoading(true);
        const data = await loadDiseaseData();
        console.log('Loaded disease data:', data);
        setDiseases(data);
        setFilteredDiseases(data);
      } catch (err) {
        setError('Failed to load disease data. Please try again later.');
        console.error('Error loading diseases:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDiseases();
  }, []);

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    
    const filtered = diseases.filter(disease => {
      const diseaseName = disease.disease?.toLowerCase() || '';
      const herbalPlant = disease.herbalPlant?.toLowerCase() || '';
      const preparationMethod = disease.preparationMethod?.toLowerCase() || '';
      const possibleReactions = disease.possibleReactions?.toLowerCase() || '';
      
      return (
        diseaseName.includes(query) ||
        herbalPlant.includes(query) ||
        preparationMethod.includes(query) ||
        possibleReactions.includes(query)
      );
    });
    
    setFilteredDiseases(sortDiseases(filtered));
  };

  const handleSort = (event) => {
    const sortValue = event.target.value;
    setSortBy(sortValue);
    const sorted = [...filteredDiseases].sort((a, b) => {
      switch (sortValue) {
        case 'disease':
          return (a.disease || '').toLowerCase().localeCompare((b.disease || '').toLowerCase());
        case 'herbalPlant':
          return (a.herbalPlant || '').toLowerCase().localeCompare((b.herbalPlant || '').toLowerCase());
        default:
          return 0;
      }
    });
    setFilteredDiseases(sorted);
  };

  const sortDiseases = (diseasesToSort) => {
    return [...diseasesToSort].sort((a, b) => {
      switch (sortBy) {
        case 'disease':
          return (a.disease || '').localeCompare(b.disease || '');
        case 'herbalPlant':
          return (a.herbalPlant || '').localeCompare(b.herbalPlant || '');
        default:
          return 0;
      }
    });
  };

  if (loading) {
    return (
      <Container sx={{ py: 4, mt: 8, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4, mt: 8 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4, mt: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Diseases & Treatments
      </Typography>
      
      <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Search Diseases"
          variant="outlined"
          value={searchQuery}
          onChange={handleSearch}
          sx={{ 
            minWidth: { xs: '100%', sm: 300 },
            '& .MuiOutlinedInput-root': { '&:hover fieldset': { borderColor: '#2e7d32' } }
          }}
        />
        <FormControl sx={{ minWidth: { xs: '100%', sm: 200 } }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortBy}
            label="Sort By"
            onChange={handleSort}
          >
            <MenuItem value="disease">Disease Name</MenuItem>
            <MenuItem value="herbalPlant">Herbal Plant</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={4}>
        {filteredDiseases.map((disease) => (
          <Grid item xs={12} sm={6} md={4} key={disease.id}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2">
                  {disease.disease}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  <strong>Herbal Plant:</strong> {disease.herbalPlant}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  <strong>Preparation Method:</strong> {disease.preparationMethod}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  <strong>Dosage:</strong> {disease.dosage}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Possible Reactions:</strong> {disease.possibleReactions}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default DiseasePage; 