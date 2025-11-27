'use client';

import { motion } from 'framer-motion';
import { usePortfolioStore } from '@/lib/store/portfolioStore';
import StockCard from './StockCard';

export default function Watchlist() {
  const { watchlist } = usePortfolioStore();

  if (watchlist.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-16 glass-card rounded-2xl"
      >
        <p className="text-slate-500 dark:text-slate-400 text-lg">
          Your watchlist is empty. Search for stocks to add them here.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {watchlist.map((item, index) => (
        <StockCard
          key={item.symbol}
          symbol={item.symbol}
          name={item.name}
          index={index}
        />
      ))}
    </div>
  );
}

