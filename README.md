# 🌈 Beautiful Stock Portfolio App

A premium, handcrafted stock portfolio application with smooth animations, beautiful design, and real-time stock data. Built with Next.js, Tailwind CSS, Framer Motion, and Alpha Vantage API.

## ✨ Features

- **📊 Watchlist Management**
  - Search and add stocks by ticker symbol
  - Real-time price updates with animated changes
  - Compact sparkline charts for each stock
  - Persistent storage (localStorage)

- **📈 Stock Detail View**
  - Full-screen detail panel with smooth slide-in animation
  - Interactive price charts (30-day history)
  - Comprehensive company overview
  - Key metrics (P/E ratio, market cap, dividend yield, etc.)

- **🎨 Beautiful Design**
  - Glassmorphism UI with backdrop blur effects
  - Smooth micro-animations and transitions
  - Dark/light theme support
  - Fully responsive design
  - Premium, polished aesthetic

- **⚡ Performance**
  - Intelligent API response caching (1-minute cache)
  - Optimized re-renders with Zustand
  - Smooth 60fps animations

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **State Management:** Zustand
- **Charts:** Recharts
- **Icons:** Lucide React
- **API:** Alpha Vantage

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Alpha Vantage API key ([Get one here](https://www.alphavantage.co/support/#api-key))

### Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd "Stock Portfolio"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables:**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_ALPHAVANTAGE_API_KEY=your_api_key_here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser:**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
Stock Portfolio/
├── app/
│   ├── globals.css          # Global styles and Tailwind config
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Main page component
├── components/
│   ├── SearchBar.tsx         # Stock search with autocomplete
│   ├── StockCard.tsx         # Watchlist item card
│   ├── StockDetail.tsx       # Full stock detail panel
│   ├── StockChart.tsx        # Large interactive chart
│   ├── SparklineChart.tsx    # Mini sparkline chart
│   ├── Watchlist.tsx         # Watchlist container
│   └── ThemeToggle.tsx       # Dark/light theme switcher
├── lib/
│   ├── api/
│   │   └── alphavantage.ts   # Alpha Vantage API client
│   ├── store/
│   │   └── portfolioStore.ts # Zustand state management
│   └── utils.ts              # Utility functions
├── package.json
├── tailwind.config.ts        # Tailwind configuration
└── tsconfig.json             # TypeScript configuration
```

## 🎯 Usage

1. **Add Stocks to Watchlist:**
   - Type a stock ticker (e.g., AAPL, MSFT, GOOGL) in the search bar
   - Select from autocomplete suggestions or press Enter
   - Stock will appear in your watchlist

2. **View Stock Details:**
   - Click on any stock card in the watchlist
   - Full detail panel slides in from the right
   - View charts, company info, and key metrics

3. **Remove Stocks:**
   - Hover over a stock card and click the X button
   - Or remove from the detail panel

4. **Toggle Theme:**
   - Click the sun/moon icon in the header
   - Switch between light and dark themes

## 🎨 Design Philosophy

This app prioritizes:

- **Visual Polish:** Every element is carefully styled with attention to spacing, typography, and color
- **Smooth Animations:** Micro-interactions and transitions make the app feel premium
- **User Experience:** Intuitive interactions, clear feedback, and delightful moments
- **Performance:** Optimized rendering and API caching for smooth performance

## 🔧 Configuration

### API Rate Limits

Alpha Vantage has rate limits:
- Free tier: 5 API calls per minute, 500 per day
- The app includes intelligent caching to minimize API calls

### Customization

- **Colors:** Edit `tailwind.config.ts` to customize the color palette
- **Animations:** Adjust animation durations in `tailwind.config.ts` and component files
- **Cache Duration:** Modify `CACHE_DURATION` in `lib/api/alphavantage.ts`

## 📝 Notes

- The app uses localStorage to persist your watchlist
- Stock data refreshes automatically every 60 seconds
- Charts show the last 30 days of data
- Some API endpoints may have rate limits on the free tier

## 🐛 Troubleshooting

**API Key Issues:**
- Make sure your `.env.local` file is in the root directory
- Restart the dev server after adding the API key
- Check the browser console for API errors

**No Data Showing:**
- Verify your API key is valid
- Check Alpha Vantage API status
- Some symbols may not be available

**Styling Issues:**
- Clear browser cache
- Ensure Tailwind CSS is properly configured
- Check that all dependencies are installed

## 📄 License

This project is open source and available for personal use.

## 🙏 Acknowledgments

- [Alpha Vantage](https://www.alphavantage.co/) for stock data API
- [Next.js](https://nextjs.org/) for the amazing framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Framer Motion](https://www.framer.com/motion/) for animations
- [Recharts](https://recharts.org/) for beautiful charts

---

Built with ❤️ and attention to detail. Enjoy tracking your stocks!

