/**
 * components/StockDetail.tsx
 * 
 * Detailed stock information panel that slides in from the right.
 * 
 * Features:
 * - Full-screen detail panel with smooth slide-in animation
 * - Large interactive price chart (30-day history)
 * - Company overview with key metrics (P/E ratio, market cap, etc.)
 * - Sector and industry information
 * - 52-week high/low prices
 * - Dividend yield and EPS data
 * - Close button to dismiss panel
 * 
 * The panel appears when a stock card is clicked and fetches
 * comprehensive company data from Alpha Vantage API.
 */

'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, TrendingDown, Building2, BarChart3, DollarSign, Percent, Calendar } from 'lucide-react';
import { usePortfolioStore } from '@/lib/store/portfolioStore';
import { getAlphaVantageAPI } from '@/lib/api/alphavantage';
import { formatCurrency, formatPercent, formatNumber, formatLargeNumber, cn } from '@/lib/utils';
import StockChart from './StockChart';

/**
 * StockDetail Component
 * 
 * Displays comprehensive stock information in a slide-in panel.
 * 
 * How it works:
 * 1. Activated when user clicks a stock card (sets selectedSymbol)
 * 2. Fetches company overview and time series data
 * 3. Displays data in organized sections with charts
 * 4. Can be closed by clicking X or clicking outside
 */
export default function StockDetail() {
  const { selectedSymbol, setSelectedSymbol, getWatchlistItem, updateOverview, updateTimeSeries } = usePortfolioStore();
  const [isLoading, setIsLoading] = useState(false);
  
  const item = selectedSymbol ? getWatchlistItem(selectedSymbol) : null;
  const quote = item?.quote;
  const overview = item?.overview;
  const timeSeries = item?.timeSeries || [];

  // Fetch detailed company data when a stock is selected
  useEffect(() => {
    const fetchDetails = async () => {
      // Don't fetch if no stock is selected
      if (!selectedSymbol) return;

      setIsLoading(true);
      const api = getAlphaVantageAPI();

      try {
        // Fetch company overview and time series data in parallel
        // Overview contains fundamentals, time series contains price history
        const [overviewData, timeSeriesData] = await Promise.all([
          api.getCompanyOverview(selectedSymbol),
          api.getTimeSeries(selectedSymbol, 'daily'),
        ]);

        // Update store with fetched data for display
        if (overviewData) {
          updateOverview(selectedSymbol, overviewData);
        }
        if (timeSeriesData) {
          updateTimeSeries(selectedSymbol, timeSeriesData);
        }
      } catch (error) {
        console.error('Error fetching details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch when selectedSymbol changes
    fetchDetails();
  }, [selectedSymbol, updateOverview, updateTimeSeries]);

  if (!selectedSymbol || !quote) return null;

  const changePercent = quote.changePercent || 0;
  const isPositive = changePercent >= 0;

  return (
    <AnimatePresence>
      {selectedSymbol && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedSymbol(null)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Detail Panel */}
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-4xl bg-white dark:bg-slate-900 shadow-2xl z-50 overflow-y-auto"
          >
            <div className="sticky top-0 glass-card border-b border-slate-200 dark:border-slate-700 p-6 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                    {selectedSymbol}
                  </h2>
                  {overview && (
                    <p className="text-slate-600 dark:text-slate-400">
                      {overview.name}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedSymbol(null)}
                  className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Price Section */}
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-end justify-between mb-4">
                  <div>
                    <div className="text-5xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                      {formatCurrency(quote.price)}
                    </div>
                    <div className={cn(
                      'flex items-center gap-2 text-xl font-semibold',
                      isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    )}>
                      {isPositive ? (
                        <TrendingUp className="w-6 h-6" />
                      ) : (
                        <TrendingDown className="w-6 h-6" />
                      )}
                      <span>{formatPercent(changePercent)}</span>
                      <span className="text-sm text-slate-600 dark:text-slate-400 font-normal">
                        ({formatCurrency(quote.change)})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Open</div>
                    <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {formatCurrency(quote.open)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">High</div>
                    <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                      {formatCurrency(quote.high)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Low</div>
                    <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                      {formatCurrency(quote.low)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Volume</div>
                    <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {formatLargeNumber(quote.volume)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart */}
              {timeSeries.length > 0 && (
                <div className="glass-card rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                    Price Chart
                  </h3>
                  <StockChart data={timeSeries} symbol={selectedSymbol} />
                </div>
              )}

              {/* Company Overview */}
              {overview && (
                <div className="glass-card rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Company Overview
                  </h3>
                  
                  {overview.description && (
                    <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                      {overview.description}
                    </p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <BarChart3 className="w-4 h-4" />
                        <span className="text-sm">Sector</span>
                      </div>
                      <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {overview.sector}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <Building2 className="w-4 h-4" />
                        <span className="text-sm">Industry</span>
                      </div>
                      <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {overview.industry}
                      </div>
                    </div>

                    {overview.marketCap && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                          <DollarSign className="w-4 h-4" />
                          <span className="text-sm">Market Cap</span>
                        </div>
                        <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                          {formatNumber(parseFloat(overview.marketCap))}
                        </div>
                      </div>
                    )}

                    {overview.peRatio && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                          <Percent className="w-4 h-4" />
                          <span className="text-sm">P/E Ratio</span>
                        </div>
                        <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                          {overview.peRatio}
                        </div>
                      </div>
                    )}

                    {overview.dividendYield && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                          <Percent className="w-4 h-4" />
                          <span className="text-sm">Dividend Yield</span>
                        </div>
                        <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                          {overview.dividendYield}%
                        </div>
                      </div>
                    )}

                    {overview.eps && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                          <DollarSign className="w-4 h-4" />
                          <span className="text-sm">EPS</span>
                        </div>
                        <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                          ${overview.eps}
                        </div>
                      </div>
                    )}

                    {overview.beta && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                          <BarChart3 className="w-4 h-4" />
                          <span className="text-sm">Beta</span>
                        </div>
                        <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                          {overview.beta}
                        </div>
                      </div>
                    )}

                    {overview['52WeekHigh'] && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">52 Week High</span>
                        </div>
                        <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                          {formatCurrency(parseFloat(overview['52WeekHigh']))}
                        </div>
                      </div>
                    )}

                    {overview['52WeekLow'] && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">52 Week Low</span>
                        </div>
                        <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                          {formatCurrency(parseFloat(overview['52WeekLow']))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {isLoading && (
                <div className="glass-card rounded-2xl p-6 text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}


