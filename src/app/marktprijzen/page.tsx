'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { MarketChart } from './components/MarketChart';

const MarketPrices = () => {
  const [activeTab, setActiveTab] = useState('imbalance');
  const [currentDate, setCurrentDate] = useState('Wed, 12 August 2021');

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <h1 className="text-4xl font-semibold">Market Prices</h1>

      {/* Tab Navigation */}
      <div className="border-b">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('imbalance')}
            className={`pb-4 relative ${
              activeTab === 'imbalance'
                ? 'text-black border-b-2 border-black -mb-[2px]'
                : 'text-gray-500'
            }`}
          >
            Imbalance Market
          </button>
          <button
            onClick={() => setActiveTab('dayahead')}
            className={`pb-4 relative ${
              activeTab === 'dayahead'
                ? 'text-black border-b-2 border-black -mb-[2px]'
                : 'text-gray-500'
            }`}
          >
            Day-ahead Market
          </button>
        </div>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center gap-4 my-8">
        <button className="p-2 hover:bg-gray-100 rounded-full">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-medium">Wed, 12 August 2021</span>
        <button className="p-2 hover:bg-gray-100 rounded-full">
          <ChevronRight className="w-5 h-5" />
        </button>
        <button className="ml-4 text-sm text-gray-500 hover:text-gray-700">
          Most Recent
        </button>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg p-8">
        <div className="h-[400px] relative">
          <div className="absolute left-0 top-0 bottom-0 w-16 flex flex-col justify-between text-sm text-gray-500">
            <span>€/MWh</span>
          </div>
          <div className="ml-16 h-full">
            <MarketChart />
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex gap-8">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-sm">Control State 1</span>
            <Info className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-sm">Control State 2</span>
            <Info className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-500"></div>
            <span className="text-sm">Control State -1</span>
            <Info className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          The displayed data is indicative and no rights can be derived from it.
        </p>
      </div>

      {/* Info Section */}
      <div className="bg-gray-100 rounded-lg p-8 mt-8">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-gray-600 mt-1" />
          <div>
            <h3 className="font-medium mb-2">Information</h3>
            <p className="text-gray-600">
              The imbalance market is the market where the price of electrical energy
              is determined per quarter hour for energy delivered, if not submitted
              by energy suppliers on the long-term market (ICE ENDEX) or on the
              short-term market (EPEX SPOT) or Nordpool. During shortages,
              the price of electrical energy increases.
            </p>
          </div>
        </div>
      </div>

      {/* Feedback Section */}
      <div className="bg-gray-50 rounded-lg p-8 mt-8">
        <h3 className="font-medium mb-4">What would you like?</h3>
        <p className="text-gray-600 mb-6">
          This page will be updated in the future. Because we value your opinion,
          we would like to know what you would improve or add to this page.
        </p>
        <button className="px-4 py-2 bg-[#2F3744] text-white rounded hover:bg-[#3A4454]">
          Submit
        </button>
      </div>
    </div>
  );
};

export default MarketPrices; 