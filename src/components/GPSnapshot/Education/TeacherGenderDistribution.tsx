import React from 'react';
import { Typography, Box } from '@mui/material';
import { PieChart } from '@mui/x-charts';

interface TeacherGenderDistributionProps {
  data: any;
}

const colors = ['#355fa4', '#e64e2a'];

const TeacherGenderDistribution: React.FC<TeacherGenderDistributionProps> = ({ data }) => {
  if (!data || typeof data !== 'object') {
    return <Typography>No data available</Typography>;
  }

  const villages = Object.keys(data);
  const totalMaleTeachers = villages.reduce((sum, village) => 
    sum + data[village].reduce((schoolSum: number, school: any) => 
      schoolSum + (school.teachersMale || 0), 0
    ), 0
  );
  const totalFemaleTeachers = villages.reduce((sum, village) => 
    sum + data[village].reduce((schoolSum: number, school: any) => 
      schoolSum + (school.teachersFemale || 0), 0
    ), 0
  );
  const totalTeachers = totalMaleTeachers + totalFemaleTeachers;

  const teacherData = [
    { id: 0, value: totalMaleTeachers, label: 'Male' },
    { id: 1, value: totalFemaleTeachers, label: 'Female' },
  ];

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <PieChart
        series={[{
          data: teacherData,
          highlightScope: { faded: 'global', highlighted: 'item' },
          faded: { innerRadius: 30, additionalRadius: -30 },
          arcLabel: (item) => `${item.label}: ${((item.value / totalTeachers) * 100).toFixed(1)}%`,
          innerRadius: 30,
          outerRadius: 150,
          paddingAngle: 2,
          cornerRadius: 5,
        }]}
        slotProps={{
          legend: {
            direction: 'column',
            position: { vertical: 'middle', horizontal: 'right' },
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
        margin={{ top: 20, right: 150, bottom: 20, left: 20 }}
        sx={{
          '& .MuiChartsLegend-label': {
            fontSize: '16px',
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

export default TeacherGenderDistribution;