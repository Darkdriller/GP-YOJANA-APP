import React from 'react';
import { Typography, Box } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';

interface DemographicsOverviewProps {
  data: any;
  selectedVillage?: string;
}

const colors = ['#355fa4', '#e64e2a', '#4ba93f', '#545454'];

const DemographicsOverview: React.FC<DemographicsOverviewProps> = ({ data, selectedVillage }) => {
  if (!data || typeof data !== 'object') {
    return <Typography>No data available</Typography>;
  }

  const villages = Object.keys(data);

  const totalPopulation = villages.reduce((sum, village) => sum + parseInt(data[village]?.totalPopulation || '0', 10), 0);
  const totalHouseholds = villages.reduce((sum, village) => sum + parseInt(data[village]?.households || '0', 10), 0);

  const malePopulation = villages.reduce((sum, village) => sum + parseInt(data[village]?.malePopulation || '0', 10), 0);
  const femalePopulation = villages.reduce((sum, village) => sum + parseInt(data[village]?.femalePopulation || '0', 10), 0);

  const ageData = [
    { value: villages.reduce((sum, village) => sum + parseInt(data[village]?.age0to14Male || '0', 10) + parseInt(data[village]?.age0to14Female || '0', 10), 0), label: '0-14' },
    { value: villages.reduce((sum, village) => sum + parseInt(data[village]?.age15to60Male || '0', 10) + parseInt(data[village]?.age15to60Female || '0', 10), 0), label: '15-60' },
    { value: villages.reduce((sum, village) => sum + parseInt(data[village]?.ageAbove60Male || '0', 10) + parseInt(data[village]?.ageAbove60Female || '0', 10), 0), label: '60+' },
  ];

  return (
    <Box>
      <Typography variant="h6">Total Population: {totalPopulation}</Typography>
      <Typography variant="h6">Total Households: {totalHouseholds}</Typography>
      <Typography variant="h6">Average Household Size: {totalHouseholds > 0 ? (totalPopulation / totalHouseholds).toFixed(2) : 'N/A'}</Typography>
      
      <Box height={300} display="flex" justifyContent="space-around">
        <Box width="45%">
          <Typography variant="subtitle1" align="center">Gender Distribution</Typography>
          <PieChart
            series={[
              {
                data: [
                  { id: 0, value: malePopulation, label: 'Male' },
                  { id: 1, value: femalePopulation, label: 'Female' },
                ],
                arcLabel: (item) => `${((item.value / totalPopulation) * 100).toFixed(1)}%`,
                arcLabelMinAngle: 45,
              },
            ]}
            colors={colors}
            width={300}
            height={200}
          />
        </Box>
        <Box width="45%">
          <Typography variant="subtitle1" align="center">Age Distribution</Typography>
          <BarChart
            xAxis={[{ scaleType: 'band', data: ageData.map(item => item.label) }]}
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
          />
        </Box>
      </Box>
    </Box>
  );
};

export default DemographicsOverview;