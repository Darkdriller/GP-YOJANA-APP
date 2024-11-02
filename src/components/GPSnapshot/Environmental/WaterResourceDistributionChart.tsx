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
import { WaterResourceDistributionChartProps, WaterBody } from '@/types';
import { styled } from '@mui/material/styles';
import { useRouter } from 'next/router';

// Define colors for Water Levels
const WATER_LEVEL_COLORS: { [key in WaterBody['waterLevel']]: string } = {
  Seasonal: '#FF8042',    // Orange
  Perennial: '#0088FE',   // Blue
};

const ChartWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '400px',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
}));

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: any;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <Box
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '5px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Typography variant="subtitle1" fontWeight="bold">
          {data.type}
        </Typography>
        {payload.map((entry: any, index: number) => (
          <Typography key={index} variant="body2">
            {entry.name}: {entry.value?.toFixed(1) || 0} ha
          </Typography>
        ))}
      </Box>
    );
  }
  return null;
};

const CustomLabel = (props: any) => {
  const { x, y, width, height, value } = props;
  if (!value || value === 0) return null;
  
  return (
    <text
      x={x + width / 2}
      y={y + height / 2}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize={12}
    >
      {value.toFixed(1)}
    </text>
  );
};

const renderLegend = (props: any) => {
  const { payload } = props;
  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      {payload.map((entry: any, index: number) => (
        <Box key={`item-${index}`} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box
            sx={{
              width: 16,
              height: 16,
              backgroundColor: entry.color,
              borderRadius: '50%',
            }}
          />
          <Typography variant="body2">{entry.value}</Typography>
        </Box>
      ))}
    </Box>
  );
};

const WaterResourceDistributionChart: React.FC<WaterResourceDistributionChartProps> = ({ waterBodies = [], selectedVillage }) => {
  const router = useRouter();

  const chartData = useMemo(() => {
    if (!Array.isArray(waterBodies)) {
      console.error('waterBodies is not an array');
      return [];
    }

    console.log('Processing water bodies for:', selectedVillage);

    // Filter water bodies based on selected village
    const filteredWaterBodies = selectedVillage === 'All'
      ? waterBodies
      : waterBodies.filter(wb => {
          // Check if locations array exists and includes the selected village
          return Array.isArray(wb?.locations) && 
                 wb.locations.some(location => 
                   location.toLowerCase() === selectedVillage.toLowerCase()
                 );
        });

    console.log('Filtered water bodies:', filteredWaterBodies);

    // Get unique types
    const types = Array.from(new Set(filteredWaterBodies.map(wb => wb?.type).filter(Boolean)));

    // Create chart data
    const data = types.map(type => {
      const seasonal = filteredWaterBodies
        .filter(wb => wb?.type === type && wb?.waterLevel === 'Seasonal')
        .reduce((sum, wb) => sum + (wb?.irrigationPotential || 0), 0);

      const perennial = filteredWaterBodies
        .filter(wb => wb?.type === type && wb?.waterLevel === 'Perennial')
        .reduce((sum, wb) => sum + (wb?.irrigationPotential || 0), 0);

      return {
        type,
        Seasonal: seasonal || 0,
        Perennial: perennial || 0
      };
    });

    console.log('Final chart data:', data);
    return data;
  }, [waterBodies, selectedVillage]);

  const handleBarClick = (data: any, index: number) => {
    if (!waterBodies?.length) return;
    
    const waterBody = waterBodies.find(
      (wb) => wb?.type === data.type && wb?.waterLevel === (index === 0 ? 'Seasonal' : 'Perennial')
    );
    
    if (waterBody?.id) {
      router.push(`/water-resource-details/${waterBody.id}`);
    }
  };

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
      <Typography variant="h6" gutterBottom>
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
          <Tooltip content={<CustomTooltip />} />
          <Legend content={renderLegend} />
          <Bar
            dataKey="Seasonal"
            stackId="a"
            fill={WATER_LEVEL_COLORS['Seasonal']}
            name="Seasonal"
            onClick={(data, index) => handleBarClick(data, 0)}
          >
            <LabelList content={CustomLabel} position="center" />
          </Bar>
          <Bar
            dataKey="Perennial"
            stackId="a"
            fill={WATER_LEVEL_COLORS['Perennial']}
            name="Perennial"
            onClick={(data, index) => handleBarClick(data, 1)}
          >
            <LabelList content={CustomLabel} position="center" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

export default WaterResourceDistributionChart;