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

interface MGNREGSPerformanceProps {
  data: {
    [village: string]: {
      landlessHouseholds: number;
      householdsReportingMigration: number;
    };
  } | null;
  demographicsData: {
    [village: string]: {
      households: string;
    };
  } | null;
  selectedVillage: string;
}

const MGNREGSPerformance: React.FC<MGNREGSPerformanceProps> = ({
  data,
  demographicsData,
  selectedVillage
}) => {
  // Log initial props with detailed information
  console.log('MGNREGSPerformance - Props received:', {
    data,
    dataType: typeof data,
    dataIsNull: data === null,
    demographicsData,
    demographicsType: typeof demographicsData,
    demographicsIsNull: demographicsData === null,
    selectedVillage
  });

  const chartData = useMemo(() => {
    if (!data) {
      console.log('MGNREGSPerformance - Migration data is missing');
      return [];
    }

    if (!demographicsData) {
      console.log('MGNREGSPerformance - Demographics data is missing');
      return [];
    }

    console.log('MGNREGSPerformance - Processing data for villages:', {
      migrationVillages: Object.keys(data),
      demographicVillages: Object.keys(demographicsData)
    });

    const processVillageData = (village: string, values: any) => {
      const totalHouseholds = Number(demographicsData[village]?.households) || 0;
      const landlessCount = Number(values.landlessHouseholds) || 0;
      const migratingCount = Number(values.householdsReportingMigration) || 0;

      console.log(`Processing village ${village}:`, {
        totalHouseholds,
        landlessCount,
        migratingCount
      });

      if (totalHouseholds === 0) {
        console.log(`No household data for village: ${village}`);
        return null;
      }

      const villageData = {
        village,
        landlessProportion: ((landlessCount / totalHouseholds) * 100).toFixed(1),
        migratingProportion: ((migratingCount / totalHouseholds) * 100).toFixed(1),
        landlessCount,
        migratingCount,
        total: totalHouseholds
      };

      console.log(`MGNREGSPerformance - Processed data for ${village}:`, villageData);
      return villageData;
    };

    let processedData;
    if (selectedVillage === 'All') {
      console.log('MGNREGSPerformance - Processing all villages');
      processedData = Object.entries(data)
        .map(([village, values]) => processVillageData(village, values))
        .filter(item => item !== null);
    } else {
      console.log(`MGNREGSPerformance - Processing selected village: ${selectedVillage}`);
      const villageData = processVillageData(selectedVillage, data[selectedVillage]);
      processedData = villageData ? [villageData] : [];
    }

    console.log('MGNREGSPerformance - Final processed data:', processedData);
    return processedData;
  }, [data, demographicsData, selectedVillage]);

  if (!data || !demographicsData) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-gray-500">
          {!data ? 'Migration data is missing' : 'Demographics data is missing'}
        </p>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-gray-500">No valid data available for the selected village(s)</p>
      </div>
    );
  }

  const renderCustomBarLabel = (props: any) => {
    const { x, y, width, value } = props;
    return (
      <text
        x={x + width / 2}
        y={y - 5}
        fill="#000000"
        textAnchor="middle"
        fontSize="12"
      >
        {`${value}%`}
      </text>
    );
  };

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 30, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="village"
            angle={-45}
            textAnchor="end"
            height={60}
            interval={0}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            label={{ 
              value: 'Percentage of Total Households',
              angle: -90,
              position: 'insideLeft',
              style: { textAnchor: 'middle' }
            }}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              console.log('MGNREGSPerformance - Tooltip data:', {
                label,
                payload
              });
              return (
                <div className="bg-white p-3 border rounded-lg shadow-lg">
                  <p className="font-semibold mb-2">{label}</p>
                  {payload.map((item: any, index: number) => (
                    <p key={index} className="text-sm" style={{ color: item.color }}>
                      {item.name}: {item.value}% ({item.payload[item.name === 'Landless Households' ? 'landlessCount' : 'migratingCount']} households)
                    </p>
                  ))}
                  <p className="text-sm text-gray-600 mt-1">
                    Total Households: {payload[0].payload.total}
                  </p>
                </div>
              );
            }
            return null;
          }} />
          <Legend />
          <Bar
            dataKey="landlessProportion"
            name="Landless Households"
            fill="#ff4d4f"
            radius={[4, 4, 0, 0]}
          >
            <LabelList
              dataKey="landlessProportion"
              content={renderCustomBarLabel}
              position="top"
            />
          </Bar>
          <Bar
            dataKey="migratingProportion"
            name="Migrating Households"
            fill="#faad14"
            radius={[4, 4, 0, 0]}
          >
            <LabelList
              dataKey="migratingProportion"
              content={renderCustomBarLabel}
              position="top"
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MGNREGSPerformance;
