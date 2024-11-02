import React from 'react';
import { Typography, Box } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';

interface HouseholdsPerVillageProps {
  data: any;
}

const colors = ['#4ba93f'];

const HouseholdsPerVillage: React.FC<HouseholdsPerVillageProps> = ({ data }) => {
  if (!data || typeof data !== 'object') {
    return <Typography>No data available</Typography>;
  }

  const villages = Object.keys(data);
  const householdData = villages.map(village => parseInt(data[village]?.households || '0', 10));

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <LineChart
        xAxis={[{ 
          scaleType: 'point', 
          data: villages,
          tickLabelStyle: {
            angle: 45,
            textAnchor: 'start',
            fontSize: 12,
          },
        }]}
        yAxis={[{
          label: 'Number of Households',
        }]}
        series={[
          { 
            data: householdData, 
            label: 'Households', 
            color: colors[0],
            curve: 'natural',
            showMark: true,
          },
        ]}
        width={500}
        height={400}
        slotProps={{
          legend: {
            direction: 'row',
            position: { vertical: 'top', horizontal: 'middle' },
            padding: 20,
            itemMarkWidth: 20,
            itemMarkHeight: 20,
            markGap: 5,
            itemGap: 15,
          },
        }}
        margin={{ top: 40, right: 20, bottom: 70, left: 60 }}
      />
    </Box>
  );
};

export default HouseholdsPerVillage;