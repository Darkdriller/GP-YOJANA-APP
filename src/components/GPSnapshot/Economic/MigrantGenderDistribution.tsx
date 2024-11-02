import React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import { Box, useTheme } from '@mui/material';

interface MigrantGenderDistributionProps {
  data: any;
  selectedVillage: string;
}

const MigrantGenderDistribution: React.FC<MigrantGenderDistributionProps> = ({ data, selectedVillage }) => {
  const theme = useTheme();

  const calculateTotalsByGender = () => {
    if (!data) return [];

    let relevantData;
    if (selectedVillage === 'All') {
      relevantData = Object.values(data).reduce((acc: any, village: any) => ({
        seasonalMale: acc.seasonalMale + village.seasonalMigrantsMale,
        seasonalFemale: acc.seasonalFemale + village.seasonalMigrantsFemale,
        permanentMale: acc.permanentMale + village.permanentMigrantsMale,
        permanentFemale: acc.permanentFemale + village.permanentMigrantsFemale,
      }), { seasonalMale: 0, seasonalFemale: 0, permanentMale: 0, permanentFemale: 0 });
    } else {
      relevantData = {
        seasonalMale: data[selectedVillage].seasonalMigrantsMale,
        seasonalFemale: data[selectedVillage].seasonalMigrantsFemale,
        permanentMale: data[selectedVillage].permanentMigrantsMale,
        permanentFemale: data[selectedVillage].permanentMigrantsFemale,
      };
    }

    return [
      { id: 0, value: relevantData.seasonalMale, label: 'Seasonal Male', color: theme.palette.primary.light },
      { id: 1, value: relevantData.seasonalFemale, label: 'Seasonal Female', color: theme.palette.primary.dark },
      { id: 2, value: relevantData.permanentMale, label: 'Permanent Male', color: theme.palette.secondary.light },
      { id: 3, value: relevantData.permanentFemale, label: 'Permanent Female', color: theme.palette.secondary.dark },
    ];
  };

  return (
    <Box 
      width="100%" 
      height="400px" // Increased height to accommodate top legend
      display="flex" 
      flexDirection="column"
      alignItems="center"
    >
      <PieChart
        series={[
          {
            arcLabel: (item) => `${item.value}`,
            arcLabelMinAngle: 45,
            data: calculateTotalsByGender(),
            highlightScope: { faded: 'global', highlighted: 'item' },
            faded: { innerRadius: 30, additionalRadius: -30 },
            innerRadius: 30,
            outerRadius: 120,
            paddingAngle: 2,
          },
        ]}
        height={400}
        width={500}
        margin={{ top: 100, bottom: 50, left: 50, right: 50 }} // Added margin to prevent legend overlap
        slotProps={{
          legend: {
            direction: 'row',
            position: { vertical: 'top', horizontal: 'middle' },
            padding: 0,
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

export default MigrantGenderDistribution;