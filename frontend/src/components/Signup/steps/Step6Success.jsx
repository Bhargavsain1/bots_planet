import React, { useEffect, useRef } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios'

const Step6Success = ({ data }) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const didRunRef = useRef(false);

  useEffect(() => {
    if (didRunRef.current) return;        // <-- prevent 2nd run in StrictMode
    didRunRef.current = true;
        
    const completeSignup = async () => {
      try {
        const registrationData = {
          name: data.adminName,
          email: data.corporateEmail,
          password: data.password
        }
        
        await axios.post('http://localhost:5000/api/auth/register', registrationData)

        // Log the user in
        await login(registrationData.email, registrationData.password);
        
        // Redirect to dashboard
        navigate('/dashboard');
      } catch (error) {
        console.error('Signup failed:', error);
      }
    };

    completeSignup();
  }, [data, login, navigate]);

  return (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <CircularProgress size={60} sx={{ mb: 3 }} />
      <Typography variant="h5" gutterBottom>
        Completing Your Registration
      </Typography>
      <Typography color="textSecondary">
        Please wait while we set up your account...
      </Typography>
    </Box>
  );
};

export default Step6Success; 