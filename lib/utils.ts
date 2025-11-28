/**
 * lib/utils.ts
 * 
 * Utility functions used throughout the application.
 * 
 * Functions:
 * - cn(): Merge Tailwind CSS classes (combines clsx and tailwind-merge)
 * - formatCurrency(): Format numbers as USD currency ($X.XX)
 * - formatNumber(): Format large numbers with K/M/B suffixes
 * - formatPercent(): Format numbers as percentages with +/- sign
 * - formatLargeNumber(): Format numbers with thousand separators
 * 
 * These utilities ensure consistent number formatting and class
 * management across all components.
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes
 * Combines clsx for conditional classes and tailwind-merge to resolve conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as USD currency
 * Example: 1234.56 -> "$1,234.56"
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format large numbers with K/M/B suffixes
 * Example: 1500000 -> "$1.50M", 2500 -> "$2.50K"
 */
export function formatNumber(value: number): string {
  if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(2)}B`;
  }
  if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(2)}M`;
  }
  if (value >= 1e3) {
    return `$${(value / 1e3).toFixed(2)}K`;
  }
  return value.toFixed(2);
}

/**
 * Format a number as percentage with +/- sign
 * Example: 2.5 -> "+2.50%", -1.2 -> "-1.20%"
 */
export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

/**
 * Format large numbers with thousand separators
 * Example: 1234567 -> "1,234,567"
 */
export function formatLargeNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}


