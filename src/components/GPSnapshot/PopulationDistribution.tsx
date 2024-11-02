import React from 'react';
import { Typography, Box } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';

interface PopulationDistributionProps {
  data: any;
}

const colors = ['#355fa4', '#e64e2a'];

const PopulationDistribution: React.FC<PopulationDistributionProps> = ({ data }) => {
  if (!data || typeof data !== 'object') {
    return <Typography>No data available</Typography>;
  }

  const villages = Object.keys(data);
  const maleData = villages.map(village => parseInt(data[village]?.malePopulation || '0', 10));
  const femaleData = villages.map(village => parseInt(data[village]?.femalePopulation || '0', 10));

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <BarChart
        xAxis={[{ 
          scaleType: 'band', 
          data: villages,
          tickLabelStyle: {
            angle: 45,
            textAnchor: 'start',
            fontSize: 12,
          },
        }]}
        yAxis={[{
          label: 'Population',
        }]}
        series={[
          { data: maleData, label: 'Male', stack: 'total', color: colors[0] },
          { data: femaleData, label: 'Female', stack: 'total', color: colors[1] },
        ]}
        width={500}
        height={400}
        barLabel="value"
        slotProps={{
          barLabel: {
            style: {
              fill: 'white',
              fontWeight: 'bold',
              fontSize: '12px',
            },
          },
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
        layout="vertical"
      />
    </Box>
  );
};

export default PopulationDistribution;