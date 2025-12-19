// Constantes relacionadas con JWT
export const jwtConstants = {
  // Clave secreta usada para firmar los tokens JWT
  // Solo para desarrollo, NO usar en producción
  secret: process.env.JWT_SECRET,
};
