'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wind, ArrowUpRight, ArrowDownRight, Settings, AlertTriangle, BarChart3, Wind as WindIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { ProductionGraph, allDaysData } from './components/ProductionGraph';
import { ProductionEvents } from './components/ProductionEvents';
import { FinancialOverview } from './components/FinancialOverview';

const WindProduction = () => {
  const [selectedDate, setSelectedDate] = useState(allDaysData[0].date);

  const dateIndex = Math.max(0, allDaysData.findIndex(day => day.date === selectedDate));
  const isFirstDay = dateIndex === 0;
  const isLastDay = dateIndex === allDaysData.length - 1;
  
  const navigateDate = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' ? dateIndex - 1 : dateIndex + 1;
    if (newIndex >= 0 && newIndex < allDaysData.length) {
      setSelectedDate(allDaysData[newIndex].date);
    }
  };

  // Get day-specific data
  const currentDayData = allDaysData.find(day => day.date === selectedDate) || allDaysData[0];
  const previousDayData = dateIndex > 0 ? allDaysData[dateIndex - 1] : undefined;
  
  const calculateDayStats = (dayData: typeof currentDayData) => {
    const totalCapacity = 12.0;
    const hourlyData = dayData.data;
    
    const avgProduction = hourlyData.reduce((acc, hour) => acc + hour.actualProduction, 0) / 24;
    
    const avgEfficiency = hourlyData.reduce((acc, hour) => {
      const hourEfficiency = hour.potentialProduction > 0 
        ? (hour.actualProduction / hour.potentialProduction) * 100 
        : 0;
      return acc + hourEfficiency;
    }, 0) / 24;
    
    const totalProduction = hourlyData.reduce((acc, hour) => acc + hour.actualProduction, 0);
    const co2Factor = 0.5; // tons of CO2 saved per MWh
    
    return {
      totalCapacity,
      currentProduction: avgProduction,
      averageEfficiency: Math.round(avgEfficiency),
      co2Saved: (totalProduction * co2Factor) / 24,
    };
  };

  const dayStats = calculateDayStats(currentDayData);

  const windAssets = [
    {
      id: 1,
      name: 'Windpark Kubbeweg T1',
      location: 'Biddinghuizen',
      capacity: 3.5,
      currentProduction: 2.8,
      efficiency: 92,
      windSpeed: 14.5,
      status: 'operational',
      alerts: 0,
    },
    {
      id: 2,
      name: 'Windpark Kubbeweg T2',
      location: 'Biddinghuizen',
      capacity: 3.5,
      currentProduction: 3.1,
      efficiency: 96,
      windSpeed: 15.2,
      status: 'operational',
      alerts: 1,
    },
    {
      id: 3,
      name: 'Windpark Noord',
      location: 'Den Helder',
      capacity: 5.0,
      currentProduction: 4.2,
      efficiency: 88,
      windSpeed: 18.3,
      status: 'maintenance',
      alerts: 2,
    },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-semibold">Windenergie Productie</h1>
          <p className="text-gray-500 mt-2">Live inzicht in al uw windenergie assets</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigateDate('prev')}
            disabled={isFirstDay}
            className={`p-2 rounded-full ${isFirstDay ? 'text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-medium">{selectedDate}</span>
          <button 
            onClick={() => navigateDate('next')}
            disabled={isLastDay}
            className={`p-2 rounded-full ${isLastDay ? 'text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          className="bg-white rounded-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <WindIcon className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-medium">Huidige Productie</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{dayStats.currentProduction.toFixed(1)}</span>
            <span className="text-gray-500">/ {dayStats.totalCapacity} MW</span>
          </div>
          <div className="flex items-center gap-2 mt-2 text-green-500 text-sm">
            <ArrowUpRight className="w-4 h-4" />
            <span>12.3% vs gisteren</span>
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
            <h3 className="text-lg font-medium">Gemiddelde Efficiëntie</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{dayStats.averageEfficiency}%</span>
          </div>
          <div className="flex items-center gap-2 mt-2 text-red-500 text-sm">
            <ArrowDownRight className="w-4 h-4" />
            <span>2.1% vs gisteren</span>
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
            <h3 className="text-lg font-medium">CO₂ Besparing</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{dayStats.co2Saved.toFixed(1)}</span>
            <span className="text-gray-500">ton</span>
          </div>
          <div className="flex items-center gap-2 mt-2 text-green-500 text-sm">
            <ArrowUpRight className="w-4 h-4" />
            <span>8.7% vs gisteren</span>
          </div>
        </motion.div>
      </div>

      {/* Financial Overview - Now second */}
      <FinancialOverview 
        selectedDate={selectedDate}
        dayData={currentDayData}
        previousDayData={previousDayData}
      />

      {/* Production Graph */}
      <ProductionGraph selectedDate={selectedDate} />
      
      {/* Production Events */}
      <ProductionEvents selectedDate={selectedDate} />

      {/* Wind Assets List */}
      <div className="bg-white rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-xl font-semibold">Wind Assets</h3>
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
              
              <div className="grid grid-cols-4 gap-6 mt-6">
                <div>
                  <p className="text-sm text-gray-500">Huidige Productie</p>
                  <p className="text-lg font-medium">
                    {asset.currentProduction} / {asset.capacity} MW
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Efficiëntie</p>
                  <p className="text-lg font-medium">{asset.efficiency}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Windsnelheid</p>
                  <p className="text-lg font-medium">{asset.windSpeed} m/s</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className={`text-lg font-medium ${
                    asset.status === 'operational' ? 'text-green-500' : 'text-yellow-500'
                  }`}>
                    {asset.status === 'operational' ? 'Operationeel' : 'In onderhoud'}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WindProduction; 