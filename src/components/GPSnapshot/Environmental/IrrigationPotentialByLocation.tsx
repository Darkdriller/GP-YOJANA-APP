import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Typography, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

interface IrrigationPotentialByLocationProps {
  irrigationStructures: any[];
  selectedVillage: string;
}

// Color palette for locations
const LOCATION_COLORS = [
  '#2196F3',  // Blue
  '#4CAF50',  // Green
  '#FFC107',  // Amber
  '#9C27B0',  // Purple
  '#F44336',  // Red
  '#00BCD4',  // Cyan
  '#FF9800',  // Orange
  '#795548',  // Brown
];

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
          Irrigation Potential: {value.toFixed(1)} ha
        </Typography>
        <Typography variant="body2">
          Share of Total: {Math.round((value / total) * 100)}%
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Structure Types:
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
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      flexWrap: 'wrap', 
      gap: 2, 
      mt: 2 
    }}>
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
            {entry.value}: {entry.payload.value.toFixed(1)} ha
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

const IrrigationPotentialByLocation: React.FC<IrrigationPotentialByLocationProps> = ({ 
  irrigationStructures = [], 
  selectedVillage 
}) => {
  const chartData = useMemo(() => {
    if (!Array.isArray(irrigationStructures)) {
      console.error('irrigationStructures is not an array');
      return [];
    }

    // Filter structures based on selected village
    const filteredStructures = selectedVillage === 'All'
      ? irrigationStructures
      : irrigationStructures.filter(structure => 
          structure?.location?.toLowerCase() === selectedVillage.toLowerCase()
        );

    // Group by location and sum irrigation potential
    const locationGroups = filteredStructures.reduce((acc: any, structure) => {
      const location = structure.location || 'Unknown';
      if (!acc[location]) {
        acc[location] = {
          potential: 0,
          types: new Set()
        };
      }
      acc[location].potential += Number(structure.irrigationPotential) || 0;
      acc[location].types.add(structure.type);
      return acc;
    }, {});

    // Calculate total for percentages
    const total = Object.values(locationGroups).reduce((sum: any, group: any) => 
      sum + group.potential, 0);

    // Transform into chart data format
    const data = Object.entries(locationGroups)
      .map(([location, group]: [string, any]) => ({
        name: location,
        value: group.potential,
        total,
        types: Array.from(group.types)
      }))
      .sort((a, b) => b.value - a.value); // Sort by potential descending

    console.log('Location Chart Data:', data);
    return data;
  }, [irrigationStructures, selectedVillage]);

  if (!chartData.length) {
    return (
      <ChartWrapper>
        <Typography variant="h6" gutterBottom>
          Irrigation Potential by Location
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
        Irrigation Potential by Location
      </Typography>
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="45%"
            labelLine={false}
            label={CustomLabel}
            outerRadius={120}
            innerRadius={60}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={LOCATION_COLORS[index % LOCATION_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={renderLegend} verticalAlign="bottom" />
        </PieChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

export default IrrigationPotentialByLocation;