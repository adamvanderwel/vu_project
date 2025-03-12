import React, { useState } from 'react';
import { Clock, AlertTriangle, Waves, Power, CalendarDays, Zap, Cloud, Droplets, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { productionEvents, findDayDataByDate, eventTypes } from './ProductionGraph';
import { format, parseISO } from 'date-fns';
import { nl } from 'date-fns/locale';
import { ProductionEvent, ProductionEventsMap } from '../../../../types';

// Define event types and their characteristics for consistent styling
const eventIconMap = {
  'grid': Zap,
  'weather': Cloud,
  'maintenance': Power,
  'environmental': Droplets,
  'technical': AlertTriangle
};

const eventColorMap = {
  'grid': 'text-orange-500 bg-orange-100',
  'weather': 'text-purple-500 bg-purple-100',
  'maintenance': 'text-blue-500 bg-blue-100',
  'environmental': 'text-green-500 bg-green-100',
  'technical': 'text-red-500 bg-red-100'
};

// Define comprehensive set of predefined events for better coverage
const predefinedEvents = {
  grid: [
    {
      reason: "Grid Constraint",
      descriptions: [
        "Grid operator requested power reduction due to local congestion",
        "Negative electricity prices triggered automatic power reduction",
        "Grid balancing service activated - compensated curtailment",
        "Regional transmission constraint requiring power limitation",
        "Grid frequency regulation required power curtailment",
        "Electricity network maintenance caused temporary disconnection"
      ]
    }
  ],
  weather: [
    {
      reason: "Solar Irradiance Issue",
      descriptions: [
        "Cloud cover reducing solar irradiance below optimal threshold",
        "Dust storm affecting panel efficiency and light absorption",
        "Haze from nearby wildfires reducing solar intensity",
        "High temperature affecting panel efficiency",
        "Snow accumulation on panels reducing light absorption",
        "Heavy rain reducing solar exposure and efficiency"
      ]
    },
    {
      reason: "Environmental Condition",
      descriptions: [
        "High temperatures affecting inverter performance",
        "Heavy rain requiring system protection mode",
        "Thunderstorm in vicinity causing precautionary shutdown",
        "High humidity affecting electronic systems",
        "Dense fog interfering with remote monitoring systems",
        "Dust accumulation reducing panel efficiency"
      ]
    }
  ],
  maintenance: [
    {
      reason: "Routine Maintenance",
      descriptions: [
        "Scheduled panel cleaning operation",
        "Inverter maintenance and calibration",
        "Software update requiring partial power reduction",
        "Connection point inspection and maintenance",
        "Annual certification and safety check in progress",
        "Preventative panel alignment adjustment"
      ]
    },
    {
      reason: "Performance Optimization",
      descriptions: [
        "Panel angle optimization for seasonal adjustment",
        "Power conversion efficiency testing",
        "Control system fine-tuning for improved response",
        "Tracking system calibration for optimal sun exposure",
        "Efficiency testing requiring controlled operation",
        "Remote diagnostic review with manufacturer"
      ]
    }
  ],
  environmental: [
    {
      reason: "Wildlife Protection",
      descriptions: [
        "Wildlife corridor protection around solar arrays",
        "Noise reduction during evening hours - community agreement",
        "Protected species habitat monitoring in solar farm area",
        "Local ecosystem protection measures during sensitive periods",
        "Solar farm perimeter environmental buffer management",
        "Environmental compliance monitoring during nesting season"
      ]
    },
    {
      reason: "Weather Safety System",
      descriptions: [
        "Overheating protection mode activated",
        "Shadow pattern optimization during low sunlight",
        "Lightning protection system activation during storm",
        "Flood risk preventative measures activated",
        "Extreme temperature protective mode engaged",
        "Storm protection system activated to secure panel arrays"
      ]
    }
  ],
  technical: [
    {
      reason: "System Alert",
      descriptions: [
        "Inverter temperature high - automatic power reduction",
        "Control system fault requiring manual intervention",
        "DC-AC conversion issue limiting output capacity",
        "Grid synchronization issue requiring power reduction",
        "Voltage regulation anomaly causing output limitation",
        "Sensor data anomaly requiring diagnostic mode"
      ]
    },
    {
      reason: "Component Monitoring",
      descriptions: [
        "Inverter cooling system operating at reduced capacity",
        "Power converter requiring maintenance",
        "Panel connection issues detected in section B4",
        "Monitoring system calibration in progress",
        "String failure detected in eastern array",
        "Junction box temperature fluctuation investigation"
      ]
    }
  ]
};

// Need to extend the ProductionEvent type with these additional properties
interface ExtendedProductionEvent extends ProductionEvent {
  hour?: number;
  eventTypeData?: {
    icon: any;
    color: string;
    bgColor: string;
  };
}

interface ProductionEventsProps {
  selectedDate?: string;
  selectedDates?: Date[];
  selectedHour?: number;
  selectedEventId?: number;
}

// Helper function to parse a date string like "27 Feb 2024"
const parseDateString = (dateStr: string): Date => {
  try {
    // Try standard date-fns parse
    const parts = dateStr.split(' ');
    const day = parseInt(parts[0], 10);
    const monthStr = parts[1];
    const year = parseInt(parts[2], 10);
    
    // Map month names to month numbers
    const monthMap: {[key: string]: number} = {
      'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
      'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };
    
    const month = monthMap[monthStr];
    if (month === undefined) {
      throw new Error(`Invalid month: ${monthStr}`);
    }
    
    return new Date(year, month, day);
  } catch (error) {
    console.error(`Error parsing date string: ${dateStr}`, error);
    return new Date(); // Return current date as fallback
  }
};

// Generate a deterministic random event based on hour and date
const generateDeterministicEvent = (hour: number, date?: Date): ExtendedProductionEvent => {
  // Create a deterministic seed from hour and date
  const dateSeed = date ? date.getDate() + (date.getMonth() * 31) : 0;
  const seed = (hour + 1) * (dateSeed + 1);
  
  // Use the seed to deterministically select an event type
  const eventTypes: ProductionEvent['type'][] = ['grid', 'maintenance', 'weather', 'technical', 'environmental'];
  const eventType = eventTypes[seed % eventTypes.length];
  
  // Use the seed to select a reason based on the event type
  const eventCategory = predefinedEvents[eventType as keyof typeof predefinedEvents] || predefinedEvents.grid;
  const reasonData = eventCategory[seed % eventCategory.length];
  
  // Select a description based on the seed
  const descriptions = reasonData.descriptions;
  const description = descriptions[seed % descriptions.length];
  
  // Create an impact percentage based on hour (more severe in peak hours)
  const impactBase = 5 + (hour >= 10 && hour <= 18 ? 10 : 0);
  const impact = impactBase + (seed % 15);
  
  // Create a consistent event
  return {
    time: `${hour}:00`,
    duration: `${30 + (seed % 90)} min`,
    impact,
    reason: reasonData.reason,
    description,
    type: eventType,
    hour
  };
};

export const ProductionEvents: React.FC<ProductionEventsProps> = ({ 
  selectedDate, 
  selectedDates, 
  selectedHour,
  selectedEventId 
}) => {
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [localSelectedEvent, setLocalSelectedEvent] = useState<any>(null);
  
  // Get events for a single day, ensuring we have valid events
  const getSingleDayEvents = (): ExtendedProductionEvent[] => {
    if (!selectedDate) return [];
    
    // First try to get events from our pre-generated map
    let events = (productionEvents as ProductionEventsMap)[selectedDate] || [] as ExtendedProductionEvent[];
    
    // If no events were found, generate a new day's data with guaranteed events
    if (events.length === 0) {
      try {
        const date = parseDateString(selectedDate);
        const dayData = findDayDataByDate(date);
        if (dayData && dayData.events) {
          events = dayData.events as ExtendedProductionEvent[];
        }
      } catch (error) {
        console.error('Error getting events for date', error);
      }
    }
    
    // Filter by selected hour if specified
    if (selectedHour !== undefined) {
      events = events.filter((event: ExtendedProductionEvent) => {
        const eventHour = event.hour || parseInt(event.time.split(':')[0], 10);
        return eventHour === selectedHour;
      });
      
      // If no events for this specific hour, generate one deterministically
      if (events.length === 0) {
        try {
          const date = selectedDate ? parseDateString(selectedDate) : undefined;
          const hourEvent: ExtendedProductionEvent = {
            ...generateDeterministicEvent(selectedHour, date),
            hour: selectedHour
          };
          events = [hourEvent];
        } catch (error) {
          console.error('Error generating event', error);
          // Fallback to a simple event if error occurs
          events = [{
            time: `${String(selectedHour).padStart(2, '0')}:00`,
            duration: '1 hour',
            impact: -0.8,
            reason: 'System Alert',
            description: 'Temporary power reduction due to system diagnostics',
            type: 'technical',
            hour: selectedHour
          }];
        }
      }
    }
    
    return events;
  };
  
  // Get events for multiple days, ensuring we have valid events
  const getMultipleDaysEvents = (): Array<ExtendedProductionEvent & { date: string }> => {
    if (!selectedDates || selectedDates.length === 0) return [];
    
    const allEvents: Array<ExtendedProductionEvent & { date: string }> = [];
    
    selectedDates.forEach(date => {
      const dateString = format(date, 'd MMM yyyy', { locale: nl });
      
      // First try to get events from our pre-generated map
      let dayEvents = (productionEvents as ProductionEventsMap)[dateString] || [];
      
      // If no events were found, generate new data with guaranteed events
      if (dayEvents.length === 0) {
        const dayData = findDayDataByDate(date);
        if (dayData && dayData.events) {
          dayEvents = dayData.events as ExtendedProductionEvent[];
        }
      }
      
      // Ensure each day has events by generating some if needed
      if (dayEvents.length === 0) {
        // Generate 2-4 events for this day
        const eventCount = 2 + Math.floor(Math.random() * 3);
        const hours = Array.from({ length: 24 }, (_, i) => i)
          .sort(() => Math.random() - 0.5)
          .slice(0, eventCount);
          
        dayEvents = hours.map(hour => generateDeterministicEvent(hour, date));
      }
      
      // Add each event with the date it occurred
      dayEvents.forEach(event => {
        allEvents.push({
          ...event,
          date: format(date, 'd MMM', { locale: nl })
        });
      });
    });
    
    return allEvents;
  };
  
  const useMultipleDays = selectedDates && selectedDates.length > 1;
  const events = useMultipleDays ? getMultipleDaysEvents() : getSingleDayEvents();

  // Calculate summary statistics
  const totalImpact = events.reduce((acc, event) => acc + parseFloat(event.impact.toString()), 0);
  const eventsGroupedByType = events.reduce((acc, event) => {
    const type = event.type || 'unknown';
    if (!acc[type]) acc[type] = [];
    acc[type].push(event);
    return acc;
  }, {} as { [key: string]: ExtendedProductionEvent[] });

  // Sort events chronologically by hour
  const sortedEvents = [...events].sort((a, b) => {
    const hourA = a.hour !== undefined ? a.hour : parseInt(a.time.split(':')[0]);
    const hourB = b.hour !== undefined ? b.hour : parseInt(b.time.split(':')[0]);
    
    // For multiday view, sort by date first, then by time
    if (useMultipleDays && 'date' in a && 'date' in b) {
      // Extract day numbers from date strings (e.g. "14 mrt." -> 14)
      const dayA = parseInt((a as any).date.split(' ')[0], 10);
      const dayB = parseInt((b as any).date.split(' ')[0], 10);
      
      // If days are different, sort by day
      if (dayA !== dayB) {
        return dayA - dayB;
      }
    }
    
    // If same day or single day view, sort by hour
    return hourA - hourB;
  });

  // Find the selected event if any
  const selectedEvent = selectedEventId !== undefined && selectedEventId < events.length
    ? events[selectedEventId]
    : (selectedHour !== undefined && events.find(e => {
        const eventHour = e.hour || parseInt(e.time.split(':')[0]);
        return eventHour === selectedHour;
      }));

  // Set the local selected event when the prop changes
  React.useEffect(() => {
    setLocalSelectedEvent(selectedEvent);
  }, [selectedEvent]);

  // No events message - this should almost never happen now with our improved event generation
  if (events.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <h3 className="text-xl font-semibold">Production Events</h3>
          <span className="text-sm text-gray-500">
            {selectedHour !== undefined 
              ? `${String(selectedHour).padStart(2, '0')}:00` 
              : (useMultipleDays ? `${selectedDates!.length} days` : selectedDate)}
          </span>
        </div>
        
        <div className="text-gray-500 text-center py-12 border border-dashed border-gray-200 rounded-lg">
          <AlertTriangle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p>No production events recorded during this period.</p>
          <p className="text-sm mt-2">All solar panels operated at optimal capacity.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header and Event Count */}
      <div className="mb-7">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-blue-500" />
            <h3 className="text-xl font-bold text-gray-800">
              Production Events
              <span className="ml-2 text-sm text-gray-500 font-normal">
                ({events.length} events)
              </span>
            </h3>
          </div>
          <div className="text-sm font-semibold text-red-500 bg-red-50 px-3 py-1 rounded-full">
            Total impact: {Math.abs(totalImpact).toFixed(1)} MW
          </div>
        </div>
      </div>
      
      {/* Event type grid layout - exactly matching the screenshot */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {Object.entries(eventsGroupedByType).map(([type, typeEvents]) => {
          const colorClass = eventColorMap[type as keyof typeof eventColorMap] || 'text-gray-500 bg-gray-100';
          const Icon = eventIconMap[type as keyof typeof eventIconMap] || AlertTriangle;
          const typeImpact = typeEvents.reduce((acc, event) => acc + parseFloat(event.impact.toString()), 0);
          
          return (
            <div key={type} className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className={`p-3 rounded-full ${colorClass.split(' ')[1]} flex-shrink-0`}>
                <Icon className={`w-6 h-6 ${colorClass.split(' ')[0]}`} />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">{type.charAt(0).toUpperCase() + type.slice(1)} Events</h4>
                <div className="text-sm text-gray-600 mt-0.5">
                  {typeEvents.length} {typeEvents.length === 1 ? 'event' : 'events'} • {Math.abs(typeImpact).toFixed(1)} MW impact
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Bottom summary statistics - NOW POSITIONED HERE AFTER EVENT TYPES */}
      <div className="mb-8">
        <div className="bg-gray-50 rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="flex items-center gap-2 text-gray-700 font-medium">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <span>Total lost production: {Math.abs(totalImpact).toFixed(1)} MW</span>
          </div>
          
          <div className="mt-2 md:mt-0 text-gray-500">
            Lost production represents {Math.round(Math.abs(totalImpact) / (events.length * 8) * 100)}% of potential capacity during affected periods
          </div>
        </div>
      </div>
      
      {/* Selected event section - shown only when an event is selected */}
      {localSelectedEvent && (
        <div className="my-6">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-semibold text-sm text-blue-700 uppercase tracking-wide">Selected Event</h4>
            <button 
              onClick={() => setLocalSelectedEvent(null)} 
              className="p-1 rounded-full hover:bg-blue-100 transition-colors"
              aria-label="Close selected event"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="bg-blue-50 rounded-lg border border-blue-100 overflow-hidden">
            {renderEventCard(localSelectedEvent, true)}
          </div>
        </div>
      )}
      
      {/* All Events Collapsible Section with uppercase title and border */}
      <div className="my-6">
        <div className="border-t border-gray-200 py-3">
          <button 
            onClick={() => setShowAllEvents(!showAllEvents)}
            className="flex items-center justify-between w-full px-1 py-1 text-gray-700 hover:text-gray-900 group"
          >
            <span className="font-bold text-sm text-gray-600 uppercase tracking-wide">
              ALL EVENTS ({events.length}) IN CHRONOLOGICAL ORDER
            </span>
            <div className="bg-gray-100 group-hover:bg-gray-200 rounded-full p-1 transition-colors">
              {showAllEvents ? 
                <ChevronUp className="w-5 h-5 text-gray-500" /> : 
                <ChevronDown className="w-5 h-5 text-gray-500" />
              }
            </div>
          </button>
        </div>
        
        {showAllEvents && (
          <div className="mt-4 space-y-3">
            {sortedEvents.map((event, index) => renderEventCard(event))}
          </div>
        )}
      </div>
    </div>
  );
  
  function renderEventCard(event: any, isHighlighted = false) {
    const type = event.type || 'unknown';
    const colorClass = eventColorMap[type as keyof typeof eventColorMap] || 'text-gray-500 bg-gray-100';
    const Icon = event.eventTypeData?.icon || eventIconMap[type as keyof typeof eventIconMap] || AlertTriangle;

    return (
      <div
        key={`event-${event.hour}-${event.type}`}
        className={`p-4 ${isHighlighted ? '' : 'border border-gray-100 rounded-lg shadow-sm'}`}
      >
        <div className="flex items-start gap-4">
          <div className={`p-2 rounded-full ${colorClass.split(' ')[1]} flex-shrink-0`}>
            <Icon className={`w-5 h-5 ${colorClass.split(' ')[0]}`} />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{event.reason}</h4>
              <span className="text-red-500 font-medium whitespace-nowrap">
                {event.impact} MW
              </span>
            </div>
            
            <p className="text-gray-600 text-sm mt-1">
              {event.description}
            </p>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center">
                Duration: {event.duration}
              </div>
              {useMultipleDays && event.date && (
                <div className="flex items-center gap-1">
                  <CalendarDays className="w-4 h-4" />
                  <span>{event.date}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}; 