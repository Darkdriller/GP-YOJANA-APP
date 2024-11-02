import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList
} from 'recharts';

interface RoadData {
  totalCCRoad: number;
  ccRoadRequired: number;
  repairRequired: number;
  kuchhaRoad: number;
}

interface RoadInfrastructureChartProps {
  data: RoadData[] | null;
  selectedVillage: string;
  villages: string[]; // Add villages prop
}

const COLORS = {
  totalCCRoad: '#4CAF50',    // Green
  ccRoadRequired: '#FFA726', // Orange
  repairRequired: '#EF5350', // Red
  kuchhaRoad: '#8D6E63'      // Brown
};

const RoadInfrastructureChart: React.FC<RoadInfrastructureChartProps> = ({
  data,
  selectedVillage,
  villages
}) => {
  const chartData = useMemo(() => {
    if (!data || !villages.length) return [];

    console.log('Processing road data:', { data, villages, selectedVillage });

    if (selectedVillage === 'All') {
      return data.map((values, index) => ({
        village: villages[index] || `Village ${index + 1}`,
        'Total CC Road': Number(values.totalCCRoad) || 0,
        'CC Road Required': Number(values.ccRoadRequired) || 0,
        'Repair Required': Number(values.repairRequired) || 0,
        'Kuchha Road': Number(values.kuchhaRoad) || 0
      }));
    } else {
      const villageIndex = villages.indexOf(selectedVillage);
      if (villageIndex === -1 || !data[villageIndex]) return [];
      
      return [{
        village: selectedVillage,
        'Total CC Road': Number(data[villageIndex].totalCCRoad) || 0,
        'CC Road Required': Number(data[villageIndex].ccRoadRequired) || 0,
        'Repair Required': Number(data[villageIndex].repairRequired) || 0,
        'Kuchha Road': Number(data[villageIndex].kuchhaRoad) || 0
      }];
    }
  }, [data, selectedVillage, villages]);

  const renderCustomBarLabel = (props: any) => {
    const { x, y, width, value } = props;
    if (value === 0) return null;
    return (
      <text
        x={x + width / 2}
        y={y - 5}
        fill="#000000"
        textAnchor="middle"
        fontSize="12"
      >
        {`${value.toFixed(1)}`}
      </text>
    );
  };

  if (!data || chartData.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }} // Increased bottom margin
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="village"
            angle={-45}
            textAnchor="end"
            height={80} // Increased height
            interval={0}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            label={{ 
              value: 'Distance (km)',
              angle: -90,
              position: 'insideLeft',
              style: { textAnchor: 'middle' }
            }}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white p-3 border rounded-lg shadow-lg">
                    <p className="font-semibold mb-2">{label}</p>
                    {payload.map((item: any) => (
                      <p 
                        key={item.name} 
                        className="text-sm" 
                        style={{ color: item.color }}
                      >
                        {`${item.name}: ${Number(item.value).toFixed(1)} km`}
                      </p>
                    ))}
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend verticalAlign="bottom" height={36} />
          <Bar
            dataKey="Total CC Road"
            fill={COLORS.totalCCRoad}
            radius={[4, 4, 0, 0]}
          >
            <LabelList content={renderCustomBarLabel} position="top" />
          </Bar>
          <Bar
            dataKey="CC Road Required"
            fill={COLORS.ccRoadRequired}
            radius={[4, 4, 0, 0]}
          >
            <LabelList content={renderCustomBarLabel} position="top" />
          </Bar>
          <Bar
            dataKey="Repair Required"
            fill={COLORS.repairRequired}
            radius={[4, 4, 0, 0]}
          >
            <LabelList content={renderCustomBarLabel} position="top" />
          </Bar>
          <Bar
            dataKey="Kuchha Road"
            fill={COLORS.kuchhaRoad}
            radius={[4, 4, 0, 0]}
          >
            <LabelList content={renderCustomBarLabel} position="top" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RoadInfrastructureChart;