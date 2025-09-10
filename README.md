# Easy Eat AI POS

A modern, AI-powered Point-of-Sale (POS) and inventory management system for small businesses. Features real-time analytics, inventory tracking, and natural language data queries powered by Gemini.

## Features

- **Intuitive POS Interface**: A clean and fast interface for cashiers to process orders.
- **Inventory Management**: Track stock levels, add new products, and get low-stock alerts.
- **AI-Powered Insights**: Use natural language to ask questions about your business data (e.g., "What are my top selling items this week?").
- **AI Inventory Forecasting**: Predicts which items need reordering based on sales velocity.
- **Dashboard & Analytics**: Visualize sales trends, expenses, and profitability with interactive charts.
- **Data Export**: Easily export inventory and expense data to CSV.
- **Light & Dark Mode**: A comfortable viewing experience in any lighting condition.

---

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Google Gemini API key (get from [Google AI Studio](https://aistudio.google.com/app/apikey))
- Supabase project (optional, for database backend)

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd easy_eat
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your credentials:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   VITE_SUPABASE_URL=your_supabase_project_url_here
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

---

## Deployment

### Environment Variables

The app uses Vite environment variables (prefixed with `VITE_`). Set these in your deployment platform:

- `VITE_GEMINI_API_KEY` - Required for AI features
- `VITE_SUPABASE_URL` - Optional, for database backend
- `VITE_SUPABASE_ANON_KEY` - Optional, for database backend

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

### Deployment Platforms

#### Vercel
1. Connect your GitHub repository
2. Set environment variables in project settings
3. Deploy automatically on push

#### Netlify
1. Connect your GitHub repository
2. Set environment variables in site settings
3. Build command: `npm run build`
4. Publish directory: `dist`

#### Railway
1. Connect your GitHub repository
2. Set environment variables in project settings
3. Deploy automatically

### Security Notes

- Never commit `.env.local` or `.env` files
- All `VITE_` prefixed variables are exposed to the client
- Use server-side environment variables for sensitive data
- The app gracefully falls back to mock data if Supabase credentials are missing

---

## Development

### Project Structure

```
├── components/          # React components
├── contexts/           # React context providers
├── services/           # API and external service integrations
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── index.html          # Main HTML file
├── index.tsx           # React app entry point
└── vite.config.ts      # Vite configuration
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

### Legacy Configuration (Deprecated)

The app previously used `config.local.js` for local development. This is still supported but deprecated in favor of `.env.local` files.
