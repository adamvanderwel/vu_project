import React from 'react';
import { Clock, AlertTriangle, Cloud, Power } from 'lucide-react';
import { motion } from 'framer-motion';
import { productionEvents } from './ProductionGraph';
import { ProductionEvent, ProductionEventsMap } from '@/types';

interface ProductionEventsProps {
  selectedDate: string;
}

const getEventIcon = (type: 'maintenance' | 'grid' | 'weather') => {
  switch (type) {
    case 'maintenance':
      return Power;
    case 'grid':
      return AlertTriangle;
    case 'weather':
      return Cloud;
    default:
      return AlertTriangle;
  }
};

const getEventColorClass = (type: 'maintenance' | 'grid' | 'weather') => {
  switch (type) {
    case 'maintenance':
      return 'bg-blue-100 text-blue-500';
    case 'grid':
      return 'bg-orange-100 text-orange-500';
    case 'weather':
      return 'bg-purple-100 text-purple-500';
    default:
      return 'bg-gray-100 text-gray-500';
  }
};

export const ProductionEvents: React.FC<ProductionEventsProps> = ({ selectedDate }) => {
  const dayEvents = (productionEvents as ProductionEventsMap)[selectedDate] || [];

  return (
    <div className="bg-white rounded-lg p-6">
      <h3 className="text-xl font-semibold mb-6">Production Events</h3>
      
      <div className="space-y-4">
        {dayEvents.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            No events for this day
          </div>
        ) : (
          dayEvents.map((event: ProductionEvent, index: number) => {
            const Icon = getEventIcon(event.type);
            const colorClass = getEventColorClass(event.type);

            return (
              <motion.div
                key={index}
                className="bg-white rounded-lg p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
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
                        Duration: {event.duration}
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
              Total production reduction today: {Math.abs(dayEvents.reduce((acc: number, event: ProductionEvent) => acc + event.impact, 0)).toFixed(1)} MW
            </span>
          </div>
        </div>
      )}
    </div>
  );
}; 