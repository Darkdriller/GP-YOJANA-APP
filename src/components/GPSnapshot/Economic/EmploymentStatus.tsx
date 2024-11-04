import React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { Box } from '@mui/material';

interface EmploymentStatusProps {
  data: any;
  selectedVillage: string;
}

const EmploymentStatus: React.FC<EmploymentStatusProps> = ({ data, selectedVillage }) => {
  const prepareChartData = () => {
    if (!data) return [];

    let chartData;
    if (selectedVillage === 'All') {
      chartData = Object.entries(data).map(([village, values]: [string, any]) => ({
        village,
        landlessHouseholds: values.landlessHouseholds,
        mgnregsCards: values.householdsWithMGNREGSCards,
        // coverage is omitted since it's a line
      }));
    } else {
      chartData = [{
        village: selectedVillage,
        landlessHouseholds: data[selectedVillage].landlessHouseholds,
        mgnregsCards: data[selectedVillage].householdsWithMGNREGSCards,
        // coverage is omitted since it's a line
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
            dataKey: 'landlessHouseholds',
            label: 'Landless Households',
            color: '#e64e2a',
            // Removed type: 'line'
            valueFormatter: (value) => `${value} households`
          },
          { 
            dataKey: 'mgnregsCards',
            label: 'MGNREGS Card Holders',
            color: '#4ba93f',
            // Removed type: 'line'
            valueFormatter: (value) => `${value} households`
          }
          // Removed coverage series
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

export default EmploymentStatus;
