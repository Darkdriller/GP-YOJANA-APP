// src/pages/gp-snapshot.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, query, where, orderBy, getDocs, doc, getDoc } from 'firebase/firestore';
import { app } from '../lib/firebase';

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
  Users, 
  GraduationCap, 
  Heart, 
  MapPin, 
  Home, 
  DollarSign, 
  TreePine, 
  Building,
  Calendar,
  BarChart3,
  TrendingUp,
  UserCheck,
  School,
  Hospital,
  Coins,
  Route,
  Droplets,
  Leaf,
  Eye,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
  Filter,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

// Chart components
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Enhanced components
import DemographicsCharts from '@/components/enhanced/DemographicsCharts';
import EconomicCharts from '@/components/enhanced/EconomicCharts';
import EnvironmentalCharts from '@/components/enhanced/EnvironmentalCharts';

// Existing components (fallback)
import StatisticsOverview from '@/components/GPSnapshot/StatisticsOverview';

interface DashboardData {
  formData: any;
  financialYear: string;
  submittedAt: string;
  gpName: string;
  district: string;
  block: string;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  subtitle, 
  trend, 
  color = "blue" 
}) => (
  <Card className="hover:shadow-lg transition-shadow">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center gap-1 text-sm ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className="h-3 w-3" />
              {trend.value}% from last year
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </CardContent>
  </Card>
);

const GPSnapshot: React.FC = () => {
  const [userData, setUserData] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>('latest');
  const [selectedVillage, setSelectedVillage] = useState<string>('all');
  const [isMultiYear, setIsMultiYear] = useState(false);
  const [activeTab, setActiveTab] = useState('social');
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [villages, setVillages] = useState<string[]>([]);
  const [currentData, setCurrentData] = useState<any>(null);

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
          await fetchDashboardData(user.uid);
        }
        setLoading(false);
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchDashboardData = async (userId: string) => {
    try {
      const dataCollectionsQuery = query(
        collection(db, 'dataCollections'),
        where('userId', '==', userId),
        orderBy('submittedAt', 'desc')
      );

      const querySnapshot = await getDocs(dataCollectionsQuery);
      const data: DashboardData[] = [];
      const years: string[] = [];

      querySnapshot.forEach((doc) => {
        const docData = doc.data() as DashboardData;
        data.push(docData);
        if (!years.includes(docData.financialYear)) {
          years.push(docData.financialYear);
        }
      });

      setDashboardData(data);
      setAvailableYears(years);

      if (data.length > 0) {
        setCurrentData(data[0]);
        // Extract villages from the first dataset
        if (data[0].formData?.Demographics) {
          const villageNames = Object.keys(data[0].formData.Demographics);
          setVillages(villageNames);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    if (year === 'latest') {
      setCurrentData(dashboardData[0]);
    } else {
      const yearData = dashboardData.find(d => d.financialYear === year);
      setCurrentData(yearData);
    }
  };

  const calculateSocialMetrics = (data: any, selectedVillage: string = 'all') => {
    if (!data?.Demographics) return null;

    // Normalize village selection for comparison
    const normalizedSelectedVillage = selectedVillage.toLowerCase() === 'all' ? 'all' : selectedVillage;

    const demographics = data.Demographics;
    let totalPopulation = 0;
    let totalHouseholds = 0;
    let malePopulation = 0;
    let femalePopulation = 0;

    // Filter demographics based on selected village
    const relevantVillages = normalizedSelectedVillage === 'all' 
      ? Object.entries(demographics) 
      : Object.entries(demographics).filter(([villageName]) => villageName === normalizedSelectedVillage);

    relevantVillages.forEach(([villageName, village]: [string, any]) => {
      totalPopulation += parseInt(village.totalPopulation || 0);
      totalHouseholds += parseInt(village.households || 0);
      malePopulation += parseInt(village.malePopulation || 0);
      femalePopulation += parseInt(village.femalePopulation || 0);
    });

    const genderRatio = femalePopulation > 0 ? Math.round((malePopulation / femalePopulation) * 1000) : 0;

    return {
      totalPopulation,
      totalHouseholds,
      malePopulation,
      femalePopulation,
      genderRatio,
      villages: relevantVillages.length
    };
  };

  const calculateEducationMetrics = (data: any) => {
    if (!data?.Education) return null;

    const education = data.Education;
    let totalSchools = 0;
    let totalTeachers = 0;
    let totalStudents = 0;

    Object.values(education).forEach((villageSchools: any) => {
      if (Array.isArray(villageSchools)) {
        totalSchools += villageSchools.length;
        villageSchools.forEach((school: any) => {
          totalTeachers += (parseInt(school.teachersMale || 0) + parseInt(school.teachersFemale || 0));
          totalStudents += parseInt(school.studentsTotal || 0);
        });
      }
    });

    const studentTeacherRatio = totalTeachers > 0 ? Math.round(totalStudents / totalTeachers) : 0;

    return {
      totalSchools,
      totalTeachers,
      totalStudents,
      studentTeacherRatio
    };
  };

  const calculateEconomicMetrics = (data: any, selectedVillage: string = 'all') => {
    // Always return an object with default values
    const defaultMetrics = {
      totalMigrants: 0,
      totalMGNREGSCards: 0,
      totalReportingMigration: 0,
      totalRevenue: 0,
      landlessHouseholds: 0,
      totalWorkdays: 0,
      totalHouseholds: 0,
      migrationRate: '0',
      mgnregsPercentage: '0'
    };

    if (!data) return defaultMetrics;

    // Normalize village selection for comparison (handle 'all' and 'All')
    const normalizedSelectedVillage = selectedVillage.toLowerCase() === 'all' ? 'all' : selectedVillage;

    // Get total households from Demographics data for percentage calculations
    let totalHouseholds = 0;
    if (data.Demographics) {
      const demographicsVillages = normalizedSelectedVillage === 'all'
        ? Object.entries(data.Demographics)
        : Object.entries(data.Demographics).filter(([villageName]) => villageName === normalizedSelectedVillage);
      
      
      demographicsVillages.forEach(([villageName, village]: [string, any]) => {
        totalHouseholds += parseInt(village.households || 0);
      });
    }

    // Calculate migration and employment metrics
    let totalMigrants = 0;
    let totalMGNREGSCards = 0;
    let totalReportingMigration = 0;
    let landlessHouseholds = 0;
    let totalWorkdays = 0;

    if (data['Migration and Employment'] || data.MigrationEmployment) {
      // Handle both possible field names
      const migrationRaw = data['Migration and Employment'] || data.MigrationEmployment;

      // Build entries as [villageName, villageData]
      let entries: Array<[string, any]> = [];

      // If array, map by Demographics village order
      if (Array.isArray(migrationRaw)) {
        const villageNames = data.Demographics ? Object.keys(data.Demographics) : [];
        entries = migrationRaw.map((item: any, index: number) => [villageNames[index] || `Village ${index + 1}`, item]);
      } else {
        entries = Object.entries(migrationRaw);
      }

      // Filter migration data based on selected village
      const relevantVillages = normalizedSelectedVillage === 'all'
        ? entries
        : entries.filter(([villageName]) => villageName === normalizedSelectedVillage);

      relevantVillages.forEach(([villageName, village]: [string, any]) => {
        const seasonalMigrantsMale = parseInt(village.seasonalMigrantsMale || 0);
        const seasonalMigrantsFemale = parseInt(village.seasonalMigrantsFemale || 0);
        const permanentMigrantsMale = parseInt(village.permanentMigrantsMale || 0);
        const permanentMigrantsFemale = parseInt(village.permanentMigrantsFemale || 0);

        totalMigrants += (seasonalMigrantsMale + seasonalMigrantsFemale + permanentMigrantsMale + permanentMigrantsFemale);
        totalMGNREGSCards += parseInt(village.householdsWithMGNREGSCards || 0);
        totalReportingMigration += parseInt(village.householdsReportingMigration || 0);
        landlessHouseholds += parseInt(village.landlessHouseholds || 0);
        totalWorkdays += parseInt(village.workdaysProvidedMGNREGS || 0);
      });
    }

    // Calculate total revenue from panchayat finances if available
    // Note: Panchayat finances are typically GP-level, not village-level
    let totalRevenue = 0;
    if (data['Panchayat Finances'] || data.PanchayatFinances) {
      const finances = data['Panchayat Finances'] || data.PanchayatFinances;
      if (selectedVillage === 'all') {
        totalRevenue = parseInt(finances.cfc || 0) + parseInt(finances.sfc || 0) + 
                      parseInt(finances.ownSources || 0) + parseInt(finances.mgnregs || 0);
      }
    }

    // Calculate percentages using total households from Demographics
    const migrationRate = totalHouseholds > 0 ? ((totalReportingMigration / totalHouseholds) * 100).toFixed(1) : '0';
    const mgnregsPercentage = totalHouseholds > 0 ? ((totalMGNREGSCards / totalHouseholds) * 100).toFixed(1) : '0';

    return {
      totalMigrants,
      totalMGNREGSCards,
      totalReportingMigration,
      totalRevenue,
      landlessHouseholds,
      totalWorkdays,
      totalHouseholds,
      migrationRate: totalHouseholds > 0 && totalReportingMigration > 0 ? migrationRate : '0',
      mgnregsPercentage: totalHouseholds > 0 && totalMGNREGSCards > 0 ? mgnregsPercentage : '0'
    };
  };

  const calculateEnvironmentalMetrics = (data: any, selectedVillage: string = 'all') => {
    if (!data) return null;

    const normalizedSelectedVillage = selectedVillage.toLowerCase() === 'all' ? 'all' : selectedVillage;

    const villageNames: string[] = data.Demographics ? Object.keys(data.Demographics) : [];

    let totalWaterBodies = 0;
    let totalIrrigationStructures = 0;
    let forestArea = 0;
    let agriculturalArea = 0;
    let commonLandArea = 0;
    let nonCultivableArea = 0;
    let totalIrrigationPotential = 0;

    // Water Resources normalization
    const waterResourcesData = data['Water Resources'] || data.WaterResources;
    if (waterResourcesData) {
      const wbRaw = waterResourcesData.waterBodies;
      const isrRaw = waterResourcesData.irrigationStructures;

      // Build map: village -> waterBodies[]
      let wbEntries: Array<[string, any[]]> = [];
      if (Array.isArray(wbRaw)) {
        // Array could be array-of-arrays aligned with Demographics or array of items with village
        if (wbRaw.length > 0 && Array.isArray(wbRaw[0])) {
          wbEntries = (wbRaw as any[]).map((arr: any, i: number) => [villageNames[i] || `Village ${i + 1}`, Array.isArray(arr) ? arr : []]);
        } else {
          // Flat array of objects possibly with village field
          const grouped: Record<string, any[]> = {};
          (wbRaw as any[]).forEach((item: any, i: number) => {
            const name = item?.village || villageNames[i] || `Village ${i + 1}`;
            if (!grouped[name]) grouped[name] = [];
            grouped[name].push(item);
          });
          wbEntries = Object.entries(grouped);
        }
      } else if (wbRaw) {
        wbEntries = Object.entries(wbRaw as Record<string, any[]>);
      }

      // Build map: village -> irrigationStructures[]
      let isrEntries: Array<[string, any[]]> = [];
      if (Array.isArray(isrRaw)) {
        if (isrRaw.length > 0 && Array.isArray(isrRaw[0])) {
          isrEntries = (isrRaw as any[]).map((arr: any, i: number) => [villageNames[i] || `Village ${i + 1}`, Array.isArray(arr) ? arr : []]);
        } else {
          const grouped: Record<string, any[]> = {};
          (isrRaw as any[]).forEach((item: any, i: number) => {
            const name = item?.village || villageNames[i] || `Village ${i + 1}`;
            if (!grouped[name]) grouped[name] = [];
            grouped[name].push(item);
          });
          isrEntries = Object.entries(grouped);
        }
      } else if (isrRaw) {
        isrEntries = Object.entries(isrRaw as Record<string, any[]>);
      }

      const isrMap = new Map<string, any[]>(isrEntries);

      const filteredWB = normalizedSelectedVillage === 'all' ? wbEntries : wbEntries.filter(([name]) => name === normalizedSelectedVillage);
      filteredWB.forEach(([name, bodies]) => {
        const irrigationStructures = isrMap.get(name) || [];
        totalWaterBodies += Array.isArray(bodies) ? bodies.length : 0;
        totalIrrigationStructures += Array.isArray(irrigationStructures) ? irrigationStructures.length : 0;
        (Array.isArray(bodies) ? bodies : []).forEach((body: any) => {
          totalIrrigationPotential += parseFloat((body?.irrigationPotential ?? 0).toString());
        });
        (Array.isArray(irrigationStructures) ? irrigationStructures : []).forEach((isr: any) => {
          totalIrrigationPotential += parseFloat((isr?.irrigationPotential ?? 0).toString());
        });
      });
    }

    // Land Use normalization
    const landUseData = data['Land Use Mapping'] || data.LandUseMapping;
    if (landUseData?.landUseData) {
      let luEntries: Array<[string, any]> = [];
      if (Array.isArray(landUseData.landUseData)) {
        luEntries = (landUseData.landUseData as any[]).map((item, i) => [villageNames[i] || `Village ${i + 1}`, item]);
      } else {
        luEntries = Object.entries(landUseData.landUseData);
      }

      const filteredLU = normalizedSelectedVillage === 'all' ? luEntries : luEntries.filter(([name]) => name === normalizedSelectedVillage);
      filteredLU.forEach(([name, v]: [string, any]) => {
        forestArea += parseFloat(((v?.forestArea) ?? 0).toString());
        // Support both new 'cultivableArea' and legacy 'totalCultivableLand'
        const cultivable = (v?.cultivableArea ?? v?.totalCultivableLand) ?? 0;
        agriculturalArea += parseFloat(cultivable.toString());
        commonLandArea += parseFloat(((v?.commonLandArea) ?? 0).toString());
        nonCultivableArea += parseFloat(((v?.nonCultivableArea) ?? 0).toString());
      });
    }

    const irrigationCoverage = agriculturalArea > 0 ? Math.min(100, (totalIrrigationPotential / agriculturalArea * 100)) : 0;

    return {
      totalWaterBodies,
      totalIrrigationStructures,
      forestArea: forestArea.toFixed(1),
      agriculturalArea: agriculturalArea.toFixed(1),
      commonLandArea: commonLandArea.toFixed(1),
      nonCultivableArea: nonCultivableArea.toFixed(1),
      irrigationCoverage: irrigationCoverage.toFixed(1),
      totalIrrigationPotential: totalIrrigationPotential.toFixed(1)
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!currentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-8">
        <div className="max-w-4xl mx-auto text-center">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Data Available</AlertTitle>
            <AlertDescription>
              No data collections found. Please submit some data first through the Data Collection page.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const socialMetrics = calculateSocialMetrics(currentData.formData, selectedVillage);
  const educationMetrics = calculateEducationMetrics(currentData.formData);
  const economicMetrics = calculateEconomicMetrics(currentData.formData, selectedVillage);
  const environmentalMetrics = calculateEnvironmentalMetrics(currentData.formData, selectedVillage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-600 to-green-600 text-white">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <CardTitle className="text-3xl font-bold flex items-center gap-3">
                    <BarChart3 className="h-8 w-8" />
                    GP Analytics Dashboard
                  </CardTitle>
                  <CardDescription className="text-blue-50 mt-2 text-lg">
                    {currentData.gpName} | {currentData.district}, {currentData.block}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-white text-blue-600 px-4 py-2 text-sm font-semibold">
                    {userData?.role}
                  </Badge>
                  <Badge variant="outline" className="border-white text-white px-4 py-2">
                    {currentData.financialYear}
                  </Badge>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Controls Section */}
        <div className="mb-6 space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <Select value={selectedYear} onValueChange={handleYearChange}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="latest">Latest Data</SelectItem>
                        {availableYears.map(year => (
                          <SelectItem key={year} value={year}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <Select value={selectedVillage} onValueChange={setSelectedVillage}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Villages</SelectItem>
                        {villages.map(village => (
                          <SelectItem key={village} value={village}>{village}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsMultiYear(!isMultiYear)}
                    className="flex items-center gap-2"
                  >
                    {isMultiYear ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                    Multi-Year Analysis
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchDashboardData(auth.currentUser?.uid!)}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <Card>
            <CardContent className="p-2">
              <TabsList className="grid w-full grid-cols-3 bg-gray-100">
                <TabsTrigger value="social" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Social
                </TabsTrigger>
                <TabsTrigger value="economic" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Economic
                </TabsTrigger>
                <TabsTrigger value="environmental" className="flex items-center gap-2">
                  <TreePine className="h-4 w-4" />
                  Environmental
                </TabsTrigger>
              </TabsList>
            </CardContent>
          </Card>

          {/* Social Tab */}
          <TabsContent value="social" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {socialMetrics && (
                <>
                  <MetricCard
                    title="Total Population"
                    value={socialMetrics.totalPopulation.toLocaleString()}
                    icon={Users}
                    subtitle={`${socialMetrics.villages} villages`}
                    color="blue"
                  />
                  <MetricCard
                    title="Total Households"
                    value={socialMetrics.totalHouseholds.toLocaleString()}
                    icon={Home}
                    subtitle="Registered households"
                    color="green"
                  />
                  <MetricCard
                    title="Gender Ratio"
                    value={`${socialMetrics.genderRatio}`}
                    icon={UserCheck}
                    subtitle="Males per 1000 females"
                    color="purple"
                  />
                  {educationMetrics && (
                    <MetricCard
                      title="Schools"
                      value={educationMetrics.totalSchools}
                      icon={School}
                      subtitle={`${educationMetrics.totalTeachers} teachers`}
                      color="orange"
                    />
                  )}
                </>
              )}
            </div>

            {/* Demographics Charts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Demographics Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DemographicsCharts 
                  data={currentData.formData?.Demographics}
                  selectedVillage={selectedVillage}
                />
              </CardContent>
            </Card>

            {/* Education Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Education Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StatisticsOverview 
                  demographicsData={currentData.formData?.Demographics}
                  educationData={currentData.formData?.Education}
                  selectedVillage={selectedVillage}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Economic Tab */}
          <TabsContent value="economic" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {economicMetrics && (
                <>
                  <MetricCard
                    title="Migration Rate"
                    value={economicMetrics.migrationRate === '0' ? '0%' : `${economicMetrics.migrationRate}%`}
                    icon={MapPin}
                    subtitle="Households reporting migration"
                    color="red"
                  />
                  <MetricCard
                    title="MGNREGS Coverage"
                    value={economicMetrics.mgnregsPercentage === '0' ? '0%' : `${economicMetrics.mgnregsPercentage}%`}
                    icon={Coins}
                    subtitle="Households with job cards"
                    color="yellow"
                  />
                  <MetricCard
                    title="Total Migrants"
                    value={economicMetrics.totalMigrants.toLocaleString()}
                    icon={Route}
                    subtitle="Seasonal + Permanent migrants"
                    color="green"
                  />
                  <MetricCard
                    title="Panchayat Revenue"
                    value={economicMetrics.totalRevenue > 0 ? `₹${(economicMetrics.totalRevenue / 100000).toFixed(1)}L` : 'NA'}
                    icon={Building}
                    subtitle={selectedVillage === 'all' ? 'Total annual revenue' : 'GP-level data only'}
                    color="blue"
                  />
                </>
              )}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Economic Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EconomicCharts 
                  migrationData={currentData.formData?.['Migration and Employment'] || currentData.formData?.MigrationEmployment}
                  roadInfraData={currentData.formData?.['Road Infrastructure'] || currentData.formData?.RoadInfrastructure}
                  panchayatFinances={currentData.formData?.['Panchayat Finances'] || currentData.formData?.PanchayatFinances}
                  selectedVillage={selectedVillage}
                  villageNames={villages}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Environmental Tab */}
          <TabsContent value="environmental" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {environmentalMetrics ? (
                <>
                  <MetricCard
                    title="Forest Area"
                    value={parseFloat(environmentalMetrics.forestArea) > 0 ? `${environmentalMetrics.forestArea} acres` : 'NA'}
                    icon={TreePine}
                    subtitle="Total forest land"
                    color="green"
                  />
                  <MetricCard
                    title="Water Bodies"
                    value={environmentalMetrics.totalWaterBodies > 0 ? environmentalMetrics.totalWaterBodies.toString() : 'NA'}
                    icon={Droplets}
                    subtitle={`${environmentalMetrics.totalIrrigationStructures || 0} irrigation structures`}
                    color="blue"
                  />
                  <MetricCard
                    title="Agricultural Land"
                    value={parseFloat(environmentalMetrics.agriculturalArea) > 0 ? `${environmentalMetrics.agriculturalArea} acres` : 'NA'}
                    icon={Leaf}
                    subtitle="Cultivable area"
                    color="emerald"
                  />
                  <MetricCard
                    title="Irrigation Potential"
                    value={parseFloat(environmentalMetrics.totalIrrigationPotential) > 0 ? `${environmentalMetrics.totalIrrigationPotential} acres` : 'NA'}
                    icon={Droplets}
                    subtitle={`Coverage: ${environmentalMetrics.irrigationCoverage}%`}
                    color="cyan"
                  />
                </>
              ) : (
                <>
                  <MetricCard title="Forest Area" value="NA" icon={TreePine} subtitle="No land use data available" color="green" />
                  <MetricCard title="Water Bodies" value="NA" icon={Droplets} subtitle="No water resource data available" color="blue" />
                  <MetricCard title="Agricultural Land" value="NA" icon={Leaf} subtitle="No land use data available" color="emerald" />
                  <MetricCard title="Irrigation Potential" value="NA" icon={Droplets} subtitle="No irrigation data available" color="cyan" />
                </>
              )}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TreePine className="h-5 w-5" />
                  Environmental Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EnvironmentalCharts 
                  landUseData={currentData.formData?.['Land Use Mapping'] || currentData.formData?.LandUseMapping}
                  waterResourcesData={currentData.formData?.['Water Resources'] || currentData.formData?.WaterResources}
                  selectedVillage={selectedVillage}
                  villageNames={villages}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GPSnapshot;