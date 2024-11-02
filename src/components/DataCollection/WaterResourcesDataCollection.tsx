// src/components/DataCollection/WaterResourcesDataCollection.tsx

import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  styled,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';

interface WaterBody {
  id: string;
  type: string;
  otherType?: string;
  locations: string[];
  waterLevel: string;
  condition: string;
  irrigationPotential: number;
}

interface IrrigationStructure {
  id: string;
  type: string;
  otherType?: string;
  location: string;
  status: string;
  irrigationPotential: number;
}

interface WaterResourcesDataCollectionProps {
  villages: string[];
  initialWaterBodies?: WaterBody[];
  initialIrrigationStructures?: IrrigationStructure[];
  onDataChange: (waterBodies: WaterBody[], irrigationStructures: IrrigationStructure[]) => void;
}

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const WaterResourcesDataCollection: React.FC<WaterResourcesDataCollectionProps> = ({
  villages,
  initialWaterBodies = [],
  initialIrrigationStructures = [],
  onDataChange,
}) => {
  const [waterBodies, setWaterBodies] = useState<WaterBody[]>(initialWaterBodies);
  const [irrigationStructures, setIrrigationStructures] = useState<IrrigationStructure[]>(initialIrrigationStructures);
  const [newWaterBody, setNewWaterBody] = useState<WaterBody>({
    id: '',
    type: '',
    locations: [],
    waterLevel: '',
    condition: '',
    irrigationPotential: 0,
  });
  const [newIrrigationStructure, setNewIrrigationStructure] = useState<IrrigationStructure>({
    id: '',
    type: '',
    otherType: '',
    location: '',
    status: '',
    irrigationPotential: 0,
  });
  const [editingWaterBody, setEditingWaterBody] = useState<string | null>(null);
  const [editingIrrigationStructure, setEditingIrrigationStructure] = useState<string | null>(null);

  const waterBodyTypes = ['Ponds', 'Lakes', 'Streams', 'Canals', 'Others'];
  const waterLevels = ['Seasonal', 'Perennial'];
  const waterConditions = ['Clean', 'Polluted', 'Heavily polluted'];
  const irrigationStructureTypes = [
    'Canal irrigation',
    'Tank irrigation',
    'Well irrigation',
    'Lift irrigation',
    'Micro-irrigation systems',
    'Underground piped irrigation',
    'Check dams',
    'Spring-based irrigation',
    'Bore wells',
    'Solar pump irrigation',
    'Others'
  ];
  const irrigationStructureStatuses = ['Excellent Condition', 'Good Condition', 'Needs Repairs', 'Critical Condition'];

  const handleWaterBodyInputChange = (field: keyof WaterBody, value: any) => {
    setNewWaterBody(prev => ({ ...prev, [field]: value }));
  };

  const handleIrrigationStructureInputChange = (field: keyof IrrigationStructure, value: any) => {
    setNewIrrigationStructure(prev => ({ ...prev, [field]: value }));
  };

  const addWaterBody = () => {
    const newBody = { ...newWaterBody, id: Date.now().toString() };
    setWaterBodies(prev => [...prev, newBody]);
    setNewWaterBody({
      id: '',
      type: '',
      locations: [],
      waterLevel: '',
      condition: '',
      irrigationPotential: 0,
    });
    onDataChange([...waterBodies, newBody], irrigationStructures);
  };

  const addIrrigationStructure = () => {
    const newStructure = { ...newIrrigationStructure, id: Date.now().toString() };
    setIrrigationStructures(prev => [...prev, newStructure]);
    setNewIrrigationStructure({
      id: '',
      type: '',
      otherType: '',
      location: '',
      status: '',
      irrigationPotential: 0,
    });
    onDataChange(waterBodies, [...irrigationStructures, newStructure]);
  };

  const editWaterBody = (id: string) => {
    const bodyToEdit = waterBodies.find(body => body.id === id);
    if (bodyToEdit) {
      setNewWaterBody(bodyToEdit);
      setEditingWaterBody(id);
    }
  };

  const editIrrigationStructure = (id: string) => {
    const structureToEdit = irrigationStructures.find(structure => structure.id === id);
    if (structureToEdit) {
      setNewIrrigationStructure(structureToEdit);
      setEditingIrrigationStructure(id);
    }
  };

  const saveWaterBody = () => {
    if (editingWaterBody) {
      const updatedBodies = waterBodies.map(body =>
        body.id === editingWaterBody ? newWaterBody : body
      );
      setWaterBodies(updatedBodies);
      setEditingWaterBody(null);
      onDataChange(updatedBodies, irrigationStructures);
    } else {
      addWaterBody();
    }
    setNewWaterBody({
      id: '',
      type: '',
      locations: [],
      waterLevel: '',
      condition: '',
      irrigationPotential: 0,
    });
  };

  const saveIrrigationStructure = () => {
    if (editingIrrigationStructure) {
      const updatedStructures = irrigationStructures.map(structure =>
        structure.id === editingIrrigationStructure ? newIrrigationStructure : structure
      );
      setIrrigationStructures(updatedStructures);
      setEditingIrrigationStructure(null);
      onDataChange(waterBodies, updatedStructures);
    } else {
      addIrrigationStructure();
    }
    setNewIrrigationStructure({
      id: '',
      type: '',
      otherType: '',
      location: '',
      status: '',
      irrigationPotential: 0,
    });
  };

  const deleteWaterBody = (id: string) => {
    const updatedBodies = waterBodies.filter(body => body.id !== id);
    setWaterBodies(updatedBodies);
    onDataChange(updatedBodies, irrigationStructures);
  };

  const deleteIrrigationStructure = (id: string) => {
    const updatedStructures = irrigationStructures.filter(structure => structure.id !== id);
    setIrrigationStructures(updatedStructures);
    onDataChange(waterBodies, updatedStructures);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Water Resources and Irrigation Structures
      </Typography>

      {/* Water Bodies Section */}
      <Typography variant="subtitle1" gutterBottom>
        Water Bodies
      </Typography>
      <Grid container spacing={2} sx={{ marginBottom: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Type of Water Body</InputLabel>
            <Select
              value={newWaterBody.type}
              onChange={(e) => handleWaterBodyInputChange('type', e.target.value)}
            >
              {waterBodyTypes.map(type => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        {newWaterBody.type === 'Others' && (
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Specify Other Type"
              value={newWaterBody.otherType || ''}
              onChange={(e) => handleWaterBodyInputChange('otherType', e.target.value)}
            />
          </Grid>
        )}
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Locations</InputLabel>
            <Select
              multiple
              value={newWaterBody.locations}
              onChange={(e) => handleWaterBodyInputChange('locations', e.target.value)}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as string[]).map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </Box>
              )}
            >
              {villages.map(village => (
                <MenuItem key={village} value={village}>{village}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Water Level</InputLabel>
            <Select
              value={newWaterBody.waterLevel}
              onChange={(e) => handleWaterBodyInputChange('waterLevel', e.target.value)}
            >
              {waterLevels.map(level => (
                <MenuItem key={level} value={level}>{level}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Condition</InputLabel>
            <Select
              value={newWaterBody.condition}
              onChange={(e) => handleWaterBodyInputChange('condition', e.target.value)}
            >
              {waterConditions.map(condition => (
                <MenuItem key={condition} value={condition}>{condition}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="Irrigation Potential (Hectares)"
            type="number"
            value={newWaterBody.irrigationPotential}
            onChange={(e) => handleWaterBodyInputChange('irrigationPotential', parseFloat(e.target.value))}
            inputProps={{ min: 0, step: 0.01 }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="contained"
            startIcon={editingWaterBody ? <SaveIcon /> : <AddIcon />}
            onClick={saveWaterBody}
            sx={{ height: '100%' }}
          >
            {editingWaterBody ? 'Save' : 'Add'} Water Body
          </Button>
        </Grid>
      </Grid>

      {/* Water Bodies Cards */}
      <Grid container spacing={2} sx={{ marginBottom: 4 }}>
        {waterBodies.map((body) => (
          <Grid item xs={12} sm={6} md={4} key={body.id}>
            <StyledCard>
              <CardContent>
                <Typography variant="h6">{body.type === 'Others' ? body.otherType : body.type}</Typography>
                <Typography>Locations: {body.locations.join(', ')}</Typography>
                <Typography>Water Level: {body.waterLevel}</Typography>
                <Typography>Condition: {body.condition}</Typography>
                <Typography>Irrigation Potential: {body.irrigationPotential} hectares</Typography>
              </CardContent>
              <CardActions>
                <IconButton onClick={() => editWaterBody(body.id)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => deleteWaterBody(body.id)}>
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </StyledCard>
          </Grid>
        ))}
      </Grid>

      {/* Irrigation Structures Section */}
      <Typography variant="subtitle1" gutterBottom>
        Irrigation Structures
      </Typography>
      <Grid container spacing={2} sx={{ marginBottom: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Type of Structure</InputLabel>
            <Select
              value={newIrrigationStructure.type}
              onChange={(e) => handleIrrigationStructureInputChange('type', e.target.value)}
            >
              {irrigationStructureTypes.map(type => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        {newIrrigationStructure.type === 'Others' && (
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Specify Other Type"
              value={newIrrigationStructure.otherType || ''}
              onChange={(e) => handleIrrigationStructureInputChange('otherType', e.target.value)}
            />
          </Grid>
        )}
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Location</InputLabel>
            <Select
              value={newIrrigationStructure.location}
              onChange={(e) => handleIrrigationStructureInputChange('location', e.target.value)}
            >
              {villages.map(village => (
                <MenuItem key={village} value={village}>{village}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={newIrrigationStructure.status}
              onChange={(e) => handleIrrigationStructureInputChange('status', e.target.value)}
            >
              {irrigationStructureStatuses.map(status => (
                <MenuItem key={status} value={status}>{status}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="Irrigation Potential (Hectares)"
            type="number"
            value={newIrrigationStructure.irrigationPotential}
            onChange={(e) => handleIrrigationStructureInputChange('irrigationPotential', parseFloat(e.target.value))}
            inputProps={{ min: 0, step: 0.01 }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="contained"
            startIcon={editingIrrigationStructure ? <SaveIcon /> : <AddIcon />}
            onClick={saveIrrigationStructure}
            sx={{ height: '100%' }}
          >
            {editingIrrigationStructure ? 'Save' : 'Add'} Irrigation Structure
          </Button>
        </Grid>
      </Grid>

      {/* Irrigation Structures Cards */}
      <Grid container spacing={2}>
        {irrigationStructures.map((structure) => (
          <Grid item xs={12} sm={6} md={4} key={structure.id}>
            <StyledCard>
              <CardContent>
                <Typography variant="h6">
                  {structure.type === 'Others' ? structure.otherType : structure.type}
                </Typography>
                <Typography>Location: {structure.location}</Typography>
                <Typography>Status: {structure.status}</Typography>
                <Typography>Irrigation Potential: {structure.irrigationPotential} hectares</Typography>
              </CardContent>
              <CardActions>
                <IconButton onClick={() => editIrrigationStructure(structure.id)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => deleteIrrigationStructure(structure.id)}>
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </StyledCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default WaterResourcesDataCollection;
