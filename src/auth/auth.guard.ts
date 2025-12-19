import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from "express";
import { jwtConstants } from './constants/jwt.constant';

@Injectable()
export class AuthGuard implements CanActivate {

  // Se inyecta el servicio JWT para verificar los tokens
  constructor(
    private readonly jwtService: JwtService
  ) {}

  // Método que se ejecuta antes de entrar al endpoint
  async canActivate(context: ExecutionContext): Promise<boolean> {

    // Obtiene el objeto request de la petición HTTP
    const request = context.switchToHttp().getRequest<Request>();

    // Extrae el token del header Authorization
    const token = this.extractTokenFromHeader(request);

    // Si no hay token, se bloquea el acceso
    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      // Verifica que el token sea válido y no haya sido modificado
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret, // Clave usada para firmar el token
      });

      // Se guarda la información del usuario en la request
      // para que otros guards o controladores puedan usarla
      (request as any).user = payload;

    } catch (error) {
      // Si el token es inválido o está expirado
      throw new UnauthorizedException();
    }

    // Si todo es correcto, permite el acceso al endpoint
    return true;
  }

  // Función auxiliar para obtener el token del header Authorization
  private extractTokenFromHeader(request: Request) {

    // Espera un formato: Authorization: Bearer <token>
    const [type, token] =
      request.headers.authorization?.split(' ') ?? [];

    // Solo devuelve el token si el tipo es Bearer
    return type === 'Bearer' ? token : undefined;
  }
}
