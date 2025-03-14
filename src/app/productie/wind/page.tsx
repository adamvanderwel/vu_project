'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wind, ArrowUpRight, ArrowDownRight, Settings, AlertTriangle, BarChart3, Wind as WindIcon, ChevronDown, ChevronUp, Info, Calendar, Activity, History, Zap, CheckCircle, AlertCircle, Check, X, ArrowRight, Clock, Timer } from 'lucide-react';
import Link from 'next/link';
import { ProductionGraph, allDaysData, productionEvents, initializeProductionEvents } from './components/ProductionGraph';
import { ProductionEvents } from './components/ProductionEvents';
import { FinancialOverview } from './components/FinancialOverview';
import { DatePicker } from './components/DatePicker';
import { InfoTooltip } from './components/InfoTooltip';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

// Helper function to find day data by Date object
const findDayDataByDate = (date: Date) => {
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

  // If there's no data for this date, generate synthetic data based on the first day data
  if (!matchedDay) {
    // Generate a synthetic day based on the first day with some randomization
    const firstDay = allDaysData[0];
    return {
      date: format(date, 'd MMM yyyy', { locale: nl }),
      dateObj: date,
      data: firstDay.data.map(hourData => ({
        hour: hourData.hour,
        actualProduction: hourData.actualProduction * (0.8 + Math.random() * 0.4), // Randomize between 80-120% of base
        potentialProduction: hourData.potentialProduction * (0.8 + Math.random() * 0.4),
        price: hourData.price * (0.9 + Math.random() * 0.2) // Less variation in price
      }))
    };
  }
  
  return matchedDay;
};

// Tabs definition
type TabType = 'live' | 'historical';

const WindProduction = () => {
  const [activeTab, setActiveTab] = useState<TabType>('live');
  
  // Set default selected dates to include days with curtailment events (Feb 28, Mar 3, Mar 7, Mar 11)
  const [selectedDates, setSelectedDates] = useState<Date[]>([
    new Date(2024, 1, 28), // Feb 28
    new Date(2024, 2, 3),  // Mar 3 
    new Date(2024, 2, 7),  // Mar 7
    new Date(2024, 2, 11)  // Mar 11
  ]);
  
  const [showCalendar, setShowCalendar] = useState(false);
  const [dateSelectionMode, setDateSelectionMode] = useState<'single' | 'multiple'>('multiple');
  const [showFinancialDetails, setShowFinancialDetails] = useState(true); // Auto-expand financial details
  const [showProductionEvents, setShowProductionEvents] = useState(true);

  // Initialize production events when component mounts
  useEffect(() => {
    // Ensure curtailment events are present in the data
    initializeProductionEvents();
    
    // Log number of curtailment events for debugging
    const curtailmentEvents = Object.values(productionEvents).flat().filter(
      event => event.type === 'grid' && 
      (event.reason.toLowerCase().includes('curtail') || 
       event.reason.toLowerCase().includes('tennet'))
    );
    
    console.log(`Found ${curtailmentEvents.length} curtailment events in the data`);
  }, []);

  // Handle date selection from the calendar
  const handleDateSelect = (dates: Date[]) => {
    setSelectedDates(dates);
    // If multiple dates are selected, update the selection mode state
    if (dates.length > 1) {
      setDateSelectionMode('multiple');
    }
  };

  // Get data for the selected dates
  const selectedDaysData = selectedDates.map(date => 
    findDayDataByDate(date)
  ).filter(Boolean);
  
  // Calculate aggregated stats across all selected dates
  const calculateAggregatedStats = () => {
    if (selectedDates.length === 0) return null;

    const totalCapacity = 12.0; // Assumed constant capacity
    
    // Aggregate production and efficiency across all selected days
    let totalActualProduction = 0;
    let totalPotentialProduction = 0;
    let totalCo2Saved = 0;
    let dayCount = 0;
    
    selectedDates.forEach(date => {
      const dayData = findDayDataByDate(date);
      if (!dayData) return;
      dayCount++;
      
      const hourlyData = dayData.data;
      
      // Sum up production for this day
      const dayActualProduction = hourlyData.reduce((acc, hour) => acc + hour.actualProduction, 0);
      const dayPotentialProduction = hourlyData.reduce((acc, hour) => acc + hour.potentialProduction, 0);
      
      totalActualProduction += dayActualProduction;
      totalPotentialProduction += dayPotentialProduction;
      
      // Calculate CO2 savings
      const co2Factor = 0.5; // tons of CO2 saved per MWh
      totalCo2Saved += (dayActualProduction * co2Factor);
    });
    
    // If no valid days were found, return default stats to avoid empty UI
    if (dayCount === 0) {
      return {
        totalCapacity,
        currentProduction: 7.5, // Default reasonable values
        averageEfficiency: 87,
        co2Saved: 3.2,
      };
    }
    
    // Calculate averages
    const avgProduction = totalActualProduction / (dayCount * 24);
    
    // Calculate average efficiency
    const avgEfficiency = totalPotentialProduction > 0 
      ? (totalActualProduction / totalPotentialProduction) * 100 
      : 0;
    
    // Average CO2 saved per day
    const avgCo2Saved = totalCo2Saved / dayCount;
    
    return {
      totalCapacity,
      currentProduction: avgProduction,
      averageEfficiency: Math.round(avgEfficiency),
      co2Saved: avgCo2Saved / 24, // Average per day
    };
  };

  const aggregatedStats = calculateAggregatedStats();

  // Calculate date range display string
  const getDateRangeString = () => {
    if (selectedDates.length === 0) return '';
    if (selectedDates.length === 1) {
      return format(selectedDates[0], 'd MMMM yyyy', { locale: nl });
    }
    
    // Sort dates chronologically
    const sortedDates = [...selectedDates].sort((a, b) => a.getTime() - b.getTime());
    return `${format(sortedDates[0], 'd MMM', { locale: nl })} - ${format(sortedDates[sortedDates.length - 1], 'd MMM yyyy', { locale: nl })}`;
  };

  const windAssets = [
    {
      id: 1,
      name: 'Wind Park Kubbeweg T1',
      location: 'Biddinghuizen',
      capacity: 3.5,
      currentProduction: 2.8,
      efficiency: 92,
      windSpeed: 14.5,
      status: 'operational',
      alerts: 0,
      lastUpdated: '2 min ago',
      productionConstraints: [
        {
          type: 'grid',
          reason: 'Grid curtailment order',
          impact: 'Operating at 80% capacity per TenneT request',
          lossPotential: '700 kWh (€91.00)',
          compensation: 'Yes - TenneT curtailment fee',
          compensationAmount: '€91.00',
          isCompensated: true,
          compensationSource: 'TenneT curtailment fee',
          startTime: '09:30',
          estimatedDuration: '3 hours',
          severity: 'moderate',
          statusText: 'Active',
          status: 'active'
        }
      ],
      financialImpact: {
        dailyRevenue: 1120,
        projectedMonthly: 33600,
        currency: 'EUR',
        lostRevenue: 91.00,
        curtailmentCompensation: 91.00
      }
    },
    {
      id: 2,
      name: 'Wind Park Kubbeweg T2',
      location: 'Biddinghuizen',
      capacity: 3.5,
      currentProduction: 3.1,
      efficiency: 96,
      windSpeed: 15.2,
      status: 'operational',
      alerts: 1,
      lastUpdated: '1 min ago',
      productionConstraints: [
        {
          type: 'grid',
          reason: 'Grid congestion warning',
          impact: 'Potential curtailment in next hour',
          lossPotential: '120 kWh (€15.60)',
          compensation: 'Yes - TenneT grid operator fee',
          compensationAmount: '€15.60',
          isCompensated: true,
          compensationSource: 'TenneT grid operator fee',
          startTime: '12:15',
          estimatedDuration: '1 hour',
          severity: 'low',
          statusText: 'Pending',
          status: 'pending'
        }
      ],
      financialImpact: {
        dailyRevenue: 1240,
        projectedMonthly: 37200,
        currency: 'EUR'
      }
    },
    {
      id: 3,
      name: 'Wind Park North',
      location: 'Den Helder',
      capacity: 5.0,
      currentProduction: 4.2,
      efficiency: 88,
      windSpeed: 18.3,
      status: 'maintenance',
      alerts: 2,
      lastUpdated: '5 min ago',
      productionConstraints: [
        {
          type: 'maintenance',
          reason: 'Scheduled gearbox inspection',
          impact: 'Operating at 60% capacity during inspection',
          lossPotential: '520 kWh (€67.60)',
          compensation: 'No - scheduled maintenance',
          compensationAmount: '€0.00',
          isCompensated: false,
          compensationSource: 'scheduled maintenance',
          startTime: '08:00',
          estimatedDuration: '4 hours',
          severity: 'high',
          statusText: 'Active',
          status: 'active'
        },
        {
          type: 'technical',
          reason: 'Pitch system alert',
          impact: 'Automatic safety limitation',
          lossPotential: '200 kWh (€26.00)',
          compensation: 'No - maintenance cost',
          compensationAmount: '€0.00',
          isCompensated: false,
          compensationSource: 'maintenance cost',
          statusText: 'Unknown',
          status: 'unknown'
        }
      ],
      financialImpact: {
        dailyRevenue: 1680,
        projectedMonthly: 50400,
        currency: 'EUR',
        lostRevenue: 84.50,
        maintenanceCost: 580
      }
    },
  ];

  // Summary stats for live view
  const liveSummaryStats = {
    totalCapacity: windAssets.reduce((acc, asset) => acc + asset.capacity, 0),
    currentProduction: windAssets.reduce((acc, asset) => acc + asset.currentProduction, 0),
    averageEfficiency: Math.round(windAssets.reduce((acc, asset) => acc + asset.efficiency, 0) / windAssets.length),
    totalAlerts: windAssets.reduce((acc, asset) => acc + asset.alerts, 0),
    assetsInMaintenance: windAssets.filter(asset => asset.status === 'maintenance').length,
    totalDailyRevenue: windAssets.reduce((acc, asset) => acc + asset.financialImpact.dailyRevenue, 0),
    totalLostRevenue: windAssets.reduce((acc, asset) => acc + (asset.financialImpact.lostRevenue || 0), 0),
    totalCurtailmentCompensation: windAssets.reduce((acc, asset) => acc + (asset.financialImpact.curtailmentCompensation || 0), 0),
    totalConstraints: windAssets.reduce((acc, asset) => acc + asset.productionConstraints.length, 0),
    gridCurtailmentCount: windAssets.reduce((acc, asset) => acc + asset.productionConstraints.filter(c => c.type === 'grid').length, 0)
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-semibold">Wind Energy Production</h1>
          <p className="text-gray-500 mt-2">Insights for your wind energy assets</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('live')}
            className={`py-4 px-1 border-b-2 font-medium text-md ${
              activeTab === 'live'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              <span>Live Status</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('historical')}
            className={`py-4 px-1 border-b-2 font-medium text-md ${
              activeTab === 'historical'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <History className="w-5 h-5" />
              <span>Historical Analysis</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Live Status Tab Content */}
      {activeTab === 'live' && (
        <div className="space-y-8">
          {/* Live Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <motion.div
              className="bg-white rounded-lg p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-medium">Current Output</h3>
                <InfoTooltip 
                  title="Current Output"
                  explanation="The total amount of electricity being generated by all wind turbines at this moment."
                  interpretation={`Your wind turbines are currently producing ${liveSummaryStats.currentProduction.toFixed(1)} MW out of a total capacity of ${liveSummaryStats.totalCapacity.toFixed(1)} MW, which means they are operating at ${((liveSummaryStats.currentProduction / liveSummaryStats.totalCapacity) * 100).toFixed(0)}% of maximum capacity.`}
                />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{liveSummaryStats.currentProduction.toFixed(1)}</span>
                <span className="text-gray-500">/ {liveSummaryStats.totalCapacity.toFixed(1)} MW</span>
              </div>
              <div className="mt-2 text-gray-500 text-sm">
                <div className="flex items-center gap-2">
                  <span>Live data</span>
                </div>
                {liveSummaryStats.currentProduction < liveSummaryStats.totalCapacity && (
                  <div className="mt-1 text-amber-600 flex items-center gap-1">
                    <ArrowDownRight className="w-3 h-3" />
                    <span>{(liveSummaryStats.totalCapacity - liveSummaryStats.currentProduction).toFixed(1)} MW below capacity</span>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              className="bg-white rounded-lg p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-medium">Daily Revenue</h3>
                <InfoTooltip 
                  title="Daily Revenue"
                  explanation="Estimated revenue from your wind turbines based on current production and market prices."
                  interpretation={`Your turbines are generating approximately €${liveSummaryStats.totalDailyRevenue.toLocaleString()} in revenue today. ${liveSummaryStats.totalLostRevenue > 0 ? `You're losing about €${liveSummaryStats.totalLostRevenue.toLocaleString()} due to constraints, but receiving €${liveSummaryStats.totalCurtailmentCompensation.toLocaleString()} in TenneT compensation for grid curtailment.` : 'All turbines are operating at optimal revenue levels.'}`}
                />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">€{liveSummaryStats.totalDailyRevenue.toLocaleString()}</span>
              </div>
              <div className="mt-2 text-gray-500 text-sm">
                <div className="flex items-center gap-2">
                  <span>Estimated today</span>
                </div>
                {liveSummaryStats.totalLostRevenue > 0 && (
                  <div className="mt-1 text-red-600 flex items-center gap-1">
                    <ArrowDownRight className="w-3 h-3" />
                    <span>€{liveSummaryStats.totalLostRevenue.toLocaleString()} lost revenue</span>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              className="bg-white rounded-lg p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                <h3 className="text-lg font-medium">Production Constraints</h3>
                <InfoTooltip 
                  title="Production Constraints"
                  explanation="Factors currently limiting your wind turbines from producing at maximum capacity."
                  interpretation={`You have ${liveSummaryStats.totalConstraints} active production constraint${liveSummaryStats.totalConstraints !== 1 ? 's' : ''}. ${liveSummaryStats.totalConstraints === 0 ? 'All systems are operating at maximum capability.' : 'See details for each asset below.'}`}
                />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{liveSummaryStats.totalConstraints}</span>
                <span className="text-gray-500">active</span>
              </div>
              <div className="mt-2 text-gray-500 text-sm">
                {liveSummaryStats.totalConstraints > 0 ? (
                  <span className="text-yellow-600">Limiting production</span>
                ) : (
                  <span className="text-green-600">No constraints active</span>
                )}
              </div>
            </motion.div>

            <motion.div
              className="bg-white rounded-lg p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Settings className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-medium">Maintenance</h3>
                <InfoTooltip 
                  title="Maintenance"
                  explanation="The number of turbines currently undergoing scheduled or unscheduled maintenance."
                  interpretation={`You have ${liveSummaryStats.assetsInMaintenance} asset${liveSummaryStats.assetsInMaintenance !== 1 ? 's' : ''} currently in maintenance. ${liveSummaryStats.assetsInMaintenance === 0 ? 'All turbines are operational.' : 'Regular maintenance helps prevent failures and extends turbine lifespan.'}`}
                />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{liveSummaryStats.assetsInMaintenance}</span>
                <span className="text-gray-500">assets</span>
              </div>
              <div className="flex items-center gap-2 mt-2 text-gray-500 text-sm">
                <span>Currently in maintenance</span>
              </div>
            </motion.div>
          </div>

          {/* Wind Assets List - Live View */}
          <div className="bg-white rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-xl font-semibold">Wind Assets</h3>
              <div className="text-sm text-gray-500">Live Status</div>
            </div>
            <div className="divide-y">
              {windAssets.map((asset) => (
                <motion.div
                  key={asset.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="text-lg font-medium">{asset.name}</h4>
                        {asset.alerts > 0 && (
                          <span className="px-2 py-1 rounded-full bg-red-100 text-red-600 text-xs">
                            {asset.alerts} alerts
                          </span>
                        )}
                        {asset.productionConstraints.length > 0 && (
                          <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-600 text-xs">
                            {asset.productionConstraints.length} constraints
                          </span>
                        )}
                      </div>
                      <p className="text-gray-500">{asset.location}</p>
                    </div>
                    <Link
                      href={`/productie/wind/${asset.id}`}
                      className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm flex items-center gap-2"
                    >
                      Details
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-medium mb-3">Production Status</h5>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500 flex items-center">
                            Current Output
                            <InfoTooltip 
                              title="Current Production"
                              explanation="The amount of electricity this turbine is generating right now."
                              interpretation={`This turbine is producing ${asset.currentProduction} MW out of its ${asset.capacity} MW capacity (${Math.round((asset.currentProduction / asset.capacity) * 100)}% of max capacity).`}
                              position="bottom"
                            />
                          </p>
                          <p className="text-base font-medium">
                            {asset.currentProduction} / {asset.capacity} MW
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 flex items-center">
                            Efficiency
                            <InfoTooltip 
                              title="Efficiency"
                              explanation="How effectively this turbine converts available wind energy into electrical power."
                              interpretation={`This turbine is operating at ${asset.efficiency}% efficiency, which is ${asset.efficiency > 90 ? 'excellent' : asset.efficiency > 80 ? 'good' : asset.efficiency > 70 ? 'average' : 'below average'}.`}
                              position="bottom"
                            />
                          </p>
                          <p className="text-base font-medium">{asset.efficiency}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 flex items-center">
                            Wind Speed
                            <InfoTooltip 
                              title="Wind Speed"
                              explanation="Current wind speed measured at the turbine's hub height."
                              interpretation={`The current wind speed of ${asset.windSpeed} m/s is ${asset.windSpeed < 3 ? 'below the cut-in speed for most turbines' : asset.windSpeed > 25 ? 'approaching cut-out speed for safety' : 'within the optimal operating range'}.`}
                              position="bottom"
                            />
                          </p>
                          <p className="text-base font-medium">{asset.windSpeed} m/s</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 flex items-center">
                            Status
                            <InfoTooltip 
                              title="Operational Status"
                              explanation="The current operational state of the turbine."
                              interpretation={`This turbine is currently ${asset.status === 'operational' ? 'fully operational and generating electricity' : 'undergoing maintenance and not producing at full capacity'}.`}
                              position="bottom"
                            />
                          </p>
                          <p className={`text-base font-medium ${
                            asset.status === 'operational' ? 'text-green-500' : 'text-yellow-500'
                          }`}>
                            {asset.status === 'operational' ? 'Operational' : 'In Maintenance'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-medium mb-3">Financial Overview</h5>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500 flex items-center">
                            Daily Revenue
                            <InfoTooltip 
                              title="Daily Revenue"
                              explanation="Estimated revenue from this turbine based on current production and market prices."
                              interpretation={`This turbine is generating approximately €${asset.financialImpact.dailyRevenue.toLocaleString()} in revenue today.`}
                              position="bottom"
                            />
                          </p>
                          <p className="text-lg font-medium text-green-600">€{asset.financialImpact.dailyRevenue.toLocaleString()}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500 flex items-center">
                            Monthly Projection
                            <InfoTooltip 
                              title="Monthly Projection"
                              explanation="Estimated monthly revenue based on current performance."
                              interpretation={`If current conditions persist, this turbine will generate approximately €${asset.financialImpact.projectedMonthly.toLocaleString()} this month.`}
                              position="bottom"
                            />
                          </p>
                          <p className="text-base font-medium">≈ €{asset.financialImpact.projectedMonthly.toLocaleString()}</p>
                        </div>
                        
                        {asset.financialImpact.lostRevenue && (
                          <div>
                            <p className="text-sm text-gray-500 flex items-center">
                              Lost Revenue
                              <InfoTooltip 
                                title="Lost Revenue"
                                explanation="Estimated revenue lost due to constraints and maintenance issues."
                                interpretation={`This turbine is losing approximately €${asset.financialImpact.lostRevenue.toLocaleString()} due to the current constraints and maintenance issues.`}
                                position="bottom"
                              />
                            </p>
                            <p className="text-base font-medium text-red-600">-€{asset.financialImpact.lostRevenue.toLocaleString()}</p>
                          </div>
                        )}
                        
                        {asset.financialImpact.curtailmentCompensation && (
                          <div>
                            <p className="text-sm text-gray-500 flex items-center">
                              TenneT Compensation
                              <InfoTooltip 
                                title="TenneT Compensation"
                                explanation="Payment received from TenneT for curtailment of your wind production."
                                interpretation={`You're receiving €${asset.financialImpact.curtailmentCompensation.toLocaleString()} from TenneT today to compensate for the mandated production curtailment.`}
                                position="bottom"
                              />
                            </p>
                            <p className="text-base font-medium text-blue-600">+€{asset.financialImpact.curtailmentCompensation.toLocaleString()}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50 p-5 rounded-lg">
                      <h5 className="font-semibold text-base mb-4">Production Constraints</h5>
                      
                      {asset.productionConstraints.length === 0 ? (
                        <div className="flex items-center h-24 justify-center text-green-600">
                          <div className="flex flex-col items-center">
                            <CheckCircle className="h-6 w-6 mb-2" />
                            <p className="text-sm">No active constraints - Producing at maximum capacity</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                          {asset.productionConstraints.map((constraint, index) => {
                            // Define colors based on constraint type
                            const colors = {
                              grid: { border: '#f97316', bg: '#fff7ed' },
                              maintenance: { border: '#3b82f6', bg: '#eff6ff' },
                              technical: { border: '#ef4444', bg: '#fef2f2' },
                              weather: { border: '#8b5cf6', bg: '#f5f3ff' },
                              default: { border: '#6b7280', bg: '#f9fafb' }
                            };
                            
                            const colorSet = colors[constraint.type as keyof typeof colors] || colors.default;
                            
                            return (
                              <div 
                                key={index} 
                                className="border-l-4 rounded-md p-4 text-sm shadow-sm" 
                                style={{ 
                                  borderColor: colorSet.border,
                                  backgroundColor: colorSet.bg
                                }}
                              >
                                <div className="flex justify-between items-center mb-3">
                                  <h3 className="font-semibold text-base text-gray-800">{constraint.reason}</h3>
                                  <div className={`
                                    px-2 py-0.5 rounded-full text-xs font-medium
                                    ${constraint.status === 'active' ? 'bg-red-100 text-red-800' : 
                                      constraint.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                      'bg-gray-100 text-gray-800'}
                                  `}>
                                    {constraint.statusText || 'Unknown'}
                                  </div>
                                </div>
                                
                                <div className="text-sm text-gray-700 mb-3">{constraint.impact}</div>
                                
                                <div className="grid grid-cols-3 gap-2 mb-3 text-xs text-gray-600">
                                  {constraint.startTime && (
                                    <div className="flex items-center">
                                      <Clock className="h-3 w-3 mr-1.5 text-gray-500" />
                                      <div>
                                        <div className="text-xs text-gray-500 mb-0.5">Start Time</div>
                                        <div className="font-medium">{constraint.startTime}</div>
                                      </div>
                                    </div>
                                  )}
                                  {constraint.estimatedDuration && (
                                    <div className="flex items-center">
                                      <Timer className="h-3 w-3 mr-1.5 text-gray-500" />
                                      <div>
                                        <div className="text-xs text-gray-500 mb-0.5">Duration</div>
                                        <div className="font-medium">{constraint.estimatedDuration}</div>
                                      </div>
                                    </div>
                                  )}
                                  {constraint.severity && (
                                    <div className="flex items-center">
                                      <Activity className="h-3 w-3 mr-1.5 text-gray-500" />
                                      <div>
                                        <div className="text-xs text-gray-500 mb-0.5">Severity</div>
                                        <div className="font-medium capitalize">{constraint.severity}</div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-200">
                                  <div className="bg-red-50 rounded p-2 flex items-start">
                                    <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0 text-red-500 mt-0.5" />
                                    <div>
                                      <div className="font-medium text-xs text-red-800 mb-0.5">Production Loss</div>
                                      <div>
                                        <span className="text-red-600 text-sm font-semibold">
                                          {constraint.lossPotential.split('(')[0].trim()}
                                        </span>
                                      </div>
                                      <div className="text-red-500 text-xs mt-0.5">
                                        {constraint.lossPotential.match(/\(([^)]+)\)/)?.[1]}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className={`rounded p-2 flex items-start ${constraint.isCompensated ? "bg-green-50" : "bg-gray-50"}`}>
                                    {constraint.isCompensated ? (
                                      <Check className="h-4 w-4 mr-2 flex-shrink-0 text-green-500 mt-0.5" />
                                    ) : (
                                      <X className="h-4 w-4 mr-2 flex-shrink-0 text-gray-500 mt-0.5" />
                                    )}
                                    <div>
                                      <div className={`font-medium text-xs mb-0.5 ${constraint.isCompensated ? "text-green-800" : "text-gray-700"}`}>
                                        {constraint.isCompensated ? "Compensated" : "Not Compensated"}
                                      </div>
                                      {constraint.isCompensated ? (
                                        <>
                                          <div className="text-green-600 text-sm font-semibold">{constraint.compensationAmount}</div>
                                          <div className="text-green-600 text-xs mt-0.5">TenneT compensation</div>
                                        </>
                                      ) : (
                                        <div className="text-gray-600 text-xs mt-0.5">
                                          <span className="capitalize">{constraint.compensationSource}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Historical Analysis Tab Content */}
      {activeTab === 'historical' && (
        <div className="space-y-8">
          {/* Date Picker for Historical View */}
          <div className="bg-white rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-semibold">Historical Data Analysis</h3>
                <InfoTooltip 
                  title="Historical Data Analysis"
                  explanation="This section shows historical performance data for your wind turbines over a selected time period."
                  interpretation="Use the date picker to select specific days or date ranges to analyze your wind farm's past performance."
                  position="right"
                />
              </div>
              <div className="relative">
                <button 
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border hover:bg-gray-50"
                >
                  <Calendar className="w-5 h-5 text-blue-500" />
                  <span>{getDateRangeString()}</span>
                </button>

                {showCalendar && (
                  <div className="absolute right-0 mt-2 z-10">
                    <DatePicker 
                      selectedDates={selectedDates}
                      defaultSelectionMode={dateSelectionMode}
                      onModeChange={(mode) => setDateSelectionMode(mode)}
                      onDateSelect={(dates) => {
                        handleDateSelect(dates);
                        // Close calendar after confirmed selection in multi-day mode
                        // or immediate selection in single-day mode
                        if (dateSelectionMode === 'single' || dates.length >= 2) {
                          setShowCalendar(false);
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Production Graph */}
          <ProductionGraph selectedDates={selectedDates} />

          {/* Production Events - Now always visible without collapsible header */}
          <div className="bg-white rounded-lg mt-6 p-6">
            {selectedDates.length === 1 ? (
              <ProductionEvents selectedDate={format(selectedDates[0], 'd MMM yyyy')} />
            ) : (
              <ProductionEvents selectedDates={selectedDates} />
            )}
          </div>

          {/* Historical Stats */}
          {aggregatedStats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <motion.div
                className="bg-white rounded-lg p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <WindIcon className="w-5 h-5 text-blue-500" />
                  <h3 className="text-lg font-medium">Average Production</h3>
                  <InfoTooltip 
                    title="Average Production"
                    explanation="The average amount of electricity produced across the selected time period."
                    interpretation={`During this period, your wind turbines averaged ${aggregatedStats.currentProduction.toFixed(1)} MW production out of ${aggregatedStats.totalCapacity} MW capacity (${Math.round((aggregatedStats.currentProduction / aggregatedStats.totalCapacity) * 100)}% utilization).`}
                  />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{aggregatedStats.currentProduction.toFixed(1)}</span>
                  <span className="text-gray-500">/ {aggregatedStats.totalCapacity} MW</span>
                </div>
                <div className="flex items-center gap-2 mt-2 text-green-500 text-sm">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>12.3% vs previous period</span>
                </div>
              </motion.div>

              <motion.div
                className="bg-white rounded-lg p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  <h3 className="text-lg font-medium">Average Efficiency</h3>
                  <InfoTooltip 
                    title="Average Efficiency"
                    explanation="The average percentage of available wind energy that was successfully converted to electricity during this period."
                    interpretation={`Your average efficiency of ${aggregatedStats.averageEfficiency}% over this period is ${aggregatedStats.averageEfficiency > 90 ? 'excellent' : aggregatedStats.averageEfficiency > 80 ? 'good' : aggregatedStats.averageEfficiency > 70 ? 'average' : 'below average'}. Weather conditions and maintenance can impact efficiency.`}
                  />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{aggregatedStats.averageEfficiency}%</span>
                </div>
                <div className="flex items-center gap-2 mt-2 text-red-500 text-sm">
                  <ArrowDownRight className="w-4 h-4" />
                  <span>2.1% vs previous period</span>
                </div>
              </motion.div>

              <motion.div
                className="bg-white rounded-lg p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <Settings className="w-5 h-5 text-blue-500" />
                  <h3 className="text-lg font-medium">CO₂ Savings</h3>
                  <InfoTooltip 
                    title="CO₂ Savings"
                    explanation="The estimated amount of carbon dioxide emissions avoided by using wind energy instead of fossil fuels."
                    interpretation={`Your wind turbines saved approximately ${aggregatedStats.co2Saved.toFixed(1)} tons of CO₂ emissions during this period. This is equivalent to taking about ${Math.round(aggregatedStats.co2Saved * 5)} cars off the road for a day.`}
                  />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{aggregatedStats.co2Saved.toFixed(1)}</span>
                  <span className="text-gray-500">tons</span>
                </div>
                <div className="flex items-center gap-2 mt-2 text-green-500 text-sm">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>8.7% vs previous period</span>
                </div>
              </motion.div>
            </div>
          )}

          {/* Advanced Details Section (Collapsible) - Financial Details only */}
          <div className="space-y-6 mt-6">
            {/* Collapsible Financial Overview */}
            <div className="bg-white rounded-lg overflow-hidden">
              <button 
                onClick={() => setShowFinancialDetails(!showFinancialDetails)}
                className="w-full p-6 flex justify-between items-center border-b"
              >
                <div className="flex items-center gap-3">
                  <Info className="w-5 h-5 text-blue-500" />
                  <h3 className="text-xl font-semibold">Financial Details</h3>
                  <InfoTooltip 
                    title="Financial Details"
                    explanation="A detailed breakdown of financial metrics for your wind energy production during the selected period."
                    interpretation="This information helps you understand the economic performance of your wind turbines, including revenue, average prices, and savings from smart production management."
                    position="right"
                  />
                </div>
                {showFinancialDetails ? 
                  <ChevronUp className="w-5 h-5 text-gray-500" /> : 
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                }
              </button>
              
              {showFinancialDetails && (
                <div className="p-6">
                  {selectedDates.length === 1 ? (
                    <FinancialOverview 
                      selectedDate={format(selectedDates[0], 'd MMM yyyy')}
                      dayData={findDayDataByDate(selectedDates[0]) || allDaysData[0]}
                      previousDayData={undefined}
                    />
                  ) : (
                    <FinancialOverview
                      selectedDates={selectedDates}
                      multipleDaysData={selectedDates.map(date => findDayDataByDate(date))}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WindProduction; 