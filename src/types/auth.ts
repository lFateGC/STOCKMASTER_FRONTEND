export type RolUsuario = 'admin' | 'vendedor' | 'ADMIN' | 'VENDEDOR' | string;
export type EstadoUsuario = 'activo' | 'inactivo' | string;

export interface PerfilDB {
  id: number | string;
  nombre_completo: string;
  nombreCompleto?: string;
  rol: RolUsuario;
  correo?: string;
  avatar_url?: string | null;
  avatarUrl?: string | null;
  estado?: EstadoUsuario;
  fecha_creacion?: string | null;
  fechaCreacion?: string | null;
}

export interface UserSession {
  userId: number | string;
  correo: string;
  username: string;
  displayName: string;
  rol: RolUsuario;
  role: RolUsuario;
  token?: string;
  accessToken?: string;
  avatarUrl?: string | null;
}

export interface LoginResult {
  success: boolean;
  session?: UserSession;
  error?: string;
}
