import { useState, useEffect } from 'react';
import { Calculator, Users, School, GraduationCap, UserPlus, Building2 } from 'lucide-react';

interface DemographicsData {
  [village: string]: {
    households: string;
    totalPopulation: string;
    malePopulation: string;
    femalePopulation: string;
    age0to14Male: string;
    age0to14Female: string;
    age15to60Male: string;
    age15to60Female: string;
    ageAbove60Male: string;
    ageAbove60Female: string;
  };
}

interface School {
  id: string;
  name: string;
  teachersMale: number;
  teachersFemale: number;
  studentsTotal: number;
  studentsMale: number;
  studentsFemale: number;
  classEnrollment: { [key: string]: number };
  newClassroomsRequired: number;
  infrastructureStatus: string;
}

interface EducationData {
  [village: string]: School[];
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  subtitle?: string;
}

interface StatisticsOverviewProps {
  demographicsData: DemographicsData | null;
  educationData: EducationData | null;
  selectedVillage: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, subtitle = '' }) => (
  <div className="bg-white rounded-lg shadow-md p-6 flex flex-col">
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {subtitle && (
          <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
        )}
      </div>
      <div className="bg-blue-100 p-3 rounded-full">
        <Icon className="w-6 h-6 text-blue-600" />
      </div>
    </div>
  </div>
);

const StatisticsOverview: React.FC<StatisticsOverviewProps> = ({ 
  demographicsData, 
  educationData, 
  selectedVillage 
}) => {
  const [stats, setStats] = useState({
    totalHouseholds: 0,
    totalPopulation: 0,
    totalSchools: 0,
    teacherSchoolRatio: 0,
    totalStudents: 0,
    newClassrooms: 0
  });

  useEffect(() => {
    if (demographicsData && educationData) {
      let relevantDemographicsData: DemographicsData = {};
      let relevantEducationData: EducationData = {};

      // Filter data based on selected village
      if (selectedVillage === 'All') {
        relevantDemographicsData = demographicsData;
        relevantEducationData = educationData;
      } else {
        relevantDemographicsData = { [selectedVillage]: demographicsData[selectedVillage] };
        relevantEducationData = { [selectedVillage]: educationData[selectedVillage] || [] };
      }

      // Calculate demographics statistics
      const households = Object.values(relevantDemographicsData).reduce((sum, village) => 
        sum + parseInt(village.households || '0', 10), 0);
      
      const population = Object.values(relevantDemographicsData).reduce((sum, village) => 
        sum + parseInt(village.totalPopulation || '0', 10), 0);

      // Calculate education statistics
      let totalSchools = 0;
      let totalTeachers = 0;
      let totalStudents = 0;
      let requiredClassrooms = 0;

      Object.values(relevantEducationData).forEach(villageSchools => {
        if (Array.isArray(villageSchools)) {
          totalSchools += villageSchools.length;
          
          villageSchools.forEach(school => {
            totalTeachers += (school.teachersMale + school.teachersFemale);
            totalStudents += school.studentsTotal;
            requiredClassrooms += school.newClassroomsRequired;
          });
        }
      });

      setStats({
        totalHouseholds: households,
        totalPopulation: population,
        totalSchools,
        teacherSchoolRatio: totalSchools ? +(totalTeachers / totalSchools).toFixed(1) : 0,
        totalStudents,
        newClassrooms: requiredClassrooms
      });
    }
  }, [demographicsData, educationData, selectedVillage]); // Added selectedVillage as dependency

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <StatCard
        title="Total Households"
        value={stats.totalHouseholds.toLocaleString()}
        icon={Calculator}
      />
      <StatCard
        title="Total Population"
        value={stats.totalPopulation.toLocaleString()}
        icon={Users}
      />
      <StatCard
        title="Total Schools"
        value={stats.totalSchools.toLocaleString()}
        icon={School}
      />
      <StatCard
        title="Teachers per School"
        value={stats.teacherSchoolRatio}
        subtitle="Average ratio"
        icon={GraduationCap}
      />
      <StatCard
        title="School Students"
        value={stats.totalStudents.toLocaleString()}
        icon={UserPlus}
      />
      <StatCard
        title="New Classrooms Required"
        value={stats.newClassrooms}
        subtitle="Based on infrastructure assessment"
        icon={Building2}
      />
    </div>
  );
};

export default StatisticsOverview;