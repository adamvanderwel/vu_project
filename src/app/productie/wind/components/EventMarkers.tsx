import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface EventMarkersProps {
  events: any[];
  onEventClick: (event: any) => void;
  chartWidth: number;
  chartHeight: number;
  type: 'hourly' | 'daily';
  // X coordinates are in percentage (0-100) of chart width
  xCoordinates: { [key: string]: number };
}

/**
 * A component that renders event markers separate from the chart
 * This avoids issues with chart re-rendering when clicking on events
 */
export const EventMarkers: React.FC<EventMarkersProps> = ({ 
  events, 
  onEventClick, 
  chartWidth, 
  chartHeight,
  type,
  xCoordinates 
}) => {
  if (!events || events.length === 0 || !chartWidth || !chartHeight) {
    return null;
  }

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
      {events.map((event, index) => {
        // For hourly view, use the hour as the key
        // For daily view, use the date string as the key
        const key = type === 'hourly' ? event.time : event.date;
        const xPosition = xCoordinates[key] || 0;
        
        // Skip if we don't have a position for this event
        if (!xPosition) return null;
        
        // Position in the bottom third of the chart
        const yPosition = chartHeight * 0.75;
        
        return (
          <div 
            key={`marker-${index}-${key}`}
            className="absolute pointer-events-auto cursor-pointer"
            style={{
              left: `${xPosition}%`,
              top: `${yPosition}px`,
              transform: 'translate(-50%, -50%)',
            }}
            onClick={() => onEventClick(event)}
          >
            <div className="text-red-500 text-xl">⚠</div>
          </div>
        );
      })}
    </div>
  );
}; 