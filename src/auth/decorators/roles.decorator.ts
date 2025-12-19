import { SetMetadata } from '@nestjs/common';
import { Role } from '../roles.enum';

// Llave que se usará para guardar los roles en metadata
export const ROLES_KEY = 'roles';

// Decorador que asigna uno o varios roles a un endpoint o controlador
// Ejemplo: @Roles(Role.ADMIN, Role.RRHH)
export const Roles = (...roles: Role[]) =>
  SetMetadata(ROLES_KEY, roles);
