// src/components/enhanced/DemographicsCharts.tsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface VillageData {
  households: string;
  totalPopulation: string;
  malePopulation: string;
  femalePopulation: string;
  [key: string]: any;
}

interface DemographicsChartsProps {
  data: { [village: string]: VillageData } | null;
  selectedVillage: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const DemographicsCharts: React.FC<DemographicsChartsProps> = ({ data, selectedVillage }) => {
  if (!data) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 mb-4">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-lg font-semibold">No Demographics Data Available</p>
          <p className="text-sm">Please collect demographics data first to view population analysis</p>
        </div>
      </div>
    );
  }

  // Population by Village Chart Data
  const villagePopulationData = Object.entries(data)
    .filter(([village]) => selectedVillage === 'all' || village === selectedVillage)
    .map(([village, villageData]) => ({
      village: village.length > 15 ? village.substring(0, 15) + '...' : village,
      fullName: village,
      population: parseInt(villageData.totalPopulation || '0'),
      households: parseInt(villageData.households || '0'),
      male: parseInt(villageData.malePopulation || '0'),
      female: parseInt(villageData.femalePopulation || '0'),
    }))
    .sort((a, b) => b.population - a.population);

  // Gender Distribution Pie Chart Data
  const totalMale = villagePopulationData.reduce((sum, item) => sum + item.male, 0);
  const totalFemale = villagePopulationData.reduce((sum, item) => sum + item.female, 0);
  
  const genderData = [
    { name: 'Male', value: totalMale, color: '#0088FE' },
    { name: 'Female', value: totalFemale, color: '#00C49F' }
  ];

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

  return (
    <div className="space-y-6">
      {/* Population by Village Bar Chart */}
      <div className="bg-white p-4 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Population by Village {selectedVillage !== 'all' && `(${selectedVillage})`}
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={villagePopulationData}>
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
            <Bar dataKey="male" fill="#0088FE" name="Male" />
            <Bar dataKey="female" fill="#00C49F" name="Female" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gender Distribution Pie Chart */}
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Overall Gender Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {genderData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => [value.toLocaleString(), 'Population']} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Statistics */}
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Summary Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
              <span className="font-medium text-blue-800">Total Population</span>
              <span className="text-xl font-bold text-blue-600">
                {(totalMale + totalFemale).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded">
              <span className="font-medium text-green-800">Total Villages</span>
              <span className="text-xl font-bold text-green-600">
                {villagePopulationData.length}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
              <span className="font-medium text-purple-800">Gender Ratio</span>
              <span className="text-xl font-bold text-purple-600">
                {totalFemale > 0 ? Math.round((totalMale / totalFemale) * 1000) : 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-orange-50 rounded">
              <span className="font-medium text-orange-800">Total Households</span>
              <span className="text-xl font-bold text-orange-600">
                {villagePopulationData.reduce((sum, item) => sum + item.households, 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemographicsCharts;