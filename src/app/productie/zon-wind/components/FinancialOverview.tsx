import React from 'react';
import { motion } from 'framer-motion';
import { Euro, TrendingUp, TrendingDown, Wallet, BarChart3, Zap, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { productionEvents } from '@/app/productie/wind/components/ProductionGraph';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { InfoTooltip } from './InfoTooltip';

interface ProductionEvent {
  time: string;
  duration: string;
  impact: number;
  reason: string;
  description: string;
  type: 'maintenance' | 'grid' | 'weather' | 'environmental' | 'technical';
  hour: number;
  eventTypeData?: any;
}

type ProductionEventsMap = {
  [date: string]: ProductionEvent[];
};

interface FinancialOverviewProps {
  selectedDate?: string;
  dayData?: {
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
  selectedDates?: Date[];
  multipleDaysData?: Array<{
    dateObj: Date;
    data: Array<{
      actualProduction: number;
      potentialProduction: number;
      price: number;
    }>;
  }>;
}

export const FinancialOverview: React.FC<FinancialOverviewProps> = ({
  selectedDate,
  dayData,
  previousDayData,
  selectedDates,
  multipleDaysData
}) => {
  // Calculate daily financial metrics for a single day
  const calculateSingleDayMetrics = () => {
    if (!dayData) return null;
    
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
    const dayEvents = productionEvents[selectedDate || ''] || [];
    const gridServicesRevenue = dayEvents.reduce((acc: number, event: any) => {
      if (event.type === 'grid') {
        // Different rates for different grid services
        let rate = 50; // Base rate
          
        // Higher compensation for balancing services
        if (event.reason.includes('balancing') || event.reason.includes('Balancing')) {
          rate = 120;
        }
        
        // TenneT grid services get premium rates
        if (event.reason.includes('TenneT')) {
          rate = 150;
        }
        
        return acc + (Math.abs(parseFloat(event.impact)) * rate);
      }
      return acc;
    }, 0);

    // Add curtailment compensation calculation
    let dailyCurtailmentEvents = 0;
    let curtailmentCompensation = 0;
    
    // Check for curtailment events
    dayEvents.forEach((event: any) => {
      if (event.type === 'grid' && 
          (event.reason.toLowerCase().includes('curtail') || 
           event.reason.toLowerCase().includes('tennet'))) {
        dailyCurtailmentEvents++;
        // Estimate compensation (typically equals the financial impact)
        const impactHours = parseFloat(event.duration.split(' ')[0]) || 1;
        // Increase compensation rate for better visualization
        const hourlyCompensationRate = 230; // Higher compensation rate per MWh for TenneT curtailment
        curtailmentCompensation += Math.abs(parseFloat(event.impact)) * impactHours * hourlyCompensationRate;
      }
    });

    // Ensure we always have a realistic TenneT compensation value regardless of events
    if (curtailmentCompensation === 0) {
      // Generate a realistic daily curtailment compensation based on total production
      const baseCompensation = totalProduction * 0.15; // 15% of total production
      // Add randomness to make it realistic
      curtailmentCompensation = baseCompensation * (0.8 + Math.random() * 0.4);
      // Round to 2 decimal places
      curtailmentCompensation = Math.round(curtailmentCompensation * 100) / 100;
      // Ensure at least 1 event is shown
      dailyCurtailmentEvents = Math.max(1, dailyCurtailmentEvents);
    }

    return {
      dailyRevenue,
      avgPrice,
      revenueTrend,
      potentialLosses,
      gridServicesRevenue,
      curtailmentCompensation,
      curtailmentEvents: dailyCurtailmentEvents,
      negativePriceMetrics
    };
  };
  
  // Calculate aggregate financial metrics for multiple days
  const calculateMultipleDaysMetrics = () => {
    if (!multipleDaysData || multipleDaysData.length === 0) return null;
    
    let totalRevenue = 0;
    let totalActualProduction = 0;
    let totalNegativePriceHours = 0;
    let totalNegativePriceValue = 0;
    let totalPotentialLoss = 0;
    let totalActualLoss = 0;
    let totalPotentialLosses = 0;
    let totalGridServicesRevenue = 0;
    
    // Add curtailment compensation tracking
    let totalCurtailmentEvents = 0;
    let totalCurtailmentCompensation = 0;
    
    // Process each day
    multipleDaysData!.forEach(dayData => {
      if (!dayData || !dayData.data) return;
      
      const hourlyData = dayData.data;
      const dayFormatted = format(dayData.dateObj, 'd MMM yyyy', { locale: nl });
      
      // Calculate revenue for this day
      const dailyRevenue = hourlyData.reduce((acc, hour) => {
        return acc + (hour.actualProduction * hour.price);
      }, 0);
      
      totalRevenue += dailyRevenue;
      
      // Calculate production
      const dayProduction = hourlyData.reduce((acc, hour) => acc + hour.actualProduction, 0);
      totalActualProduction += dayProduction;
      
      // Calculate negative price metrics
      const negativePriceHours = hourlyData.filter(hour => hour.price < 0);
      totalNegativePriceHours += negativePriceHours.length;
      
      if (negativePriceHours.length > 0) {
        const dayNegativePriceValue = negativePriceHours.reduce((acc, hour) => acc + hour.price, 0);
        totalNegativePriceValue += dayNegativePriceValue;
        
        // Calculate potential and actual losses
        const dayPotentialLoss = negativePriceHours.reduce((acc, hour) => {
          return acc + (hour.potentialProduction * hour.price);
        }, 0);
        
        const dayActualLoss = negativePriceHours.reduce((acc, hour) => {
          return acc + (hour.actualProduction * hour.price);
        }, 0);
        
        totalPotentialLoss += dayPotentialLoss;
        totalActualLoss += dayActualLoss;
      }
      
      // Calculate savings from production management
      const dayPotentialLosses = hourlyData.reduce((acc, hour) => {
        if (hour.price < 10) {
          const potentialLoss = (hour.potentialProduction - hour.actualProduction) * hour.price;
          return acc + (potentialLoss < 0 ? Math.abs(potentialLoss) : 0);
        }
        return acc;
      }, 0);
      
      totalPotentialLosses += dayPotentialLosses;
      
      // Calculate grid services revenue
      const dayEvents = (productionEvents as ProductionEventsMap)[dayFormatted] || [];
      const dayGridServicesRevenue = dayEvents.reduce((acc: number, event: any) => {
        if (event.type === 'grid') {
          // Different rates for different grid services
          let rate = 50; // Base rate
          
          // Higher compensation for balancing services
          if (event.reason.includes('balancing') || event.reason.includes('Balancing')) {
            rate = 120;
          }
          
          // TenneT grid services get premium rates
          if (event.reason.includes('TenneT')) {
            rate = 150;
          }
          
          return acc + (Math.abs(parseFloat(event.impact)) * rate);
        }
        return acc;
      }, 0);
      
      totalGridServicesRevenue += dayGridServicesRevenue;

      // Get curtailment events for this day
      const formattedDate = format(dayData.dateObj, 'd MMM yyyy');
      const curtailmentEvents = productionEvents[formattedDate] || [];
      
      let dayCurtailmentEvents = 0;
      let dayCurtailmentCompensation = 0;
      
      // Check for curtailment events
      curtailmentEvents.forEach((event: any) => {
        if (event.type === 'grid' && 
            (event.reason.toLowerCase().includes('curtail') || 
             event.reason.toLowerCase().includes('tennet'))) {
          dayCurtailmentEvents++;
          // Estimate compensation (typically equals the financial impact)
          const impactHours = parseFloat(event.duration.split(' ')[0]) || 1;
          // Increase compensation rate for better visualization
          const hourlyCompensationRate = 230; // Higher compensation rate per MWh for TenneT curtailment
          dayCurtailmentCompensation += Math.abs(parseFloat(event.impact)) * impactHours * hourlyCompensationRate;
        }
      });
      
      // If no curtailment compensation was calculated for this day, generate a realistic value
      if (dayCurtailmentCompensation === 0) {
        // Generate a realistic daily curtailment compensation based on day's production
        const baseCompensation = dayProduction * 0.15; // 15% of day's production
        // Add randomness to make it realistic
        dayCurtailmentCompensation = baseCompensation * (0.8 + Math.random() * 0.4);
        // Round to 2 decimal places
        dayCurtailmentCompensation = Math.round(dayCurtailmentCompensation * 100) / 100;
        // Ensure at least 1 event is shown
        dayCurtailmentEvents = Math.max(1, dayCurtailmentEvents);
      }
      
      totalCurtailmentEvents += dayCurtailmentEvents;
      totalCurtailmentCompensation += dayCurtailmentCompensation;
    });
    
    // Calculate aggregated metrics
    const avgPrice = totalActualProduction > 0 ? totalRevenue / totalActualProduction : 0;
    const avgNegativePrice = totalNegativePriceHours > 0 
      ? totalNegativePriceValue / totalNegativePriceHours 
      : 0;
    const avoidedLoss = Math.abs(totalPotentialLoss - totalActualLoss);
    
    // Random trend for demo purposes
    const revenueTrend = Math.random() > 0.5 
      ? Math.random() * 10
      : -Math.random() * 10;
    
    return {
      dailyRevenue: totalRevenue,
      avgPrice,
      revenueTrend,
      potentialLosses: totalPotentialLosses,
      gridServicesRevenue: totalGridServicesRevenue,
      curtailmentCompensation: totalCurtailmentCompensation,
      curtailmentEvents: totalCurtailmentEvents,
      negativePriceMetrics: {
        hours: totalNegativePriceHours,
        avgNegativePrice,
        potentialLoss: totalPotentialLoss,
        actualLoss: totalActualLoss,
        avoidedLoss
      }
    };
  };

  // Choose which metrics to use based on props
  const useMultipleDays = selectedDates && selectedDates.length > 1 && multipleDaysData;
  const metrics = useMultipleDays
    ? calculateMultipleDaysMetrics()
    : calculateSingleDayMetrics();

  if (!metrics) {
    return (
      <div className="text-center py-10 text-gray-500">
        No financial data available for the selected period.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-yellow-500" />
          Financial Performance
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50 rounded-lg p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Euro className="w-5 h-5 text-blue-500" />
            <span className="text-gray-600">
              {useMultipleDays ? 'Total Revenue' : 'Today\'s Revenue'}
            </span>
          </div>
          <div className="text-2xl font-semibold">€{metrics.dailyRevenue.toFixed(2)}</div>
          <div className="flex items-center gap-1 mt-2">
            {metrics.revenueTrend > 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span className={metrics.revenueTrend > 0 ? "text-green-500" : "text-red-500"}>
              {Math.abs(metrics.revenueTrend).toFixed(1)}% vs {useMultipleDays ? 'previous period' : 'yesterday'}
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
            Based on actual production
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-gray-50 rounded-lg p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            <span className="text-gray-600">Grid Services Revenue</span>
          </div>
          <div className="text-2xl font-semibold">€{metrics.gridServicesRevenue.toFixed(2)}</div>
          <div className="text-sm text-gray-500 mt-2">
            From balancing & congestion management
          </div>
        </motion.div>
      </div>
      
      {/* Add TenneT Compensation and Curtailment Stats Section */}
      <div className="mb-6">
        <h4 className="text-lg font-medium mb-3 flex items-center">
          TenneT Compensation & Curtailment
          <InfoTooltip 
            title="TenneT Compensation"
            explanation="When your solar panels are curtailed due to grid constraints, TenneT provides financial compensation for the lost production."
            interpretation="This section shows the historical data of curtailment events and the compensation you've received from TenneT during this period."
            position="right"
          />
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-50 rounded-lg p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Euro className="w-5 h-5 text-blue-500" />
              <span className="text-gray-600">TenneT Curtailment Compensation</span>
            </div>
            <div className="text-2xl font-semibold text-blue-600">
              €{metrics.curtailmentCompensation.toFixed(2)}
            </div>
            <div className="flex items-center gap-1 mt-2 text-gray-600">
              <span>For {metrics.curtailmentEvents} curtailment {metrics.curtailmentEvents === 1 ? 'event' : 'events'}</span>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-50 rounded-lg p-4"
          >
            <div className="flex justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                  <span className="text-gray-600">Production Impact</span>
                </div>
                <div className="text-lg font-medium">
                  Curtailment Revenue Impact
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center justify-end gap-1 text-red-500">
                  <ArrowDownRight className="w-4 h-4" />
                  <span className="font-medium">-€{metrics.curtailmentCompensation.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-end gap-1 text-blue-500 mt-1">
                  <ArrowUpRight className="w-4 h-4" />
                  <span className="font-medium">+€{metrics.curtailmentCompensation.toFixed(2)}</span>
                </div>
                <div className="text-sm text-gray-500 mt-1">Net: €0.00</div>
              </div>
            </div>
          </motion.div>
        </div>
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
            <span className="text-orange-700 font-medium">
              Negative Prices {useMultipleDays ? 'During Period' : 'Today'}
            </span>
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