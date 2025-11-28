/**
 * components/StockChart.tsx
 * 
 * Large interactive area chart component for displaying stock price history.
 * 
 * Features:
 * - 30-day price history visualization
 * - Area chart with gradient fill
 * - Interactive tooltip showing OHLC data (Open, High, Low, Close)
 * - Responsive design that adapts to container size
 * - Y-axis domain calculated with 10% padding for better visualization
 * - Dark mode support
 * - Smooth animations on data load
 * 
 * Used in the StockDetail panel to show comprehensive price trends.
 */

'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface StockChartProps {
  data: Array<{ date: string; open: number; high: number; low: number; close: number; volume: number }>;
  symbol: string;
}

/**
 * StockChart Component
 * 
 * Renders a large area chart showing 30-day price history.
 * 
 * How it works:
 * 1. Transforms time series data into chart format
 * 2. Calculates price range and sets Y-axis domain with padding
 * 3. Renders area chart with gradient fill
 * 4. Shows detailed tooltip on hover with OHLC data
 * 5. Handles empty data gracefully with fallback message
 */
export default function StockChart({ data, symbol }: StockChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-96 flex items-center justify-center text-slate-400">
        No chart data available
      </div>
    );
  }

  const chartData = data.map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    fullDate: item.date,
    price: item.close,
    high: item.high,
    low: item.low,
    open: item.open,
  }));

  if (chartData.length === 0) {
    return (
      <div className="w-full h-96 flex items-center justify-center text-slate-400">
        No chart data available
      </div>
    );
  }

  const minPrice = Math.min(...chartData.map((d) => d.low));
  const maxPrice = Math.max(...chartData.map((d) => d.high));
  const priceRange = maxPrice - minPrice;
  const domain = [minPrice - priceRange * 0.1, maxPrice + priceRange * 0.1];

  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart
        data={chartData}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
        <XAxis
          dataKey="date"
          stroke="#64748b"
          className="dark:stroke-slate-400"
          style={{ fontSize: '12px' }}
        />
        <YAxis
          domain={domain}
          stroke="#64748b"
          className="dark:stroke-slate-400"
          style={{ fontSize: '12px' }}
          tickFormatter={(value) => `$${value.toFixed(0)}`}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length && payload[0] && payload[0].payload) {
              const data = payload[0].payload;
              if (data && data.fullDate && typeof data.price === 'number') {
                return (
                  <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      {new Date(data.fullDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <div className="space-y-1">
                      <div className="flex justify-between gap-4">
                        <span className="text-xs text-slate-500 dark:text-slate-400">Close:</span>
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {formatCurrency(data.price)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-xs text-slate-500 dark:text-slate-400">Open:</span>
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                          {formatCurrency(data.open || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-xs text-slate-500 dark:text-slate-400">High:</span>
                        <span className="text-sm text-green-600 dark:text-green-400">
                          {formatCurrency(data.high || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-xs text-slate-500 dark:text-slate-400">Low:</span>
                        <span className="text-sm text-red-600 dark:text-red-400">
                          {formatCurrency(data.low || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }
            }
            return null;
          }}
        />
        <Area
          type="monotone"
          dataKey="price"
          stroke="#3b82f6"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorPrice)"
          animationDuration={1000}
          animationEasing="ease-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

