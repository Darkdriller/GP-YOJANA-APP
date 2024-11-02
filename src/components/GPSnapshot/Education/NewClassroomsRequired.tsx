import React from 'react';
import { Typography, Box } from '@mui/material';
import { BarChart } from '@mui/x-charts';

interface NewClassroomsRequiredProps {
  data: any;
}

const NewClassroomsRequired: React.FC<NewClassroomsRequiredProps> = ({ data }) => {
  if (!data || typeof data !== 'object') {
    return <Typography>No data available</Typography>;
  }

  const villages = Object.keys(data);
  const classroomData = villages.map(village => ({
    village,
    classrooms: data[village].reduce((sum: number, school: any) => 
      sum + (school.newClassroomsRequired || 0), 0),
  }));

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
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
          label: 'Number of Classrooms',
        }]}
        series={[
          {
            data: classroomData.map(d => d.classrooms),
            color: '#4ba93f',
            valueFormatter: (value) => value.toString(),
          },
        ]}
        width={500}
        height={400}
        margin={{ top: 40, right: 20, bottom: 70, left: 60 }}
      />
    </Box>
  );
};

export default NewClassroomsRequired;