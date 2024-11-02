import React from 'react';
import { Typography, Box } from '@mui/material';
import { BarChart } from '@mui/x-charts';

interface FacilityStatusProps {
  data: {
    phcs: any[];
    subCentres: any[];
    anganwadiCentres: any[];
  };
}

const colors = ['#4ba93f', '#a3d977', '#e64e2a', '#ff8c42'];
const statusTypes = ['Fully Functional', 'Partially Functional', 'Needs Repair', 'Non-Operational'];
const facilityTypes = ['PHCs', 'Sub-Centres', 'Anganwadi Centres'];

const FacilityStatus: React.FC<FacilityStatusProps> = ({ data }) => {
  // Add debug logging
  console.log('Facility Status Data:', data);

  if (!data || !data.phcs || !data.subCentres || !data.anganwadiCentres) {
    console.log('No valid data available');
    return <Typography>No data available</Typography>;
  }

  // Check if there are any facilities
  const totalFacilities = data.phcs.length + data.subCentres.length + data.anganwadiCentres.length;
  if (totalFacilities === 0) {
    return <Typography>No facilities have been added yet</Typography>;
  }

  const getStatusCounts = (facilities: any[]) => {
    return statusTypes.map(status => 
      facilities.filter(facility => facility.status === status).length
    );
  };

  const seriesData = statusTypes.map((status, index) => ({
    data: [
      getStatusCounts(data.phcs)[index],
      getStatusCounts(data.subCentres)[index],
      getStatusCounts(data.anganwadiCentres)[index],
    ],
    label: status,
    stack: 'total',
    color: colors[index],
  }));

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <BarChart
        xAxis={[{
          scaleType: 'band',
          data: facilityTypes,
          tickLabelStyle: {
            angle: 0,
            fontSize: 12,
          },
        }]}
        yAxis={[{
          label: 'Number of Facilities',
        }]}
        series={seriesData}
        width={500}
        height={400}
        colors={colors}
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
            padding: 0,
            itemMarkWidth: 15,
            itemMarkHeight: 15,
            markGap: 5,
            itemGap: 10,
            labelStyle: {
              fontSize: 11,
            },
          },
        }}
        margin={{ top: 60, right: 20, bottom: 40, left: 60 }}
      />
    </Box>
  );
};

export default FacilityStatus;
