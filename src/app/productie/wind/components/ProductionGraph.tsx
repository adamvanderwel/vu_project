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
export const allDaysData = [
  { 
    date: '27 feb 2024', 
    data: Array.from({ length: 24 }, (_, i) => ({
      hour: `${String(i).padStart(2, '0')}:00`,
      actualProduction: 8 + Math.sin((i - 6) * (Math.PI / 12)) * 2 + (Math.random() * 2 - 1),
      potentialProduction: 9 + Math.sin((i - 6) * (Math.PI / 12)) * 2,
      price: 45 + Math.sin(i * Math.PI / 12) * 10
    }))
  },
  { 
    date: '28 feb 2024',
    data: Array.from({ length: 24 }, (_, i) => {
      let price = 45 + Math.sin(i * Math.PI / 12) * 10;
      let production = 8 + Math.sin((i - 6) * (Math.PI / 12)) * 2;
      
      // Negative prices in early morning
      if (i >= 3 && i <= 6) {
        price = -15 + Math.random() * 5;
        production *= 0.4; // Reduced production during negative prices
      }
      
      return {
        hour: `${String(i).padStart(2, '0')}:00`,
        actualProduction: production + (Math.random() * 2 - 1),
        potentialProduction: production * 1.2,
        price
      };
    })
  },
  { 
    date: '29 feb 2024',
    data: Array.from({ length: 24 }, (_, i) => ({
      hour: `${String(i).padStart(2, '0')}:00`,
      actualProduction: 6 + Math.sin((i - 6) * (Math.PI / 12)) * 1.5 + (Math.random() * 2 - 1),
      potentialProduction: 7 + Math.sin((i - 6) * (Math.PI / 12)) * 1.5,
      price: 35 + Math.sin(i * Math.PI / 12) * 8
    }))
  }
];

// Production events for each day
export const productionEvents = {
  '27 feb 2024': [
    {
      time: '12:00',
      duration: '2 uur',
      impact: -1.2,
      reason: 'TenneT balanceringsverzoek',
      description: 'Vrijwillige productieverlaging op verzoek van TenneT voor netbalancering tegen vergoeding.',
      type: 'grid',
    },
  ],
  '28 feb 2024': [
    {
      time: '03:00',
      duration: '4 uur',
      impact: -3.6,
      reason: 'Negatieve elektriciteitsprijzen',
      description: 'Productiebeperking vanwege negatieve prijzen in de vroege ochtend. Hervatting na prijsherstel.',
      type: 'grid',
    },
    {
      time: '08:00',
      duration: '4 uur',
      impact: -2.4,
      reason: 'Lokale netcongestie',
      description: 'Verplichte productiebeperking vanwege overbelasting van het lokale elektriciteitsnet tijdens piekuren.',
      type: 'grid',
    },
  ],
  '29 feb 2024': [
    {
      time: '10:00',
      duration: '3 uur',
      impact: -1.8,
      reason: 'Gepland onderhoud',
      description: 'Reguliere inspectie en onderhoud van de turbinebesturing en veiligheidssystemen.',
      type: 'maintenance',
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
      <h3 className="text-xl font-semibold mb-6">Productie Overzicht</h3>
      
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
              label={{ value: 'Productie (MW)', angle: -90, position: 'insideLeft', fill: '#666' }}
            />
            <YAxis
              yAxisId="price"
              orientation="right"
              domain={[-20, 80]}
              tick={{ fill: '#666' }}
              label={{ value: 'Prijs (€/MWh)', angle: 90, position: 'insideRight', fill: '#666' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
              formatter={(value: number, name: string) => {
                if (name === 'price') return [`€${value}/MWh`, 'Prijs'];
                return [`${value} MW`, name === 'actualProduction' ? 'Actueel' : 'Potentieel'];
              }}
            />
            <Legend />
            <Line
              yAxisId="power"
              type="monotone"
              dataKey="potentialProduction"
              stroke="#94A3B8"
              strokeDasharray="5 5"
              name="Potentieel"
              dot={false}
            />
            <Line
              yAxisId="power"
              type="monotone"
              dataKey="actualProduction"
              stroke="#2563EB"
              name="Actueel"
              dot={false}
            />
            <Line
              yAxisId="price"
              type="monotone"
              dataKey="price"
              stroke="#22C55E"
              name="Prijs"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}; 