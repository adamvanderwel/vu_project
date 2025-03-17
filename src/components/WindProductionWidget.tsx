'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wind, ArrowUpRight, TrendingUp, Cloud, CloudLightning, Clock, Leaf, AlertTriangle, PlugZap, WrenchIcon, ArrowUp } from 'lucide-react';
import Link from 'next/link';
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip } from 'recharts';

interface Constraint {
  type: 'grid' | 'maintenance' | 'equipment' | 'regulatory' | 'environmental';
  severity: 'low' | 'moderate' | 'high';
  impact: number; // percentage reduction
  message: string;
  startTime?: string;
  endTime?: string;
}

interface WindProductionData {
  currentProduction: number;
  idealProduction: number; // What could be produced without constraints
  dailyTotal: number;
  trend: number;
  efficiency: number;
  peakTime: string;
  co2Saved: number;
  windSpeed: number; // m/s
  windDirection: string; // N, NE, E, etc.
  activeConstraints: Constraint[];
  hourlyData: Array<{
    hour: string;
    production: number;
    potentialProduction?: number;
    windSpeed?: number;
  }>;
  forecast: 'low-wind' | 'optimal' | 'high-wind' | 'storm';
}

// In a real application, this would be fetched from an API
const getWindData = (): WindProductionData => {
  // Generate realistic wind production curve - more variable than solar
  const hourlyData = Array.from({ length: 24 }, (_, i) => {
    // Base wind speed with some variability (higher at night)
    const baseWindSpeed = 5 + Math.sin((i - 6) * 0.5) * 3 + (Math.random() * 2);
    const windSpeed = Math.round(baseWindSpeed * 10) / 10;
    
    // Wind production based on wind speed (cubic relationship)
    // Turbines produce from ~3 m/s up to ~25 m/s with optimal around 12-15 m/s
    let potentialProduction = 0;
    
    if (windSpeed >= 3 && windSpeed <= 25) {
      if (windSpeed <= 12) {
        // Ramp up - cubic relationship with wind speed
        potentialProduction = Math.pow(windSpeed / 12, 3) * 8;
      } else if (windSpeed <= 20) {
        // Optimal range - flat maximum output
        potentialProduction = 8;
      } else {
        // High winds - begin to decrease output (safety)
        potentialProduction = 8 * Math.max(0, (25 - windSpeed) / 5);
      }
      
      // Add slight randomization
      potentialProduction *= (0.9 + Math.random() * 0.2);
      
      // Round to 1 decimal place
      potentialProduction = Math.round(potentialProduction * 10) / 10;
    }
    
    // Apply random constraints to certain hours
    let production = potentialProduction;
    
    // Grid constraints during morning peak electricity demand (7am-9am)
    if (i >= 7 && i <= 9 && Math.random() > 0.7) {
      production = potentialProduction * 0.8; // 20% reduction
    }
    
    // Random maintenance in early afternoon
    if (i >= 13 && i <= 15 && Math.random() > 0.8) {
      production = potentialProduction * 0.6; // 40% reduction
    }
    
    // Environmental constraints (e.g., bird migration) in evening
    if (i >= 18 && i <= 20 && Math.random() > 0.7) {
      production = potentialProduction * 0.7; // 30% reduction
    }
    
    return {
      hour: `${String(i).padStart(2, '0')}:00`,
      production: Math.round(production * 10) / 10,
      potentialProduction,
      windSpeed
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
  const currentWindSpeed = hourlyData[currentHour]?.windSpeed || 0;
  
  // Wind directions - 16 cardinal directions
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const windDirection = directions[Math.floor(Math.random() * directions.length)];
  
  // Generate current wind condition
  let forecast: 'low-wind' | 'optimal' | 'high-wind' | 'storm';
  
  if (currentWindSpeed < 5) {
    forecast = 'low-wind';
  } else if (currentWindSpeed >= 5 && currentWindSpeed <= 15) {
    forecast = 'optimal';
  } else if (currentWindSpeed > 15 && currentWindSpeed <= 20) {
    forecast = 'high-wind';
  } else {
    forecast = 'storm';
  }
  
  // Generate some realistic constraints
  const constraints: Constraint[] = [];
  
  // Add grid constraint during morning peak
  if (currentHour >= 7 && currentHour <= 9 && Math.random() > 0.6) {
    constraints.push({
      type: 'grid',
      severity: 'moderate',
      impact: 20,
      message: 'Grid congestion during peak demand',
      startTime: '07:00',
      endTime: '09:00'
    });
  }
  
  // Add maintenance constraint
  if (currentHour >= 13 && currentHour <= 15 && Math.random() > 0.7) {
    constraints.push({
      type: 'maintenance',
      severity: 'high',
      impact: 40,
      message: 'Scheduled turbine maintenance',
      startTime: '13:00',
      endTime: '15:00'
    });
  }
  
  // Add environmental constraint
  if (currentHour >= 18 && currentHour <= 20 && Math.random() > 0.7) {
    constraints.push({
      type: 'environmental',
      severity: 'moderate',
      impact: 30,
      message: 'Bird migration protection - reduced speed',
      startTime: '18:00',
      endTime: '20:00'
    });
  }
  
  // Add equipment constraint randomly
  if (Math.random() > 0.8) {
    constraints.push({
      type: 'equipment',
      severity: 'low',
      impact: 10,
      message: 'Turbine 3 operating at reduced capacity',
    });
  }
  
  // High wind safety constraint
  if (currentWindSpeed > 20) {
    constraints.push({
      type: 'regulatory',
      severity: 'high',
      impact: 50,
      message: 'Safety cut-out due to excessive wind speed',
    });
  }
  
  // Calculate efficiency (actual vs theoretical maximum)
  const maxTheoretical = 24 * 8; // 24 hours at 8 MW max
  const efficiency = Math.round((dailyTotal / maxTheoretical) * 100);
  
  // Simulating real data - in production this would come from your API
  return {
    currentProduction,
    idealProduction,
    dailyTotal, // MWh
    trend: 8, // % increase from yesterday
    efficiency,
    peakTime: hourlyData[peakHour].hour,
    co2Saved: Math.round(dailyTotal * 0.5), // 0.5 tons of CO2 saved per MWh (slightly higher than solar)
    windSpeed: currentWindSpeed,
    windDirection,
    activeConstraints: constraints,
    hourlyData,
    forecast
  };
};

const WindProductionWidget = () => {
  const windData = getWindData();
  const [showDetails, setShowDetails] = useState(false);
  
  // Format data for the chart
  const chartData = windData.hourlyData;

  const renderWindConditionIcon = () => {
    switch(windData.forecast) {
      case 'low-wind':
        return <Wind className="w-5 h-5 text-gray-500" />;
      case 'optimal':
        return <Wind className="w-5 h-5 text-blue-500" />;
      case 'high-wind':
        return <Cloud className="w-5 h-5 text-blue-500" />;
      case 'storm':
        return <CloudLightning className="w-5 h-5 text-orange-500" />;
      default:
        return <Wind className="w-5 h-5 text-blue-500" />;
    }
  };
  
  const hasConstraints = windData.activeConstraints.length > 0;
  const totalConstraintImpact = windData.activeConstraints.reduce((sum, constraint) => sum + constraint.impact, 0);

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
      case 'environmental': return <Leaf className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  // Get wind condition description
  const getWindConditionText = () => {
    switch(windData.forecast) {
      case 'low-wind': return 'Below optimal';
      case 'optimal': return 'Optimal conditions';
      case 'high-wind': return 'High wind speed';
      case 'storm': return 'Safety cut-out';
      default: return 'Normal conditions';
    }
  };

  return (
    <motion.div 
      className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-lg p-6 border border-sky-100 hover:shadow-md transition-all cursor-pointer"
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onHoverStart={() => setShowDetails(true)}
      onHoverEnd={() => setShowDetails(false)}
    >
      <Link href="/productie/zon-wind" className="block h-full">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="bg-blue-400 p-2 rounded-lg">
              <Wind className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Wind Production</h3>
          </div>
          <ArrowUpRight className="w-5 h-5 text-blue-500" />
        </div>

        <div className="mt-5 flex justify-between items-end">
          <div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-gray-800">{windData.currentProduction}</span>
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
            {renderWindConditionIcon()}
            <span className="text-sm text-gray-600">
              {getWindConditionText()}
            </span>
          </div>
        </div>

        {/* Mini production graph - visible on hover */}
        <div className={`mt-4 transition-all duration-300 ${showDetails ? 'opacity-100 max-h-32' : 'opacity-0 max-h-0 overflow-hidden'}`}>
          <div className="h-[100px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorWindProduction" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="hour" 
                  tick={{ fontSize: 10 }} 
                  tickFormatter={(tick) => tick.split(':')[0]}
                  interval={3}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value} MW`, 'Production']}
                  labelFormatter={(label) => `${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="production"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorWindProduction)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`mt-4 grid grid-cols-2 gap-4 ${showDetails ? 'opacity-100' : 'opacity-100'}`}>
          <div>
            <p className="text-gray-600 font-medium">{windData.dailyTotal} MWh</p>
            <p className="text-xs text-gray-500">Total today</p>
          </div>
          <div>
            <div className="flex items-center gap-1 text-gray-600 font-medium">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span>{windData.trend}%</span>
            </div>
            <p className="text-xs text-gray-500">vs yesterday</p>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
            <span>Efficiency</span>
            <span>{windData.efficiency}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full">
            <div 
              className="h-full bg-blue-400 rounded-full" 
              style={{ width: `${windData.efficiency}%` }}
            />
          </div>
        </div>

        {/* Additional details that appear on hover */}
        <div className={`mt-4 transition-all duration-300 ${showDetails ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0 overflow-hidden'}`}>
          <div className="grid grid-cols-3 gap-2 mt-4 text-xs bg-white/50 p-3 rounded-lg">
            <div className="flex flex-col items-center">
              <Leaf className="w-4 h-4 text-green-500 mb-1" />
              <span className="font-medium text-gray-800">{windData.co2Saved} tons</span>
              <span className="text-gray-500">CO₂ saved</span>
            </div>
            <div className="flex flex-col items-center">
              <Wind className="w-4 h-4 text-blue-500 mb-1" />
              <span className="font-medium text-gray-800">{windData.windSpeed} m/s</span>
              <span className="text-gray-500">Wind speed</span>
            </div>
            <div className="flex flex-col items-center">
              <ArrowUp 
                className="w-4 h-4 text-blue-500 mb-1"
                style={{ 
                  transform: `rotate(${
                    windData.windDirection === 'N' ? 0 :
                    windData.windDirection === 'NE' ? 45 :
                    windData.windDirection === 'E' ? 90 :
                    windData.windDirection === 'SE' ? 135 :
                    windData.windDirection === 'S' ? 180 :
                    windData.windDirection === 'SW' ? 225 :
                    windData.windDirection === 'W' ? 270 :
                    windData.windDirection === 'NW' ? 315 : 0
                  }deg)` 
                }}
              />
              <span className="font-medium text-gray-800">{windData.windDirection}</span>
              <span className="text-gray-500">Direction</span>
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
                {windData.activeConstraints.map((constraint, index) => (
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
                  {windData.idealProduction} MW
                </span>
              </div>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default WindProductionWidget; 