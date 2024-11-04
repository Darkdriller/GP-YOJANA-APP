// src/components/GPSnapshot/Environmental/WaterResourceDistributionChart.tsx

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
import { Typography, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useRouter } from 'next/router';

// Define the structure of each water body
interface WaterBody {
  id: string; // Unique identifier for each water body
  type: string;
  waterLevel: 'Seasonal' | 'Perennial' | 'Unknown'; // Possible water levels
  irrigationPotential: number;
  locations: string[];
}

// Define the props for the WaterResourceDistributionChart component
interface WaterResourceDistributionChartProps {
  waterBodies: WaterBody[];
  selectedVillage: string;
}

// Define the structure of chart data
interface ChartData {
  type: string;
  Seasonal: number;
  Perennial: number;
}

// Define the structure of tooltip payload
interface TooltipPayload {
  name: string;
  value: number;
  payload: ChartData;
}

// Define the structure for legend payload
interface LegendPayload {
  value: string;
  color?: string; // Make color optional to align with Recharts
}

// Define the structure for custom label props
interface CustomLabelProps {
  x: number;
  y: number;
  width: number;
  height: number;
  value: number;
}

// Define the color scheme for different water levels
const WATER_LEVEL_COLORS: { [key in WaterBody['waterLevel']]: string } = {
  Seasonal: '#FF8042',   // Orange
  Perennial: '#0088FE',  // Blue
  Unknown: '#808080',    // Grey
};

// Styled component for chart wrapper
const ChartWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '400px',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
}));

// Custom Tooltip Component
const CustomTooltipComponent: React.FC<{ active?: boolean; payload?: TooltipPayload[]; label?: string }> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <Box
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '5px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Typography variant="subtitle1" fontWeight="bold">
          {data.type}
        </Typography>
        {payload.map((entry, index) => (
          <Typography key={index} variant="body2">
            {entry.name}: {entry.value?.toFixed(1) || 0} ha
          </Typography>
        ))}
      </Box>
    );
  }
  return null;
};

// Custom Label Component for Bars
const CustomLabelComponent: React.FC<CustomLabelProps> = ({ x, y, width, height, value }) => {
  if (!value || value === 0) return null;

  return (
    <text
      x={x + width / 2}
      y={y + height / 2}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize={12}
      fontWeight="bold"
    >
      {value.toFixed(1)}
    </text>
  );
};

// Custom Legend Component
const renderLegendComponent: React.FC<{ payload: LegendPayload[] }> = ({ payload }) => {
  return (
    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
      {payload.map((entry, index) => (
        <Box key={`legend-item-${index}`} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box
            sx={{
              width: 16,
              height: 16,
              backgroundColor: entry.color || '#000', // Provide a fallback color
              borderRadius: '50%',
            }}
          />
          <Typography variant="body2">{entry.value}</Typography>
        </Box>
      ))}
    </Box>
  );
};

// Define the interface for the onClick handler's data parameter
interface BarOnClickData {
  type: string;
  name: string;
  value: number;
  [key: string]: any; // Allow additional properties
}

// WaterResourceDistributionChart Component
const WaterResourceDistributionChart: React.FC<WaterResourceDistributionChartProps> = ({ waterBodies = [], selectedVillage }) => {
  const router = useRouter();

  const chartData: ChartData[] = useMemo(() => {
    if (!Array.isArray(waterBodies)) {
      console.error('waterBodies is not an array');
      return [];
    }

    console.log('Processing water bodies for:', selectedVillage);

    // Filter water bodies based on selected village
    const filteredWaterBodies = selectedVillage === 'All'
      ? waterBodies
      : waterBodies.filter(wb => 
          wb.locations.some(location => 
            location.toLowerCase() === selectedVillage.toLowerCase()
          )
        );

    console.log('Filtered water bodies:', filteredWaterBodies);

    // Extract unique types
    const types = Array.from(new Set(filteredWaterBodies.map(wb => wb.type).filter(Boolean)));

    // Aggregate irrigation potential by type and water level
    const data: ChartData[] = types.map(type => {
      const seasonal = filteredWaterBodies
        .filter(wb => wb.type === type && wb.waterLevel === 'Seasonal')
        .reduce((sum, wb) => sum + (wb.irrigationPotential || 0), 0);

      const perennial = filteredWaterBodies
        .filter(wb => wb.type === type && wb.waterLevel === 'Perennial')
        .reduce((sum, wb) => sum + (wb.irrigationPotential || 0), 0);

      return {
        type,
        Seasonal: seasonal || 0,
        Perennial: perennial || 0,
      };
    });

    console.log('Final chart data:', data);
    return data;
  }, [waterBodies, selectedVillage]);

  // Handle bar click to navigate to details page
  const handleBarClick = (type: string) => {
    if (!waterBodies?.length) return;
    
    // Find a water body with the same type (assuming unique types)
    const waterBody = waterBodies.find(
      (wb) => wb.type === type
    );
    
    if (waterBody?.id) {
      router.push(`/water-resource-details/${waterBody.id}`);
    }
  };

  // Render a message when there's no data
  if (!chartData.length) {
    return (
      <ChartWrapper>
        <Typography variant="h6" gutterBottom>
          Water Resource Distribution across the Panchayat
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80%' }}>
          <Typography color="text.secondary">No data available for the selected village</Typography>
        </Box>
      </ChartWrapper>
    );
  }

  return (
    <ChartWrapper>
      <Typography variant="h6" align="center" gutterBottom>
        Water Resource Distribution across the Panchayat
      </Typography>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="type"
            angle={-45}
            textAnchor="end"
            interval={0}
            height={60}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            label={{
              value: 'Irrigation Potential (ha)',
              angle: -90,
              position: 'insideLeft',
              offset: -10,
              style: { textAnchor: 'middle', fontSize: 12 },
            }}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltipComponent />} />
          <Legend content={renderLegendComponent} />
          <Bar
            dataKey="Seasonal"
            stackId="a"
            fill={WATER_LEVEL_COLORS['Seasonal']}
            name="Seasonal"
            onClick={(data: any, index: number) => handleBarClick(data.type)}
          >
            <LabelList content={CustomLabelComponent} position="center" />
          </Bar>
          <Bar
            dataKey="Perennial"
            stackId="a"
            fill={WATER_LEVEL_COLORS['Perennial']}
            name="Perennial"
            onClick={(data: any, index: number) => handleBarClick(data.type)}
          >
            <LabelList content={CustomLabelComponent} position="center" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

export default WaterResourceDistributionChart;
