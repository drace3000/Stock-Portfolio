/**
 * next.config.js
 * 
 * Next.js configuration file.
 * 
 * Configures:
 * - React Strict Mode: Enabled for better development experience and error detection
 * - Image domains: Configured for external image sources (currently empty)
 * 
 * This file controls Next.js build and runtime behavior.
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React Strict Mode for better error detection and warnings
  reactStrictMode: true,
  // Configure allowed image domains for Next.js Image optimization
  images: {
    domains: [],
  },
}

module.exports = nextConfig


