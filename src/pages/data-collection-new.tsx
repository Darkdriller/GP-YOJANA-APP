// src/pages/data-collection-new.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { app } from '../lib/firebase';
import gpData from '../../public/OdishaGpsMapping.json';

// Shadcn UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Icons
import { 
  ChevronRight, 
  ChevronLeft, 
  Save, 
  Send, 
  CheckCircle2,
  AlertCircle,
  Calendar,
  FileText,
  Users,
  Building,
  TreePine,
  DollarSign,
  Heart,
  GraduationCap,
  Home,
  MapPin,
  Clock,
  Edit2
} from 'lucide-react';

// Data Collection Components
import DataCollectionTable from '../components/DataCollection/DataCollectionTable';
import EducationDataCollection from '../components/DataCollection/EducationDataCollection';
import HealthChildcareDataCollection from '../components/DataCollection/HealthChildcareDataCollection';
import MigrationEmploymentDataCollection from '../components/DataCollection/MigrationEmploymentDataCollection';
import RoadInfrastructureDataCollection from '../components/DataCollection/RoadInfrastructureDataCollection';
import PanchayatFinancesDataCollection from '../components/DataCollection/PanchayatFinancesDataCollection';
import LandUseMappingDataCollection from '../components/DataCollection/LandUseMappingDataCollection';
import WaterResourcesDataCollection from '../components/DataCollection/WaterResourcesDataCollection';
import DataReviewAndSubmit from '../components/DataCollection/DataReviewAndSubmit';

const sections = [
  {
    name: 'Social',
    icon: Users,
    color: 'bg-blue-500',
    subsections: ['Demographics', 'Education', 'Health and Childcare']
  },
  {
    name: 'Economic',
    icon: DollarSign,
    color: 'bg-green-500',
    subsections: ['Migration and Employment', 'Road Infrastructure', 'Panchayat Finances']
  },
  {
    name: 'Environment',
    icon: TreePine,
    color: 'bg-emerald-500',
    subsections: ['Land Use Mapping', 'Water Resources and Irrigation Structures']
  }
];

const getSubsectionIcon = (subsection: string) => {
  const icons: { [key: string]: any } = {
    'Demographics': Users,
    'Education': GraduationCap,
    'Health and Childcare': Heart,
    'Migration and Employment': MapPin,
    'Road Infrastructure': Home,
    'Panchayat Finances': DollarSign,
    'Land Use Mapping': MapPin,
    'Water Resources and Irrigation Structures': TreePine,
  };
  return icons[subsection] || FileText;
};

const DataCollectionNew: React.FC = () => {
  const [userData, setUserData] = useState<any>(null);
  const [financialYear, setFinancialYear] = useState('');
  const [gpName, setGpName] = useState('');
  const [villages, setVillages] = useState<string[]>([]);
  const [activeSection, setActiveSection] = useState(0);
  const [activeSubsection, setActiveSubsection] = useState(0);
  const [formData, setFormData] = useState<{[key: string]: any}>(() => {
    return sections.reduce((acc, section) => {
      acc[section.name] = {};
      return acc;
    }, {});
  });
  const [isReviewing, setIsReviewing] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [pastCollections, setPastCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
          
          const userVillages = gpData.districtVillageBlockGpsMapping
            .filter((item: any) => 
              item["GP Name"] === userData.gpName && 
              item["District"] === userData.district && 
              item["Block"] === userData.block
            )
            .map((item: any) => item["Village Name"]);
          setVillages(Array.from(new Set(userVillages)).sort());
        }
        setLoading(false);
      } else {
        router.push('/login');
      }
    });

    fetchPastCollections();
    return () => unsubscribe();
  }, [router, auth, db]);

  const fetchPastCollections = async () => {
    if (!auth.currentUser) return;
    
    const collectionsQuery = query(
      collection(db, 'dataCollections'),
      where('userId', '==', auth.currentUser.uid)
    );
    
    const querySnapshot = await getDocs(collectionsQuery);
    const collections = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    setPastCollections(collections);
    const years = collections.map((c: any) => c.financialYear);
    setAvailableYears(Array.from(new Set(years)));
  };

  const handleDataChange = (category: string, newData: any) => {
    setFormData(prevData => ({
      ...prevData,
      [category]: newData
    }));
  };

  const handleSaveAndProceed = () => {
    if (activeSubsection < sections[activeSection].subsections.length - 1) {
      setActiveSubsection(activeSubsection + 1);
    } else if (activeSection < sections.length - 1) {
      setActiveSection(activeSection + 1);
      setActiveSubsection(0);
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
    }
  };

  const handleEdit = (section: string, subsection: string) => {
    const sectionIndex = sections.findIndex(s => s.name === section);
    if (sectionIndex === -1) return;

    const subsectionIndex = sections[sectionIndex].subsections.findIndex(sub => sub === subsection);
    if (subsectionIndex === -1) return;

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
      default:
        return <div>Component for {currentSubsection} not implemented yet.</div>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-600 to-green-600 text-white">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-3xl font-bold flex items-center gap-3">
                    <Building className="h-8 w-8" />
                    Data Collection Portal
                  </CardTitle>
                  <CardDescription className="text-blue-50 mt-2 text-lg">
                    {gpName} | {userData?.district}, {userData?.block}
                  </CardDescription>
                </div>
                <Badge className="bg-white text-blue-600 px-4 py-2 text-sm font-semibold">
                  {userData?.role}
                </Badge>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Past Collections Alert */}
        {pastCollections.length > 0 && !financialYear && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertTitle>Previous Data Collections</AlertTitle>
            <AlertDescription>
              <div className="mt-2 space-y-2">
                {pastCollections.map((collection: any) => (
                  <div key={collection.id} className="flex items-center justify-between p-2 bg-white rounded-lg">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{collection.financialYear}</span>
                      <Badge variant="outline" className="text-xs">
                        Submitted on {new Date(collection.submittedAt).toLocaleDateString()}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditPastCollection(collection.id)}
                      className="flex items-center gap-1"
                    >
                      <Edit2 className="h-3 w-3" />
                      Edit
                    </Button>
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Financial Year Selection */}
        {!financialYear && (
          <Card className="mb-8 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Select Financial Year
              </CardTitle>
              <CardDescription>
                Choose the financial year for data collection or continue editing a previous submission
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={financialYear} onValueChange={setFinancialYear}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a financial year" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({length: 8}, (_, i) => 2023 + i).map(year => {
                    const yearString = `FY ${year}-${year+1}`;
                    return (
                      <SelectItem key={year} value={yearString}>
                        <div className="flex items-center justify-between w-full">
                          <span>{yearString}</span>
                          {availableYears.includes(yearString) && (
                            <Badge variant="secondary" className="ml-2">Saved</Badge>
                          )}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        {/* Main Content Area */}
        {financialYear && (
          <div className="space-y-6">
            {/* Progress Overview */}
            <Card className="shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">
                    Progress Overview - {financialYear}
                  </CardTitle>
                  <Badge variant="outline" className="text-sm">
                    {Math.round(calculateProgress())}% Complete
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Progress value={calculateProgress()} className="h-3" />
                <div className="grid grid-cols-3 gap-4 mt-4">
                  {sections.map((section, idx) => {
                    const Icon = section.icon;
                    const isActive = idx === activeSection;
                    const isCompleted = idx < activeSection;
                    
                    return (
                      <div
                        key={section.name}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          isActive ? 'border-blue-500 bg-blue-50' : 
                          isCompleted ? 'border-green-500 bg-green-50' : 
                          'border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-full ${section.color}`}>
                            <Icon className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{section.name}</p>
                            <p className="text-xs text-gray-500">
                              {section.subsections.length} sections
                            </p>
                          </div>
                          {isCompleted && (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Section Tabs */}
            {!isReviewing && (
              <Card className="shadow-lg">
                <CardContent className="p-0">
                  <Tabs value={`${activeSection}-${activeSubsection}`} className="w-full">
                    <TabsList className="w-full justify-start rounded-none border-b h-auto p-0 bg-transparent">
                      {sections[activeSection].subsections.map((subsection, idx) => {
                        const Icon = getSubsectionIcon(subsection);
                        const isActive = idx === activeSubsection;
                        const isCompleted = idx < activeSubsection;
                        
                        return (
                          <TabsTrigger
                            key={subsection}
                            value={`${activeSection}-${idx}`}
                            className={`flex-1 rounded-none border-b-2 ${
                              isActive ? 'border-blue-500 text-blue-600' : 
                              isCompleted ? 'border-green-500 text-green-600' : 
                              'border-transparent'
                            }`}
                            onClick={() => setActiveSubsection(idx)}
                          >
                            <div className="flex items-center gap-2 py-3">
                              <Icon className="h-4 w-4" />
                              <span className="hidden sm:inline">{subsection}</span>
                              {isCompleted && (
                                <CheckCircle2 className="h-4 w-4 ml-1" />
                              )}
                            </div>
                          </TabsTrigger>
                        );
                      })}
                    </TabsList>
                  </Tabs>
                </CardContent>
              </Card>
            )}

            {/* Form Content */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {!isReviewing && (
                    <>
                      {React.createElement(getSubsectionIcon(sections[activeSection].subsections[activeSubsection]), { className: "h-5 w-5" })}
                      {sections[activeSection].name} - {sections[activeSection].subsections[activeSubsection]}
                    </>
                  )}
                  {isReviewing && "Review and Submit"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderCurrentComponent()}
              </CardContent>
              <Separator />
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  {(activeSection > 0 || activeSubsection > 0) && !isReviewing && (
                    <Button
                      variant="outline"
                      onClick={handleGoBack}
                      className="flex items-center gap-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                  )}
                  <div className="ml-auto flex gap-2">
                    {!isReviewing && (
                      activeSection === sections.length - 1 && 
                      activeSubsection === sections[activeSection].subsections.length - 1 ? (
                        <Button
                          onClick={handleReviewAndSubmit}
                          className="flex items-center gap-2"
                        >
                          Review & Submit
                          <Send className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          onClick={handleSaveAndProceed}
                          className="flex items-center gap-2"
                        >
                          Save & Continue
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      )
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="max-w-md">
              <CardContent className="pt-6">
                <div className="text-center">
                  <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Success!</h3>
                  <p className="text-gray-600">Your data has been successfully submitted.</p>
                  <p className="text-sm text-gray-500 mt-2">Redirecting to dashboard...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataCollectionNew;