import React from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import { Box, useTheme } from '@mui/material';

interface LandlessHouseholdsTrendProps {
  data: {
    [village: string]: {
      landlessHouseholds: number;
      householdsReportingMigration: number;
    };
  } | null;
  demographicsData: {
    [village: string]: {
      households: string;
    };
  } | null;
  selectedVillage: string;
}

const LandlessHouseholdsTrend: React.FC<LandlessHouseholdsTrendProps> = ({ 
  data, 
  demographicsData, 
  selectedVillage 
}) => {
  const theme = useTheme();

  const prepareChartData = () => {
    if (!data || !demographicsData) return { xAxis: [], series: [] };

    let chartData;
    if (selectedVillage === 'All') {
      chartData = Object.entries(data).map(([village, values]: [string, any]) => {
        const totalHouseholds = parseInt(demographicsData[village]?.households, 10) || 0;
        return {
          village,
          landless: values.landlessHouseholds || 0,
          migrating: values.householdsReportingMigration || 0,
          total: totalHouseholds,
        };
      });
    } else {
      const totalHouseholds = parseInt(demographicsData[selectedVillage]?.households, 10) || 0;
      chartData = [{
        village: selectedVillage,
        landless: data[selectedVillage]?.landlessHouseholds || 0,
        migrating: data[selectedVillage]?.householdsReportingMigration || 0,
        total: totalHouseholds,
      }];
    }

    console.log('Processed chart data:', chartData);

    return {
      xAxis: chartData.map(item => item.village),
      series: [
        {
          data: chartData.map(item => item.landless),
          label: 'Landless Households',
          color: theme.palette.error.main,
        },
        {
          data: chartData.map(item => item.migrating),
          label: 'Migrating Households',
          color: theme.palette.warning.main,
        },
        {
          data: chartData.map(item => item.total),
          label: 'Total Households',
          color: theme.palette.success.main,
        },
      ],
    };
  };

  const chartData = prepareChartData();

  if (!data || !demographicsData || chartData.xAxis.length === 0) {
    return (
      <Box 
        width="100%" 
        height="400px"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <p>No data available</p>
      </Box>
    );
  }

  return (
    <Box 
      width="100%" 
      height="400px"
      display="flex"
      flexDirection="column"
      alignItems="center"
    >
      <LineChart
        title="Landless Households vs Migrating Households vs Total Households"
        dataset={chartData.xAxis.map((village, index) => ({
          village,
          'Landless': chartData.series[0].data[index],
          'Migrating': chartData.series[1].data[index],
          'Total': chartData.series[2].data[index],
        }))}
        xAxis={[{ 
          scaleType: 'point', 
          dataKey: 'village',
          tickLabelStyle: {
            angle: 45,
            textAnchor: 'start',
            fontSize: 12
          }
        }]}
        series={[
          { 
            dataKey: 'Landless', 
            label: 'Landless Households',
            color: theme.palette.error.main,
            showMark: true,
          },
          { 
            dataKey: 'Migrating', 
            label: 'Migrating Households',
            color: theme.palette.warning.main,
            showMark: true,
          },
          { 
            dataKey: 'Total', 
            label: 'Total Households',
            color: theme.palette.success.main,
            showMark: true,
          },
        ]}
        height={400}
        margin={{ top: 70, bottom: 70, left: 50, right: 50 }}
        slotProps={{
          legend: {
            direction: 'row',
            position: { vertical: 'top', horizontal: 'middle' },
            padding: { top: 0, bottom: 20 },
            itemMarkWidth: 10,
            itemMarkHeight: 10,
            markGap: 5,
            itemGap: 15,
            labelStyle: {
              fontSize: 12,
            },
          },
        }}
      />
    </Box>
  );
};

export default LandlessHouseholdsTrend;