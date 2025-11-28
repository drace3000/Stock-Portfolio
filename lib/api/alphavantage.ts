/**
 * lib/api/alphavantage.ts
 * 
 * Alpha Vantage API client for fetching stock market data.
 * 
 * Features:
 * - Stock quote retrieval (current price, change, volume, etc.)
 * - Time series data (historical prices for charts)
 * - Company overview (fundamentals, metrics, description)
 * - Symbol search (autocomplete functionality)
 * - In-memory caching (1-minute cache duration) to minimize API calls
 * - Rate limit handling and error management
 * - Singleton pattern for API instance management
 * 
 * The API client implements intelligent caching to respect Alpha Vantage's
 * rate limits (5 calls per minute on free tier) while providing fast
 * responses for frequently accessed data.
 */

import axios from 'axios';

const API_BASE_URL = 'https://www.alphavantage.co/query';

// Cache for API responses (simple in-memory cache)
// Reduces API calls and improves performance by caching responses for 1 minute
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 60000; // 1 minute cache

interface CacheEntry {
  data: any;
  timestamp: number;
}

function getCached(key: string): any | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

function setCache(key: string, data: any): void {
  cache.set(key, { data, timestamp: Date.now() });
}

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
}

export interface TimeSeriesData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface CompanyOverview {
  symbol: string;
  name: string;
  description: string;
  sector: string;
  industry: string;
  marketCap: string;
  peRatio: string;
  dividendYield: string;
  eps: string;
  beta: string;
  '52WeekHigh': string;
  '52WeekLow': string;
}

export interface SearchResult {
  symbol: string;
  name: string;
  type: string;
  region: string;
}

/**
 * AlphaVantageAPI Class
 * 
 * Main API client class that handles all interactions with Alpha Vantage API.
 * 
 * Methods:
 * - getQuote(): Get current stock quote with price, change, volume
 * - getTimeSeries(): Get historical price data for charts
 * - getCompanyOverview(): Get company fundamentals and metrics
 * - searchSymbols(): Search for stock symbols by keyword
 * 
 * All methods implement caching to minimize API calls and handle errors gracefully.
 */
class AlphaVantageAPI {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Get current stock quote
   * 
   * Fetches real-time quote data including:
   * - Current price
   * - Price change and percentage
   * - Volume, high, low, open prices
   * - Previous close
   * 
   * Uses caching to avoid redundant API calls.
   */
  async getQuote(symbol: string): Promise<StockQuote | null> {
    const cacheKey = `quote_${symbol}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(API_BASE_URL, {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol: symbol.toUpperCase(),
          apikey: this.apiKey,
        },
      });

      if (response.data['Error Message'] || response.data['Note']) {
        console.error('API Error:', response.data['Error Message'] || response.data['Note']);
        return null;
      }

      const quote = response.data['Global Quote'];
      if (!quote || !quote['05. price']) {
        return null;
      }

      const stockQuote: StockQuote = {
        symbol: quote['01. symbol'],
        name: quote['01. symbol'], // AlphaVantage doesn't provide name in quote
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
        volume: parseInt(quote['06. volume']),
        high: parseFloat(quote['03. high']),
        low: parseFloat(quote['04. low']),
        open: parseFloat(quote['02. open']),
        previousClose: parseFloat(quote['08. previous close']),
      };

      setCache(cacheKey, stockQuote);
      return stockQuote;
    } catch (error) {
      console.error('Error fetching quote:', error);
      return null;
    }
  }

  /**
   * Get historical time series data for charts
   * 
   * Fetches historical price data (OHLCV) for a stock.
   * Supports daily and intraday intervals (1min, 5min, 15min, 30min, 60min).
   * 
   * Returns last 30 data points sorted chronologically.
   * Used for rendering price charts and sparklines.
   */
  async getTimeSeries(symbol: string, interval: '1min' | '5min' | '15min' | '30min' | '60min' | 'daily' = 'daily'): Promise<TimeSeriesData[]> {
    const cacheKey = `timeseries_${symbol}_${interval}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
      const functionName = interval === 'daily' ? 'TIME_SERIES_DAILY' : `TIME_SERIES_INTRADAY`;
      const params: any = {
        function: functionName,
        symbol: symbol.toUpperCase(),
        apikey: this.apiKey,
      };

      if (interval !== 'daily') {
        params.interval = interval;
      }

      const response = await axios.get(API_BASE_URL, { params });

      if (response.data['Error Message'] || response.data['Note']) {
        console.error('API Error:', response.data['Error Message'] || response.data['Note']);
        return [];
      }

      const timeSeriesKey = interval === 'daily' 
        ? 'Time Series (Daily)'
        : `Time Series (${interval})`;
      
      const timeSeries = response.data[timeSeriesKey];
      if (!timeSeries) {
        return [];
      }

      const data: TimeSeriesData[] = Object.entries(timeSeries)
        .map(([date, values]: [string, any]) => ({
          date,
          open: parseFloat(values['1. open']),
          high: parseFloat(values['2. high']),
          low: parseFloat(values['3. low']),
          close: parseFloat(values['4. close']),
          volume: parseInt(values['5. volume']),
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(-30); // Last 30 data points

      setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching time series:', error);
      return [];
    }
  }

  /**
   * Get comprehensive company overview and fundamentals
   * 
   * Fetches detailed company information including:
   * - Company description
   * - Sector and industry
   * - Market capitalization
   * - P/E ratio, EPS, dividend yield
   * - Beta, 52-week high/low
   * 
   * Used in the StockDetail panel to display company information.
   */
  async getCompanyOverview(symbol: string): Promise<CompanyOverview | null> {
    const cacheKey = `overview_${symbol}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(API_BASE_URL, {
        params: {
          function: 'OVERVIEW',
          symbol: symbol.toUpperCase(),
          apikey: this.apiKey,
        },
      });

      if (response.data['Error Message'] || response.data['Note'] || !response.data.Symbol) {
        console.error('API Error:', response.data['Error Message'] || response.data['Note']);
        return null;
      }

      const overview: CompanyOverview = {
        symbol: response.data.Symbol,
        name: response.data.Name,
        description: response.data.Description,
        sector: response.data.Sector,
        industry: response.data.Industry,
        marketCap: response.data.MarketCapitalization,
        peRatio: response.data.PERatio,
        dividendYield: response.data.DividendYield,
        eps: response.data.EPS,
        beta: response.data.Beta,
        '52WeekHigh': response.data['52WeekHigh'],
        '52WeekLow': response.data['52WeekLow'],
      };

      setCache(cacheKey, overview);
      return overview;
    } catch (error) {
      console.error('Error fetching company overview:', error);
      return null;
    }
  }

  /**
   * Search for stock symbols by keyword
   * 
   * Searches Alpha Vantage database for matching stock symbols.
   * Returns array of results with symbol, name, type, and region.
   * 
   * Used by SearchBar component for autocomplete functionality.
   * Validates API key before making request.
   */
  async searchSymbols(keywords: string): Promise<SearchResult[]> {
    if (!this.apiKey) {
      throw new Error('API key not configured. Please set NEXT_PUBLIC_ALPHAVANTAGE_API_KEY in your environment variables.');
    }

    const cacheKey = `search_${keywords}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(API_BASE_URL, {
        params: {
          function: 'SYMBOL_SEARCH',
          keywords: keywords,
          apikey: this.apiKey,
        },
      });

      // Debug: log response structure (only in development)
      if (process.env.NODE_ENV === 'development') {
        console.log('API Response keys:', Object.keys(response.data));
      }

      // Check for API errors
      if (response.data['Error Message']) {
        const errorMsg = response.data['Error Message'];
        console.error('API Error:', errorMsg);
        throw new Error(errorMsg);
      }

      // Check for rate limit or other notes
      if (response.data['Note']) {
        const note = response.data['Note'];
        console.error('API Note:', note);
        throw new Error(note);
      }

      const matches = response.data.bestMatches || [];
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Found matches:', matches.length);
      }
      
      if (!Array.isArray(matches) || matches.length === 0) {
        return [];
      }

      const results: SearchResult[] = matches.map((match: any) => ({
        symbol: match['1. symbol'],
        name: match['2. name'],
        type: match['3. type'],
        region: match['4. region'],
      })).filter((result) => result.symbol && result.name); // Filter out invalid results

      setCache(cacheKey, results);
      return results;
    } catch (error: any) {
      console.error('Error searching symbols:', error);
      // Re-throw to allow component to handle it
      throw error;
    }
  }
}

// Singleton instance - will be initialized with API key from env
// Ensures only one API instance exists throughout the application
let apiInstance: AlphaVantageAPI | null = null;

/**
 * Get or create the singleton Alpha Vantage API instance
 * 
 * Reads API key from environment variable NEXT_PUBLIC_ALPHAVANTAGE_API_KEY.
 * Creates instance on first call, returns existing instance on subsequent calls.
 * 
 * @returns AlphaVantageAPI instance
 */
export function getAlphaVantageAPI(): AlphaVantageAPI {
  if (!apiInstance) {
    const apiKey = process.env.NEXT_PUBLIC_ALPHAVANTAGE_API_KEY || '';
    if (!apiKey) {
      console.warn('AlphaVantage API key not found. Please set NEXT_PUBLIC_ALPHAVANTAGE_API_KEY');
    }
    apiInstance = new AlphaVantageAPI(apiKey);
  }
  return apiInstance;
}

