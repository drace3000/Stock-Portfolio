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

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set, get) => ({
      watchlist: [],
      selectedSymbol: null,
      isLoading: false,
      error: null,

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

      removeFromWatchlist: (symbol: string) => {
        set((state) => ({
          watchlist: state.watchlist.filter((item) => item.symbol !== symbol.toUpperCase()),
          selectedSymbol: state.selectedSymbol === symbol ? null : state.selectedSymbol,
        }));
      },

      updateQuote: (symbol: string, quote: StockQuote) => {
        set((state) => ({
          watchlist: state.watchlist.map((item) =>
            item.symbol === symbol.toUpperCase()
              ? { ...item, quote, lastUpdated: Date.now() }
              : item
          ),
        }));
      },

      updateTimeSeries: (symbol: string, timeSeries: TimeSeriesData[]) => {
        set((state) => ({
          watchlist: state.watchlist.map((item) =>
            item.symbol === symbol.toUpperCase()
              ? { ...item, timeSeries, lastUpdated: Date.now() }
              : item
          ),
        }));
      },

      updateOverview: (symbol: string, overview: CompanyOverview) => {
        set((state) => ({
          watchlist: state.watchlist.map((item) =>
            item.symbol === symbol.toUpperCase()
              ? { ...item, overview, lastUpdated: Date.now() }
              : item
          ),
        }));
      },

      setSelectedSymbol: (symbol: string | null) => {
        set({ selectedSymbol: symbol });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

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

