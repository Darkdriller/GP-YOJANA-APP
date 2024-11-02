import React, { useMemo } from 'react';
import {
  Users,
  Home,
  Building,
  Wallet,
  Road,
  Banknote,
  Construction
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  subtitle?: string;
}

interface EconomicStatisticsProps {
  migrationData: {
    [village: string]: {
      householdsReportingMigration: number;
      seasonalMigrantsMale: number;
      seasonalMigrantsFemale: number;
      permanentMigrantsMale: number;
      permanentMigrantsFemale: number;
      landlessHouseholds: number;
      householdsWithMGNREGSCards: number;
    };
  } | null;
  roadInfraData: {
    [index: number]: {
      repairRequired: number;
    };
  } | null;
  panchayatFinances: {
    cfc: number;
    sfc: number;
    ownSources: number;
    mgnregs: number;
  } | null;
  selectedVillage: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, subtitle = '' }) => {
  return (
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
          {Icon && <Icon className="w-6 h-6 text-blue-600" />}
        </div>
      </div>
    </div>
  );
};

const EconomicStatistics: React.FC<EconomicStatisticsProps> = ({
  migrationData,
  roadInfraData,
  panchayatFinances,
  selectedVillage
}) => {
  const stats = useMemo(() => {
    if (!migrationData || !roadInfraData) return null;

    const calculateTotals = (data: any) => {
      if (selectedVillage === 'All') {
        return Object.values(data).reduce((acc: any, village: any) => ({
          migrants: acc.migrants + (
            (village.seasonalMigrantsMale || 0) + 
            (village.seasonalMigrantsFemale || 0) + 
            (village.permanentMigrantsMale || 0) + 
            (village.permanentMigrantsFemale || 0)
          ),
          migratingHouseholds: acc.migratingHouseholds + (village.householdsReportingMigration || 0),
          landlessHouseholds: acc.landlessHouseholds + (village.landlessHouseholds || 0),
          mgnregsCards: acc.mgnregsCards + (village.householdsWithMGNREGSCards || 0)
        }), { migrants: 0, migratingHouseholds: 0, landlessHouseholds: 0, mgnregsCards: 0 });
      } else {
        const village = data[selectedVillage];
        return {
          migrants: (
            (village.seasonalMigrantsMale || 0) + 
            (village.seasonalMigrantsFemale || 0) + 
            (village.permanentMigrantsMale || 0) + 
            (village.permanentMigrantsFemale || 0)
          ),
          migratingHouseholds: village.householdsReportingMigration || 0,
          landlessHouseholds: village.landlessHouseholds || 0,
          mgnregsCards: village.householdsWithMGNREGSCards || 0
        };
      }
    };

    const migrationStats = calculateTotals(migrationData);

    // Calculate total repairs required
    let totalRepairs = 0;
    if (selectedVillage === 'All') {
      // For all villages, sum up the repairs from the array
      totalRepairs = Object.values(roadInfraData).reduce((sum, village) => 
        sum + (village.repairRequired || 0), 0);
    } else {
      // For individual village, get the corresponding index from the array
      const villageIndex = Object.keys(migrationData).indexOf(selectedVillage);
      if (villageIndex !== -1 && roadInfraData[villageIndex]) {
        totalRepairs = roadInfraData[villageIndex].repairRequired || 0;
      }
    }

    // Calculate total panchayat finances (not affected by village selection)
    const totalFinances = panchayatFinances ? 
      Object.values(panchayatFinances).reduce((sum, value) => sum + (value || 0), 0) : 0;

    return {
      ...migrationStats,
      roadRepairs: totalRepairs,
      totalFinances
    };
  }, [migrationData, roadInfraData, panchayatFinances, selectedVillage]);

  if (!stats) return null;

  const cards = [
    {
      title: "Total Migrants",
      value: stats.migrants.toLocaleString(),
      icon: Users,
      subtitle: "Seasonal and Permanent"
    },
    {
      title: "Total Migrating Households",
      value: stats.migratingHouseholds.toLocaleString(),
      icon: Home
    },
    {
      title: "Total Landless Households",
      value: stats.landlessHouseholds.toLocaleString(),
      icon: Building
    },
    {
      title: "Households with MGNREGS Card",
      value: stats.mgnregsCards.toLocaleString(),
      icon: Wallet
    },
    {
      title: "Cement Concrete Road Repairs Required",
      value: `${stats.roadRepairs.toLocaleString()} km`,
      icon: Construction
    },
    {
      title: "Total Panchayat Finance",
      value: `₹${stats.totalFinances.toLocaleString()}`,
      icon: Banknote
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {cards.map((card, index) => (
        <StatCard
          key={index}
          title={card.title}
          value={card.value}
          icon={card.icon}
          subtitle={card.subtitle}
        />
      ))}
    </div>
  );
};

export default EconomicStatistics;