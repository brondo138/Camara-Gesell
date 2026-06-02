# Backend - Sistema Cámara de Gesell

  

API REST desarrollada con **Node.js**, **Express** y **MySQL** para el sistema de gestión de la Cámara de Gesell.

---
## Tecnologías utilizadas

- Node.js

- Express

- MySQL

- mysql2

- dotenv

- cors

- bcryptjs

- jsonwebtoken

- nodemon
---
## Instalación del proyecto

Clonar el repositorio o descargar el proyecto.

Entrar a la carpeta del backend:

```bash

cd Backend

````

Instalar dependencias:

```bash

pnpm install

```

Ejecutar el servidor en modo desarrollo:

```bash

pnpm run dev

```

  

El servidor se ejecutará por defecto en:

```txt

http://localhost:3000

```

---
## Variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

```env

PORT=3000

  

DB_HOST=localhost

DB_USER=root

DB_PASSWORD=tu_password

DB_NAME=gesell

DB_PORT=3306

  

JWT_SECRET=tu_clave_secreta

JWT_EXPIRES_IN=1d

```

  

Ejemplo de `JWT_SECRET`:

```env

JWT_SECRET=camara_gesell_backend_clave_segura_2026

```

---
## Base de datos

La base de datos utilizada se llama:

```sql

gesell

```

Asegurarse de que MySQL esté corriendo y de haber ejecutado previamente el script SQL de creación de tablas.

---
# Rutas disponibles

La API utiliza el prefijo:

```txt

/api

```

Por ejemplo:

```txt

http://localhost:3000/api/usuarios

```

---

# Módulo de autenticación

## Iniciar sesión

Permite iniciar sesión con correo y contraseña.
### Endpoint

```txt

POST /api/auth/login

```

### URL completa

```txt

http://localhost:3000/api/auth/login

```

### Body JSON

```json

{

"correo": "alex@gmail.com",

"contrasena": "123456"

}

```

### Respuesta exitosa

```json

{

"success": true,

"message": "Inicio de sesión exitoso",

"data": {

"usuario": {

"id_usuario": 1,

"nombre": "Alex",

"apellido": "Lovos",

"correo": "alex@gesell.com",

"id_rol": 1,

"nombre_rol": "Administrador"

},

"token": "TOKEN_GENERADO"

}

}

```

### Respuestas de error comunes

Correo o contraseña incorrectos:

```json

{

"success": false,

"message": "Credenciales incorrectas"

}

```

Usuario inactivo:

```json

{

"success": false,

"message": "El usuario está inactivo"

}

```

Campos vacíos:

```json

{

"success": false,

"message": "El correo y la contraseña son obligatorios"

}

```

---

# Módulo de usuarios

Este módulo permite crear, listar, actualizar, cambiar contraseña y eliminar usuarios.

---

## Obtener todos los usuarios

### Endpoint

```txt

GET /api/usuarios

```

### URL completa

```txt

http://localhost:3000/api/usuarios

```

### Respuesta exitosa

```json

{

"success": true,

"message": "Usuarios obtenidos correctamente",

"data": [

{

"id_usuario": 1,

"nombre": "Alex",

"apellido": "Lovos",

"correo": "alex@gesell.com",

"activo": 1,

"fecha_creacion": "2026-05-19T00:00:00.000Z",

"id_rol": 1,

"nombre_rol": "Administrador"

}

]

}

```

---

## Obtener usuario por ID

### Endpoint

```txt

GET /api/usuarios/:id

```

### Ejemplo

```txt

GET http://localhost:3000/api/usuarios/1

```
  
### Respuesta exitosa

```json

{

"success": true,

"message": "Usuario obtenido correctamente",

"data": {

"id_usuario": 1,

"nombre": "Alex",

"apellido": "Lovos",

"correo": "alex@gesell.com",

"activo": 1,

"fecha_creacion": "2026-05-19T00:00:00.000Z",

"id_rol": 1,

"nombre_rol": "Administrador"

}

}

```

### Si el usuario no existe

```json

{

"success": false,

"message": "Usuario no encontrado"

}

```

---

## Crear usuario

### Endpoint

```txt

POST /api/usuarios

```

### URL completa

```txt

http://localhost:3000/api/usuarios

```

### Body JSON

```json

{

"nombre": "Carlos",

"apellido": "Ramírez",

"correo": "carlos@gesell.com",

"contrasena": "123456",

"id_rol": 2

}

```

### Roles disponibles

  

| id_rol | Rol           |
| ------ | ------------- |
| 1      | Administrador |
| 2      | Docente       |
| 3      | Practicante   |

### Respuesta exitosa

```json

{

"success": true,

"message": "Usuario creado correctamente",

"data": {

"id_usuario": 2,

"nombre": "Carlos",

"apellido": "Ramírez",

"correo": "carlos@gesell.com",

"activo": 1,

"fecha_creacion": "2026-05-19T00:00:00.000Z",

"id_rol": 2,

"nombre_rol": "Docente"

}

}

```

### Notas importantes

La contraseña se guarda encriptada automáticamente con `bcryptjs`.
No se debe enviar la contraseña encriptada desde el frontend. El frontend envía la contraseña normal y el backend se encarga de encriptarla.

---

## Actualizar usuario

### Endpoint

```txt

PUT /api/usuarios/:id

```
  
### Ejemplo

```txt

PUT http://localhost:3000/api/usuarios/2

```

### Body JSON

```json

{

"nombre": "Carlos",

"apellido": "Ramírez",

"correo": "carlos.ramirez@gesell.com",

"id_rol": 2,

"activo": true

}

```

### Respuesta exitosa

```json

{

"success": true,

"message": "Usuario actualizado correctamente",

"data": {

"id_usuario": 2,

"nombre": "Carlos",

"apellido": "Ramírez",

"correo": "carlos.ramirez@gesell.com",

"activo": 1,

"fecha_creacion": "2026-05-19T00:00:00.000Z",

"id_rol": 2,

"nombre_rol": "Docente"

}

}

```
  
### Campos obligatorios

Para actualizar un usuario se deben enviar todos estos campos:

```json

{

"nombre": "Carlos",

"apellido": "Ramírez",

"correo": "carlos.ramirez@gesell.com",

"id_rol": 2,

"activo": true

}

```

---

## Cambiar contraseña de usuario

### Endpoint

```txt

PATCH /api/usuarios/:id/contrasena

```

### Ejemplo

```txt

PATCH http://localhost:3000/api/usuarios/2/contrasena

```

### Body JSON

```json

{

"nuevaContrasena": "654321"

}

```

### Respuesta exitosa

```json

{

"success": true,

"message": "Contraseña actualizada correctamente",

"data": {

"id_usuario": 2,

"mensaje": "Contraseña actualizada correctamente"

}

}

```

### Nota

La nueva contraseña también se encripta automáticamente antes de guardarse en la base de datos.

---

## Eliminar usuario

### Endpoint

```txt

DELETE /api/usuarios/:id

```

### Ejemplo

```txt

DELETE http://localhost:3000/api/usuarios/2

```

### Respuesta exitosa

```json

{

"success": true,

"message": "Usuario eliminado correctamente",

"data": {

"id_usuario": 2,

"mensaje": "Usuario eliminado correctamente"

}

}

```

### Nota importante

  

Actualmente este endpoint elimina el usuario de la base de datos.

  

Si el usuario tiene reservas, observaciones u otros registros relacionados, MySQL puede impedir la eliminación por las llaves foráneas.

  

Más adelante se cambiara este endpoint para hacer una desactivación lógica:

---

# Módulo de cámaras de Gesell

Este módulo permite crear, listar, actualizar, activar, desactivar y eliminar cámaras de Gesell registradas en el sistema.

---

## Obtener todas las cámaras

### Endpoint

```txt
GET /api/camaras
```

### URL completa

```txt
http://localhost:3000/api/camaras
```

### Respuesta exitosa

```json
{
  "success": true,
  "message": "Cámaras de Gesell obtenidas correctamente",
  "data": [
    {
      "id_camara": 1,
      "nombre": "Cámara Gesell 1",
      "ubicacion": "Edificio de Psicología, segundo nivel",
      "descripcion": "Cámara destinada para prácticas supervisadas",
      "activa": 1
    }
  ]
}
```

---

## Obtener cámara por ID

### Endpoint

```txt
GET /api/camaras/:id
```

### Ejemplo

```txt
GET http://localhost:3000/api/camaras/1
```

### Respuesta exitosa

```json
{
  "success": true,
  "message": "Cámara de Gesell obtenida correctamente",
  "data": {
    "id_camara": 1,
    "nombre": "Cámara Gesell 1",
    "ubicacion": "Edificio de Psicología, segundo nivel",
    "descripcion": "Cámara destinada para prácticas supervisadas",
    "activa": 1
  }
}
```

### Si la cámara no existe

```json
{
  "success": false,
  "message": "La cámara de Gesell no existe"
}
```

---

## Crear cámara de Gesell

### Endpoint

```txt
POST /api/camaras
```

### URL completa

```txt
http://localhost:3000/api/camaras
```

### Body JSON

```json
{
  "nombre": "Cámara Gesell 1",
  "ubicacion": "Edificio de Psicología, segundo nivel",
  "descripcion": "Cámara destinada para prácticas supervisadas",
  "activa": true
}
```

### Respuesta exitosa

```json
{
  "success": true,
  "message": "Cámara de Gesell creada correctamente",
  "data": {
    "id_camara": 1,
    "nombre": "Cámara Gesell 1",
    "ubicacion": "Edificio de Psicología, segundo nivel",
    "descripcion": "Cámara destinada para prácticas supervisadas",
    "activa": 1
  }
}
```

### Campos obligatorios

Para crear una cámara, el único campo obligatorio es:

```json
{
  "nombre": "Cámara Gesell 1"
}
```

Los campos `ubicacion`, `descripcion` y `activa` son opcionales.

Si no se envía el campo `activa`, por defecto se guardará como `true`.

---

## Actualizar cámara de Gesell

### Endpoint

```txt
PUT /api/camaras/:id
```

### Ejemplo

```txt
PUT http://localhost:3000/api/camaras/1
```

### Body JSON

```json
{
  "nombre": "Cámara Gesell Principal",
  "ubicacion": "Edificio de Psicología, aula 204",
  "descripcion": "Cámara principal para entrevistas y evaluaciones",
  "activa": true
}
```

### Respuesta exitosa

```json
{
  "success": true,
  "message": "Cámara de Gesell actualizada correctamente",
  "data": {
    "id_camara": 1,
    "nombre": "Cámara Gesell Principal",
    "ubicacion": "Edificio de Psicología, aula 204",
    "descripcion": "Cámara principal para entrevistas y evaluaciones",
    "activa": 1
  }
}
```

### Campos obligatorios

Para actualizar una cámara se debe enviar al menos el campo `nombre`.

```json
{
  "nombre": "Cámara Gesell Principal",
  "ubicacion": "Edificio de Psicología, aula 204",
  "descripcion": "Cámara principal para entrevistas y evaluaciones",
  "activa": true
}
```

---

## Cambiar estado de cámara de Gesell

Este endpoint permite activar o desactivar una cámara sin actualizar todos sus datos.

### Endpoint

```txt
PATCH /api/camaras/:id/estado
```

### Ejemplo

```txt
PATCH http://localhost:3000/api/camaras/1/estado
```

### Body JSON para desactivar

```json
{
  "activa": false
}
```

### Body JSON para activar

```json
{
  "activa": true
}
```

### Respuesta exitosa

```json
{
  "success": true,
  "message": "Estado de la cámara actualizado correctamente",
  "data": {
    "id_camara": 1,
    "nombre": "Cámara Gesell Principal",
    "ubicacion": "Edificio de Psicología, aula 204",
    "descripcion": "Cámara principal para entrevistas y evaluaciones",
    "activa": 0
  }
}
```

### Valores permitidos

El backend acepta los siguientes valores para el campo `activa`:

```json
{
  "activa": true
}
```

```json
{
  "activa": false
}
```

También acepta valores equivalentes como:

```json
{
  "activa": 1
}
```

```json
{
  "activa": 0
}
```

```json
{
  "activa": "true"
}
```

```json
{
  "activa": "false"
}
```

### Errores comunes

Si no se envía el campo `activa`:

```json
{
  "success": false,
  "message": "El estado de la cámara es obligatorio"
}
```

Si la cámara no existe:

```json
{
  "success": false,
  "message": "La cámara de Gesell no existe"
}
```

---

## Eliminar cámara de Gesell

### Endpoint

```txt
DELETE /api/camaras/:id
```

### Ejemplo

```txt
DELETE http://localhost:3000/api/camaras/1
```

### Respuesta exitosa

```json
{
  "success": true,
  "message": "Cámara de Gesell eliminada correctamente"
}
```

### Nota importante

Actualmente este endpoint elimina la cámara de Gesell de la base de datos.

Si la cámara tiene reservas relacionadas, MySQL puede impedir la eliminación por las llaves foráneas.

---

# Ejemplos de consumo desde frontend con fetch para cámaras de Gesell

## Obtener cámaras de Gesell

```js
const obtenerCamaras = async () => {
  const respuesta = await fetch('http://localhost:3000/api/camaras');

  const data = await respuesta.json();

  console.log(data);
};
```

---

## Obtener cámara por ID

```js
const obtenerCamaraPorId = async () => {
  const respuesta = await fetch('http://localhost:3000/api/camaras/1');

  const data = await respuesta.json();

  console.log(data);
};
```

---

## Crear cámara de Gesell

```js
const crearCamara = async () => {
  const respuesta = await fetch('http://localhost:3000/api/camaras', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      nombre: 'Cámara Gesell 1',
      ubicacion: 'Edificio de Psicología, segundo nivel',
      descripcion: 'Cámara destinada para prácticas supervisadas',
      activa: true
    })
  });

  const data = await respuesta.json();

  console.log(data);
};
```

---

## Actualizar cámara de Gesell

```js
const actualizarCamara = async () => {
  const respuesta = await fetch('http://localhost:3000/api/camaras/1', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      nombre: 'Cámara Gesell Principal',
      ubicacion: 'Edificio de Psicología, aula 204',
      descripcion: 'Cámara principal para entrevistas y evaluaciones',
      activa: true
    })
  });

  const data = await respuesta.json();

  console.log(data);
};
```

---

## Cambiar estado de cámara de Gesell

```js
const cambiarEstadoCamara = async (idCamara, nuevoEstado) => {
  const respuesta = await fetch(`http://localhost:3000/api/camaras/${idCamara}/estado`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      activa: nuevoEstado
    })
  });

  const data = await respuesta.json();

  console.log(data);
};
```

### Ejemplo para activar

```js
cambiarEstadoCamara(1, true);
```

### Ejemplo para desactivar

```js
cambiarEstadoCamara(1, false);
```

### Ejemplo para alternar el estado actual

```js
const alternarEstadoCamara = async (camara) => {
  const respuesta = await fetch(`http://localhost:3000/api/camaras/${camara.id_camara}/estado`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      activa: !Boolean(camara.activa)
    })
  });

  const data = await respuesta.json();

  console.log(data);
};
```

---

## Eliminar cámara de Gesell

```js
const eliminarCamara = async () => {
  const respuesta = await fetch('http://localhost:3000/api/camaras/1', {
    method: 'DELETE'
  });

  const data = await respuesta.json();

  console.log(data);
};
```

# Módulo de grupos

Este módulo permite gestionar los grupos académicos del sistema.  
Un grupo puede tener varios practicantes y varios docentes asignados, pero debe tener obligatoriamente un docente responsable.

Los usuarios pueden existir en el sistema sin pertenecer a ningún grupo.  
Después de crear un usuario, el administrador puede asignarlo a un grupo.

---

## Reglas principales del módulo

- Un grupo debe tener un docente responsable obligatorio.
- El docente responsable debe tener rol `Docente`.
- Un grupo puede tener varios docentes y varios practicantes.
- Los usuarios con rol `Administrador` no pueden ser asignados a grupos.
- Un practicante solo puede asignarse como `Practicante`.
- Un docente solo puede asignarse como `Docente`.
- Al crear un grupo, el docente responsable se agrega automáticamente como miembro del grupo.
- No se puede quitar del grupo al docente responsable.

---

## Obtener todos los grupos

### Endpoint

```txt
GET /api/grupos
````

### URL completa

```txt
http://localhost:3000/api/grupos
```

### Respuesta exitosa

```json
{
  "success": true,
  "data": [
    {
      "id_grupo": 1,
      "nombre": "Grupo de práctica 01",
      "descripcion": "Grupo para prácticas supervisadas",
      "id_docente_responsable": 2,
      "docente_responsable": "Carlos Ramírez",
      "activo": 1,
      "fecha_creacion": "2026-06-02T15:00:00.000Z"
    }
  ]
}
```

---

## Obtener grupo por ID

### Endpoint

```txt
GET /api/grupos/:id
```

### Ejemplo

```txt
GET http://localhost:3000/api/grupos/1
```

### Respuesta exitosa

```json
{
  "success": true,
  "data": {
    "id_grupo": 1,
    "nombre": "Grupo de práctica 01",
    "descripcion": "Grupo para prácticas supervisadas",
    "id_docente_responsable": 2,
    "docente_responsable": "Carlos Ramírez",
    "activo": 1,
    "fecha_creacion": "2026-06-02T15:00:00.000Z"
  }
}
```

### Si el grupo no existe

```json
{
  "success": false,
  "message": "Grupo no encontrado"
}
```

---

## Crear grupo

### Endpoint

```txt
POST /api/grupos
```

### URL completa

```txt
http://localhost:3000/api/grupos
```

### Body JSON

```json
{
  "nombre": "Grupo de práctica 01",
  "descripcion": "Grupo para prácticas supervisadas",
  "id_docente_responsable": 2
}
```

### Respuesta exitosa

```json
{
  "success": true,
  "message": "Grupo creado correctamente",
  "data": {
    "id_grupo": 1,
    "nombre": "Grupo de práctica 01",
    "descripcion": "Grupo para prácticas supervisadas",
    "id_docente_responsable": 2
  }
}
```

### Campos obligatorios

Para crear un grupo se deben enviar los siguientes campos:

```json
{
  "nombre": "Grupo de práctica 01",
  "id_docente_responsable": 2
}
```

El campo `descripcion` es opcional.

### Validaciones

El backend valida que:

- El nombre del grupo sea obligatorio.
    
- El docente responsable sea obligatorio.
    
- El usuario asignado como docente responsable exista.
    
- El usuario asignado como docente responsable tenga rol `Docente`.
    

### Errores comunes

Si no se envía el nombre o el docente responsable:

```json
{
  "success": false,
  "message": "El nombre y el docente responsable son obligatorios"
}
```

Si el docente responsable no existe:

```json
{
  "success": false,
  "message": "El docente responsable no existe"
}
```

Si el usuario no tiene rol `Docente`:

```json
{
  "success": false,
  "message": "El usuario asignado como responsable debe tener rol Docente"
}
```

---

## Actualizar grupo

### Endpoint

```txt
PUT /api/grupos/:id
```

### Ejemplo

```txt
PUT http://localhost:3000/api/grupos/1
```

### Body JSON

```json
{
  "nombre": "Grupo de práctica actualizado",
  "descripcion": "Grupo actualizado desde la API",
  "id_docente_responsable": 2,
  "activo": true
}
```

### Respuesta exitosa

```json
{
  "success": true,
  "message": "Grupo actualizado correctamente",
  "data": {
    "id_grupo": 1,
    "nombre": "Grupo de práctica actualizado",
    "descripcion": "Grupo actualizado desde la API",
    "id_docente_responsable": 2,
    "docente_responsable": "Carlos Ramírez",
    "activo": 1,
    "fecha_creacion": "2026-06-02T15:00:00.000Z"
  }
}
```

### Campos obligatorios

Para actualizar un grupo se deben enviar:

```json
{
  "nombre": "Grupo de práctica actualizado",
  "id_docente_responsable": 2,
  "activo": true
}
```

El campo `descripcion` puede enviarse vacío o como `null`.

---

## Eliminar grupo

### Endpoint

```txt
DELETE /api/grupos/:id
```

### Ejemplo

```txt
DELETE http://localhost:3000/api/grupos/1
```

### Respuesta exitosa

```json
{
  "success": true,
  "message": "Grupo eliminado correctamente"
}
```


---

# Asignación de usuarios a grupos

Además del CRUD principal, este módulo permite agregar o quitar docentes y practicantes dentro de un grupo.

---

## Obtener usuarios de un grupo

### Endpoint

```txt
GET /api/grupos/:id/usuarios
```

### Ejemplo

```txt
GET http://localhost:3000/api/grupos/1/usuarios
```

### Respuesta exitosa

```json
{
  "success": true,
  "data": [
    {
      "id_grupo": 1,
      "id_usuario": 2,
      "nombre": "Carlos",
      "apellido": "Ramírez",
      "correo": "carlos@gesell.com",
      "rol_sistema": "Docente",
      "rol_en_grupo": "Docente",
      "fecha_asignacion": "2026-06-02T15:00:00.000Z"
    },
    {
      "id_grupo": 1,
      "id_usuario": 3,
      "nombre": "Ana",
      "apellido": "Martínez",
      "correo": "ana@gesell.com",
      "rol_sistema": "Practicante",
      "rol_en_grupo": "Practicante",
      "fecha_asignacion": "2026-06-02T15:05:00.000Z"
    }
  ]
}
```

---

## Asignar usuario a un grupo

### Endpoint

```txt
POST /api/grupos/:id/usuarios
```

### Ejemplo

```txt
POST http://localhost:3000/api/grupos/1/usuarios
```

### Body JSON para asignar practicante

```json
{
  "id_usuario": 3,
  "rol_en_grupo": "Practicante"
}
```

### Body JSON para asignar docente

```json
{
  "id_usuario": 4,
  "rol_en_grupo": "Docente"
}
```

### Respuesta exitosa

```json
{
  "success": true,
  "message": "Usuario asignado al grupo correctamente"
}
```

### Validaciones

El backend valida que:

- El grupo exista.
    
- El usuario exista.
    
- El usuario no pertenezca ya al grupo.
    
- El rol dentro del grupo sea `Docente` o `Practicante`.
    
- No se puedan asignar usuarios con rol `Administrador`.
    
- Si se asigna como `Docente`, el usuario debe tener rol de sistema `Docente`.
    
- Si se asigna como `Practicante`, el usuario debe tener rol de sistema `Practicante`.
    

### Errores comunes

Si el usuario ya pertenece al grupo:

```json
{
  "success": false,
  "message": "El usuario ya pertenece a este grupo"
}
```

Si se intenta agregar un administrador:

```json
{
  "success": false,
  "message": "No se pueden asignar administradores a un grupo"
}
```

Si el rol del sistema no coincide con el rol del grupo:

```json
{
  "success": false,
  "message": "El usuario tiene rol Docente, no puede asignarse como Practicante"
}
```

---

## Quitar usuario de un grupo

### Endpoint

```txt
DELETE /api/grupos/:id/usuarios/:idUsuario
```

### Ejemplo

```txt
DELETE http://localhost:3000/api/grupos/1/usuarios/3
```

### Respuesta exitosa

```json
{
  "success": true,
  "message": "Usuario removido del grupo correctamente"
}
```

### Validaciones

El backend valida que:

- El grupo exista.
    
- El usuario pertenezca al grupo.
    
- No se pueda quitar al docente responsable del grupo.
    

### Error si se intenta quitar al docente responsable

```json
{
  "success": false,
  "message": "No se puede quitar al docente responsable del grupo"
}
```

### Error si el usuario no pertenece al grupo

```json
{
  "success": false,
  "message": "El usuario no pertenece a este grupo"
}
```

---

# Ejemplos de consumo desde frontend con fetch para grupos

## Obtener grupos

```js
const obtenerGrupos = async () => {
  const respuesta = await fetch('http://localhost:3000/api/grupos');

  const data = await respuesta.json();

  console.log(data);
};
```

---

## Obtener grupo por ID

```js
const obtenerGrupoPorId = async (idGrupo) => {
  const respuesta = await fetch(`http://localhost:3000/api/grupos/${idGrupo}`);

  const data = await respuesta.json();

  console.log(data);
};
```

---

## Crear grupo

```js
const crearGrupo = async () => {
  const respuesta = await fetch('http://localhost:3000/api/grupos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      nombre: 'Grupo de práctica 01',
      descripcion: 'Grupo para prácticas supervisadas',
      id_docente_responsable: 2
    })
  });

  const data = await respuesta.json();

  console.log(data);
};
```

---

## Actualizar grupo

```js
const actualizarGrupo = async () => {
  const respuesta = await fetch('http://localhost:3000/api/grupos/1', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      nombre: 'Grupo de práctica actualizado',
      descripcion: 'Grupo actualizado desde la API',
      id_docente_responsable: 2,
      activo: true
    })
  });

  const data = await respuesta.json();

  console.log(data);
};
```

---

## Eliminar grupo

```js
const eliminarGrupo = async () => {
  const respuesta = await fetch('http://localhost:3000/api/grupos/1', {
    method: 'DELETE'
  });

  const data = await respuesta.json();

  console.log(data);
};
```

---

## Obtener usuarios de un grupo

```js
const obtenerUsuariosGrupo = async (idGrupo) => {
  const respuesta = await fetch(`http://localhost:3000/api/grupos/${idGrupo}/usuarios`);

  const data = await respuesta.json();

  console.log(data);
};
```

---

## Asignar usuario a un grupo

```js
const asignarUsuarioGrupo = async () => {
  const respuesta = await fetch('http://localhost:3000/api/grupos/1/usuarios', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id_usuario: 3,
      rol_en_grupo: 'Practicante'
    })
  });

  const data = await respuesta.json();

  console.log(data);
};
```

---

## Quitar usuario de un grupo

```js
const quitarUsuarioGrupo = async () => {
  const respuesta = await fetch('http://localhost:3000/api/grupos/1/usuarios/3', {
    method: 'DELETE'
  });

  const data = await respuesta.json();

  console.log(data);
};
```

# Pruebas en Postman

Para probar la API en Postman:

1. Seleccionar el método HTTP correspondiente.

2. Escribir la URL completa.

3. Ir a la pestaña `Body`.

4. Seleccionar `raw`.

5. Seleccionar formato `JSON`.

6. Enviar el body correspondiente.

7. Presionar `Send`.

Ejemplo para crear usuario:

```txt

POST http://localhost:3000/api/usuarios

```

Body:

```json

{

"nombre": "Usuario",

"apellido": "Prueba",

"correo": "usuario@gmail.com",

"contrasena": "123456",

"id_rol": 3

}

```

---

# Ejemplos de consumo desde frontend con fetch

## Login

```js

const login = async () => {

const respuesta = await fetch('http://localhost:3000/api/auth/login', {

method: 'POST',

headers: {

'Content-Type': 'application/json'

},

body: JSON.stringify({

correo: 'alex@gesell.com',

contrasena: '123456'

})

});

  

const data = await respuesta.json();

  

if (data.success) {

localStorage.setItem('token', data.data.token);

localStorage.setItem('usuario', JSON.stringify(data.data.usuario));

}

  

console.log(data);

};

```


---

## Obtener usuarios

```js

const obtenerUsuarios = async () => {

const respuesta = await fetch('http://localhost:3000/api/usuarios');

  

const data = await respuesta.json();

  

console.log(data);

};

```

---

## Crear usuario

```js

const crearUsuario = async () => {

const respuesta = await fetch('http://localhost:3000/api/usuarios', {

method: 'POST',

headers: {

'Content-Type': 'application/json'

},

body: JSON.stringify({

nombre: 'Ana',

apellido: 'Martínez',

correo: 'ana@gesell.com',

contrasena: '123456',

id_rol: 3

})

});

  

const data = await respuesta.json();

  

console.log(data);

};

```

---

## Actualizar usuario

```js

const actualizarUsuario = async () => {

const respuesta = await fetch('http://localhost:3000/api/usuarios/1', {

method: 'PUT',

headers: {

'Content-Type': 'application/json'

},

body: JSON.stringify({

nombre: 'Alex',

apellido: 'Lovos',

correo: 'alex@gesell.com',

id_rol: 1,

activo: true

})

});

  

const data = await respuesta.json();

  

console.log(data);

};

```

---

## Cambiar contraseña

```js

const cambiarContrasena = async () => {

const respuesta = await fetch('http://localhost:3000/api/usuarios/1/contrasena', {

method: 'PATCH',

headers: {

'Content-Type': 'application/json'

},

body: JSON.stringify({

nuevaContrasena: '654321'

})

});

  

const data = await respuesta.json();

  

console.log(data);

};

```

---

## Eliminar usuario

```js

const eliminarUsuario = async () => {

const respuesta = await fetch('http://localhost:3000/api/usuarios/1', {

method: 'DELETE'

});

  

const data = await respuesta.json();

  

console.log(data);

};

```

# Notas para el equipo frontend

* Todas las peticiones que envían datos deben usar `Content-Type: application/json`.

* El login retorna un `token`.

* El token se puede guardar temporalmente en `localStorage`.
