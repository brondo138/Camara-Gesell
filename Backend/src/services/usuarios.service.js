const bcrypt = require('bcryptjs');
const usuariosRepository = require('../repositories/usuarios.repository');

const obtenerUsuarios = async () => {
    return await usuariosRepository.obtenerUsuarios();
};

const obtenerUsuarioPorId = async (id_usuario) => {
    const usuario = await usuariosRepository.obtenerUsuarioPorId(id_usuario);

    if (!usuario) {
        const error = new Error('Usuario no encontrado');
        error.statusCode = 404;
        throw error;
    }

    return usuario;
};

const crearUsuario = async (datosUsuario) => {
    const { nombre, apellido, correo, contrasena, id_rol } = datosUsuario;

    if (!nombre || !apellido || !correo || !contrasena || !id_rol) {
        const error = new Error('Todos los campos son obligatorios');
        error.statusCode = 400;
        throw error;
    }

    const usuarioExistente = await usuariosRepository.obtenerUsuarioPorCorreo(correo);

    if (usuarioExistente) {
        const error = new Error('El correo ya está registrado');
        error.statusCode = 409;
        throw error;
    }

    const contrasenaEncriptada = await bcrypt.hash(contrasena, 10);

    const nuevoUsuario = {
        nombre,
        apellido,
        correo,
        contrasena: contrasenaEncriptada,
        id_rol
    };

    const id_usuario = await usuariosRepository.crearUsuario(nuevoUsuario);

    return await usuariosRepository.obtenerUsuarioPorId(id_usuario);
};

const actualizarUsuario = async (id_usuario, datosUsuario) => {
    const { nombre, apellido, correo, id_rol, activo } = datosUsuario;

    if (!nombre || !apellido || !correo || !id_rol || activo === undefined) {
        const error = new Error('Todos los campos son obligatorios');
        error.statusCode = 400;
        throw error;
    }

    const usuarioActual = await usuariosRepository.obtenerUsuarioPorId(id_usuario);

    if (!usuarioActual) {
        const error = new Error('Usuario no encontrado');
        error.statusCode = 404;
        throw error;
    }

    const usuarioConCorreo = await usuariosRepository.obtenerUsuarioPorCorreo(correo);

    if (usuarioConCorreo && usuarioConCorreo.id_usuario !== Number(id_usuario)) {
        const error = new Error('El correo ya está registrado por otro usuario');
        error.statusCode = 409;
        throw error;
    }

    const usuarioActualizado = {
        nombre,
        apellido,
        correo,
        id_rol,
        activo
    };

    await usuariosRepository.actualizarUsuario(id_usuario, usuarioActualizado);

    return await usuariosRepository.obtenerUsuarioPorId(id_usuario);
};

const actualizarContrasena = async (id_usuario, nuevaContrasena) => {
    if (!nuevaContrasena) {
        const error = new Error('La nueva contraseña es obligatoria');
        error.statusCode = 400;
        throw error;
    }

    const usuario = await usuariosRepository.obtenerUsuarioPorId(id_usuario);

    if (!usuario) {
        const error = new Error('Usuario no encontrado');
        error.statusCode = 404;
        throw error;
    }

    const contrasenaEncriptada = await bcrypt.hash(nuevaContrasena, 10);

    await usuariosRepository.actualizarContrasena(id_usuario, contrasenaEncriptada);

    return {
        id_usuario: Number(id_usuario),
        mensaje: 'Contraseña actualizada correctamente'
    };
};

const eliminarUsuario = async (id_usuario) => {
    const usuario = await obtenerUsuarioPorId(id_usuario); // ya valida 404

    const enGrupo = await usuariosRepository.perteneceAGrupoActivo(id_usuario);
    if (enGrupo) {
        const error = new Error(
            'No se puede eliminar el usuario porque pertenece a un grupo activo. ' +
            'Retíralo del grupo primero.'
        );
        error.statusCode = 409;
        throw error;
    }

    await usuariosRepository.eliminarUsuario(id_usuario);
    return { id_usuario, mensaje: 'Usuario eliminado correctamente' };
};

module.exports = {
    obtenerUsuarios,
    obtenerUsuarioPorId,
    crearUsuario,
    actualizarUsuario,
    actualizarContrasena,
    eliminarUsuario
};