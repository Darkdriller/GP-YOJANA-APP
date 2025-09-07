import React from 'react';
import { Typography, Box } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';

interface AgeDistributionProps {
  data: any;
}

const colors = ['#4ba93f', '#e64e2a', '#355fa4'];

const AgeDistribution: React.FC<AgeDistributionProps> = ({ data }) => {
  if (!data || typeof data !== 'object') {
    return <Typography>No data available</Typography>;
  }

  const villages = Object.keys(data);

  const ageData = [
    { value: villages.reduce((sum, village) => sum + parseInt(data[village]?.age0to14Male || '0', 10) + parseInt(data[village]?.age0to14Female || '0', 10), 0), label: '0-14' },
    { value: villages.reduce((sum, village) => sum + parseInt(data[village]?.age15to60Male || '0', 10) + parseInt(data[village]?.age15to60Female || '0', 10), 0), label: '15-60' },
    { value: villages.reduce((sum, village) => sum + parseInt(data[village]?.ageAbove60Male || '0', 10) + parseInt(data[village]?.ageAbove60Female || '0', 10), 0), label: '60+' },
  ];

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <BarChart
        xAxis={[{ 
          scaleType: 'band', 
          data: ageData.map(item => item.label),
          tickLabelStyle: {
            fontSize: 14,
            fontWeight: 'bold',
          },
        }]}
        series={[
          { 
            data: ageData.map(item => item.value),
            label: 'Population',
            valueFormatter: (value) => `${value}`,
          }
        ]}
        colors={colors}
        width={500}
        height={400}
        barLabel="value"
        slotProps={{
          barLabel: {
            style: {
              fill: 'white',
              fontWeight: 'bold',
              fontSize: 14,
            },
          },
        }}
        margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
        legend={{ hidden: false, position: { vertical: 'top', horizontal: 'middle' } }}
      />
    </Box>
  );
};

export default AgeDistribution;