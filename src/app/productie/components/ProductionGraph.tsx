import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Generate realistic wind power data for multiple days
const generateMultiDayData = () => {
  const days = [
    { 
      date: '27 Feb 2024', 
      windConditions: 'strong',
      baseMultiplier: 1.2,
      gridCongestion: false,
      marketPrices: 'normal',
      weatherEvent: null 
    },
    { 
      date: '28 Feb 2024', 
      windConditions: 'moderate',
      baseMultiplier: 1.0,
      gridCongestion: true, // Local grid congestion during peak hours
      marketPrices: 'negative_morning',
      weatherEvent: null
    },
    { 
      date: '29 Feb 2024', 
      windConditions: 'weak',
      baseMultiplier: 0.7,
      gridCongestion: false,
      marketPrices: 'low',
      weatherEvent: null 
    },
    { 
      date: '1 Mar 2024', 
      windConditions: 'stormy',
      baseMultiplier: 1.4,
      gridCongestion: true, // Regional grid overload due to high wind production
      marketPrices: 'volatile',
      weatherEvent: { time: '11:00', duration: '4 hours' } 
    },
  ];

  const dailyData = days.map((day) => {
    const hours = Array.from({ length: 24 }, (_, i) => {
      const hour = i;
      
      // Base production pattern with daily cycle
      const baseProduction = 8 + Math.sin((hour - 6) * (Math.PI / 12)) * 2;
      
      // Apply day-specific conditions
      let potentialProduction = baseProduction * day.baseMultiplier + (Math.random() * 2 - 1);
      
      // Ensure within realistic bounds
      potentialProduction = Math.max(Math.min(potentialProduction, 12), 0);
      
      // Start with potential as actual
      let actualProduction = potentialProduction;
      
      // Apply day-specific events and reductions
      if (day.date === '28 Feb 2024') {
        // Grid congestion during morning peak
        if (hour >= 8 && hour <= 11) {
          actualProduction *= 0.7; // 30% reduction due to grid constraints
        }
        // Negative prices in early morning
        if (hour >= 3 && hour <= 6) {
          actualProduction *= 0.4; // Significant reduction during negative prices
        }
      } else if (day.date === '29 Feb 2024') {
        // Low wind day with maintenance
        if (hour === 10) {
          actualProduction *= 0.75; // Technical maintenance
        }
        // Grid balancing request
        if (hour >= 14 && hour <= 16) {
          actualProduction *= 0.85; // Moderate reduction for grid balancing
        }
      } else if (day.date === '1 Mar 2024') {
        // Storm protocol
        if (hour >= 11 && hour <= 15) {
          actualProduction *= 0.5; // Safety reduction during storm
        }
        // Grid congestion due to high regional wind production
        if (hour >= 16 && hour <= 19) {
          actualProduction *= 0.65; // Significant reduction due to grid overload
        }
      }
      
      // Energy prices with realistic patterns
      let basePrice = 45;
      const peakHours = (hour >= 9 && hour <= 12) || (hour >= 17 && hour <= 20);
      
      // Price adjustments based on market conditions
      if (day.marketPrices === 'negative_morning' && hour >= 3 && hour <= 6) {
        basePrice = -15; // Negative prices during low demand/high wind
      } else if (day.marketPrices === 'low') {
        basePrice *= 0.7; // Generally low price day
      } else if (day.marketPrices === 'volatile') {
        basePrice *= (1 + Math.sin(hour * Math.PI / 12) * 0.5); // High volatility
      }
      
      const price = basePrice + (peakHours ? 15 : 0) + (Math.random() * 10 - 5);
      
      return {
        hour: `${hour.toString().padStart(2, '0')}:00`,
        potentialProduction: Number(potentialProduction.toFixed(2)),
        actualProduction: Number(actualProduction.toFixed(2)),
        price: Number(price.toFixed(2)),
      };
    });

    return {
      date: day.date,
      data: hours,
      windConditions: day.windConditions,
      weatherEvent: day.weatherEvent,
    };
  });

  return dailyData;
};

export const allDaysData = generateMultiDayData();

// Production events for each day
export const productionEvents = {
  '27 Feb 2024': [
    {
      time: '12:00',
      duration: '2 hours',
      impact: -1.2,
      reason: 'TenneT balancing request',
      description: 'Voluntary production reduction at TenneT\'s request for grid balancing with compensation.',
      type: 'grid',
    },
  ],
  '28 Feb 2024': [
    {
      time: '03:00',
      duration: '4 hours',
      impact: -3.6,
      reason: 'Negative electricity prices',
      description: 'Production limitation due to negative prices in early morning. Resumed after price recovery.',
      type: 'grid',
    },
    {
      time: '08:00',
      duration: '4 hours',
      impact: -2.4,
      reason: 'Local grid congestion',
      description: 'Mandatory production limitation due to local power grid overload during peak hours.',
      type: 'grid',
    },
  ],
  '29 Feb 2024': [
    {
      time: '10:00',
      duration: '3 hours',
      impact: -1.8,
      reason: 'Planned maintenance',
      description: 'Regular inspection and maintenance of turbine control and safety systems.',
      type: 'maintenance',
    },
    {
      time: '14:00',
      duration: '3 hours',
      impact: -1.2,
      reason: 'Grid balancing APX',
      description: 'Strategic production limitation due to unfavorable day-ahead market prices.',
      type: 'grid',
    },
  ],
  '1 Mar 2024': [
    {
      time: '11:00',
      duration: '5 hours',
      impact: -4.2,
      reason: 'Storm protocol & Grid congestion',
      description: 'Preventive production limitation due to storm, followed by regional grid congestion from high wind production in the area.',
      type: 'weather',
    },
    {
      time: '16:00',
      duration: '4 hours',
      impact: -3.2,
      reason: 'Regional grid overload',
      description: 'Mandatory production limitation at grid operator\'s request due to high regional wind production.',
      type: 'grid',
    },
  ],
};

interface ProductionGraphProps {
  selectedDate: string;
}

export const ProductionGraph: React.FC<ProductionGraphProps> = ({ selectedDate }) => {
  const dayData = allDaysData.find(day => day.date === selectedDate)?.data || [];

  return (
    <div className="bg-white rounded-lg p-6">
      <h3 className="text-xl font-semibold mb-6">Production Overview</h3>
      
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={dayData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="hour"
              interval={2}
              tick={{ fill: '#666' }}
            />
            <YAxis
              yAxisId="power"
              domain={[0, 12]}
              tick={{ fill: '#666' }}
              label={{ value: 'Production (MW)', angle: -90, position: 'insideLeft', fill: '#666' }}
            />
            <YAxis
              yAxisId="price"
              orientation="right"
              domain={[0, 80]}
              tick={{ fill: '#666' }}
              label={{ value: 'Price (€/MWh)', angle: 90, position: 'insideRight', fill: '#666' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
              formatter={(value: number, name: string) => {
                if (name === 'price') return [`€${value}/MWh`, 'Price'];
                return [`${value} MW`, name === 'actualProduction' ? 'Actual' : 'Potential'];
              }}
            />
            <Legend />
            <Line
              yAxisId="power"
              type="monotone"
              dataKey="potentialProduction"
              stroke="#94A3B8"
              strokeDasharray="5 5"
              name="Potential"
              dot={false}
            />
            <Line
              yAxisId="power"
              type="monotone"
              dataKey="actualProduction"
              stroke="#2563EB"
              name="Actual"
              dot={false}
            />
            <Line
              yAxisId="price"
              type="monotone"
              dataKey="price"
              stroke="#22C55E"
              name="Price"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}; 