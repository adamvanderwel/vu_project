'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { MarketChart } from './components/MarketChart';

const MarketPrices = () => {
  const [activeTab, setActiveTab] = useState('onbalans');
  const [currentDate, setCurrentDate] = useState('Wo, 12 augustus 2021');

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <h1 className="text-4xl font-semibold mb-8">Marktprijzen</h1>

      {/* Tab Navigation */}
      <div className="border-b">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('onbalans')}
            className={`pb-4 relative ${
              activeTab === 'onbalans'
                ? 'text-black border-b-2 border-black -mb-[2px]'
                : 'text-gray-500'
            }`}
          >
            Onbalansmarkt
          </button>
          <button
            onClick={() => setActiveTab('dayahead')}
            className={`pb-4 relative ${
              activeTab === 'dayahead'
                ? 'text-black border-b-2 border-black -mb-[2px]'
                : 'text-gray-500'
            }`}
          >
            Day-ahead markt
          </button>
        </div>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center gap-4 my-8">
        <button className="p-2 hover:bg-gray-100 rounded-full">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-medium">{currentDate}</span>
        <button className="p-2 hover:bg-gray-100 rounded-full">
          <ChevronRight className="w-5 h-5" />
        </button>
        <button className="ml-4 text-sm text-gray-500 hover:text-gray-700">
          Meest recent
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
            <span className="text-sm">Regeltoestand 1</span>
            <Info className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-sm">Regeltoestand 2</span>
            <Info className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-500"></div>
            <span className="text-sm">Regeltoestand -1</span>
            <Info className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          De getoonde data is indicatief en kunnen geen rechten aan worden ontleend.
        </p>
      </div>

      {/* Info Section */}
      <div className="bg-gray-100 rounded-lg p-8 mt-8">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-gray-600 mt-1" />
          <div>
            <h3 className="font-medium mb-2">Informatief</h3>
            <p className="text-gray-600">
              De onbalansmarkt is de markt waarop per kwartier de prijs wordt
              bepaald van elektrische energie die afgeleverd wordt, als er niet
              ingediend door energieleveranciers op de langetermijnmarkt (ICE
              ENDEX) of op de kortetermijnmarkt (EPEX SPOT) of Nordpool. Bij tekorten
              stijgt de prijs van elektrische energie.
            </p>
          </div>
        </div>
      </div>

      {/* Feedback Section */}
      <div className="bg-gray-50 rounded-lg p-8 mt-8">
        <h3 className="font-medium mb-4">Wat wil jij?</h3>
        <p className="text-gray-600 mb-6">
          Deze pagina wordt in de toekomst vernieuwd. Omdat we mening belangrijk
          vinden, zijn we benieuwd wat jij graag zou verbeteren of toevoegen aan deze
          pagina.
        </p>
        <button className="px-4 py-2 bg-[#2F3744] text-white rounded hover:bg-[#3A4454]">
          Versturen
        </button>
      </div>
    </div>
  );
};

export default MarketPrices; 