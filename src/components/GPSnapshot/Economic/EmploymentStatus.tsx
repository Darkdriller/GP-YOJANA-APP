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
        coverage: values.landlessHouseholds > 0 
          ? (values.householdsWithMGNREGSCards / values.landlessHouseholds * 100).toFixed(1)
          : 0
      }));
    } else {
      chartData = [{
        village: selectedVillage,
        landlessHouseholds: data[selectedVillage].landlessHouseholds,
        mgnregsCards: data[selectedVillage].householdsWithMGNREGSCards,
        coverage: data[selectedVillage].landlessHouseholds > 0 
          ? (data[selectedVillage].householdsWithMGNREGSCards / data[selectedVillage].landlessHouseholds * 100).toFixed(1)
          : 0
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
            valueFormatter: (value) => `${value} households`
          },
          { 
            dataKey: 'mgnregsCards',
            label: 'MGNREGS Card Holders',
            color: '#4ba93f',
            valueFormatter: (value) => `${value} households`
          },
          { 
            dataKey: 'coverage',
            label: 'Coverage (%)',
            color: '#545454',
            type: 'line',
            valueFormatter: (value) => `${value}%`
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

export default EmploymentStatus;