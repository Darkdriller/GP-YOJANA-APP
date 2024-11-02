// src/components/DataCollection/PanchayatFinancesDataCollection.tsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Paper,
  Grid,
  styled,
} from '@mui/material';

interface PanchayatFinancesData {
  cfc: number;
  sfc: number;
  ownSources: number;
  mgnregs: number;
}

interface PanchayatFinancesDataCollectionProps {
  initialData?: PanchayatFinancesData;
  onDataChange: (data: PanchayatFinancesData) => void;
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const PanchayatFinancesDataCollection: React.FC<PanchayatFinancesDataCollectionProps> = ({
  initialData = { cfc: 0, sfc: 0, ownSources: 0, mgnregs: 0 },
  onDataChange,
}) => {
  const [data, setData] = useState<PanchayatFinancesData>(initialData);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const handleInputChange = (field: keyof PanchayatFinancesData, value: string) => {
    const updatedData = { ...data, [field]: parseFloat(value) || 0 };
    setData(updatedData);
    onDataChange(updatedData);
  };

  const calculateTotal = () => {
    return Object.values(data).reduce((sum, value) => sum + value, 0);
  };

  return (
    <StyledPaper elevation={3}>
      <Typography variant="h6" gutterBottom>
        Panchayat Finances Data (in Rupees)
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <StyledTextField
            fullWidth
            label="Central Finance Commission (CFC)"
            type="number"
            value={data.cfc}
            onChange={(e) => handleInputChange('cfc', e.target.value)}
            InputProps={{ inputProps: { min: 0 } }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <StyledTextField
            fullWidth
            label="State Finance Commission (SFC)"
            type="number"
            value={data.sfc}
            onChange={(e) => handleInputChange('sfc', e.target.value)}
            InputProps={{ inputProps: { min: 0 } }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <StyledTextField
            fullWidth
            label="Panchayat Own Sources"
            type="number"
            value={data.ownSources}
            onChange={(e) => handleInputChange('ownSources', e.target.value)}
            InputProps={{ inputProps: { min: 0 } }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <StyledTextField
            fullWidth
            label="MGNREGS"
            type="number"
            value={data.mgnregs}
            onChange={(e) => handleInputChange('mgnregs', e.target.value)}
            InputProps={{ inputProps: { min: 0 } }}
          />
        </Grid>
      </Grid>
      <Box mt={3}>
        <Typography variant="h6">
          Total Revenue: ₹{calculateTotal().toLocaleString('en-IN')}
        </Typography>
      </Box>
    </StyledPaper>
  );
};

export default PanchayatFinancesDataCollection;