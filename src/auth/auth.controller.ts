import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards, Request } from "@nestjs/common";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { AuthService } from "./auth.service";
import { AuthGuard } from "./auth.guard";

@Controller("auth") // Prefijo: /api/v1/auth
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Endpoint para registrar nuevos usuarios
  @Post("register")
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  // Endpoint para iniciar sesión
  // Devuelve HTTP 200 en lugar de 201
  @HttpCode(HttpStatus.OK)
  @Post("login")
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // Endpoint protegido para obtener el perfil del usuario autenticado
  @Get('profile')
  @UseGuards(AuthGuard) // Verifica que el token JWT sea válido
  profile(@Request() req) {
    return req.user; // Información extraída del token
  }
}
