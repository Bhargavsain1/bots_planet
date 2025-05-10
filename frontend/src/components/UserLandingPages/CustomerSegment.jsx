import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  RadioGroup,
  FormControlLabel,
  Radio,
  IconButton,
  Tooltip,
  Divider,
  Alert,
  Autocomplete,
  Stack,
  Link,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LinkIcon from '@mui/icons-material/Link';
 
// Comprehensive industry list
const industries = [
  'Technology', 'Finance', 'Healthcare', 'Retail', 'Manufacturing', 'Education',
  'Real Estate', 'Construction', 'Transportation', 'Energy', 'Telecommunications',
  'Media & Entertainment', 'Hospitality', 'Agriculture', 'Mining', 'Pharmaceuticals',
  'Biotechnology', 'Insurance', 'Legal Services', 'Consulting', 'Other'
];
 
// Detailed company size ranges
const companySizes = [
  '1-10 employees',
  '11-50 employees',
  '51-200 employees',
  '201-500 employees',
  '501-1000 employees',
  '1001-5000 employees',
  '5001-10000 employees',
  '10000+ employees'
];
 
// Comprehensive revenue ranges
const revenueRanges = [
  'Less than $1M',
  '$1M - $5M',
  '$5M - $10M',
  '$10M - $50M',
  '$50M - $100M',
  '$100M - $500M',
  '$500M - $1B',
  'More than $1B'
];
 
// Detailed regions
const regions = [
  'North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East', 'Africa',
  'United States', 'Canada', 'Mexico', 'United Kingdom', 'Germany', 'France',
  'China', 'Japan', 'India', 'Australia', 'Brazil', 'South Africa'
];
 
const planTypes = ['Free', 'Premium', 'Enterprise', 'Custom'];
const engagementLevels = ['High', 'Medium', 'Low'];
const businessModels = ['B2B', 'B2C', 'B2G', 'C2C', 'Hybrid'];
const companyTypes = ['Public', 'Private', 'Non-Profit', 'Government', 'Startup'];
const technologyAdoption = ['Early Adopter', 'Mainstream', 'Late Adopter', 'Resistant'];
 
const CustomerSegment = () => {
  const [segmentName, setSegmentName] = useState('');
  const [description, setDescription] = useState('');
  const [matchLogic, setMatchLogic] = useState('all');
  const [rules, setRules] = useState([]);
  const [previewCount, setPreviewCount] = useState(0);
  const [error, setError] = useState('');
  const [documents, setDocuments] = useState([]);
  const [urls, setUrls] = useState([]);
  const [newUrl, setNewUrl] = useState('');
  const [segments, setSegments] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
 
  const [newRule, setNewRule] = useState({
    attribute: '',
    operator: '',
    value: '',
  });
 
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newDocuments = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      type: file.type,
      size: file.size,
      file: file
    }));
    setDocuments([...documents, ...newDocuments]);
  };
 
  const handleDeleteDocument = (docId) => {
    setDocuments(documents.filter(doc => doc.id !== docId));
  };
 
  const handleAddUrl = () => {
    if (newUrl && !urls.includes(newUrl)) {
      setUrls([...urls, newUrl]);
      setNewUrl('');
    }
  };
 
  const handleDeleteUrl = (urlToDelete) => {
    setUrls(urls.filter(url => url !== urlToDelete));
  };
 
  const handleAddRule = () => {
    if (!newRule.attribute || !newRule.operator || !newRule.value) {
      setError('Please fill in all rule fields');
      return;
    }
    setRules([...rules, { ...newRule, id: Date.now() }]);
    setNewRule({ attribute: '', operator: '', value: '' });
    setError('');
    setPreviewCount(Math.floor(Math.random() * 100));
  };
 
  const handleDeleteRule = (ruleId) => {
    setRules(rules.filter(rule => rule.id !== ruleId));
    setPreviewCount(Math.floor(Math.random() * 100));
  };
 
  const handleSave = () => {
    if (!segmentName) {
      setError('Please enter a segment name');
      return;
    }
    if (rules.length === 0) {
      setError('Please add at least one rule');
      return;
    }
    const segmentData = {
      segmentName,
      description,
      matchLogic,
      rules,
      documents,
      urls,
      id: editIndex !== null ? segments[editIndex].id : Date.now(),
    };
    if (editIndex !== null) {
      // Edit existing
      const updated = [...segments];
      updated[editIndex] = segmentData;
      setSegments(updated);
      setEditIndex(null);
    } else {
      setSegments([...segments, segmentData]);
    }
    setSegmentName('');
    setDescription('');
    setMatchLogic('all');
    setRules([]);
    setDocuments([]);
    setUrls([]);
    setNewUrl('');
    setError('');
  };
 
  const handleEditSegment = (idx) => {
    const seg = segments[idx];
    setSegmentName(seg.segmentName);
    setDescription(seg.description);
    setMatchLogic(seg.matchLogic);
    setRules(seg.rules);
    setDocuments(seg.documents);
    setUrls(seg.urls);
    setEditIndex(idx);
    setError('');
  };
 
  const handleDeleteSegment = (idx) => {
    setSegments(segments.filter((_, i) => i !== idx));
    if (editIndex === idx) {
      setEditIndex(null);
      setSegmentName('');
      setDescription('');
      setMatchLogic('all');
      setRules([]);
      setDocuments([]);
      setUrls([]);
      setNewUrl('');
    }
  };
 
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" color="primary" gutterBottom>
        Customer Segment
      </Typography>
     
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Segment Name"
              value={segmentName}
              onChange={(e) => setSegmentName(e.target.value)}
              required
              helperText="Enter a name to identify this segment"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={3}
              helperText="Optional: Add notes about this segment's strategy"
            />
          </Grid>
        </Grid>
      </Paper>
 
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Segment Rules
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Define the criteria for this segment using organization-level attributes
        </Typography>
 
        <Box sx={{ mb: 3 }}>
          <FormControl component="fieldset">
            <Typography variant="subtitle2" gutterBottom>
              Match Logic
            </Typography>
            <RadioGroup
              row
              value={matchLogic}
              onChange={(e) => setMatchLogic(e.target.value)}
            >
              <FormControlLabel
                value="all"
                control={<Radio />}
                label="Match all rules (AND)"
              />
              <FormControlLabel
                value="any"
                control={<Radio />}
                label="Match any rule (OR)"
              />
            </RadioGroup>
          </FormControl>
        </Box>
 
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth variant="outlined">
                <InputLabel shrink>Attribute</InputLabel>
                <Select
                  value={newRule.attribute}
                  onChange={(e) => setNewRule({ ...newRule, attribute: e.target.value })}
                  label="Attribute"
                  displayEmpty
                >
                  <MenuItem value="" disabled>
                    Attribute
                  </MenuItem>
                  <MenuItem value="industry">Industry</MenuItem>
                  <MenuItem value="size">Company Size</MenuItem>
                  <MenuItem value="revenue">Revenue Range</MenuItem>
                  <MenuItem value="region">Region</MenuItem>
                  <MenuItem value="customerSince">Customer Since</MenuItem>
                  <MenuItem value="planType">Plan Type</MenuItem>
                  <MenuItem value="engagementLevel">Engagement Level</MenuItem>
                  <MenuItem value="businessModel">Business Model</MenuItem>
                  <MenuItem value="companyType">Company Type</MenuItem>
                  <MenuItem value="technologyAdoption">Technology Adoption</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth variant="outlined">
                <InputLabel shrink>Operator</InputLabel>
                <Select
                  value={newRule.operator}
                  onChange={(e) => setNewRule({ ...newRule, operator: e.target.value })}
                  label="Operator"
                  displayEmpty
                >
                  <MenuItem value="" disabled>
                    Operator
                  </MenuItem>
                  <MenuItem value="equals">Equals</MenuItem>
                  <MenuItem value="contains">Contains</MenuItem>
                  <MenuItem value="greaterThan">Greater Than</MenuItem>
                  <MenuItem value="lessThan">Less Than</MenuItem>
                  <MenuItem value="between">Between</MenuItem>
                  <MenuItem value="in">In List</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Value"
                value={newRule.value}
                onChange={(e) => setNewRule({ ...newRule, value: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddRule}
              >
                Add Rule
              </Button>
            </Grid>
          </Grid>
        </Box>
 
        {rules.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Current Rules
            </Typography>
            {rules.map((rule) => (
              <Chip
                key={rule.id}
                label={`${rule.attribute} ${rule.operator} ${rule.value}`}
                onDelete={() => handleDeleteRule(rule.id)}
                sx={{ m: 0.5 }}
              />
            ))}
          </Box>
        )}
 
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Dynamic Organization Preview
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography>
              Matching Organizations: <strong>{previewCount}</strong>
            </Typography>
            <Button variant="outlined" size="small">
              Export Preview
            </Button>
          </Paper>
        </Box>
      </Paper>
 
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Supporting Documents
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Upload relevant documents or add URLs to support this segment
        </Typography>
 
        <Box sx={{ mb: 3 }}>
          <Button
            variant="outlined"
            component="label"
            startIcon={<CloudUploadIcon />}
            sx={{ mb: 2 }}
          >
            Upload Documents
            <input
              type="file"
              multiple
              hidden
              onChange={handleFileUpload}
            />
          </Button>
 
          {documents.length > 0 && (
            <Stack spacing={1}>
              {documents.map((doc) => (
                <Chip
                  key={doc.id}
                  label={doc.name}
                  onDelete={() => handleDeleteDocument(doc.id)}
                  sx={{ m: 0.5 }}
                />
              ))}
            </Stack>
          )}
        </Box>
 
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Reference URLs
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={10}>
              <TextField
                fullWidth
                label="Add URL"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<LinkIcon />}
                onClick={handleAddUrl}
              >
                Add URL
              </Button>
            </Grid>
          </Grid>
 
          {urls.length > 0 && (
            <Stack spacing={1} sx={{ mt: 2 }}>
              {urls.map((url) => (
                <Chip
                  key={url}
                  label={url}
                  onDelete={() => handleDeleteUrl(url)}
                  sx={{ m: 0.5 }}
                />
              ))}
            </Stack>
          )}
        </Box>
      </Paper>
 
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
 
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button variant="outlined">Cancel</Button>
        <Button variant="contained" onClick={handleSave}>
          Create Segment
        </Button>
      </Box>
 
      {segments.length > 0 && (
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" color="primary" gutterBottom>
            Created Segments
          </Typography>
          {segments.map((seg, idx) => (
            <Box key={seg.id} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 2 }}>
              <Grid container alignItems="center" spacing={2}>
                <Grid item xs={12} md={3}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {seg.segmentName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {seg.description}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="body2">
                    Match Logic: <b>{seg.matchLogic === 'all' ? 'All (AND)' : 'Any (OR)'}</b>
                  </Typography>
                  <Typography variant="body2">
                    Rules: {seg.rules.length}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2">
                    Documents: {seg.documents.length} | URLs: {seg.urls.length}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    {seg.rules.map((rule, i) => (
                      <Chip
                        key={rule.id}
                        label={`${rule.attribute} ${rule.operator} ${rule.value}`}
                        size="small"
                        sx={{ m: 0.25 }}
                      />
                    ))}
                  </Box>
                </Grid>
                <Grid item xs={12} md={2} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                  <Button size="small" variant="outlined" sx={{ mr: 1 }} onClick={() => handleEditSegment(idx)}>
                    Edit
                  </Button>
                  <Button size="small" color="error" variant="outlined" onClick={() => handleDeleteSegment(idx)}>
                    Delete
                  </Button>
                </Grid>
              </Grid>
            </Box>
          ))}
        </Paper>
      )}
    </Box>
  );
};
 
export default CustomerSegment;
 