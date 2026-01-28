# Residencia - Backend (API)
Sistema para la supervisión de la asistencia del docente en el aula (TecNM Campus Cancún).

Este repositorio contiene el backend (API REST) desarrollado con NestJS. La API centraliza la lógica de negocio, la seguridad por roles y el acceso a datos, permitiendo que el frontend consuma endpoints para: pase de lista por fecha, guardado masivo de supervisión, consulta histórica, reportes y correcciones controladas.

---

## Tecnologías
- Node.js + NestJS
- TypeORM
- MySQL 8 (Docker)
- JWT (autenticación)
- Control de acceso por roles (guards)

---

## Requisitos previos
- Git
- Node.js (recomendado: 18+)
- Docker y Docker Compose

---

## 1) Clonar el repositorio
```bash
git clone https://github.com/JosueTut/Residencia-Backend.git
cd Residencia-Backend
```

## 2) Configurar variables de entorno
Este proyecto incluye un archivo .env.example. Crear un .env en la raíz y copiar el contenido.

Linux/macOS:

```bash
cp .env.example .env
```

Ejemplo de .env usado en desarrollo:

# ===============================
# CONFIGURACIÓN GENERAL
# ===============================
NODE_ENV=
PORT=


# ===============================
# JWT (AUTENTICACIÓN)
# ===============================
JWT_SECRET=
JWT_EXPIRES_IN=


# ===============================
# BASE DE DATOS (MYSQL)
# ===============================
DB_TYPE=
DB_HOST=
DB_PORT=
DB_USERNAME=
DB_PASSWORD=
DB_NAME=

# SOLO DESARROLLO
DB_SYNCHRONIZE=

Notas:

DB_PORT=3307 porque el contenedor MySQL expone el 3306 internamente pero se mapea a 3307 en tu máquina.

DB_SYNCHRONIZE=true es solo para desarrollo (TypeORM crea/actualiza tablas automáticamente).

## 3) Levantar la base de datos con Docker

Este repo incluye docker-compose.yml. Para levantar MySQL:

```bash
docker compose up -d
```

Verificar contenedor: 

```bash
docker ps
```

## 4) Instalar dependencias del backend

```bash
npm install 
```

## 5) Ejecutar el backend

```bash
npm run start:dev
```

El backend quedará disponible en:

http://localhost:3000

## Documentación de código

El proyecto está comentado por módulos/archivos para facilitar mantenimiento y mejora del sistema. Se recomienda revisar:

- entidades (entities)
- DTOs (validaciones)
- servicios (lógica de negocio)
- guards/decorators (roles y autorización)