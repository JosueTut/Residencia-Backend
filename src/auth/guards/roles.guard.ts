import {CanActivate, ExecutionContext, Injectable} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {

    // Obtiene los roles requeridos del endpoint o controlador
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Si no hay roles definidos, se permite el acceso
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Obtiene la petición HTTP y el usuario autenticado
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Si no hay usuario o rol, se bloquea el acceso
    if (!user || !user.rol) {
      return false;
    }

    // Normaliza el rol del usuario (mayúsculas, sin espacios)
    const userRole = String(user.rol)
      .toUpperCase()
      .trim()
      .replace(/\s+/g, '_');

    // El rol ROOT tiene acceso total
    if (userRole === Role.ROOT) {
      return true;
    }

    // Verifica si el rol del usuario está permitido
    return requiredRoles.includes(userRole as Role);
  }
}
