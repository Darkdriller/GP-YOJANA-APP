import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { app } from '../lib/firebase';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import LocationCityIcon from '@mui/icons-material/LocationCity';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(2),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  textAlign: 'center',
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  fontSize: 40,
  marginBottom: theme.spacing(1),
}));

const AdminOverviewCards: React.FC = () => {
  const [totalGPs, setTotalGPs] = useState<number>(0);
  const [totalUsers, setTotalUsers] = useState<number>(0);

  useEffect(() => {
    const fetchOverviewData = async () => {
      const db = getFirestore(app);
      const usersRef = collection(db, 'users');
      const usersQuery = query(usersRef, where('role', '==', 'Gram Panchayat Personnel'));
      const querySnapshot = await getDocs(usersQuery);

      const gpSet = new Set<string>();
      let userCount = 0;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.gpName) {
          gpSet.add(data.gpName);
        }
        userCount++;
      });

      setTotalGPs(gpSet.size);
      setTotalUsers(userCount);
    };

    fetchOverviewData();
  }, []);

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={6} sm={4} md={3}>
        <StyledCard>
          <CardContent>
            <IconWrapper>
              <LocationCityIcon fontSize="inherit" />
            </IconWrapper>
            <Typography variant="h5" component="div">
              {totalGPs}
            </Typography>
            <Typography variant="body2">
              Gram Panchayats
            </Typography>
          </CardContent>
        </StyledCard>
      </Grid>
      <Grid item xs={6} sm={4} md={3}>
        <StyledCard>
          <CardContent>
            <IconWrapper>
              <PeopleAltIcon fontSize="inherit" />
            </IconWrapper>
            <Typography variant="h5" component="div">
              {totalUsers}
            </Typography>
            <Typography variant="body2">
              Users Registered
            </Typography>
          </CardContent>
        </StyledCard>
      </Grid>
    </Grid>
  );
};

export default AdminOverviewCards;