import React from 'react';
import { ScatterChart } from '@mui/x-charts/ScatterChart';
import { Box, Typography } from '@mui/material';

interface MigrationLandlessCorrelationProps {
  data: any;
  selectedVillage: string;
}

const MigrationLandlessCorrelation: React.FC<MigrationLandlessCorrelationProps> = ({ data, selectedVillage }) => {
  const prepareChartData = () => {
    if (!data) return [];

    let chartData;
    if (selectedVillage === 'All') {
      chartData = Object.entries(data).map(([village, values]: [string, any]) => ({
        village,
        landlessHouseholds: values.landlessHouseholds,
        totalMigrants: values.seasonalMigrantsMale + 
          values.seasonalMigrantsFemale + 
          values.permanentMigrantsMale + 
          values.permanentMigrantsFemale,
        size: Math.sqrt(values.householdsReportingMigration) * 5 // Size based on households reporting migration
      }));
    } else {
      chartData = [{
        village: selectedVillage,
        landlessHouseholds: data[selectedVillage].landlessHouseholds,
        totalMigrants: data[selectedVillage].seasonalMigrantsMale + 
          data[selectedVillage].seasonalMigrantsFemale + 
          data[selectedVillage].permanentMigrantsMale + 
          data[selectedVillage].permanentMigrantsFemale,
        size: Math.sqrt(data[selectedVillage].householdsReportingMigration) * 5
      }];
    }

    return chartData;
  };

  const chartData = prepareChartData();

  return (
    <Box width="100%" height="100%">
      <Typography variant="subtitle2" align="center" gutterBottom>
        Bubble size represents number of households reporting migration
      </Typography>
      <ScatterChart
        dataset={chartData}
        xAxis={[{ 
          label: 'Number of Landless Households',
          min: 0,
          max: Math.max(...chartData.map(d => d.landlessHouseholds)) + 10
        }]}
        yAxis={[{ 
          label: 'Total Number of Migrants',
          min: 0,
          max: Math.max(...chartData.map(d => d.totalMigrants)) + 10
        }]}
        series={[{
          data: chartData.map(item => ({ 
            x: item.landlessHouseholds,
            y: item.totalMigrants,
            id: item.village,
            size: item.size
          })),
          label: 'Villages',
          valueFormatter: ({ x, y }) => 
            `Village: ${chartData.find(d => d.landlessHouseholds === x && d.totalMigrants === y)?.village}\n` +
            `Landless Households: ${x}\n` +
            `Total Migrants: ${y}`,
          color: '#355fa4'
        }]}
        height={300}
        slotProps={{
          legend: { hidden: true }
        }}
      />
    </Box>
  );
};

export default MigrationLandlessCorrelation;