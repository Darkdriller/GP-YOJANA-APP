import React from 'react';
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Button,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

interface PastDataCollectionsProps {
  pastCollections: any[];
  onEdit: (collectionId: string) => void;
}

const PastDataCollections: React.FC<PastDataCollectionsProps> = ({ pastCollections, onEdit }) => {
  return (
    <Paper elevation={3} sx={{ mb: 4, p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Past Collected Data
      </Typography>
      <List>
        {pastCollections.map((collection) => (
          <ListItem key={collection.id}>
            <ListItemText
              primary={`Financial Year: ${collection.financialYear}`}
              secondary={`Collected on: ${new Date(collection.submittedAt).toLocaleString()}`}
            />
            <ListItemSecondaryAction>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => onEdit(collection.id)}
                sx={{
                  backgroundColor: '#4ba93f',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#3d8a33',
                  },
                }}
              >
                Edit
              </Button>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default PastDataCollections;