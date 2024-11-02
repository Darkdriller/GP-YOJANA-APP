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
  Grid,
  Paper,
  IconButton,
  Collapse,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import EditIcon from '@mui/icons-material/Edit';

interface School {
  id: string;
  name: string;
  teachersMale: number;
  teachersFemale: number;
  studentsTotal: number;
  studentsMale: number;
  studentsFemale: number;
  classEnrollment: { [key: string]: number };
  newClassroomsRequired: number;
  infrastructureStatus: string;
}

interface EducationDataProps {
  villages: string[];
  initialData?: { [village: string]: School[] };
  onDataChange: (data: { [village: string]: School[] }) => void;
}

const infrastructureOptions = [
  'Excellent Condition',
  'Good Condition',
  'Needs Repairs',
  'Critical Condition',
];

const SchoolCard: React.FC<{ school: School; onEdit: () => void; onDelete: () => void }> = ({ school, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => setExpanded(!expanded);

  return (
    <Card sx={{ mt: 2, mb: 2 }}>
      <CardContent>
        <Typography variant="h6">{school.name}</Typography>
        <Typography>Teachers: Male - {school.teachersMale}, Female - {school.teachersFemale}</Typography>
        <Typography>Students: Total - {school.studentsTotal} (Male: {school.studentsMale}, Female: {school.studentsFemale})</Typography>
        <Typography>Infrastructure: {school.infrastructureStatus}</Typography>
        <Typography>New Classrooms Required: {school.newClassroomsRequired}</Typography>
        <Button
          onClick={toggleExpand}
          endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        >
          {expanded ? 'Hide' : 'Show'} Class-wise Enrollment
        </Button>
        <Collapse in={expanded}>
          <Box sx={{ mt: 1 }}>
            <Typography variant="subtitle2">Class-wise Enrollment:</Typography>
            {Object.entries(school.classEnrollment).length > 0 ? (
              Object.entries(school.classEnrollment).map(([classNum, enrollment]) => (
                <Typography key={classNum}>Class {classNum}: {enrollment}</Typography>
              ))
            ) : (
              <Typography>Class-wise enrollment data - Not Entered</Typography>
            )}
          </Box>
        </Collapse>
      </CardContent>
      <CardActions>
        <IconButton onClick={onEdit} color="primary">
          <EditIcon />
        </IconButton>
        <IconButton onClick={onDelete} color="error">
          <DeleteIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
};

const EducationDataCollection: React.FC<EducationDataProps> = ({
  villages,
  initialData = {},
  onDataChange,
}) => {
  const [educationData, setEducationData] = useState<{ [village: string]: School[] }>({});
  const [editingSchool, setEditingSchool] = useState<{ village: string; school: School | null }>({ village: '', school: null });
  const [expandedSchools, setExpandedSchools] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const newData = { ...initialData };
    villages.forEach(village => {
      if (!newData[village]) {
        newData[village] = [];
      }
    });
    setEducationData(newData);
  }, [villages, initialData]);

  const addSchool = (village: string) => {
    const newSchool: School = {
      id: Date.now().toString(),
      name: '',
      teachersMale: 0,
      teachersFemale: 0,
      studentsTotal: 0,
      studentsMale: 0,
      studentsFemale: 0,
      classEnrollment: {},
      newClassroomsRequired: 0,
      infrastructureStatus: '',
    };
    setEditingSchool({ village, school: newSchool });
  };

  const updateSchoolField = (field: string, value: any) => {
    if (editingSchool.school) {
      setEditingSchool(prev => ({
        ...prev,
        school: { ...prev.school!, [field]: value }
      }));
    }
  };

  const saveSchool = () => {
    if (editingSchool.school) {
      const { village, school } = editingSchool;
      const updatedSchools = [...(educationData[village] || [])];
      const existingIndex = updatedSchools.findIndex(s => s.id === school.id);
      
      if (existingIndex !== -1) {
        updatedSchools[existingIndex] = school;
      } else {
        updatedSchools.push(school);
      }

      const newEducationData = {
        ...educationData,
        [village]: updatedSchools,
      };

      setEducationData(newEducationData);
      onDataChange(newEducationData);
      setEditingSchool({ village: '', school: null });
    }
  };

  const editSavedSchool = (village: string, school: School) => {
    setEditingSchool({ village, school });
  };

  const deleteSavedSchool = (village: string, schoolId: string) => {
    const updatedSchools = educationData[village].filter(school => school.id !== schoolId);
    const newEducationData = {
      ...educationData,
      [village]: updatedSchools,
    };
    setEducationData(newEducationData);
    onDataChange(newEducationData);
  };

  const toggleClassEnrollment = (village: string, schoolId: string) => {
    const key = `${village}-${schoolId}`;
    setExpandedSchools(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const renderSchoolForm = () => {
    const { village, school } = editingSchool;
    const isExpanded = expandedSchools[`${village}-${school?.id}`] || false;

    return (
      <Box key={school?.id} sx={{ mb: 2, p: 2, border: '1px solid #ccc', borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="School Name"
              value={school?.name || ''}
              onChange={(e) => updateSchoolField('name', e.target.value)}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              type="number"
              label="Male Teachers"
              value={school?.teachersMale || 0}
              onChange={(e) => updateSchoolField('teachersMale', Number(e.target.value))}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              type="number"
              label="Female Teachers"
              value={school?.teachersFemale || 0}
              onChange={(e) => updateSchoolField('teachersFemale', Number(e.target.value))}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              fullWidth
              type="number"
              label="Total Students"
              value={school?.studentsTotal || 0}
              onChange={(e) => updateSchoolField('studentsTotal', Number(e.target.value))}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              fullWidth
              type="number"
              label="Male Students"
              value={school?.studentsMale || 0}
              onChange={(e) => updateSchoolField('studentsMale', Number(e.target.value))}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              fullWidth
              type="number"
              label="Female Students"
              value={school?.studentsFemale || 0}
              onChange={(e) => updateSchoolField('studentsFemale', Number(e.target.value))}
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              onClick={() => toggleClassEnrollment(village, school!.id)}
              endIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            >
              {isExpanded ? 'Hide' : 'Show'} Class-wise Enrollment
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Collapse in={isExpanded}>
              <Grid container spacing={2}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(classNum => (
                  <Grid item xs={6} sm={4} md={3} key={classNum}>
                    <TextField
                      fullWidth
                      type="number"
                      label={`Class ${classNum} Enrollment`}
                      value={school?.classEnrollment[classNum] || ''}
                      onChange={(e) => updateSchoolField('classEnrollment', {
                        ...school?.classEnrollment,
                        [classNum]: Number(e.target.value)
                      })}
                    />
                  </Grid>
                ))}
              </Grid>
            </Collapse>
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              type="number"
              label="New Classrooms Required"
              value={school?.newClassroomsRequired || 0}
              onChange={(e) => updateSchoolField('newClassroomsRequired', Number(e.target.value))}
            />
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Infrastructure Status</InputLabel>
              <Select
                value={school?.infrastructureStatus || ''}
                onChange={(e) => updateSchoolField('infrastructureStatus', e.target.value)}
              >
                {infrastructureOptions.map(option => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            startIcon={<SaveIcon />}
            onClick={saveSchool}
            variant="contained"
            color="primary"
            disabled={!editingSchool.school}
            sx={{ mr: 1 }}
          >
            Update
          </Button>
          <IconButton onClick={() => deleteSavedSchool(village, school!.id)} color="error">
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>
    );
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Education Data
      </Typography>
      <Grid container spacing={2}>
        {villages.map(village => (
          <Grid item xs={12} md={6} key={village}>
            <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                {village}
              </Typography>
              {educationData[village]?.map((school) => (
                <SchoolCard 
                  key={school.id} 
                  school={school} 
                  onEdit={() => editSavedSchool(village, school)}
                  onDelete={() => deleteSavedSchool(village, school.id)}
                />
              ))}
              {editingSchool.village === village && renderSchoolForm()}
              <Button
                startIcon={<AddIcon />}
                onClick={() => addSchool(village)}
                variant="outlined"
                sx={{ mt: 2 }}
              >
                Add School
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default EducationDataCollection;