import React from 'react';
import { Typography, Box } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';

interface TeacherStudentRatioProps {
  data: any;
}

const colors = ['#355fa4']; // Using blue to match your color scheme

const TeacherStudentRatio: React.FC<TeacherStudentRatioProps> = ({ data }) => {
  if (!data || typeof data !== 'object') {
    return <Typography>No data available</Typography>;
  }

  const villages = Object.keys(data);
  const ratioData = villages.map(village => {
    const totalStudents = data[village].reduce((sum: number, school: any) => 
      sum + (school.studentsTotal || 0), 0);
    const totalTeachers = data[village].reduce((sum: number, school: any) => 
      sum + ((school.teachersMale || 0) + (school.teachersFemale || 0)), 0);
    return totalTeachers > 0 ? +(totalStudents / totalTeachers).toFixed(1) : 0;
  });

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
          label: 'Students per Teacher',
        }]}
        series={[
          { 
            data: ratioData,
            label: 'Teacher-Student Ratio',
            color: colors[0],
            curve: 'natural',
            showMark: true,
            valueFormatter: (value) => `${value}:1`,
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
        tooltip={{ 
          trigger: 'axis',
        }}
      />
    </Box>
  );
};

export default TeacherStudentRatio;