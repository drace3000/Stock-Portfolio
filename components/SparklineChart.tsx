/**
 * components/SparklineChart.tsx
 * 
 * Mini sparkline chart component for displaying compact price trends.
 * 
 * Features:
 * - Compact line chart (typically 12px height)
 * - Normalized data to fit within container
 * - Color-coded by trend (green for positive, red for negative)
 * - Gradient fill matching trend direction
 * - Interactive tooltip on hover
 * - Smooth animations
 * - Handles empty data gracefully
 * 
 * Used in StockCard components to show quick price trend visualization
 * without taking up much space.
 */

'use client';

import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';

interface SparklineChartProps {
  data: Array<{ date: string; close: number }>;
  isPositive: boolean;
}

/**
 * SparklineChart Component
 * 
 * Renders a mini line chart showing normalized price trends.
 * 
 * How it works:
 * 1. Normalizes price data to 0-100% range for consistent display
 * 2. Uses color based on trend direction (green/red)
 * 3. Renders compact line chart with gradient fill
 * 4. Shows price tooltip on hover
 * 5. Handles edge cases (empty data, single data point)
 */
export default function SparklineChart({ data, isPositive }: SparklineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
        No data
      </div>
    );
  }

  const chartData = data.map((item) => ({
    date: item.date,
    value: item.close,
  }));

  if (chartData.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
        No data
      </div>
    );
  }

  const minValue = Math.min(...chartData.map((d) => d.value));
  const maxValue = Math.max(...chartData.map((d) => d.value));
  const range = maxValue - minValue;
  const normalizedData = chartData.map((d) => ({
    ...d,
    normalized: range > 0 ? ((d.value - minValue) / range) * 100 : 50,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={normalizedData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={`gradient-${isPositive ? 'up' : 'down'}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0.3} />
            <stop offset="100%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Line
          type="monotone"
          dataKey="normalized"
          stroke={isPositive ? '#10b981' : '#ef4444'}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
          fill={`url(#gradient-${isPositive ? 'up' : 'down'})`}
          animationDuration={1000}
          animationEasing="ease-out"
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length && payload[0] && payload[0].payload) {
              const dataPoint = payload[0].payload;
              if (dataPoint && typeof dataPoint.value === 'number' && dataPoint.date) {
                return (
                  <div className="bg-white dark:bg-slate-800 px-3 py-2 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      ${dataPoint.value.toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(dataPoint.date).toLocaleDateString()}
                    </p>
                  </div>
                );
              }
            }
            return null;
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

