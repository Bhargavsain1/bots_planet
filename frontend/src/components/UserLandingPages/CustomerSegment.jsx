import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Input,
  IconButton,
  Chip,
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios'; // Import Axios at the top of the file

const CustomerSegment = () => {
  const [segmentationName, setSegmentationName] = useState('');
  const [attributes, setAttributes] = useState({
    Country: [],
    Industry: [],
    CompanySize: [],
    Turnover: [],
    CustomerType: [],
    LeadStage: [],
  });
  const [selectedAttribute, setSelectedAttribute] = useState('');
  const [newAttributeValue, setNewAttributeValue] = useState('');
  const [segments, setSegments] = useState([]);
  const [description, setDescription] = useState('');
  const [externalURL, setExternalURL] = useState('');
  const [documents, setDocuments] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  const attributeKeys = Object.keys(attributes);

  const handleAddValue = (key) => {
    if (newAttributeValue.trim() === '') return;
    setAttributes((prev) => ({
      ...prev,
      [key]: [...prev[key], newAttributeValue],
    }));
    setNewAttributeValue('');
  };

  const handleDocumentUpload = (e) => {
    const files = Array.from(e.target.files);
    setDocuments([...documents, ...files]);
  };

  const isFormValid = () => {
    if (!segmentationName.trim()) return false;

    const hasValues = Object.values(attributes).some((arr) => arr.length > 0);
    return hasValues;
  };

  const handleSaveSegment = async () => {
    if (!isFormValid()) {
      alert('Please provide Segmentation Name and add at least one attribute.');
      return;
    }

    const newSegment = {
      segmentationName,
      attributes,
      description,
      externalURL,
      documents,
    };

    console.log('Sending data to backend:', newSegment); // Log the data being sent

    try {
      const response = await axios.post('http://localhost:5000/api/customer-segments', newSegment);
      console.log('Segment saved:', response.data);

      setSegments([...segments, response.data]);

      // Clear form
      setSegmentationName('');
      setAttributes({
        Country: [],
        Industry: [],
        CompanySize: [],
        Turnover: [],
        CustomerType: [],
        LeadStage: [],
      });
      setDescription('');
      setExternalURL('');
      setDocuments([]);
    } catch (error) {
      console.error('Error saving segment:', error);
      alert('Failed to save segment. Please try again.');
    }
  };

  const handleEdit = (index) => {
    const seg = segments[index];
    setSegmentationName(seg.segmentationName);
    setAttributes(seg.attributes);
    setDescription(seg.description);
    setExternalURL(seg.externalURL);
    setDocuments(seg.documents);
    setEditIndex(index);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }} color="primary">
        Customer Segment Setup (Sales Bot)
      </Typography>

      {/* Name Input */}
      <Card sx={{ p: 3, mb: 3 }} elevation={3}>
        <TextField
          fullWidth
          label="Segmentation Name"
          value={segmentationName}
          onChange={(e) => setSegmentationName(e.target.value)}
        />
      </Card>

      {/* Attributes Section */}
      <Grid container spacing={3}>
        {attributeKeys.map((key) => (
          <Grid item xs={12} md={6} key={key}>
            <Card sx={{ p: 2 }} elevation={2}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {key}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {attributes[key].map((val, idx) => (
                  <Chip key={idx} label={val} />
                ))}
              </Box>
              {selectedAttribute === key && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    size="small"
                    fullWidth
                    placeholder={`Add ${key}`}
                    value={newAttributeValue}
                    onChange={(e) => setNewAttributeValue(e.target.value)}
                  />
                  <Button
                    variant="contained"
                    onClick={() => handleAddValue(key)}
                  >
                    Add
                  </Button>
                </Box>
              )}
              <Button
                size="small"
                startIcon={<AddCircleIcon />}
                sx={{ mt: 2 }}
                onClick={() => setSelectedAttribute(key)}
              >
                Add Value
              </Button>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Description, URL, Documents */}
      <Card sx={{ mt: 4, p: 3 }} elevation={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              multiline
              minRows={4}
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="External URL"
              value={externalURL}
              onChange={(e) => setExternalURL(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Input type="file" inputProps={{ multiple: true }} onChange={handleDocumentUpload} />
            {documents.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" fontWeight="bold">
                  Uploaded Documents:
                </Typography>
                {documents.map((doc, idx) => (
                  <Typography key={idx} variant="body2">
                    📎 {doc.name}
                  </Typography>
                ))}
              </Box>
            )}
          </Grid>
        </Grid>
      </Card>

      {/* Save Buttons */}
      <Box sx={{ mt: 4, textAlign: 'right' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSaveSegment}
        >
          {editIndex !== null ? 'Update Segment' : 'Save Segment'}
        </Button>
      </Box>

      {/* Saved Segments */}
      {segments.length > 0 && (
        <Card sx={{ mt: 5, p: 3 }} elevation={2}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Saved Segments
          </Typography>
          {segments.map((seg, i) => (
            <Card key={i} sx={{ p: 2, mb: 2 }} variant="outlined">
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {seg.segmentationName}
                  </Typography>
                  {attributeKeys.map((key) => (
                    seg.attributes[key].length > 0 && (
                      <Typography key={key} variant="body2">
                        {key}: {seg.attributes[key].join(', ')}
                      </Typography>
                    )
                  ))}
                  {seg.description && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      📝 Description: {seg.description}
                    </Typography>
                  )}
                  {seg.externalURL && (
                    <Typography variant="body2">
                      🔗 URL: <a href={seg.externalURL}>{seg.externalURL}</a>
                    </Typography>
                  )}
                  {seg.documents.length > 0 && (
                    <Typography variant="body2">
                      📎 Docs: {seg.documents.map((doc) => doc.name).join(', ')}
                    </Typography>
                  )}
                </Box>
                <IconButton onClick={() => handleEdit(i)}>
                  <EditIcon />
                </IconButton>
              </Box>
            </Card>
          ))}
        </Card>
      )}
    </Box>
  );
};

export default CustomerSegment;