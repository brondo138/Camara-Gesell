const usuariosService = require('../services/usuarios.service');

const obtenerUsuarios = async (req, res) => {
    try {
        const usuarios = await usuariosService.obtenerUsuarios();

        res.json({
            success: true,
            message: 'Usuarios obtenidos correctamente',
            data: usuarios
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Error interno del servidor'
        });
    }
};

const obtenerUsuarioPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const usuario = await usuariosService.obtenerUsuarioPorId(id);

        res.json({
            success: true,
            message: 'Usuario obtenido correctamente',
            data: usuario
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Error interno del servidor'
        });
    }
};

const crearUsuario = async (req, res) => {
    try {
        const usuario = await usuariosService.crearUsuario(req.body);

        res.status(201).json({
            success: true,
            message: 'Usuario creado correctamente',
            data: usuario
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Error interno del servidor'
        });
    }
};

const actualizarUsuario = async (req, res) => {
    try {
        const { id } = req.params;

        const usuario = await usuariosService.actualizarUsuario(id, req.body);

        res.json({
            success: true,
            message: 'Usuario actualizado correctamente',
            data: usuario
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Error interno del servidor'
        });
    }
};

const actualizarContrasena = async (req, res) => {
    try {
        const { id } = req.params;
        const { nuevaContrasena } = req.body;

        const resultado = await usuariosService.actualizarContrasena(id, nuevaContrasena);

        res.json({
            success: true,
            message: resultado.mensaje,
            data: resultado
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Error interno del servidor'
        });
    }
};

const eliminarUsuario = async (req, res) => {
    try {
        const { id } = req.params;

        const resultado = await usuariosService.eliminarUsuario(id);

        res.json({
            success: true,
            message: resultado.mensaje,
            data: resultado
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Error interno del servidor'
        });
    }
};

module.exports = {
    obtenerUsuarios,
    obtenerUsuarioPorId,
    crearUsuario,
    actualizarUsuario,
    actualizarContrasena,
    eliminarUsuario
};