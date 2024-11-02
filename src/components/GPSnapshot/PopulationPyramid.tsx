import React from 'react';
import { Typography, Box } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';

interface PopulationPyramidProps {
  data: any;
}

const colors = ['#355fa4', '#e64e2a'];

const PopulationPyramid: React.FC<PopulationPyramidProps> = ({ data }) => {
  if (!data || typeof data !== 'object') {
    return <Typography>No data available</Typography>;
  }

  const villages = Object.keys(data);

  const maleData = [
    -villages.reduce((sum, village) => sum + parseInt(data[village]?.ageAbove60Male || '0', 10), 0),
    -villages.reduce((sum, village) => sum + parseInt(data[village]?.age15to60Male || '0', 10), 0),
    -villages.reduce((sum, village) => sum + parseInt(data[village]?.age0to14Male || '0', 10), 0),
  ];

  const femaleData = [
    villages.reduce((sum, village) => sum + parseInt(data[village]?.ageAbove60Female || '0', 10), 0),
    villages.reduce((sum, village) => sum + parseInt(data[village]?.age15to60Female || '0', 10), 0),
    villages.reduce((sum, village) => sum + parseInt(data[village]?.age0to14Female || '0', 10), 0),
  ];

  return (
    <Box height={400} display="flex" justifyContent="center" alignItems="center">
      <BarChart
        yAxis={[{ scaleType: 'band', data: ['60+', '15-60', '0-14'] }]}
        series={[
          { 
            data: maleData, 
            label: 'Male', 
            stack: 'total',
            valueFormatter: (value) => `${Math.abs(value)}`,
          },
          { 
            data: femaleData, 
            label: 'Female', 
            stack: 'total',
            valueFormatter: (value) => `${value}`,
          },
        ]}
        colors={colors}
        layout="horizontal"
        width={1000}
        height={400}
        barLabel="value"
      />
    </Box>
  );
};

export default PopulationPyramid;