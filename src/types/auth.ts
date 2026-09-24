export type RolUsuario = 'admin' | 'vendedor' | string;
export type EstadoUsuario = 'activo' | 'inactivo' | string;

export interface PerfilDB {
  id: string;
  nombre_completo: string;
  rol: RolUsuario;
  correo?: string;
  avatar_url?: string | null;
  avatarUrl?: string | null;
  estado?: EstadoUsuario;
  fecha_creacion?: string | null;
}

export interface UserSession {
  userId: string;
  correo: string;
  username: string;
  displayName: string;
  rol: RolUsuario;
  role: RolUsuario;
  accessToken?: string;
}

export interface LoginResult {
  success: boolean;
  session?: UserSession;
  error?: string;
}
