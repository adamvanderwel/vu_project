'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Info, AlertTriangle, Battery, Wind, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const fadeInUpTransition = {
  duration: 0.5,
  ease: [0.22, 1, 0.36, 1]
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } }
};

// Subcomponents with animations
const AssetHeader = ({ assetInfo }: { assetInfo: any }) => (
  <motion.div 
    className="flex items-center justify-between p-4 border-b"
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
  >
    <div className="flex items-center gap-4">
      <motion.div
        whileHover={{ scale: 1.1 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        {assetInfo.type === 'wind' && <Wind className="w-8 h-8 text-blue-500" />}
        {assetInfo.type === 'solar' && <Sun className="w-8 h-8 text-yellow-500" />}
        {assetInfo.type === 'battery' && <Battery className="w-8 h-8 text-green-500" />}
      </motion.div>
      <div>
        <h2 className="text-xl font-semibold">{assetInfo.name}</h2>
        <p className="text-gray-600">{assetInfo.location}</p>
      </div>
    </div>
    <div className="text-right">
      <p className="text-sm text-gray-600">Asset ID: {assetInfo.id}</p>
      <p className="text-sm text-gray-600">Capacity: {assetInfo.capacity}MW</p>
    </div>
  </motion.div>
);

const LiveStatusCard = ({ currentStatus }: { currentStatus: any }) => (
  <motion.div variants={fadeInUp} transition={fadeInUpTransition}>
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
          >
            <Info className="w-5 h-5" />
          </motion.div>
          Live Production Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {[
            {
              title: "Current Production",
              value: `${currentStatus.currentProduction}MW`,
              subtitle: `of ${currentStatus.maxCapacity}MW capacity`
            },
            {
              title: "Market Price",
              value: `€${currentStatus.marketPrice}/MWh`,
              subtitle: "Current market rate"
            },
            {
              title: "Production Status",
              value: currentStatus.status,
              subtitle: currentStatus.statusDescription
            }
          ].map((item, index) => (
            <motion.div
              key={index}
              className="p-4 bg-gray-50 rounded-lg"
              variants={fadeInUp}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-sm text-gray-600">{item.title}</p>
              <p className="text-2xl font-semibold">{item.value}</p>
              <p className="text-sm text-gray-500">{item.subtitle}</p>
            </motion.div>
          ))}
        </motion.div>
      </CardContent>
    </Card>
  </motion.div>
);

const ReductionInsightsCard = ({ reductionData }: { reductionData: any }) => (
  <motion.div variants={fadeInUp} transition={fadeInUpTransition}>
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Production Adjustment Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div className="space-y-4">
          {reductionData.active && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Alert className="bg-blue-50">
                <AlertTriangle className="w-4 h-4" />
                <AlertTitle>Active Production Adjustment</AlertTitle>
                <AlertDescription>
                  Production reduced by {reductionData.reductionAmount}MW ({reductionData.reductionPercentage}%)
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div 
              className="p-4 bg-gray-50 rounded-lg"
              variants={fadeInUp}
              whileHover={{ scale: 1.02 }}
            >
              <h3 className="font-semibold mb-2">Reason for Adjustment</h3>
              <ul className="space-y-2">
                {reductionData.reasons.map((reason: string, index: number) => (
                  <motion.li 
                    key={index} 
                    className="flex items-start gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="mt-1 w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-sm">{reason}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
            <motion.div 
              className="p-4 bg-gray-50 rounded-lg"
              variants={fadeInUp}
              whileHover={{ scale: 1.02 }}
            >
              <h3 className="font-semibold mb-2">Benefits Generated</h3>
              <ul className="space-y-2">
                {reductionData.benefits.map((benefit: string, index: number) => (
                  <motion.li 
                    key={index} 
                    className="flex items-start gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="mt-1 w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm">{benefit}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        </motion.div>
      </CardContent>
    </Card>
  </motion.div>
);

const ProductionChart = ({ data }: { data: any }) => (
  <motion.div variants={fadeInUp} transition={fadeInUpTransition}>
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Production Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div 
          className="h-96"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="actualProduction" 
                stroke="#2563eb" 
                name="Actual Production (MW)"
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="potentialProduction" 
                stroke="#94a3b8" 
                strokeDasharray="5 5" 
                name="Potential Production (MW)"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="marketPrice" 
                stroke="#22c55e" 
                name="Market Price (€/MWh)"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </CardContent>
    </Card>
  </motion.div>
);

const FinancialImpactCard = ({ financialData }: { financialData: any }) => (
  <motion.div variants={fadeInUp} transition={fadeInUpTransition}>
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Financial Impact</CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {[
            {
              title: "Revenue Today",
              value: `€${financialData.revenueToday.toFixed(2)}`,
              subtitle: `${financialData.revenueTrend >= 0 ? '+' : ''}${financialData.revenueTrend}% vs yesterday`
            },
            {
              title: "Losses Avoided",
              value: `€${financialData.lossesAvoided.toFixed(2)}`,
              subtitle: "Through production management"
            },
            {
              title: "Grid Services Value",
              value: `€${financialData.gridServicesValue.toFixed(2)}`,
              subtitle: "Additional revenue from flexibility"
            }
          ].map((item, index) => (
            <motion.div
              key={index}
              className="p-4 bg-gray-50 rounded-lg"
              variants={fadeInUp}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-sm text-gray-600">{item.title}</p>
              <p className="text-2xl font-semibold">{item.value}</p>
              <p className="text-sm text-gray-500">{item.subtitle}</p>
            </motion.div>
          ))}
        </motion.div>
      </CardContent>
    </Card>
  </motion.div>
);

export default function Home() {
  // Mock data for demonstration
  const mockAssetInfo = {
    type: 'wind',
    name: 'Windpark Alpha',
    location: 'North Sea',
    id: 'WP001',
    capacity: 100
  };

  const mockCurrentStatus = {
    currentProduction: 75,
    maxCapacity: 100,
    marketPrice: 45.5,
    status: 'Operational',
    statusDescription: 'Running at optimal capacity'
  };

  const mockReductionData = {
    active: true,
    reductionAmount: 25,
    reductionPercentage: 25,
    reasons: [
      'Grid congestion management',
      'Market price optimization'
    ],
    benefits: [
      'Reduced grid stress',
      'Optimized revenue'
    ]
  };

  const mockChartData = [
    { time: '00:00', actualProduction: 80, potentialProduction: 85, marketPrice: 42 },
    { time: '04:00', actualProduction: 75, potentialProduction: 90, marketPrice: 45 },
    { time: '08:00', actualProduction: 85, potentialProduction: 95, marketPrice: 48 },
    { time: '12:00', actualProduction: 90, potentialProduction: 90, marketPrice: 52 },
    { time: '16:00', actualProduction: 70, potentialProduction: 85, marketPrice: 46 },
    { time: '20:00', actualProduction: 65, potentialProduction: 80, marketPrice: 44 }
  ];

  const mockFinancialData = {
    dailyRevenue: 12500,
    monthlyRevenue: 375000,
    yearlyRevenue: 4500000,
    revenueImpact: -2500,
    costSavings: 1500,
    netImpact: -1000
  };

  return (
    <main className="container mx-auto p-4 space-y-6">
      <motion.div
        className="space-y-6"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <AssetHeader assetInfo={mockAssetInfo} />
        <LiveStatusCard currentStatus={mockCurrentStatus} />
        <ReductionInsightsCard reductionData={mockReductionData} />
        <ProductionChart data={mockChartData} />
        <FinancialImpactCard financialData={mockFinancialData} />
      </motion.div>
    </main>
  );
}
