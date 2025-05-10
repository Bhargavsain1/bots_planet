import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, CardActions, Button, Grid, Checkbox, FormControlLabel, Alert, IconButton, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
 
const botCategories = [
  {
    category: 'Sales Bot',
    bots: [
      { key: 'sales', name: 'Sales', price: 50, trial: true },
      { key: 'marketing', name: 'Marketing', price: 50, trial: true },
      { key: 'admin', name: 'Admin', price: 50, trial: true },
      { key: 'content', name: 'Content', price: 50, trial: false },
    ],
  },
  {
    category: 'Enterprises Bot',
    bots: [
      { key: 'admin_enterprise', name: 'Admin', price: 30, trial: true },
      { key: 'xyz1', name: 'XYZ', price: 20, trial: true },
      { key: 'xyz2', name: 'XYZ', price: 30, trial: true },
    ],
  },
  {
    category: 'XYZ Bot',
    bots: [
      { key: 'xyz3', name: 'XYZ', price: 60, trial: false },
      { key: 'xyz4', name: 'XYZ', price: 60, trial: false },
    ],
  },
];
 
const Step3SelectBots = ({ onNext, onBack, data }) => {
  const [selected, setSelected] = useState(data.selectedBots || []);
  const [quantities, setQuantities] = useState(data.botQuantities || {});
  const [error, setError] = useState('');
 
  const handleSelect = (key) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
    if (!selected.includes(key)) {
      setQuantities((prev) => ({ ...prev, [key]: 1 }));
    } else {
      setQuantities((prev) => {
        const newQuantities = { ...prev };
        delete newQuantities[key];
        return newQuantities;
      });
    }
  };
 
  const handleQuantityChange = (key, value) => {
    if (value >= 1) {
      setQuantities((prev) => ({ ...prev, [key]: value }));
    }
  };
 
  const handleSubmit = (e) => {
    e.preventDefault();
    if (selected.length === 0) {
      setError('Please select at least one bot.');
      return;
    }
    setError('');
    
    // Save selected bots data to localStorage
    const selectedBotsData = {
      selectedBots: selected,
      botQuantities: quantities
    };
    localStorage.setItem('selectedBotsData', JSON.stringify(selectedBotsData));
    
    onNext({ selectedBots: selected, botQuantities: quantities });
  };
 
  const total = selected.reduce((sum, key) => {
    const bot = botCategories.flatMap((cat) => cat.bots).find((b) => b.key === key);
    const quantity = quantities[key] || 1;
    return sum + (bot ? bot.price * quantity : 0);
  }, 0);
 
  return (
    <form onSubmit={handleSubmit}>
      <Typography variant="h6" gutterBottom>Select Bots</Typography>
      {botCategories.map((category) => (
        <Box key={category.category} mb={3}>
          <Typography variant="subtitle1" gutterBottom>{category.category}</Typography>
          <Grid container spacing={2}>
            {category.bots.map((bot) => (
              <Grid item xs={12} sm={6} key={bot.key}>
                <Card
                  variant={selected.includes(bot.key) ? 'elevation' : 'outlined'}
                  sx={{
                    borderColor: selected.includes(bot.key) ? 'primary.main' : 'grey.300',
                    boxShadow: selected.includes(bot.key) ? 4 : 0,
                  }}
                >
                  <CardContent>
                    <FormControlLabel
                      control={<Checkbox checked={selected.includes(bot.key)} onChange={() => handleSelect(bot.key)} />}
                      label={<Typography variant="subtitle1" fontWeight={600}>{bot.name}</Typography>}
                    />
                    <Typography variant="body2" color="text.secondary">${bot.price}/month</Typography>
                    {bot.trial && <Typography variant="caption" color="success.main">Trial available</Typography>}
                    {!bot.trial && <Typography variant="caption" color="warning.main">No free trial</Typography>}
                    {selected.includes(bot.key) && (
                      <Box display="flex" alignItems="center" mt={1}>
                        <IconButton size="small" onClick={() => handleQuantityChange(bot.key, (quantities[bot.key] || 1) - 1)}>
                          <RemoveIcon />
                        </IconButton>
                        <TextField
                          size="small"
                          type="number"
                          value={quantities[bot.key] || 1}
                          onChange={(e) => handleQuantityChange(bot.key, parseInt(e.target.value))}
                          inputProps={{ min: 1 }}
                          sx={{ width: '60px', mx: 1 }}
                        />
                        <IconButton size="small" onClick={() => handleQuantityChange(bot.key, (quantities[bot.key] || 1) + 1)}>
                          <AddIcon />
                        </IconButton>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}
      <Box mt={2}>
        <Typography variant="subtitle2">Pricing Summary: <b>${total}/month</b></Typography>
      </Box>
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      <Box mt={3} display="flex" justifyContent="space-between">
        <Button variant="outlined" onClick={onBack}>Back</Button>
        <Button type="submit" variant="contained" color="primary">Proceed to Payment</Button>
      </Box>
    </form>
  );
};
 
export default Step3SelectBots;
 