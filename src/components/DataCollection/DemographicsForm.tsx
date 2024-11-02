// src/components/DataCollection/DemographicsForm.tsx
import React from 'react';
import { Box, TextField, Typography, Grid } from '@mui/material';

interface DemographicsFormProps {
  data: {
    totalHouseholds: string;
    totalPopulation: string;
    populationByAgeGroups: {
      '0-14': string;
      '15-30': string;
      '31-45': string;
      '46-60': string;
      '60+': string;
    };
  };
  onChange: (data: any) => void;
}

const DemographicsForm: React.FC<DemographicsFormProps> = ({ data, onChange }) => {
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (name.includes('.')) {
      const [group, field] = name.split('.');
      onChange({
        ...data,
        [group]: {
          ...data[group as keyof typeof data],
          [field]: value,
        },
      });
    } else {
      onChange({
        ...data,
        [name]: value,
      });
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Demographics</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Total Number of Households"
            name="totalHouseholds"
            type="number"
            value={data.totalHouseholds}
            onChange={handleInputChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Total Population"
            name="totalPopulation"
            type="number"
            value={data.totalPopulation}
            onChange={handleInputChange}
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>Population by Age Groups</Typography>
        </Grid>
        {Object.entries(data.populationByAgeGroups).map(([ageGroup, value]) => (
          <Grid item xs={12} sm={6} key={ageGroup}>
            <TextField
              fullWidth
              label={`${ageGroup} years`}
              name={`populationByAgeGroups.${ageGroup}`}
              type="number"
              value={value}
              onChange={handleInputChange}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DemographicsForm;