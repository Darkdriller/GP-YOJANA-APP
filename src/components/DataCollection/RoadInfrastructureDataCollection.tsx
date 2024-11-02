// src/components/DataCollection/RoadInfrastructureDataCollection.tsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  styled,
} from '@mui/material';

interface RoadInfrastructureData {
  village: string;
  totalCCRoad: number;
  ccRoadRequired: number;
  repairRequired: number;
  kuchhaRoad: number;
}

interface RoadInfrastructureDataCollectionProps {
  villages: string[];
  initialData?: RoadInfrastructureData[];
  onDataChange: (data: RoadInfrastructureData[]) => void;
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  fontWeight: 'bold',
}));

const TotalRow = styled(TableRow)({
  backgroundColor: '#f5f5f5',
  '& > th': {
    fontWeight: 'bold',
  },
});

const RoadInfrastructureDataCollection: React.FC<RoadInfrastructureDataCollectionProps> = ({
  villages,
  initialData = [],
  onDataChange,
}) => {
  const [data, setData] = useState<RoadInfrastructureData[]>([]);

  useEffect(() => {
    if (initialData.length > 0) {
      setData(initialData);
    } else {
      const newData = villages.map(village => ({
        village,
        totalCCRoad: 0,
        ccRoadRequired: 0,
        repairRequired: 0,
        kuchhaRoad: 0,
      }));
      setData(newData);
    }
  }, [villages, initialData]);

  const handleInputChange = (village: string, field: keyof RoadInfrastructureData, value: string) => {
    const updatedData = data.map(item =>
      item.village === village ? { ...item, [field]: parseFloat(value) || 0 } : item
    );
    setData(updatedData);
    onDataChange(updatedData);
  };

  const calculateTotal = (field: keyof Omit<RoadInfrastructureData, 'village'>) => {
    return data.reduce((sum, item) => sum + item[field], 0);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Road Infrastructure Data
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>Village</StyledTableCell>
              <StyledTableCell>Total CC Road (km)</StyledTableCell>
              <StyledTableCell>CC Road Required (km)</StyledTableCell>
              <StyledTableCell>Repair Required (km)</StyledTableCell>
              <StyledTableCell>Kuchha Road (km)</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.village}>
                <TableCell>{row.village}</TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    value={row.totalCCRoad}
                    onChange={(e) => handleInputChange(row.village, 'totalCCRoad', e.target.value)}
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    value={row.ccRoadRequired}
                    onChange={(e) => handleInputChange(row.village, 'ccRoadRequired', e.target.value)}
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    value={row.repairRequired}
                    onChange={(e) => handleInputChange(row.village, 'repairRequired', e.target.value)}
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    value={row.kuchhaRoad}
                    onChange={(e) => handleInputChange(row.village, 'kuchhaRoad', e.target.value)}
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </TableCell>
              </TableRow>
            ))}
            <TotalRow>
              <TableCell>Total</TableCell>
              <TableCell>{calculateTotal('totalCCRoad').toFixed(2)}</TableCell>
              <TableCell>{calculateTotal('ccRoadRequired').toFixed(2)}</TableCell>
              <TableCell>{calculateTotal('repairRequired').toFixed(2)}</TableCell>
              <TableCell>{calculateTotal('kuchhaRoad').toFixed(2)}</TableCell>
            </TotalRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default RoadInfrastructureDataCollection;