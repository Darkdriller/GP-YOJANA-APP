// src/components/GPSnapshot/Economic/MigrationTrendChart.tsx

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
  ResponsiveContainer,
} from 'recharts';
import { Typography, Box } from '@mui/material';

interface VillageMigrationData {
  seasonalMigrantsMale: number;
  seasonalMigrantsFemale: number;
  permanentMigrantsMale: number;
  permanentMigrantsFemale: number;
}

interface MigrationTrendChartProps {
  data: {
    [village: string]: VillageMigrationData;
  };
  selectedVillage: string;
}

interface ChartData {
  village: string;
  seasonal: number;
  permanent: number;
}

const MigrationTrendChart: React.FC<MigrationTrendChartProps> = ({ data, selectedVillage }) => {
  // Detailed debugging logs
  console.log('MigrationTrendChart - Raw Data:', data);
  console.log('MigrationTrendChart - Selected Village:', selectedVillage);
  
  // Data validation
  if (!data) {
    console.log('Data is null or undefined');
    return <Typography>No data available</Typography>;
  }

  if (typeof data !== 'object') {
    console.log('Data is not an object:', typeof data);
    return <Typography>Invalid data format</Typography>;
  }

  if (Object.keys(data).length === 0) {
    console.log('Data object is empty');
    return <Typography>No villages data available</Typography>;
  }

  const prepareChartData = (): ChartData[] => {
    console.log('Preparing chart data...');
    
    try {
      const relevantData = selectedVillage === 'All' 
        ? Object.entries(data)
        : [[selectedVillage, data[selectedVillage]]];

      console.log('Relevant data before processing:', relevantData);

      const processedData = relevantData.map(([village, values]) => {
        // Log each village's data as we process it
        console.log('Processing village:', village, 'with values:', values);
        
        const seasonal = (Number(values.seasonalMigrantsMale) || 0) + (Number(values.seasonalMigrantsFemale) || 0);
        const permanent = (Number(values.permanentMigrantsMale) || 0) + (Number(values.permanentMigrantsFemale) || 0);
        
        console.log('Calculated totals for', village, '- Seasonal:', seasonal, 'Permanent:', permanent);
        
        return {
          village,
          seasonal,
          permanent,
        };
      }).filter(item => item.seasonal > 0 || item.permanent > 0);

      console.log('Final processed data:', processedData);
      return processedData;
    } catch (error) {
      console.error('Error processing data:', error);
      return [];
    }
  };

  const chartData = prepareChartData();

  if (chartData.length === 0) {
    console.log('No data points after processing');
    return <Typography>No migration data has been added yet</Typography>;
  }

  return (
    <Box sx={{ width: '100%', height: 400 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 60,
          }}
        >
          <defs>
            <linearGradient id="seasonalGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#355fa4" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#355fa4" stopOpacity={0.4} />
            </linearGradient>
            <linearGradient id="permanentGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e64e2a" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#e64e2a" stopOpacity={0.4} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="village" 
            angle={-45} 
            textAnchor="end" 
            height={60}
            tick={{ fontSize: 10 }}
          />
          <YAxis 
            allowDecimals={false}
            label={{ value: 'Number of Migrants', angle: -90, position: 'insideLeft', dy: 70, fontSize: 12 }}
          />
          <Tooltip formatter={(value: number) => `${value} people`} />
          <Legend 
            wrapperStyle={{ fontSize: '8px' }} // Decrease legend text size
            iconSize={12}
            verticalAlign="top"
            height={36}
          />
          <Bar dataKey="seasonal" name="Seasonal Migration" fill="url(#seasonalGradient)">
            <LabelList 
              dataKey="seasonal" 
              position="top" 
              formatter={(value: number) => `${value}`} 
              fill="#808080" // Changed to grey
              fontSize={10}
            />
          </Bar>
          <Bar dataKey="permanent" name="Permanent Migration" fill="url(#permanentGradient)">
            <LabelList 
              dataKey="permanent" 
              position="top" 
              formatter={(value: number) => `${value}`} 
              fill="#808080" // Changed to grey
              fontSize={10}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default MigrationTrendChart;
