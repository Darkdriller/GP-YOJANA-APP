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

interface LandUseMappingChartProps {
  data: {
    [village: string]: {
      totalCultivableLand: number;
      irrigatedLand: number;
      forestArea: number;
    };
  } | null;
  selectedVillage: string;
}

const COLORS = {
  totalCultivableLand: '#4CAF50',
  irrigatedLand: '#2196F3',
  forestArea: '#006400' // Changed to Deep Green
};

const LandUseMappingChart: React.FC<LandUseMappingChartProps> = ({
  data,
  selectedVillage
}) => {
  console.log('LandUseMappingChart - Raw data:', {
    data,
    selectedVillage,
    availableVillages: data ? Object.keys(data) : []
  });

  const chartData = useMemo(() => {
    if (!data) {
      console.log('LandUseMappingChart - No data provided');
      return [];
    }

    const transformData = (villageData: any, villageName: string) => {
      console.log(`Processing village data for ${villageName}:`, villageData);
      
      return {
        village: villageName,
        'Total Cultivable Land': Number(villageData.totalCultivableLand) || 0,
        'Irrigated Land': Number(villageData.irrigatedLand) || 0,
        'Forest Area': Number(villageData.forestArea) || 0
      };
    };

    let processedData;
    if (selectedVillage === 'All') {
      processedData = Object.entries(data).map(([village, values]) => 
        transformData(values, village)
      );
    } else {
      const villageData = data[selectedVillage];
      if (villageData) {
        processedData = [transformData(villageData, selectedVillage)];
      } else {
        processedData = [];
      }
    }

    console.log('Processed chart data:', processedData);
    return processedData;
  }, [data, selectedVillage]);

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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold mb-2">{label}</p>
          {payload.map((entry: any) => (
            <p
              key={entry.name}
              className="text-sm"
              style={{ color: entry.color }}
            >
              {`${entry.name}: ${Number(entry.value).toFixed(1)} ha`}
            </p>
          ))}
        </div>
      );
    }
    return null;
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
          margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="village"
            angle={-45}
            textAnchor="end"
            height={60}
            interval={0}
            tick={{ fontSize: 11 }}
          />
          <YAxis
            label={{ 
              value: 'Area (Hectares)',
              angle: -90,
              position: 'insideLeft',
              offset: -10,
              style: { textAnchor: 'middle', fontSize: 12 }
            }}
            tick={{ fontSize: 11 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="top"
            height={36}
            wrapperStyle={{ fontSize: '12px' }}
          />
          <Bar
            dataKey="Total Cultivable Land"
            fill={COLORS.totalCultivableLand}
            radius={[4, 4, 0, 0]}
          >
            <LabelList content={renderCustomBarLabel} position="top" />
          </Bar>
          <Bar
            dataKey="Irrigated Land"
            fill={COLORS.irrigatedLand}
            radius={[4, 4, 0, 0]}
          >
            <LabelList content={renderCustomBarLabel} position="top" />
          </Bar>
          <Bar
            dataKey="Forest Area"
            fill={COLORS.forestArea}
            radius={[4, 4, 0, 0]}
          >
            <LabelList content={renderCustomBarLabel} position="top" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LandUseMappingChart;
