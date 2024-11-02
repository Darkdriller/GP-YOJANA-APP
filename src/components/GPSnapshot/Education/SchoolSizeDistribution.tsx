import React from 'react';
import { Typography, Box } from '@mui/material';
import { BarChart } from '@mui/x-charts';

interface SchoolSizeDistributionProps {
  data: any;
}

const SchoolSizeDistribution: React.FC<SchoolSizeDistributionProps> = ({ data }) => {
  if (!data || typeof data !== 'object') {
    return <Typography>No data available</Typography>;
  }

  const villages = Object.keys(data);
  const allSchoolSizes = villages.flatMap(village => 
    data[village].map((school: any) => school.studentsTotal || 0)
  );

  // Define size ranges
  const ranges = [
    { min: 0, max: 50, label: '0-50' },
    { min: 51, max: 100, label: '51-100' },
    { min: 101, max: 200, label: '101-200' },
    { min: 201, max: 500, label: '201-500' },
    { min: 501, max: Infinity, label: '500+' },
  ];

  const distributionData = ranges.map(range => ({
    range: range.label,
    count: allSchoolSizes.filter(size => 
      size >= range.min && size <= range.max
    ).length,
  }));

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <BarChart
        xAxis={[{
          scaleType: 'band',
          data: distributionData.map(d => d.range),
          label: 'School Size (Number of Students)',
        }]}
        yAxis={[{
          label: 'Number of Schools',
        }]}
        series={[
          {
            data: distributionData.map(d => d.count),
            color: '#355fa4',
            valueFormatter: (value) => value.toString(),
          },
        ]}
        width={500}
        height={400}
        margin={{ top: 40, right: 20, bottom: 40, left: 60 }}
      />
    </Box>
  );
};

export default SchoolSizeDistribution;