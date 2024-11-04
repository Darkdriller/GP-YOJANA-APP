// src/components/GPSnapshot/Education/InfrastructureStatus.tsx

import React from 'react';
import { Typography, Box } from '@mui/material';
import { PieChart } from '@mui/x-charts';

interface SchoolData {
  infrastructureStatus: string;
}

interface InfrastructureStatusProps {
  data: {
    [village: string]: SchoolData[];
  } | null;
}

interface StatusData {
  id: number;
  value: number;
  label: string;
}

const colors = ['#4ba93f', '#a3d977', '#e64e2a', '#ff8c42'];

const InfrastructureStatus: React.FC<InfrastructureStatusProps> = ({ data }) => {
  // Early return if data is null or not an object
  if (!data || typeof data !== 'object') {
    return <Typography>No data available</Typography>;
  }

  const villages = Object.keys(data);

  // Accumulate the count of each infrastructure status across all villages
  const statusCount = villages.reduce<{ [key: string]: number }>((acc, village) => {
    // Ensure data[village] is an array before iterating
    if (Array.isArray(data[village])) {
      data[village].forEach((school) => {
        const status = school.infrastructureStatus || 'Unknown';
        acc[status] = (acc[status] || 0) + 1;
      });
    } else {
      console.warn(`Data for village ${village} is not an array.`);
    }
    return acc;
  }, {});

  const totalSchools = Object.values(statusCount).reduce((sum, count) => sum + count, 0);

  // Transform the statusCount object into an array suitable for PieChart
  const statusData: StatusData[] = Object.entries(statusCount).map(([status, count], index) => ({
    id: index,
    value: count,
    label: status,
  }));

  // Handle case where there's no data after processing
  if (statusData.length === 0) {
    return <Typography>No migration data has been added yet</Typography>;
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <PieChart
        series={[
          {
            data: statusData,
            highlightScope: { faded: 'global', highlighted: 'item' },
            faded: { innerRadius: 30, additionalRadius: -30 },
            arcLabel: (item) => `${item.label}: ${((item.value / totalSchools) * 100).toFixed(1)}%`,
            // Removed arcLabelStyle
            innerRadius: 30,
            outerRadius: 150,
            paddingAngle: 2,
            cornerRadius: 5,
          },
        ]}
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
        sx={{
          '& .MuiChartsLegend-label': {
            fontSize: '10px', // Increased from 06px to 10px for better readability
            fontWeight: 'bold',
            fill: 'white',
          },
          '& .MuiChartsLegend-mark': {
            rx: 10,
            stroke: 'white',
            strokeWidth: 2,
          },
          // Attempt to style labels via CSS
          '& .MuiChartsArcLabel': {
            fill: 'white',
            fontWeight: 'bold',
            fontSize: '10px',
            textOutline: '2px #00000060',
          },
        }}
      />
    </Box>
  );
};

export default InfrastructureStatus;
