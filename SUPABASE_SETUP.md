# Supabase Setup Guide

## 1. Create Database Tables

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase-schema.sql`
4. Click **Run** to execute the script

This will create:
- `products` table with sample data
- `sales` table for transaction records
- `expenses` table for expense tracking
- Proper Row Level Security policies

## 2. Verify Environment Variables

Make sure these are set in your Vercel deployment:

```
VITE_SUPABASE_URL=https://mtjgmbaqufuimtorubnw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 3. Test the Connection

1. Deploy your app to Vercel
2. Open browser console
3. Look for these logs:
   - `Supabase initialization check:` - Shows if credentials are loaded
   - `Supabase client initialized successfully` - Confirms connection
   - `Supabase available: true` - Confirms API calls will use Supabase

## 4. Troubleshooting

### If still using mock data:

1. **Check console logs** - Look for Supabase initialization messages
2. **Verify environment variables** - Ensure they're set in Vercel dashboard
3. **Check database tables** - Make sure the SQL script ran successfully
4. **Redeploy** - Environment variables require a redeploy to take effect

### Common Issues:

- **Environment variables not set** - Add them in Vercel project settings
- **Database tables missing** - Run the SQL script in Supabase
- **RLS policies** - The script sets up public access policies
- **CORS issues** - Supabase handles this automatically

## 5. Data Flow

The app now uses a hybrid approach:
1. **Try Supabase first** - If connected and working
2. **Fallback to mock data** - If Supabase fails or isn't configured
3. **Console logging** - Shows which data source is being used

This ensures the app always works, whether Supabase is configured or not.
