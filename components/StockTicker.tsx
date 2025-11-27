'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { usePortfolioStore } from '@/lib/store/portfolioStore';
import { getAlphaVantageAPI } from '@/lib/api/alphavantage';
import { formatCurrency, formatPercent, cn } from '@/lib/utils';

interface TickerItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  isWatchlist?: boolean;
  isMarketIndex?: boolean;
  marketStatus?: 'open' | 'closed';
  region?: string;
}

interface MarketIndex {
  symbol: string;
  name: string;
  region: 'US' | 'Europe' | 'Asia';
  timezone: string;
  openHour: number;
  openMinute: number;
  closeHour: number;
  closeMinute: number;
}

// Major market indices
const MARKET_INDICES: MarketIndex[] = [
  // US Markets
  { symbol: 'SPY', name: 'S&P 500', region: 'US', timezone: 'America/New_York', openHour: 9, openMinute: 30, closeHour: 16, closeMinute: 0 },
  { symbol: 'DIA', name: 'Dow Jones', region: 'US', timezone: 'America/New_York', openHour: 9, openMinute: 30, closeHour: 16, closeMinute: 0 },
  { symbol: 'QQQ', name: 'NASDAQ', region: 'US', timezone: 'America/New_York', openHour: 9, openMinute: 30, closeHour: 16, closeMinute: 0 },
  { symbol: 'IWM', name: 'Russell 2000', region: 'US', timezone: 'America/New_York', openHour: 9, openMinute: 30, closeHour: 16, closeMinute: 0 },
  
  // European Markets
  { symbol: 'EWU', name: 'FTSE 100', region: 'Europe', timezone: 'Europe/London', openHour: 8, openMinute: 0, closeHour: 16, closeMinute: 30 },
  { symbol: 'EWG', name: 'DAX', region: 'Europe', timezone: 'Europe/Berlin', openHour: 9, openMinute: 0, closeHour: 17, closeMinute: 30 },
  { symbol: 'EWQ', name: 'CAC 40', region: 'Europe', timezone: 'Europe/Paris', openHour: 9, openMinute: 0, closeHour: 17, closeMinute: 30 },
  { symbol: 'EWI', name: 'FTSE MIB', region: 'Europe', timezone: 'Europe/Rome', openHour: 9, openMinute: 0, closeHour: 17, closeMinute: 30 },
  
  // Asian Markets
  { symbol: 'EWJ', name: 'Nikkei 225', region: 'Asia', timezone: 'Asia/Tokyo', openHour: 9, openMinute: 0, closeHour: 15, closeMinute: 0 },
  { symbol: 'FXI', name: 'Shanghai Composite', region: 'Asia', timezone: 'Asia/Shanghai', openHour: 9, openMinute: 30, closeHour: 15, closeMinute: 0 },
  { symbol: 'EWH', name: 'Hang Seng', region: 'Asia', timezone: 'Asia/Hong_Kong', openHour: 9, openMinute: 30, closeHour: 16, closeMinute: 0 },
  { symbol: 'EWY', name: 'KOSPI', region: 'Asia', timezone: 'Asia/Seoul', openHour: 9, openMinute: 0, closeHour: 15, closeMinute: 30 },
];

// Check if a specific market is open based on its timezone and hours
function isMarketOpenForIndex(index: MarketIndex): boolean {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 6 = Saturday
  
  // Get current time in the market's timezone
  const marketTimeString = now.toLocaleString('en-US', { 
    timeZone: index.timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  
  const [hours, minutes] = marketTimeString.split(':').map(Number);
  const timeInMinutes = hours * 60 + minutes;
  
  const marketOpen = index.openHour * 60 + index.openMinute;
  const marketClose = index.closeHour * 60 + index.closeMinute;
  
  // Check if it's a weekday (Monday-Friday)
  // Note: Some Asian markets are open on Saturdays, but we'll keep it simple
  if (day === 0 || day === 6) return false;
  
  return timeInMinutes >= marketOpen && timeInMinutes < marketClose;
}

// Check if US market is open (for overall status)
function isUSMarketOpen(): boolean {
  const usIndex = MARKET_INDICES.find(idx => idx.symbol === 'SPY');
  return usIndex ? isMarketOpenForIndex(usIndex) : false;
}

// Popular stocks (excluding market indices which are handled separately)
const POPULAR_STOCKS = [
  // US Markets
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'JPM', 'V', 'JNJ',
  // International Markets
  'ASML', 'TSM', 'NVO', 'SAP', 'UL', 'NVS', 'HSBC', 'BP', 'GSK', 'AZN',
];

export default function StockTicker() {
  const { watchlist } = usePortfolioStore();
  const [tickerItems, setTickerItems] = useState<TickerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [marketStatus, setMarketStatus] = useState<'open' | 'closed'>('open');

  useEffect(() => {
    // Check US market status
    setMarketStatus(isUSMarketOpen() ? 'open' : 'closed');
    
    // Update market status every minute
    const statusInterval = setInterval(() => {
      setMarketStatus(isUSMarketOpen() ? 'open' : 'closed');
    }, 60000);

    // First, use watchlist items that already have quotes (instant display)
    const watchlistItemsWithQuotes: TickerItem[] = watchlist
      .filter(item => item.quote)
      .map(item => {
        const marketIndex = MARKET_INDICES.find(idx => idx.symbol === item.symbol);
        const isIndex = !!marketIndex;
        return {
          symbol: item.symbol,
          name: marketIndex ? marketIndex.name : item.name,
          price: item.quote!.price,
          change: item.quote!.change,
          changePercent: item.quote!.changePercent,
          isWatchlist: true,
          isMarketIndex: isIndex,
          marketStatus: marketIndex ? (isMarketOpenForIndex(marketIndex) ? 'open' : 'closed') : undefined,
          region: marketIndex ? marketIndex.region : undefined,
        };
      });

    // Show watchlist items immediately if available
    if (watchlistItemsWithQuotes.length > 0) {
      const sorted = [...watchlistItemsWithQuotes].sort((a, b) => {
        // Market indices first
        if (a.isMarketIndex && !b.isMarketIndex) return -1;
        if (!a.isMarketIndex && b.isMarketIndex) return 1;
        // Then by change percent
        return Math.abs(b.changePercent) - Math.abs(a.changePercent);
      });
      setTickerItems([...sorted, ...sorted]);
      setIsLoading(false);
    }

    const fetchTickerData = async () => {
      const api = getAlphaVantageAPI();
      const watchlistSymbols = watchlist.map(item => item.symbol);
      const watchlistSymbolsWithQuotes = watchlist
        .filter(item => item.quote)
        .map(item => item.symbol);
      
      // Prioritize market indices - always fetch them first
      const marketIndexSymbols = MARKET_INDICES.map(idx => idx.symbol);
      
      // Get market indices not already in watchlist with quotes
      const marketIndicesToFetch = marketIndexSymbols.filter(
        symbol => !watchlistSymbolsWithQuotes.includes(symbol)
      );
      
      // Get popular stocks not in watchlist
      const stocksToFetch = POPULAR_STOCKS.filter(
        symbol => !watchlistSymbolsWithQuotes.includes(symbol)
      );
      
      // Prioritize: market indices first, then popular stocks
      const symbolsToFetch = [...marketIndicesToFetch, ...stocksToFetch].slice(0, 10);

      if (symbolsToFetch.length === 0) {
        setIsLoading(false);
        return;
      }

      try {
        const results: TickerItem[] = [];
        const timeout = 10000; // 10 second timeout per call
        
        for (let i = 0; i < symbolsToFetch.length; i++) {
          const symbol = symbolsToFetch[i];
          try {
            // Add delay between calls (shorter delay for first few market indices)
            if (i > 0) {
              const isMarketIndex = MARKET_INDICES.some(idx => idx.symbol === symbol);
              // Use shorter delay for first 4 items (likely market indices), then longer delay
              const delay = (isMarketIndex && i < 4) ? 2000 : 13000; // 2s for first indices, 13s for others
              await new Promise(resolve => setTimeout(resolve, delay));
            }
            
            const quotePromise = api.getQuote(symbol);
            const timeoutPromise = new Promise<null>((resolve) => 
              setTimeout(() => resolve(null), timeout)
            );
            
            const quote = await Promise.race([quotePromise, timeoutPromise]);
            
            if (quote) {
              // Check if this is a market index
              const marketIndex = MARKET_INDICES.find(idx => idx.symbol === symbol);
              const isIndex = !!marketIndex;
              
              results.push({
                symbol: quote.symbol,
                name: marketIndex ? marketIndex.name : quote.name,
                price: quote.price,
                change: quote.change,
                changePercent: quote.changePercent,
                isWatchlist: watchlistSymbols.includes(symbol),
                isMarketIndex: isIndex,
                marketStatus: marketIndex ? (isMarketOpenForIndex(marketIndex) ? 'open' : 'closed') : undefined,
                region: marketIndex ? marketIndex.region : undefined,
              });
              
              // Update UI as we get results - merge with watchlist items
              const allItems = [...watchlistItemsWithQuotes, ...results];
              if (allItems.length > 0) {
                // Remove duplicates (keep watchlist version if exists)
                const uniqueItems = allItems.reduce((acc, item) => {
                  const existing = acc.find(i => i.symbol === item.symbol);
                  if (!existing) {
                    acc.push(item);
                  } else if (item.isWatchlist && !existing.isWatchlist) {
                    // Replace with watchlist version
                    const index = acc.indexOf(existing);
                    acc[index] = item;
                  }
                  return acc;
                }, [] as TickerItem[]);
                
                const sorted = [...uniqueItems].sort((a, b) => {
                  // Market indices first
                  if (a.isMarketIndex && !b.isMarketIndex) return -1;
                  if (!a.isMarketIndex && b.isMarketIndex) return 1;
                  // Then watchlist items
                  if (a.isWatchlist && !b.isWatchlist) return -1;
                  if (!a.isWatchlist && b.isWatchlist) return 1;
                  // Then by change percent
                  return Math.abs(b.changePercent) - Math.abs(a.changePercent);
                });
                setTickerItems([...sorted, ...sorted]);
                setIsLoading(false);
              }
            }
          } catch (error) {
            console.error(`Error fetching quote for ${symbol}:`, error);
          }
        }

        // Final update with all items - merge with watchlist items
        const allItems = [...watchlistItemsWithQuotes, ...results];
        if (allItems.length > 0) {
          // Remove duplicates (keep watchlist version if exists)
          const uniqueItems = allItems.reduce((acc, item) => {
            const existing = acc.find(i => i.symbol === item.symbol);
            if (!existing) {
              acc.push(item);
            } else if (item.isWatchlist && !existing.isWatchlist) {
              // Replace with watchlist version
              const index = acc.indexOf(existing);
              acc[index] = item;
            }
            return acc;
          }, [] as TickerItem[]);
          
          const sorted = [...uniqueItems].sort((a, b) => {
            // Market indices first
            if (a.isMarketIndex && !b.isMarketIndex) return -1;
            if (!a.isMarketIndex && b.isMarketIndex) return 1;
            // Then watchlist items
            if (a.isWatchlist && !b.isWatchlist) return -1;
            if (!a.isWatchlist && b.isWatchlist) return 1;
            // Then by change percent
            return Math.abs(b.changePercent) - Math.abs(a.changePercent);
          });
          setTickerItems([...sorted, ...sorted]);
        }
      } catch (error) {
        console.error('Error fetching ticker data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Set a timeout to ensure loading state is cleared
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 15000); // 15 second max loading time

    fetchTickerData();
    
    // Refresh every 60 seconds
    const interval = setInterval(fetchTickerData, 60000);
    
    return () => {
      clearInterval(interval);
      clearInterval(statusInterval);
      clearTimeout(loadingTimeout);
    };
  }, [watchlist]);

  // Show loading state or fallback data
  const displayItems = tickerItems.length > 0 ? tickerItems : [];
  
  if (isLoading && displayItems.length === 0) {
    return (
      <div className="w-full py-3 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border-y border-slate-700/50 overflow-hidden relative">
        <div className="flex animate-pulse whitespace-nowrap">
          <div className="flex items-center gap-3 px-6 mx-2 flex-shrink-0">
            <div className="h-4 bg-slate-700 rounded w-16"></div>
            <div className="h-4 bg-slate-700 rounded w-20"></div>
            <div className="h-4 bg-slate-700 rounded w-16"></div>
          </div>
          <div className="flex items-center gap-3 px-6 mx-2 flex-shrink-0">
            <div className="h-4 bg-slate-700 rounded w-16"></div>
            <div className="h-4 bg-slate-700 rounded w-20"></div>
            <div className="h-4 bg-slate-700 rounded w-16"></div>
          </div>
          <div className="flex items-center gap-3 px-6 mx-2 flex-shrink-0">
            <div className="h-4 bg-slate-700 rounded w-16"></div>
            <div className="h-4 bg-slate-700 rounded w-20"></div>
            <div className="h-4 bg-slate-700 rounded w-16"></div>
          </div>
        </div>
      </div>
    );
  }

  if (displayItems.length === 0 && !isLoading) {
    // Show placeholder ticker with sample data if API fails
    const placeholderItems: TickerItem[] = [
      { symbol: 'AAPL', name: 'Apple Inc.', price: 175.50, change: 2.30, changePercent: 1.33, isWatchlist: false },
      { symbol: 'MSFT', name: 'Microsoft', price: 378.85, change: -1.20, changePercent: -0.32, isWatchlist: false },
      { symbol: 'GOOGL', name: 'Alphabet', price: 142.50, change: 0.85, changePercent: 0.60, isWatchlist: false },
    ];
    
    return (
      <div className="w-full py-3 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border-y border-slate-700/50 overflow-hidden relative">
        <div className="flex animate-scroll whitespace-nowrap" style={{ width: 'fit-content' }}>
          {[...placeholderItems, ...placeholderItems].map((item, index) => {
            const isPositive = item.changePercent >= 0;
            return (
              <div
                key={`placeholder-${item.symbol}-${index}`}
                className="flex items-center gap-3 px-6 mx-2 border-r border-slate-700/30 flex-shrink-0 opacity-60"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-400">
                    {item.symbol}
                  </span>
                </div>
                <span className="text-slate-300 text-sm font-medium">
                  {formatCurrency(item.price)}
                </span>
                <div className={cn(
                  "flex items-center gap-1 text-xs font-semibold",
                  isPositive ? "text-green-400" : "text-red-400"
                )}>
                  {isPositive ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>{isPositive ? '+' : ''}{formatPercent(item.changePercent)}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-slate-900 dark:from-slate-950 to-transparent pointer-events-none z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-slate-900 dark:from-slate-950 to-transparent pointer-events-none z-10" />
      </div>
    );
  }

  // Render a single ticker item
  const renderTickerItem = (item: TickerItem, index: number) => {
    const isPositive = item.changePercent >= 0;
    const itemMarketStatus = item.marketStatus || (item.isMarketIndex ? 'closed' : marketStatus);
    const showCloseIndicator = itemMarketStatus === 'closed' && item.isMarketIndex;
    
    return (
      <div
        key={`${item.symbol}-${index}`}
        className="flex items-center gap-3 px-6 mx-2 border-r border-slate-700/30 flex-shrink-0"
      >
        <div className="flex items-center gap-2">
          <span className={cn(
            "font-bold text-sm",
            item.isWatchlist 
              ? "text-primary-400 dark:text-primary-400" 
              : item.isMarketIndex
              ? "text-yellow-400 dark:text-yellow-400"
              : "text-slate-300 dark:text-slate-300"
          )}>
            {item.symbol}
          </span>
          {item.isWatchlist && (
            <span className="text-xs text-primary-500 dark:text-primary-500 px-1.5 py-0.5 rounded bg-primary-500/20">
              ★
            </span>
          )}
          {item.isMarketIndex && (
            <span className={cn(
              "text-xs px-1.5 py-0.5 rounded font-semibold",
              itemMarketStatus === 'open'
                ? "text-green-500 dark:text-green-500 bg-green-500/20"
                : "text-slate-500 dark:text-slate-500 bg-slate-500/20"
            )}>
              {item.region}
            </span>
          )}
        </div>
        <span className="text-slate-200 dark:text-slate-200 text-sm font-medium">
          {formatCurrency(item.price)}
        </span>
        <div className={cn(
          "flex items-center gap-1 text-xs font-semibold",
          isPositive 
            ? "text-green-400 dark:text-green-400" 
            : "text-red-400 dark:text-red-400"
        )}>
          {isPositive ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          <span>{isPositive ? '+' : ''}{formatPercent(item.changePercent)}</span>
        </div>
        {showCloseIndicator && (
          <span className="text-xs text-slate-500 dark:text-slate-500 ml-1">
            CLOSED
          </span>
        )}
      </div>
    );
  };

  // Get unique items (remove duplicates from the doubled array)
  const uniqueItems = displayItems.slice(0, Math.ceil(displayItems.length / 2));

  return (
    <div className="w-full py-3 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border-y border-slate-700/50 overflow-hidden relative">
      {/* Market Status Indicator */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex items-center gap-2">
        <div className={cn(
          "w-2 h-2 rounded-full",
          marketStatus === 'open' ? "bg-green-400 animate-pulse" : "bg-slate-500"
        )} />
        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
          {marketStatus === 'open' ? 'MARKET OPEN' : 'MARKET CLOSED'}
        </span>
      </div>

      <div className="relative overflow-hidden" style={{ marginLeft: '140px', marginRight: '32px' }}>
        <div className="flex whitespace-nowrap ticker-scroll">
          {/* First set of items */}
          {uniqueItems.map((item, index) => renderTickerItem(item, index))}
          {/* Duplicate set for seamless loop */}
          {uniqueItems.map((item, index) => renderTickerItem(item, index + uniqueItems.length))}
        </div>
      </div>
      
      {/* Gradient overlays for smooth fade effect */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-900 dark:from-slate-950 to-transparent pointer-events-none z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-900 dark:from-slate-950 to-transparent pointer-events-none z-10" />
    </div>
  );
}

