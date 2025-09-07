import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { app } from '../../lib/firebase';

// Shadcn UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { Badge } from '@/components/ui/badge';

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
  Filter,
  RefreshCw,
  AlertCircle,
  Download,
  Globe,
  Map as MapIcon
} from 'lucide-react';

// Chart components
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

// Utility function for Indian number formatting
const formatIndianNumber = (num: number): string => {
  if (num === 0) return '0';
  
  const numStr = Math.abs(num).toString();
  const isNegative = num < 0;
  
  // Handle decimals
  const parts = numStr.split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1] ? '.' + parts[1] : '';
  
  // Add commas in Indian format
  let formatted = '';
  
  if (integerPart.length > 3) {
    const lastThree = integerPart.slice(-3);
    const remaining = integerPart.slice(0, -3);
    
    if (remaining.length > 0) {
      formatted = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
    } else {
      formatted = lastThree;
    }
  } else {
    formatted = integerPart;
  }
  
  return (isNegative ? '-' : '') + formatted + decimalPart;
};

// Format currency in Indian format for charts
const formatIndianCurrency = (amount: number): string => {
  if (amount === 0) return '₹0';
  
  const absAmount = Math.abs(amount);
  const isNegative = amount < 0;
  const prefix = isNegative ? '-₹' : '₹';
  
  if (absAmount >= 10000000) { // 1 crore
    const crores = absAmount / 10000000;
    return prefix + formatIndianNumber(Math.round(crores * 100) / 100) + ' Cr';
  } else if (absAmount >= 100000) { // 1 lakh
    const lakhs = absAmount / 100000;
    return prefix + formatIndianNumber(Math.round(lakhs * 100) / 100) + ' L';
  } else if (absAmount >= 1000) { // 1 thousand
    const thousands = absAmount / 1000;
    return prefix + formatIndianNumber(Math.round(thousands * 100) / 100) + ' K';
  } else {
    return prefix + formatIndianNumber(absAmount);
  }
};

// Enhanced components
import DemographicsCharts from '@/components/enhanced/DemographicsCharts';
import EconomicCharts from '@/components/enhanced/EconomicCharts';
import EnvironmentalCharts from '@/components/enhanced/EnvironmentalCharts';
import StatisticsOverview from '@/components/GPSnapshot/StatisticsOverview';

interface ConsolidatedData {
  formData: any;
  financialYear: string;
  submittedAt: string;
  gpName: string;
  district: string;
  block: string;
  userId: string;
}

interface FilterOptions {
  districts: string[];
  blocks: string[];
  gps: string[];
  years: string[];
}

interface AggregatedMetrics {
  totalPopulation: number;
  totalHouseholds: number;
  totalSchools: number;
  totalTeachers: number;
  totalStudents: number;
  totalMigrants: number;
  totalMGNREGSCards: number;
  totalRevenue: number;
  totalWaterBodies: number;
  totalForestArea: number;
  totalAgriculturalArea: number;
  gpCount: number;
  dataSubmissionRate: number;
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

const ConsolidatedDashboard: React.FC = () => {
  const [userData, setUserData] = useState<any>(null);
  const [allData, setAllData] = useState<ConsolidatedData[]>([]);
  const [filteredData, setFilteredData] = useState<ConsolidatedData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Filters
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedBlock, setSelectedBlock] = useState<string>('all');
  const [selectedGP, setSelectedGP] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  
  // Filter options - separate state for available options based on current filters
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    districts: [],
    blocks: [],
    gps: [],
    years: []
  });

  // Store all original options for reset
  const [allFilterOptions, setAllFilterOptions] = useState<FilterOptions>({
    districts: [],
    blocks: [],
    gps: [],
    years: []
  });

  // Aggregated metrics
  const [metrics, setMetrics] = useState<AggregatedMetrics | null>(null);

  const router = useRouter();
  const auth = getAuth(app);
  const db = getFirestore(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.role === 'Administrator') {
            setUserData(userData);
            await fetchAllData();
          } else {
            router.push('/dashboard');
          }
        }
        setLoading(false);
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchAllData = async () => {
    try {
      const dataCollectionsQuery = query(collection(db, 'dataCollections'));
      const querySnapshot = await getDocs(dataCollectionsQuery);
      
      const data: ConsolidatedData[] = [];
      const districts = new Set<string>();
      const blocks = new Set<string>();
      const gps = new Set<string>();
      const years = new Set<string>();

      querySnapshot.forEach((doc) => {
        const docData = doc.data() as ConsolidatedData;
        data.push(docData);
        
        districts.add(docData.district);
        blocks.add(docData.block);
        gps.add(docData.gpName);
        years.add(docData.financialYear);
      });

      setAllData(data);
      setFilteredData(data);
      
      const allOptions = {
        districts: Array.from(districts).sort(),
        blocks: Array.from(blocks).sort(),
        gps: Array.from(gps).sort(),
        years: Array.from(years).sort()
      };
      
      setAllFilterOptions(allOptions);
      setFilterOptions(allOptions);

      calculateAggregatedMetrics(data);
    } catch (error) {
      console.error('Error fetching consolidated data:', error);
    }
  };

  useEffect(() => {
    applyFilters();
  }, [selectedDistrict, selectedBlock, selectedGP, selectedYear]);

  const applyFilters = () => {
    let filtered = [...allData];
    let availableBlocks = new Set<string>();
    let availableGPs = new Set<string>();

    // Apply district filter
    if (selectedDistrict !== 'all') {
      filtered = filtered.filter(d => d.district === selectedDistrict);
    }

    // Collect available blocks based on current filtered data
    filtered.forEach(d => availableBlocks.add(d.block));

    // Apply block filter
    if (selectedBlock !== 'all') {
      filtered = filtered.filter(d => d.block === selectedBlock);
    }

    // Collect available GPs based on current filtered data
    filtered.forEach(d => availableGPs.add(d.gpName));

    // Apply GP filter
    if (selectedGP !== 'all') {
      filtered = filtered.filter(d => d.gpName === selectedGP);
    }

    // Apply year filter
    if (selectedYear !== 'all') {
      filtered = filtered.filter(d => d.financialYear === selectedYear);
    }

    // Update filter options based on current selection
    setFilterOptions({
      districts: allFilterOptions.districts, // Districts always show all
      blocks: selectedDistrict === 'all' 
        ? allFilterOptions.blocks 
        : Array.from(availableBlocks).sort(),
      gps: selectedDistrict === 'all' && selectedBlock === 'all'
        ? allFilterOptions.gps
        : Array.from(availableGPs).sort(),
      years: allFilterOptions.years // Years always show all
    });

    setFilteredData(filtered);
    calculateAggregatedMetrics(filtered);
  };

  const calculateAggregatedMetrics = (data: ConsolidatedData[]) => {
    let totalPopulation = 0;
    let totalHouseholds = 0;
    let totalSchools = 0;
    let totalTeachers = 0;
    let totalStudents = 0;
    let totalMigrants = 0;
    let totalMGNREGSCards = 0;
    let totalRevenue = 0;
    let totalWaterBodies = 0;
    let totalForestArea = 0;
    let totalAgriculturalArea = 0;

    const uniqueGPs = new Set<string>();

    data.forEach(record => {
      uniqueGPs.add(record.gpName);
      
      // Demographics
      if (record.formData?.Demographics) {
        Object.values(record.formData.Demographics).forEach((village: any) => {
          totalPopulation += parseInt(village.totalPopulation || 0);
          totalHouseholds += parseInt(village.households || 0);
        });
      }

      // Education
      if (record.formData?.Education) {
        Object.values(record.formData.Education).forEach((villageSchools: any) => {
          if (Array.isArray(villageSchools)) {
            totalSchools += villageSchools.length;
            villageSchools.forEach((school: any) => {
              totalTeachers += (parseInt(school.teachersMale || 0) + parseInt(school.teachersFemale || 0));
              totalStudents += parseInt(school.studentsTotal || 0);
            });
          }
        });
      }

      // Migration and Employment
      const migrationData = record.formData?.['Migration and Employment'] || record.formData?.MigrationEmployment;
      if (migrationData) {
        Object.values(migrationData).forEach((village: any) => {
          totalMigrants += (
            parseInt(village.seasonalMigrantsMale || 0) +
            parseInt(village.seasonalMigrantsFemale || 0) +
            parseInt(village.permanentMigrantsMale || 0) +
            parseInt(village.permanentMigrantsFemale || 0)
          );
          totalMGNREGSCards += parseInt(village.householdsWithMGNREGSCards || 0);
        });
      }

      // Panchayat Finances
      const finances = record.formData?.['Panchayat Finances'] || record.formData?.PanchayatFinances;
      if (finances) {
        totalRevenue += (
          parseInt(finances.cfc || 0) +
          parseInt(finances.sfc || 0) +
          parseInt(finances.ownSources || 0) +
          parseInt(finances.mgnregs || 0)
        );
      }

      // Water Resources
      const waterResources = record.formData?.['Water Resources'] || record.formData?.WaterResources;
      if (waterResources?.waterBodies) {
        Object.values(waterResources.waterBodies).forEach((village: any) => {
          if (Array.isArray(village)) {
            totalWaterBodies += village.length;
          }
        });
      }

      // Land Use
      const landUse = record.formData?.['Land Use Mapping'] || record.formData?.LandUseMapping;
      if (landUse?.landUseData) {
        Object.values(landUse.landUseData).forEach((village: any) => {
          totalForestArea += parseFloat(village.forestArea || 0);
          totalAgriculturalArea += parseFloat(village.cultivableArea || 0);
        });
      }
    });

    setMetrics({
      totalPopulation,
      totalHouseholds,
      totalSchools,
      totalTeachers,
      totalStudents,
      totalMigrants,
      totalMGNREGSCards,
      totalRevenue,
      totalWaterBodies,
      totalForestArea,
      totalAgriculturalArea,
      gpCount: uniqueGPs.size,
      dataSubmissionRate: (data.length / uniqueGPs.size) * 100
    });
  };

  const getDistrictWiseData = () => {
    const districtData = new Map<string, any>();
    
    filteredData.forEach(record => {
      if (!districtData.has(record.district)) {
        districtData.set(record.district, {
          name: record.district,
          population: 0,
          households: 0,
          schools: 0,
          gpCount: new Set()
        });
      }
      
      const district = districtData.get(record.district);
      district.gpCount.add(record.gpName);
      
      if (record.formData?.Demographics) {
        Object.values(record.formData.Demographics).forEach((village: any) => {
          district.population += parseInt(village.totalPopulation || 0);
          district.households += parseInt(village.households || 0);
        });
      }
      
      if (record.formData?.Education) {
        Object.values(record.formData.Education).forEach((villageSchools: any) => {
          if (Array.isArray(villageSchools)) {
            district.schools += villageSchools.length;
          }
        });
      }
    });
    
    return Array.from(districtData.values()).map(d => ({
      ...d,
      gpCount: d.gpCount.size
    }));
  };

  const getBlockWiseData = () => {
    // Assumes filteredData is already filtered by selectedDistrict when selected
    const blockData = new Map<string, any>();

    filteredData.forEach(record => {
      if (!blockData.has(record.block)) {
        blockData.set(record.block, {
          name: record.block,
          population: 0,
          households: 0
        });
      }

      const block = blockData.get(record.block);

      if (record.formData?.Demographics) {
        Object.values(record.formData.Demographics).forEach((village: any) => {
          block.population += parseInt(village.totalPopulation || 0);
          block.households += parseInt(village.households || 0);
        });
      }
    });

    return Array.from(blockData.values());
  };

  const getVillageWiseData = () => {
    // Assumes filteredData is already filtered by selectedGP when selected
    const villageData = new Map<string, any>();

    filteredData.forEach(record => {
      if (record.formData?.Demographics) {
        Object.entries(record.formData.Demographics).forEach(([villageName, village]: any) => {
          if (!villageData.has(villageName)) {
            villageData.set(villageName, {
              name: villageName,
              population: 0,
              households: 0
            });
          }
          const v = villageData.get(villageName);
          v.population += parseInt(village.totalPopulation || 0);
          v.households += parseInt(village.households || 0);
        });
      }
    });

    return Array.from(villageData.values());
  };

  const getDistributionConfig = () => {
    if (selectedGP !== 'all') {
      return { title: 'Village-wise Distribution', data: getVillageWiseData() };
    }
    if (selectedDistrict !== 'all') {
      return { title: 'Block-wise Distribution', data: getBlockWiseData() };
    }
    return { title: 'District-wise Distribution', data: getDistrictWiseData() };
  };

  const getYearWiseTrends = () => {
    const yearData = new Map<string, any>();
    
    filteredData.forEach(record => {
      if (!yearData.has(record.financialYear)) {
        yearData.set(record.financialYear, {
          year: record.financialYear,
          population: 0,
          migrants: 0,
          schools: 0
        });
      }
      
      const year = yearData.get(record.financialYear);
      
      if (record.formData?.Demographics) {
        Object.values(record.formData.Demographics).forEach((village: any) => {
          year.population += parseInt(village.totalPopulation || 0);
        });
      }
      
      // School trend removed from charts; keeping aggregation for potential future use
      if (record.formData?.Education) {
        Object.values(record.formData.Education).forEach((villageSchools: any) => {
          if (Array.isArray(villageSchools)) {
            year.schools += villageSchools.length;
          }
        });
      }
      
      const migrationData = record.formData?.['Migration and Employment'] || record.formData?.MigrationEmployment;
      if (migrationData) {
        Object.values(migrationData).forEach((village: any) => {
          year.migrants += (
            parseInt(village.seasonalMigrantsMale || 0) +
            parseInt(village.seasonalMigrantsFemale || 0) +
            parseInt(village.permanentMigrantsMale || 0) +
            parseInt(village.permanentMigrantsFemale || 0)
          );
        });
      }
    });
    
    return Array.from(yearData.values()).sort((a, b) => a.year.localeCompare(b.year));
  };

  // Year-wise population split by gender
  const getYearWisePopulationByGender = () => {
    const yearData = new Map<string, { year: string; male: number; female: number }>();

    filteredData.forEach(record => {
      if (!yearData.has(record.financialYear)) {
        yearData.set(record.financialYear, { year: record.financialYear, male: 0, female: 0 });
      }

      const agg = yearData.get(record.financialYear)!;

      if (record.formData?.Demographics) {
        Object.values(record.formData.Demographics).forEach((village: any) => {
          const male = parseInt(village.malePopulation || 0);
          const female = parseInt(village.femalePopulation || 0);
          // Fallback if male/female totals are not present, derive from age buckets
          const ageMale =
            parseInt(village.age0to14Male || 0) +
            parseInt(village.age15to60Male || 0) +
            parseInt(village.ageAbove60Male || 0);
          const ageFemale =
            parseInt(village.age0to14Female || 0) +
            parseInt(village.age15to60Female || 0) +
            parseInt(village.ageAbove60Female || 0);

          agg.male += male || ageMale || 0;
          agg.female += female || ageFemale || 0;
        });
      }
    });

    return Array.from(yearData.values()).sort((a, b) => a.year.localeCompare(b.year));
  };

  // Year-wise migration split by type and gender
  const getYearWiseMigrationBreakdown = () => {
    const yearData = new Map<string, {
      year: string;
      seasonalMale: number;
      seasonalFemale: number;
      permanentMale: number;
      permanentFemale: number;
    }>();

    filteredData.forEach(record => {
      if (!yearData.has(record.financialYear)) {
        yearData.set(record.financialYear, {
          year: record.financialYear,
          seasonalMale: 0,
          seasonalFemale: 0,
          permanentMale: 0,
          permanentFemale: 0
        });
      }

      const agg = yearData.get(record.financialYear)!;

      const migrationData = record.formData?.['Migration and Employment'] || record.formData?.MigrationEmployment;
      if (migrationData) {
        Object.values(migrationData).forEach((village: any) => {
          agg.seasonalMale += parseInt(village.seasonalMigrantsMale || 0);
          agg.seasonalFemale += parseInt(village.seasonalMigrantsFemale || 0);
          agg.permanentMale += parseInt(village.permanentMigrantsMale || 0);
          agg.permanentFemale += parseInt(village.permanentMigrantsFemale || 0);
        });
      }
    });

    return Array.from(yearData.values()).sort((a, b) => a.year.localeCompare(b.year));
  };

  // Population pyramid aggregated over current filters (and selected year if set)
  const getPopulationPyramidData = () => {
    const buckets: { [key: string]: { ageGroup: string; male: number; female: number } } = {
      '0-14': { ageGroup: '0-14', male: 0, female: 0 },
      '15-60': { ageGroup: '15-60', male: 0, female: 0 },
      '60+': { ageGroup: '60+', male: 0, female: 0 }
    };

    filteredData.forEach(record => {
      if (record.formData?.Demographics) {
        Object.values(record.formData.Demographics).forEach((village: any) => {
          buckets['0-14'].male += parseInt(village.age0to14Male || 0);
          buckets['0-14'].female += parseInt(village.age0to14Female || 0);
          buckets['15-60'].male += parseInt(village.age15to60Male || 0);
          buckets['15-60'].female += parseInt(village.age15to60Female || 0);
          buckets['60+'].male += parseInt(village.ageAbove60Male || 0);
          buckets['60+'].female += parseInt(village.ageAbove60Female || 0);
        });
      }
    });

    return Object.values(buckets);
  };

  const getGPFinanceData = () => {
    const gpFinanceData = new Map<string, any>();

    // Ensure every GP in current filter is represented and aggregate finances across records
    filteredData.forEach(record => {
      const key = record.gpName;
      const existing = gpFinanceData.get(key) || {
        gpName: record.gpName.length > 15 ? record.gpName.substring(0, 15) + '...' : record.gpName,
        fullGPName: record.gpName,
        district: record.district,
        block: record.block,
        CFC: 0,
        SFC: 0,
        'Own Sources': 0,
        MGNREGS: 0,
        totalRevenue: 0
      };

      const finances = record.formData?.['Panchayat Finances'] || record.formData?.PanchayatFinances;
      if (finances) {
        const cfc = parseInt(finances.cfc || 0);
        const sfc = parseInt(finances.sfc || 0);
        const ownSources = parseInt(finances.ownSources || 0);
        const mgnregs = parseInt(finances.mgnregs || 0);
        existing.CFC += cfc;
        existing.SFC += sfc;
        existing['Own Sources'] += ownSources;
        existing.MGNREGS += mgnregs;
        existing.totalRevenue += cfc + sfc + ownSources + mgnregs;
      }

      gpFinanceData.set(key, existing);
    });

    return Array.from(gpFinanceData.values()).sort((a, b) => b.totalRevenue - a.totalRevenue);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading consolidated dashboard...</p>
        </div>
      </div>
    );
  }

  if (!userData || userData.role !== 'Administrator') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-8">
        <div className="max-w-4xl mx-auto text-center">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              Only administrators can access the consolidated dashboard.
            </AlertDescription>
          </Alert>
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
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <CardTitle className="text-3xl font-bold flex items-center gap-3">
                    <Globe className="h-8 w-8" />
                    Admin Consolidated Dashboard
                  </CardTitle>
                  <CardDescription className="text-blue-50 mt-2 text-lg">
                    Comprehensive GP Data Analytics & Insights
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-white text-blue-600 px-4 py-2 text-sm font-semibold">
                    Administrator
                  </Badge>
                  <Badge variant="outline" className="border-white text-white px-4 py-2">
                    {metrics?.gpCount || 0} GPs
                  </Badge>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Filter Controls */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <MapIcon className="h-4 w-4 text-gray-500" />
                  <Select value={selectedDistrict} onValueChange={(value) => {
                    setSelectedDistrict(value);
                    setSelectedBlock('all');
                    setSelectedGP('all');
                  }}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select District" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Districts</SelectItem>
                      {filterOptions.districts.map(district => (
                        <SelectItem key={district} value={district}>{district}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-gray-500" />
                  <Select value={selectedBlock} onValueChange={(value) => {
                    setSelectedBlock(value);
                    setSelectedGP('all');
                  }}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select Block" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Blocks</SelectItem>
                      {filterOptions.blocks.map(block => (
                        <SelectItem key={block} value={block}>{block}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-gray-500" />
                  <Select value={selectedGP} onValueChange={setSelectedGP}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select GP" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All GPs</SelectItem>
                      {filterOptions.gps.map(gp => (
                        <SelectItem key={gp} value={gp}>{gp}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      {filterOptions.years.map(year => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedDistrict('all');
                    setSelectedBlock('all');
                    setSelectedGP('all');
                    setSelectedYear('all');
                    // Reset filter options to show all
                    setFilterOptions(allFilterOptions);
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset Filters
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <MetricCard
              title="Total Population"
              value={formatIndianNumber(metrics.totalPopulation)}
              icon={Users}
              subtitle={`${formatIndianNumber(metrics.gpCount)} Gram Panchayats`}
              color="blue"
            />
            <MetricCard
              title="Total Households"
              value={formatIndianNumber(metrics.totalHouseholds)}
              icon={Home}
              subtitle="Registered households"
              color="green"
            />
            <MetricCard
              title="Educational Institutions"
              value={formatIndianNumber(metrics.totalSchools)}
              icon={School}
              subtitle={`${formatIndianNumber(metrics.totalTeachers)} teachers, ${formatIndianNumber(metrics.totalStudents)} students`}
              color="purple"
            />
            <MetricCard
              title="Total Revenue"
              value={formatIndianCurrency(metrics.totalRevenue)}
              icon={DollarSign}
              subtitle="Annual GP revenue"
              color="yellow"
            />
          </div>
        )}

        {/* Main Dashboard Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <Card>
            <CardContent className="p-2">
              <TabsList className="grid w-full grid-cols-5 bg-gray-100">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="demographics">Demographics</TabsTrigger>
                <TabsTrigger value="economic">Economic</TabsTrigger>
                <TabsTrigger value="education">Education</TabsTrigger>
                <TabsTrigger value="environmental">Environmental</TabsTrigger>
              </TabsList>
            </CardContent>
          </Card>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Dynamic Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>{getDistributionConfig().title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getDistributionConfig().data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => formatIndianNumber(value)} />
                      <Tooltip formatter={(value: any, name: string) => [formatIndianNumber(value), name]} />
                      <Legend />
                      <Bar dataKey="population" fill="#8884d8" name="Population" />
                      <Bar dataKey="households" fill="#82ca9d" name="Households" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Year-wise Population by Gender */}
              <Card>
                <CardHeader>
                  <CardTitle>Year-wise Population by Gender</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={getYearWisePopulationByGender()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis tickFormatter={(value) => formatIndianNumber(value)} />
                      <Tooltip formatter={(value: any, name: string) => [formatIndianNumber(Math.abs(value)), name]} />
                      <Legend />
                      <Line type="monotone" dataKey="male" stroke="#3b82f6" name="Male" />
                      <Line type="monotone" dataKey="female" stroke="#ef4444" name="Female" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Year-wise Migrants by Type and Gender */}
            <Card>
              <CardHeader>
                <CardTitle>Year-wise Migrants by Type and Gender</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={360}>
                  <BarChart data={getYearWiseMigrationBreakdown()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(value) => formatIndianNumber(value)} />
                    <Tooltip formatter={(value: any, name: string) => [formatIndianNumber(Math.abs(value)), name]} />
                    <Legend />
                    {/* Clustered stacks: Seasonal (male+female) and Permanent (male+female) */}
                    <Bar dataKey="seasonalMale" stackId="seasonal" fill="#06b6d4" name="Seasonal Male" />
                    <Bar dataKey="seasonalFemale" stackId="seasonal" fill="#22c55e" name="Seasonal Female" />
                    <Bar dataKey="permanentMale" stackId="permanent" fill="#f59e0b" name="Permanent Male" />
                    <Bar dataKey="permanentFemale" stackId="permanent" fill="#a855f7" name="Permanent Female" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Population Pyramid in Overview removed as requested */}

            {/* GP Coverage */}
            <Card>
              <CardHeader>
                <CardTitle>Data Submission Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{formatIndianNumber(metrics?.gpCount || 0)}</p>
                    <p className="text-sm text-gray-600">Total GPs</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{formatIndianNumber(filteredData.length)}</p>
                    <p className="text-sm text-gray-600">Data Submissions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{(metrics?.dataSubmissionRate || 0).toFixed(1)}%</p>
                    <p className="text-sm text-gray-600">Coverage Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* GP Finance Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>All GP Revenue Sources (Descending Order)</CardTitle>
                <CardDescription>All GPs by total revenue with funding source breakdown - scroll to view all</CardDescription>
              </CardHeader>
              <CardContent>
                <div 
                  className="w-full border rounded-lg bg-gray-50"
                  style={{ 
                    height: '600px', // fixed height to force scroll when content exceeds
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    scrollbarWidth: 'auto',
                    msOverflowStyle: 'auto'
                  }}
                >
                  <style jsx>{`
                    .scrollable::-webkit-scrollbar {
                      width: 14px;
                      background-color: #f1f5f9;
                    }
                    .scrollable::-webkit-scrollbar-track {
                      background: #e2e8f0;
                      margin: 4px;
                    }
                    .scrollable::-webkit-scrollbar-thumb {
                      background: linear-gradient(180deg, #64748b 0%, #475569 100%);
                      border-radius: 8px;
                      border: 2px solid #e2e8f0;
                    }
                    .scrollable::-webkit-scrollbar-thumb:hover {
                      background: linear-gradient(180deg, #475569 0%, #334155 100%);
                    }
                  `}</style>
                  <div 
                    className="scrollable"
                    style={{ 
                      width: '100%', 
                      height: Math.max(600, getGPFinanceData().length * 48)
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={getGPFinanceData()}
                        layout="vertical"
                        margin={{ top: 20, right: 40, left: 160, bottom: 20 }}
                        barCategoryGap="10%"
                      >
                        <defs>
                          <linearGradient id="cfcGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#0088FE" stopOpacity={0.8}/>
                            <stop offset="100%" stopColor="#0099FF" stopOpacity={1}/>
                          </linearGradient>
                          <linearGradient id="sfcGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#00C49F" stopOpacity={0.8}/>
                            <stop offset="100%" stopColor="#00D4AA" stopOpacity={1}/>
                          </linearGradient>
                          <linearGradient id="ownGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#FFBB28" stopOpacity={0.8}/>
                            <stop offset="100%" stopColor="#FFCC44" stopOpacity={1}/>
                          </linearGradient>
                          <linearGradient id="mgnregsGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#FF8042" stopOpacity={0.8}/>
                            <stop offset="100%" stopColor="#FF9966" stopOpacity={1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="2 2" stroke="#e2e8f0" />
                        <XAxis 
                          type="number" 
                          tickFormatter={(value) => formatIndianCurrency(value)}
                          domain={[0, 'dataMax']}
                          tick={{ fontSize: 11, fill: '#64748b' }}
                          axisLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                          tickLine={{ stroke: '#cbd5e1' }}
                        />
                        <YAxis 
                          type="category" 
                          dataKey="gpName" 
                          width={150}
                          tick={{ fontSize: 11, fill: '#374151' }}
                          interval={0}
                          axisLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                          tickLine={false}
                        />
                        <Tooltip 
                          formatter={(value: any, name: string) => [formatIndianCurrency(value), name]}
                          labelFormatter={(label) => {
                            const gpData = getGPFinanceData().find(gp => gp.gpName === label);
                            return `${gpData?.fullGPName || label} (${gpData?.district}, ${gpData?.block})`;
                          }}
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #d1d5db', 
                            borderRadius: '8px',
                            fontSize: '12px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                          }}
                          cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                        />
                        <Legend 
                          wrapperStyle={{ paddingTop: '20px' }}
                          iconType="rect"
                        />
                        <Bar 
                          dataKey="CFC" 
                          stackId="a" 
                          fill="url(#cfcGradient)" 
                          name="CFC"
                          stroke="#0066CC"
                          strokeWidth={1}
                        />
                        <Bar 
                          dataKey="SFC" 
                          stackId="a" 
                          fill="url(#sfcGradient)" 
                          name="SFC"
                          stroke="#00AA88"
                          strokeWidth={1}
                        />
                        <Bar 
                          dataKey="Own Sources" 
                          stackId="a" 
                          fill="url(#ownGradient)" 
                          name="Own Sources"
                          stroke="#DD9922"
                          strokeWidth={1}
                        />
                        <Bar 
                          dataKey="MGNREGS" 
                          stackId="a" 
                          fill="url(#mgnregsGradient)" 
                          name="MGNREGS"
                          stroke="#DD6633"
                          strokeWidth={1}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded"></div>
                      <span>CFC - Central Finance Commission</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                      <span>SFC - State Finance Commission</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                      <span>Own Sources - Local Revenue</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded"></div>
                      <span>MGNREGS - Employment Scheme Funds</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Demographics Tab */}
          <TabsContent value="demographics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Population"
                value={metrics?.totalPopulation.toLocaleString() || 0}
                icon={Users}
                subtitle="Across all GPs"
                color="blue"
              />
              <MetricCard
                title="Total Households"
                value={metrics?.totalHouseholds.toLocaleString() || 0}
                icon={Home}
                subtitle="Registered households"
                color="green"
              />
              <MetricCard
                title="Average Household Size"
                value={metrics && metrics.totalHouseholds > 0 ? (metrics.totalPopulation / metrics.totalHouseholds).toFixed(1) : 0}
                icon={UserCheck}
                subtitle="Members per household"
                color="purple"
              />
              <MetricCard
                title="GP Coverage"
                value={metrics?.gpCount || 0}
                icon={MapIcon}
                subtitle="Active Gram Panchayats"
                color="orange"
              />
            </div>

            {/* Aggregate Demographics Charts */}
            {filteredData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Population Distribution Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <DemographicsCharts 
                    data={filteredData.reduce((acc, record) => {
                      if (record.formData?.Demographics) {
                        return { ...acc, ...record.formData.Demographics };
                      }
                      return acc;
                    }, {})}
                    selectedVillage="all"
                  />
                </CardContent>
              </Card>
            )}

            {/* Population Pyramid */}
            {filteredData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Population Pyramid (Age Groups)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={360}>
                    <BarChart
                      data={getPopulationPyramidData().map(d => ({
                        ...d,
                        male: -Math.abs(d.male), // negative for left side
                        female: Math.abs(d.female)
                      }))}
                      layout="vertical"
                      margin={{ top: 20, right: 40, left: 40, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tickFormatter={(v) => formatIndianNumber(Math.abs(v as number))} />
                      <YAxis type="category" dataKey="ageGroup" />
                      <Tooltip formatter={(value: any, name: string) => [formatIndianNumber(Math.abs(value)), name]} />
                      <Legend />
                      <Bar dataKey="male" fill="#3b82f6" name="Male" />
                      <Bar dataKey="female" fill="#ef4444" name="Female" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Economic Tab */}
          <TabsContent value="economic" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Revenue"
                value={`₹${((metrics?.totalRevenue || 0) / 10000000).toFixed(2)}Cr`}
                icon={DollarSign}
                subtitle="Annual GP revenue"
                color="green"
              />
              <MetricCard
                title="MGNREGS Cards"
                value={metrics?.totalMGNREGSCards.toLocaleString() || 0}
                icon={Coins}
                subtitle="Total job cards issued"
                color="yellow"
              />
              <MetricCard
                title="Total Migrants"
                value={metrics?.totalMigrants.toLocaleString() || 0}
                icon={MapPin}
                subtitle="Seasonal + Permanent"
                color="red"
              />
              <MetricCard
                title="Migration Rate"
                value={`${metrics && metrics.totalHouseholds > 0 ? ((metrics.totalMigrants / metrics.totalHouseholds) * 100).toFixed(1) : 0}%`}
                icon={Route}
                subtitle="Of total households"
                color="orange"
              />
            </div>

            {/* Economic Analysis Charts */}
            {filteredData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Economic Indicators</CardTitle>
                </CardHeader>
                <CardContent>
                  <EconomicCharts 
                    migrationData={filteredData.reduce((acc, record) => {
                      const data = record.formData?.['Migration and Employment'] || record.formData?.MigrationEmployment;
                      if (data) {
                        return { ...acc, ...data };
                      }
                      return acc;
                    }, {})}
                    roadInfraData={filteredData[0]?.formData?.['Road Infrastructure'] || filteredData[0]?.formData?.RoadInfrastructure}
                    panchayatFinances={filteredData.reduce((acc, record) => {
                      const finances = record.formData?.['Panchayat Finances'] || record.formData?.PanchayatFinances;
                      if (finances) {
                        return {
                          cfc: (parseInt(acc.cfc || 0) + parseInt(finances.cfc || 0)).toString(),
                          sfc: (parseInt(acc.sfc || 0) + parseInt(finances.sfc || 0)).toString(),
                          ownSources: (parseInt(acc.ownSources || 0) + parseInt(finances.ownSources || 0)).toString(),
                          mgnregs: (parseInt(acc.mgnregs || 0) + parseInt(finances.mgnregs || 0)).toString()
                        };
                      }
                      return acc;
                    }, { cfc: '0', sfc: '0', ownSources: '0', mgnregs: '0' })}
                    selectedVillage="all"
                    villageNames={(() => {
                      const migrationData = filteredData.reduce((acc, record) => {
                        const data = record.formData?.['Migration and Employment'] || record.formData?.MigrationEmployment;
                        if (data) {
                          return { ...acc, ...data };
                        }
                        return acc;
                      }, {});
                      return Object.keys(migrationData);
                    })()}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Education Tab */}
          <TabsContent value="education" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Schools"
                value={metrics?.totalSchools || 0}
                icon={School}
                subtitle="Educational institutions"
                color="blue"
              />
              <MetricCard
                title="Total Teachers"
                value={metrics?.totalTeachers.toLocaleString() || 0}
                icon={GraduationCap}
                subtitle="Teaching staff"
                color="green"
              />
              <MetricCard
                title="Total Students"
                value={metrics?.totalStudents.toLocaleString() || 0}
                icon={Users}
                subtitle="Enrolled students"
                color="purple"
              />
              <MetricCard
                title="Student-Teacher Ratio"
                value={metrics && metrics.totalTeachers > 0 ? (metrics.totalStudents / metrics.totalTeachers).toFixed(1) : 0}
                icon={UserCheck}
                subtitle="Students per teacher"
                color="orange"
              />
            </div>

            {/* Education Statistics */}
            {filteredData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Education Infrastructure</CardTitle>
                </CardHeader>
                <CardContent>
                  <StatisticsOverview 
                    demographicsData={filteredData.reduce((acc, record) => {
                      if (record.formData?.Demographics) {
                        return { ...acc, ...record.formData.Demographics };
                      }
                      return acc;
                    }, {})}
                    educationData={filteredData.reduce((acc, record) => {
                      if (record.formData?.Education) {
                        return { ...acc, ...record.formData.Education };
                      }
                      return acc;
                    }, {})}
                    selectedVillage="all"
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Environmental Tab */}
          <TabsContent value="environmental" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Forest Area"
                value={`${metrics?.totalForestArea.toFixed(1) || 0} acres`}
                icon={TreePine}
                subtitle="Total forest land"
                color="green"
              />
              <MetricCard
                title="Agricultural Land"
                value={`${metrics?.totalAgriculturalArea.toFixed(1) || 0} acres`}
                icon={Leaf}
                subtitle="Cultivable area"
                color="emerald"
              />
              <MetricCard
                title="Water Bodies"
                value={metrics?.totalWaterBodies || 0}
                icon={Droplets}
                subtitle="Ponds, lakes, streams"
                color="blue"
              />
              <MetricCard
                title="Green Cover"
                value={`${metrics && (metrics.totalForestArea + metrics.totalAgriculturalArea) > 0 ? ((metrics.totalForestArea / (metrics.totalForestArea + metrics.totalAgriculturalArea)) * 100).toFixed(1) : 0}%`}
                icon={TreePine}
                subtitle="Forest percentage"
                color="green"
              />
            </div>

            {/* Environmental Charts */}
            {filteredData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Environmental Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <EnvironmentalCharts 
                    landUseData={filteredData.reduce((acc, record) => {
                      const data = record.formData?.['Land Use Mapping'] || record.formData?.LandUseMapping;
                      if (data?.landUseData) {
                        return { landUseData: { ...acc.landUseData, ...data.landUseData } };
                      }
                      return acc;
                    }, { landUseData: {} })}
                    waterResourcesData={filteredData.reduce((acc, record) => {
                      const data = record.formData?.['Water Resources'] || record.formData?.WaterResources;
                      if (data) {
                        return {
                          waterBodies: { ...acc.waterBodies, ...data.waterBodies },
                          irrigationStructures: { ...acc.irrigationStructures, ...data.irrigationStructures }
                        };
                      }
                      return acc;
                    }, { waterBodies: {}, irrigationStructures: {} })}
                    selectedVillage="all"
                    villageNames={(() => {
                      const landUseData = filteredData.reduce((acc, record) => {
                        const data = record.formData?.['Land Use Mapping'] || record.formData?.LandUseMapping;
                        if (data?.landUseData) {
                          return { ...acc.landUseData, ...data.landUseData };
                        }
                        return { ...acc.landUseData };
                      }, { landUseData: {} });
                      return Object.keys(landUseData.landUseData || {});
                    })()}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ConsolidatedDashboard;