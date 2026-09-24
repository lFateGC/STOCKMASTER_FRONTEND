import axios, { type InternalAxiosRequestConfig } from 'axios';

const SUPABASE_URL: string =
  import.meta.env?.VITE_SUPABASE_URL || 'https://wgxyrjavgwzebjvajqes.supabase.co';
const SUPABASE_ANON_KEY: string =
  import.meta.env?.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndneHlyamF2Z3d6ZWJqdmFqcWVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyMTczMzIsImV4cCI6MjEwNTc5MzMzMn0.qG4xr2Y1Eigxd2p0sR_UhbPxzTB2OFztpgeGK0-1VKw';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Faltan variables de entorno VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY');
}

const api = axios.create({
  baseURL: `${SUPABASE_URL}/rest/v1`,
  headers: {
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
  },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  config.headers['apikey'] = SUPABASE_ANON_KEY;
  try {
    const raw = localStorage.getItem('sm_session');
    if (raw) {
      const session = JSON.parse(raw);
      if (session?.accessToken) {
        config.headers['Authorization'] = `Bearer ${session.accessToken}`;
        return config;
      }
    }
  } catch {
    /* ignorar errores de parse */
  }

  config.headers['Authorization'] = `Bearer ${SUPABASE_ANON_KEY}`;
  return config;
});

export { SUPABASE_URL, SUPABASE_ANON_KEY };
export default api;
