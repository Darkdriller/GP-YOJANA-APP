// src/components/GPSnapshot/Environmental/EnvironmentalStatistics.tsx

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

interface LandUseDataEntry {
  totalCultivableLand: number;
  irrigatedLand: number;
  forestArea: number;
}

interface WaterBody {
  type: string;
  irrigationPotential: number;
  condition: string;
  locations: string[];
}

interface IrrigationStructure {
  type: string;
  status: string;
  irrigationPotential: number;
  location: string;
}

interface WaterResourcesData {
  waterBodies: WaterBody[];
  irrigationStructures: IrrigationStructure[];
}

interface EnvironmentalStatisticsProps {
  landUseData: {
    [key: string]: LandUseDataEntry;
  } | null;
  waterResourcesData: WaterResourcesData | null;
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
    const calculateLandUseStats = (): {
      totalCultivable: number;
      irrigated: number;
      forest: number;
    } => {
      if (selectedVillage === 'All') {
        return Object.values(landUseData).reduce((acc, village) => ({
          totalCultivable: acc.totalCultivable + (village.totalCultivableLand || 0),
          irrigated: acc.irrigated + (village.irrigatedLand || 0),
          forest: acc.forest + (village.forestArea || 0)
        }), { totalCultivable: 0, irrigated: 0, forest: 0 });
      } else {
        const villageData: LandUseDataEntry = landUseData[selectedVillage] || {
          totalCultivableLand: 0,
          irrigatedLand: 0,
          forestArea: 0
        };
        return {
          totalCultivable: villageData.totalCultivableLand || 0,
          irrigated: villageData.irrigatedLand || 0,
          forest: villageData.forestArea || 0
        };
      }
    };

    // Calculate water resources statistics
    const calculateWaterStats = () => {
      // Normalize selectedVillage to lowercase for case-insensitive comparison
      const normalizedVillage = selectedVillage.toLowerCase();

      // Filter water bodies based on selected village
      const filteredWaterBodies = selectedVillage === 'All' 
        ? waterResourcesData.waterBodies
        : waterResourcesData.waterBodies.filter(wb => 
            wb.locations.some(loc => loc.toLowerCase() === normalizedVillage)
          );

      // Filter irrigation structures based on selected village
      const filteredIrrigationStructures = selectedVillage === 'All'
        ? waterResourcesData.irrigationStructures
        : waterResourcesData.irrigationStructures.filter(structure =>
            structure.location.toLowerCase() === normalizedVillage
          );

      console.log('Filtered Water Bodies:', filteredWaterBodies);
      console.log('Filtered Irrigation Structures:', filteredIrrigationStructures);

      const totalWaterBodies = filteredWaterBodies.length;
      const totalIrrigationStructures = filteredIrrigationStructures.length;
      const totalIrrigationPotential = filteredWaterBodies.reduce((sum, wb) => sum + (wb.irrigationPotential || 0), 0) +
                                         filteredIrrigationStructures.reduce((sum, is) => sum + (is.irrigationPotential || 0), 0);
      const structuresNeedingRepair = filteredIrrigationStructures.filter(
        structure => structure.status === 'Needs Repairs' || structure.status === 'Critical Condition'
      ).length;

      return {
        totalWaterBodies,
        totalIrrigationStructures,
        totalIrrigationPotential,
        structuresNeedingRepair
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
