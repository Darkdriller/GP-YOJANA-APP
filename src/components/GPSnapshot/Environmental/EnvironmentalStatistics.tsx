import React, { useMemo } from 'react';
import { 
  Trees, 
  Droplets, 
  Warehouse,
  Sprout,
  PanelTop,
  GaugeCircle
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  subtitle?: string;
}

interface EnvironmentalStatisticsProps {
  landUseData: {
    [key: string]: {
      totalCultivableLand: number;
      irrigatedLand: number;
      forestArea: number;
    };
  } | null;
  waterResourcesData: {
    waterBodies: Array<{
      type: string;
      irrigationPotential: number;
      condition: string;
      locations: string[];  // Updated to match the data structure
    }>;
    irrigationStructures: Array<{
      type: string;
      status: string;
      irrigationPotential: number;
      location: string;    // Single location string
    }>;
  } | null;
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
      <div className="bg-green-100 p-3 rounded-full">
        <Icon className="w-6 h-6 text-green-600" />
      </div>
    </div>
  </div>
);

const EnvironmentalStatistics: React.FC<EnvironmentalStatisticsProps> = ({
  landUseData,
  waterResourcesData,
  selectedVillage
}) => {
  const stats = useMemo(() => {
    if (!landUseData || !waterResourcesData) return null;

    // Calculate land use statistics
    const calculateLandUseStats = () => {
      if (selectedVillage === 'All') {
        return Object.values(landUseData).reduce((acc, village) => ({
          totalCultivable: acc.totalCultivable + (Number((village as any)?.totalCultivableLand) || 0),
          irrigated: acc.irrigated + (Number((village as any)?.irrigatedLand) || 0),
          forest: acc.forest + (Number((village as any)?.forestArea) || 0)
        }), { totalCultivable: 0, irrigated: 0, forest: 0 });
      } else {
        const villageData = landUseData[selectedVillage] || {};
        return {
          totalCultivable: Number((villageData as any)?.totalCultivableLand) || 0,
          irrigated: Number((villageData as any)?.irrigatedLand) || 0,
          forest: Number((villageData as any)?.forestArea) || 0
        };
      }
    };

    // Calculate water resources statistics
    const calculateWaterStats = () => {
      // Filter water bodies based on selected village
      const filteredWaterBodies = selectedVillage === 'All' 
        ? waterResourcesData.waterBodies
        : waterResourcesData.waterBodies.filter(wb => 
            Array.isArray(wb.locations) && 
            wb.locations.some(loc => loc.toLowerCase() === selectedVillage.toLowerCase())
          );

      // Filter irrigation structures based on selected village
      const filteredIrrigationStructures = selectedVillage === 'All'
        ? waterResourcesData.irrigationStructures
        : waterResourcesData.irrigationStructures.filter(structure =>
            structure.location.toLowerCase() === selectedVillage.toLowerCase()
          );

      console.log('Filtered Water Bodies:', filteredWaterBodies);
      console.log('Filtered Irrigation Structures:', filteredIrrigationStructures);

      return {
        totalWaterBodies: filteredWaterBodies.length,
        totalIrrigationStructures: filteredIrrigationStructures.length,
        totalIrrigationPotential: (
          filteredWaterBodies.reduce((sum, wb) => sum + (Number(wb.irrigationPotential) || 0), 0) +
          filteredIrrigationStructures.reduce((sum, is) => sum + (Number(is.irrigationPotential) || 0), 0)
        ),
        structuresNeedingRepair: filteredIrrigationStructures.filter(
          structure => structure.status === 'Needs Repairs' || structure.status === 'Critical Condition'
        ).length
      };
    };

    const landStats = calculateLandUseStats();
    const waterStats = calculateWaterStats();

    return {
      ...landStats,
      ...waterStats
    };
  }, [landUseData, waterResourcesData, selectedVillage]);

  if (!stats) return null;

  const formatHectares = (value: number) => `${value.toFixed(2)} ha`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <StatCard
        title="Total Cultivable Land"
        value={formatHectares(stats.totalCultivable)}
        icon={Warehouse}
        subtitle="Total available agricultural land"
      />
      <StatCard
        title="Irrigated Land"
        value={formatHectares(stats.irrigated)}
        icon={Sprout}
        subtitle="Land under irrigation"
      />
      <StatCard
        title="Forest Area"
        value={formatHectares(stats.forest)}
        icon={Trees}
        subtitle="Total forest coverage"
      />
      <StatCard
        title="Water Bodies"
        value={stats.totalWaterBodies}
        icon={Droplets}
        subtitle="Total number of water sources"
      />
      <StatCard
        title="Total Irrigation Potential"
        value={formatHectares(stats.totalIrrigationPotential)}
        icon={PanelTop}
        subtitle="Combined irrigation capacity"
      />
      <StatCard
        title="Structures Needing Repair"
        value={stats.structuresNeedingRepair}
        icon={GaugeCircle}
        subtitle="Critical and repair needed"
      />
    </div>
  );
};

export default EnvironmentalStatistics;