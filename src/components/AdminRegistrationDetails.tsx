import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Collapse,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { app } from '../lib/firebase';

interface GPPersonnel {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  gpName: string;
  district: string;
  profilePhoto: string;
}

interface GramPanchayat {
  name: string;
  personnel: GPPersonnel[];
}

interface District {
  name: string;
  gramPanchayats: GramPanchayat[];
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const DistrictItem = styled(ListItem)(({ theme }) => ({
  backgroundColor: theme.palette.primary.light,
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
}));

const GPItem = styled(ListItem)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  marginBottom: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  marginLeft: theme.spacing(2),
}));

const PersonnelList = styled(List)(({ theme }) => ({
  paddingLeft: theme.spacing(4),
}));

const AdminRegistrationDetails: React.FC = () => {
  const [districts, setDistricts] = useState<District[]>([]);
  const [expandedDistrict, setExpandedDistrict] = useState<string | null>(null);
  const [expandedGP, setExpandedGP] = useState<string | null>(null);

  useEffect(() => {
    const fetchRegistrationDetails = async () => {
      const db = getFirestore(app);
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('role', '==', 'Gram Panchayat Personnel'));
      const querySnapshot = await getDocs(q);

      const districtMap = new Map<string, Map<string, GPPersonnel[]>>();

      querySnapshot.forEach((doc) => {
        const data = doc.data() as GPPersonnel;
        data.id = doc.id;
        if (!districtMap.has(data.district)) {
          districtMap.set(data.district, new Map<string, GPPersonnel[]>());
        }
        const gpMap = districtMap.get(data.district)!;
        if (gpMap.has(data.gpName)) {
          gpMap.get(data.gpName)!.push(data);
        } else {
          gpMap.set(data.gpName, [data]);
        }
      });

      const sortedDistricts = Array.from(districtMap.entries())
        .map(([districtName, gpMap]) => ({
          name: districtName,
          gramPanchayats: Array.from(gpMap.entries())
            .map(([gpName, personnel]) => ({ name: gpName, personnel }))
            .sort((a, b) => a.name.localeCompare(b.name))
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      setDistricts(sortedDistricts);
    };

    fetchRegistrationDetails();
  }, []);

  const handleExpandDistrict = (districtName: string) => {
    setExpandedDistrict(expandedDistrict === districtName ? null : districtName);
  };

  const handleExpandGP = (gpName: string) => {
    setExpandedGP(expandedGP === gpName ? null : gpName);
  };

  return (
    <StyledPaper elevation={3}>
      <Typography variant="h5" gutterBottom>
        Platform Registration Details
      </Typography>
      <List>
        {districts.map((district) => (
          <React.Fragment key={district.name}>
            <DistrictItem>
              <ListItemText
                primary={district.name}
                secondary={`${district.gramPanchayats.length} Gram Panchayats`}
              />
              <IconButton onClick={() => handleExpandDistrict(district.name)}>
                {expandedDistrict === district.name ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </DistrictItem>
            <Collapse in={expandedDistrict === district.name} timeout="auto" unmountOnExit>
              <List>
                {district.gramPanchayats.map((gp) => (
                  <React.Fragment key={gp.name}>
                    <GPItem>
                      <ListItemText
                        primary={gp.name}
                        secondary={`${gp.personnel.length} registered personnel`}
                      />
                      <IconButton onClick={() => handleExpandGP(gp.name)}>
                        {expandedGP === gp.name ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </GPItem>
                    <Collapse in={expandedGP === gp.name} timeout="auto" unmountOnExit>
                      <PersonnelList>
                        {gp.personnel.map((person) => (
                          <ListItem key={person.id}>
                            <ListItemAvatar>
                              <Avatar src={person.profilePhoto} alt={`${person.firstName} ${person.lastName}`}>
                                {person.firstName[0]}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={`${person.firstName} ${person.lastName}`}
                              secondary={person.email}
                            />
                          </ListItem>
                        ))}
                      </PersonnelList>
                    </Collapse>
                  </React.Fragment>
                ))}
              </List>
            </Collapse>
          </React.Fragment>
        ))}
      </List>
    </StyledPaper>
  );
};

export default AdminRegistrationDetails;