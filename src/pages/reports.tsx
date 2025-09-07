// src/pages/reports.tsx

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { app } from '../lib/firebase';
import * as XLSX from '@/lib/sheetjs/xlsx.mjs';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Shadcn UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

// Icons from lucide-react
import { 
  Home,
  Users,
  GraduationCap,
  Heart,
  Briefcase,
  Route,
  Trees,
  Droplets,
  Coins,
  FileDown,
  RefreshCw,
  Calendar,
  MapPin,
  Building,
  FileSpreadsheet,
  Eye,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

// Utility function for Indian number formatting
const formatIndianNumber = (num: number): string => {
  if (num === 0) return '0';
  
  const numStr = Math.abs(num).toString();
  const isNegative = num < 0;
  
  const parts = numStr.split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1] ? '.' + parts[1] : '';
  
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

const Reports: React.FC = () => {
  const [userData, setUserData] = useState<any>(null);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  
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
      setReportData(data);
    } else {
      setReportData(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (selectedYear && userData) {
      fetchReportData(selectedYear);
    }
  }, [selectedYear, userData]);

  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const element = document.getElementById('pdf-content');
      if (!element) {
        throw new Error('PDF content element not found');
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight,
        scrollX: 0,
        scrollY: 0
      });

      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pdfWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let yPosition = 10;
      let pageHeight = imgHeight;
      
      if (pageHeight > pdfHeight - 20) {
        while (pageHeight > 0) {
          pdf.addImage(imgData, 'PNG', 10, yPosition, imgWidth, imgHeight);
          pageHeight -= pdfHeight;
          if (pageHeight > 0) {
            pdf.addPage();
            yPosition = -pdfHeight + 10;
          }
        }
      } else {
        const yOffset = (pdfHeight - imgHeight - 20) / 2;
        pdf.addImage(imgData, 'PNG', 10, yOffset + 10, imgWidth, imgHeight);
      }
      
      const fileName = `${userData.gpName}_Report_${selectedYear}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const exportToExcel = async () => {
    setIsExportingExcel(true);
    try {
      if (!reportData || !reportData.formData) {
        alert('No data available to export');
        return;
      }

      const workbook = XLSX.utils.book_new();
      const formData = reportData.formData;

      // Demographics worksheet
      if (formData.Demographics) {
        const demographicsData = Object.entries(formData.Demographics).map(([village, data]) => ({
          Village: village,
          ...((typeof data === 'object' && data !== null) ? data : {})
        }));
        const demographicsSheet = XLSX.utils.json_to_sheet(demographicsData);
        XLSX.utils.book_append_sheet(workbook, demographicsSheet, 'Demographics');
      }

      // Education worksheet
      if (formData.Education) {
        const educationData: any[] = [];
        Object.entries(formData.Education).forEach(([village, schools]: [string, any]) => {
          if (Array.isArray(schools)) {
            schools.forEach(school => {
              educationData.push({
                Village: village,
                'School Name': school.name,
                'Teachers (Male)': school.teachersMale,
                'Teachers (Female)': school.teachersFemale,
                'Total Students': school.studentsTotal,
                'Infrastructure Status': school.infrastructureStatus
              });
            });
          }
        });
        if (educationData.length > 0) {
          const educationSheet = XLSX.utils.json_to_sheet(educationData);
          XLSX.utils.book_append_sheet(workbook, educationSheet, 'Education');
        }
      }

      // Add other sections similarly...
      const fileName = `${userData.gpName}_Data_${selectedYear}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Failed to export to Excel. Please try again.');
    } finally {
      setIsExportingExcel(false);
    }
  };

  const calculateCompletionStatus = () => {
    if (!reportData || !reportData.formData) return 0;
    
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
    
    const filledForms = requiredForms.filter(form => {
      const formData = reportData.formData[form];
      return formData && Object.keys(formData).length > 0;
    });
    
    return Math.round((filledForms.length / requiredForms.length) * 100);
  };

  const renderDataSection = (title: string, icon: React.ReactNode, data: any, color: string) => {
    if (!data || Object.keys(data).length === 0) {
      return (
        <Card className="border-2 border-gray-200 shadow-md">
          <CardHeader className={`bg-gray-50 border-b border-gray-200`}>
            <CardTitle className="text-lg flex items-center gap-2">
              {icon}
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>No data available for this section</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className={`border-2 shadow-lg`} style={{ borderColor: color }}>
        <CardHeader className={`border-b`} style={{ backgroundColor: `${color}20`, borderColor: color }}>
          <CardTitle className="text-lg flex items-center gap-2" style={{ color }}>
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {title === 'Demographics' && typeof data === 'object' && (
            Object.entries(data).map(([village, villageData]: [string, any]) => (
              <div key={village} className="mb-4 last:mb-0">
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <h5 className="font-semibold mb-3 text-blue-800 flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    {village}
                  </h5>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
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
              </div>
            ))
          )}

          {title === 'Education' && typeof data === 'object' && (
            Object.entries(data).map(([village, schools]: [string, any]) => (
              <div key={village} className="mb-4 last:mb-0">
                <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                  <h5 className="font-semibold mb-3 text-purple-800 flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    {village}
                  </h5>
                  {Array.isArray(schools) && schools.map((school: any, idx: number) => (
                    <div key={idx} className="mb-3 last:mb-0">
                      <div className="bg-white p-3 rounded border">
                        <div className="font-medium text-gray-800 mb-2">{school.name}</div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-600">Teachers:</span>
                            <span className="ml-2">{(parseInt(school.teachersMale || 0) + parseInt(school.teachersFemale || 0))}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Students:</span>
                            <span className="ml-2">{school.studentsTotal || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
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
              <div className="mt-3 p-3 bg-white rounded border">
                <span className="text-gray-600 font-medium">Total Funds:</span>
                <span className="font-bold text-green-700 ml-2 text-lg">
                  {formatIndianCurrency(
                    parseInt(data.cfc || 0) + 
                    parseInt(data.sfc || 0) + 
                    parseInt(data.ownSources || 0) + 
                    parseInt(data.mgnregs || 0)
                  )}
                </span>
              </div>
            </div>
          )}

          {/* Add similar rendering for other sections */}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading report data...</p>
        </Card>
      </div>
    );
  }

  const completionStatus = calculateCompletionStatus();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-600 to-green-600 text-white mb-8">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="text-3xl font-bold flex items-center gap-3">
                  <FileDown className="h-8 w-8" />
                  GP Data Collection Report
                </CardTitle>
                <CardDescription className="text-blue-50 mt-2 text-lg">
                  {userData?.gpName} • {userData?.district} • {userData?.block}
                </CardDescription>
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={generatePDF}
                  disabled={isGeneratingPDF || !reportData}
                  className="bg-white bg-opacity-20 hover:bg-white hover:bg-opacity-30 text-white border-white border"
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
                <Button 
                  onClick={exportToExcel}
                  disabled={isExportingExcel || !reportData}
                  className="bg-white bg-opacity-20 hover:bg-white hover:bg-opacity-30 text-white border-white border"
                >
                  {isExportingExcel ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Export Excel
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Year Selection and Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Financial Year
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Completion Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Data Filled</span>
                  <Badge variant={completionStatus === 100 ? "default" : completionStatus >= 50 ? "secondary" : "destructive"}>
                    {completionStatus}%
                  </Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      completionStatus === 100 ? 'bg-green-600' : 
                      completionStatus >= 50 ? 'bg-yellow-600' : 'bg-red-600'
                    }`}
                    style={{ width: `${completionStatus}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{userData?.gpName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{userData?.block}, {userData?.district}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Content */}
        {reportData ? (
          <ScrollArea>
            <div id="pdf-content" className="space-y-6 bg-white p-6 rounded-lg">
              {/* PDF Header */}
              <div className="text-center border-b-2 border-blue-600 pb-4 mb-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  Gram Panchayat Data Collection Report
                </h1>
                <h2 className="text-xl font-semibold text-blue-600 mb-1">
                  {userData?.gpName}
                </h2>
                <p className="text-gray-600">
                  {userData?.district} • {userData?.block} • {selectedYear}
                </p>
              </div>

              {/* Submission Info */}
              <Card className="bg-white border-2 border-gray-200 shadow-lg mb-6">
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
                      <div className="font-semibold text-gray-800 mt-1">{reportData.userDetails?.name || 'Unknown User'}</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <span className="text-green-600 font-medium">Email:</span>
                      <div className="font-semibold text-gray-800 mt-1">{reportData.userDetails?.email || 'N/A'}</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <span className="text-purple-600 font-medium">Submitted on:</span>
                      <div className="font-semibold text-gray-800 mt-1">{new Date(reportData.submittedAt).toLocaleString()}</div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <span className="text-orange-600 font-medium">Last updated:</span>
                      <div className="font-semibold text-gray-800 mt-1">
                        {reportData.lastUpdatedAt ? new Date(reportData.lastUpdatedAt).toLocaleString() : 'N/A'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Data Sections */}
              <div className="space-y-6">
                {renderDataSection(
                  'Demographics',
                  <Users className="h-5 w-5" />,
                  reportData.formData?.Demographics,
                  '#3b82f6'
                )}

                {renderDataSection(
                  'Education',
                  <GraduationCap className="h-5 w-5" />,
                  reportData.formData?.Education,
                  '#8b5cf6'
                )}

                {renderDataSection(
                  'Health and Childcare',
                  <Heart className="h-5 w-5" />,
                  reportData.formData?.['Health and Childcare'],
                  '#ef4444'
                )}

                {renderDataSection(
                  'Migration and Employment',
                  <Briefcase className="h-5 w-5" />,
                  reportData.formData?.['Migration and Employment'],
                  '#f59e0b'
                )}

                {renderDataSection(
                  'Road Infrastructure',
                  <Route className="h-5 w-5" />,
                  reportData.formData?.['Road Infrastructure'],
                  '#6b7280'
                )}

                {renderDataSection(
                  'Panchayat Finances',
                  <Coins className="h-5 w-5" />,
                  reportData.formData?.['Panchayat Finances'],
                  '#10b981'
                )}

                {renderDataSection(
                  'Land Use Mapping',
                  <Trees className="h-5 w-5" />,
                  reportData.formData?.['Land Use Mapping'],
                  '#059669'
                )}

                {renderDataSection(
                  'Water Resources',
                  <Droplets className="h-5 w-5" />,
                  reportData.formData?.['Water Resources'],
                  '#06b6d4'
                )}
              </div>

              {/* Footer */}
              <div className="mt-8 pt-4 border-t text-center text-sm text-gray-500">
                Generated on {new Date().toLocaleString()} • GP Yojana Dashboard
              </div>
            </div>
          </ScrollArea>
        ) : (
          <Card className="p-8">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No data available for the selected year. Please select a different year or submit data first.
              </AlertDescription>
            </Alert>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Reports;