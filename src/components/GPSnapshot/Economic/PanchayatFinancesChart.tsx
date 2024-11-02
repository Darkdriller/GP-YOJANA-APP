import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  Label
} from 'recharts';

interface PanchayatFinancesData {
  cfc: number;
  sfc: number;
  ownSources: number;
  mgnregs: number;
}

interface PanchayatFinancesChartProps {
  data: PanchayatFinancesData | null;
}

const COLORS = {
  cfc: '#2196F3',      // Blue
  sfc: '#4CAF50',      // Green
  ownSources: '#FFA726', // Orange
  mgnregs: '#F06292'    // Pink
};

const PanchayatFinancesChart: React.FC<PanchayatFinancesChartProps> = ({
  data
}) => {
  if (!data) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const total = Object.values(data).reduce((sum, value) => sum + value, 0);

  const chartData = [
    {
      name: 'Central Finance Commission',
      value: data.cfc,
      shortName: 'CFC'
    },
    {
      name: 'State Finance Commission',
      value: data.sfc,
      shortName: 'SFC'
    },
    {
      name: 'Panchayat Own Sources',
      value: data.ownSources,
      shortName: 'Own Sources'
    },
    {
      name: 'MGNREGS',
      value: data.mgnregs,
      shortName: 'MGNREGS'
    }
  ].filter(item => item.value > 0);

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    value,
    index
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.2; // Adjust radius to position labels outside
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#000"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="middle"
        fontSize="12"
      >
        {`₹${value.toLocaleString('en-IN')} (${(percent * 100).toFixed(0)}%)`}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border">
          <p className="text-sm font-medium">{data.name}</p>
          <p className="text-sm">{`Amount: ₹${data.value.toLocaleString('en-IN')}`}</p>
          <p className="text-sm">{`Share: ${((data.value / total) * 100).toFixed(1)}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full">
      <div className="w-full text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 inline-block mr-2">
          Total Panchayat Finances
        </h3>
        <p className="text-2xl font-bold text-gray-900 inline-block">
          ₹{total.toLocaleString('en-IN')}
        </p>
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="80%"
            paddingAngle={2}
            dataKey="value"
            labelLine={false}
            label={renderCustomizedLabel}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[entry.shortName.toLowerCase().replace(/\s+/g, '') as keyof typeof COLORS]} 
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => (
              <span className="text-xs">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PanchayatFinancesChart;
