import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  Paper,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import { loadDiseaseData } from '../../data/csvData';

const SymptomChecker = () => {
  const [symptomInput, setSymptomInput] = useState('');
  const [possibleDiseases, setPossibleDiseases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [diseases, setDiseases] = useState([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);

  useEffect(() => {
    const fetchDiseases = async () => {
      try {
        setLoading(true);
        const data = await loadDiseaseData();
        console.log('Loaded disease data:', data);
        setDiseases(data);
      } catch (err) {
        setError('Failed to load disease data. Please try again later.');
        console.error('Error loading diseases:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDiseases();
  }, []);

  const handleSymptomInput = (event) => {
    setSymptomInput(event.target.value);
  };

  const handleAddSymptom = () => {
    if (symptomInput.trim() && !selectedSymptoms.includes(symptomInput.trim())) {
      setSelectedSymptoms([...selectedSymptoms, symptomInput.trim()]);
      setSymptomInput('');
    }
  };

  const handleRemoveSymptom = (symptomToRemove) => {
    setSelectedSymptoms(selectedSymptoms.filter(symptom => symptom !== symptomToRemove));
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddSymptom();
    }
  };

  const checkSymptoms = () => {
    if (selectedSymptoms.length === 0) {
      setError('Please add at least one symptom');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Convert user-entered symptoms to lowercase for case-insensitive matching
      const symptomsLower = selectedSymptoms.map(s => s.toLowerCase().trim());
      
      // Find diseases that match the symptoms
      const matchingDiseases = diseases.map(disease => {
        if (!disease || !disease.disease) {
          return null;
        }
        
        // Get disease symptoms and convert to lowercase
        const diseaseSymptoms = disease.disease.toLowerCase();
        
        // Count how many of the selected symptoms match this disease
        let matchCount = 0;
        symptomsLower.forEach(symptom => {
          if (diseaseSymptoms.includes(symptom)) {
            matchCount++;
          }
        });
        
        // Only return diseases with at least one matching symptom
        if (matchCount > 0) {
          return {
            ...disease,
            matchCount: matchCount,
            totalSymptoms: selectedSymptoms.length,
            matchPercentage: Math.round((matchCount / selectedSymptoms.length) * 100)
          };
        }
        
        return null;
      }).filter(Boolean); // Remove null entries
      
      // Sort by match count (highest first)
      matchingDiseases.sort((a, b) => b.matchCount - a.matchCount);
      
      setPossibleDiseases(matchingDiseases);
      
      if (matchingDiseases.length === 0) {
        setError('No matching diseases found. Try different symptoms.');
      }
    } catch (err) {
      setError('Error processing symptoms. Please try again.');
      console.error('Error in symptom checking:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Disease Symptom Checker
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Enter Disease Symptoms
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            label="Add a symptom"
            value={symptomInput}
            onChange={handleSymptomInput}
            onKeyPress={handleKeyPress}
            variant="outlined"
            placeholder="e.g., respiratory issues, cough, cold"
          />
          <Button
            variant="contained"
            onClick={handleAddSymptom}
            sx={{ 
              minWidth: 120,
              bgcolor: '#2e7d32',
              '&:hover': {
                bgcolor: '#1b5e20',
              }
            }}
          >
            Add
          </Button>
        </Box>

        <Box sx={{ mb: 3 }}>
          {selectedSymptoms.map((symptom, index) => (
            <Chip
              key={index}
              label={symptom}
              onDelete={() => handleRemoveSymptom(symptom)}
              sx={{ m: 0.5 }}
            />
          ))}
        </Box>

        <Button
          variant="contained"
          onClick={checkSymptoms}
          disabled={selectedSymptoms.length === 0 || loading}
          fullWidth
          sx={{ 
            bgcolor: '#2e7d32',
            '&:hover': {
              bgcolor: '#1b5e20',
            }
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Check Symptoms'}
        </Button>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {possibleDiseases.length > 0 && (
        <>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Matching Results
          </Typography>
          <Grid container spacing={3}>
            {possibleDiseases.map((disease, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
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
                    <Typography variant="h6" color="primary" gutterBottom>
                      {disease.herbalPlant}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>Matches:</strong> {disease.matchCount}/{selectedSymptoms.length} ({disease.matchPercentage}%)
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>Symptoms:</strong> {disease.disease}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>Preparation Method:</strong> {disease.preparationMethod}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
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
        </>
      )}

      {possibleDiseases.length === 0 && !loading && !error && (
        <Alert severity="info">
          No matching diseases found. Try adding more symptoms or check your spelling.
        </Alert>
      )}
    </Container>
  );
};

export default SymptomChecker;