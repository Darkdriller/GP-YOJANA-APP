import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  Label,
} from 'recharts';

interface MGNREGSCoverageProps {
  data: {
    [village: string]: {
      householdsWithMGNREGSCards: number;
    };
  } | null;
  demographicsData: {
    [village: string]: {
      households: string;
    };
  } | null;
  selectedVillage: string;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const { name, value, percent } = payload[0].payload;
    return (
      <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
        <p className="text-sm font-medium">{name}</p>
        <p className="text-sm">{`Count: ${value}`}</p>
        <p className="text-sm">{`Percentage: ${(percent * 100).toFixed(1)}%`}</p>
      </div>
    );
  }
  return null;
};

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  value,
  name,
}: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return percent > 0.05 ? (
    <text
      x={x}
      y={y}
      fill="#000000"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      style={{ fontSize: '12px' }}
    >
      {`${value.toLocaleString()} (${(percent * 100).toFixed(1)}%)`}
    </text>
  ) : null;
};

const CenterLabel = ({ percentage }: { percentage: string }) => (
  <text
    x="50%"
    y="50%"
    textAnchor="middle"
    dominantBaseline="middle"
  >
    <tspan
      className="text-base font-semibold text-gray-700"
      style={{ fontSize: '14px' }}
    >
      {`${percentage}%`}
    </tspan>
    <tspan 
      x="50%" 
      dy="1.2em" 
      className="text-xs text-gray-500"
      style={{ fontSize: '10px' }}
    >
      with MGNREGS
    </tspan>
  </text>
);

const MGNREGSCoverage: React.FC<MGNREGSCoverageProps> = ({
  data,
  demographicsData,
  selectedVillage,
}) => {
  const COLORS = ['#4CAF50', '#FF9800'];

  const calculatedData = useMemo(() => {
    if (!data || !demographicsData) {
      return { totalHouseholds: 0, totalMGNREGS: 0 };
    }

    if (selectedVillage === 'All') {
      const totalHouseholds = Object.values(demographicsData).reduce((sum, village) => {
        return sum + (parseInt(village.households, 10) || 0);
      }, 0);

      const totalMGNREGS = Object.values(data).reduce((sum, village) => {
        return sum + (Number(village.householdsWithMGNREGSCards) || 0);
      }, 0);

      return { totalHouseholds, totalMGNREGS };
    } else {
      const totalHouseholds = parseInt(demographicsData[selectedVillage]?.households, 10) || 0;
      const totalMGNREGS = Number(data[selectedVillage]?.householdsWithMGNREGSCards) || 0;

      return { totalHouseholds, totalMGNREGS };
    }
  }, [data, demographicsData, selectedVillage]);

  const { totalHouseholds, totalMGNREGS } = calculatedData;

  if (totalHouseholds === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const chartData = [
    {
      name: 'Households without MGNREGS Card',
      value: Math.max(0, totalHouseholds - totalMGNREGS),
    },
    {
      name: 'Households with MGNREGS Card',
      value: totalMGNREGS,
    },
  ];

  const percentage = ((totalMGNREGS / totalHouseholds) * 100).toFixed(1);

  return (
    <div className="w-full h-full p-4 bg-white rounded-lg shadow-md">
      <div className="mb-6 text-center">
        <p className="text-lg font-semibold text-gray-800">
          {`Total Households = ${totalHouseholds.toLocaleString()}`}
        </p>
      </div>
      <div className="flex flex-col items-center">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="80%"
              paddingAngle={3}
              dataKey="value"
              labelLine={false}
              label={renderCustomizedLabel}
              startAngle={90}
              endAngle={-270}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
              <Label
                content={<CenterLabel percentage={percentage} />}
                position="center"
              />
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              wrapperStyle={{ fontSize: '12px' }}
              payload={[
                { value: 'Households without MGNREGS Card', type: 'square', color: COLORS[0] },
                { value: 'Households with MGNREGS Card', type: 'square', color: COLORS[1] },
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MGNREGSCoverage;
