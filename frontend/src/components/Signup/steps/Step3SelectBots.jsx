import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Checkbox,
  FormControlLabel,
  Alert,
  IconButton,
  TextField,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import axios from "axios";

const Step3SelectBots = ({ onNext, onBack, data }) => {
  const [bots, setBots] = useState([]);
  const [selected, setSelected] = useState(data.selectedBots || []);
  const [quantities, setQuantities] = useState(data.botQuantities || {});
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBots = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/bot_types");
        console.log("response", response);
        setBots(response.data);
      } catch (error) {
        console.error("Error fetching bots:", error);
      }
    };
    fetchBots();
  }, []);

  const handleSelect = (botTypeId) => {
    const isCurrentlySelected = selected.includes(botTypeId);

    setSelected((prev) => {
      if (isCurrentlySelected) {
        return prev.filter((id) => id !== botTypeId);
      } else {
        return [...prev, botTypeId];
      }
    });

    setQuantities((prev) => {
      const newQuantities = { ...prev };
      if (isCurrentlySelected) {
        delete newQuantities[botTypeId];
      } else {
        newQuantities[botTypeId] = 1;
      }
      return newQuantities;
    });
  };

  const handleQuantityChange = (botTypeId, value) => {
    if (value >= 1) {
      setQuantities((prev) => ({ ...prev, [botTypeId]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selected.length === 0) {
      setError("Please select at least one bot.");
      return;
    }
    setError("");

    const selectedBotDetails = selected.map((botTypeId) => {
      const bot = bots.find((b) => b.botTypeId === botTypeId);
      return {
        id: botTypeId,
        name: bot ? bot.botType : botTypeId, // Use bot name if found, otherwise use ID
        quantity: quantities[botTypeId] || 1,
      };
    });

    localStorage.removeItem("selectedBotsData");
    localStorage.setItem(
      "selectedBotsData",
      JSON.stringify({
        selectedBots: selectedBotDetails,
        botQuantities: quantities,
      })
    );
    // Pass selectedBotDetails instead of mappedSelected
    onNext({ selectedBots: selectedBotDetails, botQuantities: quantities });
  };

  const total = selected.reduce((sum, botTypeId) => {
    const bot = bots.find((b) => b.botTypeId === botTypeId);
    const quantity = quantities[botTypeId] || 1;
    return sum + (bot ? bot.cost * quantity : 0);
  }, 0);

  return (
    <form onSubmit={handleSubmit}>
      <Typography variant="h6" gutterBottom>
        Select Bots
      </Typography>
      <Grid container spacing={2}>
        {bots.map((bot) => (
          <Grid xs={12} sm={6} key={bot.botTypeId}>
            <Card
              variant={
                selected.includes(bot.botTypeId) ? "elevation" : "outlined"
              }
              sx={{
                borderColor: selected.includes(bot.botTypeId)
                  ? "primary.main"
                  : "grey.300",
                boxShadow: selected.includes(bot.botTypeId) ? 4 : 0,
              }}
            >
              <CardContent>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selected.includes(bot.botTypeId)}
                      onChange={() => handleSelect(bot.botTypeId)}
                    />
                  }
                  label={
                    <Typography variant="subtitle1" fontWeight={600}>
                      {bot.botType}
                    </Typography>
                  }
                />
                <Typography variant="body2" color="text.secondary">
                  ${bot.cost}/month
                </Typography>
                {bot.trial && (
                  <Typography variant="caption" color="success.main">
                    Trial available
                  </Typography>
                )}
                {!bot.trial && (
                  <Typography variant="caption" color="warning.main">
                    No free trial
                  </Typography>
                )}
                {selected.includes(bot.botTypeId) && (
                  <Box display="flex" alignItems="center" mt={1}>
                    <IconButton
                      size="small"
                      onClick={() =>
                        handleQuantityChange(
                          bot.botTypeId,
                          (quantities[bot.botTypeId] || 1) - 1
                        )
                      }
                    >
                      <RemoveIcon />
                    </IconButton>
                    <TextField
                      size="small"
                      type="number"
                      value={quantities[bot.botTypeId] || 1}
                      onChange={(e) =>
                        handleQuantityChange(
                          bot.botTypeId,
                          parseInt(e.target.value)
                        )
                      }
                      inputProps={{ min: 1 }}
                      sx={{ width: "60px", mx: 1 }}
                    />
                    <IconButton
                      size="small"
                      onClick={() =>
                        handleQuantityChange(
                          bot.botTypeId,
                          (quantities[bot.botTypeId] || 1) + 1
                        )
                      }
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Box mt={2}>
        <Typography variant="subtitle2">
          Pricing Summary: <b>${total}/month</b>
        </Typography>
      </Box>
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      <Box mt={3} display="flex" justifyContent="space-between">
        <Button variant="outlined" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" variant="contained" color="primary">
          continue{" "}
        </Button>
      </Box>
    </form>
  );
};

export default Step3SelectBots;
