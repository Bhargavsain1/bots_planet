import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useAuth } from '../context/AuthContext';
import '../styles/Dashboard.css';
import { useNavigate } from 'react-router-dom';

// Bot categories from Step3SelectBots
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

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [purchasedBots, setPurchasedBots] = useState([]);
  const [newAssignment, setNewAssignment] = useState({
    person: '',
    botType: '',
  });
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedBot, setSelectedBot] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Get the selected bots from localStorage (set during Step3SelectBots)
        const selectedBotsData = JSON.parse(localStorage.getItem('selectedBotsData') || '{}');
        const selectedBots = selectedBotsData.selectedBots || [];
        const botQuantities = selectedBotsData.botQuantities || {};

        // Create purchased bots array from the selected bots
        const purchasedBotsArray = selectedBots.map(botKey => {
          // Find the bot details from botCategories
          let botDetails = null;
          for (const category of botCategories) {
            const foundBot = category.bots.find(b => b.key === botKey);
            if (foundBot) {
              botDetails = foundBot;
              break;
            }
          }

          if (!botDetails) return null;

          return {
            id: botKey,
            name: botDetails.name,
            type: botKey,
            totalQuantity: botQuantities[botKey] || 1,
            assignedQuantity: 0,
            price: botDetails.price,
            status: 'inactive',
            assignments: [],
            category: botDetails.category
          };
        }).filter(Boolean); // Remove any null entries
        
        setPurchasedBots(purchasedBotsArray);
        setLoading(false);
      } catch (err) {
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAssignBot = (bot) => {
    if (bot.assignedQuantity >= bot.totalQuantity) {
      setError('All bots of this type have been assigned');
      return;
    }
    setSelectedBot(bot);
    setShowAssignDialog(true);
  };

  const handleUnassignBot = (botId, assignmentId) => {
    setPurchasedBots(bots => bots.map(bot => {
      if (bot.id === botId) {
        const updatedAssignments = bot.assignments.filter(a => a.id !== assignmentId);
        return {
          ...bot,
          assignedQuantity: updatedAssignments.length,
          status: updatedAssignments.length === 0 ? 'inactive' : 'active',
          assignments: updatedAssignments
        };
      }
      return bot;
    }));
  };

  const handleAssignSubmit = () => {
    if (!newAssignment.person) {
      setError('Please enter a user name');
      return;
    }

    setPurchasedBots(bots => bots.map(bot => {
      if (bot.id === selectedBot.id) {
        const newAssignmentObj = {
          id: Date.now(),
          person: newAssignment.person,
          assignedAt: new Date().toISOString().split('T')[0]
        };
        return {
          ...bot,
          assignedQuantity: bot.assignedQuantity + 1,
          status: 'active',
          assignments: [...bot.assignments, newAssignmentObj]
        };
      }
      return bot;
    }));

    setShowAssignDialog(false);
    setNewAssignment({ person: '', botType: '' });
    setError('');
  };

  const calculateTotalValue = () => {
    return purchasedBots.reduce((total, bot) => total + (bot.price * bot.totalQuantity), 0);
  };

  const anyAssigned = purchasedBots.some(bot => bot.assignedQuantity > 0);

  if (loading) {
    return (
      <Box className="dashboard-container" display="flex" justifyContent="center" alignItems="center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="dashboard-container">
      <Box className="dashboard-header">
        <Typography className="dashboard-title">
          Welcome, {user?.email || 'User'}
        </Typography>
        <Typography className="dashboard-subtitle">
          Manage your bot inventory and assignments
        </Typography>
      </Box>

      <Box className="dashboard-stats">
        <Box className="stat-card">
          <Typography className="stat-title">Total Bot Licenses</Typography>
          <Typography className="stat-value">
            {purchasedBots.reduce((total, bot) => total + bot.totalQuantity, 0)}
          </Typography>
        </Box>
        <Box className="stat-card">
          <Typography className="stat-title">Assigned Bots</Typography>
          <Typography className="stat-value">
            {purchasedBots.reduce((total, bot) => total + bot.assignedQuantity, 0)}
          </Typography>
        </Box>
        <Box className="stat-card">
          <Typography className="stat-title">Available for Assignment</Typography>
          <Typography className="stat-value">
            {purchasedBots.reduce((total, bot) => total + (bot.totalQuantity - bot.assignedQuantity), 0)}
          </Typography>
        </Box>
        <Box className="stat-card">
          <Typography className="stat-title">Total Value</Typography>
          <Typography className="stat-value">
            ${calculateTotalValue()}/mo
          </Typography>
        </Box>
      </Box>

      <Box className="bot-grid">
        {purchasedBots.map((bot) => (
          <Box key={bot.id} className="bot-card">
            <Box className="bot-header">
              <Typography className="bot-name">{bot.name}</Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Chip 
                  label={`${bot.assignedQuantity}/${bot.totalQuantity} Assigned`}
                  color={bot.assignedQuantity === bot.totalQuantity ? "success" : "primary"}
                  size="small"
                />
                <Tooltip title={`${bot.category} - ${bot.trial ? 'Trial Available' : 'No Trial'}`}>
                  <IconButton size="small">
                    <InfoIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            <Box className="bot-details">
              <Box className="bot-detail-item">
                <Typography>Type:</Typography>
                <Typography>{bot.type}</Typography>
              </Box>
              <Box className="bot-detail-item">
                <Typography>Price per License:</Typography>
                <Typography>${bot.price}/mo</Typography>
              </Box>
              <Box className="bot-detail-item">
                <Typography>Total Value:</Typography>
                <Typography>${bot.price * bot.totalQuantity}/mo</Typography>
              </Box>
            </Box>
            
            {bot.assignments.length > 0 && (
              <Box className="assignments-list">
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Current Assignments:</Typography>
                {bot.assignments.map((assignment) => (
                  <Box key={assignment.id} className="assignment-item">
                    <Typography variant="body2">{assignment.person}</Typography>
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Assigned: {assignment.assignedAt}
                      </Typography>
                      <IconButton 
                        size="small" 
                        onClick={() => handleUnassignBot(bot.id, assignment.id)}
                        color="error"
                      >
                        <AssignmentIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}

            <Box className="bot-actions">
              {bot.assignedQuantity < bot.totalQuantity ? (
                <Button
                  className="action-button primary-action"
                  onClick={() => handleAssignBot(bot)}
                  startIcon={<AssignmentIcon />}
                >
                  Assign Bot
                </Button>
              ) : (
                <Button
                  className="action-button secondary-action"
                  disabled
                >
                  All Bots Assigned
                </Button>
              )}
            </Box>
          </Box>
        ))}
      </Box>

      <Dialog open={showAssignDialog} onClose={() => setShowAssignDialog(false)}>
        <DialogTitle>Assign Bot</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Assigning {selectedBot?.name} ({selectedBot?.assignedQuantity + 1} of {selectedBot?.totalQuantity})
            </Typography>
            <TextField
              label="User Name/User ID"
              value={newAssignment.person}
              onChange={(e) => setNewAssignment({ ...newAssignment, person: e.target.value })}
              fullWidth
              margin="normal"
            />
          </Box>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAssignDialog(false)}>Cancel</Button>
          <Button onClick={handleAssignSubmit} variant="contained" color="primary">
            Assign
          </Button>
        </DialogActions>
      </Dialog>
      <Box mt={4} display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          color="primary"
          size="large"
          disabled={!anyAssigned}
          onClick={() => navigate('/userlanding')}
        >
          Submit
        </Button>
      </Box>
    </Box>
  );
};

export default Dashboard;
