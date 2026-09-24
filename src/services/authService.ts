import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './api';
import type { PerfilDB, UserSession, LoginResult } from '../types/auth';
import { STORAGE_KEYS } from '../utils/constants';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export function getSession(): UserSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
}

export async function login(correo: string, password: string): Promise<LoginResult> {
  let data, error;

  try {
    ({ data, error } = await supabase.auth.signInWithPassword({ email: correo, password }));
  } catch (e: any) {
    console.error('❌ Login error:', e.message);
    return { success: false, error: 'No se pudo conectar con el servidor. Verifica tu conexión.' };
  }

  if (error || !data?.user) {
    return { success: false, error: error?.message || 'Credenciales incorrectas.' };
  }

  const { data: row, error: pErr } = await supabase
    .from('perfiles')
    .select('id, nombre_completo, rol, correo, estado')
    .eq('id', data.user.id)
    .single();

  if (pErr || !row) {
    await supabase.auth.signOut();
    return { success: false, error: 'Perfil no encontrado. Contacta al administrador.' };
  }

  const perfil = row as PerfilDB;

  if (perfil.estado === 'inactivo') {
    await supabase.auth.signOut();
    return { success: false, error: 'Tu cuenta está inactiva. Contacta al administrador.' };
  }

  const session: UserSession = {
    userId:      perfil.id,
    correo:      perfil.correo || data.user.email || '',
    username:    (perfil.correo || data.user.email || '').split('@')[0],
    displayName: perfil.nombre_completo,
    rol:         perfil.rol,
    role:        perfil.rol,
    accessToken: data.session?.access_token,
  };

  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  return { success: true, session };
}

export async function logout(): Promise<void> {
  await supabase.auth.signOut();
  clearSession();
}

export async function updateDisplayName(userId: string, nombreCompleto: string): Promise<void> {
  const { error } = await supabase
    .from('perfiles')
    .update({ nombre_completo: nombreCompleto })
    .eq('id', userId);
  if (error) throw error;

  const session = getSession();
  if (session) {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify({ ...session, displayName: nombreCompleto }));
  }
}

export async function changePassword(newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}
