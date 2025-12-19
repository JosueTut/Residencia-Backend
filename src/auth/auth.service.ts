import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { RegisterDto } from "./dto/register.dto";
import { JwtService } from "@nestjs/jwt";
import * as bcryptjs from "bcryptjs";
import { UsersService } from "src/users/users.service";
import { LoginDto } from "./dto/login.dto";
import { Role } from "./roles.enum";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService, // Acceso a usuarios
    private readonly jwtService: JwtService // Generación de JWT
  ) {}

  // Registro de usuarios
  async register({ password, email, name }: RegisterDto) {
    // Verifica si el correo ya está registrado
    const user = await this.usersService.findOneByEmail(email);
    if (user) {
      throw new BadRequestException("Email already exists");
    }
    // Encripta la contraseña antes de guardarla
    const hashedPassword = await bcryptjs.hash(password, 10);
    // Crea el usuario con rol por defecto
    await this.usersService.create({
      name,
      email,
      password: hashedPassword,
      rol: Role.PREFECTO, // Rol inicial del sistema
    });
    return { message: "User created successfully" };
  }

  // Inicio de sesión
  async login({ email, password }: LoginDto) {
    // Busca al usuario por correo
    const user = await this.usersService.findOneByEmail(email);
    if (!user) throw new UnauthorizedException("Invalid email");
    // Compara la contraseña ingresada con la almacenada
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException("Invalid password");

    // Información que se guardará dentro del token
    const payload = {
      sub: user.id,       // ID del usuario
      email: user.email,
      rol: user.rol,      // Rol para control de accesos
      name: user.name,    // Útil para mostrar en el frontend
    };

    // Retorna el token y los datos del usuario
    return {
      token: this.jwtService.sign(payload),
      user: payload,
    };
  }
}
