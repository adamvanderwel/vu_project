import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip,
} from 'recharts';

// Sample data structure
const generateData = () => {
  try {
    const hours = Array.from({ length: 24 }, (_, i) => {
      const hour = i.toString().padStart(2, '0');
      return {
        time: `${hour}:00`,
        state1: Math.random() * 200 - 100,
        state2: Math.random() * 200 - 100,
        stateNeg1: Math.random() * -200,
      };
    });
    return hours;
  } catch (error) {
    console.error('Error generating data:', error);
    return [];
  }
};

export const MarketChart = () => {
  const data = generateData();

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Geen data beschikbaar</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="time"
          tick={{ fontSize: 12, fill: '#666' }}
          interval={2}
        />
        <YAxis
          tick={{ fontSize: 12, fill: '#666' }}
          domain={[-400, 500]}
          ticks={[-400, -300, -200, -100, 0, 100, 200, 300, 400, 500]}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
          formatter={(value: number) => [`€${value.toFixed(2)}/MWh`]}
        />
        <ReferenceLine y={0} stroke="#666" strokeWidth={1} />
        <Bar dataKey="state1" fill="#3B82F6" stackId="stack" name="Regeltoestand 1" />
        <Bar dataKey="state2" fill="#EF4444" stackId="stack" name="Regeltoestand 2" />
        <Bar dataKey="stateNeg1" fill="#6B7280" stackId="stack" name="Regeltoestand -1" />
      </BarChart>
    </ResponsiveContainer>
  );
}; 