import api from './api';
import { supabase } from './authService';
import type { PerfilDB } from '../types/auth';
import type { CreateUserData, UpdateUserData } from '../types/usuario';

export async function getUsers(): Promise<PerfilDB[]> {
  const { data } = await api.get(
    '/perfiles?select=id,nombre_completo,rol,correo,estado,fecha_creacion&order=nombre_completo'
  );
  return data || [];
}

export async function createUser({
  correo,
  password,
  nombreCompleto,
  rol,
}: CreateUserData): Promise<PerfilDB> {
  const { data: authData, error: authErr } = await supabase.auth.signUp({
    email: correo,
    password,
  });
  if (authErr) throw new Error(authErr.message);

  const userId = authData?.user?.id;
  if (!userId) throw new Error('No se pudo obtener el ID del usuario creado.');

  const { data } = await api.post('/perfiles', {
    id:              userId,
    nombre_completo: nombreCompleto,
    rol,
    correo,
    estado:          'activo',
  });

  return data[0];
}

export async function updateUser(id: string, campos: UpdateUserData): Promise<PerfilDB> {
  const payload: Record<string, unknown> = {};
  if (campos.nombreCompleto !== undefined) payload.nombre_completo = campos.nombreCompleto;
  if (campos.rol            !== undefined) payload.rol             = campos.rol;
  if (campos.estado         !== undefined) payload.estado          = campos.estado;

  const { data } = await api.patch(`/perfiles?id=eq.${id}`, payload);
  return data[0];
}

export const deactivateUser = (id: string) =>
  api.patch(`/perfiles?id=eq.${id}`, { estado: 'inactivo' });

export const activateUser = (id: string) =>
  api.patch(`/perfiles?id=eq.${id}`, { estado: 'activo' });
