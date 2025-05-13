import React from 'react';
import { Paper, Typography, Grid, TextField, FormLabel } from '@mui/material';

const BuyerProfile = () => (
  <Paper elevation={3} sx={{ p: 3, m: 3 }}>
    <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>Buyer Profile</Typography>
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}><FormLabel>Name</FormLabel><TextField fullWidth /></Grid>
      <Grid item xs={12} md={4}><FormLabel>Email</FormLabel><TextField fullWidth /></Grid>
      <Grid item xs={12} md={4}><FormLabel>Phone Number</FormLabel><TextField fullWidth /></Grid>
      <Grid item xs={12} md={4}><FormLabel>Job Title</FormLabel><TextField fullWidth /></Grid>
      <Grid item xs={12} md={4}><FormLabel>Company Name</FormLabel><TextField fullWidth /></Grid>
      <Grid item xs={12} md={4}><FormLabel>Industry/Business Size</FormLabel><TextField fullWidth /></Grid>
      <Grid item xs={12} md={4}><FormLabel>Interests/Intent</FormLabel><TextField fullWidth /></Grid>
      <Grid item xs={12} md={4}><FormLabel>Source of Lead</FormLabel><TextField fullWidth /></Grid>
      <Grid item xs={12} md={4}><FormLabel>Address</FormLabel><TextField fullWidth /></Grid>
      <Grid item xs={12} md={4}><FormLabel>Country</FormLabel><TextField fullWidth /></Grid>
      <Grid item xs={12} md={4}><FormLabel>LinkedIn Profile</FormLabel><TextField fullWidth /></Grid>
    </Grid>
  </Paper>
);

export default BuyerProfile; 