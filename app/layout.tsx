/**
 * app/layout.tsx
 * 
 * Root layout component for the Next.js application.
 * 
 * This component wraps all pages and provides:
 * - HTML structure with dark mode as default
 * - Global CSS imports
 * - SEO metadata (title and description)
 * - Suppresses hydration warnings for theme switching
 * 
 * The layout sets the default theme to dark mode by adding the 'dark' class
 * to the HTML element, which is then managed by the ThemeToggle component.
 */

import type { Metadata } from 'next';
import './globals.css';

// SEO metadata for the application
export const metadata: Metadata = {
  title: 'Stock Portfolio - Beautiful Stock Tracker',
  description: 'A beautiful, modern stock portfolio application with real-time data and smooth animations',
};

/**
 * RootLayout Component
 * 
 * Provides the root HTML structure for all pages.
 * Sets dark mode as default and suppresses hydration warnings
 * to prevent console errors during theme switching.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}

