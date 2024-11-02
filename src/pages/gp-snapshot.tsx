import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, query, where, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore';
import { Container, Typography, Box, Grid, Paper, CircularProgress, Card, CardContent, Select, MenuItem, FormControl, InputLabel, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { app } from '../lib/firebase';
import DemographicsOverview from '@/components/GPSnapshot/DemographicsOverview';
import PopulationPyramid from '@/components/GPSnapshot/PopulationPyramid';
import ErrorBoundary from '@/components/ErrorBoundary';
import GenderDistribution from '@/components/GPSnapshot/GenderDistribution';
import AgeDistribution from '@/components/GPSnapshot/AgeDistribution';
import PopulationDistribution from '@/components/GPSnapshot/PopulationDistribution';
import HouseholdsPerVillage from '@/components/GPSnapshot/HouseholdsPerVillage';
import { useRouter } from 'next/router';
import TeacherGenderDistribution from '@/components/GPSnapshot/Education/TeacherGenderDistribution';
import StudentGenderByVillage from '@/components/GPSnapshot/Education/StudentGenderByVillage';
import InfrastructureStatus from '@/components/GPSnapshot/Education/InfrastructureStatus';
import TeacherStudentRatio from '@/components/GPSnapshot/Education/TeacherStudentRatio';
import NewClassroomsRequired from '@/components/GPSnapshot/Education/NewClassroomsRequired';
import SchoolSizeDistribution from '@/components/GPSnapshot/Education/SchoolSizeDistribution';
import FacilityDistribution from '@/components/GPSnapshot/Health/FacilityDistribution';
import FacilityStatus from '@/components/GPSnapshot/Health/FacilityStatus';
import StatisticsOverview from '@/components/GPSnapshot/StatisticsOverview';

const NavButton = styled(Button)(({ theme, active }: { theme: any, active: boolean }) => ({
  color: 'white',
  backgroundColor: active ? theme.palette.grey[700] : theme.palette.grey[500],
  '&:hover': {
    backgroundColor: active ? theme.palette.grey[800] : theme.palette.grey[600],
  },
}));

const ChartContainer = styled(Box)(({ theme }) => ({
  height: '450px',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
}));

const PageSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

// Add this styled component near your other styled components
const VillageSelector = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  '& .MuiFormControl-root': {
    minWidth: 200,
  },
}));

const GPSnapshot: React.FC = () => {
  const [demographicsData, setDemographicsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVillage, setSelectedVillage] = useState<string>('All');
  const [activeView, setActiveView] = useState<'social' | 'economic' | 'environmental'>('social');
  const [gpName, setGpName] = useState<string>('');
  const [educationData, setEducationData] = useState<any>(null);
  const [healthData, setHealthData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth(app);
    const db = getFirestore(app);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          console.log("User authenticated:", user.uid);

          let dataCollectionsQuery = query(
            collection(db, 'dataCollections'),
            where('userId', '==', user.uid),
            orderBy('submittedAt', 'desc'),
            limit(1)
          );

          try {
            const querySnapshot = await getDocs(dataCollectionsQuery);
            if (!querySnapshot.empty) {
              const latestData = querySnapshot.docs[0].data();
              
              if (latestData.formData) {
                if (latestData.formData.Demographics) {
                  setDemographicsData(latestData.formData.Demographics);
                }
                if (latestData.formData.Education) {
                  setEducationData(latestData.formData.Education);
                }
                if (latestData.formData.Health) {
                  setHealthData(latestData.formData.Health);
                }
                if (latestData.formData.HealthChildcare) {
                  setHealthData(latestData.formData.HealthChildcare);
                }
              }
            }

            // Fetch GP Name
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              setGpName(userDoc.data().gpName || 'Unknown GP');
            }
          } catch (indexError) {
            console.log("Index error, falling back to simple query:", indexError);
            dataCollectionsQuery = query(
              collection(db, 'dataCollections'),
              where('userId', '==', user.uid),
              limit(1)
            );
            const querySnapshot = await getDocs(dataCollectionsQuery);
            handleQueryResult(querySnapshot);
          }

          // Fetch GP Name
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setGpName(userDoc.data().gpName || 'Unknown GP');
          }
        } catch (err) {
          console.error("Error fetching data:", err);
          setError("An error occurred while fetching data. Please try again later.");
        } finally {
          setLoading(false);
        }
      } else {
        console.log("No authenticated user");
        setError("Please log in to view the GP Snapshot.");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleQueryResult = (querySnapshot: any) => {
    if (!querySnapshot.empty) {
      const latestData = querySnapshot.docs[0].data();
      console.log("Latest data fetched:", latestData);

      if (latestData.formData && latestData.formData.Demographics) {
        const demographics = latestData.formData.Demographics;
        console.log("Demographics data:", demographics);
        setDemographicsData(demographics);
      } else {
        console.log("No Demographics data in the latest collection");
        setError("No demographics data available. Please complete the data collection first.");
      }
    } else {
      console.log("No data collections found");
      setError("No data available. Please complete the data collection first.");
    }
  };

  const calculateTotals = (data: any) => {
    if (selectedVillage === 'All') {
      return Object.values(data).reduce((acc: any, village: any) => {
        acc.population += parseInt(village.totalPopulation || '0', 10);
        acc.households += parseInt(village.households || '0', 10);
        return acc;
      }, { population: 0, households: 0 });
    } else {
      const villageData = data[selectedVillage];
      return {
        population: parseInt(villageData.totalPopulation || '0', 10),
        households: parseInt(villageData.households || '0', 10)
      };
    }
  };

  const PlaceholderChart = () => (
    <Box height={300} display="flex" justifyContent="center" alignItems="center" bgcolor="#f0f0f0">
      <Typography variant="h6">Future Chart</Typography>
    </Box>
  );

  const renderDashboard = () => {
    switch (activeView) {
      case 'social':
        return (
          <>
            {/* Existing social dashboard content */}
          </>
        );
      case 'economic':
      case 'environmental':
        return (
          <Grid container spacing={3}>
            {[...Array(9)].map((_, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>Future Chart {index + 1}</Typography>
                  <PlaceholderChart />
                </Paper>
              </Grid>
            ))}
          </Grid>
        );
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return <Container maxWidth="xl"><Typography color="error">{error}</Typography></Container>;
  }

  return (
    <Container maxWidth="xl">
      {/* Header Section */}
      <PageSection>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" gutterBottom>GP Snapshot - Social</Typography>
          <Typography variant="h2" fontWeight="bold">{gpName}</Typography>
        </Box>
      </PageSection>

      <ErrorBoundary>
        {/* Statistics Overview Cards */}
        <PageSection>
          <StatisticsOverview 
            demographicsData={demographicsData} 
            educationData={educationData}
            selectedVillage={selectedVillage}
          />
        </PageSection>

        {/* Navigation and Village Selection */}
        <PageSection>
          <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <NavButton active={true} sx={{ mr: 1 }}>Social</NavButton>
              <NavButton onClick={() => router.push('/gp-snapshot/economic')} sx={{ mr: 1 }}>Economic</NavButton>
              <NavButton onClick={() => router.push('/gp-snapshot/environmental')}>Environmental</NavButton>
            </Box>
            <VillageSelector>
              <Typography variant="subtitle1" fontWeight="medium">
                Select Village:
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={selectedVillage}
                  onChange={(e) => setSelectedVillage(e.target.value as string)}
                  displayEmpty
                  sx={{
                    backgroundColor: 'white',
                    '& .MuiSelect-select': {
                      fontWeight: 'bold',
                    }
                  }}
                >
                  <MenuItem value="All">All Villages</MenuItem>
                  {Object.keys(demographicsData).map((village) => (
                    <MenuItem key={village} value={village}>{village}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </VillageSelector>
          </Box>
        </PageSection>

        {/* Demographics Section */}
        <PageSection>
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>Demographics Overview</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <ChartContainer elevation={3}>
                <Typography variant="h6" gutterBottom>Gender Distribution</Typography>
                <Box flexGrow={1}>
                  <GenderDistribution data={selectedVillage === 'All' ? demographicsData : { [selectedVillage]: demographicsData[selectedVillage] }} />
                </Box>
              </ChartContainer>
            </Grid>
            <Grid item xs={12} md={6}>
              <ChartContainer elevation={3}>
                <Typography variant="h6" gutterBottom>Age Distribution</Typography>
                <Box flexGrow={1}>
                  <AgeDistribution data={selectedVillage === 'All' ? demographicsData : { [selectedVillage]: demographicsData[selectedVillage] }} />
                </Box>
              </ChartContainer>
            </Grid>
            <Grid item xs={12} md={6}>
              <ChartContainer elevation={3}>
                <Typography variant="h6" gutterBottom>Population Distribution</Typography>
                <Box flexGrow={1}>
                  <PopulationDistribution data={demographicsData} selectedVillage={selectedVillage} />
                </Box>
              </ChartContainer>
            </Grid>
            <Grid item xs={12} md={6}>
              <ChartContainer elevation={3}>
                <Typography variant="h6" gutterBottom>Households per Village</Typography>
                <Box flexGrow={1}>
                  <HouseholdsPerVillage data={demographicsData} selectedVillage={selectedVillage} />
                </Box>
              </ChartContainer>
            </Grid>
            <Grid item xs={12}>
              <ChartContainer sx={{ height: '550px' }}> {/* Increased height for better visibility */}
                <Typography variant="h6" gutterBottom>Population Pyramid</Typography>
                <Box flexGrow={1}>
                  <PopulationPyramid data={selectedVillage === 'All' ? demographicsData : { [selectedVillage]: demographicsData[selectedVillage] }} />
                </Box>
              </ChartContainer>
            </Grid>
          </Grid>
        </PageSection>

        {/* Education Section */}
        <PageSection>
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>Education Overview</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <ChartContainer>
                <Typography variant="h6" gutterBottom>Teacher Gender Distribution</Typography>
                <Box flexGrow={1}>
                  <TeacherGenderDistribution data={educationData} />
                </Box>
              </ChartContainer>
            </Grid>
            <Grid item xs={12} md={6}>
              <ChartContainer>
                <Typography variant="h6" gutterBottom>Student Gender by Village</Typography>
                <Box flexGrow={1}>
                  <StudentGenderByVillage data={educationData} />
                </Box>
              </ChartContainer>
            </Grid>
            <Grid item xs={12} md={6}>
              <ChartContainer>
                <Typography variant="h6" gutterBottom>Infrastructure Status</Typography>
                <Box flexGrow={1}>
                  <InfrastructureStatus data={educationData} />
                </Box>
              </ChartContainer>
            </Grid>
            <Grid item xs={12} md={6}>
              <ChartContainer>
                <Typography variant="h6" gutterBottom>Teacher-Student Ratio</Typography>
                <Box flexGrow={1}>
                  <TeacherStudentRatio data={educationData} />
                </Box>
              </ChartContainer>
            </Grid>
            {/* Removed New Classrooms Required and School Size Distribution charts */}
          </Grid>
        </PageSection>

        {/* Health Section */}
        <PageSection>
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>Health Facilities Overview</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <ChartContainer>
                <Typography variant="h6" gutterBottom>Facility Distribution</Typography>
                <Box flexGrow={1}>
                  <FacilityDistribution data={healthData} />
                </Box>
              </ChartContainer>
            </Grid>
            <Grid item xs={12} md={6}>
              <ChartContainer>
                <Typography variant="h6" gutterBottom>Facility Status Overview</Typography>
                <Box flexGrow={1}>
                  <FacilityStatus data={healthData} />
                </Box>
              </ChartContainer>
            </Grid>
          </Grid>
        </PageSection>
      </ErrorBoundary>
    </Container>
  );
};

export default GPSnapshot;
