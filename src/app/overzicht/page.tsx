'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, FileText, AlertTriangle, Wind } from 'lucide-react';
import Image from 'next/image';
import SolarProductionWidget from '../../components/SolarProductionWidget';
import WindProductionWidget from '../../components/WindProductionWidget';

const AvailabilityBar = () => (
  <div className="bg-white rounded-lg p-8">
    <h2 className="text-2xl font-semibold mb-6">Current Availability</h2>
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 bg-yellow-400 rounded-full" />
        <span className="text-2xl font-semibold">49,486,219</span>
        <span className="text-gray-500">kWh reserved for sale</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 bg-blue-400 rounded-full" />
        <span className="text-2xl font-semibold">22,513,781</span>
        <span className="text-gray-500">kWh available</span>
      </div>
      <div className="relative h-3 bg-gray-100 rounded-full mt-4">
        <div className="absolute left-0 top-0 h-full w-[70%] bg-yellow-400 rounded-l-full" />
        <div className="absolute right-0 top-0 h-full w-[30%] bg-blue-400 rounded-r-full" />
      </div>
      <div className="flex justify-between items-center mt-2">
        <span className="text-sm text-gray-500">72,000,000 kWh total SJP</span>
        <a href="#" className="text-sm text-gray-700 flex items-center gap-2 hover:text-black">
          Go to sales overview <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  </div>
);

const StatsCard = ({ title, value, subtitle, link, icon: Icon }: any) => (
  <motion.div 
    className="bg-white rounded-lg p-6"
    whileHover={{ scale: 1.01 }}
    transition={{ duration: 0.2 }}
  >
    <div className="space-y-2">
      <h3 className="text-4xl font-semibold">{value}</h3>
      <p className="text-gray-500">{title}</p>
      <p className="text-sm text-gray-400">{subtitle}</p>
    </div>
    {link && (
      <a href="#" className="mt-4 text-sm text-gray-700 flex items-center gap-2 hover:text-black">
        {link} <ArrowRight className="w-4 h-4" />
      </a>
    )}
  </motion.div>
);

const DirectActions = () => (
  <div className="bg-[#2F3744] text-white rounded-lg p-8">
    <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
    <p className="text-gray-300 mb-4">Manage key aspects of Wind Park Kubbeweg here</p>
    
    <div className="space-y-3">
      <motion.a 
        href="#"
        className="flex items-center justify-between p-4 rounded-lg hover:bg-[#3A4454] transition-colors"
        whileHover={{ x: 4 }}
      >
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5" />
          <span>Update Information</span>
        </div>
        <ArrowRight className="w-5 h-5" />
      </motion.a>
      
      <motion.a 
        href="#"
        className="flex items-center justify-between p-4 rounded-lg hover:bg-[#3A4454] transition-colors"
        whileHover={{ x: 4 }}
      >
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5" />
          <span>Report Outage or Maintenance</span>
        </div>
        <ArrowRight className="w-5 h-5" />
      </motion.a>
    </div>
  </div>
);

const WindparkInfo = () => (
  <div className="bg-white rounded-lg overflow-hidden">
    <div className="relative h-48">
      <Image 
        src="/windpark.jpg" 
        alt="Wind Park Kubbeweg" 
        fill 
        className="object-cover"
      />
      <div className="absolute bottom-4 right-4 bg-[#2F3744] text-white p-2 rounded-lg">
        <Wind className="w-6 h-6" />
      </div>
    </div>
    <div className="p-6">
      <h2 className="text-xl font-semibold">Wind Park Kubbeweg</h2>
      <p className="text-gray-500 flex items-center gap-2 mt-2">
        <span>Kubbeweg 17 Biddinghuizen</span>
      </p>
    </div>
  </div>
);

export default function Overview() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-semibold mb-8">Energy Source Overview</h1>
      
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <AvailabilityBar />
          
          <div className="grid grid-cols-2 gap-6">
            <StatsCard
              value="68,547"
              title="Total valid GOs"
              subtitle="Last update June 1, 2021"
              link="GO overview"
            />
            <StatsCard
              value="€ 276,532.14"
              title="Amount on your last invoice"
              subtitle="216011464567"
              link="Financial overview"
            />
          </div>
          
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Live Production</h2>
            <div className="grid grid-cols-2 gap-6">
              <SolarProductionWidget />
              <WindProductionWidget />
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <DirectActions />
          <WindparkInfo />
        </div>
      </div>
    </div>
  );
} 