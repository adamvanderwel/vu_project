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

// Generate realistic solar power data for multiple days
export const allDaysData = [
  { 
    date: '27 feb 2024',
    data: Array.from({ length: 24 }, (_, i) => {
      // Solar production follows a bell curve during daylight hours
      const hour = i;
      const isDaylight = hour >= 8 && hour <= 17; // February daylight hours
      const peakHour = 12.5; // Peak production around 12:30 PM
      let production = 0;
      let price = 45;

      if (isDaylight) {
        // Bell curve calculation for solar production
        production = 12 * Math.exp(-Math.pow(hour - peakHour, 2) / 10);
        // Prices tend to be lower during peak solar hours
        price = 55 - (production / 2) + (Math.random() * 5);
      } else {
        // Night time prices are typically higher
        price = 60 + (Math.random() * 10);
      }

      return {
        hour: `${String(i).padStart(2, '0')}:00`,
        actualProduction: Math.max(0, production * (0.95 + Math.random() * 0.1)), // Small random variations
        potentialProduction: Math.max(0, production),
        price
      };
    })
  },
  { 
    date: '28 feb 2024',
    data: Array.from({ length: 24 }, (_, i) => {
      const hour = i;
      const isDaylight = hour >= 8 && hour <= 17;
      const peakHour = 12.5;
      let production = 0;
      let price = 45;

      if (isDaylight) {
        production = 12 * Math.exp(-Math.pow(hour - peakHour, 2) / 10);
        
        // Simulate grid congestion during peak solar hours
        if (hour >= 11 && hour <= 15) {
          // During peak hours, prices drop significantly
          price = Math.max(-20, 10 - (production / 2) + (Math.random() * 15));
          // Production is curtailed due to grid constraints
          production *= 0.6;
        } else {
          price = 50 - (production / 3) + (Math.random() * 5);
        }
      } else {
        price = 65 + (Math.random() * 10);
      }

      return {
        hour: `${String(i).padStart(2, '0')}:00`,
        actualProduction: Math.max(0, production * (0.95 + Math.random() * 0.1)),
        potentialProduction: Math.max(0, production),
        price
      };
    })
  },
  { 
    date: '29 feb 2024',
    data: Array.from({ length: 24 }, (_, i) => {
      const hour = i;
      const isDaylight = hour >= 8 && hour <= 17;
      const peakHour = 12.5;
      let production = 0;
      let price = 45;

      if (isDaylight) {
        // Simulate a cloudy day with reduced production
        production = 12 * Math.exp(-Math.pow(hour - peakHour, 2) / 10);
        // Cloud impact varies throughout the day
        const cloudImpact = 0.3 + (Math.random() * 0.2); // 30-50% of normal production
        production *= cloudImpact;
        
        // Prices are higher due to lower solar production
        price = 65 - (production / 2) + (Math.random() * 8);
      } else {
        price = 70 + (Math.random() * 10);
      }

      return {
        hour: `${String(i).padStart(2, '0')}:00`,
        actualProduction: Math.max(0, production * (0.95 + Math.random() * 0.1)),
        potentialProduction: Math.max(0, production),
        price
      };
    })
  }
];

// Production events for each day
export const productionEvents = {
  '27 feb 2024': [
    {
      time: '13:00',
      duration: '2 uur',
      impact: -2.5,
      reason: 'TenneT balanceringsverzoek',
      description: 'Vrijwillige productieverlaging op verzoek van TenneT voor netbalancering tijdens piek zonne-uren.',
      type: 'grid',
    },
  ],
  '28 feb 2024': [
    {
      time: '11:00',
      duration: '4 uur',
      impact: -4.0,
      reason: 'Netcongestie & Negatieve Prijzen',
      description: 'Productiebeperking vanwege lokale netcongestie en negatieve elektriciteitsprijzen tijdens piekproductie.',
      type: 'grid',
    },
    {
      time: '15:30',
      duration: '2 uur',
      impact: -1.8,
      reason: 'Dynamic Curtailment',
      description: 'Slimme sturing toegepast voor optimalisatie van netbelasting en marktprijzen.',
      type: 'grid',
    },
  ],
  '29 feb 2024': [
    {
      time: '09:00',
      duration: '3 uur',
      impact: -1.2,
      reason: 'Omvormer Onderhoud',
      description: 'Gepland onderhoud aan omvormers en monitoring systemen.',
      type: 'maintenance',
    },
    {
      time: '12:00',
      duration: '4 uur',
      impact: -3.5,
      reason: 'Bewolking',
      description: 'Verminderde productie door zware bewolking en regenval.',
      type: 'weather',
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
              stroke="#EAB308"
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