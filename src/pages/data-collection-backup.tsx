// src/pages/data-collection.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Stepper, 
  Step, 
  StepLabel,
  LinearProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { app } from '../lib/firebase';
import gpData from '../../public/OdishaGpsMapping.json';
import DataCollectionTable from '../components/DataCollection/DataCollectionTable';
import EducationDataCollection from '../components/DataCollection/EducationDataCollection';
import CustomProgressStepper from '../components/DataCollection/CustomProgressStepper';
import HealthChildcareDataCollection from '../components/DataCollection/HealthChildcareDataCollection';
import MigrationEmploymentDataCollection from '../components/DataCollection/MigrationEmploymentDataCollection';
import RoadInfrastructureDataCollection from '../components/DataCollection/RoadInfrastructureDataCollection';
import PanchayatFinancesDataCollection from '../components/DataCollection/PanchayatFinancesDataCollection';
import LandUseMappingDataCollection from '../components/DataCollection/LandUseMappingDataCollection';
import WaterResourcesDataCollection from '../components/DataCollection/WaterResourcesDataCollection';
import DataReviewAndSubmit from '../components/DataCollection/DataReviewAndSubmit';
import PastDataCollections from '../components/DataCollection/PastDataCollections';

const sections = [
  {
    name: 'Social',
    subsections: ['Demographics', 'Education', 'Health and Childcare']
  },
  {
    name: 'Economic',
    subsections: ['Migration and Employment', 'Road Infrastructure', 'Panchayat Finances']
  },
  {
    name: 'Environment',
    subsections: ['Land Use Mapping', 'Water Resources and Irrigation Structures']
  }
];

const DataCollection: React.FC = () => {
  const [userData, setUserData] = useState<any>(null);
  const [financialYear, setFinancialYear] = useState('');
  const [gpName, setGpName] = useState('');
  const [villages, setVillages] = useState<string[]>([]);
  const [activeSection, setActiveSection] = useState(0);
  const [activeSubsection, setActiveSubsection] = useState(0);
  const [formData, setFormData] = useState<{[key: string]: any}>(() => {
    // Initialize formData with empty objects for each section
    return sections.reduce((acc, section) => {
      acc[section.name] = {};
      return acc;
    }, {});
  });
  const [isReviewing, setIsReviewing] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [pastCollections, setPastCollections] = useState<any[]>([]);

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
          setGpName(userData.gpName || '');
          
          // Filter villages based on user's district, block, and GP
          const userVillages = gpData.districtVillageBlockGpsMapping
            .filter((item: any) => 
              item["GP Name"] === userData.gpName && 
              item["District"] === userData.district && 
              item["Block"] === userData.block
            )
            .map((item: any) => item["Village Name"]);
          setVillages(Array.from(new Set(userVillages)).sort());
        }
      } else {
        router.push('/login');
      }
    });

    fetchPastCollections();

    return () => unsubscribe();
  }, [router, auth, db]);

  const fetchPastCollections = async () => {
    if (!auth.currentUser) return;
    const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
    if (!userDoc.exists()) return;

    const userData = userDoc.data();
    const collectionsQuery = query(
      collection(db, 'dataCollections'),
      where('userId', '==', auth.currentUser.uid),
      where('gpName', '==', userData.gpName)
    );
    const querySnapshot = await getDocs(collectionsQuery);
    const collections = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setPastCollections(collections);
  };

  const handleDataChange = (category: string, newData: any) => {
    setFormData(prevData => ({
      ...prevData,
      [category]: newData
    }));
  };

  const handleSaveAndProceed = async () => {
    if (!userData) return;

    const db = getFirestore(app);
    const docRef = doc(db, 'dataCollection', `${userData.uid}_${financialYear}`);

    try {
      await setDoc(docRef, { 
        financialYear,
        gpName,
        data: formData
      }, { merge: true });
      console.log('Progress saved successfully');

      // Move to next subsection or section
      if (activeSubsection < sections[activeSection].subsections.length - 1) {
        setActiveSubsection(activeSubsection + 1);
      } else if (activeSection < sections.length - 1) {
        setActiveSection(activeSection + 1);
        setActiveSubsection(0);
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const handleReviewAndSubmit = () => {
    setIsReviewing(true);
  };

  const handleSubmit = async () => {
    if (!auth.currentUser) return;
    const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
    if (!userDoc.exists()) return;

    const userData = userDoc.data();
    const submissionData = {
      userId: auth.currentUser.uid,
      gpName: userData.gpName,
      district: userData.district,
      block: userData.block,
      financialYear,
      formData,
      submittedAt: new Date().toISOString(),
      userDetails: {
        name: `${userData.firstName} ${userData.lastName}`,
        email: userData.email,
        role: userData.role,
      },
    };

    try {
      await setDoc(doc(db, 'dataCollections', `${auth.currentUser.uid}_${financialYear}`), submissionData);
      setShowSuccessMessage(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error submitting data:', error);
      // Show an error message to the user
    }
  };

  const handleEdit = (section: string, subsection: string) => {
    const sectionIndex = sections.findIndex(s => s.name === section);
    if (sectionIndex === -1) {
      console.error(`Section "${section}" not found`);
      return;
    }

    const subsectionIndex = sections[sectionIndex].subsections.findIndex(sub => sub === subsection);
    if (subsectionIndex === -1) {
      console.error(`Subsection "${subsection}" not found in section "${section}"`);
      return;
    }

    setActiveSection(sectionIndex);
    setActiveSubsection(subsectionIndex);
    setIsReviewing(false);
  };

  const handleEditPastCollection = (collectionId: string) => {
    const collection = pastCollections.find(c => c.id === collectionId);
    if (collection) {
      setFinancialYear(collection.financialYear);
      setFormData(collection.formData);
      setActiveSection(0);
      setActiveSubsection(0);
      setIsReviewing(false);
    }
  };

  const calculateProgress = () => {
    const totalSubsections = sections.reduce((sum, section) => sum + section.subsections.length, 0);
    const completedSubsections = sections.slice(0, activeSection).reduce((sum, section) => sum + section.subsections.length, 0) + activeSubsection;
    return (completedSubsections / totalSubsections) * 100;
  };

  const handleGoBack = () => {
    if (activeSubsection > 0) {
      setActiveSubsection(activeSubsection - 1);
    } else if (activeSection > 0) {
      setActiveSection(activeSection - 1);
      setActiveSubsection(sections[activeSection - 1].subsections.length - 1);
    }
  };

  if (!userData) {
    return <Box>Loading...</Box>;
  }

  const renderCurrentComponent = () => {
    if (isReviewing) {
      return (
        <DataReviewAndSubmit
          formData={formData}
          onSubmit={handleSubmit}
          onEdit={handleEdit}
          sections={sections}
        />
      );
    }

    const currentSection = sections[activeSection];
    const currentSubsection = currentSection.subsections[activeSubsection];

    switch (currentSubsection) {
      case 'Demographics':
        return (
          <DataCollectionTable
            villages={villages}
            category="Demographics"
            fields={[
              { key: 'households', label: 'Number of Households', type: 'number' },
              { key: 'totalPopulation', label: 'Total Population', type: 'number' },
              { key: 'malePopulation', label: 'Male Population', type: 'number' },
              { key: 'femalePopulation', label: 'Female Population', type: 'number' },
              { 
                key: 'age0to14', 
                label: 'Population (0 to 14 Years)', 
                type: 'number',
                greenBackground: true,
                subFields: [
                  { key: 'male0to14', label: 'Male', type: 'number' },
                  { key: 'female0to14', label: 'Female', type: 'number' },
                ]
              },
              { 
                key: 'age15to60', 
                label: 'Population (15 to 60 Years)', 
                type: 'number',
                greenBackground: true,
                subFields: [
                  { key: 'male15to60', label: 'Male', type: 'number' },
                  { key: 'female15to60', label: 'Female', type: 'number' },
                ]
              },
              { 
                key: 'ageAbove60', 
                label: 'Population (Above 60 Years)', 
                type: 'number',
                greenBackground: true,
                subFields: [
                  { key: 'maleAbove60', label: 'Male', type: 'number' },
                  { key: 'femaleAbove60', label: 'Female', type: 'number' },
                ]
              },
            ]}
            initialData={formData['Demographics']}
            onDataChange={(newData) => handleDataChange('Demographics', newData)}
          />
        );
      case 'Education':
        return (
          <EducationDataCollection
            villages={villages}
            initialData={formData['Education']}
            onDataChange={(newData) => handleDataChange('Education', newData)}
          />
        );
      case 'Health and Childcare':
        return (
          <HealthChildcareDataCollection
            villages={villages}
            initialData={formData['HealthChildcare']}
            onDataChange={(newData) => handleDataChange('HealthChildcare', newData)}
          />
        );
      case 'Migration and Employment':
        return (
          <MigrationEmploymentDataCollection
            villages={villages}
            initialData={formData['MigrationEmployment']}
            onDataChange={(newData) => handleDataChange('MigrationEmployment', newData)}
          />
        );
      case 'Road Infrastructure':
        return (
          <RoadInfrastructureDataCollection
            villages={villages}
            initialData={formData['RoadInfrastructure']}
            onDataChange={(newData) => handleDataChange('RoadInfrastructure', newData)}
          />
        );
      case 'Panchayat Finances':
        return (
          <PanchayatFinancesDataCollection
            initialData={formData['PanchayatFinances']}
            onDataChange={(newData) => handleDataChange('PanchayatFinances', newData)}
          />
        );
      case 'Land Use Mapping':
        return (
          <LandUseMappingDataCollection
            villages={villages}
            initialLandUseData={formData['LandUseMapping']?.landUseData}
            initialCommonLandAreas={formData['LandUseMapping']?.commonLandAreas}
            onDataChange={(landUseData, commonLandAreas) => 
              handleDataChange('LandUseMapping', { landUseData, commonLandAreas })
            }
          />
        );
      case 'Water Resources and Irrigation Structures':
        return (
          <WaterResourcesDataCollection
            villages={villages}
            initialWaterBodies={formData['WaterResources']?.waterBodies}
            initialIrrigationStructures={formData['WaterResources']?.irrigationStructures}
            onDataChange={(waterBodies, irrigationStructures) => 
              handleDataChange('WaterResources', { waterBodies, irrigationStructures })
            }
          />
        );
      // Add cases for other subsections
      default:
        return <Typography>Component for {currentSubsection} not implemented yet.</Typography>;
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ width: '100%', mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Data Collection for {gpName}
        </Typography>
        <PastDataCollections
          pastCollections={pastCollections}
          onEdit={handleEditPastCollection}
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Financial Year</InputLabel>
          <Select
            value={financialYear}
            onChange={(e) => setFinancialYear(e.target.value as string)}
          >
            {Array.from({length: 8}, (_, i) => 2023 + i).map(year => {
              const yearString = `FY ${year}-${year+1}`;
              return (
                <MenuItem key={year} value={yearString}>
                  {yearString} {availableYears.includes(yearString) ? '(Saved)' : ''}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
        {financialYear && (
          <>
            <Box sx={{ width: '100%', mb: 2 }}>
              <LinearProgress variant="determinate" value={calculateProgress()} />
            </Box>
            {!isReviewing && (
              <CustomProgressStepper 
                sections={sections}
                activeSection={activeSection}
                activeSubsection={activeSubsection}
              />
            )}
            <Typography variant="h5" gutterBottom>
              {sections[activeSection].name} - {sections[activeSection].subsections[activeSubsection]}
            </Typography>
            {renderCurrentComponent()}
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
              {(activeSection > 0 || activeSubsection > 0) && (
                <Button variant="outlined" color="primary" onClick={handleGoBack}>
                  Go Back
                </Button>
              )}
              <Box>
                {!isReviewing && (
                  activeSection === sections.length - 1 && 
                  activeSubsection === sections[activeSection].subsections.length - 1 ? (
                    <Button variant="contained" color="primary" onClick={handleReviewAndSubmit}>
                      Review and Submit
                    </Button>
                  ) : (
                    <Button variant="contained" color="primary" onClick={handleSaveAndProceed}>
                      Save and Proceed
                    </Button>
                  )
                )}
              </Box>
            </Box>
          </>
        )}
      </Box>
      <Snackbar 
        open={showSuccessMessage} 
        autoHideDuration={2000} 
        onClose={() => setShowSuccessMessage(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Your data has been successfully submitted!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default DataCollection;
