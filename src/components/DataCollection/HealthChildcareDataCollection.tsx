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
  Paper,
  IconButton,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';

interface HealthFacility {
  id: string;
  name: string;
  location: string;
  otherLocation?: string;
  status: string;
}

interface HealthChildcareDataProps {
  villages: string[];
  initialData?: {
    phcs: HealthFacility[];
    subCentres: HealthFacility[];
    anganwadiCentres: HealthFacility[];
  };
  onDataChange: (data: any) => void;
}

const statusOptions = [
  'Fully Functional',
  'Partially Functional',
  'Needs Repair',
  'Non-Operational',
];

const HealthChildcareDataCollection: React.FC<HealthChildcareDataProps> = ({
  villages,
  initialData = { phcs: [], subCentres: [], anganwadiCentres: [] },
  onDataChange,
}) => {
  const [healthData, setHealthData] = useState(initialData);
  const [editingFacility, setEditingFacility] = useState<{ type: string; id: string | null }>({ type: '', id: null });
  const [newFacility, setNewFacility] = useState<HealthFacility | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const addNewFacility = (type: 'phcs' | 'subCentres' | 'anganwadiCentres') => {
    setNewFacility({
      id: Date.now().toString(),
      name: '',
      location: '',
      status: '',
    });
    setEditingFacility({ type, id: null });
    setIsDialogOpen(true);
  };

  const saveFacility = (type: 'phcs' | 'subCentres' | 'anganwadiCentres') => {
    if (newFacility) {
      const updatedFacilities = [...healthData[type], newFacility];
      setHealthData(prev => ({ ...prev, [type]: updatedFacilities }));
      onDataChange({ ...healthData, [type]: updatedFacilities });
      setNewFacility(null);
    } else if (editingFacility.id) {
      const updatedFacilities = healthData[type].map(facility =>
        facility.id === editingFacility.id ? { ...facility, ...newFacility } : facility
      );
      setHealthData(prev => ({ ...prev, [type]: updatedFacilities }));
      onDataChange({ ...healthData, [type]: updatedFacilities });
    }
    setEditingFacility({ type: '', id: null });
    setIsDialogOpen(false);
  };

  const updateFacility = (field: string, value: string) => {
    if (newFacility) {
      setNewFacility(prev => ({ ...prev!, [field]: value }));
    } else if (editingFacility.id) {
      setNewFacility(prev => ({ ...prev!, [field]: value }));
    }
  };

  const deleteFacility = (type: 'phcs' | 'subCentres' | 'anganwadiCentres', id: string) => {
    const updatedFacilities = healthData[type].filter(facility => facility.id !== id);
    setHealthData(prev => ({ ...prev, [type]: updatedFacilities }));
    onDataChange({ ...healthData, [type]: updatedFacilities });
  };

  const editFacility = (type: 'phcs' | 'subCentres' | 'anganwadiCentres', id: string) => {
    const facilityToEdit = healthData[type].find(facility => facility.id === id);
    if (facilityToEdit) {
      setNewFacility(facilityToEdit);
      setEditingFacility({ type, id });
      setIsDialogOpen(true);
    }
  };

  const renderFacilityForm = () => (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Name"
          value={newFacility?.name || ''}
          onChange={(e) => updateFacility('name', e.target.value)}
        />
      </Grid>
      <Grid item xs={12}>
        <FormControl fullWidth>
          <InputLabel>Location</InputLabel>
          <Select
            value={newFacility?.location || ''}
            onChange={(e) => updateFacility('location', e.target.value as string)}
          >
            {villages.map(village => (
              <MenuItem key={village} value={village}>{village}</MenuItem>
            ))}
            <MenuItem value="Other">Other (Please Specify)</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      {newFacility?.location === 'Other' && (
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Specify Other Location"
            value={newFacility?.otherLocation || ''}
            onChange={(e) => updateFacility('otherLocation', e.target.value)}
          />
        </Grid>
      )}
      <Grid item xs={12}>
        <FormControl fullWidth>
          <InputLabel>Status</InputLabel>
          <Select
            value={newFacility?.status || ''}
            onChange={(e) => updateFacility('status', e.target.value as string)}
          >
            {statusOptions.map(option => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );

  const renderFacilityCard = (type: 'phcs' | 'subCentres' | 'anganwadiCentres', facility: HealthFacility) => (
    <Card key={facility.id} sx={{ mb: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" gutterBottom>{facility.name}</Typography>
        <Typography variant="body2" color="text.secondary">
          Location: {facility.location === 'Other' ? facility.otherLocation : facility.location}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Status: {facility.status}
        </Typography>
      </CardContent>
      <CardActions>
        <IconButton onClick={() => editFacility(type, facility.id)} color="primary" size="small">
          <EditIcon />
        </IconButton>
        <IconButton onClick={() => deleteFacility(type, facility.id)} color="error" size="small">
          <DeleteIcon />
        </IconButton>
      </CardActions>
    </Card>
  );

  const facilityTypes = [
    { key: 'phcs', title: 'Primary Health Centres (PHCs)' },
    { key: 'subCentres', title: 'Sub-Centres (SCs)' },
    { key: 'anganwadiCentres', title: 'Anganwadi Centres' },
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
        Health and Childcare Data
      </Typography>
      
      <Grid container spacing={3}>
        {facilityTypes.map(({ key, title }) => (
          <Grid item xs={12} md={4} key={key}>
            <Paper elevation={3} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom>
                {title}
              </Typography>
              <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2 }}>
                <Grid container spacing={2}>
                  {healthData[key as keyof typeof healthData].map(facility => (
                    <Grid item xs={12} key={facility.id}>
                      {renderFacilityCard(key as 'phcs' | 'subCentres' | 'anganwadiCentres', facility)}
                    </Grid>
                  ))}
                </Grid>
              </Box>
              <Button
                startIcon={<AddIcon />}
                onClick={() => addNewFacility(key as 'phcs' | 'subCentres' | 'anganwadiCentres')}
                variant="contained"
                fullWidth
              >
                Add {title.split(' ')[0]}
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingFacility.id ? 'Edit Facility' : 'Add New Facility'}</DialogTitle>
        <DialogContent>
          {renderFacilityForm()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => saveFacility(editingFacility.type as 'phcs' | 'subCentres' | 'anganwadiCentres')} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HealthChildcareDataCollection;