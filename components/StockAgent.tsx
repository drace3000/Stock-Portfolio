/**
 * components/StockAgent.tsx
 * 
 * AI-powered stock analysis agent component.
 * 
 * Features:
 * - Floating action button (bottom-right) with bot icon
 * - Slide-in panel with AI-generated insights
 * - Analyzes watchlist stocks for:
 *   - High volatility alerts (>5% change)
 *   - Price movement insights (2-5% change)
 *   - Stable stock recommendations (<0.5% change)
 *   - Portfolio-level analysis
 * - Priority-based insights (high/medium/low)
 * - Color-coded cards by priority level
 * - Badge showing count of high-priority alerts
 * 
 * The agent generates insights based on real-time market data
 * from the user's watchlist, providing actionable recommendations.
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, TrendingUp, TrendingDown, AlertTriangle, Lightbulb, Sparkles } from 'lucide-react';
import { usePortfolioStore } from '@/lib/store/portfolioStore';
import { formatCurrency, formatPercent, cn } from '@/lib/utils';

interface AgentInsight {
  type: 'recommendation' | 'alert' | 'insight';
  symbol: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: number;
}

/**
 * StockAgent Component
 * 
 * AI assistant that analyzes watchlist stocks and provides insights.
 * 
 * How it works:
 * 1. User clicks floating bot button
 * 2. Component analyzes all stocks in watchlist
 * 3. Generates insights based on price movements and volatility
 * 4. Displays insights sorted by priority in slide-in panel
 * 5. Shows portfolio-level analysis when applicable
 */
export default function StockAgent() {
  const { watchlist } = usePortfolioStore();
  const [isOpen, setIsOpen] = useState(false);
  const [insights, setInsights] = useState<AgentInsight[]>([]);

  /**
   * Generate AI-powered insights based on watchlist stock data
   * 
   * Analyzes each stock's price movement and generates:
   * - High priority alerts for significant volatility (>5%)
   * - Medium priority insights for moderate movements (2-5%)
   * - Low priority recommendations for stable stocks (<0.5%)
   * - Portfolio-level analysis based on overall performance
   * 
   * @returns Array of insights sorted by priority (high to low)
   */
  const generateInsights = (): AgentInsight[] => {
    const newInsights: AgentInsight[] = [];

    // Analyze each stock in the watchlist
    watchlist.forEach((item) => {
      if (!item.quote) return;

      const { symbol, quote } = item;
      const changePercent = quote.changePercent || 0;
      const price = quote.price;
      const change = quote.change || 0;

      // High volatility alert: Significant price movement (>5%)
      // Indicates potential opportunity or risk
      if (Math.abs(changePercent) > 5) {
        newInsights.push({
          type: 'alert',
          symbol,
          message: `${symbol} is showing ${changePercent > 0 ? 'strong gains' : 'significant losses'} of ${formatPercent(Math.abs(changePercent))}. Consider reviewing your position.`,
          priority: 'high',
          timestamp: Date.now(),
        });
      }

      // Price movement insights: Moderate changes (2-5%)
      // Provides context on market momentum
      if (Math.abs(changePercent) > 2 && Math.abs(changePercent) <= 5) {
        newInsights.push({
          type: 'insight',
          symbol,
          message: `${symbol} is ${changePercent > 0 ? 'up' : 'down'} ${formatPercent(Math.abs(changePercent))} today. ${changePercent > 0 ? 'Positive momentum detected.' : 'Consider monitoring closely.'}`,
          priority: 'medium',
          timestamp: Date.now(),
        });
      }

      // Low price movement recommendation: Stable stocks (<0.5%)
      // Suggests reviewing fundamentals when price is stable
      if (Math.abs(changePercent) < 0.5) {
        newInsights.push({
          type: 'recommendation',
          symbol,
          message: `${symbol} is relatively stable (${formatPercent(Math.abs(changePercent))} change). Good time to review fundamentals.`,
          priority: 'low',
          timestamp: Date.now(),
        });
      }
    });

    // Portfolio-level analysis: Check overall watchlist performance
    if (watchlist.length > 0) {
      // Count stocks with positive change
      const positiveCount = watchlist.filter(
        (item) => item.quote && (item.quote.changePercent || 0) > 0
      ).length;
      const totalCount = watchlist.filter((item) => item.quote).length;

      if (totalCount > 0) {
        const positiveRatio = positiveCount / totalCount;
        // Strong portfolio: >70% positive
        if (positiveRatio > 0.7) {
          newInsights.push({
            type: 'insight',
            symbol: 'PORTFOLIO',
            message: `Strong portfolio performance: ${Math.round(positiveRatio * 100)}% of your holdings are in positive territory.`,
            priority: 'medium',
            timestamp: Date.now(),
          });
        } 
        // Weak portfolio: <30% positive - alert user
        else if (positiveRatio < 0.3) {
          newInsights.push({
            type: 'alert',
            symbol: 'PORTFOLIO',
            message: `Portfolio alert: Only ${Math.round(positiveRatio * 100)}% of holdings are positive. Consider reviewing your positions.`,
            priority: 'high',
            timestamp: Date.now(),
          });
        }
      }
    }

    // Sort insights by priority (high -> medium -> low) for better UX
    return newInsights.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  const handleOpen = () => {
    setIsOpen(true);
    const newInsights = generateInsights();
    setInsights(newInsights);
  };

  const getInsightIcon = (type: AgentInsight['type']) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'recommendation':
        return <Lightbulb className="w-5 h-5 text-yellow-400" />;
      case 'insight':
        return <Sparkles className="w-5 h-5 text-blue-400" />;
    }
  };

  const getPriorityColor = (priority: AgentInsight['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-red-500/50 bg-red-500/10';
      case 'medium':
        return 'border-yellow-500/50 bg-yellow-500/10';
      case 'low':
        return 'border-blue-500/50 bg-blue-500/10';
    }
  };

  return (
    <>
      {/* Agent Button */}
      <motion.button
        onClick={handleOpen}
        className="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 shadow-glow hover:shadow-glow-lg transition-all duration-300"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Open Stock Agent"
      >
        <Bot className="w-6 h-6 text-white" />
        {insights.filter((i) => i.priority === 'high').length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
            {insights.filter((i) => i.priority === 'high').length}
          </span>
        )}
      </motion.button>

      {/* Agent Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, x: 400 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 400 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-slate-900 dark:bg-slate-950 border-l border-slate-700/50 shadow-2xl z-50 overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-primary-500/20 to-indigo-600/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-100">Stock Agent</h2>
                      <p className="text-sm text-slate-400">AI-Powered Insights</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {insights.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <Bot className="w-16 h-16 text-slate-600 mb-4" />
                    <p className="text-slate-400 mb-2">No insights available</p>
                    <p className="text-sm text-slate-500">
                      Add stocks to your watchlist to get AI-powered insights
                    </p>
                  </div>
                ) : (
                  insights.map((insight, index) => (
                    <motion.div
                      key={`${insight.symbol}-${insight.timestamp}-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={cn(
                        'p-4 rounded-xl border glass-card',
                        getPriorityColor(insight.priority)
                      )}
                    >
                      <div className="flex items-start gap-3">
                        {getInsightIcon(insight.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-bold text-slate-200">{insight.symbol}</span>
                            <span
                              className={cn(
                                'text-xs px-2 py-0.5 rounded-full font-semibold',
                                insight.priority === 'high'
                                  ? 'bg-red-500/20 text-red-400'
                                  : insight.priority === 'medium'
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : 'bg-blue-500/20 text-blue-400'
                              )}
                            >
                              {insight.priority.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-slate-300 leading-relaxed">
                            {insight.message}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-700/50 bg-slate-800/50">
                <p className="text-xs text-slate-500 text-center">
                  Insights are generated based on real-time market data
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}


