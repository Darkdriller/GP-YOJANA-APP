import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Typography, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

interface WaterBodiesConditionChartProps {
  waterBodies: any[];
  selectedVillage: string;
}

// Color scheme for different conditions
const CONDITION_COLORS = {
  'Clean': '#4CAF50',      // Green
  'Polluted': '#FFA726',   // Orange
  'Heavily polluted': '#EF5350'  // Red
};

const ChartWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '400px',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
}));

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const { name, value, total, types } = payload[0].payload;
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
        <Typography variant="body2" fontWeight="bold">
          {name}
        </Typography>
        <Typography variant="body2">
          Count: {value}
        </Typography>
        <Typography variant="body2">
          Percentage: {Math.round((value / total) * 100)}%
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Types:
        </Typography>
        {types.map((type: string, index: number) => (
          <Typography key={index} variant="body2" sx={{ pl: 1 }}>
            • {type}
          </Typography>
        ))}
      </Box>
    );
  }
  return null;
};

// Custom Label Component
const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, value }: any) => {
  if (value === 0) return null;
  
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor="middle" 
      dominantBaseline="central"
      fontSize={12}
      fontWeight="bold"
    >
      {Math.round(percent * 100)}%
    </text>
  );
};

const renderLegend = (props: any) => {
  const { payload } = props;
  
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 2 }}>
      {payload.map((entry: any, index: number) => (
        <Box key={`item-${index}`} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              backgroundColor: entry.color,
              borderRadius: '50%',
            }}
          />
          <Typography variant="body2">
            {entry.value} ({Math.round((entry.payload.value / entry.payload.total) * 100)}%)
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

const WaterBodiesConditionChart: React.FC<WaterBodiesConditionChartProps> = ({ waterBodies = [], selectedVillage }) => {
  const chartData = useMemo(() => {
    if (!Array.isArray(waterBodies)) {
      console.error('waterBodies is not an array');
      return [];
    }

    // Filter water bodies based on selected village
    const filteredWaterBodies = selectedVillage === 'All'
      ? waterBodies
      : waterBodies.filter(wb => 
          Array.isArray(wb?.locations) && 
          wb.locations.some(location => 
            location.toLowerCase() === selectedVillage.toLowerCase()
          )
        );

    // Group water bodies by condition with their types
    const conditionGroups = filteredWaterBodies.reduce((acc: any, wb) => {
      const condition = wb.condition || 'Unknown';
      if (!acc[condition]) {
        acc[condition] = {
          count: 0,
          types: new Set()
        };
      }
      acc[condition].count += 1;
      acc[condition].types.add(wb.type);
      return acc;
    }, {});

    // Calculate total for percentages
    const total = Object.values(conditionGroups).reduce((sum: any, group: any) => sum + group.count, 0);

    // Transform into chart data format
    const data = Object.entries(conditionGroups).map(([condition, group]: [string, any]) => ({
      name: condition,
      value: group.count,
      total,
      types: Array.from(group.types),
      percentage: Math.round((group.count / total) * 100)
    }));

    console.log('Condition Chart Data:', data);
    return data;
  }, [waterBodies, selectedVillage]);

  if (!chartData.length) {
    return (
      <ChartWrapper>
        <Typography variant="h6" gutterBottom>
          Water Bodies by Condition
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
        Water Bodies by Condition
      </Typography>
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={CustomLabel}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={CONDITION_COLORS[entry.name as keyof typeof CONDITION_COLORS] || '#808080'}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={renderLegend} />
        </PieChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

export default WaterBodiesConditionChart;