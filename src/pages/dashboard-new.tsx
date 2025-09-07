// src/pages/dashboard-new.tsx
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

// Existing components (we'll gradually replace these)
import DemographicsOverview from '@/components/GPSnapshot/DemographicsOverview';
import StatisticsOverview from '@/components/GPSnapshot/StatisticsOverview';
import EconomicStatistics from '@/components/GPSnapshot/Economic/EconomicStatistics';
import EnvironmentalStatistics from '@/components/GPSnapshot/Environmental/EnvironmentalStatistics';

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

const Dashboard: React.FC = () => {
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

  const calculateSocialMetrics = (data: any) => {
    if (!data?.Demographics) return null;

    const demographics = data.Demographics;
    let totalPopulation = 0;
    let totalHouseholds = 0;
    let malePopulation = 0;
    let femalePopulation = 0;

    Object.values(demographics).forEach((village: any) => {
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
      villages: Object.keys(demographics).length
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

  const socialMetrics = calculateSocialMetrics(currentData.formData);
  const educationMetrics = calculateEducationMetrics(currentData.formData);

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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Population Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DemographicsOverview 
                    data={currentData.formData?.Demographics}
                    selectedVillage={selectedVillage}
                  />
                </CardContent>
              </Card>

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
            </div>
          </TabsContent>

          {/* Economic Tab */}
          <TabsContent value="economic" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Migration Rate"
                value="15.3%"
                icon={MapPin}
                subtitle="Households reporting migration"
                color="red"
              />
              <MetricCard
                title="MGNREGS Coverage"
                value="78%"
                icon={Coins}
                subtitle="Households with job cards"
                color="yellow"
              />
              <MetricCard
                title="Road Infrastructure"
                value="85%"
                icon={Route}
                subtitle="Roads in good condition"
                color="green"
              />
              <MetricCard
                title="Panchayat Revenue"
                value="₹12.5L"
                icon={Building}
                subtitle="Total annual revenue"
                color="blue"
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Economic Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EconomicStatistics 
                  migrationData={currentData.formData?.MigrationEmployment}
                  roadInfraData={currentData.formData?.RoadInfrastructure}
                  panchayatFinances={currentData.formData?.PanchayatFinances}
                  selectedVillage={selectedVillage}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Environmental Tab */}
          <TabsContent value="environmental" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Forest Cover"
                value="23.4%"
                icon={TreePine}
                subtitle="Of total land area"
                color="green"
              />
              <MetricCard
                title="Water Bodies"
                value="45"
                icon={Droplets}
                subtitle="Ponds, wells, tanks"
                color="blue"
              />
              <MetricCard
                title="Agricultural Land"
                value="67.8%"
                icon={Leaf}
                subtitle="Under cultivation"
                color="emerald"
              />
              <MetricCard
                title="Irrigation Coverage"
                value="52%"
                icon={Droplets}
                subtitle="Irrigated farmland"
                color="cyan"
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TreePine className="h-5 w-5" />
                  Environmental Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EnvironmentalStatistics 
                  landUseData={currentData.formData?.LandUseMapping}
                  waterResourcesData={currentData.formData?.WaterResources}
                  selectedVillage={selectedVillage}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;