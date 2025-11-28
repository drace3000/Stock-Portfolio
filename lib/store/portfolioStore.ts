/**
 * lib/store/portfolioStore.ts
 * 
 * Zustand state management store for the portfolio application.
 * 
 * Features:
 * - Watchlist management (add/remove stocks)
 * - Stock data storage (quotes, time series, company overview)
 * - Selected symbol tracking (for detail panel)
 * - Persistent storage using localStorage
 * - Loading and error state management
 * 
 * The store persists watchlist data to localStorage so it survives
 * page reloads. All stock data (quotes, charts, overview) is stored
 * here and accessed by components throughout the application.
 */

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { StockQuote, TimeSeriesData, CompanyOverview } from '@/lib/api/alphavantage';

export interface WatchlistItem {
  symbol: string;
  name: string;
  quote?: StockQuote;
  timeSeries?: TimeSeriesData[];
  overview?: CompanyOverview;
  lastUpdated?: number;
}

interface PortfolioState {
  watchlist: WatchlistItem[];
  selectedSymbol: string | null;
  isLoading: boolean;
  error: string | null;
  addToWatchlist: (symbol: string, name: string) => void;
  removeFromWatchlist: (symbol: string) => void;
  updateQuote: (symbol: string, quote: StockQuote) => void;
  updateTimeSeries: (symbol: string, timeSeries: TimeSeriesData[]) => void;
  updateOverview: (symbol: string, overview: CompanyOverview) => void;
  setSelectedSymbol: (symbol: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  getWatchlistItem: (symbol: string) => WatchlistItem | undefined;
}

/**
 * Portfolio Store
 * 
 * Zustand store with persistence middleware.
 * 
 * State includes:
 * - watchlist: Array of tracked stocks with their data
 * - selectedSymbol: Currently selected stock for detail view
 * - isLoading: Loading state for async operations
 * - error: Error messages
 * 
 * Actions:
 * - addToWatchlist: Add new stock to watchlist
 * - removeFromWatchlist: Remove stock from watchlist
 * - updateQuote: Update stock quote data
 * - updateTimeSeries: Update historical price data
 * - updateOverview: Update company overview data
 * - setSelectedSymbol: Set which stock to show in detail panel
 */
export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set, get) => ({
      watchlist: [],
      selectedSymbol: null,
      isLoading: false,
      error: null,

      /**
       * Add a stock to the watchlist
       * Prevents duplicates by checking if symbol already exists
       */
      addToWatchlist: (symbol: string, name: string) => {
        const normalizedSymbol = symbol.toUpperCase();
        const existing = get().watchlist.find((item) => item.symbol === normalizedSymbol);
        
        if (!existing) {
          set((state) => ({
            watchlist: [
              ...state.watchlist,
              {
                symbol: normalizedSymbol,
                name,
                lastUpdated: Date.now(),
              },
            ],
          }));
        }
      },

      /**
       * Remove a stock from the watchlist
       * Also clears selectedSymbol if it matches the removed symbol
       */
      removeFromWatchlist: (symbol: string) => {
        set((state) => ({
          watchlist: state.watchlist.filter((item) => item.symbol !== symbol.toUpperCase()),
          selectedSymbol: state.selectedSymbol === symbol ? null : state.selectedSymbol,
        }));
      },

      /**
       * Update quote data for a specific stock
       * Updates the lastUpdated timestamp to track when data was refreshed
       */
      updateQuote: (symbol: string, quote: StockQuote) => {
        set((state) => ({
          watchlist: state.watchlist.map((item) =>
            item.symbol === symbol.toUpperCase()
              ? { ...item, quote, lastUpdated: Date.now() }
              : item
          ),
        }));
      },

      /**
       * Update time series (historical price) data for a stock
       * Used for rendering charts and sparklines
       */
      updateTimeSeries: (symbol: string, timeSeries: TimeSeriesData[]) => {
        set((state) => ({
          watchlist: state.watchlist.map((item) =>
            item.symbol === symbol.toUpperCase()
              ? { ...item, timeSeries, lastUpdated: Date.now() }
              : item
          ),
        }));
      },

      /**
       * Update company overview data (fundamentals, metrics)
       * Used in the StockDetail panel for comprehensive company information
       */
      updateOverview: (symbol: string, overview: CompanyOverview) => {
        set((state) => ({
          watchlist: state.watchlist.map((item) =>
            item.symbol === symbol.toUpperCase()
              ? { ...item, overview, lastUpdated: Date.now() }
              : item
          ),
        }));
      },

      /**
       * Set which stock is currently selected for detail view
       * Used to control the StockDetail panel visibility
       */
      setSelectedSymbol: (symbol: string | null) => {
        set({ selectedSymbol: symbol });
      },

      /**
       * Set global loading state
       * Can be used for showing loading indicators during async operations
       */
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      /**
       * Set global error state
       * Used for displaying error messages to the user
       */
      setError: (error: string | null) => {
        set({ error });
      },

      /**
       * Get a specific watchlist item by symbol
       * Returns undefined if stock is not in watchlist
       */
      getWatchlistItem: (symbol: string) => {
        return get().watchlist.find((item) => item.symbol === symbol.toUpperCase());
      },
    }),
    {
      name: 'portfolio-storage',
      storage: typeof window !== 'undefined' 
        ? createJSONStorage(() => localStorage)
        : undefined,
      partialize: (state) => ({ watchlist: state.watchlist }),
    }
  )
);

