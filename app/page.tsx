/**
 * app/page.tsx
 * 
 * Main page component for the Stock Portfolio application.
 * 
 * This is the root page component that orchestrates all major features:
 * - Header with app branding and theme toggle
 * - Real-time stock ticker displaying market indicators and watchlist items
 * - Search functionality to add stocks to watchlist
 * - Watchlist display showing user's tracked stocks
 * - Stock detail panel (slides in from right when stock is selected)
 * - Stock Agent component (floating AI assistant button)
 * 
 * The page uses Framer Motion for smooth animations and transitions,
 * creating a polished, premium user experience with staggered entry animations.
 */

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SearchBar from '@/components/SearchBar';
import Watchlist from '@/components/Watchlist';
import StockDetail from '@/components/StockDetail';
import ThemeToggle from '@/components/ThemeToggle';
import StockTicker from '@/components/StockTicker';
import StockAgent from '@/components/StockAgent';
import { TrendingUp } from 'lucide-react';

/**
 * Home Component
 * 
 * Main page layout component that renders all sections of the application.
 * Uses Framer Motion for entrance animations with staggered delays to create
 * a smooth, professional loading experience.
 */
export default function Home() {
  const [dateTime, setDateTime] = useState('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setDateTime(`${dayName} ${month}/${day}/${year} @ ${hours}:${minutes}:${seconds}`);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-30 glass-card border-b border-slate-200/50 dark:border-slate-700/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3"
            >
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 shadow-glow">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gradient">Stock Portfolio</h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Track your favorite stocks
                </p>
              </div>
            </motion.div>

            {dateTime && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="flex-1 min-w-[240px] text-center px-4 py-2 rounded-xl glass-card border border-slate-200/50 dark:border-slate-700/50 font-mono text-sm text-slate-700 dark:text-slate-300"
              >
                {dateTime}
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ThemeToggle />
            </motion.div>
          </div>
        </div>
      </header>

      {/* Stock Ticker */}
      <StockTicker />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-12"
        >
          <div className="flex flex-col items-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4 text-center">
              Add Stocks to Your Watchlist
            </h2>
            <SearchBar />
          </div>
        </motion.div>

        {/* Watchlist Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
            Your Watchlist
          </h2>
          <Watchlist />
        </motion.div>
      </main>

      {/* Stock Detail Panel */}
      <StockDetail />

      {/* Stock Agent */}
      <StockAgent />

      {/* Footer */}
      <footer className="mt-16 py-8 text-center text-slate-500 dark:text-slate-400 text-sm">
        <p>Powered by Alpha Vantage API</p>
      </footer>
    </div>
  );
}

