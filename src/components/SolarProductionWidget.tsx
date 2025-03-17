'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sun, ArrowUpRight, TrendingUp, Cloud, CloudSun, Clock, Leaf, AlertTriangle, PlugZap, WrenchIcon } from 'lucide-react';
import Link from 'next/link';
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip } from 'recharts';

interface Constraint {
  type: 'grid' | 'maintenance' | 'equipment' | 'regulatory';
  severity: 'low' | 'moderate' | 'high';
  impact: number; // percentage reduction
  message: string;
  startTime?: string;
  endTime?: string;
}

interface SolarProductionData {
  currentProduction: number;
  idealProduction: number; // What could be produced without constraints
  dailyTotal: number;
  trend: number;
  efficiency: number;
  peakTime: string;
  co2Saved: number;
  weatherInfluence: number;
  activeConstraints: Constraint[];
  hourlyData: Array<{
    hour: string;
    production: number;
    potentialProduction?: number;
  }>;
  forecast: 'sunny' | 'partly-cloudy' | 'cloudy';
}

// In a real application, this would be fetched from an API
const getSolarData = (): SolarProductionData => {
  // Generate realistic production curve - higher during midday, lower in morning/evening
  const hourlyData = Array.from({ length: 24 }, (_, i) => {
    // Solar panel production curve (bell curve centered around noon)
    let potentialProduction = 0;
    
    // Only produce during daylight hours (7am to 7pm)
    if (i >= 7 && i <= 19) {
      // Bell curve for solar production - peaks at noon (12)
      potentialProduction = 10 * Math.exp(-0.3 * Math.pow(i - 12, 2)) * (0.9 + Math.random() * 0.2);
      
      // Round to 1 decimal place
      potentialProduction = Math.round(potentialProduction * 10) / 10;
    }
    
    // Apply random constraints to certain hours
    let production = potentialProduction;
    // Grid constraints during peak hours (11am-2pm)
    if (i >= 11 && i <= 14 && Math.random() > 0.7) {
      production = potentialProduction * 0.85; // 15% reduction
    }
    // Random maintenance during morning
    if (i === 9 && Math.random() > 0.8) {
      production = potentialProduction * 0.5; // 50% reduction
    }
    
    return {
      hour: `${String(i).padStart(2, '0')}:00`,
      production: Math.round(production * 10) / 10,
      potentialProduction
    };
  });
  
  // Calculate total production
  const dailyTotal = parseFloat(
    hourlyData.reduce((sum, hour) => sum + hour.production, 0).toFixed(1)
  );
  
  // Find peak production hour
  const peakHour = hourlyData.reduce(
    (peak, hour, index) => hour.production > hourlyData[peak].production ? index : peak, 
    0
  );
  
  // Use current time to determine "current" production
  const currentHour = new Date().getHours();
  const currentProduction = hourlyData[currentHour]?.production || 0;
  const idealProduction = hourlyData[currentHour]?.potentialProduction || 0;
  
  // Generate some realistic constraints
  const constraints: Constraint[] = [];
  
  // Add grid constraint during peak hours
  if (currentHour >= 11 && currentHour <= 14 && Math.random() > 0.6) {
    constraints.push({
      type: 'grid',
      severity: 'moderate',
      impact: 15,
      message: 'Grid congestion limiting export capacity',
      startTime: '11:00',
      endTime: '14:00'
    });
  }
  
  // Add maintenance constraint
  if (currentHour === 9 && Math.random() > 0.7) {
    constraints.push({
      type: 'maintenance',
      severity: 'high',
      impact: 50,
      message: 'Scheduled inverter maintenance',
      startTime: '09:00',
      endTime: '10:30'
    });
  }
  
  // Add equipment constraint
  if (Math.random() > 0.8) {
    constraints.push({
      type: 'equipment',
      severity: 'low',
      impact: 5,
      message: 'String 3 offline - under investigation',
    });
  }
  
  // Simulating real data - in production this would come from your API
  return {
    currentProduction,
    idealProduction,
    dailyTotal, // MWh
    trend: 12, // % increase from yesterday
    efficiency: 86, // % of maximum potential
    peakTime: hourlyData[peakHour].hour,
    co2Saved: Math.round(dailyTotal * 0.4), // 0.4 tons of CO2 saved per MWh
    weatherInfluence: 15, // % reduction due to weather conditions
    activeConstraints: constraints,
    hourlyData,
    forecast: 'partly-cloudy' // or 'sunny', 'cloudy'
  };
};

const SolarProductionWidget = () => {
  const solarData = getSolarData();
  const [showDetails, setShowDetails] = useState(false);
  
  // Format data for the chart - only include daytime hours (7am-7pm)
  const chartData = solarData.hourlyData.filter(hour => {
    const hourNum = parseInt(hour.hour.split(':')[0]);
    return hourNum >= 7 && hourNum <= 19;
  });

  const renderWeatherIcon = () => {
    switch(solarData.forecast) {
      case 'sunny':
        return <Sun className="w-5 h-5 text-amber-500" />;
      case 'partly-cloudy':
        return <CloudSun className="w-5 h-5 text-amber-500" />;
      case 'cloudy':
        return <Cloud className="w-5 h-5 text-gray-500" />;
      default:
        return <Sun className="w-5 h-5 text-amber-500" />;
    }
  };
  
  const hasConstraints = solarData.activeConstraints.length > 0;
  const totalConstraintImpact = solarData.activeConstraints.reduce((sum, constraint) => sum + constraint.impact, 0);

  // Get constraint severity color
  const getConstraintSeverityColor = (severity: string) => {
    switch(severity) {
      case 'low': return 'text-yellow-600';
      case 'moderate': return 'text-orange-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  // Get constraint icon
  const getConstraintIcon = (type: string) => {
    switch(type) {
      case 'grid': return <PlugZap className="w-4 h-4" />;
      case 'maintenance': return <WrenchIcon className="w-4 h-4" />;
      case 'equipment': return <AlertTriangle className="w-4 h-4" />;
      case 'regulatory': return <AlertTriangle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <motion.div 
      className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-6 border border-amber-100 hover:shadow-md transition-all cursor-pointer"
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onHoverStart={() => setShowDetails(true)}
      onHoverEnd={() => setShowDetails(false)}
    >
      <Link href="/productie/zon" className="block h-full">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="bg-amber-400 p-2 rounded-lg">
              <Sun className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Solar Production</h3>
          </div>
          <ArrowUpRight className="w-5 h-5 text-amber-500" />
        </div>

        <div className="mt-5 flex justify-between items-end">
          <div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-gray-800">{solarData.currentProduction}</span>
              <span className="text-gray-500 mb-1">MW</span>
              {hasConstraints && (
                <div className="mb-1 ml-1 flex items-center">
                  <span className="text-amber-600 text-xs font-medium mr-1">
                    (-{totalConstraintImpact}%)
                  </span>
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                </div>
              )}
            </div>
            <p className="text-gray-500 text-sm">Current production</p>
          </div>
          
          <div className="flex items-center gap-2 bg-white/50 px-3 py-1.5 rounded-full">
            {renderWeatherIcon()}
            <span className="text-sm text-gray-600">
              {solarData.forecast === 'sunny' ? 'Optimal' : 
               solarData.forecast === 'partly-cloudy' ? 'Good' : 'Reduced'} conditions
            </span>
          </div>
        </div>

        {/* Mini production graph - visible on hover */}
        <div className={`mt-4 transition-all duration-300 ${showDetails ? 'opacity-100 max-h-32' : 'opacity-0 max-h-0 overflow-hidden'}`}>
          <div className="h-[100px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorProduction" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="hour" 
                  tick={{ fontSize: 10 }} 
                  tickFormatter={(tick) => tick.split(':')[0]}
                  interval={2}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value} MW`, 'Production']}
                  labelFormatter={(label) => `${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="production"
                  stroke="#f59e0b"
                  fillOpacity={1}
                  fill="url(#colorProduction)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`mt-4 grid grid-cols-2 gap-4 ${showDetails ? 'opacity-100' : 'opacity-100'}`}>
          <div>
            <p className="text-gray-600 font-medium">{solarData.dailyTotal} MWh</p>
            <p className="text-xs text-gray-500">Total today</p>
          </div>
          <div>
            <div className="flex items-center gap-1 text-gray-600 font-medium">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span>{solarData.trend}%</span>
            </div>
            <p className="text-xs text-gray-500">vs yesterday</p>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
            <span>Efficiency</span>
            <span>{solarData.efficiency}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full">
            <div 
              className="h-full bg-amber-400 rounded-full" 
              style={{ width: `${solarData.efficiency}%` }}
            />
          </div>
        </div>

        {/* Additional details that appear on hover */}
        <div className={`mt-4 transition-all duration-300 ${showDetails ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0 overflow-hidden'}`}>
          <div className="grid grid-cols-3 gap-2 mt-4 text-xs bg-white/50 p-3 rounded-lg">
            <div className="flex flex-col items-center">
              <Leaf className="w-4 h-4 text-green-500 mb-1" />
              <span className="font-medium text-gray-800">{solarData.co2Saved} tons</span>
              <span className="text-gray-500">CO₂ saved</span>
            </div>
            <div className="flex flex-col items-center">
              <Clock className="w-4 h-4 text-amber-500 mb-1" />
              <span className="font-medium text-gray-800">{solarData.peakTime}</span>
              <span className="text-gray-500">Peak time</span>
            </div>
            <div className="flex flex-col items-center">
              <Cloud className="w-4 h-4 text-blue-500 mb-1" />
              <span className="font-medium text-gray-800">-{solarData.weatherInfluence}%</span>
              <span className="text-gray-500">Weather impact</span>
            </div>
          </div>
          
          {/* Production constraints section */}
          {hasConstraints && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-gray-700">Active Constraints</span>
              </div>
              <div className="bg-white/50 rounded-lg overflow-hidden">
                {solarData.activeConstraints.map((constraint, index) => (
                  <div 
                    key={`constraint-${index}`} 
                    className={`border-b border-gray-100 last:border-b-0 p-2 flex items-start gap-2 ${index % 2 === 0 ? 'bg-white/30' : ''}`}
                  >
                    <div className={`mt-0.5 ${getConstraintSeverityColor(constraint.severity)}`}>
                      {getConstraintIcon(constraint.type)}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-700">{constraint.message}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-2xs ${getConstraintSeverityColor(constraint.severity)}`}>
                          -{constraint.impact}% impact
                        </span>
                        {constraint.startTime && (
                          <span className="text-2xs text-gray-500">
                            {constraint.startTime} - {constraint.endTime}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-2 text-xs">
                <span className="text-gray-500">
                  Potential without constraints:
                </span>
                <span className="font-medium text-gray-700">
                  {solarData.idealProduction} MW
                </span>
              </div>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default SolarProductionWidget; 