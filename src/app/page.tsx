'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
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

// Mock data
const mockData = {
  assetInfo: {
    type: 'wind' as const,
    name: 'Windpark Alpha',
    location: 'North Sea',
    id: 'WP001',
    capacity: 100
  },
  currentStatus: {
    currentProduction: 75,
    maxCapacity: 100,
    marketPrice: 45.5,
    status: 'Operational',
    statusDescription: 'Running at optimal capacity'
  },
  reductionData: {
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
  },
  chartData: [
    { time: '00:00', actualProduction: 80, potentialProduction: 85, marketPrice: 42 },
    { time: '04:00', actualProduction: 75, potentialProduction: 90, marketPrice: 45 },
    { time: '08:00', actualProduction: 85, potentialProduction: 95, marketPrice: 48 },
    { time: '12:00', actualProduction: 90, potentialProduction: 90, marketPrice: 52 },
    { time: '16:00', actualProduction: 70, potentialProduction: 85, marketPrice: 46 },
    { time: '20:00', actualProduction: 65, potentialProduction: 80, marketPrice: 44 }
  ],
  financialData: {
    dailyRevenue: 12500,
    monthlyRevenue: 375000,
    yearlyRevenue: 4500000,
    revenueImpact: -2500,
    costSavings: 1500,
    netImpact: -1000
  }
};

export default function Home() {
  return (
    <main className="container mx-auto p-4 space-y-6">
      <motion.div
        className="space-y-6"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <Card>
          <CardHeader>
            <CardTitle>Wind Park Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Current Production
                    </CardTitle>
                    <Wind className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {mockData.currentStatus.currentProduction}MW
                    </div>
                    <p className="text-xs text-muted-foreground">
                      of {mockData.currentStatus.maxCapacity}MW capacity
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Market Price
                    </CardTitle>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      €{mockData.currentStatus.marketPrice}/MWh
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Current market rate
                    </p>
                  </CardContent>
                </Card>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Production Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <ResponsiveContainer width="100%" height={350}>
                      <LineChart data={mockData.chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="actualProduction"
                          stroke="#8884d8"
                          name="Actual Production"
                        />
                        <Line
                          type="monotone"
                          dataKey="potentialProduction"
                          stroke="#82ca9d"
                          name="Potential Production"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>Financial Impact</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <div className="ml-4 space-y-1">
                          <p className="text-sm font-medium leading-none">
                            Daily Revenue
                          </p>
                          <p className="text-sm text-muted-foreground">
                            €{mockData.financialData.dailyRevenue.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}
