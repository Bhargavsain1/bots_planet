import React, { useState } from 'react';

import {

  Grid,

  TextField,

  Typography,

  Card,

  CardContent,

  Button,

  MenuItem,

  Box,

  Paper,

  Avatar,

} from '@mui/material';

import BusinessIcon from '@mui/icons-material/Business';
 
const BuyerProfile = () => {

  const [formData, setFormData] = useState({

    name: '',

    email: '',

    phone: '',

    companyName: '',

    jobTitle: '',

    industry: '',

    companySize: '',

    timeline: '',

    budget: '',

    need: '',

  });
 
  const [submitted, setSubmitted] = useState(false);
 
  const handleChange = (field) => (e) =>

    setFormData({ ...formData, [field]: e.target.value });
 
  const handleSubmit = () => {

    const requiredFields = ['name', 'email', 'companyName'];

    const missing = requiredFields.filter((f) => !formData[f]);

    if (missing.length > 0) {

      alert('Please fill in all required fields.');

    } else {

      setSubmitted(true);

    }

  };
 
  const renderInput = (field, label, options = null, required = false) => (
<Grid item xs={12} sm={6}>
<TextField

        fullWidth

        variant="outlined"

        size="small"

        select={!!options}

        label={label + (required ? ' *' : '')}

        value={formData[field]}

        onChange={handleChange(field)}

        required={required}

        InputLabelProps={{

          style: { whiteSpace: 'normal', lineHeight: 1.2 },

        }}
>

        {options &&

          options.map((option) => (
<MenuItem key={option} value={option}>

              {option}
</MenuItem>

          ))}
</TextField>
</Grid>

  );
 
  return (
<Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, p: 3 }}>

      {/* Left Panel */}
<Paper

        elevation={3}

        sx={{

          width: { md: '35%' },

          mr: { md: 3 },

          mb: { xs: 3, md: 0 },

          p: 4,

          background: '#f0f6ff',

          borderRadius: 3,

        }}
>
<Avatar sx={{ bgcolor: '#1976d2', width: 56, height: 56, mb: 2 }}>
<BusinessIcon fontSize="large" />
</Avatar>
<Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>

          Buyer Details
</Typography>
<Typography variant="body1" color="text.secondary">

          Kindly fill in the essential information. This will help us connect you with the right solutions.
</Typography>
</Paper>
 
      {/* Right Form Panel */}
<Card sx={{ flexGrow: 1, p: 3, borderRadius: 3 }} elevation={4}>
<CardContent>
<Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>

            Buyer Information
</Typography>
<Grid container spacing={2}>

            {renderInput('name', 'Full Name', null, true)}

            {renderInput('email', 'Email', null, true)}

            {renderInput('phone', 'Phone')}

            {renderInput('companyName', 'Company Name', null, true)}

            {renderInput('jobTitle', 'Job Title')}

            {renderInput('industry', 'Industry', [

              'Technology',

              'Healthcare',

              'Finance',

              'Education',

              'Retail',

              'Other',

            ])}

            {renderInput('companySize', 'Company Size', [

              '1-10',

              '11-50',

              '51-200',

              '201-500',

              '500+',

            ])}

            {renderInput('timeline', 'Timeline', [

              'Immediately',

              '1-3 months',

              '3-6 months',

              '6+ months',

            ])}

            {renderInput('budget', 'Estimated Budget')}
<Grid item xs={12}>
<TextField

                fullWidth

                multiline

                rows={3}

                variant="outlined"

                size="small"

                label="Primary Requirement"

                value={formData.need}

                onChange={handleChange('need')}

                InputLabelProps={{

                  style: { whiteSpace: 'normal', lineHeight: 1.2 },

                }}

              />
</Grid>
</Grid>
 
          <Button

            variant="contained"

            color="primary"

            size="large"

            sx={{ mt: 4 }}

            onClick={handleSubmit}
>

            Submit
</Button>
 
          {submitted && (
<Box sx={{ mt: 4 }}>
<Typography variant="h6" sx={{ mb: 2 }}>

                Submitted Summary
</Typography>
<Grid container spacing={2}>

                {Object.entries(formData).map(([key, value]) => (
<Grid item xs={12} sm={6} key={key}>
<Typography variant="subtitle2" color="text.secondary">

                      {key.charAt(0).toUpperCase() + key.slice(1)}
</Typography>
<Typography>{value || '—'}</Typography>
</Grid>

                ))}
</Grid>
</Box>

          )}
</CardContent>
</Card>
</Box>

  );

};
 
export default BuyerProfile;

 