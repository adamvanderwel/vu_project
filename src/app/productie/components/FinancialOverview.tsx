import React from 'react';
import { motion } from 'framer-motion';
import { Euro, TrendingUp, TrendingDown, Wallet, BarChart3, Zap, AlertCircle } from 'lucide-react';
import { productionEvents } from './ProductionGraph';

interface ProductionEvent {
  time: string;
  duration: string;
  impact: number;
  reason: string;
  description: string;
  type: 'maintenance' | 'grid' | 'weather';
}

type ProductionEventsMap = {
  [date: string]: ProductionEvent[];
};

interface FinancialOverviewProps {
  selectedDate: string;
  dayData: {
    data: Array<{
      actualProduction: number;
      potentialProduction: number;
      price: number;
    }>;
  };
  previousDayData?: {
    data: Array<{
      actualProduction: number;
      price: number;
    }>;
  };
}

export const FinancialOverview: React.FC<FinancialOverviewProps> = ({
  selectedDate,
  dayData,
  previousDayData
}) => {
  // Calculate daily financial metrics
  const calculateDailyMetrics = () => {
    const hourlyData = dayData.data;
    const previousHourlyData = previousDayData?.data || [];

    // Calculate total revenue and production
    const dailyRevenue = hourlyData.reduce((acc, hour) => {
      return acc + (hour.actualProduction * hour.price);
    }, 0);

    const previousDailyRevenue = previousHourlyData.length > 0
      ? previousHourlyData.reduce((acc, hour) => acc + (hour.actualProduction * hour.price), 0)
      : 0;

    // Calculate total production
    const totalProduction = hourlyData.reduce((acc, hour) => acc + hour.actualProduction, 0);
    
    // Calculate average price per MWh
    const avgPrice = dailyRevenue / totalProduction;

    // Calculate revenue trend
    const revenueTrend = previousDailyRevenue > 0
      ? ((dailyRevenue - previousDailyRevenue) / previousDailyRevenue) * 100
      : 0;

    // Calculate negative price metrics
    const negativePriceHours = hourlyData.filter(hour => hour.price < 0);
    const negativePriceMetrics = {
      hours: negativePriceHours.length,
      avgNegativePrice: negativePriceHours.length > 0
        ? negativePriceHours.reduce((acc, hour) => acc + hour.price, 0) / negativePriceHours.length
        : 0,
      potentialLoss: negativePriceHours.reduce((acc, hour) => {
        return acc + (hour.potentialProduction * hour.price);
      }, 0),
      actualLoss: negativePriceHours.reduce((acc, hour) => {
        return acc + (hour.actualProduction * hour.price);
      }, 0),
      avoidedLoss: 0 // Will be calculated below
    };
    
    negativePriceMetrics.avoidedLoss = Math.abs(negativePriceMetrics.potentialLoss - negativePriceMetrics.actualLoss);

    // Calculate savings from production management
    const potentialLosses = hourlyData.reduce((acc, hour) => {
      // Only count hours where price is negative or very low (below 10 EUR/MWh)
      if (hour.price < 10) {
        const potentialLoss = (hour.potentialProduction - hour.actualProduction) * hour.price;
        return acc + (potentialLoss < 0 ? Math.abs(potentialLoss) : 0);
      }
      return acc;
    }, 0);

    // Calculate grid services revenue
    const dayEvents = (productionEvents as ProductionEventsMap)[selectedDate] || [];
    const gridServicesRevenue = dayEvents.reduce((acc: number, event: ProductionEvent) => {
      // Assume compensation for grid services (balancing and congestion management)
      if (event.type === 'grid') {
        // Simplified calculation: 50 EUR/MWh for grid services
        return acc + (Math.abs(event.impact) * 50);
      }
      return acc;
    }, 0);

    return {
      dailyRevenue,
      avgPrice,
      revenueTrend,
      potentialLosses,
      gridServicesRevenue,
      negativePriceMetrics
    };
  };

  const metrics = calculateDailyMetrics();

  return (
    <div className="bg-white rounded-lg p-6">
      <h3 className="text-xl font-semibold mb-6">Financial Overview</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50 rounded-lg p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Euro className="w-5 h-5 text-blue-500" />
            <span className="text-gray-600">Today&apos;s Revenue</span>
          </div>
          <div className="text-2xl font-semibold">€{metrics.dailyRevenue.toFixed(2)}</div>
          <div className="flex items-center gap-1 mt-2">
            {metrics.revenueTrend > 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span className={metrics.revenueTrend > 0 ? "text-green-500" : "text-red-500"}>
              {Math.abs(metrics.revenueTrend).toFixed(1)}% vs yesterday
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-50 rounded-lg p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            <span className="text-gray-600">Average Price</span>
          </div>
          <div className="text-2xl font-semibold">€{metrics.avgPrice.toFixed(2)}/MWh</div>
          <div className="text-sm text-gray-500 mt-2">
            Based on current production
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-50 rounded-lg p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-blue-500" />
            <span className="text-gray-600">Grid Services Revenue</span>
          </div>
          <div className="text-2xl font-semibold">€{metrics.gridServicesRevenue.toFixed(2)}</div>
          <div className="text-sm text-gray-500 mt-2">
            From balancing & congestion management
          </div>
        </motion.div>
      </div>

      {/* Negative Price Information */}
      {metrics.negativePriceMetrics.hours > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 p-4 bg-orange-50 rounded-lg"
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <span className="text-orange-700 font-medium">Negative Prices Today</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-orange-800">
                <span className="font-medium">{metrics.negativePriceMetrics.hours}</span> hours with negative prices
              </div>
              <div className="text-orange-700 text-sm mt-1">
                Average €{Math.abs(metrics.negativePriceMetrics.avgNegativePrice).toFixed(2)}/MWh negative
              </div>
            </div>
            <div>
              <div className="text-green-800">
                <span className="font-medium">€{metrics.negativePriceMetrics.avoidedLoss.toFixed(2)}</span> loss avoided
              </div>
              <div className="text-green-700 text-sm mt-1">
                Through smart production management
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6 p-4 bg-green-50 rounded-lg"
      >
        <div className="flex items-center gap-2 mb-2">
          <Wallet className="w-5 h-5 text-green-600" />
          <span className="text-green-700 font-medium">Production Management Savings</span>
        </div>
        <div className="text-green-800">
          €{metrics.potentialLosses.toFixed(2)} saved by avoiding negative prices
        </div>
      </motion.div>
    </div>
  );
}; 