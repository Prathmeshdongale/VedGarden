import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import {
  Container,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  FormControlLabel,
  Checkbox,
  Alert
} from '@mui/material';

export default function Form() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userName: '',
    patientName: '',
    email: '',
    phone: '',
    gender: '',
    age: '',
    hasDisease: false,
    disease: '',
    duration: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }
      
      const docRef = doc(db, 'users', currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().age) {
        navigate('/'); // Already filled form, go to home
      } else {
        setLoading(false);
        // Pre-fill email if available
        if (currentUser.email) {
          setFormData(prev => ({
            ...prev,
            email: currentUser.email,
            userName: currentUser.displayName || ''
          }));
        }
      }
    };
    fetchData();
  }, [currentUser, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.userName || !formData.patientName || !formData.email || !formData.gender || !formData.age) {
      setError('Please fill all required fields');
      return;
    }
    try {
      await setDoc(doc(db, 'users', currentUser.uid), {
        ...formData,
        uid: currentUser.uid
      }, { merge: true });
      // After successful form submission, redirect to home page
      navigate('/');
    } catch (err) {
      console.error('Error saving user info:', err);
      setError('Failed to save data.');
    }
  };

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Complete Your Profile
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField fullWidth label="Your Name" name="userName" value={formData.userName} onChange={handleChange} margin="normal" required />
          <TextField fullWidth label="Patient Name" name="patientName" value={formData.patientName} onChange={handleChange} margin="normal" required />
          <TextField fullWidth label="Email" name="email" value={formData.email} onChange={handleChange} margin="normal" required />
          <TextField fullWidth label="Phone" name="phone" value={formData.phone} onChange={handleChange} margin="normal" />
          <FormControl fullWidth margin="normal">
            <InputLabel>Gender</InputLabel>
            <Select name="gender" value={formData.gender} onChange={handleChange} required>
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
          <TextField fullWidth label="Age" name="age" value={formData.age} onChange={handleChange} margin="normal" required />
          <FormControlLabel
            control={<Checkbox checked={formData.hasDisease} onChange={handleChange} name="hasDisease" />}
            label="Are you suffering from any disease or infection?"
          />
          {formData.hasDisease && (
            <>
              <TextField fullWidth label="Disease/Infection" name="disease" value={formData.disease} onChange={handleChange} margin="normal" />
              <TextField fullWidth label="Suffering Duration (e.g., 1 week)" name="duration" value={formData.duration} onChange={handleChange} margin="normal" />
            </>
          )}
          <Button type="submit" variant="contained" color="success" fullWidth sx={{ mt: 3 }}>
            Submit
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}