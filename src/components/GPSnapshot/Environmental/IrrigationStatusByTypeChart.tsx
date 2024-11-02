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

interface IrrigationStatusByTypeChartProps {
  irrigationStructures: any[];
  selectedVillage: string;
}

// Color scheme
const STATUS_COLORS = {
  'Good Condition': '#4CAF50',    // Green
  'Needs Repairs': '#FFA726'      // Orange
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
        <Typography variant="subtitle2" fontWeight="bold">
          {label}
        </Typography>
        {payload.map((entry: any, index: number) => (
          <Typography key={index} variant="body2">
            {entry.name}: {entry.value}
          </Typography>
        ))}
      </Box>
    );
  }
  return null;
};

// Custom Label Component
const CustomLabel = (props: any) => {
  const { x, y, width, value } = props;
  if (!value || value === 0) return null;
  
  return (
    <text
      x={x + width / 2}
      y={y - 5}
      textAnchor="middle"
      dominantBaseline="bottom"
      fontSize={12}
    >
      {value}
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
              borderRadius: '2px',
            }}
          />
          <Typography variant="body2">{entry.value}</Typography>
        </Box>
      ))}
    </Box>
  );
};

const IrrigationStatusByTypeChart: React.FC<IrrigationStatusByTypeChartProps> = ({ 
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

    // Get unique types
    const types = Array.from(new Set(filteredStructures.map(structure => structure.type)));

    // Create chart data
    return types.map(type => {
      const structures = filteredStructures.filter(structure => structure.type === type);
      
      return {
        type,
        'Good Condition': structures.filter(s => s.status === 'Good Condition').length,
        'Needs Repairs': structures.filter(s => s.status === 'Needs Repairs').length,
      };
    });
  }, [irrigationStructures, selectedVillage]);

  if (!chartData.length) {
    return (
      <ChartWrapper>
        <Typography variant="h6" gutterBottom>
          Irrigation Structure Status by Type
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
        Irrigation Structure Status by Type
      </Typography>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="type"
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            label={{ 
              value: 'Number of Structures', 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle' } 
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend content={renderLegend} />
          <Bar
            dataKey="Good Condition"
            fill={STATUS_COLORS['Good Condition']}
            name="Good Condition"
          >
            <LabelList content={CustomLabel} position="top" />
          </Bar>
          <Bar
            dataKey="Needs Repairs"
            fill={STATUS_COLORS['Needs Repairs']}
            name="Needs Repairs"
          >
            <LabelList content={CustomLabel} position="top" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

export default IrrigationStatusByTypeChart;