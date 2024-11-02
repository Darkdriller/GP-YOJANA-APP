import React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { Box } from '@mui/material';

interface VillageData {
  seasonalMigrantsMale: number;
  seasonalMigrantsFemale: number;
  permanentMigrantsMale: number;
  permanentMigrantsFemale: number;
  householdsReportingMigration: number;
}

interface ComprehensiveMigrationProps {
  data: Record<string, VillageData>;
  selectedVillage: string;
}

const ComprehensiveMigration: React.FC<ComprehensiveMigrationProps> = ({ data, selectedVillage }) => {
  const prepareChartData = () => {
    if (!data) return [];

    let chartData;
    if (selectedVillage === 'All') {
      chartData = Object.entries(data).map(([village, values]: [string, VillageData]) => ({
        village,
        seasonalMale: values.seasonalMigrantsMale,
        seasonalFemale: values.seasonalMigrantsFemale,
        permanentMale: values.permanentMigrantsMale,
        permanentFemale: values.permanentMigrantsFemale,
        totalHouseholds: values.householdsReportingMigration
      }));
    } else {
      chartData = [{
        village: selectedVillage,
        seasonalMale: data[selectedVillage].seasonalMigrantsMale,
        seasonalFemale: data[selectedVillage].seasonalMigrantsFemale,
        permanentMale: data[selectedVillage].permanentMigrantsMale,
        permanentFemale: data[selectedVillage].permanentMigrantsFemale,
        totalHouseholds: data[selectedVillage].householdsReportingMigration
      }];
    }

    return chartData;
  };

  return (
    <Box width="100%" height="100%">
      <BarChart
        dataset={prepareChartData()}
        xAxis={[{ 
          scaleType: 'band', 
          dataKey: 'village',
          tickLabelStyle: {
            angle: 45,
            textAnchor: 'start',
            fontSize: 12,
          }
        }]}
        series={[
          { 
            dataKey: 'seasonalMale',
            label: 'Seasonal Male',
            color: '#355fa4',
            stack: 'seasonal',
            valueFormatter: (value) => `${value} people`
          },
          { 
            dataKey: 'seasonalFemale',
            label: 'Seasonal Female',
            color: '#4ba93f',
            stack: 'seasonal',
            valueFormatter: (value) => `${value} people`
          },
          { 
            dataKey: 'permanentMale',
            label: 'Permanent Male',
            color: '#e64e2a',
            stack: 'permanent',
            valueFormatter: (value) => `${value} people`
          },
          { 
            dataKey: 'permanentFemale',
            label: 'Permanent Female',
            color: '#545454',
            stack: 'permanent',
            valueFormatter: (value) => `${value} people`
          }
        ]}
        height={300}
        slotProps={{
          legend: {
            direction: 'row',
            position: { vertical: 'top', horizontal: 'right' },
            padding: { top: 20 },
          }
        }}
      />
    </Box>
  );
};

export default ComprehensiveMigration;