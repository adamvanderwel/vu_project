import React from 'react';
import { Clock, AlertTriangle, Waves, Power } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProductionEvent {
  time: string;
  duration: string;
  impact: number;
  reason: string;
  description: string;
  type: 'maintenance' | 'grid' | 'weather';
}

interface ProductionEventsMap {
  [date: string]: ProductionEvent[];
}

import { productionEvents } from './ProductionGraph';

const getEventIcon = (type: 'maintenance' | 'grid' | 'weather') => {
  switch (type) {
    case 'maintenance':
      return Power;
    case 'grid':
      return AlertTriangle;
    case 'weather':
      return Waves;
    default:
      return AlertTriangle;
  }
};

const getEventColor = (type: 'maintenance' | 'grid' | 'weather') => {
  switch (type) {
    case 'maintenance':
      return 'text-blue-500 bg-blue-50';
    case 'grid':
      return 'text-yellow-500 bg-yellow-50';
    case 'weather':
      return 'text-purple-500 bg-purple-50';
    default:
      return 'text-gray-500 bg-gray-50';
  }
};

interface ProductionEventsProps {
  selectedDate: string;
}

export const ProductionEvents: React.FC<ProductionEventsProps> = ({ selectedDate }) => {
  const dayEvents = (productionEvents as ProductionEventsMap)[selectedDate] || [];
  
  return (
    <div className="bg-white rounded-lg p-6">
      <h3 className="text-xl font-semibold mb-6">Productie Events</h3>
      
      <div className="space-y-4">
        {dayEvents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Geen events op deze dag
          </div>
        ) : (
          dayEvents.map((event: ProductionEvent, index: number) => {
            const Icon = getEventIcon(event.type);
            const colorClass = getEventColor(event.type);
            
            return (
              <motion.div
                key={index}
                className="border rounded-lg p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${colorClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{event.reason}</h4>
                      <span className="text-red-500 text-sm">
                        {event.impact} MW
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mt-1">
                      {event.description}
                    </p>
                    
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{event.time}</span>
                      </div>
                      <div>
                        Duur: {event.duration}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
      
      {dayEvents.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <AlertTriangle className="w-4 h-4" />
            <span>
              Totale productievermindering vandaag: {Math.abs(dayEvents.reduce((acc: number, event: ProductionEvent) => acc + event.impact, 0)).toFixed(1)} MW
            </span>
          </div>
        </div>
      )}
    </div>
  );
}; 