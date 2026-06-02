DROP DATABASE IF EXISTS gesell;
CREATE DATABASE IF NOT EXISTS gesell;
USE gesell;

-- ============================================================
-- ROLES DEL SISTEMA
-- ============================================================

CREATE TABLE roles (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO roles (nombre_rol) VALUES
('Administrador'),
('Docente'),
('Practicante');


-- ============================================================
-- USUARIOS DEL SISTEMA
-- ============================================================

CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    id_rol INT NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_rol) REFERENCES roles(id_rol)
);


-- ============================================================
-- CÁMARAS DE GESELL
-- ============================================================

CREATE TABLE camaras_gesell (
    id_camara INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    ubicacion VARCHAR(150),
    descripcion TEXT,
    activa BOOLEAN DEFAULT TRUE
);


-- ============================================================
-- GRUPOS
-- ============================================================

CREATE TABLE grupos (
    id_grupo INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    id_docente_responsable INT NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_docente_responsable) REFERENCES usuarios(id_usuario)
);


-- ============================================================
-- USUARIOS ASIGNADOS A GRUPOS
-- ============================================================
-- Un usuario puede existir sin pertenecer a ningún grupo.
-- Un grupo puede tener varios practicantes y varios docentes.
-- El administrador será quien asigne usuarios a los grupos.

CREATE TABLE grupo_usuarios (
    id_grupo INT NOT NULL,
    id_usuario INT NOT NULL,
    rol_en_grupo ENUM('Docente', 'Practicante') NOT NULL,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id_grupo, id_usuario),

    FOREIGN KEY (id_grupo) REFERENCES grupos(id_grupo) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);


-- ============================================================
-- RESERVAS / CITAS DE CÁMARA
-- ============================================================
-- Ahora la reserva pertenece a un grupo.
-- El solicitante debe ser un usuario del sistema.
-- La validación de que el usuario pertenezca al grupo se hará desde backend.

CREATE TABLE reservas (
    id_reserva INT AUTO_INCREMENT PRIMARY KEY,
    id_camara INT NOT NULL,
    id_usuario_solicitante INT NOT NULL,
    id_grupo INT NOT NULL,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    motivo VARCHAR(255),
    estado ENUM('Pendiente', 'Aprobada', 'Rechazada', 'Cancelada', 'Finalizada') DEFAULT 'Pendiente',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_camara) REFERENCES camaras_gesell(id_camara),
    FOREIGN KEY (id_usuario_solicitante) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_grupo) REFERENCES grupos(id_grupo)
);


-- ============================================================
-- SESIONES DE LA CÁMARA
-- ============================================================
-- Una sesión nace a partir de una reserva.

CREATE TABLE sesiones (
    id_sesion INT AUTO_INCREMENT PRIMARY KEY,
    id_reserva INT NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    tipo_sesion ENUM('Entrevista', 'Práctica', 'Evaluación', 'Supervisión', 'Otro') DEFAULT 'Entrevista',
    fecha_realizacion DATE,
    estado ENUM('Programada', 'Realizada', 'Cancelada') DEFAULT 'Programada',

    FOREIGN KEY (id_reserva) REFERENCES reservas(id_reserva)
);


-- ============================================================
-- GRABACIONES DE LAS SESIONES
-- ============================================================
-- Se guarda el docente o usuario que subió la grabación.

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


-- ============================================================
-- ETIQUETAS PARA GRABACIONES
-- ============================================================

CREATE TABLE etiquetas (
    id_etiqueta INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);


-- ============================================================
-- RELACIÓN GRABACIONES - ETIQUETAS
-- ============================================================

CREATE TABLE grabaciones_etiquetas (
    id_grabacion INT NOT NULL,
    id_etiqueta INT NOT NULL,

    PRIMARY KEY (id_grabacion, id_etiqueta),

    FOREIGN KEY (id_grabacion) REFERENCES grabaciones(id_grabacion) ON DELETE CASCADE,
    FOREIGN KEY (id_etiqueta) REFERENCES etiquetas(id_etiqueta) ON DELETE CASCADE
);


-- ============================================================
-- ETIQUETAS PREDEFINIDAS
-- ============================================================

INSERT IGNORE INTO etiquetas (nombre) VALUES
('Evaluación'),
('Terapia familiar'),
('Práctica supervisada'),
('Entrevista clínica'),
('Seguimiento'),
('Supervisión'),
('Otro');


-- ============================================================
-- OBSERVACIONES SOBRE GRABACIONES
-- ============================================================

CREATE TABLE observaciones (
    id_observacion INT AUTO_INCREMENT PRIMARY KEY,
    id_grabacion INT NOT NULL,
    id_usuario INT NOT NULL,
    observacion TEXT NOT NULL,
    minuto_video VARCHAR(20),
    fecha_observacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_grabacion) REFERENCES grabaciones(id_grabacion),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);