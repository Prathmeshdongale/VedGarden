import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, IconButton, Alert } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import { auth, db, googleProvider } from '../../firebase/config';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { uploadImage } from '../../config/cloudinary';

const Auth = ({ onClose, onLoginSuccess }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const imageUrl = await uploadImage(file);
      setImage(imageUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const createUserProfile = async (user, additionalData = {}) => {
    try {
      console.log('Creating user profile for:', user.uid);
      
      // Create a reference to the user's document
      const userDocRef = doc(db, 'users', user.uid);
      
      // Check if the document already exists
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        // Create the user document with initial data
        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || additionalData.name || user.email.split('@')[0],
          photoURL: user.photoURL || image || '',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          name: additionalData.name || '',
          phone: additionalData.phone || '',
          ...additionalData
        };

        console.log('Creating user profile with data:', userData);
        
        try {
          await setDoc(userDocRef, userData);
          console.log('User profile created successfully in Firestore');
          
          // Verify the document was created
          const verifyDoc = await getDoc(userDocRef);
          if (verifyDoc.exists()) {
            console.log('Verified user document exists:', verifyDoc.data());
          } else {
            console.error('User document verification failed');
          }
        } catch (firestoreError) {
          console.error('Firestore error during user creation:', firestoreError);
          throw new Error(`Failed to create user profile: ${firestoreError.message}`);
        }
      } else {
        console.log('User profile already exists, updating last login time');
        // Update last login time for existing users
        await setDoc(userDocRef, {
          lastLoginAt: new Date().toISOString()
        }, { merge: true });
        console.log('User profile updated successfully');
      }
    } catch (error) {
      console.error('Error in createUserProfile:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Validate form data
      if (!formData.email || !formData.password) {
        throw new Error('Email and password are required');
      }

      if (!isLogin && formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (!isLogin && formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      let userCredential;
      if (isLogin) {
        // Login
        console.log('Attempting to login user:', formData.email);
        userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
        console.log('User logged in successfully:', userCredential.user.uid);
      } else {
        // Register
        console.log('Attempting to register new user:', formData.email);
        userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        console.log('User created in Authentication:', userCredential.user.uid);
      }

      // Create/update user profile in Firestore
      console.log('Creating/updating user profile in Firestore');
      await createUserProfile(userCredential.user, {
        name: formData.name,
        phone: formData.phone,
        profileImage: image
      });

      if (onLoginSuccess) {
        onLoginSuccess(true);
      }
      if (onClose) {
        onClose();
      }
      navigate('/form'); 
      
      setSuccess('Registration successful!');
      setFormData({
        email: '',
        password: '',
        name: '',
        phone: ''
      });
      setImage(null);
    } catch (error) {
      console.error('Error during registration/login:', error);
      let errorMessage = 'An error occurred. Please try again.';
      
      // Handle specific Firebase errors
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please login instead.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.';
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Attempting Google sign in...');
      const result = await signInWithPopup(auth, googleProvider);
      console.log('Google sign in successful:', result.user.uid);
      
      // Create user profile in Firestore
      await createUserProfile(result.user);
      
      if (onLoginSuccess) {
        onLoginSuccess(true);
      }
      if (onClose) {
        onClose();
      }
      navigate('/form'); 
      
    } catch (error) {
      console.error('Error during Google sign in:', error);
      let errorMessage = 'Failed to sign in with Google. Please try again.';
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign in was cancelled. Please try again.';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked. Please allow popups for this site.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto', mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">{isLogin ? 'Login' : 'Register'}</Typography>
        {onClose && (
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        )}
      </Box>

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

      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              margin="normal"
            />
            <input
              accept="image/*"
              type="file"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
              id="profile-image-upload"
            />
            <label htmlFor="profile-image-upload">
              <Button
                component="span"
                variant="outlined"
                fullWidth
                sx={{ mt: 2 }}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Upload Profile Image'}
              </Button>
            </label>
          </>
        )}

        <TextField
          fullWidth
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          margin="normal"
          required
        />

        <TextField
          fullWidth
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          margin="normal"
          required
        />

        {!isLogin && (
          <TextField
            fullWidth
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            margin="normal"
            required
          />
        )}

        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ mt: 3 }}
          disabled={loading}
        >
          {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
        </Button>

        <Button
          variant="outlined"
          fullWidth
          sx={{ mt: 2 }}
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Sign in with Google'}
        </Button>

        <Button
          fullWidth
          sx={{ mt: 2 }}
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
        </Button>
      </form>
    </Paper>
  );
};

export default Auth; 