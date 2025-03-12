'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Wind, Sun, Battery, ArrowRight, Zap, Euro, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

const ProductionOverview = () => {
  const totalProduction = {
    current: 42.5,
    target: 50,
    unit: 'MW',
    trend: '+12.3%',
  };

  const assetTypes = [
    {
      type: 'wind',
      icon: Wind,
      title: 'Wind Energy',
      assets: 3,
      status: 'Optimal',
      production: '32.5 MW',
      availability: '98%',
      href: '/productie/wind',
    },
    {
      type: 'solar',
      icon: Sun,
      title: 'Solar Energy',
      assets: 2,
      status: 'Good',
      production: '10.0 MW',
      availability: '95%',
      href: '/productie/zon-wind',
    },
  ];

  const recentAlerts = [
    {
      type: 'maintenance',
      asset: 'Wind Park Kubbeweg T1',
      message: 'Planned maintenance on March 15',
      severity: 'info',
    },
    {
      type: 'performance',
      asset: 'Solar Park Almere',
      message: 'Production 15% below expectation',
      severity: 'warning',
    },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-semibold">Live Production</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Last update:</span>
          <span className="font-medium">28 Feb 2024 15:30</span>
        </div>
      </div>

      {/* Total Production Card */}
      <motion.div 
        className="bg-white rounded-lg p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg text-gray-600">Total Production</h2>
            <div className="flex items-baseline gap-3 mt-2">
              <span className="text-4xl font-bold">{totalProduction.current}</span>
              <span className="text-xl text-gray-500">/ {totalProduction.target} {totalProduction.unit}</span>
              <span className="text-green-500 text-sm">{totalProduction.trend}</span>
            </div>
          </div>
          <Zap className="w-8 h-8 text-blue-500" />
        </div>
      </motion.div>

      {/* Asset Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {assetTypes.map((asset) => (
          <motion.div
            key={asset.type}
            className="bg-white rounded-lg p-6 hover:shadow-lg transition-shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
          >
            <Link href={asset.href} className="flex flex-col h-full">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <asset.icon className="w-6 h-6 text-blue-500" />
                  <h3 className="text-xl font-semibold">{asset.title}</h3>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div>
                  <p className="text-sm text-gray-500">Number of assets</p>
                  <p className="text-lg font-medium">{asset.assets}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="text-lg font-medium">{asset.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Production</p>
                  <p className="text-lg font-medium">{asset.production}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Availability</p>
                  <p className="text-lg font-medium">{asset.availability}</p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Recent Alerts */}
      <div className="bg-white rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Recent Alerts</h3>
        <div className="space-y-4">
          {recentAlerts.map((alert, index) => (
            <motion.div
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg bg-gray-50"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <AlertTriangle className={`w-5 h-5 ${
                alert.severity === 'warning' ? 'text-yellow-500' : 'text-blue-500'
              }`} />
              <div>
                <p className="font-medium">{alert.asset}</p>
                <p className="text-sm text-gray-600">{alert.message}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductionOverview; 