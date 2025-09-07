// src/components/enhanced/EnvironmentalCharts.tsx
import React from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TreePine, Droplets } from 'lucide-react';

type LandUseVillage = {
  forestArea?: string | number;
  cultivableArea?: string | number; // new shape
  totalCultivableLand?: string | number; // legacy shape
  nonCultivableArea?: string | number;
  commonLandArea?: string | number;
};

type LandUseData = Record<string, LandUseVillage> | LandUseVillage[];

type WaterBodiesByVillage = Record<string, Array<any>> | Array<Array<any>>;

interface WaterResourcesData {
  waterBodies?: WaterBodiesByVillage;
  irrigationStructures?: WaterBodiesByVillage;
}

interface EnvironmentalChartsProps {
  landUseData: { landUseData: LandUseData; commonLandAreas?: any } | null;
  waterResourcesData: WaterResourcesData | null;
  selectedVillage: string;
  villageNames?: string[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const EnvironmentalCharts: React.FC<EnvironmentalChartsProps> = ({ 
  landUseData, 
  waterResourcesData, 
  selectedVillage,
  villageNames
}) => {
  // Land Use Analysis
  const landUseAnalysis = React.useMemo(() => {
    if (!landUseData?.landUseData) {
      console.log('No land use data available');
      return null;
    }

    console.log('Land use data:', landUseData);

    // Normalize entries to [villageName, data]
    let luEntries: Array<[string, LandUseVillage]> = [];
    if (Array.isArray(landUseData.landUseData)) {
      const names = villageNames && villageNames.length ? villageNames : landUseData.landUseData.map((_, i) => `Village ${i + 1}`);
      luEntries = (landUseData.landUseData as LandUseVillage[]).map((item, index) => [names[index] || `Village ${index + 1}`, item]);
    } else {
      luEntries = Object.entries(landUseData.landUseData as Record<string, LandUseVillage>);
    }

    const villages = luEntries
      .filter(([village]) => selectedVillage === 'all' || village === selectedVillage)
      .map(([village, data]) => ({
        village: village.length > 15 ? village.substring(0, 15) + '...' : village,
        fullName: village,
        forestArea: parseFloat((data.forestArea ?? 0).toString()),
        cultivableArea: parseFloat(((data.cultivableArea ?? data.totalCultivableLand) ?? 0).toString()),
        nonCultivableArea: parseFloat(data.nonCultivableArea?.toString() || '0'),
        commonLandArea: parseFloat(data.commonLandArea?.toString() || '0'),
      }));

    const totalForest = villages.reduce((sum, v) => sum + v.forestArea, 0);
    const totalCultivable = villages.reduce((sum, v) => sum + v.cultivableArea, 0);
    const totalNonCultivable = villages.reduce((sum, v) => sum + v.nonCultivableArea, 0);
    const totalCommonLand = villages.reduce((sum, v) => sum + v.commonLandArea, 0);

    return {
      villages,
      summary: {
        totalForest,
        totalCultivable,
        totalNonCultivable,
        totalCommonLand,
        totalArea: totalForest + totalCultivable + totalNonCultivable + totalCommonLand
      }
    };
  }, [landUseData, selectedVillage, villageNames]);

  // Water Resources Analysis
  const waterResourcesAnalysis = React.useMemo(() => {
    if (!waterResourcesData || (!waterResourcesData.waterBodies && !waterResourcesData.irrigationStructures)) {
      console.log('No water resources data available');
      return null;
    }

    console.log('Water resources data:', waterResourcesData);

    const names = villageNames && villageNames.length ? villageNames : [];
    const selectedNorm = String(selectedVillage || '').trim().toLowerCase();
    const allSelected = selectedNorm === 'all';

    // If arrays of objects are provided (flat lists)
    const wbRaw = waterResourcesData.waterBodies as any;
    const isrRaw = waterResourcesData.irrigationStructures as any;
    const isFlatWB = Array.isArray(wbRaw) && (wbRaw.length === 0 || !Array.isArray(wbRaw[0]));
    const isFlatISR = Array.isArray(isrRaw) && (isrRaw.length === 0 || !Array.isArray(isrRaw[0]));

    if (isFlatWB || isFlatISR) {
      // Prepare summary totals using the same filter logic as the top cards
      const filteredWB = Array.isArray(wbRaw)
        ? (allSelected ? wbRaw : wbRaw.filter((wb: any) => Array.isArray(wb?.locations) && wb.locations.some((loc: string) => String(loc).trim().toLowerCase() === selectedNorm)))
        : [];
      const filteredISR = Array.isArray(isrRaw)
        ? (allSelected ? isrRaw : isrRaw.filter((isr: any) => String(isr?.location || '').trim().toLowerCase() === selectedNorm))
        : [];

      const summaryTotalWB = filteredWB.length;
      const summaryTotalISR = filteredISR.length;
      const summaryTotalPotential = filteredWB.reduce((sum: number, wb: any) => sum + parseFloat((wb?.irrigationPotential ?? 0).toString()), 0)
        + filteredISR.reduce((sum: number, isr: any) => sum + parseFloat((isr?.irrigationPotential ?? 0).toString()), 0);

      // Build per-village series for charts (avoid double-counting in summary)
      const makeVillageLabel = (name: string) => name.length > 15 ? name.substring(0, 15) + '...' : name;
      const computeVillageStats = (name: string) => {
        const nameNorm = String(name).trim().toLowerCase();
        const wbFiltered = Array.isArray(wbRaw)
          ? wbRaw.filter((wb: any) => Array.isArray(wb?.locations) && wb.locations.some((loc: string) => String(loc).trim().toLowerCase() === nameNorm))
          : [];
        const isrFiltered = Array.isArray(isrRaw)
          ? isrRaw.filter((isr: any) => String(isr?.location || '').trim().toLowerCase() === nameNorm)
          : [];
        return {
          village: makeVillageLabel(name),
          fullName: name,
          waterBodiesCount: wbFiltered.length,
          irrigationCount: isrFiltered.length,
          irrigationPotential: wbFiltered.reduce((s: number, wb: any) => s + parseFloat((wb?.irrigationPotential ?? 0).toString()), 0)
            + isrFiltered.reduce((s: number, isr: any) => s + parseFloat((isr?.irrigationPotential ?? 0).toString()), 0)
        };
      };

      const villages = allSelected
        ? (names.length ? names.map(computeVillageStats) : [{
            village: 'All Villages',
            fullName: 'All Villages',
            waterBodiesCount: summaryTotalWB,
            irrigationCount: summaryTotalISR,
            irrigationPotential: summaryTotalPotential
          }])
        : [computeVillageStats(selectedVillage)];

      return {
        villages,
        summary: {
          totalWaterBodies: summaryTotalWB,
          totalIrrigationStructures: summaryTotalISR,
          totalIrrigationPotential: summaryTotalPotential
        }
      };
    }

    // Otherwise, handle keyed objects or arrays-of-arrays aligned with village order
    const wbEntries: Array<[string, Array<any>]> = Array.isArray(waterResourcesData.waterBodies)
      ? (waterResourcesData.waterBodies as Array<Array<any>>).map((arr, i) => [
          (names[i]) ? names[i] : `Village ${i + 1}`,
          Array.isArray(arr) ? arr : []
        ])
      : Object.entries((waterResourcesData.waterBodies || {}) as Record<string, Array<any>>).map(([name, arr]) => [name, Array.isArray(arr) ? arr : []]);

    const isrEntries: Array<[string, Array<any>]> = Array.isArray(waterResourcesData.irrigationStructures)
      ? (waterResourcesData.irrigationStructures as Array<Array<any>>).map((arr, i) => [
          (names[i]) ? names[i] : `Village ${i + 1}`,
          Array.isArray(arr) ? arr : []
        ])
      : Object.entries((waterResourcesData.irrigationStructures || {}) as Record<string, Array<any>>).map(([name, arr]) => [name, Array.isArray(arr) ? arr : []]);

    const isrMap = new Map<string, Array<any>>(isrEntries);

    const villages = wbEntries
      .filter(([village]) => allSelected || String(village).trim().toLowerCase() === selectedNorm)
      .map(([village, waterBodies]) => {
        const irrigationStructures = isrMap.get(village) || [];
        const irrigationPotentialFromWB = (Array.isArray(waterBodies) ? waterBodies : []).reduce((sum, body: any) => sum + parseFloat((body?.irrigationPotential ?? 0).toString()), 0);
        const irrigationPotentialFromISR = (Array.isArray(irrigationStructures) ? irrigationStructures : []).reduce((sum, isr: any) => sum + parseFloat((isr?.irrigationPotential ?? 0).toString()), 0);
        return {
          village: village.length > 15 ? village.substring(0, 15) + '...' : village,
          fullName: village,
          waterBodiesCount: Array.isArray(waterBodies) ? waterBodies.length : 0,
          irrigationCount: Array.isArray(irrigationStructures) ? irrigationStructures.length : 0,
          irrigationPotential: irrigationPotentialFromWB + irrigationPotentialFromISR
        };
      });

    const totalWaterBodies = villages.reduce((sum, v) => sum + v.waterBodiesCount, 0);
    const totalIrrigationStructures = villages.reduce((sum, v) => sum + v.irrigationCount, 0);
    const totalIrrigationPotential = villages.reduce((sum, v) => sum + v.irrigationPotential, 0);

    return {
      villages,
      summary: {
        totalWaterBodies,
        totalIrrigationStructures,
        totalIrrigationPotential
      }
    };
  }, [waterResourcesData, selectedVillage, villageNames]);

  // Land Use Distribution for Pie Chart
  const landUseDistribution = React.useMemo(() => {
    if (!landUseAnalysis) return null;

    const { summary } = landUseAnalysis;
    return [
      { name: 'Forest Area', value: summary.totalForest, color: '#00C49F' },
      { name: 'Cultivable Area', value: summary.totalCultivable, color: '#0088FE' },
      { name: 'Non-Cultivable Area', value: summary.totalNonCultivable, color: '#FFBB28' },
      { name: 'Common Land', value: summary.totalCommonLand, color: '#FF8042' }
    ].filter(item => item.value > 0);
  }, [landUseAnalysis]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{payload[0]?.payload?.fullName || label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value?.toLocaleString()} {entry.name.includes('Area') ? 'acres' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!landUseAnalysis && !waterResourcesAnalysis) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 mb-4">
          <TreePine className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-semibold">No Environmental Data Available</p>
          <p className="text-sm">Please collect environmental data first to view land use and water resource analysis</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Land Use Analysis */}
      {landUseAnalysis && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Land Use by Village</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={landUseAnalysis.villages}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="village" 
                  stroke="#666"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={70}
                />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="forestArea" fill="#00C49F" name="Forest Area (acres)" />
                <Bar dataKey="cultivableArea" fill="#0088FE" name="Cultivable Area (acres)" />
                <Bar dataKey="nonCultivableArea" fill="#FFBB28" name="Non-Cultivable (acres)" />
                <Bar dataKey="commonLandArea" fill="#FF8042" name="Common Land (acres)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {landUseDistribution && (
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Land Use Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={landUseDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {landUseDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [`${value} acres`, 'Area']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Water Resources Analysis */}
      {waterResourcesAnalysis && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Water Bodies by Village</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={waterResourcesAnalysis.villages}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="village" 
                  stroke="#666"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={70}
                />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="waterBodiesCount" fill="#0088FE" name="Water Bodies" />
                <Bar dataKey="irrigationCount" fill="#00C49F" name="Irrigation Structures" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Environmental Summary */}
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Environmental Summary</h3>
            <div className="space-y-3">
              {landUseAnalysis && (
                <>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                    <span className="font-medium text-green-800">Total Forest Area</span>
                    <span className="text-xl font-bold text-green-600">
                      {landUseAnalysis.summary.totalForest.toFixed(1)} acres
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                    <span className="font-medium text-blue-800">Cultivable Area</span>
                    <span className="text-xl font-bold text-blue-600">
                      {landUseAnalysis.summary.totalCultivable.toFixed(1)} acres
                    </span>
                  </div>
                </>
              )}
              {waterResourcesAnalysis && (
                <>
                  <div className="flex justify-between items-center p-3 bg-cyan-50 rounded">
                    <span className="font-medium text-cyan-800">Water Bodies</span>
                    <span className="text-xl font-bold text-cyan-600">
                      {waterResourcesAnalysis.summary.totalWaterBodies}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-teal-50 rounded">
                    <span className="font-medium text-teal-800">Irrigation Structures</span>
                    <span className="text-xl font-bold text-teal-600">
                      {waterResourcesAnalysis.summary.totalIrrigationStructures}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-indigo-50 rounded">
                    <span className="font-medium text-indigo-800">Irrigation Potential</span>
                    <span className="text-xl font-bold text-indigo-600">
                      {waterResourcesAnalysis.summary.totalIrrigationPotential.toFixed(1)} ha
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnvironmentalCharts;