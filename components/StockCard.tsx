'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, X } from 'lucide-react';
import { usePortfolioStore } from '@/lib/store/portfolioStore';
import { getAlphaVantageAPI } from '@/lib/api/alphavantage';
import { formatCurrency, formatPercent, cn } from '@/lib/utils';
import SparklineChart from './SparklineChart';

interface StockCardProps {
  symbol: string;
  name: string;
  index: number;
}

export default function StockCard({ symbol, name, index }: StockCardProps) {
  const { updateQuote, updateTimeSeries, removeFromWatchlist, getWatchlistItem, setSelectedSymbol } = usePortfolioStore();
  const item = getWatchlistItem(symbol);
  const [isUpdating, setIsUpdating] = useState(false);
  const [prevPrice, setPrevPrice] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsUpdating(true);
      const api = getAlphaVantageAPI();
      
      try {
        const [quote, timeSeries] = await Promise.all([
          api.getQuote(symbol),
          api.getTimeSeries(symbol, 'daily'),
        ]);

        if (quote) {
          setPrevPrice(item?.quote?.price || null);
          updateQuote(symbol, quote);
        }
        if (timeSeries) {
          updateTimeSeries(symbol, timeSeries);
        }
      } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error);
      } finally {
        setIsUpdating(false);
      }
    };

    fetchData();
    // Refresh every 60 seconds
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [symbol, updateQuote, updateTimeSeries]);

  const quote = item?.quote;
  const timeSeries = item?.timeSeries || [];
  const changePercent = quote?.changePercent || 0;
  const isPositive = changePercent >= 0;
  const priceChanged = prevPrice !== null && quote && prevPrice !== quote.price;

  const handleClick = () => {
    setSelectedSymbol(symbol);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeFromWatchlist(symbol);
  };

  if (!quote) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="glass-card rounded-2xl p-6 animate-pulse"
      >
        <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className={cn(
        'glass-card-hover rounded-2xl p-6 cursor-pointer relative overflow-hidden',
        'group transition-all duration-300',
        priceChanged && (isPositive ? 'animate-price-update' : 'animate-price-down')
      )}
    >
      <button
        onClick={handleRemove}
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-500 z-10"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">
            {symbol}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 truncate max-w-[200px]">
            {name}
          </p>
        </div>
      </div>

      <div className="flex items-end justify-between mb-4">
        <div>
          <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
            {formatCurrency(quote.price)}
          </div>
          <div className={cn(
            'flex items-center gap-1 text-sm font-semibold',
            isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          )}>
            {isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>{formatPercent(changePercent)}</span>
          </div>
        </div>
      </div>

      {timeSeries.length > 0 && (
        <div className="h-16 -mx-2">
          <SparklineChart data={timeSeries} isPositive={isPositive} />
        </div>
      )}

      {isUpdating && (
        <div className="absolute bottom-2 right-2">
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
        </div>
      )}
    </motion.div>
  );
}

