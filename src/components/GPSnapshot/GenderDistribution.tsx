import React from 'react';
import { Typography, Box } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';

interface GenderDistributionProps {
  data: any;
}

const colors = ['#355fa4', '#e64e2a'];

const GenderDistribution: React.FC<GenderDistributionProps> = ({ data }) => {
  if (!data || typeof data !== 'object') {
    return <Typography>No data available</Typography>;
  }

  const villages = Object.keys(data);

  const malePopulation = villages.reduce((sum, village) => sum + parseInt(data[village]?.malePopulation || '0', 10), 0);
  const femalePopulation = villages.reduce((sum, village) => sum + parseInt(data[village]?.femalePopulation || '0', 10), 0);
  const totalPopulation = malePopulation + femalePopulation;

  const genderData = [
    { id: 0, value: malePopulation, label: 'Male' },
    { id: 1, value: femalePopulation, label: 'Female' },
  ];

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <PieChart
        series={[
          {
            data: genderData,
            highlightScope: { faded: 'global', highlighted: 'item' },
            faded: { innerRadius: 30, additionalRadius: -30 },
            arcLabel: (item) => `${item.label}: ${((item.value / totalPopulation) * 100).toFixed(1)}%`,
            innerRadius: 30,
            outerRadius: 150,
            paddingAngle: 2,
            cornerRadius: 5,
          },
        ]}
        slotProps={{
          legend: {
            direction: 'column',
            position: { vertical: 'middle', horizontal: 'right' },
            padding: 20,
            itemMarkWidth: 20,
            itemMarkHeight: 20,
            markGap: 8,
            itemGap: 15,
          },
        }}
        colors={colors}
        width={500}
        height={400}
        margin={{ top: 20, right: 150, bottom: 20, left: 20 }}
        sx={{
          '& .MuiChartsLegend-label': {
            fontSize: '16px',
            fontWeight: 'bold',
            fill: 'white', // Make legend labels white
          },
          '& .MuiChartsLegend-mark': {
            rx: 10, // Round the corners of legend marks
            stroke: 'white', // Add a white outline to legend marks
            strokeWidth: 2,
          },
        }}
      />
    </Box>
  );
};

export default GenderDistribution;