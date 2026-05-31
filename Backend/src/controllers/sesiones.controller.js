const sesionesService = require('../services/sesiones.service');

const obtenerSesiones = async (req, res) => {
    try {
        const { id_usuario, id_rol } = req.query;
        const sesiones = await sesionesService.obtenerSesiones(id_usuario, id_rol);
        res.json({
            success: true,
            message: 'Sesiones obtenidas correctamente',
            data: sesiones
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Error interno del servidor'
        });
    }
};

const obtenerSesionPorId = async (req, res) => {
    try {
        const sesion = await sesionesService.obtenerSesionPorId(req.params.id);
        res.json({
            success: true,
            message: 'Sesión obtenida correctamente',
            data: sesion
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Error interno del servidor'
        });
    }
};

const crearSesion = async (req, res) => {
    try {
        const sesion = await sesionesService.crearSesion(req.body);
        res.status(201).json({
            success: true,
            message: 'Sesión creada correctamente',
            data: sesion
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Error interno del servidor'
        });
    }
};

const actualizarSesion = async (req, res) => {
    try {
        const sesion = await sesionesService.actualizarSesion(req.params.id, req.body);
        res.json({
            success: true,
            message: 'Sesión actualizada correctamente',
            data: sesion
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Error interno del servidor'
        });
    }
};

const cambiarEstadoSesion = async (req, res) => {
    try {
        const sesion = await sesionesService.cambiarEstadoSesion(
            req.params.id,
            req.body.estado
        );
        res.json({
            success: true,
            message: 'Estado de la sesión actualizado correctamente',
            data: sesion
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Error interno del servidor'
        });
    }
};

module.exports = {
    obtenerSesiones,
    obtenerSesionPorId,
    crearSesion,
    actualizarSesion,
    cambiarEstadoSesion
};