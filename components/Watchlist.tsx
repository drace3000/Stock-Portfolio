/**
 * components/Watchlist.tsx
 * 
 * Watchlist container component that displays all stocks in the user's watchlist.
 * 
 * Features:
 * - Responsive grid layout (1 column mobile, 2 tablet, 3 desktop)
 * - Empty state message when no stocks are tracked
 * - Renders StockCard components for each watchlist item
 * - Smooth animations for empty state
 * 
 * The component reads from the Zustand store and automatically updates
 * when stocks are added or removed from the watchlist.
 */

'use client';

import { motion } from 'framer-motion';
import { usePortfolioStore } from '@/lib/store/portfolioStore';
import StockCard from './StockCard';

/**
 * Watchlist Component
 * 
 * Displays all stocks in the user's watchlist in a responsive grid.
 * Shows an empty state message when the watchlist is empty.
 */
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


