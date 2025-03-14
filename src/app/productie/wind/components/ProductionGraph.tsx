import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  Label,
} from 'recharts';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { InfoTooltip } from './InfoTooltip';
import {
  AlertTriangle,
  Wind,
  Zap,
  Cloud,
  Clock,
  Droplets,
  ThermometerSnowflake,
  BarChart2,
  ChevronRight
} from 'lucide-react';
import { EventMarkers } from './EventMarkers';
import { ProductionEvents } from './ProductionEvents';

// Define event types and their characteristics
const eventTypes = [
  {
    type: 'grid',
    name: 'Grid Constraint',
    icon: Zap,
    color: 'text-orange-500',
    bgColor: 'bg-orange-100',
    descriptions: [
      'Grid operator requested power reduction due to local congestion',
      'Negative electricity prices triggered automatic power reduction',
      'Grid balancing service activated - compensated curtailment',
      'Regional transmission constraint requiring power limitation'
    ]
  },
  {
    type: 'weather',
    name: 'Weather Event',
    icon: Cloud,
    color: 'text-purple-500',
    bgColor: 'bg-purple-100',
    descriptions: [
      'High wind speeds exceeding safety threshold - automatic reduction',
      'Rapid wind direction change causing yaw misalignment',
      'Turbulence from weather front reducing effective power capture',
      'Low temperatures affecting turbine performance'
    ]
  },
  {
    type: 'maintenance',
    name: 'Maintenance',
    icon: Wind,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100',
    descriptions: [
      'Scheduled preventive maintenance - blade inspection',
      'Unscheduled maintenance - sensor recalibration',
      'Software update requiring partial power reduction',
      'Gear box inspection after vibration alert'
    ]
  },
  {
    type: 'environmental',
    name: 'Environmental',
    icon: Droplets,
    color: 'text-green-500',
    bgColor: 'bg-green-100',
    descriptions: [
      'Bird migration protection - temporary reduction',
      'Noise reduction during evening hours - community agreement',
      'Ice detection causing automatic power reduction',
      'Shadow flicker mitigation for nearby properties'
    ]
  },
  {
    type: 'technical',
    name: 'Technical',
    icon: AlertTriangle,
    color: 'text-red-500',
    bgColor: 'bg-red-100',
    descriptions: [
      'Transformer temperature high - automatic power reduction',
      'Control system fault requiring manual intervention',
      'Pitch system calibration causing temporary limitation',
      'Grid synchronization issue requiring power reduction'
    ]
  }
];

// Helper to generate a random event
export const generateRandomEvent = (hour: number, impactSeverity: number) => {
  const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
  const description = eventType.descriptions[Math.floor(Math.random() * eventType.descriptions.length)];
  const duration = Math.floor(Math.random() * 3) + 1; // 1-3 hours
  
  return {
    time: `${String(hour).padStart(2, '0')}:00`,
    duration: `${duration} hour${duration > 1 ? 's' : ''}`,
    impact: -(impactSeverity * (0.5 + Math.random())).toFixed(1),
    reason: `${eventType.name}`,
    description: description,
    type: eventType.type,
    eventTypeData: eventType,
    hour: hour
  };
};

// Define the types needed for the production events
interface DayData {
  date: string;
  dateObj: Date;
  data: Array<{
    hour: string;
    actualProduction: number;
    potentialProduction: number;
    price: number;
    percentOfCapacity: number;
    event: boolean;
  }>;
  events: ProductionEvent[];
}

interface ProductionEvent {
  time: string;
  duration: string;
  impact: number | string;
  reason: string;
  description: string;
  type: string;
  hour: number;
  eventTypeData?: any;
}

// Define the type for the production events map
type ProductionEventsMap = {
  [date: string]: ProductionEvent[];
};

// First, define the function to generate realistic day data
const generateRealisticDayData = (date: Date, baseProduction = 8, variability = 0.3) => {
  // Create a weather pattern for the day (common to all hours)
  const dayWeatherPattern = Math.random();
  const isStormy = dayWeatherPattern > 0.75;
  const isCalm = dayWeatherPattern < 0.2;
  const hasNegativePrices = Math.random() > 0.65;
  
  // Determine how many events to create (for demos, create more events)
  // For demonstration purposes, we'll create more events than in a real system
  const eventsToCreate = 5 + Math.floor(Math.random() * 6); // 5-10 events
  
  // Pick random hours for events, ensuring good spread
  const eventHours = new Set<number>(); 
  
  // Always include hours 2, 9, and 14 for demonstration consistency
  [2, 9, 14].forEach(hour => eventHours.add(hour));
  
  // Add additional random hours
  while (eventHours.size < eventsToCreate) {
    const hour = Math.floor(Math.random() * 24);
    eventHours.add(hour);
  }
  
  // Generate events for each selected hour
  const events = Array.from(eventHours).map(hour => {
    // Different event types for different parts of the day
    let eventSeverity: number;
    
    // Set severity based on time of day and conditions
    if (hour >= 22 || hour <= 5) {
      // Night hours - often low demand related
      eventSeverity = hasNegativePrices ? 1.5 : 0.7;
    } else if (hour >= 10 && hour <= 16) {
      // Peak hours - often environmental or technical
      eventSeverity = isStormy ? 2.0 : 1.0;
    } else {
      // Shoulder hours - often maintenance
      eventSeverity = 0.8;
    }
    
    // Create a simple event
    return {
      time: `${String(hour).padStart(2, '0')}:00`,
      duration: `${1 + Math.floor(Math.random() * 3)} hour${Math.random() > 0.5 ? 's' : ''}`,
      impact: -eventSeverity.toFixed(1),
      reason: getRandomEventReason(),
      description: getRandomEventDescription(),
      type: getRandomEventType(),
      hour: hour
    };
  });

  // Create at least one TenneT curtailment event for EVERY day to ensure it's always present
  const curtailmentHour = events.find(e => e.hour === 11)?.hour || 11;
  
  // Find and remove any existing event at this hour
  const existingEventIndex = events.findIndex(e => e.hour === curtailmentHour);
  if (existingEventIndex !== -1) {
    events.splice(existingEventIndex, 1);
  }
  
  // Add the primary TenneT curtailment event
  const severityMultiplier = 1.5 + Math.random();
  const impactValue = -(severityMultiplier).toFixed(1);
  const duration = `${2 + Math.floor(Math.random() * 3)} hours`;
  
  // Create a specific TenneT curtailment event with clear wording to ensure detection
  events.push({
    time: `${String(curtailmentHour).padStart(2, '0')}:00`,
    duration: duration,
    impact: impactValue,
    reason: "TenneT Grid Curtailment",
    description: "Grid operator TenneT requested power curtailment due to transmission congestion",
    type: "grid",
    hour: curtailmentHour
  });
  
  // Add extra curtailment events to specific dates to create more variation and test scenarios
  // More curtailment events on weekends and specific dates when grid congestion is common
  const month = date.getMonth();
  const day = date.getDate();
  const dayOfWeek = date.getDay(); // 0 is Sunday, 6 is Saturday
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  
  // Add more frequent curtailment events during weekends (when industrial demand is lower)
  // and on specific high-congestion dates
  if (isWeekend || 
      (month === 1 && day === 28) || 
      (month === 2 && (day === 3 || day === 7 || day === 11 || day === 15 || day === 23)) ||
      (month === 3 && (day === 5 || day === 12 || day === 19 || day === 26))) {
    
    // Weekend or congestion-prone days get 2-3 additional curtailment events
    const additionalCurtailmentHours = [4, 18, 22].filter(h => !events.some(e => e.hour === h));
    
    additionalCurtailmentHours.slice(0, 2 + Math.floor(Math.random() * 2)).forEach(hour => {
      const curtailmentSeverity = 1.8 + Math.random();
      const curtailmentImpact = -(curtailmentSeverity).toFixed(1);
      const curtailmentDuration = `${2 + Math.floor(Math.random() * 3)} hours`;
      
      // Add more TenneT curtailment events with various reasons for realism
      const curtailmentReasons = [
        "TenneT Grid Curtailment",
        "TenneT Transmission Congestion",
        "TenneT Congestion Management",
        "TenneT Grid Balancing Order"
      ];
      
      const curtailmentDescriptions = [
        "Grid operator TenneT requested power curtailment due to transmission congestion",
        "TenneT issued a congestion management order due to regional grid constraints",
        "Wind production reduced at TenneT's request - compensated curtailment",
        "Grid stability measures required temporary production reduction per TenneT"
      ];
      
      const reasonIndex = Math.floor(Math.random() * curtailmentReasons.length);
      
      events.push({
        time: `${String(hour).padStart(2, '0')}:00`,
        duration: curtailmentDuration,
        impact: curtailmentImpact,
        reason: curtailmentReasons[reasonIndex],
        description: curtailmentDescriptions[reasonIndex],
        type: "grid",
        hour: hour
      });
    });
  }
  
  // Helper functions for event generation
  function getRandomEventType() {
    // Increase likelihood of grid events to better demonstrate the financial compensation features
    const types = ['grid', 'grid', 'weather', 'maintenance', 'environmental', 'technical'];
    return types[Math.floor(Math.random() * types.length)];
  }
  
  function getRandomEventReason() {
    const reasons = {
      'grid': ['Grid Constraint', 'Frequency Regulation', 'Grid Curtailment Order', 'TenneT Transmission Congestion'],
      'weather': ['Wind Speed Issue', 'Environmental Condition'],
      'maintenance': ['Routine Maintenance', 'Performance Optimization'],
      'environmental': ['Wildlife Protection', 'Weather Safety System'],
      'technical': ['System Alert', 'Component Monitoring']
    };
    const type = getRandomEventType();
    const typeReasons = reasons[type as keyof typeof reasons];
    return typeReasons[Math.floor(Math.random() * typeReasons.length)];
  }
  
  function getRandomEventDescription() {
    const descriptions = [
      'Grid operator requested power reduction due to local congestion',
      'Negative electricity prices triggered automatic power reduction',
      'High wind speeds exceeding safety threshold - automatic reduction',
      'Scheduled preventive maintenance - blade inspection',
      'Bird migration protection - temporary reduction',
      'Transformer temperature high - automatic power reduction'
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }
  
  // Basic hourly pattern with natural variations
  const hourlyData = Array.from({ length: 24 }, (_, hour) => {
    // Time of day variations - wind tends to be stronger in afternoon/evening
    const timeOfDayFactor = 1 + 0.3 * Math.sin((hour - 6) * (Math.PI / 12));
    
    // Base wind conditions with natural patterns
    let potentialProduction = baseProduction * timeOfDayFactor;
    
    // Apply daily weather pattern
    if (isStormy) {
      if (hour > 12 && hour < 20) {
        potentialProduction *= 1.4; // Strong winds in afternoon/evening during stormy days
      }
    } else if (isCalm) {
      potentialProduction *= 0.7; // Less wind on calm days
    }
    
    // Add some natural randomness
    potentialProduction += (Math.random() * variability * 2 - variability) * baseProduction;
    potentialProduction = Math.max(0.5, potentialProduction); // Ensure minimum production
    
    // Calculate actual production - start with full potential
    let actualProduction = potentialProduction;
    
    // Check if there's an event for this hour and apply impact if so
    const hourEvent = events.find(e => e.hour === hour);
    if (hourEvent) {
      // Apply the impact from the event
      const impactValue = parseFloat(hourEvent.impact.toString());
      actualProduction = Math.max(0.1, potentialProduction + impactValue);
    }
    
    // Generate electricity price based on time of day
    // Prices tend to be lower at night and peak during evening demand
    let price = 50 + 20 * Math.sin((hour - 12) * (Math.PI / 12));
    
    // Negative prices sometimes occur at night with excess wind
    if (hasNegativePrices && (hour >= 0 && hour <= 5)) {
      price = -10 - Math.random() * 20;
    }
    
    // Add randomness to price
    price += (Math.random() * 15 - 7.5);
    
    return {
      hour: `${String(hour).padStart(2, '0')}:00`,
      actualProduction,
      potentialProduction,
      price,
      percentOfCapacity: Math.round((actualProduction / 12) * 100), // Assuming 12 MW capacity
      event: hourEvent ? true : false
    };
  });
  
  return {
    date: format(date, 'd MMM yyyy', { locale: nl }),
    dateObj: date,
    data: hourlyData,
    events: events
  };
};

// Define a single source of truth for production data
export const allDaysData: DayData[] = [
  generateRealisticDayData(new Date(2024, 1, 27)),
  generateRealisticDayData(new Date(2024, 1, 28)),
  generateRealisticDayData(new Date(2024, 1, 29)),
  generateRealisticDayData(new Date(2024, 2, 1)),
  generateRealisticDayData(new Date(2024, 2, 2)),
  generateRealisticDayData(new Date(2024, 2, 3)),
  generateRealisticDayData(new Date(2024, 2, 4)),
  generateRealisticDayData(new Date(2024, 2, 5)),
  generateRealisticDayData(new Date(2024, 2, 6)),
  generateRealisticDayData(new Date(2024, 2, 7)),
  generateRealisticDayData(new Date(2024, 2, 8)),
  generateRealisticDayData(new Date(2024, 2, 9)),
  generateRealisticDayData(new Date(2024, 2, 10)),
  generateRealisticDayData(new Date(2024, 2, 11)),
  generateRealisticDayData(new Date(2024, 2, 12))
];

// Create production events map from the generated data
export const productionEvents: ProductionEventsMap = allDaysData.reduce((acc: ProductionEventsMap, day) => {
  acc[day.date] = day.events;
  return acc;
}, {});

// Export a function to initialize additional data (if needed in the future)
export const initializeProductionEvents = () => {
  // This function can be used to add more data dynamically if needed
  
  // For now, just ensure we have our curtailment events properly set
  allDaysData.forEach(day => {
    // Verify each day has at least one TenneT curtailment event
    const hasCurtailmentEvent = day.events.some(
      event => event.type === 'grid' && 
      (event.reason.includes('TenneT') || event.reason.toLowerCase().includes('curtail'))
    );
    
    // If no curtailment event exists, add one
    if (!hasCurtailmentEvent) {
      const curtailmentHour = 11;
      const severityMultiplier = 1.5 + Math.random();
      const impactValue = -(severityMultiplier).toFixed(1);
      const duration = `${2 + Math.floor(Math.random() * 3)} hours`;
      
      day.events.push({
        time: `${String(curtailmentHour).padStart(2, '0')}:00`,
        duration: duration,
        impact: impactValue,
        reason: "TenneT Grid Curtailment",
        description: "Grid operator TenneT requested power curtailment due to transmission congestion",
        type: "grid",
        hour: curtailmentHour
      });
      
      // Update the productionEvents map with the new event
      productionEvents[day.date] = day.events;
    }
  });
  
  return { allDaysData, productionEvents };
};

// Ensure initialization happens on first load
initializeProductionEvents();

// Updated find day data function to handle any date
export const findDayDataByDate = (date: Date) => {
  // First try to find the date in our pre-generated data
  const matchedDay = allDaysData.find(day => {
    // Format the dates to match easier - comparing just day, month, year
    const dayMonth = day.dateObj.getMonth();
    const dayDate = day.dateObj.getDate();
    const dayYear = day.dateObj.getFullYear();
    
    const searchMonth = date.getMonth();
    const searchDate = date.getDate();
    const searchYear = date.getFullYear();
    
    return dayMonth === searchMonth && dayDate === searchDate && dayYear === searchYear;
  });

  // If there's no data for this date, generate a new day with guaranteed events
  if (!matchedDay) {
    // For consistency, use a seeded random value based on the date
    const seed = date.getDate() + (date.getMonth() * 100) + (date.getFullYear() * 10000);
    const baseProduction = 7 + (seed % 10) / 2; // Varies between 7-12 based on date
    return generateRealisticDayData(date, baseProduction);
  }
  
  return matchedDay;
};

interface ProductionGraphProps {
  selectedDates: Date[];
}

export const ProductionGraph: React.FC<ProductionGraphProps> = ({ selectedDates }) => {
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showDayGraph, setShowDayGraph] = useState<Date | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  // Use a simpler approach with minimal state dependencies
  const isHourlyView = selectedDates.length === 1;
  
  // Use useEffect only for window resize - this is safe
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    // Initial call and add listener
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Handle event clicks - this doesn't cause state loops
  const handleEventClick = (event: any) => {
    if (!event) return;
    
    // For hourly view
    if (event.hour !== undefined) {
      const hourNum = event.hour;
      const date = selectedDates[0];
      const dayData = findDayDataByDate(date);
      const events = dayData?.events || [];
      
      // If we have direct event data from the marker, use it
      if (event.event) {
        setSelectedEvent({
          hour: `${String(hourNum).padStart(2, '0')}:00`,
          date: format(date, 'd MMM yyyy', { locale: nl }),
          directEvent: event.event, // Store the direct event
          events: events,
          selectedHour: hourNum
        });
        return;
      }
      
      // Otherwise fall back to filtering by hour
      const hourEvents = events.filter(e => e.hour === hourNum);
      
      // Find the index of the event in the array if possible
      const eventIndex = hourEvents.length > 0 ? events.findIndex(e => e.hour === hourNum) : -1;
      
      setSelectedEvent({
        hour: `${String(hourNum).padStart(2, '0')}:00`,
        date: format(date, 'd MMM yyyy', { locale: nl }),
        events: hourEvents.length > 0 ? hourEvents : [],
        selectedHour: hourNum,
        selectedEventId: eventIndex >= 0 ? eventIndex : undefined
      });
    }
    // For daily view
    else if (event.date) {
      // Generate between 2-5 random events for the day
      const eventsCount = 2 + Math.floor(Math.random() * 4);
      const generatedEvents: any[] = [];
      
      // Generate events at different hours of the day
      const hourSet = new Set<number>();
      while (hourSet.size < eventsCount) {
        hourSet.add(Math.floor(Math.random() * 24));
      }
      
      // Create events for each hour
      Array.from(hourSet).forEach(hour => {
        const severity = 0.5 + Math.random() * 1.0; // 0.5 to 1.5
        generatedEvents.push(generateRandomEvent(hour, severity));
      });
      
      // Sort events by hour
      generatedEvents.sort((a: any, b: any) => {
        const hourA = a.hour !== undefined ? a.hour : parseInt(a.time.split(':')[0]);
        const hourB = b.hour !== undefined ? b.hour : parseInt(b.time.split(':')[0]);
        return hourA - hourB;
      });
      
      setSelectedEvent({
        date: format(event.date, 'd MMMM yyyy', { locale: nl }),
        dateObj: event.date,
        events: generatedEvents
      });
    }
  };

  // Memoize hourly data to avoid recalculations
  const hourlyData = useMemo(() => {
    if (!isHourlyView) return { data: [], events: [] };
    const date = selectedDates[0];
    const dayData = findDayDataByDate(date);
    return {
      data: dayData?.data || [],
      events: dayData?.events || []
    };
  }, [isHourlyView, selectedDates]);

  // Memoize daily data to avoid recalculations
  const dailyData = useMemo(() => {
    if (isHourlyView) return [];
    
    // If we have multiple dates, make sure we include all dates in the range
    if (selectedDates.length > 1) {
      // Sort dates chronologically
      const sortedDates = [...selectedDates].sort((a, b) => a.getTime() - b.getTime());
      const startDate = sortedDates[0];
      const endDate = sortedDates[sortedDates.length - 1];
      
      // Create an array with all dates in the range
      const allDatesInRange: Date[] = [];
      const currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        allDatesInRange.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      // Use the complete range for rendering
      return allDatesInRange.map(date => {
        const dayData = findDayDataByDate(date);
        if (!dayData) return null;

        const hourlyData = dayData.data;
        
        // Calculate daily averages
        const avgActual = hourlyData.reduce((acc, hour) => acc + hour.actualProduction, 0) / 24;
        const avgPotential = hourlyData.reduce((acc, hour) => acc + hour.potentialProduction, 0) / 24;
        const avgPrice = hourlyData.reduce((acc, hour) => acc + hour.price, 0) / 24;
        const events = dayData.events || [];
        
        return {
          date: format(date, 'd MMM', { locale: nl }),
          dateObj: date,
          actualProduction: avgActual,
          potentialProduction: avgPotential,
          price: avgPrice,
          eventCount: events.length,
          hasEvents: events.length > 0,
          events
        };
      }).filter(Boolean);
    }
    
    // For individually selected dates (not a continuous range)
    return selectedDates.map(date => {
      const dayData = findDayDataByDate(date);
      if (!dayData) return null;

      const hourlyData = dayData.data;
      
      // Calculate daily averages
      const avgActual = hourlyData.reduce((acc, hour) => acc + hour.actualProduction, 0) / 24;
      const avgPotential = hourlyData.reduce((acc, hour) => acc + hour.potentialProduction, 0) / 24;
      const avgPrice = hourlyData.reduce((acc, hour) => acc + hour.price, 0) / 24;
      const events = dayData.events || [];
      
      return {
        date: format(date, 'd MMM', { locale: nl }),
        dateObj: date,
        actualProduction: avgActual,
        potentialProduction: avgPotential,
        price: avgPrice,
        eventCount: events.length,
        hasEvents: events.length > 0,
        events
      };
    }).filter(Boolean);
  }, [isHourlyView, selectedDates]);

  // Custom tooltip component for hourly view
  const HourlyTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    
    const hourData = hourlyData.data.find(h => h.hour === label);
    const hourEvents = hourlyData.events.filter(e => e.hour === parseInt((label || "0:00").split(':')[0]));
    
    return (
      <div className="bg-white p-3 shadow-md border border-gray-200 rounded-md">
        <p className="font-medium text-gray-800">{label}</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
          <p className="text-blue-600">Actual: {payload[0].value.toFixed(1)} MW</p>
          <p className="text-gray-600">Potential: {payload[1].value.toFixed(1)} MW</p>
          <p className="text-green-600">Price: €{payload[2].value.toFixed(2)}/MWh</p>
          {hourData && hourData.event && (
            <p className="text-red-500 col-span-2">
              Production gap: {(hourData.potentialProduction - hourData.actualProduction).toFixed(1)} MW
            </p>
          )}
        </div>
        
        {hourEvents.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <p className="font-medium text-gray-700">Events:</p>
            {hourEvents.map((event, i) => (
              <p key={i} className="text-sm text-orange-600">{event.reason}: {event.impact} MW</p>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Custom tooltip component for daily view
  const DailyTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    
    const day = dailyData.find(d => d && d.date === label);
    if (!day) return null;
    
    return (
      <div className="bg-white p-3 shadow-md border border-gray-200 rounded-md">
        <p className="font-medium text-gray-800">
          {format(day.dateObj, 'd MMMM yyyy', { locale: nl })}
          {day.eventCount > 0 && <span className="text-red-500"> ({day.eventCount} events)</span>}
        </p>
        <div className="grid grid-cols-1 gap-y-1 mt-1">
          <p className="text-blue-600">Avg. Actual: {day.actualProduction.toFixed(2)} MW</p>
          <p className="text-gray-600">Avg. Potential: {day.potentialProduction.toFixed(2)} MW</p>
          <p className="text-green-600">Avg. Price: €{day.price.toFixed(2)}/MWh</p>
        </div>
      </div>
    );
  };

  // Render event details
  const renderEventDetails = () => {
    if (!selectedEvent) return null;

    // Check if we're in multi-day view and should show all events for the day
    if (!isHourlyView && selectedEvent.date && selectedEvent.events?.length > 0) {
      const eventsForDay = selectedEvent.events;
      
      return (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-semibold text-sm text-blue-700 uppercase tracking-wide">
              EVENTS ON {selectedEvent.date}
            </h4>
            <button 
              onClick={() => setSelectedEvent(null)} 
              className="p-1 rounded-full hover:bg-blue-100 transition-colors"
              aria-label="Close event"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="bg-gradient-to-b from-blue-50 to-white rounded-lg border border-blue-100 overflow-hidden shadow-sm">
            <div className="p-4 space-y-4 max-h-80 overflow-y-auto">
              {eventsForDay.map((event: any, index: number) => {
                const type = event.type || 'technical';
                const IconComponent = event.eventTypeData?.icon || 
                                    (eventTypes.find(et => et.type === type)?.icon || AlertTriangle);
                const bgColor = event.eventTypeData?.bgColor || 
                              (eventTypes.find(et => et.type === type)?.bgColor || 'bg-red-100');
                const textColor = event.eventTypeData?.color || 
                                (eventTypes.find(et => et.type === type)?.color || 'text-red-500');
                
                return (
                  <div key={index} className="border-b border-blue-100 last:border-b-0 pb-3 last:pb-0 hover:bg-blue-50 transition-colors duration-150 rounded-md p-2">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-full ${bgColor} flex-shrink-0 shadow-sm`}>
                        <IconComponent className={`w-5 h-5 ${textColor}`} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-800">{event.reason}</h4>
                          <span className="text-red-600 font-medium whitespace-nowrap">
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
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-auto p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-b-lg border-t border-blue-200 flex justify-between items-center">
              <div className="text-sm text-blue-600 font-medium">
                <span className="mr-1.5 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200">
                  {selectedEvent.events.length}
                </span>
                event{selectedEvent.events.length !== 1 ? 's' : ''} on this day
              </div>
              <button 
                onClick={() => setShowDayGraph(selectedEvent.dateObj)}
                className="group relative px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center gap-3 transition-all duration-200 shadow-sm hover:shadow-md overflow-hidden"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="absolute -inset-px rounded-lg border border-white/20"></span>
                <span className="absolute -inset-2 rounded-xl bg-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100" style={{ animation: 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></span>
                <BarChart2 className="h-5 w-5 relative z-10" />
                <span className="relative z-10 whitespace-nowrap">Show Graph for This Day</span>
                <ChevronRight className="w-4 h-4 relative z-10 ml-1 opacity-70 group-hover:translate-x-1 transition-transform duration-300 ease-out" />
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    // For single-day view, show a single event
    // Extract the hour number from the time string if it exists
    let selectedHour: number | undefined = undefined;
    if (selectedEvent.hour) {
      const hourStr = selectedEvent.hour.split(':')[0];
      selectedHour = parseInt(hourStr, 10);
    } else if (selectedEvent.selectedHour !== undefined) {
      selectedHour = selectedEvent.selectedHour;
    }
    
    // Get the specific event details in multiple ways to ensure we find it
    let eventDetails = null;
    
    // First priority: Use the direct event if available (from marker click)
    if (selectedEvent.directEvent) {
      eventDetails = selectedEvent.directEvent;
    }
    // Second priority: Try to get from events array with selectedEventId
    else if (selectedEvent.events && selectedEvent.events.length > 0 && selectedEvent.selectedEventId !== undefined) {
      eventDetails = selectedEvent.events[selectedEvent.selectedEventId];
    } 
    // Third priority: Try first event in events array
    else if (selectedEvent.events && selectedEvent.events.length > 0) {
      eventDetails = selectedEvent.events[0];
    }
    // Last resort: If we have hour info but no event, generate a varied one
    else if (selectedHour !== undefined) {
      // Create a deterministic but varied event based on hour
      // Use a combination of hour and day to get varied event types
      const date = selectedDates[0];
      const daySeed = date.getDate() % 5; // 0-4
      const hourSeed = (selectedHour + daySeed) % 5; // 0-4, shifted by day
      
      // Map the seed to different event types with good distribution
      const eventTypeMapping = [
        'grid',          // 0
        'weather',       // 1
        'maintenance',   // 2
        'environmental', // 3
        'technical'      // 4
      ];
      
      const type = eventTypeMapping[hourSeed];
      const typeInfo = eventTypes.find(et => et.type === type) || eventTypes[0];
      
      // Get a description that matches this type
      const typeDescriptions = typeInfo.descriptions;
      const descriptionIndex = ((selectedHour * date.getDate()) % typeDescriptions.length);
      const description = typeDescriptions[descriptionIndex];
      
      // Generate impact and duration with good variety
      const hourFactor = (selectedHour % 10) / 10; // 0.0 - 0.9
      const impact = -(0.6 + hourFactor + (date.getDate() % 10) / 20).toFixed(1); // -0.6 to -1.4
      const duration = 1 + ((selectedHour + date.getDate()) % 3); // 1-3 hours
      
      eventDetails = {
        time: `${String(selectedHour).padStart(2, '0')}:00`,
        duration: `${duration} hour${duration !== 1 ? 's' : ''}`,
        impact: impact,
        reason: typeInfo.name,
        description: description,
        type: type,
        hour: selectedHour,
        eventTypeData: {
          icon: typeInfo.icon,
          color: typeInfo.color,
          bgColor: typeInfo.bgColor
        }
      };
    }
    
    // Final safety check - if still no event details, return null
    if (!eventDetails) return null;
    
    // Type determination for icon and styling
    const type = eventDetails.type || 'technical';
    const IconComponent = eventDetails.eventTypeData?.icon || 
                         (eventTypes.find(et => et.type === type)?.icon || AlertTriangle);
    const bgColor = eventDetails.eventTypeData?.bgColor || 
                   (eventTypes.find(et => et.type === type)?.bgColor || 'bg-red-100');
    const textColor = eventDetails.eventTypeData?.color || 
                     (eventTypes.find(et => et.type === type)?.color || 'text-red-500');
    
    return (
      <div className="mt-6">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-semibold text-sm text-blue-700 uppercase tracking-wide">
            {selectedEvent.date ? `EVENT ON ${selectedEvent.date}` : 'SELECTED EVENT'}
          </h4>
          <button 
            onClick={() => setSelectedEvent(null)} 
            className="p-1 rounded-full hover:bg-blue-100 transition-colors"
            aria-label="Close event"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="bg-blue-50 rounded-lg border border-blue-100 overflow-hidden">
          <div className="p-4">
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-full ${bgColor} flex-shrink-0`}>
                <IconComponent className={`w-5 h-5 ${textColor}`} />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{eventDetails.reason}</h4>
                  <span className="text-red-500 font-medium whitespace-nowrap">
                    {eventDetails.impact} MW
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mt-1">
                  {eventDetails.description}
                </p>
                
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{eventDetails.time}</span>
                  </div>
                  <div className="flex items-center">
                    Duration: {eventDetails.duration}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Simplified hourly graph render
  const renderHourlyGraph = () => {
    const data = hourlyData.data;
    const events = hourlyData.events;
    
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          onClick={(e) => {
            // Only handle clicks on the chart area, not markers
            if (e && e.activeLabel && !e.isTooltipActive) {
              setSelectedEvent(null);
            }
          }}
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
            domain={[-30, 80]}
            tick={{ fill: '#666' }}
            label={{ value: 'Price (€/MWh)', angle: 90, position: 'insideRight', fill: '#666' }}
          />
          <Tooltip content={<HourlyTooltip />} />
          
          {/* Mark negative price regions */}
          {data.map((item, index) => {
            if (item.price < 0 && index < data.length - 1) {
              return (
                <ReferenceArea 
                  key={`neg-price-${index}`}
                  x1={item.hour} 
                  x2={data[index + 1].hour} 
                  yAxisId="power"
                  fill="#FEF2F2" 
                  fillOpacity={0.3} 
                />
              );
            }
            return null;
          })}
          
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
    );
  };

  // Simplified daily graph render
  const renderDailyGraph = () => {
    if (!dailyData.length) {
      return (
        <div className="h-full flex items-center justify-center">
          <p className="text-gray-500">No data available for selected dates</p>
        </div>
      );
    }
    
    // Calculate what interval to use based on the number of dates
    // For small ranges (<=14 days), show all days
    // For medium ranges (15-30 days), show every other day
    // For large ranges (>30 days), let Recharts decide automatically
    const getTickInterval = () => {
      if (dailyData.length <= 14) return 0; // Show all ticks
      if (dailyData.length <= 30) return 1; // Show every other tick
      return 'preserveStart'; // Let Recharts decide but preserve start/end
    };
    
    // Custom tick formatter to ensure all dates are properly displayed
    const formatXAxisTick = (value: string) => {
      // The value is already formatted as 'd MMM' from our data preparation
      return value;
    };
    
    // In multi-day view, we want to place event markers where there are events
    const DailyEventMarkers = () => {
      return null; // We don't need the top event markers
    };
    
    return (
      <div className="relative w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={dailyData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            onClick={(e) => {
              // Only handle clicks on the chart area, not markers
              if (e && e.activeLabel && !e.isTooltipActive) {
                setSelectedEvent(null);
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: '#666' }}
              tickFormatter={formatXAxisTick}
              interval={getTickInterval()}
              angle={dailyData.length > 7 ? -45 : 0}
              textAnchor={dailyData.length > 7 ? "end" : "middle"}
              height={dailyData.length > 7 ? 60 : 30}
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
              domain={[-30, 80]}
              tick={{ fill: '#666' }}
              label={{ value: 'Price (€/MWh)', angle: 90, position: 'insideRight', fill: '#666' }}
            />
            <Tooltip content={<DailyTooltip />} />
            
            {/* Mark negative price regions */}
            {dailyData.filter(item => item !== null).map((item, index, filteredArray) => {
              if (item.price < 0 && index < filteredArray.length - 1) {
                return (
                  <ReferenceArea 
                    key={`neg-price-${index}`}
                    x1={item.date} 
                    x2={filteredArray[index + 1].date} 
                    yAxisId="power"
                    fill="#FEF2F2" 
                    fillOpacity={0.3} 
                  />
                );
              }
              return null;
            })}
            
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
        <DailyEventMarkers />
      </div>
    );
  };

  // Render event markers in DOM (not part of chart)
  const EventMarkers = () => {
    if (!containerRef.current || dimensions.width === 0) return null;
    
    // Define marker type
    type EventMarker = { 
      id: string; 
      x: number; 
      hour?: number; 
      date?: Date; 
      event: any 
    };
    
    // Account for chart margins
    const chartLeftMargin = 60;
    const chartRightMargin = 60;
    const usableWidth = dimensions.width - chartLeftMargin - chartRightMargin;
    
    // Markers for hourly view
    const hourlyMarkers: EventMarker[] = isHourlyView 
      ? hourlyData.events.map((event, index) => {
          const hourNum = event.hour || parseInt(event.time.split(':')[0]);
          // Ensure hour is within 0-23 range
          if (hourNum < 0 || hourNum > 23) return null;
          
          // Position within the usable chart area
          const xPos = chartLeftMargin + (hourNum / 23) * usableWidth;
          return { 
            id: `hour-${hourNum}-${index}`, 
            x: xPos, 
            hour: hourNum, 
            event: event
          };
        }).filter(Boolean) as EventMarker[]
      : [];
      
    // Markers for daily view
    const dailyMarkers: EventMarker[] = !isHourlyView
      ? dailyData
          .filter(day => day && day.events && day.events.length > 0) // Only days with events
          .flatMap((day, index) => {
            if (!day) return [];
            
            const dayIndex = dailyData.findIndex(d => d && d.date === day.date);
            if (dayIndex === -1) return [];
            
            // Skip if this is outside our valid range
            if (dayIndex >= dailyData.length) return [];
            
            // Get a well-distributed random event from this day
            const dayEvents = day.events || [];
            const eventToUse = dayEvents.length > 0 
              ? dayEvents[index % dayEvents.length] // Cycle through events
              : null;
              
            if (!eventToUse) return [];
            
            // Calculate position within the usable chart area
            // For daily view, we need to carefully match the domain of the chart
            const denominator = Math.max(1, dailyData.filter(Boolean).length - 1);
            const xPos = chartLeftMargin + (dayIndex / denominator) * usableWidth;
            
            // Ensure the marker is within the visible area
            if (xPos < chartLeftMargin || xPos > (dimensions.width - chartRightMargin)) {
              return [];
            }
            
            return [{ 
              id: `day-${index}`, 
              x: xPos, 
              date: day.dateObj, 
              event: eventToUse
            }];
          })
      : [];
    
    // Combine both types of markers
    const allMarkers = isHourlyView ? hourlyMarkers : dailyMarkers;
    
    return (
      <>
        {allMarkers.map(marker => (
          <div 
            key={marker.id}
            className="absolute cursor-pointer"
            style={{ 
              left: marker.x, 
              bottom: 40,
              transform: 'translateX(-50%)'
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleEventClick(marker);
            }}
          >
            <div className="w-6 h-6 flex items-center justify-center rounded-full bg-white shadow-sm border border-red-400 text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors">
              ⚠
            </div>
          </div>
        ))}
      </>
    );
  };

  // Render a graph for a specific day in a modal
  const renderDayGraph = (date: Date) => {
    const dayData = findDayDataByDate(date);
    
    if (!dayData || !dayData.data) return null;
    
    // Create a mini EventMarkers component specifically for this modal
    const DayEventMarkers = () => {
      if (!dimensions.width) return null;
      
      // Define marker type
      type EventMarker = { 
        id: string; 
        x: number; 
        hour: number; 
        event: any 
      };
      
      // Account for chart margins
      const chartLeftMargin = 60;
      const chartRightMargin = 60;
      const chartHeight = 400; // Estimated height
      const usableWidth = dimensions.width - chartLeftMargin - chartRightMargin;
      
      // Create markers for each event
      const eventMarkers: EventMarker[] = dayData.events
        .filter(event => event.hour !== undefined)
        .map((event, index) => {
          const hourNum = event.hour || parseInt(event.time.split(':')[0]);
          // Position within the usable chart area
          const xPos = chartLeftMargin + (hourNum / 23) * usableWidth;
          return { 
            id: `hour-${hourNum}-${index}`, 
            x: xPos, 
            hour: hourNum, 
            event: event
          };
        });
      
      return (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          {eventMarkers.map(marker => (
            <div 
              key={marker.id}
              className="absolute cursor-pointer pointer-events-auto"
              style={{ 
                left: marker.x, 
                bottom: 60, // Position above x-axis
                transform: 'translateX(-50%)'
              }}
              onClick={(e) => {
                e.stopPropagation();
                // Show the event detail
                setSelectedEvent({
                  hour: `${String(marker.hour).padStart(2, '0')}:00`,
                  date: format(date, 'd MMM yyyy', { locale: nl }),
                  directEvent: marker.event,
                  events: dayData.events,
                  selectedHour: marker.hour
                });
              }}
            >
              <div className="w-6 h-6 flex items-center justify-center rounded-full bg-white shadow-sm border border-red-400 text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      );
    };
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-xl w-11/12 max-w-4xl h-[80vh] p-6 flex flex-col">
          <div className="flex justify-between items-center mb-5 pb-2 border-b border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800">
              Production Graph for {format(date, 'd MMMM yyyy', { locale: nl })}
            </h3>
            <button 
              onClick={() => setShowDayGraph(null)}
              className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="relative h-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={dayData.data}
                margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
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
                  domain={[-30, 80]}
                  tick={{ fill: '#666' }}
                  label={{ value: 'Price (€/MWh)', angle: 90, position: 'insideRight', fill: '#666' }}
                />
                <Tooltip content={<HourlyTooltip />} />
                
                {/* Mark negative price regions */}
                {dayData.data.map((item, index) => {
                  if (item.price < 0 && index < dayData.data.length - 1) {
                    return (
                      <ReferenceArea 
                        key={`neg-price-${index}`}
                        x1={item.hour} 
                        x2={dayData.data[index + 1].hour} 
                        yAxisId="power"
                        fill="#FEF2F2" 
                        fillOpacity={0.3} 
                      />
                    );
                  }
                  return null;
                })}
                
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
            <DayEventMarkers />
            
            {/* Show event details in a small popup if one is selected */}
            {selectedEvent && selectedEvent.directEvent && (
              <div className="absolute bottom-4 right-4 w-80 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 flex justify-between items-center">
                  <h3 className="font-medium text-blue-800">Event at {selectedEvent.hour}</h3>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEvent(null);
                    }}
                    className="text-blue-500 hover:text-blue-700 focus:outline-none transition-colors p-1 rounded-full hover:bg-blue-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-800">{selectedEvent.directEvent.reason}</h4>
                    <span className="text-red-600 font-medium whitespace-nowrap">
                      {selectedEvent.directEvent.impact} MW
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{selectedEvent.directEvent.description}</p>
                  <div className="text-sm text-gray-500 flex items-center">
                    <Clock className="w-4 h-4 mr-1.5" />
                    <span>{selectedEvent.directEvent.time} ({selectedEvent.directEvent.duration})</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Add legend at the bottom */}
          <div className="flex items-center gap-8 mt-4 pt-4 border-t border-gray-100 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Actual Production</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
              <span>Potential Production</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Electricity Price</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-0.5 text-red-500">⚠</div>
              <span>Production Event</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg p-6">
      <div className="flex items-center mb-6">
        <h3 className="text-xl font-semibold">Production Overview</h3>
        <InfoTooltip 
          title="Production Overview"
          explanation={isHourlyView 
            ? "This graph shows hourly production data for the selected day, including actual production, potential production, and electricity prices." 
            : "This graph shows daily average production data across the selected date range, including actual production, potential production, and electricity prices."
          }
          interpretation={isHourlyView
            ? "The blue line shows your actual production, while the gray dashed line shows the potential production based on available wind. The green line shows market electricity prices. Click on warning markers to see event details."
            : "Each point represents a day's average. Compare actual (blue) versus potential (gray) production to identify opportunities for optimization. Click on days with events to see details."
          }
          position="right"
        />
      </div>
      
      <div className="h-[400px] relative" ref={containerRef}>
        {isHourlyView ? renderHourlyGraph() : renderDailyGraph()}
        <EventMarkers />
      </div>
      
      {selectedEvent && renderEventDetails()}
      
      <div className="mt-4 text-sm text-gray-500">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Actual Production</span>
            <InfoTooltip 
              title="Actual Production"
              explanation="The amount of electricity your wind turbines actually produced during this period."
              interpretation="Lower than potential production can be due to grid curtailment, maintenance, or turbine efficiency."
              position="top"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border border-gray-400 bg-gray-100 rounded-full"></div>
            <span>Potential Production</span>
            <InfoTooltip 
              title="Potential Production"
              explanation="The maximum amount of electricity your turbines could have produced given the wind conditions."
              interpretation="The gap between potential and actual represents opportunities for optimization or unavoidable constraints."
              position="top"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Electricity Price</span>
            <InfoTooltip 
              title="Electricity Price"
              explanation="The market price of electricity during this period, measured in €/MWh."
              interpretation="Price fluctuations can significantly impact revenue. Negative prices can occur during grid congestion."
              position="top"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="px-1 text-red-500">⚠</div>
            <span>Production Event</span>
            <InfoTooltip 
              title="Production Event"
              explanation="An event that caused production to be less than potential during this period."
              interpretation="Click on these markers to see what caused your turbines to produce less than they could have."
              position="top"
            />
          </div>
        </div>
      </div>
      
      {showDayGraph && renderDayGraph(showDayGraph)}
    </div>
  );
};

// Export these additional variables and functions that are used by ProductionEvents component
export { eventTypes }; 