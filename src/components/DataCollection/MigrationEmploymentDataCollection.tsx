// src/components/DataCollection/MigrationEmploymentDataCollection.tsx

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

interface MigrationEmploymentData {
  village: string;
  householdsReportingMigration: number;
  seasonalMigrantsMale: number;
  seasonalMigrantsFemale: number;
  permanentMigrantsMale: number;
  permanentMigrantsFemale: number;
  landlessHouseholds: number;
  householdsWithMGNREGSCards: number;
  workdaysProvidedMGNREGS: number;
}

interface MigrationEmploymentDataCollectionProps {
  villages: string[];
  initialData?: MigrationEmploymentData[];
  onDataChange: (data: MigrationEmploymentData[]) => void;
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  color: theme.palette.common.white,
  fontWeight: 'bold',
}));

const BlueHeader = styled(StyledTableCell)({
  backgroundColor: '#1976d2',
});

const RedHeader = styled(StyledTableCell)({
  backgroundColor: '#d32f2f',
});

const TotalRow = styled(TableRow)({
  backgroundColor: '#f5f5f5',
  '& > th': {
    fontWeight: 'bold',
  },
});

const MigrationEmploymentDataCollection: React.FC<MigrationEmploymentDataCollectionProps> = ({
  villages,
  initialData = [],
  onDataChange,
}) => {
  const [data, setData] = useState<MigrationEmploymentData[]>([]);

  useEffect(() => {
    if (initialData.length > 0) {
      setData(initialData);
    } else {
      const newData = villages.map(village => ({
        village,
        householdsReportingMigration: 0,
        seasonalMigrantsMale: 0,
        seasonalMigrantsFemale: 0,
        permanentMigrantsMale: 0,
        permanentMigrantsFemale: 0,
        landlessHouseholds: 0,
        householdsWithMGNREGSCards: 0,
        workdaysProvidedMGNREGS: 0,
      }));
      setData(newData);
    }
  }, [villages, initialData]);

  const handleInputChange = (village: string, field: keyof MigrationEmploymentData, value: string) => {
    const updatedData = data.map(item =>
      item.village === village ? { ...item, [field]: parseInt(value) || 0 } : item
    );
    setData(updatedData);
    onDataChange(updatedData);
  };

  const calculateTotal = (field: keyof Omit<MigrationEmploymentData, 'village'>) => {
    return data.reduce((sum, item) => sum + item[field], 0);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Migration and Employment Data
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <BlueHeader rowSpan={2}>Village</BlueHeader>
              <BlueHeader rowSpan={2}>Households Reporting Migration</BlueHeader>
              <RedHeader colSpan={2}>Seasonal Migrants</RedHeader>
              <RedHeader colSpan={2}>Permanent Migrants</RedHeader>
              <BlueHeader rowSpan={2}>Landless Households</BlueHeader>
              <BlueHeader rowSpan={2}>Households with MGNREGS Job Cards</BlueHeader>
              <BlueHeader rowSpan={2}>Workdays Provided under MGNREGS</BlueHeader>
            </TableRow>
            <TableRow>
              <RedHeader>Male</RedHeader>
              <RedHeader>Female</RedHeader>
              <RedHeader>Male</RedHeader>
              <RedHeader>Female</RedHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.village}>
                <TableCell>{row.village}</TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    value={row.householdsReportingMigration}
                    onChange={(e) => handleInputChange(row.village, 'householdsReportingMigration', e.target.value)}
                    inputProps={{ min: 0 }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    value={row.seasonalMigrantsMale}
                    onChange={(e) => handleInputChange(row.village, 'seasonalMigrantsMale', e.target.value)}
                    inputProps={{ min: 0 }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    value={row.seasonalMigrantsFemale}
                    onChange={(e) => handleInputChange(row.village, 'seasonalMigrantsFemale', e.target.value)}
                    inputProps={{ min: 0 }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    value={row.permanentMigrantsMale}
                    onChange={(e) => handleInputChange(row.village, 'permanentMigrantsMale', e.target.value)}
                    inputProps={{ min: 0 }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    value={row.permanentMigrantsFemale}
                    onChange={(e) => handleInputChange(row.village, 'permanentMigrantsFemale', e.target.value)}
                    inputProps={{ min: 0 }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    value={row.landlessHouseholds}
                    onChange={(e) => handleInputChange(row.village, 'landlessHouseholds', e.target.value)}
                    inputProps={{ min: 0 }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    value={row.householdsWithMGNREGSCards}
                    onChange={(e) => handleInputChange(row.village, 'householdsWithMGNREGSCards', e.target.value)}
                    inputProps={{ min: 0 }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    value={row.workdaysProvidedMGNREGS}
                    onChange={(e) => handleInputChange(row.village, 'workdaysProvidedMGNREGS', e.target.value)}
                    inputProps={{ min: 0 }}
                  />
                </TableCell>
              </TableRow>
            ))}
            <TotalRow>
              <TableCell>Total</TableCell>
              <TableCell>{calculateTotal('householdsReportingMigration')}</TableCell>
              <TableCell>{calculateTotal('seasonalMigrantsMale')}</TableCell>
              <TableCell>{calculateTotal('seasonalMigrantsFemale')}</TableCell>
              <TableCell>{calculateTotal('permanentMigrantsMale')}</TableCell>
              <TableCell>{calculateTotal('permanentMigrantsFemale')}</TableCell>
              <TableCell>{calculateTotal('landlessHouseholds')}</TableCell>
              <TableCell>{calculateTotal('householdsWithMGNREGSCards')}</TableCell>
              <TableCell>{calculateTotal('workdaysProvidedMGNREGS')}</TableCell>
            </TotalRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default MigrationEmploymentDataCollection;