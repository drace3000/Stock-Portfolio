/**
 * components/SearchBar.tsx
 * 
 * Stock search bar component with autocomplete functionality.
 * 
 * Features:
 * - Real-time stock symbol search using Alpha Vantage API
 * - Debounced search (300ms delay) to minimize API calls
 * - Dropdown suggestions with stock symbol, name, type, and region
 * - Visual indicators for stocks already in watchlist
 * - Error handling with user-friendly messages
 * - Click-outside detection to close dropdown
 * - Loading states and animations
 * 
 * The component searches for stocks as the user types (minimum 2 characters)
 * and displays up to 10 matching results in a scrollable dropdown.
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePortfolioStore } from '@/lib/store/portfolioStore';
import { getAlphaVantageAPI } from '@/lib/api/alphavantage';
import { cn } from '@/lib/utils';

/**
 * SearchBar Component
 * 
 * Provides stock search functionality with autocomplete suggestions.
 * 
 * How it works:
 * 1. User types in search input (minimum 2 characters required)
 * 2. Debounced API call searches Alpha Vantage for matching symbols
 * 3. Results displayed in animated dropdown with stock details
 * 4. User can click result to add to watchlist or press Enter
 * 5. Dropdown closes on outside click or after selection
 */
export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const { addToWatchlist, watchlist } = usePortfolioStore();

  // Close dropdown when clicking outside the search component
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search for stock symbols as user types (debounced)
  useEffect(() => {
    const searchSymbols = async () => {
      // Require minimum 2 characters to search
      if (query.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        setError(null);
        return;
      }

      setIsSearching(true);
      setError(null);
      try {
        const api = getAlphaVantageAPI();
        const results = await api.searchSymbols(query);
        setSuggestions(results.slice(0, 10)); // Limit to 10 results for display
        setShowSuggestions(true);
        if (results.length === 0) {
          setError('No results found. Try a different search term.');
        }
      } catch (error: any) {
        console.error('Search error:', error);
        const errorMessage = error?.message || 'Failed to search. Please try again.';
        
        // Provide user-friendly error messages based on error type
        if (errorMessage.includes('API key')) {
          setError('API key not configured. Please set NEXT_PUBLIC_ALPHAVANTAGE_API_KEY in your .env.local file.');
        } else if (errorMessage.includes('Thank you for using Alpha Vantage') || errorMessage.includes('rate limit')) {
          setError('API rate limit reached. Please wait a moment and try again.');
        } else if (errorMessage.includes('Invalid API call')) {
          setError('Invalid search. Please try a different ticker symbol.');
        } else {
          setError(errorMessage);
        }
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    };

    // Debounce search to avoid excessive API calls (300ms delay)
    const debounceTimer = setTimeout(searchSymbols, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleAddStock = (symbol: string, name: string) => {
    addToWatchlist(symbol, name);
    setQuery('');
    setShowSuggestions(false);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const normalizedSymbol = query.trim().toUpperCase();
      handleAddStock(normalizedSymbol, normalizedSymbol);
    }
  };

  const isInWatchlist = (symbol: string) => {
    return watchlist.some((item) => item.symbol === symbol.toUpperCase());
  };

  const shouldShowDropdown = query.length >= 2 && (showSuggestions || isSearching);

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value.length >= 2) {
                setShowSuggestions(true);
              }
            }}
            onFocus={() => {
              if (query.length >= 2) {
                setShowSuggestions(true);
              }
            }}
            placeholder="Search for a stock ticker (e.g., AAPL, MSFT, GOOGL)..."
            className={cn(
              'input-field pl-12 pr-12',
              'focus:shadow-glow'
            )}
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setShowSuggestions(false);
                setError(null);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          {isSearching && (
            <div className="absolute right-12 top-1/2 -translate-y-1/2">
              <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
            </div>
          )}
        </div>
      </form>

      <AnimatePresence>
        {shouldShowDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 w-full glass-card rounded-xl shadow-soft-lg z-50 overflow-hidden border border-slate-200/50 dark:border-slate-700/50"
          >
            <div className="max-h-80 overflow-y-auto">
              {isSearching ? (
                <div className="px-4 py-6 text-center">
                  <Loader2 className="w-6 h-6 text-primary-500 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">Searching...</p>
                </div>
              ) : error ? (
                <div className="px-4 py-6 text-center">
                  <div className="text-red-500 dark:text-red-400 mb-2">
                    <X className="w-5 h-5 mx-auto mb-2" />
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 font-medium mb-1">{error}</p>
                  {error.includes('API key') && (
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                      Check your .env.local file and restart the dev server
                    </p>
                  )}
                </div>
              ) : suggestions.length > 0 ? (
                <div className="py-2">
                  {suggestions.map((suggestion, index) => {
                    const alreadyAdded = isInWatchlist(suggestion.symbol);
                    return (
                      <motion.button
                        key={`${suggestion.symbol}-${index}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => !alreadyAdded && handleAddStock(suggestion.symbol, suggestion.name)}
                        disabled={alreadyAdded}
                        className={cn(
                          'w-full px-4 py-3 text-left hover:bg-white/50 dark:hover:bg-slate-700/50 transition-colors',
                          'flex items-center justify-between border-b border-slate-100 dark:border-slate-800 last:border-b-0',
                          alreadyAdded && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-slate-900 dark:text-slate-100">
                            {suggestion.symbol}
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400 truncate">
                            {suggestion.name}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                            {suggestion.type} • {suggestion.region}
                          </div>
                        </div>
                        {alreadyAdded && (
                          <span className="text-xs text-primary-600 dark:text-primary-400 font-medium ml-4 whitespace-nowrap">
                            Added
                          </span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              ) : (
                <div className="px-4 py-6 text-center">
                  <p className="text-sm text-slate-600 dark:text-slate-400">No results found</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

