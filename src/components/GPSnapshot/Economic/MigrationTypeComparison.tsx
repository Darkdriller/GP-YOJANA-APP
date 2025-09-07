import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import { Box, useTheme } from '@mui/material';

interface MigrationTypeComparisonProps {
  data: any;
  selectedVillage: string;
}

const MigrationTypeComparison: React.FC<MigrationTypeComparisonProps> = ({ data, selectedVillage }) => {
  const theme = useTheme();

  const prepareChartData = () => {
    if (!data) return [];

    let chartData;
    if (selectedVillage === 'All') {
      chartData = Object.entries(data).map(([village, values]: [string, any]) => ({
        village,
        cardHolders: values.householdsWithMGNREGSCards,
        workdaysPerHousehold: values.householdsWithMGNREGSCards > 0 
          ? Math.round(values.workdaysProvidedMGNREGS / values.householdsWithMGNREGSCards)
          : 0
      }));
    } else {
      chartData = [{
        village: selectedVillage,
        cardHolders: data[selectedVillage].householdsWithMGNREGSCards,
        workdaysPerHousehold: data[selectedVillage].householdsWithMGNREGSCards > 0
          ? Math.round(data[selectedVillage].workdaysProvidedMGNREGS / data[selectedVillage].householdsWithMGNREGSCards)
          : 0
      }];
    }

    return chartData;
  };

  const chartData = prepareChartData();

  return (
    <Box 
      width="100%" 
      height="450px"
      display="flex"
      flexDirection="column"
      alignItems="center"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
        >
          {/* Define Gradients */}
          <defs>
            <linearGradient id="colorCardHolders" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={theme.palette.primary.dark} stopOpacity={0.8}/>
            </linearGradient>
            <linearGradient id="colorWorkdays" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={theme.palette.secondary.main} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={theme.palette.secondary.dark} stopOpacity={0.8}/>
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="village" 
            angle={-45} 
            textAnchor="end" 
            interval={0}
            height={60}
            tick={{ fontSize: 12 }}
          />
          <YAxis label={{ value: 'Number of Households / Days', angle: -90, position: 'insideLeft', fontSize: 12 }} />
          <Tooltip />
          <Legend verticalAlign="top" height={36} />
          
          <Bar dataKey="cardHolders" name="MGNREGS Card Holders" fill="url(#colorCardHolders)" >
            <LabelList dataKey="cardHolders" position="top" formatter={(value: number) => `${value}` } style={{ fontSize: 11 }} />
          </Bar>
          <Bar dataKey="workdaysPerHousehold" name="Workdays per Household" fill="url(#colorWorkdays)" >
            <LabelList dataKey="workdaysPerHousehold" position="top" formatter={(value: number) => `${value} days`} style={{ fontSize: 11 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default MigrationTypeComparison;
