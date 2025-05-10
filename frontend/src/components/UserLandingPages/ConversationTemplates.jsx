import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const ConversationTemplates = () => (
  <Paper elevation={2} sx={{ p: 4, background: '#fff' }}>
    <Typography variant="h4" color="primary" gutterBottom>Conversation Templates</Typography>
    <Typography variant="body1">Manage templates for customer conversations. Add your functionality here.</Typography>
  </Paper>
);

export default ConversationTemplates; 