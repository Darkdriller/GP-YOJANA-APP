import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid, CircularProgress, Select, MenuItem, FormControl, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, query, where, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore';
import { app } from '../../lib/firebase';
import { useRouter } from 'next/router';
import ErrorBoundary from '@/components/ErrorBoundary';
import MigrationTrendChart from '@/components/GPSnapshot/Economic/MigrationTrendChart';
import MigrantGenderDistribution from '@/components/GPSnapshot/Economic/MigrantGenderDistribution';
import LandlessHouseholdsTrend from '@/components/GPSnapshot/Economic/LandlessHouseholdsTrend';
import MGNREGSPerformance from '@/components/GPSnapshot/Economic/MGNREGSPerformance';
import MigrationTypeComparison from '@/components/GPSnapshot/Economic/MigrationTypeComparison';
import MGNREGSCoverage from '@/components/GPSnapshot/Economic/MGNREGSCoverage';
import RoadInfrastructureChart from '@/components/GPSnapshot/Economic/RoadInfrastructureChart';
import PanchayatFinancesChart from '@/components/GPSnapshot/Economic/PanchayatFinancesChart';
import EconomicStatistics from '@/components/GPSnapshot/Economic/EconomicStatistics';

interface MigrationEmploymentData {
  [village: string]: {
    householdsReportingMigration: number;
    seasonalMigrantsMale: number;
    seasonalMigrantsFemale: number;
    permanentMigrantsMale: number;
    permanentMigrantsFemale: number;
    landlessHouseholds: number;
    householdsWithMGNREGSCards: number;
    workdaysProvidedMGNREGS: number;
  };
}

const NavButton = styled(Button)<{ active?: boolean }>(({ theme, active }) => ({
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

const PageSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

const EconomicSnapshot: React.FC = () => {
  const [migrationData, setMigrationData] = useState<MigrationEmploymentData | null>(null);
  const [demographicsData, setDemographicsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVillage, setSelectedVillage] = useState<string>('All');
  const [gpName, setGpName] = useState<string>('');
  const [villages, setVillages] = useState<string[]>([]);
  const [roadInfraData, setRoadInfraData] = useState<any>(null);
  const [financesData, setFinancesData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth(app);
    const db = getFirestore(app);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          console.log("User authenticated:", user.uid);

          const dataCollectionsQuery = query(
            collection(db, 'dataCollections'),
            where('userId', '==', user.uid),
            orderBy('submittedAt', 'desc'),
            limit(1)
          );

          const querySnapshot = await getDocs(dataCollectionsQuery);
          if (!querySnapshot.empty) {
            const latestData = querySnapshot.docs[0].data();
            console.log("Latest data:", latestData);
            
            if (latestData.formData?.MigrationEmployment) {
              const migrationEmployment = latestData.formData.MigrationEmployment;
              console.log("Raw Migration Employment data:", migrationEmployment);

              // Get villages from Demographics data if available
              const villageNames = latestData.formData?.Demographics ? 
                Object.keys(latestData.formData.Demographics) : [];
              console.log("Villages from Demographics:", villageNames);

              // Convert array data to object format
              const processedData: MigrationEmploymentData = {};
              
              // Check if migrationEmployment is an array
              if (Array.isArray(migrationEmployment)) {
                migrationEmployment.forEach((item, index) => {
                  const villageName = villageNames[index] || `Village ${index + 1}`;
                  processedData[villageName] = {
                    householdsReportingMigration: item.householdsReportingMigration || 0,
                    seasonalMigrantsMale: item.seasonalMigrantsMale || 0,
                    seasonalMigrantsFemale: item.seasonalMigrantsFemale || 0,
                    permanentMigrantsMale: item.permanentMigrantsMale || 0,
                    permanentMigrantsFemale: item.permanentMigrantsFemale || 0,
                    landlessHouseholds: item.landlessHouseholds || 0,
                    householdsWithMGNREGSCards: item.householdsWithMGNREGSCards || 0,
                    workdaysProvidedMGNREGS: item.workdaysProvidedMGNREGS || 0,
                  };
                });
              } else {
                // Handle if it's already an object
                Object.entries(migrationEmployment).forEach(([key, value]) => {
                  if (key !== 'submittedAt' && key !== 'userId' && typeof value === 'object') {
                    processedData[key] = value as any;
                  }
                });
              }

              console.log("Processed migration data:", processedData);
              setMigrationData(processedData);
              setVillages(villageNames);

              if (latestData.formData?.Demographics) {
                console.log('Setting Demographics data:', latestData.formData.Demographics);
                setDemographicsData(latestData.formData.Demographics);
              }

              if (latestData.formData?.RoadInfrastructure) {
                console.log('Raw Road Infrastructure data:', latestData.formData.RoadInfrastructure);
                // Make sure the data is in array format
                const roadData = Array.isArray(latestData.formData.RoadInfrastructure) 
                  ? latestData.formData.RoadInfrastructure 
                  : Object.values(latestData.formData.RoadInfrastructure);
                setRoadInfraData(roadData);
              }

              if (latestData.formData?.PanchayatFinances) {
                console.log('Setting Finances data:', latestData.formData.PanchayatFinances);
                setFinancesData(latestData.formData.PanchayatFinances);
              }
            }
          }

          // Fetch GP Name
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setGpName(userDoc.data().gpName || 'Unknown GP');
          }
        } catch (err) {
          console.error("Error fetching data:", err);
          setError("An error occurred while fetching data");
        } finally {
          setLoading(false);
        }
      } else {
        setError("Please log in to view the GP Snapshot");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

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
      <PageSection>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" gutterBottom>GP Snapshot - Economic</Typography>
          <Typography variant="h2" fontWeight="bold">{gpName}</Typography>
        </Box>
      </PageSection>

      <ErrorBoundary>
        {/* Add Statistics Overview */}
        <EconomicStatistics
          migrationData={migrationData}
          roadInfraData={roadInfraData}
          panchayatFinances={financesData}
          selectedVillage={selectedVillage}
        />

        <PageSection>
          {/* Navigation and Village Selection */}
          <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <NavButton onClick={() => router.push('/gp-snapshot')} sx={{ mr: 1 }}>Social</NavButton>
              <NavButton active={true} sx={{ mr: 1 }}>Economic</NavButton>
              <NavButton onClick={() => router.push('/gp-snapshot/environmental')}>Environmental</NavButton>
            </Box>
            <VillageSelector>
              <Typography variant="subtitle1" fontWeight="medium">
                Select Village:
              </Typography>
              <FormControl>
                <Select
                  value={selectedVillage}
                  onChange={(e) => setSelectedVillage(e.target.value as string)}
                  displayEmpty
                  sx={{ backgroundColor: 'white' }}
                >
                  <MenuItem value="All">All Villages</MenuItem>
                  {villages.map((village) => (
                    <MenuItem key={village} value={village}>{village}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </VillageSelector>
          </Box>
        </PageSection>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <ChartContainer>
              <Typography variant="h6" gutterBottom>Seasonal vs Permanent Migration</Typography>
              <Box flexGrow={1}>
                <MigrationTrendChart data={migrationData} selectedVillage={selectedVillage} />
              </Box>
            </ChartContainer>
          </Grid>
          <Grid item xs={12} md={6}>
            <ChartContainer>
              <Typography variant="h6" gutterBottom>Gender Distribution of Migrants</Typography>
              <Box flexGrow={1}>
                <MigrantGenderDistribution data={migrationData} selectedVillage={selectedVillage} />
              </Box>
            </ChartContainer>
          </Grid>
          <Grid item xs={12} md={6}>
            <ChartContainer>
              <Typography variant="h6" gutterBottom>Migrating vs Landless vs Total Households</Typography>
              <Box flexGrow={1}>
                <LandlessHouseholdsTrend 
                  data={migrationData} 
                  demographicsData={demographicsData}
                  selectedVillage={selectedVillage} 
                />
              </Box>
            </ChartContainer>
          </Grid>
          <Grid item xs={12} md={6}>
            <ChartContainer>
              <Typography variant="h6" gutterBottom>MGNREGS Implementation</Typography>
              <Box flexGrow={1}>
                <MGNREGSPerformance 
                  data={migrationData} 
                  demographicsData={demographicsData}
                  selectedVillage={selectedVillage} 
                />
              </Box>
            </ChartContainer>
          </Grid>
          <Grid item xs={12} md={6}>
            <ChartContainer>
              <Typography variant="h6" gutterBottom>Employment Status</Typography>
              <Box flexGrow={1}>
                <MigrationTypeComparison data={migrationData} selectedVillage={selectedVillage} />
              </Box>
            </ChartContainer>
          </Grid>
          <Grid item xs={12} md={6}>
            <ChartContainer>
              <Typography variant="h6" gutterBottom>MGNREGS Coverage</Typography>
              <Box flexGrow={1}>
                <MGNREGSCoverage 
                  data={migrationData} 
                  demographicsData={demographicsData}
                  selectedVillage={selectedVillage} 
                />
              </Box>
            </ChartContainer>
          </Grid>
          <Grid item xs={12} md={6}>
            <ChartContainer>
              <Typography variant="h6" gutterBottom>Road Infrastructure</Typography>
              <Box flexGrow={1}>
                <RoadInfrastructureChart 
                  data={roadInfraData} 
                  selectedVillage={selectedVillage}
                  villages={villages}
                />
              </Box>
            </ChartContainer>
          </Grid>
          <Grid item xs={12} md={6}>
            <ChartContainer>
              <Typography variant="h6" gutterBottom>Panchayat Finances</Typography>
              <Box flexGrow={1}>
                <PanchayatFinancesChart data={financesData} />
              </Box>
            </ChartContainer>
          </Grid>
        </Grid>
      </ErrorBoundary>
    </Container>
  );
};

export default EconomicSnapshot;
