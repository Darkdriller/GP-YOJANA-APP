// src/pages/reports.tsx

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { 
  Download as DownloadIcon,
  PieChart as PieChartIcon,
  TableChart as TableChartIcon,
  BarChart as BarChartIcon 
} from '@mui/icons-material';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { app } from '../lib/firebase';
import * as XLSX from '@/lib/sheetjs/xlsx.mjs';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const Reports: React.FC = () => {
  const [userData, setUserData] = useState<any>(null);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  
  const router = useRouter();
  const auth = getAuth(app);
  const db = getFirestore(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserData(userData);
          fetchAvailableYears(user.uid, userData.gpName);
        }
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router, auth, db]);

  const fetchAvailableYears = async (userId: string, gpName: string) => {
    const collectionsQuery = query(
      collection(db, 'dataCollections'),
      where('gpName', '==', gpName)
    );
    const querySnapshot = await getDocs(collectionsQuery);
    const years = querySnapshot.docs.map(doc => doc.data().financialYear);
    setAvailableYears(Array.from(new Set(years)).sort());
    if (years.length > 0) {
      setSelectedYear(years[years.length - 1]);
    }
    setLoading(false);
  };

  const fetchReportData = async (year: string) => {
    setLoading(true);
    const collectionsQuery = query(
      collection(db, 'dataCollections'),
      where('gpName', '==', userData.gpName),
      where('financialYear', '==', year)
    );
    const querySnapshot = await getDocs(collectionsQuery);
    if (!querySnapshot.empty) {
      const data = querySnapshot.docs[0].data();
      console.log('Fetched Data:', data); // For debugging
      setReportData(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (selectedYear && userData) {
      fetchReportData(selectedYear);
    }
  }, [selectedYear, userData]);

  const calculateAllSummaries = (formData: any) => {
    // Helper function to safely parse number
    const parseNumber = (value: any) => !isNaN(Number(value)) ? Number(value) : 0;

    const summaries = {
      demographics: {
        totalPopulation: 0,
        totalHouseholds: 0,
        totalMale: 0,
        totalFemale: 0
      },
      education: {
        totalSchools: 0,
        totalStudents: 0,
        totalTeachers: 0
      },
      healthChildcare: {
        totalPHCs: 0,
        totalSubCentres: 0,
        totalAnganwadis: 0
      },
      migrationEmployment: {
        totalMigrants: 0,
        totalMGNREGSCards: 0,
        totalWorkdays: 0
      },
      roadInfrastructure: {
        totalCCRoad: 0,
        totalKuchhaRoad: 0,
        totalRepairRequired: 0
      },
      panchayatFinances: {
        totalRevenue: 0,
        cfc: 0,
        sfc: 0,
        ownSources: 0,
        mgnregs: 0
      },
      landUseMapping: {
        totalCultivableLand: 0,
        totalIrrigatedLand: 0,
        totalForestArea: 0,
        totalCommonLand: 0
      },
      waterResources: {
        totalWaterBodies: 0,
        totalIrrigationStructures: 0,
        totalIrrigationPotential: 0
      }
    };

    if (!formData) return summaries;

    // Demographics calculations
    if (formData.Demographics) {
      Object.values(formData.Demographics).forEach((village: any) => {
        summaries.demographics.totalPopulation += parseNumber(village.totalPopulation);
        summaries.demographics.totalHouseholds += parseNumber(village.households);
        summaries.demographics.totalMale += parseNumber(village.malePopulation);
        summaries.demographics.totalFemale += parseNumber(village.femalePopulation);
      });
    }

    // Education calculations
    if (formData.Education) {
      Object.values(formData.Education).forEach((village: any) => {
        if (Array.isArray(village)) {
          summaries.education.totalSchools += village.length;
          village.forEach((school: any) => {
            summaries.education.totalStudents += parseNumber(school.studentsTotal);
            summaries.education.totalTeachers += parseNumber(school.teachersMale) + parseNumber(school.teachersFemale);
          });
        }
      });
    }

    // Health & Childcare calculations
    if (formData.HealthChildcare) {
      summaries.healthChildcare.totalPHCs = (formData.HealthChildcare.phcs || []).length;
      summaries.healthChildcare.totalSubCentres = (formData.HealthChildcare.subCentres || []).length;
      summaries.healthChildcare.totalAnganwadis = (formData.HealthChildcare.anganwadiCentres || []).length;
    }

    // Migration & Employment calculations
    if (Array.isArray(formData.MigrationEmployment)) {
      formData.MigrationEmployment.forEach((village: any) => {
        summaries.migrationEmployment.totalMigrants += 
          parseNumber(village.seasonalMigrantsMale) + 
          parseNumber(village.seasonalMigrantsFemale) +
          parseNumber(village.permanentMigrantsMale) + 
          parseNumber(village.permanentMigrantsFemale);
        summaries.migrationEmployment.totalMGNREGSCards += parseNumber(village.householdsWithMGNREGSCards);
        summaries.migrationEmployment.totalWorkdays += parseNumber(village.workdaysProvidedMGNREGS);
      });
    }

    // Road Infrastructure calculations
    if (Array.isArray(formData.RoadInfrastructure)) {
      formData.RoadInfrastructure.forEach((village: any) => {
        summaries.roadInfrastructure.totalCCRoad += parseNumber(village.totalCCRoad);
        summaries.roadInfrastructure.totalKuchhaRoad += parseNumber(village.kuchhaRoad);
        summaries.roadInfrastructure.totalRepairRequired += parseNumber(village.repairRequired);
      });
    }

    // Panchayat Finances calculations
    if (formData.PanchayatFinances) {
      summaries.panchayatFinances = {
        ...formData.PanchayatFinances,
        totalRevenue: parseNumber(formData.PanchayatFinances.cfc) +
                     parseNumber(formData.PanchayatFinances.sfc) +
                     parseNumber(formData.PanchayatFinances.ownSources) +
                     parseNumber(formData.PanchayatFinances.mgnregs)
      };
    }

    // Land Use Mapping calculations
    if (formData.LandUseMapping) {
      if (Array.isArray(formData.LandUseMapping.landUseData)) {
        formData.LandUseMapping.landUseData.forEach((data: any) => {
          summaries.landUseMapping.totalCultivableLand += parseNumber(data.totalCultivableLand);
          summaries.landUseMapping.totalIrrigatedLand += parseNumber(data.irrigatedLand);
          summaries.landUseMapping.totalForestArea += parseNumber(data.forestArea);
        });
      }
      if (Array.isArray(formData.LandUseMapping.commonLandAreas)) {
        formData.LandUseMapping.commonLandAreas.forEach((area: any) => {
          summaries.landUseMapping.totalCommonLand += parseNumber(area.area);
        });
      }
    }

    // Water Resources calculations
    if (formData.WaterResources) {
      summaries.waterResources.totalWaterBodies = (formData.WaterResources.waterBodies || []).length;
      summaries.waterResources.totalIrrigationStructures = (formData.WaterResources.irrigationStructures || []).length;
      if (Array.isArray(formData.WaterResources.waterBodies)) {
        formData.WaterResources.waterBodies.forEach((wb: any) => {
          summaries.waterResources.totalIrrigationPotential += parseNumber(wb.irrigationPotential);
        });
      }
      if (Array.isArray(formData.WaterResources.irrigationStructures)) {
        formData.WaterResources.irrigationStructures.forEach((structure: any) => {
          summaries.waterResources.totalIrrigationPotential += parseNumber(structure.irrigationPotential);
        });
      }
    }

    return summaries;
  };

  const renderSummaryCards = () => {
    if (!reportData?.formData) return null;

    const summaries = calculateAllSummaries(reportData.formData);
    console.log('Calculated Summaries:', summaries); // For debugging

    return (
      <Grid container spacing={3}>
        {/* Social Section */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom color="primary">Social</Typography>
          <Grid container spacing={2}>
            {/* Demographics Card */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" color="primary" gutterBottom>Demographics</Typography>
                  <Typography>Total Population: {summaries.demographics.totalPopulation.toLocaleString()}</Typography>
                  <Typography>Total Households: {summaries.demographics.totalHouseholds.toLocaleString()}</Typography>
                  <Typography>Male Population: {summaries.demographics.totalMale.toLocaleString()}</Typography>
                  <Typography>Female Population: {summaries.demographics.totalFemale.toLocaleString()}</Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Education Card */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" color="primary" gutterBottom>Education</Typography>
                  <Typography>Total Schools: {summaries.education.totalSchools}</Typography>
                  <Typography>Total Students: {summaries.education.totalStudents.toLocaleString()}</Typography>
                  <Typography>Total Teachers: {summaries.education.totalTeachers}</Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Health & Childcare Card */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" color="primary" gutterBottom>Health & Childcare</Typography>
                  <Typography>Primary Health Centres: {summaries.healthChildcare.totalPHCs}</Typography>
                  <Typography>Sub Centres: {summaries.healthChildcare.totalSubCentres}</Typography>
                  <Typography>Anganwadi Centres: {summaries.healthChildcare.totalAnganwadis}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Economic Section */}
        <Grid item xs={12} sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom color="primary">Economic</Typography>
          <Grid container spacing={2}>
            {/* Migration & Employment Card */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" color="primary" gutterBottom>Migration & Employment</Typography>
                  <Typography>Total Migrants: {summaries.migrationEmployment.totalMigrants}</Typography>
                  <Typography>MGNREGS Job Cards: {summaries.migrationEmployment.totalMGNREGSCards.toLocaleString()}</Typography>
                  <Typography>Total Workdays: {summaries.migrationEmployment.totalWorkdays.toLocaleString()}</Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Road Infrastructure Card */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" color="primary" gutterBottom>Road Infrastructure</Typography>
                  <Typography>Total CC Roads: {summaries.roadInfrastructure.totalCCRoad.toFixed(2)} km</Typography>
                  <Typography>Total Kuchha Roads: {summaries.roadInfrastructure.totalKuchhaRoad.toFixed(2)} km</Typography>
                  <Typography>Repair Required: {summaries.roadInfrastructure.totalRepairRequired.toFixed(2)} km</Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Panchayat Finances Card */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" color="primary" gutterBottom>Panchayat Finances</Typography>
                  <Typography>Total Revenue: ₹{summaries.panchayatFinances.totalRevenue.toLocaleString()}</Typography>
                  <Typography>CFC: ₹{summaries.panchayatFinances.cfc.toLocaleString()}</Typography>
                  <Typography>SFC: ₹{summaries.panchayatFinances.sfc.toLocaleString()}</Typography>
                  <Typography>Own Sources: ₹{summaries.panchayatFinances.ownSources.toLocaleString()}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Environment Section */}
        <Grid item xs={12} sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom color="primary">Environment</Typography>
          <Grid container spacing={2}>
            {/* Land Use Card */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" color="primary" gutterBottom>Land Use Mapping</Typography>
                  <Typography>Total Cultivable Land: {summaries.landUseMapping.totalCultivableLand.toFixed(2)} ha</Typography>
                  <Typography>Total Irrigated Land: {summaries.landUseMapping.totalIrrigatedLand.toFixed(2)} ha</Typography>
                  <Typography>Total Forest Area: {summaries.landUseMapping.totalForestArea.toFixed(2)} ha</Typography>
                  <Typography>Total Common Land: {summaries.landUseMapping.totalCommonLand.toFixed(2)} ha</Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Water Resources Card */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" color="primary" gutterBottom>Water Resources</Typography>
                  <Typography>Water Bodies: {summaries.waterResources.totalWaterBodies}</Typography>
                  <Typography>Irrigation Structures: {summaries.waterResources.totalIrrigationStructures}</Typography>
                  <Typography>Total Irrigation Potential: {summaries.waterResources.totalIrrigationPotential.toFixed(2)} ha</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
  };

  const prepareExcelData = (formData: any) => {
    const workbook = XLSX.utils.book_new();

    // Demographics worksheet
    if (formData.Demographics) {
      const demographicsData = Object.entries(formData.Demographics).map(([village, data]) => ({
        Village: village,
        ...data
      }));
      const demographicsSheet = XLSX.utils.json_to_sheet(demographicsData);
      XLSX.utils.book_append_sheet(workbook, demographicsSheet, 'Demographics');
    }

    // Education worksheet
    if (formData.Education) {
      const educationData = Object.entries(formData.Education).flatMap(([village, schools]) => 
        Array.isArray(schools) ? schools.map(school => ({ Village: village, ...school })) : []
      );
      if (educationData.length > 0) {
        const educationSheet = XLSX.utils.json_to_sheet(educationData);
        XLSX.utils.book_append_sheet(workbook, educationSheet, 'Education');
      }
    }

    // Health & Childcare - Improved data formatting
    if (formData.HealthChildcare) {
      // Format PHCs data with consistent structure
      const phcsData = (formData.HealthChildcare.phcs || []).map(phc => ({
        Type: 'PHC',
        Name: phc.name,
        Location: phc.location,
        Status: phc.status
      }));

      // Format Sub Centres data with consistent structure
      const subCentresData = (formData.HealthChildcare.subCentres || []).map(sc => ({
        Type: 'Sub Centre',
        Name: sc.name,
        Location: sc.location,
        Status: sc.status
      }));

      // Format Anganwadi Centres data with consistent structure
      const anganwadiData = (formData.HealthChildcare.anganwadiCentres || []).map(ac => ({
        Type: 'Anganwadi Centre',
        Name: ac.name,
        Location: ac.location,
        Status: ac.status
      }));

      // Combine all health facilities data into a single array
      const healthData = [...phcsData, ...subCentresData, ...anganwadiData];
      
      // Only create sheet if there's data to show
      if (healthData.length > 0) {
        const healthSheet = XLSX.utils.json_to_sheet(healthData);
        XLSX.utils.book_append_sheet(workbook, healthSheet, 'HealthChildcare');
      }
    }

    // Migration & Employment
    if (formData.MigrationEmployment) {
      const migrationSheet = XLSX.utils.json_to_sheet(formData.MigrationEmployment);
      XLSX.utils.book_append_sheet(workbook, migrationSheet, 'MigrationEmployment');
    }

    // Road Infrastructure
    if (formData.RoadInfrastructure) {
      const roadSheet = XLSX.utils.json_to_sheet(formData.RoadInfrastructure);
      XLSX.utils.book_append_sheet(workbook, roadSheet, 'RoadInfrastructure');
    }

    // Panchayat Finances
    if (formData.PanchayatFinances) {
      const financesSheet = XLSX.utils.json_to_sheet([formData.PanchayatFinances]);
      XLSX.utils.book_append_sheet(workbook, financesSheet, 'PanchayatFinances');
    }

    // Land Use Mapping
    if (formData.LandUseMapping) {
      const landUseSheet = XLSX.utils.json_to_sheet(formData.LandUseMapping.landUseData || []);
      XLSX.utils.book_append_sheet(workbook, landUseSheet, 'LandUse');
      
      const commonLandSheet = XLSX.utils.json_to_sheet(formData.LandUseMapping.commonLandAreas || []);
      XLSX.utils.book_append_sheet(workbook, commonLandSheet, 'CommonLand');
    }

    // Water Resources
    if (formData.WaterResources) {
      const waterBodiesSheet = XLSX.utils.json_to_sheet(formData.WaterResources.waterBodies || []);
      XLSX.utils.book_append_sheet(workbook, waterBodiesSheet, 'WaterBodies');
      
      const irrigationSheet = XLSX.utils.json_to_sheet(formData.WaterResources.irrigationStructures || []);
      XLSX.utils.book_append_sheet(workbook, irrigationSheet, 'IrrigationStructures');
    }

    return workbook;
  };

  const handleExportExcel = () => {
    if (!reportData?.formData) return;
    
    const workbook = prepareExcelData(reportData.formData);
    
    // Add summary sheet
    const summaries = calculateAllSummaries(reportData.formData);
    const summaryData = [
      { Section: 'Summary Report', Value: '' },
      { Section: 'GP Name', Value: userData?.gpName },
      { Section: 'Financial Year', Value: selectedYear },
      { Section: '', Value: '' },
      { Section: 'Demographics', Value: '' },
      { Section: 'Total Population', Value: summaries.demographics.totalPopulation },
      { Section: 'Total Households', Value: summaries.demographics.totalHouseholds },
      { Section: 'Male Population', Value: summaries.demographics.totalMale },
      { Section: 'Female Population', Value: summaries.demographics.totalFemale },
      // Add other summary data...
    ];
    
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    XLSX.writeFile(workbook, `${userData?.gpName}_${selectedYear}_Report.xlsx`);
  };

  const renderDetailedReport = () => {
    if (!reportData?.formData) return null;

    // Helper function to safely render any value
    const renderValue = (value: any): string => {
      if (value === null || value === undefined) return '-';
      if (typeof value === 'boolean') return value ? 'Yes' : 'No';
      if (typeof value === 'number') return value.toLocaleString();
      if (typeof value === 'string') return value;
      if (Array.isArray(value)) return value.map(v => renderValue(v)).join(', ');
      if (typeof value === 'object') {
        return Object.entries(value)
          .map(([k, v]) => `${k}: ${renderValue(v)}`)
          .join(', ');
      }
      return String(value);
    };

    // Helper function to render array data as a table
    const renderArrayData = (data: any[]) => {
      if (!Array.isArray(data) || data.length === 0) return <Typography>No data available</Typography>;

      const columns = Array.from(new Set(
        data.flatMap(obj => Object.keys(obj))
      )).filter(col => col !== 'id');

      return (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell key={column}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {column
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/^./, str => str.toUpperCase())
                        .trim()}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, index) => (
                <TableRow key={index} hover>
                  {columns.map((column) => (
                    <TableCell key={column}>
                      {renderValue(row[column])}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
    };

    // Define section structure
    const sections = {
      Social: ['Demographics', 'Education', 'HealthChildcare'],
      Economic: ['MigrationEmployment', 'RoadInfrastructure', 'PanchayatFinances'],
      Environment: ['LandUseMapping', 'WaterResources']
    };

    const renderCategoryData = (category: string, data: any) => {
      // Special handling for nested data structures
      if (category === 'WaterResources' && data) {
        return (
          <>
            <Typography variant="subtitle1" gutterBottom>Water Bodies</Typography>
            {renderArrayData(data.waterBodies || [])}
            <Typography variant="subtitle1" sx={{ mt: 2 }} gutterBottom>Irrigation Structures</Typography>
            {renderArrayData(data.irrigationStructures || [])}
          </>
        );
      }

      if (category === 'LandUseMapping' && data) {
        return (
          <>
            <Typography variant="subtitle1" gutterBottom>Land Use Data</Typography>
            {renderArrayData(data.landUseData || [])}
            <Typography variant="subtitle1" sx={{ mt: 2 }} gutterBottom>Common Land Areas</Typography>
            {renderArrayData(data.commonLandAreas || [])}
          </>
        );
      }

      // Handle array data
      if (Array.isArray(data)) {
        return renderArrayData(data);
      }

      // Handle object data
      if (typeof data === 'object' && data !== null) {
        return (
          <TableContainer>
            <Table size="small">
              <TableBody>
                {Object.entries(data).map(([key, value]) => (
                  <TableRow key={key} hover>
                    <TableCell width="30%">
                      <Typography variant="body2" fontWeight="medium">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {renderValue(value)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
      }

      return <Typography>No data available</Typography>;
    };

    return (
      <Box>
        {Object.entries(sections).map(([sectionName, categories]) => (
          <Box key={sectionName} sx={{ mb: 4 }}>
            <Typography variant="h5" color="primary" gutterBottom>
              {sectionName}
            </Typography>
            {categories.map((category) => {
              const categoryData = reportData.formData[category];
              if (!categoryData) return null;

              return (
                <Paper key={category} sx={{ p: 2, mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    {category.replace(/([A-Z])/g, ' $1').trim()}
                  </Typography>
                  {renderCategoryData(category, categoryData)}
                </Paper>
              );
            })}
          </Box>
        ))}
      </Box>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4">
            Reports - {userData?.gpName}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Financial Year</InputLabel>
              <Select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                label="Financial Year"
              >
                {availableYears.map(year => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleExportExcel}
              disabled={!reportData}
            >
              Export to Excel
            </Button>
          </Box>
        </Box>

        {reportData ? (
          <>
            <Tabs
              value={selectedTab}
              onChange={(_, newValue) => setSelectedTab(newValue)}
              sx={{ mb: 2 }}
            >
              <Tab icon={<PieChartIcon />} label="Summary" />
              <Tab icon={<TableChartIcon />} label="Detailed Report" />
            </Tabs>

            <TabPanel value={selectedTab} index={0}>
              {renderSummaryCards()}
            </TabPanel>

            <TabPanel value={selectedTab} index={1}>
              {renderDetailedReport()}
            </TabPanel>
          </>
        ) : (
          <Alert severity="info">
            No data available for the selected financial year. Please select a different year or ensure data has been collected.
          </Alert>
        )}
      </Box>
    </Container>
  );
};

export default Reports;