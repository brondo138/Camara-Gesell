const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authRepository = require('../repositories/auth.repository');
const env = require('../config/env');

const login = async (correo, contrasena) => {
    if (!correo || !contrasena) {
        const error = new Error('El correo y la contraseña son obligatorios');
        error.statusCode = 400;
        throw error;
    }

    const usuario = await authRepository.buscarUsuarioPorCorreo(correo);

    if (!usuario) {
        const error = new Error('Credenciales incorrectas');
        error.statusCode = 401;
        throw error;
    }

    if (!usuario.activo) {
        const error = new Error('El usuario está inactivo');
        error.statusCode = 403;
        throw error;
    }

    const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);

    if (!contrasenaValida) {
        const error = new Error('Credenciales incorrectas');
        error.statusCode = 401;
        throw error;
    }

    const payload = {
        id_usuario: usuario.id_usuario,
        correo:     usuario.correo,
        id_rol:     usuario.id_rol,
        nombre_rol: usuario.nombre_rol
    };

    const token = jwt.sign(payload, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN
    });

    return {
        usuario: {
            id_usuario: usuario.id_usuario,
            nombre:     usuario.nombre,
            apellido:   usuario.apellido,
            correo:     usuario.correo,
            id_rol:     usuario.id_rol,
            nombre_rol: usuario.nombre_rol
        },
        token
    };
};

module.exports = { login };