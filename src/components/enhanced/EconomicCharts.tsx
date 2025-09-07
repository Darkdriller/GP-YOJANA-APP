// src/components/enhanced/EconomicCharts.tsx
import React from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { DollarSign } from 'lucide-react';

type MigrationVillageRecord = {
  householdsReportingMigration: number;
  seasonalMigrantsMale: number;
  seasonalMigrantsFemale: number;
  permanentMigrantsMale: number;
  permanentMigrantsFemale: number;
  landlessHouseholds: number;
  householdsWithMGNREGSCards: number;
  workdaysProvidedMGNREGS?: number;
};

type MigrationData = Record<string, MigrationVillageRecord> | MigrationVillageRecord[];

interface RoadInfraData {
  [index: number]: {
    repairRequired: number;
  };
}

interface PanchayatFinances {
  cfc: number;
  sfc: number;
  ownSources: number;
  mgnregs: number;
}

interface EconomicChartsProps {
  migrationData: MigrationData | null;
  roadInfraData: RoadInfraData | null;
  panchayatFinances: PanchayatFinances | null;
  selectedVillage: string;
  villageNames?: string[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const EconomicCharts: React.FC<EconomicChartsProps> = ({ 
  migrationData, 
  roadInfraData, 
  panchayatFinances, 
  selectedVillage,
  villageNames
}) => {
  // Migration Analysis
  const migrationAnalysis = React.useMemo(() => {
    if (!migrationData) {
      console.log('No migration data available');
      return null;
    }

    console.log('Migration data:', migrationData);

    // Normalize migration entries to [villageName, data]
    let entries: Array<[string, MigrationVillageRecord]> = [];
    if (Array.isArray(migrationData)) {
      const names = villageNames && villageNames.length ? villageNames : migrationData.map((_, i) => `Village ${i + 1}`);
      entries = (migrationData as MigrationVillageRecord[]).map((item, index) => [names[index] || `Village ${index + 1}`, item]);
    } else {
      entries = Object.entries(migrationData as Record<string, MigrationVillageRecord>);
    }

    const villages = entries
      .filter(([village]) => selectedVillage === 'all' || village === selectedVillage)
      .map(([village, data]) => {
        const seasonalMale = parseInt(String(data.seasonalMigrantsMale || 0));
        const seasonalFemale = parseInt(String(data.seasonalMigrantsFemale || 0));
        const permanentMale = parseInt(String(data.permanentMigrantsMale || 0));
        const permanentFemale = parseInt(String(data.permanentMigrantsFemale || 0));
        const workdays = parseInt(String((data as any).workdaysProvidedMGNREGS || 0));
        
        return {
          village: village.length > 15 ? village.substring(0, 15) + '...' : village,
          fullName: village,
          totalMigrants: seasonalMale + seasonalFemale + permanentMale + permanentFemale,
          seasonalMale,
          seasonalFemale,
          permanentMale,
          permanentFemale,
          migrationHouseholds: parseInt(String(data.householdsReportingMigration || 0)),
          landlessHouseholds: parseInt(String(data.landlessHouseholds || 0)),
          mgnregsCards: parseInt(String(data.householdsWithMGNREGSCards || 0)),
          workdays
        };
      });

    console.log('Processed villages:', villages);

    const totalMigrants = villages.reduce((sum, v) => sum + v.totalMigrants, 0);
    const totalSeasonal = villages.reduce((sum, v) => sum + v.seasonalMale + v.seasonalFemale, 0);
    const totalPermanent = villages.reduce((sum, v) => sum + v.permanentMale + v.permanentFemale, 0);
    const totalWorkdays = villages.reduce((sum, v) => sum + v.workdays, 0);
    const totalLandless = villages.reduce((sum, v) => sum + v.landlessHouseholds, 0);
    const totalMGNREGSCards = villages.reduce((sum, v) => sum + v.mgnregsCards, 0);

    return {
      villages,
      summary: {
        totalMigrants,
        totalSeasonal,
        totalPermanent,
        totalWorkdays,
        totalLandless,
        totalMGNREGSCards,
        migrationRate: villages.length > 0 ? (totalMigrants / villages.length).toFixed(1) : '0'
      }
    };
  }, [migrationData, selectedVillage, villageNames]);

  // Panchayat Revenue Breakdown
  const revenueData = React.useMemo(() => {
    if (!panchayatFinances) return null;

    const cfc = parseInt(String(panchayatFinances.cfc || 0));
    const sfc = parseInt(String(panchayatFinances.sfc || 0));
    const ownSources = parseInt(String(panchayatFinances.ownSources || 0));
    const mgnregs = parseInt(String(panchayatFinances.mgnregs || 0));

    // Only return data if there's at least some revenue
    const totalRevenue = cfc + sfc + ownSources + mgnregs;
    if (totalRevenue === 0) return null;

    return [
      { name: 'CFC', value: cfc, color: '#0088FE' },
      { name: 'SFC', value: sfc, color: '#00C49F' },
      { name: 'Own Sources', value: ownSources, color: '#FFBB28' },
      { name: 'MGNREGS', value: mgnregs, color: '#FF8042' }
    ];
  }, [panchayatFinances]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{payload[0]?.payload?.fullName || label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value?.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!migrationAnalysis && !revenueData) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 mb-4">
          <DollarSign className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-semibold">No Economic Data Available</p>
          <p className="text-sm">Please collect economic data first to view charts and analysis</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Migration Overview */}
      {migrationAnalysis && migrationAnalysis.villages.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Migration by Village</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={migrationAnalysis.villages}>
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
                <Bar dataKey="seasonalMale" stackId="a" fill="#0088FE" name="Seasonal Male" />
                <Bar dataKey="seasonalFemale" stackId="a" fill="#00C49F" name="Seasonal Female" />
                <Bar dataKey="permanentMale" stackId="b" fill="#FFBB28" name="Permanent Male" />
                <Bar dataKey="permanentFemale" stackId="b" fill="#FF8042" name="Permanent Female" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">MGNREGS Coverage</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={migrationAnalysis.villages}>
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
                <Area 
                  type="monotone" 
                  dataKey="mgnregsCards" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.6}
                  name="MGNREGS Cards"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Revenue Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {revenueData && (
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Panchayat Revenue Sources</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={revenueData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {revenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Economic Summary */}
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Economic Summary</h3>
          <div className="space-y-3">
            {migrationAnalysis && (
              <>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                  <span className="font-medium text-blue-800">Total Migrants</span>
                  <span className="text-xl font-bold text-blue-600">
                    {migrationAnalysis.summary.totalMigrants.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                  <span className="font-medium text-green-800">Seasonal Migration</span>
                  <span className="text-xl font-bold text-green-600">
                    {migrationAnalysis.summary.totalSeasonal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded">
                  <span className="font-medium text-orange-800">Permanent Migration</span>
                  <span className="text-xl font-bold text-orange-600">
                    {migrationAnalysis.summary.totalPermanent.toLocaleString()}
                  </span>
                </div>
              </>
            )}
            {revenueData && (
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                <span className="font-medium text-purple-800">Total Revenue</span>
                <span className="text-xl font-bold text-purple-600">
                  ₹{revenueData.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EconomicCharts;