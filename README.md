# Sistema de Gestión de Cámara de Gesell - UNIVO

## Descripción del proyecto

El presente proyecto consistió en el desarrollo de un sistema web para la gestión de la Cámara de Gesell de la Universidad de Oriente, UNIVO.

La finalidad principal del sistema es suplir la necesidad de la universidad de contar con una herramienta digital que permita administrar de manera más organizada, eficiente y segura el uso de la Cámara de Gesell. Actualmente, este tipo de espacios requieren una correcta planificación, control de reservas, administración de usuarios y seguimiento de solicitudes, por lo que el sistema busca facilitar dichos procesos mediante una plataforma web.

El sistema permite gestionar usuarios, cámaras, reservas y estados relacionados al uso de la Cámara de Gesell, brindando una solución práctica para docentes, administradores y practicantes que necesiten hacer uso de este recurso académico.

---

## Enlace del sistema desplegado

El proyecto se encuentra actualmente desplegado en Render y puede ser accedido desde el siguiente enlace:

https://camaragesellunivo.onrender.com

---

## Credenciales de acceso

Para ingresar al sistema se pueden utilizar las siguientes credenciales de prueba:

```txt
Usuario: admin@univo.edu.sv
Contraseña: 123456
````

---

## Objetivo del sistema

Desarrollar una plataforma web que permita administrar el uso de la Cámara de Gesell de la Universidad de Oriente, facilitando la gestión de reservas, usuarios y disponibilidad del espacio, con el propósito de mejorar la organización interna y reducir procesos manuales.

---

## Funcionalidades principales

El sistema cuenta con las siguientes funcionalidades:

- Inicio de sesión con autenticación.
    
- Gestión de usuarios.
    
- Control de roles dentro del sistema.
    
- Gestión de la Cámara de Gesell.
    
- Creación de reservas.
    
- Consulta de reservas realizadas.
    
- Administración de estados de reserva.
    
- Validación de disponibilidad.
    
- Interfaz web amigable para los usuarios.
    
- Conexión entre frontend, backend y base de datos.
    
- Sistema desplegado en la nube mediante Render.
    

---

## Tecnologías utilizadas

### Frontend

- React
    
- Vite
    
- JavaScript
    
- HTML
    
- CSS
	
- Tailwind

### Backend

- Node.js
    
- Express.js
    
- MySQL
    
- JWT para autenticación
    
- bcryptjs para encriptación de contraseñas
    
- dotenv para variables de entorno
    
- pnpm como gestor de paquetes
    

### Base de datos

- MySQL
    
- Script de base de datos incluido en el repositorio: `gesell.sql`
    

### Despliegue

- Render: Frontend y Backend
	
- Aiven: Base de datos

---

## Arquitectura general del proyecto

El proyecto está dividido en dos partes principales:

```txt
Camara-Gesell/
│
├── Backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── database/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── services/
│   │   └── server.js
│   │
│   ├── package.json
│   └── pnpm-lock.yaml
│
├── Frontend/
│   ├── public/
│   │
│   ├── src/
│   │   ├── assets/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── README.md
│   ├── eslint.config.js
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── pnpm-lock.yaml
│   └── postcss.config.js
│
├── gesell.sql
│
└──README_ENDPOINTS.md
```

---

## Instalación y ejecución local

Para ejecutar el proyecto de manera local, se deben seguir los siguientes pasos.

---

## Requisitos previos

Antes de ejecutar el proyecto, es necesario tener instalado:

- Node.js
    
- pnpm
    
- MySQL
    
- Git
    
- Un editor de código, por ejemplo Visual Studio Code
    

---

## 1. Clonar el repositorio

```bash
git clone https://github.com/brondo138/Camara-Gesell.git
```

Luego ingresar a la carpeta del proyecto:

```bash
cd Camara-Gesell
```

---

## 2. Importar la base de datos

Dentro del repositorio se encuentra el archivo:

```txt
gesell.sql
```

Este archivo contiene la estructura y datos necesarios para la base de datos del sistema.

Para importarlo en MySQL, se puede hacer desde MySQL Workbench o desde consola.

Ejemplo desde consola:

```bash
mysql -u root -p < gesell.sql
```

También se puede abrir MySQL Workbench, crear la base de datos correspondiente e importar el script `gesell.sql`.

---

## 3. Configuración del Backend

Ingresar a la carpeta del backend:

```bash
cd Backend
```

Instalar las dependencias:

```bash
pnpm install
```

Crear o configurar el archivo `.env` con las variables necesarias para la conexión a la base de datos y autenticación.

Ejemplo:

```env
PORT=3000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=gesell
DB_PORT=3306

JWT_SECRET=clave_secreta
JWT_EXPIRES_IN=1d

EMAIL_USER=CorreoDePrueba
EMAIL_PASS=ContrañaDeAplicacionDeCorreo

FRONTEND_URL=UrlDelFrontend
```

Ejecutar el backend en modo desarrollo:

```bash
pnpm run dev
```

Si todo está correctamente configurado, el backend debería ejecutarse en:

```txt
http://localhost:3000
```

---

## 4. Configuración del Frontend

Ingresar a la carpeta del frontend:

```bash
cd Frontend
```

Instalar las dependencias:

```bash
pnpm install
```

Ejecutar el frontend:

```bash
pnpm run dev
```

El frontend, al estar desarrollado con Vite, normalmente se ejecutará en:

```txt
http://localhost:5173
```

---

## Variables de entorno

El backend utiliza variables de entorno para manejar información sensible y configurable

Esto permite que el proyecto pueda ejecutarse tanto de manera local como en producción sin modificar directamente el código fuente.

---

## Base de datos

La base de datos del sistema está desarrollada en MySQL y se encuentra incluida en el repositorio mediante el archivo:

```txt
gesell.sql
```

---

## Despliegue en Render

El sistema se encuentra desplegado en Render, una plataforma en la nube que permite publicar aplicaciones web, APIs y servicios backend.

El frontend está disponible en:

```txt
https://camaragesellunivo.onrender.com
```

El uso de Render permite que el sistema pueda ser accedido desde cualquier navegador sin necesidad de instalarlo localmente.

---

## Uso general del sistema

1. Ingresar al enlace del sistema.
    
2. Iniciar sesión con las credenciales proporcionadas.
    
3. Acceder al panel principal.
    
4. Gestionar usuarios, cámaras o reservas según el rol asignado.
    
5. Registrar nuevas reservas.
    
6. Consultar el estado de las solicitudes realizadas.
    
7. Administrar la disponibilidad de la Cámara de Gesell.
    

---

## Roles del sistema

El sistema contempla diferentes tipos de usuarios, entre ellos:

- Administrador
    
- Docente
    
- Practicante
    

Cada rol puede tener permisos diferentes dentro del sistema, dependiendo de las acciones que debe realizar.

---

## Seguridad

El sistema implementa autenticación mediante JSON Web Token, JWT, lo cual permite proteger las rutas privadas del backend.

Además, las contraseñas de los usuarios son protegidas mediante encriptación con `bcryptjs`, evitando almacenar contraseñas en texto plano dentro de la base de datos.

---

## Documentación de endpoints

El proyecto incluye una guía de rutas de la API para facilitar el uso y prueba de los endpoints disponibles en el backend.

Esta guía fue creada como apoyo para que los integrantes del equipo pudieran consultar las rutas, métodos HTTP y datos necesarios para consumir correctamente la API durante el desarrollo del sistema.

___
## Comandos principales

### Backend

```bash
cd Backend
pnpm install
pnpm run dev
```

### Frontend

```bash
cd Frontend
pnpm install
pnpm run dev
```

---

## Posibles problemas al ejecutar localmente

### Error de conexión con la base de datos

Verificar que MySQL esté activo y que los datos del archivo `.env` sean correctos.

### Error de dependencias

Ejecutar nuevamente:

```bash
pnpm install
```

### Error de puerto ocupado

Verificar si el puerto `3000` o `5173` ya está siendo utilizado por otra aplicación.

### Error al iniciar sesión

Verificar que la base de datos haya sido importada correctamente y que el usuario exista en la tabla correspondiente.

---

## Estado actual del proyecto

El proyecto se encuentra funcional y desplegado en la nube mediante Render. Además, puede ser replicado de manera local utilizando el archivo de base de datos `gesell.sql` y ejecutando por separado el backend y el frontend.

---

## Autores

Proyecto desarrollado por estudiantes de la Universidad de Oriente, UNIVO, como parte de un proyecto académico orientado a brindar una solución tecnológica para la gestión de la Cámara de Gesell.

---

## Institución

Universidad de Oriente UNIVO  
San Miguel, El Salvador

---

## Licencia

Este proyecto fue desarrollado con fines académicos.
