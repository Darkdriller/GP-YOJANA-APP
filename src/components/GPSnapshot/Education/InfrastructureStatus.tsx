import React from 'react';
import { Typography, Box } from '@mui/material';
import { PieChart } from '@mui/x-charts';

interface InfrastructureStatusProps {
  data: any;
}

const colors = ['#4ba93f', '#a3d977', '#e64e2a', '#ff8c42'];

const InfrastructureStatus: React.FC<InfrastructureStatusProps> = ({ data }) => {
  if (!data || typeof data !== 'object') {
    return <Typography>No data available</Typography>;
  }

  const villages = Object.keys(data);
  const statusCount = villages.reduce((acc: { [key: string]: number }, village) => {
    data[village].forEach((school: any) => {
      const status = school.infrastructureStatus || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
    });
    return acc;
  }, {});

  const totalSchools = Object.values(statusCount).reduce((sum, count) => sum + count, 0);
  
  const statusData = Object.entries(statusCount).map(([status, count], index) => ({
    id: index,
    value: count,
    label: status,
  }));

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <PieChart
        series={[{
          data: statusData,
          highlightScope: { faded: 'global', highlighted: 'item' },
          faded: { innerRadius: 30, additionalRadius: -30 },
          arcLabel: (item) => `${item.label}: ${Math.round((item.value / totalSchools) * 100)}%`,
          innerRadius: 30,
          outerRadius: 150,
          paddingAngle: 2,
          cornerRadius: 5,
        }]}
        slotProps={{
          legend: {
            direction: 'row',
            position: { vertical: 'bottom', horizontal: 'middle' },
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
        margin={{ top: 20, right: 20, bottom: 60, left: 20 }}
        arcLabelStyle={{
          fill: 'white',
          fontWeight: 'bold',
          fontSize: '06px',
          textOutline: '2px #00000060',
        }}
        sx={{
          '& .MuiChartsLegend-label': {
            fontSize: '06px',  // Decreased from 08px to 06px
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

export default InfrastructureStatus;