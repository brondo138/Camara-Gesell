CREATE DATABASE gesell;
USE gesell;

-- Roles del sistema
CREATE TABLE roles (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO roles (nombre_rol) VALUES
('Administrador'),
('Docente'),
('Practicante');

-- Usuarios del sistema
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

-- Camaras de la universidad
CREATE TABLE camaras_gesell (
    id_camara INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    ubicacion VARCHAR(150),
    descripcion TEXT,
    activa BOOLEAN DEFAULT TRUE
);

-- Reservas para la camara 
CREATE TABLE reservas (
    id_reserva INT AUTO_INCREMENT PRIMARY KEY,
    id_camara INT NOT NULL,
    id_usuario_solicitante INT NOT NULL,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    motivo VARCHAR(255),
    estado ENUM('Pendiente', 'Aprobada', 'Rechazada', 'Cancelada', 'Finalizada') DEFAULT 'Pendiente',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_camara) REFERENCES camaras_gesell(id_camara),
    FOREIGN KEY (id_usuario_solicitante) REFERENCES usuarios(id_usuario)
);

-- Sesiones de la camara
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

-- Grabaciones de la sesiones
CREATE TABLE grabaciones (
    id_grabacion INT AUTO_INCREMENT PRIMARY KEY,
    id_sesion INT NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    url_video TEXT NOT NULL,
    descripcion TEXT,
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    visible BOOLEAN DEFAULT TRUE,

    FOREIGN KEY (id_sesion) REFERENCES sesiones(id_sesion)
);

-- observacion sobre la grabacion
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