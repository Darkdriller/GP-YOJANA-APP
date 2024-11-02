// src/pages/gp-snapshot/environmental.tsx

import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid, CircularProgress, Select, MenuItem, FormControl, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, query, where, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore';
import { app } from '../../lib/firebase';
import { useRouter } from 'next/router';
import ErrorBoundary from '@/components/ErrorBoundary';
import EnvironmentalStatistics from '@/components/GPSnapshot/Environmental/EnvironmentalStatistics';
import LandUseMappingChart from '@/components/GPSnapshot/Environmental/LandUseMappingChart';
import CommonLandTreemap from '@/components/GPSnapshot/Environmental/CommonLandTreemap';
import WaterResourceDistributionChart from '@/components/GPSnapshot/Environmental/WaterResourceDistributionChart';
import WaterBodiesConditionChart from '@/components/GPSnapshot/Environmental/WaterBodiesConditionChart';
import IrrigationStatusByTypeChart from '@/components/GPSnapshot/Environmental/IrrigationStatusByTypeChart';
import IrrigationPotentialByLocation from '@/components/GPSnapshot/Environmental/IrrigationPotentialByLocation';

// Styled components
const NavButton = styled(Button)<{ active?: boolean }>(({ theme, active }) => ({
  color: 'white',
  backgroundColor: active ? theme.palette.grey[700] : theme.palette.grey[500],
  '&:hover': {
    backgroundColor: active ? theme.palette.grey[800] : theme.palette.grey[600],
  },
}));

const ChartContainer = styled(Box)(({ theme }) => ({
  height: '400px', // Consistent height
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden', // Prevent content from overflowing
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

const EnvironmentalSnapshot: React.FC = () => {
  const [landUseData, setLandUseData] = useState<any>(null);
  const [commonLandAreas, setCommonLandAreas] = useState<any[]>([]); // Initialized as array
  const [waterResourcesData, setWaterResourcesData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVillage, setSelectedVillage] = useState<string>('All');
  const [gpName, setGpName] = useState<string>('');
  const [villages, setVillages] = useState<string[]>([]);
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

            // Set Land Use Data
            if (latestData.formData?.LandUseMapping) {
              console.log('Raw Land Use data from Firebase:', latestData.formData.LandUseMapping);

              if (Array.isArray(latestData.formData.LandUseMapping.landUseData)) {
                const processedData = latestData.formData.LandUseMapping.landUseData.reduce((acc: any, item: any) => {
                  if (item.village) {
                    acc[item.village] = {
                      totalCultivableLand: Number(item.totalCultivableLand) || 0,
                      irrigatedLand: Number(item.irrigatedLand) || 0,
                      forestArea: Number(item.forestArea) || 0
                    };
                  }
                  return acc;
                }, {});

                console.log('Processed Land Use data:', processedData);
                setLandUseData(processedData);
              }

              // Set Common Land Areas Data
              if (Array.isArray(latestData.formData.LandUseMapping.commonLandAreas)) {
                console.log('Raw Common Land Areas data from Firebase:', latestData.formData.LandUseMapping.commonLandAreas);
                setCommonLandAreas(latestData.formData.LandUseMapping.commonLandAreas);
              } else {
                console.warn('commonLandAreas is not an array');
                setCommonLandAreas([]);
              }
            }

            // Set Water Resources Data
            if (latestData.formData?.WaterResources) {
              console.log('Setting Water Resources data:', latestData.formData.WaterResources);
              setWaterResourcesData(latestData.formData.WaterResources);
            }

            // Set Villages
            if (latestData.formData?.Demographics) {
              const villageNames = Object.keys(latestData.formData.Demographics).filter(village => {
                const demographics = latestData.formData.Demographics[village];
                return demographics && demographics.totalPopulation && demographics.totalPopulation.trim() !== "";
              });
              console.log("Villages:", villageNames);
              setVillages(villageNames);
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
          <Typography variant="h4" gutterBottom>GP Snapshot - Environmental</Typography>
          <Typography variant="h2" fontWeight="bold">{gpName}</Typography>
        </Box>
      </PageSection>

      <ErrorBoundary>
        <PageSection>
          {/* Navigation and Village Selection */}
          <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <NavButton 
                active={selectedVillage === 'Social'} 
                onClick={() => router.push('/gp-snapshot')} 
                sx={{ mr: 1 }}
              >
                Social
              </NavButton>
              <NavButton 
                active={selectedVillage === 'Economic'} 
                onClick={() => router.push('/gp-snapshot/economic')} 
                sx={{ mr: 1 }}
              >
                Economic
              </NavButton>
              <NavButton 
                active={selectedVillage === 'Environmental'} 
                onClick={() => router.push('/gp-snapshot/environmental')}
              >
                Environmental
              </NavButton>
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

        {/* Statistics Cards */}
        <EnvironmentalStatistics 
          landUseData={landUseData}
          waterResourcesData={waterResourcesData}
          selectedVillage={selectedVillage}
        />

        {/* Charts Grid */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <ChartContainer>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>Land Use Distribution</Typography>
              </Box>
              <Box sx={{ 
                flexGrow: 1,
                height: 'calc(100% - 40px)'
              }}>
                <LandUseMappingChart 
                  data={landUseData} 
                  selectedVillage={selectedVillage} 
                />
              </Box>
            </ChartContainer>
          </Grid>
          <Grid item xs={12} md={6}>
            <ChartContainer>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>Common Land Area Analysis</Typography>
              </Box>
              <Box sx={{ 
                flexGrow: 1,
                height: 'calc(100% - 40px)'
              }}>
                <CommonLandTreemap 
                  data={commonLandAreas} // Already an array
                  selectedVillage={selectedVillage} 
                />
              </Box>
            </ChartContainer>
          </Grid>
          {/* New Water Resource Distribution Chart */}
          <Grid item xs={12} md={6}>
            <ChartContainer>
              <WaterResourceDistributionChart 
                waterBodies={waterResourcesData?.waterBodies || []} 
                selectedVillage={selectedVillage} // Pass the selected village
              />
            </ChartContainer>
          </Grid>
          {/* New Water Bodies Condition Chart */}
          <Grid item xs={12} md={6}>
            <ChartContainer>
              <WaterBodiesConditionChart 
                waterBodies={waterResourcesData?.waterBodies || []} 
                selectedVillage={selectedVillage}
              />
            </ChartContainer>
          </Grid>
          {/* Add more charts as needed */}
          <Grid item xs={12} md={6}>
            <ChartContainer>
              <IrrigationStatusByTypeChart 
                irrigationStructures={waterResourcesData?.irrigationStructures || []} 
                selectedVillage={selectedVillage}
              />
            </ChartContainer>
          </Grid>

          <Grid item xs={12} md={6}>
            <ChartContainer>
              <IrrigationPotentialByLocation 
                irrigationStructures={waterResourcesData?.irrigationStructures || []} 
                selectedVillage={selectedVillage}
              />
            </ChartContainer>
          </Grid>
        </Grid>
      </ErrorBoundary>
    </Container>
  );
};

export default EnvironmentalSnapshot;
