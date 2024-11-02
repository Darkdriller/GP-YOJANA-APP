// src/components/DataCollection/LandUseMappingDataCollection.tsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Grid,
  styled,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';

interface LandUseData {
  village: string;
  totalCultivableLand: number;
  irrigatedLand: number;
  forestArea: number;
}

interface CommonLandArea {
  id: string;
  location: string;
  area: number;
  uses: string;
}

interface LandUseMappingDataCollectionProps {
  villages: string[];
  initialLandUseData?: LandUseData[];
  initialCommonLandAreas?: CommonLandArea[];
  onDataChange: (landUseData: LandUseData[], commonLandAreas: CommonLandArea[]) => void;
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

const LandUseMappingDataCollection: React.FC<LandUseMappingDataCollectionProps> = ({
  villages,
  initialLandUseData = [],
  initialCommonLandAreas = [],
  onDataChange,
}) => {
  const [landUseData, setLandUseData] = useState<LandUseData[]>(initialLandUseData);
  const [commonLandAreas, setCommonLandAreas] = useState<CommonLandArea[]>(initialCommonLandAreas);
  const [newCommonLandArea, setNewCommonLandArea] = useState<CommonLandArea>({
    id: '',
    location: '',
    area: 0,
    uses: '',
  });
  const [editingCommonLandArea, setEditingCommonLandArea] = useState<string | null>(null);

  useEffect(() => {
    if (initialLandUseData.length === 0) {
      const newData = villages.map(village => ({
        village,
        totalCultivableLand: 0,
        irrigatedLand: 0,
        forestArea: 0,
      }));
      setLandUseData(newData);
    }
  }, [villages, initialLandUseData]);

  const handleLandUseInputChange = (village: string, field: keyof LandUseData, value: string) => {
    const updatedData = landUseData.map(item =>
      item.village === village ? { ...item, [field]: parseFloat(value) || 0 } : item
    );
    setLandUseData(updatedData);
    onDataChange(updatedData, commonLandAreas);
  };

  const calculateTotal = (field: keyof Omit<LandUseData, 'village'>) => {
    return landUseData.reduce((sum, item) => sum + item[field], 0);
  };

  const handleCommonLandInputChange = (field: keyof CommonLandArea, value: string) => {
    setNewCommonLandArea(prev => ({ ...prev, [field]: field === 'area' ? parseFloat(value) || 0 : value }));
  };

  const addCommonLandArea = () => {
    const newArea = { ...newCommonLandArea, id: Date.now().toString() };
    setCommonLandAreas(prev => [...prev, newArea]);
    setNewCommonLandArea({ id: '', location: '', area: 0, uses: '' });
    onDataChange(landUseData, [...commonLandAreas, newArea]);
  };

  const editCommonLandArea = (id: string) => {
    const areaToEdit = commonLandAreas.find(area => area.id === id);
    if (areaToEdit) {
      setNewCommonLandArea(areaToEdit);
      setEditingCommonLandArea(id);
    }
  };

  const saveCommonLandArea = () => {
    if (editingCommonLandArea) {
      const updatedAreas = commonLandAreas.map(area =>
        area.id === editingCommonLandArea ? newCommonLandArea : area
      );
      setCommonLandAreas(updatedAreas);
      setEditingCommonLandArea(null);
      setNewCommonLandArea({ id: '', location: '', area: 0, uses: '' });
      onDataChange(landUseData, updatedAreas);
    } else {
      addCommonLandArea();
    }
  };

  const deleteCommonLandArea = (id: string) => {
    const updatedAreas = commonLandAreas.filter(area => area.id !== id);
    setCommonLandAreas(updatedAreas);
    onDataChange(landUseData, updatedAreas);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Land Use Mapping Data
      </Typography>
      
      {/* Village-wise Land Use Table */}
      <TableContainer component={Paper} sx={{ marginBottom: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>Village</StyledTableCell>
              <StyledTableCell>Total Cultivable Land (ha)</StyledTableCell>
              <StyledTableCell>Irrigated Land (ha)</StyledTableCell>
              <StyledTableCell>Forest Area (ha)</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {landUseData.map((row) => (
              <TableRow key={row.village}>
                <TableCell>{row.village}</TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    value={row.totalCultivableLand}
                    onChange={(e) => handleLandUseInputChange(row.village, 'totalCultivableLand', e.target.value)}
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    value={row.irrigatedLand}
                    onChange={(e) => handleLandUseInputChange(row.village, 'irrigatedLand', e.target.value)}
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    value={row.forestArea}
                    onChange={(e) => handleLandUseInputChange(row.village, 'forestArea', e.target.value)}
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </TableCell>
              </TableRow>
            ))}
            <TotalRow>
              <TableCell>Total</TableCell>
              <TableCell>{calculateTotal('totalCultivableLand').toFixed(2)}</TableCell>
              <TableCell>{calculateTotal('irrigatedLand').toFixed(2)}</TableCell>
              <TableCell>{calculateTotal('forestArea').toFixed(2)}</TableCell>
            </TotalRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Common Land Areas Section */}
      <Typography variant="h6" gutterBottom>
        Common Land Areas in Panchayat
      </Typography>
      <Grid container spacing={2} sx={{ marginBottom: 2 }}>
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth>
            <InputLabel>Location</InputLabel>
            <Select
              value={newCommonLandArea.location}
              onChange={(e) => handleCommonLandInputChange('location', e.target.value as string)}
            >
              {villages.map(village => (
                <MenuItem key={village} value={village}>{village}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            label="Area (ha)"
            type="number"
            value={newCommonLandArea.area}
            onChange={(e) => handleCommonLandInputChange('area', e.target.value)}
            inputProps={{ min: 0, step: 0.01 }}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            label="Uses"
            value={newCommonLandArea.uses}
            onChange={(e) => handleCommonLandInputChange('uses', e.target.value)}
            placeholder="Grazing, Agriculture, Recreation, Others"
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <Button
            fullWidth
            variant="contained"
            startIcon={editingCommonLandArea ? <SaveIcon /> : <AddIcon />}
            onClick={saveCommonLandArea}
            sx={{ height: '100%' }}
          >
            {editingCommonLandArea ? 'Save' : 'Add'} Common Land Area
          </Button>
        </Grid>
      </Grid>

      {/* Common Land Area Cards */}
      <Grid container spacing={2}>
        {commonLandAreas.map((area) => (
          <Grid item xs={12} sm={6} md={4} key={area.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{area.location}</Typography>
                <Typography>Area: {area.area.toFixed(2)} ha</Typography>
                <Typography>Uses: {area.uses}</Typography>
              </CardContent>
              <CardActions>
                <IconButton onClick={() => editCommonLandArea(area.id)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => deleteCommonLandArea(area.id)}>
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default LandUseMappingDataCollection;