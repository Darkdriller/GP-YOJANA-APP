import React from 'react';
import { Typography, Box } from '@mui/material';
import { BarChart } from '@mui/x-charts';

interface StudentGenderByVillageProps {
  data: any;
}

const colors = ['#355fa4', '#e64e2a'];

const StudentGenderByVillage: React.FC<StudentGenderByVillageProps> = ({ data }) => {
  if (!data || typeof data !== 'object') {
    return <Typography>No data available</Typography>;
  }

  const villages = Object.keys(data);
  const studentData = villages.map(village => ({
    village,
    male: data[village].reduce((sum: number, school: any) => sum + (school.studentsMale || 0), 0),
    female: data[village].reduce((sum: number, school: any) => sum + (school.studentsFemale || 0), 0),
  }));

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
          label: 'Students',
        }]}
        series={[
          {
            data: studentData.map(d => d.male),
            label: 'Male',
            stack: 'total',
            color: colors[0],
            valueFormatter: (value) => `${value}`,
          },
          {
            data: studentData.map(d => d.female),
            label: 'Female',
            stack: 'total',
            color: colors[1],
            valueFormatter: (value) => `${value}`,
          },
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

export default StudentGenderByVillage;