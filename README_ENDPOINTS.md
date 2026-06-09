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

# Módulo de reservas

Este módulo permite crear, listar, consultar, cambiar estado y eliminar reservas de cámaras de Gesell.

Las reservas están relacionadas con una cámara, un usuario solicitante y un grupo.
Toda reserva nueva se crea inicialmente con estado `Pendiente`.

---

## Reglas principales del módulo

* Toda reserva nueva se guarda como `Pendiente`.
* Una reserva debe estar asociada a un grupo.
* El usuario solicitante debe pertenecer al grupo de la reserva.
* Si el usuario pertenece solamente a un grupo, el backend puede asignar automáticamente el `id_grupo`.
* Si el usuario pertenece a más de un grupo, el frontend debe enviar el campo `id_grupo`.
* Un administrador no puede crear reservas como solicitante de grupo.
* Una cámara no puede reservarse si ya tiene una reserva `Pendiente`, `Aprobada` o `Finalizada` en la misma fecha y en un horario que se cruce.
* Las reservas con estado `Rechazada` o `Cancelada` no bloquean horarios.
* Al aprobar una reserva, el sistema crea automáticamente una sesión si todavía no existe.
* No se puede modificar el estado de una reserva que ya está `Finalizada` o `Cancelada`.

---

## Estados disponibles

```txt
Pendiente
Aprobada
Rechazada
Cancelada
Finalizada
```

---

## Obtener reservas

Este endpoint permite obtener reservas según el rol del usuario.

Si el usuario tiene rol de administrador (`id_rol = 1`), se obtienen todas las reservas.
Si el usuario no es administrador, se obtienen únicamente las reservas creadas por ese usuario.

### Endpoint

```txt
GET /api/reservas
```

### URL completa

```txt
http://localhost:3000/api/reservas
```

### Ejemplo para administrador

```txt
GET http://localhost:3000/api/reservas?id_usuario=1&id_rol=1
```

### Ejemplo para docente o practicante

```txt
GET http://localhost:3000/api/reservas?id_usuario=2&id_rol=2
```

### Respuesta exitosa

```json
{
  "success": true,
  "message": "Reservas obtenidas correctamente",
  "data": [
    {
      "id_reserva": 1,
      "fecha": "2026-05-30T06:00:00.000Z",
      "hora_inicio": "08:00:00",
      "hora_fin": "10:00:00",
      "motivo": "Práctica supervisada",
      "estado": "Pendiente",
      "fecha_creacion": "2026-05-26T20:00:00.000Z",
      "id_camara": 1,
      "camara": "Cámara Gesell 1",
      "id_usuario_solicitante": 2,
      "nombre_solicitante": "Carlos",
      "apellido_solicitante": "Ramírez",
      "id_rol": 2,
      "rol_solicitante": "Docente",
      "id_grupo": 1,
      "grupo": "Grupo de práctica 01"
    }
  ]
}
```

---

## Obtener reserva por ID

### Endpoint

```txt
GET /api/reservas/:id
```

### Ejemplo

```txt
GET http://localhost:3000/api/reservas/1
```

### Respuesta exitosa

```json
{
  "success": true,
  "message": "Reserva obtenida correctamente",
  "data": {
    "id_reserva": 1,
    "fecha": "2026-05-30T06:00:00.000Z",
    "hora_inicio": "08:00:00",
    "hora_fin": "10:00:00",
    "motivo": "Práctica supervisada",
    "estado": "Pendiente",
    "fecha_creacion": "2026-05-26T20:00:00.000Z",
    "id_camara": 1,
    "camara": "Cámara Gesell 1",
    "id_usuario_solicitante": 2,
    "nombre_solicitante": "Carlos",
    "apellido_solicitante": "Ramírez",
    "id_rol": 2,
    "rol_solicitante": "Docente",
    "id_grupo": 1,
    "grupo": "Grupo de práctica 01"
  }
}
```

### Si la reserva no existe

```json
{
  "success": false,
  "message": "La reserva no existe"
}
```

---

## Crear reserva

Permite crear una nueva reserva. La reserva se guarda inicialmente con estado `Pendiente`.

El campo `id_grupo` puede enviarse en el body.
Si no se envía, el backend intenta obtener automáticamente el grupo del usuario solicitante.

### Endpoint

```txt
POST /api/reservas
```

### URL completa

```txt
http://localhost:3000/api/reservas
```

### Body JSON sin `id_grupo`

Este body funciona si el usuario solicitante pertenece únicamente a un grupo.

```json
{
  "id_camara": 1,
  "id_usuario_solicitante": 2,
  "fecha": "2026-05-30",
  "hora_inicio": "08:00",
  "hora_fin": "10:00",
  "motivo": "Práctica supervisada"
}
```

### Body JSON con `id_grupo`

Este body debe usarse si el usuario pertenece a más de un grupo.

```json
{
  "id_camara": 1,
  "id_usuario_solicitante": 2,
  "id_grupo": 1,
  "fecha": "2026-05-30",
  "hora_inicio": "08:00",
  "hora_fin": "10:00",
  "motivo": "Práctica supervisada"
}
```

### Respuesta exitosa

```json
{
  "success": true,
  "message": "Reserva creada correctamente",
  "data": {
    "id_reserva": 1,
    "fecha": "2026-05-30T06:00:00.000Z",
    "hora_inicio": "08:00:00",
    "hora_fin": "10:00:00",
    "motivo": "Práctica supervisada",
    "estado": "Pendiente",
    "fecha_creacion": "2026-05-26T20:00:00.000Z",
    "id_camara": 1,
    "camara": "Cámara Gesell 1",
    "id_usuario_solicitante": 2,
    "nombre_solicitante": "Carlos",
    "apellido_solicitante": "Ramírez",
    "id_rol": 2,
    "rol_solicitante": "Docente",
    "id_grupo": 1,
    "grupo": "Grupo de práctica 01"
  }
}
```

### Campos obligatorios

```json
{
  "id_camara": 1,
  "id_usuario_solicitante": 2,
  "fecha": "2026-05-30",
  "hora_inicio": "08:00",
  "hora_fin": "10:00",
  "motivo": "Práctica supervisada"
}
```

El campo `id_grupo` es obligatorio únicamente cuando el usuario pertenece a más de un grupo.

### Validaciones al crear reserva

El backend valida que:

* `id_camara` sea obligatorio.
* `id_usuario_solicitante` sea obligatorio.
* `fecha` sea obligatoria.
* `hora_inicio` sea obligatoria.
* `hora_fin` sea obligatoria.
* `motivo` sea obligatorio.
* La hora de inicio sea anterior a la hora de fin.
* El usuario solicitante exista.
* El usuario solicitante no sea administrador.
* El usuario solicitante pertenezca al grupo indicado.
* Si no se envía `id_grupo`, el usuario debe pertenecer únicamente a un grupo.
* No exista conflicto de horario en la misma cámara y fecha.

### Errores comunes

Si faltan campos obligatorios:

```json
{
  "success": false,
  "message": "id_camara, id_usuario_solicitante, fecha, hora_inicio y hora_fin son obligatorios"
}
```

Si no se envía motivo:

```json
{
  "success": false,
  "message": "El motivo de la reserva es obligatorio"
}
```

Si la hora de inicio es mayor o igual que la hora de fin:

```json
{
  "success": false,
  "message": "La hora de inicio debe ser anterior a la hora de fin"
}
```

Si el usuario solicitante no existe:

```json
{
  "success": false,
  "message": "El usuario solicitante no existe"
}
```

Si el usuario solicitante es administrador:

```json
{
  "success": false,
  "message": "Un administrador no puede crear reservas como solicitante de grupo"
}
```

Si el usuario no pertenece a ningún grupo:

```json
{
  "success": false,
  "message": "El usuario solicitante no pertenece a ningún grupo"
}
```

Si el usuario pertenece a más de un grupo y no se envía `id_grupo`:

```json
{
  "success": false,
  "message": "El usuario pertenece a más de un grupo. Debe enviar id_grupo en la reserva"
}
```

Si el usuario no pertenece al grupo indicado:

```json
{
  "success": false,
  "message": "El usuario solicitante no pertenece al grupo indicado"
}
```

Si existe conflicto de horario:

```json
{
  "success": false,
  "message": "La cámara ya tiene una reserva en ese horario"
}
```

---

## Cambiar estado de reserva

Permite cambiar el estado de una reserva.

Cuando una reserva se cambia a estado `Aprobada`, el sistema crea automáticamente una sesión relacionada con esa reserva, siempre y cuando todavía no exista una sesión creada.

### Endpoint

```txt
PATCH /api/reservas/:id/estado
```

### Ejemplo

```txt
PATCH http://localhost:3000/api/reservas/1/estado
```

### Body JSON

```json
{
  "estado": "Aprobada"
}
```

### Estados permitidos

```txt
Pendiente
Aprobada
Rechazada
Cancelada
Finalizada
```

---

## Aprobar reserva

### Body JSON

```json
{
  "estado": "Aprobada"
}
```

### Respuesta exitosa

```json
{
  "success": true,
  "message": "Estado de la reserva actualizado correctamente",
  "data": {
    "id_reserva": 1,
    "fecha": "2026-05-30T06:00:00.000Z",
    "hora_inicio": "08:00:00",
    "hora_fin": "10:00:00",
    "motivo": "Práctica supervisada",
    "estado": "Aprobada",
    "fecha_creacion": "2026-05-26T20:00:00.000Z",
    "id_camara": 1,
    "camara": "Cámara Gesell 1",
    "id_usuario_solicitante": 2,
    "nombre_solicitante": "Carlos",
    "apellido_solicitante": "Ramírez",
    "id_rol": 2,
    "rol_solicitante": "Docente",
    "id_grupo": 1,
    "grupo": "Grupo de práctica 01"
  }
}
```

### Nota

Al aprobar una reserva, se crea automáticamente una sesión con estos datos:

```json
{
  "id_reserva": 1,
  "titulo": "Práctica supervisada",
  "descripcion": null,
  "tipo_sesion": "Entrevista",
  "fecha_realizacion": "2026-05-30"
}
```

---

## Rechazar reserva

### Body JSON

```json
{
  "estado": "Rechazada"
}
```

---

## Cancelar reserva

### Body JSON

```json
{
  "estado": "Cancelada"
}
```

---

## Finalizar reserva

### Body JSON

```json
{
  "estado": "Finalizada"
}
```

---

## Errores comunes al cambiar estado

Si se envía un estado no válido:

```json
{
  "success": false,
  "message": "Estado no válido. Debe ser uno de: Pendiente, Aprobada, Rechazada, Cancelada, Finalizada"
}
```

Si la reserva no existe:

```json
{
  "success": false,
  "message": "La reserva no existe"
}
```

Si la reserva ya está finalizada o cancelada:

```json
{
  "success": false,
  "message": "No se puede modificar una reserva en estado Finalizada"
}
```

```json
{
  "success": false,
  "message": "No se puede modificar una reserva en estado Cancelada"
}
```

---

## Eliminar reserva

Permite eliminar una reserva existente.

### Endpoint

```txt
DELETE /api/reservas/:id
```

### Ejemplo

```txt
DELETE http://localhost:3000/api/reservas/1
```

### Respuesta exitosa

```json
{
  "success": true,
  "message": "Reserva eliminada correctamente",
  "data": {
    "id_reserva": 1,
    "mensaje": "Reserva eliminada correctamente"
  }
}
```

### Si la reserva no existe

```json
{
  "success": false,
  "message": "La reserva no existe"
}
```

### Nota importante

Actualmente este endpoint elimina la reserva directamente de la base de datos.

Si la reserva ya tiene una sesión relacionada u otros registros dependientes, MySQL puede impedir la eliminación por las llaves foráneas.

---

# Ejemplos de consumo desde frontend con fetch para reservas

## Obtener reservas como administrador

```js
const obtenerReservasAdmin = async () => {
  const respuesta = await fetch('http://localhost:3000/api/reservas?id_usuario=1&id_rol=1');

  const data = await respuesta.json();

  console.log(data);
};
```

---

## Obtener reservas de un usuario

```js
const obtenerReservasPorUsuario = async (idUsuario, idRol) => {
  const respuesta = await fetch(`http://localhost:3000/api/reservas?id_usuario=${idUsuario}&id_rol=${idRol}`);

  const data = await respuesta.json();

  console.log(data);
};
```

---

## Obtener reserva por ID

```js
const obtenerReservaPorId = async (idReserva) => {
  const respuesta = await fetch(`http://localhost:3000/api/reservas/${idReserva}`);

  const data = await respuesta.json();

  console.log(data);
};
```

---

## Crear reserva sin enviar `id_grupo`

Este ejemplo funciona si el usuario solicitante pertenece solamente a un grupo.

```js
const crearReserva = async () => {
  const respuesta = await fetch('http://localhost:3000/api/reservas', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id_camara: 1,
      id_usuario_solicitante: 2,
      fecha: '2026-05-30',
      hora_inicio: '08:00',
      hora_fin: '10:00',
      motivo: 'Práctica supervisada'
    })
  });

  const data = await respuesta.json();

  console.log(data);
};
```

---

## Crear reserva enviando `id_grupo`

Este ejemplo debe usarse si el usuario solicitante pertenece a más de un grupo.

```js
const crearReservaConGrupo = async () => {
  const respuesta = await fetch('http://localhost:3000/api/reservas', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id_camara: 1,
      id_usuario_solicitante: 2,
      id_grupo: 1,
      fecha: '2026-05-30',
      hora_inicio: '08:00',
      hora_fin: '10:00',
      motivo: 'Práctica supervisada'
    })
  });

  const data = await respuesta.json();

  console.log(data);
};
```

---

## Cambiar estado de reserva

```js
const cambiarEstadoReserva = async (idReserva, nuevoEstado) => {
  const respuesta = await fetch(`http://localhost:3000/api/reservas/${idReserva}/estado`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      estado: nuevoEstado
    })
  });

  const data = await respuesta.json();

  console.log(data);
};
```

### Aprobar reserva

```js
cambiarEstadoReserva(1, 'Aprobada');
```

### Rechazar reserva

```js
cambiarEstadoReserva(1, 'Rechazada');
```

### Cancelar reserva

```js
cambiarEstadoReserva(1, 'Cancelada');
```

### Finalizar reserva

```js
cambiarEstadoReserva(1, 'Finalizada');
```

---

## Eliminar reserva

```js
const eliminarReserva = async () => {
  const respuesta = await fetch('http://localhost:3000/api/reservas/1', {
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

# Módulo de sesiones

Este módulo permite consultar, crear, actualizar y cambiar el estado de las sesiones relacionadas con las reservas de la Cámara de Gesell.

Las sesiones están directamente relacionadas con una reserva aprobada.
Cuando una reserva cambia a estado `Aprobada`, el sistema crea automáticamente una sesión si todavía no existe una para esa reserva.

---

## Reglas principales del módulo

* Una sesión pertenece a una reserva.
* Una sesión solo debe existir cuando la reserva fue aprobada.
* Al aprobar una reserva, el sistema crea automáticamente una sesión.
* Una reserva solo puede tener una sesión asociada.
* El administrador puede ver todas las sesiones.
* Docentes y practicantes pueden ver las sesiones de los grupos a los que pertenecen.
* Si un docente crea una reserva y esta se aprueba, los practicantes de su grupo pueden ver la sesión.
* Si un practicante crea una reserva y esta se aprueba, el docente y los demás miembros del grupo pueden ver la sesión.
* No se puede crear una sesión manualmente para una reserva que no esté aprobada.
* No se puede crear más de una sesión para la misma reserva.

---

## Estados disponibles para sesiones

```txt
Programada
Realizada
Cancelada
```

---

## Tipos de sesión disponibles

```txt
Entrevista
Práctica
Evaluación
Supervisión
Otro
```

---

## Obtener sesiones

Este endpoint permite obtener sesiones según el rol del usuario.

Si el usuario tiene rol de administrador, obtiene todas las sesiones.
Si el usuario es docente o practicante, obtiene únicamente las sesiones de los grupos a los que pertenece.

### Endpoint

```txt
GET /api/sesiones
```

### URL completa

```txt
http://localhost:3000/api/sesiones
```

### Ejemplo para administrador

```txt
GET http://localhost:3000/api/sesiones?id_usuario=1&id_rol=1
```

### Ejemplo para docente

```txt
GET http://localhost:3000/api/sesiones?id_usuario=2&id_rol=2
```

### Ejemplo para practicante

```txt
GET http://localhost:3000/api/sesiones?id_usuario=3&id_rol=3
```

### Respuesta exitosa

```json
{
  "success": true,
  "message": "Sesiones obtenidas correctamente",
  "data": [
    {
      "id_sesion": 1,
      "id_reserva": 1,
      "titulo": "Práctica supervisada",
      "descripcion": null,
      "tipo_sesion": "Entrevista",
      "fecha_realizacion": "2026-06-02T06:00:00.000Z",
      "estado": "Programada",
      "id_camara": 1,
      "camara": "Camara gesell",
      "fecha": "2026-06-02T06:00:00.000Z",
      "hora_inicio": "07:00:00",
      "hora_fin": "08:00:00",
      "motivo": "Práctica supervisada",
      "estado_reserva": "Aprobada",
      "id_usuario_solicitante": 2,
      "nombre_solicitante": "Usuario",
      "apellido_solicitante": "Docente 1",
      "id_rol": 2,
      "rol_solicitante": "Docente",
      "id_grupo": 1,
      "grupo": "Grupo de práctica 01"
    }
  ]
}
```

---

## Obtener sesión por ID

### Endpoint

```txt
GET /api/sesiones/:id
```

### Ejemplo

```txt
GET http://localhost:3000/api/sesiones/1
```

### Respuesta exitosa

```json
{
  "success": true,
  "message": "Sesión obtenida correctamente",
  "data": {
    "id_sesion": 1,
    "id_reserva": 1,
    "titulo": "Práctica supervisada",
    "descripcion": null,
    "tipo_sesion": "Entrevista",
    "fecha_realizacion": "2026-06-02T06:00:00.000Z",
    "estado": "Programada",
    "id_camara": 1,
    "camara": "Camara gesell",
    "fecha": "2026-06-02T06:00:00.000Z",
    "hora_inicio": "07:00:00",
    "hora_fin": "08:00:00",
    "motivo": "Práctica supervisada",
    "estado_reserva": "Aprobada",
    "id_usuario_solicitante": 2,
    "nombre_solicitante": "Usuario",
    "apellido_solicitante": "Docente 1",
    "id_rol": 2,
    "rol_solicitante": "Docente",
    "id_grupo": 1,
    "grupo": "Grupo de práctica 01"
  }
}
```

### Si la sesión no existe

```json
{
  "success": false,
  "message": "La sesión no existe"
}
```

---

## Crear sesión manualmente

Normalmente las sesiones se crean automáticamente cuando una reserva pasa a estado `Aprobada`.

Este endpoint puede usarse para crear una sesión manualmente, pero solo si la reserva ya está aprobada y todavía no tiene una sesión asociada.

### Endpoint

```txt
POST /api/sesiones
```

### URL completa

```txt
http://localhost:3000/api/sesiones
```

### Body JSON

```json
{
  "id_reserva": 1,
  "titulo": "Práctica supervisada",
  "descripcion": "Sesión creada manualmente desde la API",
  "tipo_sesion": "Entrevista",
  "fecha_realizacion": "2026-06-02"
}
```

### Respuesta exitosa

```json
{
  "success": true,
  "message": "Sesión creada correctamente",
  "data": {
    "id_sesion": 1,
    "id_reserva": 1,
    "titulo": "Práctica supervisada",
    "descripcion": "Sesión creada manualmente desde la API",
    "tipo_sesion": "Entrevista",
    "fecha_realizacion": "2026-06-02T06:00:00.000Z",
    "estado": "Programada"
  }
}
```

### Campos obligatorios

```json
{
  "id_reserva": 1,
  "titulo": "Práctica supervisada"
}
```

Los campos `descripcion`, `tipo_sesion` y `fecha_realizacion` son opcionales.

Si no se envía `tipo_sesion`, se guarda por defecto como `Entrevista`.

Si no se envía `fecha_realizacion`, se toma la fecha de la reserva.

### Errores comunes

Si faltan campos obligatorios:

```json
{
  "success": false,
  "message": "id_reserva y titulo son obligatorios"
}
```

Si la reserva no existe:

```json
{
  "success": false,
  "message": "La reserva no existe"
}
```

Si la reserva no está aprobada:

```json
{
  "success": false,
  "message": "Solo se puede crear una sesión para una reserva aprobada"
}
```

Si ya existe una sesión para esa reserva:

```json
{
  "success": false,
  "message": "Ya existe una sesión para esta reserva"
}
```

Si el tipo de sesión no es válido:

```json
{
  "success": false,
  "message": "Tipo de sesión no válido. Debe ser uno de: Entrevista, Práctica, Evaluación, Supervisión, Otro"
}
```

---

## Actualizar sesión

Permite actualizar los datos principales de una sesión.

### Endpoint

```txt
PUT /api/sesiones/:id
```

### Ejemplo

```txt
PUT http://localhost:3000/api/sesiones/1
```

### Body JSON

```json
{
  "titulo": "Sesión de entrevista clínica",
  "descripcion": "Sesión actualizada desde el módulo de sesiones",
  "tipo_sesion": "Entrevista",
  "fecha_realizacion": "2026-06-02"
}
```

### Respuesta exitosa

```json
{
  "success": true,
  "message": "Sesión actualizada correctamente",
  "data": {
    "id_sesion": 1,
    "id_reserva": 1,
    "titulo": "Sesión de entrevista clínica",
    "descripcion": "Sesión actualizada desde el módulo de sesiones",
    "tipo_sesion": "Entrevista",
    "fecha_realizacion": "2026-06-02T06:00:00.000Z",
    "estado": "Programada"
  }
}
```

### Campos obligatorios

```json
{
  "titulo": "Sesión de entrevista clínica"
}
```

### Validaciones

El backend valida que:

* La sesión exista.
* El título sea obligatorio.
* El tipo de sesión sea válido.
* La sesión no esté cancelada.

### Errores comunes

Si la sesión no existe:

```json
{
  "success": false,
  "message": "La sesión no existe"
}
```

Si no se envía título:

```json
{
  "success": false,
  "message": "El título es obligatorio"
}
```

Si la sesión está cancelada:

```json
{
  "success": false,
  "message": "No se puede actualizar una sesión cancelada"
}
```

---

## Cambiar estado de sesión

Permite cambiar el estado de una sesión.

### Endpoint

```txt
PATCH /api/sesiones/:id/estado
```

### Ejemplo

```txt
PATCH http://localhost:3000/api/sesiones/1/estado
```

### Body JSON

```json
{
  "estado": "Realizada"
}
```

### Respuesta exitosa

```json
{
  "success": true,
  "message": "Estado de la sesión actualizado correctamente",
  "data": {
    "id_sesion": 1,
    "id_reserva": 1,
    "titulo": "Sesión de entrevista clínica",
    "descripcion": "Sesión actualizada desde el módulo de sesiones",
    "tipo_sesion": "Entrevista",
    "fecha_realizacion": "2026-06-02T06:00:00.000Z",
    "estado": "Realizada"
  }
}
```

### Estados permitidos

```txt
Programada
Realizada
Cancelada
```

### Errores comunes

Si se envía un estado no válido:

```json
{
  "success": false,
  "message": "Estado no válido. Debe ser uno de: Programada, Realizada, Cancelada"
}
```

Si la sesión no existe:

```json
{
  "success": false,
  "message": "La sesión no existe"
}
```

Si la sesión está cancelada:

```json
{
  "success": false,
  "message": "No se puede modificar una sesión cancelada"
}
```

---

# Ejemplos de consumo desde frontend con fetch para sesiones

## Obtener sesiones como administrador

```js
const obtenerSesionesAdmin = async () => {
  const respuesta = await fetch('http://localhost:3000/api/sesiones?id_usuario=1&id_rol=1');

  const data = await respuesta.json();

  console.log(data);
};
```

---

## Obtener sesiones como docente o practicante

```js
const obtenerSesionesPorUsuario = async (idUsuario, idRol) => {
  const respuesta = await fetch(`http://localhost:3000/api/sesiones?id_usuario=${idUsuario}&id_rol=${idRol}`);

  const data = await respuesta.json();

  console.log(data);
};
```

---

## Obtener sesión por ID

```js
const obtenerSesionPorId = async (idSesion) => {
  const respuesta = await fetch(`http://localhost:3000/api/sesiones/${idSesion}`);

  const data = await respuesta.json();

  console.log(data);
};
```

---

## Crear sesión manualmente

```js
const crearSesion = async () => {
  const respuesta = await fetch('http://localhost:3000/api/sesiones', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id_reserva: 1,
      titulo: 'Práctica supervisada',
      descripcion: 'Sesión creada manualmente desde la API',
      tipo_sesion: 'Entrevista',
      fecha_realizacion: '2026-06-02'
    })
  });

  const data = await respuesta.json();

  console.log(data);
};
```

---

## Actualizar sesión

```js
const actualizarSesion = async () => {
  const respuesta = await fetch('http://localhost:3000/api/sesiones/1', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      titulo: 'Sesión de entrevista clínica',
      descripcion: 'Sesión actualizada desde el frontend',
      tipo_sesion: 'Entrevista',
      fecha_realizacion: '2026-06-02'
    })
  });

  const data = await respuesta.json();

  console.log(data);
};
```

---

## Cambiar estado de sesión

```js
const cambiarEstadoSesion = async (idSesion, nuevoEstado) => {
  const respuesta = await fetch(`http://localhost:3000/api/sesiones/${idSesion}/estado`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      estado: nuevoEstado
    })
  });

  const data = await respuesta.json();

  console.log(data);
};
```

### Marcar sesión como realizada

```js
cambiarEstadoSesion(1, 'Realizada');
```

### Cancelar sesión

```js
cambiarEstadoSesion(1, 'Cancelada');
```

---

# Módulo de comentarios de sesión

Este módulo permite crear, consultar, actualizar y eliminar comentarios u observaciones relacionadas directamente con una sesión.

Las observaciones pertenecen a una sesión y son realizadas por un usuario.
Estas observaciones pueden ser vistas por los miembros del grupo asociado a la sesión.

---

## Tabla relacionada

La tabla utilizada para este módulo es `observaciones`.

```sql
CREATE TABLE observaciones (
    id_observacion INT AUTO_INCREMENT PRIMARY KEY,
    id_sesion INT NOT NULL,
    id_usuario INT NOT NULL,
    observacion TEXT NOT NULL,
    fecha_observacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_sesion) REFERENCES sesiones(id_sesion) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);
```

---

## Reglas principales del módulo

* Una observación pertenece a una sesión.
* Una observación pertenece a un usuario.
* El administrador puede ver todas las observaciones.
* Docentes y practicantes solo pueden ver observaciones de sesiones pertenecientes a sus grupos.
* Docentes y practicantes pueden crear observaciones en sesiones de sus grupos.
* El usuario debe pertenecer al grupo de la sesión para poder crear una observación.
* No se pueden agregar observaciones a sesiones canceladas.
* El administrador puede actualizar y eliminar cualquier observación.
* Docentes y practicantes solo pueden actualizar y eliminar sus propias observaciones.

---

## Obtener observaciones

Este endpoint permite obtener observaciones según el rol del usuario.

### Endpoint

```txt
GET /api/observaciones
```

### URL completa

```txt
http://localhost:3000/api/observaciones
```

### Obtener todas las observaciones como administrador

```txt
GET http://localhost:3000/api/observaciones?id_usuario=1&id_rol=1
```

### Obtener observaciones visibles para un docente

```txt
GET http://localhost:3000/api/observaciones?id_usuario=2&id_rol=2
```

### Obtener observaciones visibles para un practicante

```txt
GET http://localhost:3000/api/observaciones?id_usuario=3&id_rol=3
```

### Obtener observaciones de una sesión específica

```txt
GET http://localhost:3000/api/observaciones?id_sesion=1&id_usuario=2&id_rol=2
```

### Respuesta exitosa

```json
{
  "success": true,
  "message": "Observaciones obtenidas correctamente",
  "data": [
    {
      "id_observacion": 1,
      "id_sesion": 1,
      "id_usuario": 2,
      "observacion": "El estudiante mostró buen manejo durante la entrevista.",
      "fecha_observacion": "2026-06-02T20:00:00.000Z",
      "nombre_usuario": "Usuario",
      "apellido_usuario": "Docente 1",
      "rol_usuario": "Docente",
      "sesion": "Práctica supervisada",
      "estado_sesion": "Programada",
      "id_reserva": 1,
      "id_grupo": 1,
      "grupo": "Grupo de práctica 01"
    }
  ]
}
```

---

## Obtener observación por ID

### Endpoint

```txt
GET /api/observaciones/:id
```

### Ejemplo

```txt
GET http://localhost:3000/api/observaciones/1
```

### Respuesta exitosa

```json
{
  "success": true,
  "message": "Observación obtenida correctamente",
  "data": {
    "id_observacion": 1,
    "id_sesion": 1,
    "id_usuario": 2,
    "observacion": "El estudiante mostró buen manejo durante la entrevista.",
    "fecha_observacion": "2026-06-02T20:00:00.000Z",
    "nombre_usuario": "Usuario",
    "apellido_usuario": "Docente 1",
    "rol_usuario": "Docente",
    "sesion": "Práctica supervisada",
    "estado_sesion": "Programada",
    "id_reserva": 1,
    "id_grupo": 1,
    "grupo": "Grupo de práctica 01"
  }
}
```

### Si la observación no existe

```json
{
  "success": false,
  "message": "La observación no existe"
}
```

---

## Crear observación

Permite crear una observación relacionada con una sesión.

### Endpoint

```txt
POST /api/observaciones
```

### URL completa

```txt
http://localhost:3000/api/observaciones
```

### Body JSON

```json
{
  "id_sesion": 1,
  "id_usuario": 2,
  "id_rol": 2,
  "observacion": "El estudiante mostró buen manejo durante la entrevista."
}
```

### Respuesta exitosa

```json
{
  "success": true,
  "message": "Observación creada correctamente",
  "data": {
    "id_observacion": 1,
    "id_sesion": 1,
    "id_usuario": 2,
    "observacion": "El estudiante mostró buen manejo durante la entrevista.",
    "fecha_observacion": "2026-06-02T20:00:00.000Z",
    "nombre_usuario": "Usuario",
    "apellido_usuario": "Docente 1",
    "rol_usuario": "Docente",
    "sesion": "Práctica supervisada",
    "estado_sesion": "Programada",
    "id_reserva": 1,
    "id_grupo": 1,
    "grupo": "Grupo de práctica 01"
  }
}
```

### Campos obligatorios

```json
{
  "id_sesion": 1,
  "id_usuario": 2,
  "observacion": "El estudiante mostró buen manejo durante la entrevista."
}
```

### Validaciones

El backend valida que:

* `id_sesion` sea obligatorio.
* `id_usuario` sea obligatorio.
* `observacion` sea obligatoria.
* La observación no esté vacía.
* La sesión exista.
* La sesión no esté cancelada.
* Si el usuario no es administrador, debe pertenecer al grupo de la sesión.

### Errores comunes

Si faltan campos obligatorios:

```json
{
  "success": false,
  "message": "id_sesion, id_usuario y observacion son obligatorios"
}
```

Si la observación está vacía:

```json
{
  "success": false,
  "message": "La observación no puede estar vacía"
}
```

Si la sesión no existe:

```json
{
  "success": false,
  "message": "La sesión no existe"
}
```

Si la sesión está cancelada:

```json
{
  "success": false,
  "message": "No se pueden agregar observaciones a una sesión cancelada"
}
```

Si el usuario no pertenece al grupo de la sesión:

```json
{
  "success": false,
  "message": "El usuario no pertenece al grupo de esta sesión"
}
```

---

## Actualizar observación

Permite actualizar una observación existente.

### Endpoint

```txt
PUT /api/observaciones/:id
```

### Ejemplo

```txt
PUT http://localhost:3000/api/observaciones/1
```

### Body JSON

```json
{
  "id_usuario": 2,
  "id_rol": 2,
  "observacion": "Observación actualizada desde el módulo de sesiones."
}
```

### Respuesta exitosa

```json
{
  "success": true,
  "message": "Observación actualizada correctamente",
  "data": {
    "id_observacion": 1,
    "id_sesion": 1,
    "id_usuario": 2,
    "observacion": "Observación actualizada desde el módulo de sesiones.",
    "fecha_observacion": "2026-06-02T20:00:00.000Z",
    "nombre_usuario": "Usuario",
    "apellido_usuario": "Docente 1",
    "rol_usuario": "Docente",
    "sesion": "Práctica supervisada",
    "estado_sesion": "Programada",
    "id_reserva": 1,
    "id_grupo": 1,
    "grupo": "Grupo de práctica 01"
  }
}
```

### Validaciones

El backend valida que:

* La observación exista.
* `id_usuario` sea obligatorio.
* La nueva observación no esté vacía.
* El administrador pueda actualizar cualquier observación.
* Docentes y practicantes solo puedan actualizar sus propias observaciones.

### Errores comunes

Si otro usuario intenta actualizar una observación que no le pertenece:

```json
{
  "success": false,
  "message": "Solo el autor o un administrador puede actualizar esta observación"
}
```

---

## Eliminar observación

Permite eliminar una observación existente.

### Endpoint

```txt
DELETE /api/observaciones/:id
```

### Ejemplo

```txt
DELETE http://localhost:3000/api/observaciones/1
```

### Body JSON

```json
{
  "id_usuario": 2,
  "id_rol": 2
}
```

### Respuesta exitosa

```json
{
  "success": true,
  "message": "Observación eliminada correctamente",
  "data": {
    "id_observacion": 1,
    "mensaje": "Observación eliminada correctamente"
  }
}
```

### Validaciones

El backend valida que:

* La observación exista.
* `id_usuario` sea obligatorio.
* El administrador pueda eliminar cualquier observación.
* Docentes y practicantes solo puedan eliminar sus propias observaciones.

### Errores comunes

Si otro usuario intenta eliminar una observación que no le pertenece:

```json
{
  "success": false,
  "message": "Solo el autor o un administrador puede eliminar esta observación"
}
```

---

# Ejemplos de consumo desde frontend con fetch para observaciones

## Obtener observaciones como administrador

```js
const obtenerObservacionesAdmin = async () => {
  const respuesta = await fetch('http://localhost:3000/api/observaciones?id_usuario=1&id_rol=1');

  const data = await respuesta.json();

  console.log(data);
};
```

---

## Obtener observaciones de las sesiones de mis grupos

```js
const obtenerObservacionesPorUsuario = async (idUsuario, idRol) => {
  const respuesta = await fetch(`http://localhost:3000/api/observaciones?id_usuario=${idUsuario}&id_rol=${idRol}`);

  const data = await respuesta.json();

  console.log(data);
};
```

---

## Obtener observaciones de una sesión

```js
const obtenerObservacionesPorSesion = async (idSesion, idUsuario, idRol) => {
  const respuesta = await fetch(`http://localhost:3000/api/observaciones?id_sesion=${idSesion}&id_usuario=${idUsuario}&id_rol=${idRol}`);

  const data = await respuesta.json();

  console.log(data);
};
```

---

## Crear observación

```js
const crearObservacion = async () => {
  const respuesta = await fetch('http://localhost:3000/api/observaciones', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id_sesion: 1,
      id_usuario: 2,
      id_rol: 2,
      observacion: 'El estudiante mostró buen manejo durante la entrevista.'
    })
  });

  const data = await respuesta.json();

  console.log(data);
};
```

---

## Actualizar observación

```js
const actualizarObservacion = async () => {
  const respuesta = await fetch('http://localhost:3000/api/observaciones/1', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id_usuario: 2,
      id_rol: 2,
      observacion: 'Observación actualizada desde el frontend.'
    })
  });

  const data = await respuesta.json();

  console.log(data);
};
```

---

## Eliminar observación

```js
const eliminarObservacion = async () => {
  const respuesta = await fetch('http://localhost:3000/api/observaciones/1', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id_usuario: 2,
      id_rol: 2
    })
  });

  const data = await respuesta.json();

  console.log(data);
};
```

# Módulo de grabaciones

Este módulo permite gestionar las grabaciones relacionadas con las sesiones de la Cámara de Gesell.

Una grabación pertenece a una sesión.
La sesión pertenece a una reserva.
La reserva pertenece a un grupo.

Por lo tanto, las grabaciones pueden ser vistas por los miembros del grupo asociado a la sesión, siempre que la grabación esté visible.

---

## Reglas principales del módulo

* Una grabación pertenece a una sesión.
* Una sesión puede tener una o varias grabaciones.
* La grabación guarda el usuario que la subió mediante `id_usuario_subio`.
* Solo se pueden subir grabaciones a sesiones existentes.
* No se pueden subir grabaciones a sesiones canceladas.
* El administrador puede ver todas las grabaciones.
* Docentes y practicantes pueden ver grabaciones visibles de las sesiones de sus grupos.
* Docentes y practicantes pueden subir grabaciones a sesiones de sus grupos.
* Docentes y practicantes solo pueden actualizar, cambiar visibilidad o eliminar las grabaciones que ellos mismos subieron.
* El administrador puede actualizar, cambiar visibilidad o eliminar cualquier grabación.
* Las grabaciones pueden tener etiquetas asociadas.

---

## Tabla relacionada

La tabla principal del módulo es `grabaciones`.

```sql
CREATE TABLE grabaciones (
    id_grabacion INT AUTO_INCREMENT PRIMARY KEY,
    id_sesion INT NOT NULL,
    id_usuario_subio INT NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    url_video TEXT NOT NULL,
    descripcion TEXT,
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    visible BOOLEAN DEFAULT TRUE,

    FOREIGN KEY (id_sesion) REFERENCES sesiones(id_sesion),
    FOREIGN KEY (id_usuario_subio) REFERENCES usuarios(id_usuario)
);
```

También se utilizan las tablas `etiquetas` y `grabaciones_etiquetas` para asociar etiquetas a cada grabación.

```sql
CREATE TABLE etiquetas (
    id_etiqueta INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);
```

```sql
CREATE TABLE grabaciones_etiquetas (
    id_grabacion INT NOT NULL,
    id_etiqueta INT NOT NULL,

    PRIMARY KEY (id_grabacion, id_etiqueta),

    FOREIGN KEY (id_grabacion) REFERENCES grabaciones(id_grabacion) ON DELETE CASCADE,
    FOREIGN KEY (id_etiqueta) REFERENCES etiquetas(id_etiqueta) ON DELETE CASCADE
);
```

---

# Endpoints del módulo

La API utiliza el prefijo:

```txt
/api/grabaciones
```

---

## Obtener grabaciones

Este endpoint permite obtener las grabaciones según el rol del usuario.

Si el usuario es administrador, obtiene todas las grabaciones.
Si el usuario es docente o practicante, obtiene únicamente las grabaciones visibles de las sesiones pertenecientes a sus grupos.

### Endpoint

```txt
GET /api/grabaciones
```

### URL completa

```txt
http://localhost:3000/api/grabaciones
```

### Ejemplo para administrador

```txt
GET http://localhost:3000/api/grabaciones?id_usuario=1&id_rol=1
```

### Ejemplo para docente

```txt
GET http://localhost:3000/api/grabaciones?id_usuario=2&id_rol=2
```

### Ejemplo para practicante

```txt
GET http://localhost:3000/api/grabaciones?id_usuario=3&id_rol=3
```

### Respuesta exitosa

```json
{
  "success": true,
  "message": "Grabaciones obtenidas correctamente",
  "data": [
    {
      "id_grabacion": 1,
      "id_sesion": 1,
      "id_usuario_subio": 2,
      "nombre_usuario_subio": "Carlos",
      "apellido_usuario_subio": "Ramírez",
      "rol_usuario_subio": "Docente",
      "titulo": "Grabación de práctica supervisada",
      "url_video": "https://drive.google.com/video-prueba",
      "descripcion": "Grabación de la sesión realizada.",
      "fecha_subida": "2026-06-02T20:00:00.000Z",
      "visible": 1,
      "id_reserva": 1,
      "titulo_sesion": "Práctica supervisada",
      "estado_sesion": "Programada",
      "fecha_sesion": "2026-06-02T06:00:00.000Z",
      "hora_inicio": "08:00:00",
      "hora_fin": "10:00:00",
      "motivo": "Práctica supervisada",
      "estado_reserva": "Aprobada",
      "id_camara": 1,
      "camara": "Cámara Gesell 1",
      "id_usuario_solicitante": 2,
      "nombre_solicitante": "Carlos",
      "apellido_solicitante": "Ramírez",
      "id_rol": 2,
      "rol_solicitante": "Docente",
      "id_grupo": 1,
      "grupo": "Grupo de práctica 01",
      "etiquetas": [
        {
          "id_etiqueta": 1,
          "nombre": "Evaluación"
        },
        {
          "id_etiqueta": 3,
          "nombre": "Práctica supervisada"
        }
      ]
    }
  ]
}
```

---

## Obtener grabación por ID

### Endpoint

```txt
GET /api/grabaciones/:id
```

### Ejemplo

```txt
GET http://localhost:3000/api/grabaciones/1
```

### Respuesta exitosa

```json
{
  "success": true,
  "message": "Grabación obtenida correctamente",
  "data": {
    "id_grabacion": 1,
    "id_sesion": 1,
    "id_usuario_subio": 2,
    "nombre_usuario_subio": "Carlos",
    "apellido_usuario_subio": "Ramírez",
    "rol_usuario_subio": "Docente",
    "titulo": "Grabación de práctica supervisada",
    "url_video": "https://drive.google.com/video-prueba",
    "descripcion": "Grabación de la sesión realizada.",
    "fecha_subida": "2026-06-02T20:00:00.000Z",
    "visible": 1,
    "id_reserva": 1,
    "titulo_sesion": "Práctica supervisada",
    "estado_sesion": "Programada",
    "fecha_sesion": "2026-06-02T06:00:00.000Z",
    "hora_inicio": "08:00:00",
    "hora_fin": "10:00:00",
    "motivo": "Práctica supervisada",
    "estado_reserva": "Aprobada",
    "id_camara": 1,
    "camara": "Cámara Gesell 1",
    "id_usuario_solicitante": 2,
    "nombre_solicitante": "Carlos",
    "apellido_solicitante": "Ramírez",
    "id_rol": 2,
    "rol_solicitante": "Docente",
    "id_grupo": 1,
    "grupo": "Grupo de práctica 01",
    "etiquetas": [
      {
        "id_etiqueta": 1,
        "nombre": "Evaluación"
      }
    ]
  }
}
```

### Si la grabación no existe

```json
{
  "success": false,
  "message": "La grabación no existe"
}
```

---

## Obtener grabaciones por sesión

Este endpoint permite obtener las grabaciones de una sesión específica.

El administrador puede ver todas las grabaciones de la sesión.
Docentes y practicantes solo pueden ver las grabaciones visibles si pertenecen al grupo de esa sesión.

### Endpoint

```txt
GET /api/grabaciones/sesion/:id_sesion
```

### Ejemplo para administrador

```txt
GET http://localhost:3000/api/grabaciones/sesion/1?id_usuario=1&id_rol=1
```

### Ejemplo para docente o practicante

```txt
GET http://localhost:3000/api/grabaciones/sesion/1?id_usuario=2&id_rol=2
```

### Respuesta exitosa

```json
{
  "success": true,
  "message": "Grabaciones de sesión obtenidas correctamente",
  "data": [
    {
      "id_grabacion": 1,
      "id_sesion": 1,
      "id_usuario_subio": 2,
      "nombre_usuario_subio": "Carlos",
      "apellido_usuario_subio": "Ramírez",
      "rol_usuario_subio": "Docente",
      "titulo": "Grabación de práctica supervisada",
      "url_video": "https://drive.google.com/video-prueba",
      "descripcion": "Grabación de la sesión realizada.",
      "fecha_subida": "2026-06-02T20:00:00.000Z",
      "visible": 1,
      "etiquetas": [
        {
          "id_etiqueta": 1,
          "nombre": "Evaluación"
        }
      ]
    }
  ]
}
```

---

## Obtener etiquetas

Este endpoint permite obtener las etiquetas disponibles para asociarlas a una grabación.

### Endpoint

```txt
GET /api/grabaciones/etiquetas
```

### URL completa

```txt
http://localhost:3000/api/grabaciones/etiquetas
```

### Respuesta exitosa

```json
{
  "success": true,
  "message": "Etiquetas obtenidas correctamente",
  "data": [
    {
      "id_etiqueta": 1,
      "nombre": "Evaluación"
    },
    {
      "id_etiqueta": 2,
      "nombre": "Entrevista clínica"
    },
    {
      "id_etiqueta": 3,
      "nombre": "Práctica supervisada"
    }
  ]
}
```

---

## Crear grabación

Permite crear una nueva grabación relacionada con una sesión.

### Endpoint

```txt
POST /api/grabaciones
```

### URL completa

```txt
http://localhost:3000/api/grabaciones
```

### Body JSON

```json
{
  "id_sesion": 1,
  "id_usuario_subio": 2,
  "id_rol": 2,
  "titulo": "Grabación de práctica supervisada",
  "url_video": "https://drive.google.com/video-prueba",
  "descripcion": "Grabación de la sesión realizada.",
  "visible": true,
  "etiquetas": [1, 3]
}
```

### Respuesta exitosa

```json
{
  "success": true,
  "message": "Grabación creada correctamente",
  "data": {
    "id_grabacion": 1,
    "id_sesion": 1,
    "id_usuario_subio": 2,
    "nombre_usuario_subio": "Carlos",
    "apellido_usuario_subio": "Ramírez",
    "rol_usuario_subio": "Docente",
    "titulo": "Grabación de práctica supervisada",
    "url_video": "https://drive.google.com/video-prueba",
    "descripcion": "Grabación de la sesión realizada.",
    "fecha_subida": "2026-06-02T20:00:00.000Z",
    "visible": 1,
    "id_reserva": 1,
    "titulo_sesion": "Práctica supervisada",
    "estado_sesion": "Programada",
    "fecha_sesion": "2026-06-02T06:00:00.000Z",
    "hora_inicio": "08:00:00",
    "hora_fin": "10:00:00",
    "motivo": "Práctica supervisada",
    "estado_reserva": "Aprobada",
    "id_camara": 1,
    "camara": "Cámara Gesell 1",
    "id_usuario_solicitante": 2,
    "nombre_solicitante": "Carlos",
    "apellido_solicitante": "Ramírez",
    "id_rol": 2,
    "rol_solicitante": "Docente",
    "id_grupo": 1,
    "grupo": "Grupo de práctica 01",
    "etiquetas": [
      {
        "id_etiqueta": 1,
        "nombre": "Evaluación"
      },
      {
        "id_etiqueta": 3,
        "nombre": "Práctica supervisada"
      }
    ]
  }
}
```

### Campos obligatorios

```json
{
  "id_sesion": 1,
  "id_usuario_subio": 2,
  "titulo": "Grabación de práctica supervisada",
  "url_video": "https://drive.google.com/video-prueba"
}
```

El campo `descripcion` es opcional.
El campo `visible` es opcional; si no se envía, por defecto se guarda como visible.
El campo `etiquetas` es opcional.

### Validaciones

El backend valida que:

* `id_sesion` sea obligatorio.
* `id_usuario_subio` sea obligatorio.
* El título sea obligatorio.
* La URL del video sea obligatoria.
* La sesión exista.
* La sesión no esté cancelada.
* Si el usuario no es administrador, debe pertenecer al grupo de la sesión.

### Errores comunes

Si falta `id_sesion`:

```json
{
  "success": false,
  "message": "id_sesion es obligatorio"
}
```

Si falta `id_usuario_subio`:

```json
{
  "success": false,
  "message": "id_usuario_subio es obligatorio"
}
```

Si no se envía título:

```json
{
  "success": false,
  "message": "El título es obligatorio"
}
```

Si no se envía URL:

```json
{
  "success": false,
  "message": "La URL del video es obligatoria"
}
```

Si la sesión no existe:

```json
{
  "success": false,
  "message": "La sesión no existe"
}
```

Si la sesión está cancelada:

```json
{
  "success": false,
  "message": "No se pueden subir grabaciones a una sesión cancelada"
}
```

Si el usuario no pertenece al grupo de la sesión:

```json
{
  "success": false,
  "message": "El usuario no pertenece al grupo de esta sesión"
}
```

---

## Actualizar grabación

Permite actualizar una grabación existente.

El administrador puede actualizar cualquier grabación.
Docentes y practicantes solo pueden actualizar las grabaciones que ellos mismos subieron.

### Endpoint

```txt
PUT /api/grabaciones/:id
```

### Ejemplo

```txt
PUT http://localhost:3000/api/grabaciones/1
```

### Body JSON

```json
{
  "id_usuario": 2,
  "id_rol": 2,
  "titulo": "Grabación actualizada",
  "url_video": "https://drive.google.com/video-actualizado",
  "descripcion": "Descripción actualizada de la grabación.",
  "visible": true,
  "etiquetas": [1, 4]
}
```

### Respuesta exitosa

```json
{
  "success": true,
  "message": "Grabación actualizada correctamente",
  "data": {
    "id_grabacion": 1,
    "id_sesion": 1,
    "id_usuario_subio": 2,
    "titulo": "Grabación actualizada",
    "url_video": "https://drive.google.com/video-actualizado",
    "descripcion": "Descripción actualizada de la grabación.",
    "visible": 1,
    "etiquetas": [
      {
        "id_etiqueta": 1,
        "nombre": "Evaluación"
      },
      {
        "id_etiqueta": 4,
        "nombre": "Entrevista clínica"
      }
    ]
  }
}
```

### Campos obligatorios

```json
{
  "id_usuario": 2,
  "titulo": "Grabación actualizada",
  "url_video": "https://drive.google.com/video-actualizado"
}
```

### Validaciones

El backend valida que:

* La grabación exista.
* El título sea obligatorio.
* La URL del video sea obligatoria.
* Solo el usuario que subió la grabación o un administrador pueda actualizarla.

### Errores comunes

Si otro usuario intenta actualizar una grabación que no subió:

```json
{
  "success": false,
  "message": "Solo el usuario que subió la grabación o un administrador puede actualizarla"
}
```

---

## Cambiar visibilidad de grabación

Permite cambiar si una grabación está visible o no.

El administrador puede cambiar la visibilidad de cualquier grabación.
Docentes y practicantes solo pueden cambiar la visibilidad de las grabaciones que ellos mismos subieron.

### Endpoint

```txt
PATCH /api/grabaciones/:id/visibilidad
```

### Ejemplo

```txt
PATCH http://localhost:3000/api/grabaciones/1/visibilidad
```

### Body JSON para ocultar

```json
{
  "id_usuario": 2,
  "id_rol": 2,
  "visible": false
}
```

### Body JSON para mostrar

```json
{
  "id_usuario": 2,
  "id_rol": 2,
  "visible": true
}
```

### Respuesta exitosa

```json
{
  "success": true,
  "message": "Visibilidad actualizada correctamente",
  "data": {
    "id_grabacion": 1,
    "id_sesion": 1,
    "id_usuario_subio": 2,
    "titulo": "Grabación de práctica supervisada",
    "url_video": "https://drive.google.com/video-prueba",
    "descripcion": "Grabación de la sesión realizada.",
    "visible": 0
  }
}
```

### Validaciones

El backend valida que:

* La grabación exista.
* El campo `visible` sea obligatorio.
* Solo el usuario que subió la grabación o un administrador pueda cambiar la visibilidad.

### Errores comunes

Si no se envía `visible`:

```json
{
  "success": false,
  "message": "El campo visible es obligatorio"
}
```

Si otro usuario intenta cambiar la visibilidad:

```json
{
  "success": false,
  "message": "Solo el usuario que subió la grabación o un administrador puede cambiar la visibilidad"
}
```

---

## Eliminar grabación

Permite eliminar una grabación existente.

El administrador puede eliminar cualquier grabación.
Docentes y practicantes solo pueden eliminar las grabaciones que ellos mismos subieron.

### Endpoint

```txt
DELETE /api/grabaciones/:id
```

### Ejemplo

```txt
DELETE http://localhost:3000/api/grabaciones/1
```

### Body JSON

```json
{
  "id_usuario": 2,
  "id_rol": 2
}
```

### Respuesta exitosa

```json
{
  "success": true,
  "message": "Grabación eliminada correctamente",
  "data": {
    "id_grabacion": 1,
    "mensaje": "Grabación eliminada correctamente"
  }
}
```

### Validaciones

El backend valida que:

* La grabación exista.
* Solo el usuario que subió la grabación o un administrador pueda eliminarla.

### Errores comunes

Si otro usuario intenta eliminar la grabación:

```json
{
  "success": false,
  "message": "Solo el usuario que subió la grabación o un administrador puede eliminarla"
}
```

---

# Ejemplos de consumo desde frontend con fetch para grabaciones

## Obtener grabaciones como administrador

```js
const obtenerGrabacionesAdmin = async () => {
  const respuesta = await fetch('http://localhost:3000/api/grabaciones?id_usuario=1&id_rol=1');

  const data = await respuesta.json();

  console.log(data);
};
```

---

## Obtener grabaciones visibles de mis grupos

```js
const obtenerGrabacionesPorUsuario = async (idUsuario, idRol) => {
  const respuesta = await fetch(`http://localhost:3000/api/grabaciones?id_usuario=${idUsuario}&id_rol=${idRol}`);

  const data = await respuesta.json();

  console.log(data);
};
```

---

## Obtener grabación por ID

```js
const obtenerGrabacionPorId = async (idGrabacion) => {
  const respuesta = await fetch(`http://localhost:3000/api/grabaciones/${idGrabacion}`);

  const data = await respuesta.json();

  console.log(data);
};
```

---

## Obtener grabaciones de una sesión

```js
const obtenerGrabacionesPorSesion = async (idSesion, idUsuario, idRol) => {
  const respuesta = await fetch(`http://localhost:3000/api/grabaciones/sesion/${idSesion}?id_usuario=${idUsuario}&id_rol=${idRol}`);

  const data = await respuesta.json();

  console.log(data);
};
```

---

## Obtener etiquetas

```js
const obtenerEtiquetas = async () => {
  const respuesta = await fetch('http://localhost:3000/api/grabaciones/etiquetas');

  const data = await respuesta.json();

  console.log(data);
};
```

---

## Crear grabación

```js
const crearGrabacion = async () => {
  const respuesta = await fetch('http://localhost:3000/api/grabaciones', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id_sesion: 1,
      id_usuario_subio: 2,
      id_rol: 2,
      titulo: 'Grabación de práctica supervisada',
      url_video: 'https://drive.google.com/video-prueba',
      descripcion: 'Grabación de la sesión realizada.',
      visible: true,
      etiquetas: [1, 3]
    })
  });

  const data = await respuesta.json();

  console.log(data);
};
```

---

## Actualizar grabación

```js
const actualizarGrabacion = async () => {
  const respuesta = await fetch('http://localhost:3000/api/grabaciones/1', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id_usuario: 2,
      id_rol: 2,
      titulo: 'Grabación actualizada',
      url_video: 'https://drive.google.com/video-actualizado',
      descripcion: 'Descripción actualizada desde frontend.',
      visible: true,
      etiquetas: [1, 4]
    })
  });

  const data = await respuesta.json();

  console.log(data);
};
```

---

## Cambiar visibilidad

```js
const cambiarVisibilidadGrabacion = async (idGrabacion, idUsuario, idRol, visible) => {
  const respuesta = await fetch(`http://localhost:3000/api/grabaciones/${idGrabacion}/visibilidad`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id_usuario: idUsuario,
      id_rol: idRol,
      visible: visible
    })
  });

  const data = await respuesta.json();

  console.log(data);
};
```

### Ocultar grabación

```js
cambiarVisibilidadGrabacion(1, 2, 2, false);
```

### Mostrar grabación

```js
cambiarVisibilidadGrabacion(1, 2, 2, true);
```

---

## Eliminar grabación

```js
const eliminarGrabacion = async () => {
  const respuesta = await fetch('http://localhost:3000/api/grabaciones/1', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id_usuario: 2,
      id_rol: 2
    })
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
