// src/components/GPSnapshot/Environmental/CommonLandTreemap.tsx

import React, { useMemo } from 'react';
import { Treemap, ResponsiveContainer, Tooltip, Cell } from 'recharts';

// Define TypeScript interfaces for better type safety
interface CommonLandArea {
  area: number;
  id: string;
  location: string;
  uses: string;
}

interface CommonLandTreemapProps {
  data: CommonLandArea[];
  selectedVillage: string;
}

// Define an array of colors for the Treemap cells
const COLORS = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', '#d0ed57', '#ffc658'];

// Custom Tooltip Component for detailed information
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border rounded-lg shadow-lg">
        <p className="font-semibold">{data.name}</p>
        <p className="text-sm">Area: {data.value} ha</p>
        <p className="text-sm">Village: {data.village}</p>
      </div>
    );
  }
  return null;
};

// Custom Label Renderer
const CustomLabel = (props: any) => {
  const { x, y, width, height, name, value, village } = props;

  // Calculate positions for the text
  const textX = x + width / 2;
  const textY = y + height / 2;

  // Avoid rendering labels for very small rectangles
  if (width < 50 || height < 50) {
    return null;
  }

  return (
    <text
      x={textX}
      y={textY}
      textAnchor="middle"
      dominantBaseline="middle"
      fill="#fff"
      fontSize={12}
      pointerEvents="none"
    >
      {`${village}: ${value} ha`}
    </text>
  );
};

const CommonLandTreemap: React.FC<CommonLandTreemapProps> = ({ data, selectedVillage }) => {
  console.log('CommonLandTreemap - Initial props:', { data, selectedVillage });

  // Filter data based on selectedVillage if not 'All'
  const filteredData = useMemo(() => {
    if (selectedVillage === 'All') {
      return data;
    }
    return data.filter(item => item.location === selectedVillage);
  }, [data, selectedVillage]);

  console.log('CommonLandTreemap - Filtered Data:', filteredData);

  if (!filteredData || filteredData.length === 0) {
    console.log('CommonLandTreemap - No common land areas data available after filtering');
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-gray-500">No common land data available</p>
      </div>
    );
  }

  // Map data to Treemap's expected format
  const treemapData = filteredData.map(item => ({
    name: item.uses || item.location || 'Unknown',
    value: item.area,
    id: item.id,
    village: item.location
  }));

  console.log('CommonLandTreemap - Treemap Data:', treemapData);

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={treemapData}
          dataKey="value"
          nameKey="name"
          stroke="#fff"
          fill="#8884d8"
        >
          <Tooltip content={<CustomTooltip />} />
          {treemapData.map((entry, index) => (
            <Cell key={`cell-${entry.id}`} fill={COLORS[index % COLORS.length]} />
          ))}
          <CustomLabel />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
};

export default CommonLandTreemap;
