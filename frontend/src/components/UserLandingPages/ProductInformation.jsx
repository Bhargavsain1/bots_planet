import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const ProductInformation = () => (
  <Paper elevation={2} sx={{ p: 4, background: '#fff' }}>
    <Typography variant="h4" color="primary" gutterBottom>Product Information</Typography>
    <Typography variant="body1">Define and analyze your products for better insights. Add your functionality here.</Typography>
  </Paper>
);

export default ProductInformation; 