import React, { useState, useEffect, Fragment } from 'react';
import { useRouter } from 'next/router';
import { getAuth, onAuthStateChanged, deleteUser, User } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  deleteDoc,
  orderBy 
} from 'firebase/firestore';
import { app } from '../../lib/firebase';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Shadcn UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// Icons
import { 
  Users, 
  FileSpreadsheet,
  Download,
  Trash2,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  RefreshCw,
  Eye,
  Database,
  UserMinus,
  FileText,
  Building,
  MapPin,
  Home,
  Clock,
  TrendingUp,
  Activity,
  Info,
  CheckSquare,
  Square,
  GraduationCap,
  Heart,
  Coins,
  Route,
  TreePine,
  Droplets,
  ChevronRight,
  FileDown,
  CircleCheckBig,
  CircleDashed,
  CircleX,
  UsersIcon
} from 'lucide-react';

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

// Format currency in Indian format
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

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  district: string;
  block: string;
  gpName: string;
  role: string;
  registrationNumber: string;
  createdAt: any;
}

interface DataCollection {
  id: string;
  userId: string;
  gpName: string;
  district: string;
  block: string;
  financialYear: string;
  submittedAt: string;
  lastUpdatedAt: string;
  formData: any;
  userDetails: {
    name: string;
    email: string;
    role: string;
  };
}

interface GPReportData {
  gpName: string;
  district: string;
  block: string;
  totalSubmissions: number;
  latestSubmission: string;
  years: string[];
  completionStatus: number;
}

interface GPOverviewData {
  gpName: string;
  district: string;
  block: string;
  users: Array<{
    id: string;
    name: string;
    email: string;
  }>;
  dataByYear: Map<string, {
    hasData: boolean;
    isComplete: boolean;
    submittedAt: string;
    updatedAt: string;
    userId: string;
    completionPercentage: number;
  }>;
}

// Component to display submission details
const SubmissionDetailsModal: React.FC<{ submission: DataCollection }> = ({ submission }) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const element = document.getElementById('pdf-content');
      if (!element) {
        throw new Error('PDF content element not found');
      }

      // Configure html2canvas options for better quality
      const canvas = await html2canvas(element, {
        scale: 2, // Higher resolution
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight,
        scrollX: 0,
        scrollY: 0
      });

      const imgData = canvas.toDataURL('image/png');
      
      // Create PDF with A4 dimensions
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate image dimensions to fit in PDF
      const imgWidth = pdfWidth - 20; // 10mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 10; // Top margin

      // Add first page
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= (pdfHeight - 20); // Subtract margins

      // Add additional pages if content is too long
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= (pdfHeight - 20);
      }

      // Generate filename
      const date = new Date().toISOString().split('T')[0];
      const filename = `GP_${submission.gpName}_${submission.financialYear}_${date}.pdf`;
      
      // Save the PDF
      pdf.save(filename);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };
  const renderFormSection = (title: string, data: any, icon: React.ComponentType<any>) => {
    const Icon = icon;
    const hasData = data && Object.keys(data).length > 0;
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
        <div className="flex items-center gap-3 mb-4 pb-2 border-b border-gray-100">
          <div className={`p-2 rounded-lg ${hasData ? 'bg-green-100' : 'bg-gray-100'}`}>
            <Icon className={`h-5 w-5 ${hasData ? 'text-green-600' : 'text-gray-400'}`} />
          </div>
          <h4 className="font-semibold text-lg text-gray-800">{title}</h4>
          <div className="ml-auto">
            {hasData ? (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                <CheckSquare className="h-3 w-3 mr-1" />
                Complete
              </Badge>
            ) : (
              <Badge variant="outline" className="text-gray-500 border-gray-300">
                <Square className="h-3 w-3 mr-1" />
                Empty
              </Badge>
            )}
          </div>
        </div>
        
        {hasData ? (
          <div className="space-y-3">
            {title === 'Demographics' && typeof data === 'object' && (
              Object.entries(data).map(([village, villageData]: [string, any]) => (
                <div key={village} className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <h5 className="font-semibold mb-3 text-blue-800 flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    {village}
                  </h5>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-white p-2 rounded border">
                      <span className="text-gray-600">Population:</span>
                      <span className="font-medium text-gray-800 ml-2">
                        {villageData.totalPopulation ? formatIndianNumber(parseInt(villageData.totalPopulation)) : 'N/A'}
                      </span>
                    </div>
                    <div className="bg-white p-2 rounded border">
                      <span className="text-gray-600">Households:</span>
                      <span className="font-medium text-gray-800 ml-2">
                        {villageData.households ? formatIndianNumber(parseInt(villageData.households)) : 'N/A'}
                      </span>
                    </div>
                    <div className="bg-white p-2 rounded border">
                      <span className="text-gray-600">Male:</span>
                      <span className="font-medium text-gray-800 ml-2">
                        {villageData.malePopulation ? formatIndianNumber(parseInt(villageData.malePopulation)) : 'N/A'}
                      </span>
                    </div>
                    <div className="bg-white p-2 rounded border">
                      <span className="text-gray-600">Female:</span>
                      <span className="font-medium text-gray-800 ml-2">
                        {villageData.femalePopulation ? formatIndianNumber(parseInt(villageData.femalePopulation)) : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {title === 'Education' && typeof data === 'object' && (
              Object.entries(data).map(([village, schools]: [string, any]) => (
                <div key={village} className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                  <h5 className="font-semibold mb-3 text-purple-800 flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    {village}
                  </h5>
                  {Array.isArray(schools) ? schools.map((school: any, idx: number) => (
                    <div key={idx} className="mb-3 bg-white p-3 rounded-lg border border-purple-200">
                      <div className="space-y-2">
                        <div className="font-medium text-purple-800 flex items-center gap-2">
                          <GraduationCap className="h-4 w-4" />
                          {school.name || 'Unnamed School'}
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <span className="text-gray-600">Teachers: <span className="font-medium text-gray-800">{formatIndianNumber(parseInt(school.teachersMale || 0) + parseInt(school.teachersFemale || 0))}</span></span>
                          <span className="text-gray-600">Students: <span className="font-medium text-gray-800">{formatIndianNumber(parseInt(school.studentsTotal || 0))}</span></span>
                          <span className="text-gray-600">Status: <span className="font-medium text-gray-800">{school.infrastructureStatus || 'Not specified'}</span></span>
                        </div>
                      </div>
                    </div>
                  )) : <div className="bg-white p-3 rounded border text-sm text-gray-600">No school data available</div>}
                </div>
              ))
            )}
            
            {(title === 'Migration and Employment' || title === 'MigrationEmployment') && typeof data === 'object' && (
              Object.entries(data).map(([village, migrationData]: [string, any]) => (
                <div key={village} className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                  <h5 className="font-semibold mb-3 text-orange-800 flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    {village}
                  </h5>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-white p-2 rounded border">
                      <span className="text-gray-600">Migration Reports:</span>
                      <span className="font-medium text-gray-800 ml-2">{formatIndianNumber(parseInt(migrationData.householdsReportingMigration || 0))}</span>
                    </div>
                    <div className="bg-white p-2 rounded border">
                      <span className="text-gray-600">MGNREGS Cards:</span>
                      <span className="font-medium text-gray-800 ml-2">{formatIndianNumber(parseInt(migrationData.householdsWithMGNREGSCards || 0))}</span>
                    </div>
                    <div className="bg-white p-2 rounded border">
                      <span className="text-gray-600">Landless HH:</span>
                      <span className="font-medium text-gray-800 ml-2">{formatIndianNumber(parseInt(migrationData.landlessHouseholds || 0))}</span>
                    </div>
                    <div className="bg-white p-2 rounded border">
                      <span className="text-gray-600">MGNREGS Days:</span>
                      <span className="font-medium text-gray-800 ml-2">{formatIndianNumber(parseInt(migrationData.workdaysProvidedMGNREGS || 0))}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {title === 'Panchayat Finances' && typeof data === 'object' && (
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <h5 className="font-semibold mb-3 text-green-800 flex items-center gap-2">
                  <Coins className="h-4 w-4" />
                  Financial Breakdown
                </h5>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-white p-3 rounded border">
                    <span className="text-gray-600">CFC:</span>
                    <span className="font-bold text-green-600 ml-2">{formatIndianCurrency(parseInt(data.cfc || 0))}</span>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <span className="text-gray-600">SFC:</span>
                    <span className="font-bold text-green-600 ml-2">{formatIndianCurrency(parseInt(data.sfc || 0))}</span>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <span className="text-gray-600">Own Sources:</span>
                    <span className="font-bold text-green-600 ml-2">{formatIndianCurrency(parseInt(data.ownSources || 0))}</span>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <span className="text-gray-600">MGNREGS:</span>
                    <span className="font-bold text-green-600 ml-2">{formatIndianCurrency(parseInt(data.mgnregs || 0))}</span>
                  </div>
                </div>
                <div className="mt-3 bg-green-100 p-3 rounded border-2 border-green-300">
                  <span className="text-green-800 font-semibold">Total Revenue: </span>
                  <span className="font-bold text-green-800 text-xl">
                    {formatIndianCurrency(parseInt(data.cfc || 0) + parseInt(data.sfc || 0) + parseInt(data.ownSources || 0) + parseInt(data.mgnregs || 0))}
                  </span>
                </div>
              </div>
            )}
            
            {(title === 'Land Use Mapping' || title === 'Water Resources') && (
              <div className="bg-teal-50 border border-teal-200 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-teal-800">
                  <Database className="h-5 w-5" />
                  <span className="font-medium">
                    {Object.keys(data).length} data entries available
                  </span>
                </div>
                <div className="mt-2 text-sm text-teal-600">
                  Click to expand for detailed view in future updates
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg text-center">
            <div className="text-gray-400 mb-2">
              <Square className="h-8 w-8 mx-auto" />
            </div>
            <div className="text-gray-500 font-medium">No data submitted for this category</div>
            <div className="text-gray-400 text-sm mt-1">This section is empty</div>
          </div>
        )}
      </div>
    );
  };

  const formCategories = [
    { key: 'Demographics', title: 'Demographics', icon: Users },
    { key: 'Education', title: 'Education', icon: GraduationCap },
    { key: 'Health and Childcare', title: 'Health and Childcare', icon: Heart },
    { key: 'Migration and Employment', title: 'Migration and Employment', icon: Route },
    { key: 'MigrationEmployment', title: 'Migration Employment', icon: Route },
    { key: 'Road Infrastructure', title: 'Road Infrastructure', icon: MapPin },
    { key: 'Panchayat Finances', title: 'Panchayat Finances', icon: Coins },
    { key: 'PanchayatFinances', title: 'Panchayat Finances', icon: Coins },
    { key: 'Land Use Mapping', title: 'Land Use Mapping', icon: TreePine },
    { key: 'LandUseMapping', title: 'Land Use Mapping', icon: TreePine },
    { key: 'Water Resources', title: 'Water Resources', icon: Droplets },
    { key: 'WaterResources', title: 'Water Resources', icon: Droplets }
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] bg-white">
        <DialogHeader className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-6 -m-6 mb-6 rounded-t-lg">
          <DialogTitle className="flex items-center justify-between text-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <Info className="h-6 w-6" />
              </div>
              <div>
                <div>Submission Details - {submission.gpName}</div>
                <div className="text-blue-100 text-sm font-normal mt-1">
                  {submission.district} • {submission.block} • {submission.financialYear}
                </div>
              </div>
            </div>
            <Button 
              onClick={generatePDF}
              disabled={isGeneratingPDF}
              className="bg-white bg-opacity-20 hover:bg-white hover:bg-opacity-30 text-white border-white border"
              size="sm"
            >
              {isGeneratingPDF ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileDown className="h-4 w-4 mr-2" />
                  Download PDF
                </>
              )}
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh] pr-4">
          <div id="pdf-content" className="space-y-6 bg-white p-4">
            {/* PDF Header (will be included in PDF) */}
            <div className="text-center border-b-2 border-blue-600 pb-4 mb-6 print:block">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Gram Panchayat Data Collection Report
              </h1>
              <h2 className="text-xl font-semibold text-blue-600 mb-1">
                {submission.gpName}
              </h2>
              <p className="text-gray-600">
                {submission.district} • {submission.block} • Financial Year: {submission.financialYear}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Generated on: {new Date().toLocaleDateString('en-IN', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>

            {/* Submission Info */}
            <Card className="bg-white border-2 border-gray-200 shadow-lg">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Submission Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-6 text-sm">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <span className="text-blue-600 font-medium">Submitted by:</span>
                    <div className="font-semibold text-gray-800 mt-1">{submission.userDetails?.name || 'Unknown User'}</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <span className="text-green-600 font-medium">Email:</span>
                    <div className="font-semibold text-gray-800 mt-1">{submission.userDetails?.email || 'N/A'}</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <span className="text-purple-600 font-medium">Submitted on:</span>
                    <div className="font-semibold text-gray-800 mt-1">{new Date(submission.submittedAt).toLocaleString()}</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <span className="text-orange-600 font-medium">Last updated:</span>
                    <div className="font-semibold text-gray-800 mt-1">{submission.lastUpdatedAt 
                      ? new Date(submission.lastUpdatedAt).toLocaleString() 
                      : 'Never updated'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Form Data Sections */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-800">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Database className="h-6 w-6 text-blue-600" />
                </div>
                Form Data Categories
              </h3>
              
              <div className="space-y-4">
                {formCategories.map(category => {
                  const data = submission.formData?.[category.key];
                  if (!data && category.key !== category.title) return null;
                  
                  return (
                    <div key={category.key}>
                      {renderFormSection(category.title, data, category.icon)}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

const GPReports: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [dataCollections, setDataCollections] = useState<DataCollection[]>([]);
  const [gpReports, setGPReports] = useState<GPReportData[]>([]);
  const [gpOverviewData, setGPOverviewData] = useState<GPOverviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  // Filters
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedBlock, setSelectedBlock] = useState<string>('all');
  const [selectedGP, setSelectedGP] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');

  // Filter options
  const [districts, setDistricts] = useState<string[]>([]);
  const [blocks, setBlocks] = useState<string[]>([]);
  const [gps, setGPs] = useState<string[]>([]);
  const [years, setYears] = useState<string[]>([]);

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
            setCurrentUser(userData);
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
      // Fetch all users
      const usersQuery = query(collection(db, 'users'));
      const usersSnapshot = await getDocs(usersQuery);
      const usersData: UserData[] = [];
      
      usersSnapshot.forEach((doc) => {
        usersData.push({ id: doc.id, ...doc.data() } as UserData);
      });
      
      setUsers(usersData);

      // Fetch all data collections
      const dataQuery = query(collection(db, 'dataCollections'));
      const dataSnapshot = await getDocs(dataQuery);
      const collectionsData: DataCollection[] = [];
      
      const districtsSet = new Set<string>();
      const blocksSet = new Set<string>();
      const gpsSet = new Set<string>();
      const yearsSet = new Set<string>();

      dataSnapshot.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() } as DataCollection;
        collectionsData.push(data);
        
        districtsSet.add(data.district);
        blocksSet.add(data.block);
        gpsSet.add(data.gpName);
        yearsSet.add(data.financialYear);
      });

      setDataCollections(collectionsData);
      setDistricts(Array.from(districtsSet).sort());
      setBlocks(Array.from(blocksSet).sort());
      setGPs(Array.from(gpsSet).sort());
      setYears(Array.from(yearsSet).sort());

      // Generate GP Reports
      generateGPReports(collectionsData);
      // Generate Overview Data
      generateOverviewData(collectionsData, usersData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Generate all financial years from 2020-2021 to current FY + 1
  const generateFinancialYears = (): string[] => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    // Determine current financial year
    const currentFYStartYear = currentMonth >= 3 ? currentYear : currentYear - 1;
    const nextFYStartYear = currentFYStartYear + 1;
    
    const years: string[] = [];
    // Start from 2020-2021 and go up to next FY
    for (let year = 2020; year <= nextFYStartYear; year++) {
      years.push(`${year}-${year + 1}`);
    }
    
    return years;
  };

  const generateOverviewData = (collections: DataCollection[], allUsers: UserData[]) => {
    const overviewMap = new Map<string, GPOverviewData>();
    const allFinancialYears = generateFinancialYears();
    
    // Group users by GP
    const usersByGP = new Map<string, UserData[]>();
    allUsers.forEach(user => {
      if (user.gpName) { // Only add users with gpName
        if (!usersByGP.has(user.gpName)) {
          usersByGP.set(user.gpName, []);
        }
        usersByGP.get(user.gpName)!.push(user);
      }
    });
    
    // Process all GPs from users (including those without data)
    usersByGP.forEach((gpUsers, gpName) => {
      const firstUser = gpUsers[0];
      const overview: GPOverviewData = {
        gpName,
        district: firstUser.district,
        block: firstUser.block,
        users: gpUsers.map(u => ({
          id: u.id,
          name: `${u.firstName} ${u.lastName}`,
          email: u.email
        })),
        dataByYear: new Map()
      };
      
      // Initialize all years with no data
      allFinancialYears.forEach(year => {
        overview.dataByYear.set(year, {
          hasData: false,
          isComplete: false,
          submittedAt: '',
          updatedAt: '',
          userId: '',
          completionPercentage: 0
        });
      });
      
      overviewMap.set(gpName, overview);
    });
    
    // Add data from collections
    collections.forEach(collection => {
      let overview = overviewMap.get(collection.gpName);
      
      // If GP not in overview yet (no registered user), create entry
      if (!overview) {
        overview = {
          gpName: collection.gpName,
          district: collection.district,
          block: collection.block,
          users: [],
          dataByYear: new Map()
        };
        
        // Initialize all years
        allFinancialYears.forEach(year => {
          overview!.dataByYear.set(year, {
            hasData: false,
            isComplete: false,
            submittedAt: '',
            updatedAt: '',
            userId: '',
            completionPercentage: 0
          });
        });
        
        overviewMap.set(collection.gpName, overview);
      }
      
      // Calculate completion percentage
      let filledCount = 0;
      let totalRequired = 8; // 8 unique form types
      
      const hasForm = (formKeys: string[]): boolean => {
        return formKeys.some(key => {
          const formData = collection.formData?.[key];
          if (!formData) return false;
          
          // Check if the form has meaningful data
          if (typeof formData === 'object') {
            // Check if object has any keys
            if (Object.keys(formData).length === 0) return false;
            
            // For simple objects like Panchayat Finances
            if (key === 'Panchayat Finances' || key === 'PanchayatFinances') {
              return Object.values(formData).some(v => v !== null && v !== undefined && v !== '' && v !== 0);
            }
            
            // For nested objects (like Demographics, Education), check if any village has data
            const hasAnyData = Object.values(formData).some(value => {
              if (value && typeof value === 'object') {
                // For arrays (like Education schools)
                if (Array.isArray(value)) {
                  return value.length > 0;
                }
                // For objects, check if has any non-empty values
                return Object.values(value as any).some(v => 
                  v !== null && v !== undefined && v !== '' && 
                  (typeof v === 'number' ? true : v !== '0')
                );
              }
              return value !== null && value !== undefined && value !== '';
            });
            return hasAnyData;
          }
          return false;
        });
      };
      
      if (hasForm(['Demographics'])) filledCount++;
      if (hasForm(['Education'])) filledCount++;
      if (hasForm(['Health and Childcare'])) filledCount++;
      if (hasForm(['Migration and Employment', 'MigrationEmployment'])) filledCount++;
      if (hasForm(['Road Infrastructure'])) filledCount++;
      if (hasForm(['Panchayat Finances', 'PanchayatFinances'])) filledCount++;
      if (hasForm(['Land Use Mapping', 'LandUseMapping'])) filledCount++;
      if (hasForm(['Water Resources', 'WaterResources'])) filledCount++;
      
      // Even if no forms are completely filled, if there's any data, show it as partial (minimum 12.5%)
      const completionPercentage = filledCount > 0 ? (filledCount / totalRequired) * 100 : 
        (collection.formData && Object.keys(collection.formData).length > 0 ? 12.5 : 0);
      
      overview.dataByYear.set(collection.financialYear, {
        hasData: true,
        isComplete: completionPercentage === 100,
        submittedAt: collection.submittedAt || '',
        updatedAt: collection.lastUpdatedAt || collection.submittedAt || '',
        userId: collection.userId || '',
        completionPercentage
      });
    });
    
    setGPOverviewData(Array.from(overviewMap.values()));
  };

  const generateGPReports = (collections: DataCollection[]) => {
    const gpMap = new Map<string, GPReportData>();

    collections.forEach(collection => {
      const key = collection.gpName;
      
      if (!gpMap.has(key)) {
        gpMap.set(key, {
          gpName: collection.gpName,
          district: collection.district,
          block: collection.block,
          totalSubmissions: 0,
          latestSubmission: '',
          years: [],
          completionStatus: 0
        });
      }

      const report = gpMap.get(key)!;
      report.totalSubmissions++;
      
      if (!report.latestSubmission || collection.submittedAt > report.latestSubmission) {
        report.latestSubmission = collection.submittedAt;
      }
      
      if (!report.years.includes(collection.financialYear)) {
        report.years.push(collection.financialYear);
      }

      // Calculate completion status (check if all required forms are filled)
      const requiredForms = [
        'Demographics',
        'Education',
        'Health and Childcare',
        'Migration and Employment',
        'Road Infrastructure',
        'Panchayat Finances',
        'Land Use Mapping',
        'Water Resources'
      ];
      
      const filledForms = requiredForms.filter(form => 
        collection.formData && collection.formData[form] && 
        Object.keys(collection.formData[form]).length > 0
      );
      
      report.completionStatus = Math.max(
        report.completionStatus,
        (filledForms.length / requiredForms.length) * 100
      );
    });

    setGPReports(Array.from(gpMap.values()));
  };

  const handleDeleteUser = async (userId: string) => {
    setDeleteLoading(userId);
    try {
      // Delete user's data collections
      const dataQuery = query(collection(db, 'dataCollections'), where('userId', '==', userId));
      const dataSnapshot = await getDocs(dataQuery);
      
      const deletePromises = dataSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      // Delete user document
      await deleteDoc(doc(db, 'users', userId));

      // Note: Cannot delete Firebase Auth user from client-side without their credentials
      // This would need to be done through Admin SDK on server-side

      // Refresh data
      await fetchAllData();
      
      alert('User data deleted successfully. Note: Firebase Auth account needs to be deleted separately through admin console.');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user data');
    } finally {
      setDeleteLoading(null);
    }
  };

  const exportToExcel = (level: 'gp' | 'block' | 'district' | 'all') => {
    let dataToExport: any[] = [];
    let fileName = '';

    const filteredCollections = dataCollections.filter(collection => {
      if (selectedYear !== 'all' && collection.financialYear !== selectedYear) return false;
      if (level === 'gp' && selectedGP !== 'all' && collection.gpName !== selectedGP) return false;
      if (level === 'block' && selectedBlock !== 'all' && collection.block !== selectedBlock) return false;
      if (level === 'district' && selectedDistrict !== 'all' && collection.district !== selectedDistrict) return false;
      return true;
    });

    // Prepare data for export
    filteredCollections.forEach(collection => {
      const baseData = {
        'GP Name': collection.gpName,
        'District': collection.district,
        'Block': collection.block,
        'Financial Year': collection.financialYear,
        'Submitted At': new Date(collection.submittedAt).toLocaleDateString(),
        'User Name': collection.userDetails?.name || '',
        'User Email': collection.userDetails?.email || ''
      };

      // Add demographic data
      if (collection.formData?.Demographics) {
        Object.entries(collection.formData.Demographics).forEach(([village, data]: [string, any]) => {
          dataToExport.push({
            ...baseData,
            'Village': village,
            'Category': 'Demographics',
            'Total Population': data.totalPopulation || 0,
            'Total Households': data.households || 0,
            'Male Population': data.malePopulation || 0,
            'Female Population': data.femalePopulation || 0
          });
        });
      }

      // Add education data
      if (collection.formData?.Education) {
        Object.entries(collection.formData.Education).forEach(([village, schools]: [string, any]) => {
          if (Array.isArray(schools)) {
            schools.forEach(school => {
              dataToExport.push({
                ...baseData,
                'Village': village,
                'Category': 'Education',
                'School Name': school.name || '',
                'Total Teachers': (parseInt(school.teachersMale || 0) + parseInt(school.teachersFemale || 0)),
                'Total Students': school.studentsTotal || 0,
                'Infrastructure Status': school.infrastructureStatus || ''
              });
            });
          }
        });
      }

      // Add migration and employment data
      const migrationData = collection.formData?.['Migration and Employment'] || collection.formData?.MigrationEmployment;
      if (migrationData) {
        Object.entries(migrationData).forEach(([village, data]: [string, any]) => {
          dataToExport.push({
            ...baseData,
            'Village': village,
            'Category': 'Migration & Employment',
            'Households Reporting Migration': data.householdsReportingMigration || 0,
            'MGNREGS Cards': data.householdsWithMGNREGSCards || 0,
            'Landless Households': data.landlessHouseholds || 0,
            'MGNREGS Workdays': data.workdaysProvidedMGNREGS || 0
          });
        });
      }

      // Add financial data
      const finances = collection.formData?.['Panchayat Finances'] || collection.formData?.PanchayatFinances;
      if (finances) {
        dataToExport.push({
          ...baseData,
          'Category': 'Panchayat Finances',
          'CFC': formatIndianCurrency(parseInt(finances.cfc || 0)),
          'SFC': formatIndianCurrency(parseInt(finances.sfc || 0)),
          'Own Sources': formatIndianCurrency(parseInt(finances.ownSources || 0)),
          'MGNREGS': formatIndianCurrency(parseInt(finances.mgnregs || 0)),
          'Total Revenue': formatIndianCurrency(parseInt(finances.cfc || 0) + parseInt(finances.sfc || 0) + 
                           parseInt(finances.ownSources || 0) + parseInt(finances.mgnregs || 0))
        });
      }
    });

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');

    // Generate filename
    const date = new Date().toISOString().split('T')[0];
    if (level === 'gp' && selectedGP !== 'all') {
      fileName = `GP_Report_${selectedGP}_${date}.xlsx`;
    } else if (level === 'block' && selectedBlock !== 'all') {
      fileName = `Block_Report_${selectedBlock}_${date}.xlsx`;
    } else if (level === 'district' && selectedDistrict !== 'all') {
      fileName = `District_Report_${selectedDistrict}_${date}.xlsx`;
    } else {
      fileName = `All_GP_Report_${date}.xlsx`;
    }

    // Save file
    XLSX.writeFile(wb, fileName);
  };

  const getFilteredData = () => {
    let filtered = [...dataCollections];

    if (selectedDistrict !== 'all') {
      filtered = filtered.filter(d => d.district === selectedDistrict);
    }
    if (selectedBlock !== 'all') {
      filtered = filtered.filter(d => d.block === selectedBlock);
    }
    if (selectedGP !== 'all') {
      filtered = filtered.filter(d => d.gpName === selectedGP);
    }
    if (selectedYear !== 'all') {
      filtered = filtered.filter(d => d.financialYear === selectedYear);
    }

    return filtered;
  };

  const getFilteredGPReports = () => {
    let filtered = [...gpReports];

    if (selectedDistrict !== 'all') {
      filtered = filtered.filter(r => r.district === selectedDistrict);
    }
    if (selectedBlock !== 'all') {
      filtered = filtered.filter(r => r.block === selectedBlock);
    }
    if (selectedGP !== 'all') {
      filtered = filtered.filter(r => r.gpName === selectedGP);
    }

    return filtered;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading GP Reports...</p>
        </div>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'Administrator') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-8">
        <div className="max-w-4xl mx-auto text-center">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              Only administrators can access GP Reports.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const filteredData = getFilteredData();
  const filteredGPReports = getFilteredGPReports();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-600 to-green-600 text-white">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <CardTitle className="text-3xl font-bold flex items-center gap-3">
                    <FileText className="h-8 w-8" />
                    GP Reports & Data Collection Status
                  </CardTitle>
                  <CardDescription className="text-blue-50 mt-2 text-lg">
                    Manage users, view collection status, and export reports
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-white text-blue-600 px-4 py-2 text-sm font-semibold">
                    {users.length} Users
                  </Badge>
                  <Badge variant="outline" className="border-white text-white px-4 py-2">
                    {dataCollections.length} Submissions
                  </Badge>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4 flex-wrap">
                <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select District" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Districts</SelectItem>
                    {districts.map(district => (
                      <SelectItem key={district} value={district}>{district}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedBlock} onValueChange={setSelectedBlock}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select Block" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Blocks</SelectItem>
                    {blocks.map(block => (
                      <SelectItem key={block} value={block}>{block}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedGP} onValueChange={setSelectedGP}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select GP" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All GPs</SelectItem>
                    {gps.map(gp => (
                      <SelectItem key={gp} value={gp}>{gp}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {years.map(year => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedDistrict('all');
                  setSelectedBlock('all');
                  setSelectedGP('all');
                  setSelectedYear('all');
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Export Buttons */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-wrap">
              <Button onClick={() => exportToExcel('all')} variant="outline">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export All Data
              </Button>
              <Button 
                onClick={() => exportToExcel('district')} 
                variant="outline"
                disabled={selectedDistrict === 'all'}
              >
                <Building className="h-4 w-4 mr-2" />
                Export District Data
              </Button>
              <Button 
                onClick={() => exportToExcel('block')} 
                variant="outline"
                disabled={selectedBlock === 'all'}
              >
                <MapPin className="h-4 w-4 mr-2" />
                Export Block Data
              </Button>
              <Button 
                onClick={() => exportToExcel('gp')} 
                variant="outline"
                disabled={selectedGP === 'all'}
              >
                <Home className="h-4 w-4 mr-2" />
                Export GP Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <Card>
            <CardContent className="p-2">
              <TabsList className="grid w-full grid-cols-4 bg-gray-100">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="status">Collection Status</TabsTrigger>
                <TabsTrigger value="submissions">Submissions</TabsTrigger>
                <TabsTrigger value="users">User Management</TabsTrigger>
              </TabsList>
            </CardContent>
          </Card>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  GP Data Collection Overview
                </CardTitle>
                <CardDescription>
                  Complete overview of data collection status across all financial years
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left p-3 font-semibold text-gray-700">GP Name</th>
                        <th className="text-left p-3 font-semibold text-gray-700">District/Block</th>
                        <th className="text-left p-3 font-semibold text-gray-700">Users</th>
                        {generateFinancialYears().map(year => (
                          <th key={year} className="text-center p-3 font-semibold text-gray-700 min-w-[100px]">
                            <div className="text-xs">{year.split('-')[0]}-</div>
                            <div className="text-xs">{year.split('-')[1].substring(2)}</div>
                          </th>
                        ))}
                        <th className="text-left p-3 font-semibold text-gray-700">Last Collection</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gpOverviewData
                        .filter(gp => {
                          if (selectedDistrict !== 'all' && gp.district !== selectedDistrict) return false;
                          if (selectedBlock !== 'all' && gp.block !== selectedBlock) return false;
                          if (selectedGP !== 'all' && gp.gpName !== selectedGP) return false;
                          return true;
                        })
                        .sort((a, b) => {
                          // Sort by district, then block, then GP name - handle undefined values
                          const aDistrict = a.district || '';
                          const bDistrict = b.district || '';
                          const aBlock = a.block || '';
                          const bBlock = b.block || '';
                          const aName = a.gpName || '';
                          const bName = b.gpName || '';
                          
                          if (aDistrict !== bDistrict) return aDistrict.localeCompare(bDistrict);
                          if (aBlock !== bBlock) return aBlock.localeCompare(bBlock);
                          return aName.localeCompare(bName);
                        })
                        .map((gp, index) => {
                          const hasMultipleUsers = gp.users.length > 1;
                          const lastCollection = Array.from(gp.dataByYear.entries())
                            .filter(([_, data]) => data.hasData)
                            .sort((a, b) => new Date(b[1].updatedAt).getTime() - new Date(a[1].updatedAt).getTime())[0];
                          
                          return (
                            <tr 
                              key={`${gp.gpName}-${index}`} 
                              className={`border-b hover:bg-gray-50 transition-colors ${
                                hasMultipleUsers ? 'bg-yellow-50' : ''
                              }`}
                            >
                              <td className="p-3 font-medium">
                                <div className="flex items-center gap-2">
                                  {hasMultipleUsers && (
                                    <div className="group relative">
                                      <UsersIcon className="h-4 w-4 text-yellow-600" />
                                      <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10">
                                        <div className="bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                                          Multiple users mapped
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  {gp.gpName}
                                </div>
                              </td>
                              <td className="p-3 text-sm text-gray-600">
                                <div>{gp.district}</div>
                                <div className="text-xs">{gp.block}</div>
                              </td>
                              <td className="p-3">
                                <div className="text-sm">
                                  {gp.users.length > 0 ? (
                                    <div>
                                      <div className="font-medium">{gp.users[0].name}</div>
                                      {gp.users.length > 1 && (
                                        <Popover>
                                          <PopoverTrigger asChild>
                                            <button className="text-xs text-yellow-600 hover:text-yellow-700 hover:underline focus:outline-none">
                                              +{gp.users.length - 1} more
                                            </button>
                                          </PopoverTrigger>
                                          <PopoverContent className="w-80">
                                            <div className="space-y-2">
                                              <h4 className="font-semibold text-sm flex items-center gap-2">
                                                <UsersIcon className="h-4 w-4" />
                                                All Users for {gp.gpName}
                                              </h4>
                                              <Separator />
                                              <div className="space-y-2 max-h-60 overflow-y-auto">
                                                {gp.users.map((user, idx) => (
                                                  <div key={user.id} className="p-2 bg-gray-50 rounded-lg border">
                                                    <div className="font-medium text-sm">{idx + 1}. {user.name}</div>
                                                    <div className="text-xs text-gray-600">{user.email}</div>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          </PopoverContent>
                                        </Popover>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-gray-400">No user</span>
                                  )}
                                </div>
                              </td>
                              {generateFinancialYears().map(year => {
                                const yearData = gp.dataByYear.get(year);
                                const hasData = yearData?.hasData || false;
                                const isComplete = yearData?.isComplete || false;
                                const completionPercentage = yearData?.completionPercentage || 0;
                                
                                return (
                                  <td key={year} className="p-3 text-center">
                                    <div className="flex justify-center">
                                      {!hasData ? (
                                        <div className="group relative">
                                          <CircleX className="h-5 w-5 text-gray-300" />
                                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                                            <div className="bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                                              No data
                                            </div>
                                          </div>
                                        </div>
                                      ) : yearData.isComplete ? (
                                        <div className="group relative">
                                          <CircleCheckBig className="h-5 w-5 text-green-600" />
                                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                                            <div className="bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                                              Complete (100%)
                                              <div className="text-xs opacity-75">
                                                {new Date(yearData.updatedAt).toLocaleDateString()}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="group relative">
                                          <CircleDashed className="h-5 w-5 text-yellow-500" />
                                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                                            <div className="bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                                              Partial ({Math.round(yearData.completionPercentage)}%)
                                              <div className="text-xs opacity-75">
                                                {new Date(yearData.updatedAt).toLocaleDateString()}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                );
                              })}
                              <td className="p-3 text-sm">
                                {lastCollection ? (
                                  <div>
                                    <div className="font-medium">
                                      {new Date(lastCollection[1].updatedAt).toLocaleDateString()}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {lastCollection[0]}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-gray-400">Never</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
                
                {/* Legend */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-sm mb-3">Legend:</h4>
                  <div className="flex flex-wrap gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <CircleCheckBig className="h-4 w-4 text-green-600" />
                      <span>Complete Data (100%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CircleDashed className="h-4 w-4 text-yellow-500" />
                      <span>Partial Data</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CircleX className="h-4 w-4 text-gray-300" />
                      <span>No Data</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-4 bg-yellow-50 border border-yellow-200 rounded"></div>
                      <span>Multiple Users Mapped</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Collection Status Tab */}
          <TabsContent value="status" className="mt-6">
            <div className="grid gap-4">
              {filteredGPReports.map((report) => (
                <Card key={report.gpName}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">{report.gpName}</h3>
                        <p className="text-sm text-gray-600">
                          {report.district} • {report.block}
                        </p>
                        <div className="flex gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <Database className="h-4 w-4" />
                            {report.totalSubmissions} submissions
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {report.years.join(', ')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Last: {new Date(report.latestSubmission).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="flex items-center gap-2">
                          <Progress value={report.completionStatus} className="w-32" />
                          <span className="text-sm font-medium">{report.completionStatus.toFixed(0)}%</span>
                        </div>
                        <Badge 
                          variant={report.completionStatus === 100 ? "default" : "secondary"}
                          className={report.completionStatus === 100 ? "bg-green-600" : ""}
                        >
                          {report.completionStatus === 100 ? "Complete" : "In Progress"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Submissions Tab */}
          <TabsContent value="submissions" className="mt-6">
            <div className="grid gap-4">
              {filteredData.map((submission) => (
                <Card key={submission.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">{submission.gpName}</h3>
                        <p className="text-sm text-gray-600">
                          {submission.district} • {submission.block} • {submission.financialYear}
                        </p>
                        <div className="flex gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {submission.userDetails?.name || 'Unknown User'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                          </span>
                          {submission.lastUpdatedAt && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              Updated: {new Date(submission.lastUpdatedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <SubmissionDetailsModal submission={submission} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* User Management Tab */}
          <TabsContent value="users" className="mt-6">
            <div className="grid gap-4">
              {users.filter(user => {
                if (selectedDistrict !== 'all' && user.district !== selectedDistrict) return false;
                if (selectedBlock !== 'all' && user.block !== selectedBlock) return false;
                if (selectedGP !== 'all' && user.gpName !== selectedGP) return false;
                return true;
              }).map((user) => (
                <Card key={user.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">
                          {user.firstName} {user.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {user.email} • {user.mobile}
                        </p>
                        <div className="flex gap-4 text-sm">
                          <Badge variant="outline">{user.role}</Badge>
                          <span className="flex items-center gap-1">
                            <Building className="h-4 w-4" />
                            {user.district}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {user.block}
                          </span>
                          <span className="flex items-center gap-1">
                            <Home className="h-4 w-4" />
                            {user.gpName}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              disabled={deleteLoading === user.id}
                            >
                              {deleteLoading === user.id ? (
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4 mr-2" />
                              )}
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the user {user.firstName} {user.lastName} 
                                and all their associated data. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteUser(user.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete User
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GPReports;