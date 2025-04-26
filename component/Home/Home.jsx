import React from 'react';
import { Typography, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../../assets/Backgroung.png';

const Home = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <img
        src={backgroundImage}
        alt="VedGarden Background"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 1
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          p: 4
        }}
      >
        <Typography
          variant="h1"
          component="h1"
          sx={{
            color: 'white',
            fontWeight: 'bold',
            mb: 4,
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
          }}
        >
          Welcome to VedGarden
        </Typography>
        <Typography
          variant="h5"
          component="h2"
          sx={{
            color: 'white',
            mb: 4,
            textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
          }}
        >
          Discover the world of medicinal plants and their healing properties
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/plants')}
            sx={{
              bgcolor: '#2e7d32',
              '&:hover': { bgcolor: '#1b5e20' }
            }}
          >
            Explore Plants
          </Button>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/diseases')}
            sx={{
              bgcolor: '#2e7d32',
              '&:hover': { bgcolor: '#1b5e20' }
            }}
          >
            Explore Diseases
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Home; 