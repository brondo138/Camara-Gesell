const observacionesService = require('../services/observaciones.service');

const obtenerObservaciones = async (req, res) => {
    try {
        const { id_sesion, id_usuario, id_rol } = req.query;

        const observaciones = await observacionesService.obtenerObservaciones(
            id_sesion,
            id_usuario,
            id_rol
        );

        res.json({
            success: true,
            message: 'Observaciones obtenidas correctamente',
            data: observaciones
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Error interno del servidor'
        });
    }
};

const obtenerObservacionPorId = async (req, res) => {
    try {
        const observacion = await observacionesService.obtenerObservacionPorId(req.params.id);

        res.json({
            success: true,
            message: 'Observación obtenida correctamente',
            data: observacion
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Error interno del servidor'
        });
    }
};

const crearObservacion = async (req, res) => {
    try {
        const observacion = await observacionesService.crearObservacion(req.body);

        res.status(201).json({
            success: true,
            message: 'Observación creada correctamente',
            data: observacion
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Error interno del servidor'
        });
    }
};

const actualizarObservacion = async (req, res) => {
    try {
        const observacion = await observacionesService.actualizarObservacion(
            req.params.id,
            req.body
        );

        res.json({
            success: true,
            message: 'Observación actualizada correctamente',
            data: observacion
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Error interno del servidor'
        });
    }
};

const eliminarObservacion = async (req, res) => {
    try {
        const { id_usuario, id_rol } = req.body;

        const resultado = await observacionesService.eliminarObservacion(
            req.params.id,
            id_usuario,
            id_rol
        );

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
    obtenerObservaciones,
    obtenerObservacionPorId,
    crearObservacion,
    actualizarObservacion,
    eliminarObservacion
};