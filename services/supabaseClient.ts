import { createClient } from '@supabase/supabase-js';

// Extend the Window interface to include our app-specific config
// FIX: Unified the APP_CONFIG type to include properties from all services, preventing type conflicts.
declare global {
    interface Window {
        APP_CONFIG?: {
            API_KEY?: string;
            SUPABASE_URL?: string;
            SUPABASE_ANON_KEY?: string;
        };
    }
}

// Prefer Vite env vars, fallback to window.APP_CONFIG (from config.local.js)
// These env vars should be provided in .env.local as VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
const envSupabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const envSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabaseUrl = envSupabaseUrl || window.APP_CONFIG?.SUPABASE_URL;
const supabaseAnonKey = envSupabaseAnonKey || window.APP_CONFIG?.SUPABASE_ANON_KEY;

// Only initialize Supabase if credentials are provided and are not placeholders.
// This allows the app to fall back to mock data if Supabase is not configured.
let supabase = null;

console.log('Supabase initialization check:', {
    envSupabaseUrl: envSupabaseUrl,
    envSupabaseAnonKey: envSupabaseAnonKey ? 'Present' : 'Missing',
    windowAppConfig: window.APP_CONFIG
});

if (supabaseUrl && supabaseAnonKey &&
    !supabaseUrl.startsWith('PASTE_YOUR') && !supabaseAnonKey.startsWith('PASTE_YOUR')) {
    try {
        supabase = createClient(supabaseUrl, supabaseAnonKey);
        console.log('Supabase client initialized successfully');
    } catch (error) {
        console.error("Failed to initialize Supabase client. Check your Vite env or config.local.js.", error);
        supabase = null;
    }
} else {
    console.warn("Supabase credentials not found. Provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local or set them in config.local.js. Falling back to mock data.");
}

export { supabase };