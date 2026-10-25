// Keep this file a classic script for the existing static site, and use
// dynamic import to load Supabase's browser-ready ES module explicitly.
const config = window.HEPROT_SUPABASE_CONFIG;

window.heprotSupabaseReady = (async () => {
  try {
    if (!config?.url || !config?.publishableKey) {
      throw new Error('Supabase URL or publishable key is missing from supabase-config.js.');
    }

    const { createClient } = await import(
      'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'
    );
    if (typeof createClient !== 'function') {
      throw new Error('The Supabase JS CDN module did not export createClient.');
    }

    window.heprotSupabase = createClient(config.url, config.publishableKey, {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false
      }
    });
    delete window.heprotSupabaseInitError;
    return window.heprotSupabase;
  } catch (error) {
    window.heprotSupabaseInitError = error;
    console.error('HeProT Supabase client failed to initialize:', error);
    return null;
  }
})();
