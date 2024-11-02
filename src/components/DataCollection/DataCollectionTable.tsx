import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Typography,
  Box,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { debounce } from 'lodash';

interface DemographicsData {
  [village: string]: {
    households: string;
    totalPopulation: string;
    malePopulation: string;
    femalePopulation: string;
    age0to14Male: string;
    age0to14Female: string;
    age15to60Male: string;
    age15to60Female: string;
    ageAbove60Male: string;
    ageAbove60Female: string;
  };
}

interface DataCollectionTableProps {
  villages: string[];
  initialData?: DemographicsData;
  onDataChange?: (data: DemographicsData) => void;
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  '&.MuiTableCell-head': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    fontWeight: 'bold',
  },
  '&.green-background': {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.common.white,
  },
}));

const StyledDataCell = styled(TableCell)({
  padding: '8px 4px',
});

const DataCollectionTable: React.FC<DataCollectionTableProps> = ({
  villages,
  initialData = {},
  onDataChange
}) => {
  const [data, setData] = useState<DemographicsData>(initialData);

  useEffect(() => {
    const newData = { ...initialData };
    villages.forEach(village => {
      if (!newData[village]) {
        newData[village] = {
          households: '',
          totalPopulation: '',
          malePopulation: '',
          femalePopulation: '',
          age0to14Male: '',
          age0to14Female: '',
          age15to60Male: '',
          age15to60Female: '',
          ageAbove60Male: '',
          ageAbove60Female: '',
        };
      }
    });
    setData(newData);
  }, [villages, initialData]);

  const handleInputChange = (village: string, field: keyof DemographicsData[string], value: string) => {
    const newData = {
      ...data,
      [village]: {
        ...data[village],
        [field]: value
      }
    };
    setData(newData);
    if (onDataChange) {
      debouncedOnDataChange(newData);
    }
  };

  const debouncedOnDataChange = useCallback(
    debounce((newData: DemographicsData) => {
      if (onDataChange) {
        onDataChange(newData);
      }
    }, 300),
    [onDataChange]
  );

  const calculateTotal = (field: keyof DemographicsData[string]) => {
    return villages.reduce((total, village) => {
      const value = Number(data[village]?.[field] || 0);
      return total + (isNaN(value) ? 0 : value);
    }, 0);
  };

  const renderTextField = (village: string, field: keyof DemographicsData[string]) => {
    return (
      <TextField
        type="number"
        value={data[village]?.[field] || ''}
        onChange={(e) => handleInputChange(village, field, e.target.value)}
        fullWidth
        size="small"
        variant="outlined"
        InputProps={{
          inputProps: {
            style: { textAlign: 'center' },
          },
        }}
        sx={{
          '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
            display: 'none',
          },
          '& input[type=number]': {
            MozAppearance: 'textfield',
          },
        }}
      />
    );
  };

  return (
    <TableContainer component={Paper}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom component="div">
          Demographics
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Enter data for each village in Demographics. All fields are required.
        </Typography>
      </Box>
      <Table sx={{ minWidth: 650 }} aria-label="demographics data collection" size="small">
        <TableHead>
          <TableRow>
            <StyledTableCell rowSpan={2}>Village</StyledTableCell>
            <StyledTableCell>Number of Households</StyledTableCell>
            <StyledTableCell>Total Population</StyledTableCell>
            <StyledTableCell>Male Population</StyledTableCell>
            <StyledTableCell>Female Population</StyledTableCell>
            <StyledTableCell colSpan={2} className="green-background">Population (0 to 14 Years)</StyledTableCell>
            <StyledTableCell colSpan={2} className="green-background">Population (15 to 60 Years)</StyledTableCell>
            <StyledTableCell colSpan={2} className="green-background">Population (Above 60 Years)</StyledTableCell>
          </TableRow>
          <TableRow>
            <StyledTableCell colSpan={4}></StyledTableCell>
            <StyledTableCell className="green-background">Male</StyledTableCell>
            <StyledTableCell className="green-background">Female</StyledTableCell>
            <StyledTableCell className="green-background">Male</StyledTableCell>
            <StyledTableCell className="green-background">Female</StyledTableCell>
            <StyledTableCell className="green-background">Male</StyledTableCell>
            <StyledTableCell className="green-background">Female</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {villages.map(village => (
            <TableRow key={village}>
              <TableCell component="th" scope="row">{village}</TableCell>
              <StyledDataCell>{renderTextField(village, 'households')}</StyledDataCell>
              <StyledDataCell>{renderTextField(village, 'totalPopulation')}</StyledDataCell>
              <StyledDataCell>{renderTextField(village, 'malePopulation')}</StyledDataCell>
              <StyledDataCell>{renderTextField(village, 'femalePopulation')}</StyledDataCell>
              <StyledDataCell>{renderTextField(village, 'age0to14Male')}</StyledDataCell>
              <StyledDataCell>{renderTextField(village, 'age0to14Female')}</StyledDataCell>
              <StyledDataCell>{renderTextField(village, 'age15to60Male')}</StyledDataCell>
              <StyledDataCell>{renderTextField(village, 'age15to60Female')}</StyledDataCell>
              <StyledDataCell>{renderTextField(village, 'ageAbove60Male')}</StyledDataCell>
              <StyledDataCell>{renderTextField(village, 'ageAbove60Female')}</StyledDataCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell component="th" scope="row"><strong>GP Total</strong></TableCell>
            <StyledDataCell><strong>{calculateTotal('households')}</strong></StyledDataCell>
            <StyledDataCell><strong>{calculateTotal('totalPopulation')}</strong></StyledDataCell>
            <StyledDataCell><strong>{calculateTotal('malePopulation')}</strong></StyledDataCell>
            <StyledDataCell><strong>{calculateTotal('femalePopulation')}</strong></StyledDataCell>
            <StyledDataCell><strong>{calculateTotal('age0to14Male')}</strong></StyledDataCell>
            <StyledDataCell><strong>{calculateTotal('age0to14Female')}</strong></StyledDataCell>
            <StyledDataCell><strong>{calculateTotal('age15to60Male')}</strong></StyledDataCell>
            <StyledDataCell><strong>{calculateTotal('age15to60Female')}</strong></StyledDataCell>
            <StyledDataCell><strong>{calculateTotal('ageAbove60Male')}</strong></StyledDataCell>
            <StyledDataCell><strong>{calculateTotal('ageAbove60Female')}</strong></StyledDataCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DataCollectionTable;