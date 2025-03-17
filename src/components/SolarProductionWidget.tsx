'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sun, ArrowUpRight, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface SolarProductionData {
  currentProduction: number;
  dailyTotal: number;
  trend: number;
  efficiency: number;
}

// In a real application, this would be fetched from an API
const getSolarData = (): SolarProductionData => {
  // Simulating real data - in production this would come from your API
  return {
    currentProduction: 8.2, // MW
    dailyTotal: 42.5, // MWh
    trend: 12, // % increase from yesterday
    efficiency: 86, // % of maximum potential
  };
};

const SolarProductionWidget = () => {
  const solarData = getSolarData();

  return (
    <motion.div 
      className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-6 border border-amber-100 hover:shadow-md transition-all cursor-pointer"
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
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

        <div className="mt-5">
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-gray-800">{solarData.currentProduction}</span>
            <span className="text-gray-500 mb-1">MW</span>
          </div>
          <p className="text-gray-500 text-sm">Current production</p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
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
      </Link>
    </motion.div>
  );
};

export default SolarProductionWidget; 