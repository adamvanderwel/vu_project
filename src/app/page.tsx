'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Info, AlertTriangle, Battery, Wind, Sun, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

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
              <p className="text-xl md:text-2xl font-semibold">{item.value}</p>
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
    <Card className="w-full h-full">
      <CardHeader className="p-4 md:p-6">
        <CardTitle className="text-lg md:text-2xl">Production Adjustment Insights</CardTitle>
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-0">
        <motion.div className="space-y-3 md:space-y-4">
          {reductionData.active && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Alert className="bg-blue-50 text-sm">
                <AlertTriangle className="w-4 h-4" />
                <AlertTitle className="text-sm font-medium">Active Production Adjustment</AlertTitle>
                <AlertDescription className="text-xs md:text-sm">
                  Production reduced by {reductionData.reductionAmount}MW ({reductionData.reductionPercentage}%)
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div 
              className="p-3 md:p-4 bg-gray-50 rounded-lg"
              variants={fadeInUp}
              whileHover={{ scale: 1.02 }}
            >
              <h3 className="font-semibold mb-2 text-sm md:text-base">Reason for Adjustment</h3>
              <ul className="space-y-2">
                {reductionData.reasons.map((reason: string, index: number) => (
                  <motion.li 
                    key={index} 
                    className="flex items-start gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span className="text-xs md:text-sm">{reason}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
            <motion.div 
              className="p-3 md:p-4 bg-gray-50 rounded-lg"
              variants={fadeInUp}
              whileHover={{ scale: 1.02 }}
            >
              <h3 className="font-semibold mb-2 text-sm md:text-base">Benefits Generated</h3>
              <ul className="space-y-2">
                {reductionData.benefits.map((benefit: string, index: number) => (
                  <motion.li 
                    key={index} 
                    className="flex items-start gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="text-xs md:text-sm">{benefit}</span>
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
      <CardContent className="p-0 sm:p-6">
        <motion.div 
          className="h-[300px] md:h-96 w-full overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                yAxisId="left" 
                tick={{ fontSize: 12 }}
                width={40}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                tick={{ fontSize: 12 }}
                width={40}
              />
              <Tooltip 
                contentStyle={{ fontSize: '12px' }}
                itemStyle={{ fontSize: '12px' }}
              />
              <Legend 
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                iconSize={8}
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="actualProduction" 
                stroke="#2563eb" 
                name="Actual Production (MW)"
                strokeWidth={2}
                dot={false}
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="potentialProduction" 
                stroke="#94a3b8" 
                strokeDasharray="5 5" 
                name="Potential Production (MW)"
                strokeWidth={2}
                dot={false}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="marketPrice" 
                stroke="#22c55e" 
                name="Market Price (€/MWh)"
                strokeWidth={2}
                dot={false}
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
    <Card className="w-full h-full">
      <CardHeader className="p-4 md:p-6">
        <CardTitle className="text-lg md:text-2xl">Financial Impact</CardTitle>
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-0">
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4"
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
              className="p-3 md:p-4 bg-gray-50 rounded-lg"
              variants={fadeInUp}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-xs md:text-sm text-gray-600">{item.title}</p>
              <p className="text-lg md:text-2xl font-semibold truncate">{item.value}</p>
              <p className="text-xs md:text-sm text-gray-500">{item.subtitle}</p>
            </motion.div>
          ))}
        </motion.div>
      </CardContent>
    </Card>
  </motion.div>
);

export default function Home() {
  const [currentStatus] = useState({
    currentProduction: 42.5,
    maxCapacity: 50,
    marketPrice: 45.20,
    status: "Optimized",
    statusDescription: "Running at market-optimized capacity"
  });

  const [reductionData] = useState({
    active: true,
    reductionAmount: 7.5,
    reductionPercentage: 15,
    reasons: [
      "Negative market prices expected in next hour",
      "Grid congestion detected in local area",
      "Optimizing for grid stability requirements"
    ],
    benefits: [
      "€450 in negative price exposure avoided",
      "Contributing to grid stability",
      "Earning additional flexibility premiums",
      "Maintaining optimal asset performance"
    ]
  });

  const [productionData] = useState([
    { time: '09:00', actualProduction: 80, potentialProduction: 80, marketPrice: 45 },
    { time: '10:00', actualProduction: 85, potentialProduction: 85, marketPrice: 42 },
    { time: '11:00', actualProduction: 60, potentialProduction: 90, marketPrice: -5 },
    { time: '12:00', actualProduction: 65, potentialProduction: 95, marketPrice: -10 },
    { time: '13:00', actualProduction: 70, potentialProduction: 100, marketPrice: -8 },
    { time: '14:00', actualProduction: 90, potentialProduction: 90, marketPrice: 38 }
  ]);

  const [financialData] = useState({
    revenueToday: 2450.75,
    revenueTrend: 12.5,
    lossesAvoided: 450.00,
    gridServicesValue: 225.50
  });

  return (
    <div className="p-2 sm:p-4 md:p-8 max-w-7xl mx-auto space-y-4 md:space-y-6">
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6"
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
            className="p-3 sm:p-4 bg-gray-50 rounded-lg"
            variants={fadeInUp}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-sm text-gray-600">{item.title}</p>
            <p className="text-lg sm:text-xl md:text-2xl font-semibold truncate">{item.value}</p>
            <p className="text-xs sm:text-sm text-gray-500">{item.subtitle}</p>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
        <ReductionInsightsCard reductionData={reductionData} />
        <FinancialImpactCard financialData={financialData} />
      </div>

      <div className="w-full -mx-2 sm:mx-0">
        <ProductionChart data={productionData} />
      </div>

      <motion.div
        className="flex justify-center mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Link href="/productie/wind">
          <motion.button
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Wind className="w-5 h-5" />
            Wind Production Details
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
}
