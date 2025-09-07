import React from 'react';
import { Typography, Box } from '@mui/material';
import { PieChart } from '@mui/x-charts';

interface FacilityDistributionProps {
  data: {
    phcs: any[];
    subCentres: any[];
    anganwadiCentres: any[];
  };
}

const colors = ['#355fa4', '#e64e2a', '#4ba93f'];

const FacilityDistribution: React.FC<FacilityDistributionProps> = ({ data }) => {
  // Add debug logging
  console.log('Facility Distribution Data:', data);

  if (!data || !data.phcs || !data.subCentres || !data.anganwadiCentres) {
    console.log('No valid data available');
    return <Typography>No data available</Typography>;
  }

  const facilityData = [
    { id: 0, value: data.phcs.length, label: 'Primary Health Centres' },
    { id: 1, value: data.subCentres.length, label: 'Sub-Centres' },
    { id: 2, value: data.anganwadiCentres.length, label: 'Anganwadi Centres' },
  ];

  const totalFacilities = facilityData.reduce((sum, item) => sum + item.value, 0);

  // If no facilities exist yet
  if (totalFacilities === 0) {
    return <Typography>No facilities have been added yet</Typography>;
  }

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <PieChart
        series={[{
          data: facilityData,
          highlightScope: { faded: 'global', highlighted: 'item' },
          faded: { innerRadius: 30, additionalRadius: -30 },
          arcLabel: (item) => `${((item.value / totalFacilities) * 100).toFixed(1)}%`,
          innerRadius: 30,
          outerRadius: 130,
          paddingAngle: 2,
          cornerRadius: 5,
        }]}
        slotProps={{
          legend: {
            direction: 'row',
            position: { vertical: 'top', horizontal: 'middle' },
            padding: 0,
            itemMarkWidth: 20,
            itemMarkHeight: 20,
            markGap: 8,
            itemGap: 15,
          },
        }}
        colors={colors}
        width={500}
        height={400}
        margin={{ top: 40, right: 20, bottom: 20, left: 20 }}
        sx={{
          '& .MuiChartsLegend-label': {
            fontSize: '12px',
            fontWeight: 'bold',
            fill: 'white',
          },
          '& .MuiChartsLegend-mark': {
            rx: 10,
            stroke: 'white',
            strokeWidth: 2,
          },
        }}
      />
    </Box>
  );
};

export default FacilityDistribution;
