const grabacionesService = require('../services/grabaciones.service');

const obtenerGrabaciones = async (req, res) => {
    try {
        const { id_usuario, id_rol } = req.query;
        const grabaciones = await grabacionesService.obtenerGrabaciones(id_usuario, id_rol);
        res.json({ success: true, message: 'Grabaciones obtenidas correctamente', data: grabaciones });
    } catch (error) {
        res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Error interno del servidor' });
    }
};

const obtenerGrabacionPorId = async (req, res) => {
    try {
        const grabacion = await grabacionesService.obtenerGrabacionPorId(req.params.id);
        res.json({ success: true, message: 'Grabación obtenida correctamente', data: grabacion });
    } catch (error) {
        res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Error interno del servidor' });
    }
};

const obtenerGrabacionesPorSesion = async (req, res) => {
    try {
        const { id_usuario, id_rol } = req.query;

        const grabaciones = await grabacionesService.obtenerGrabacionesPorSesion(
            req.params.id_sesion,
            id_usuario,
            id_rol
        );

        res.json({
            success: true,
            message: 'Grabaciones de sesión obtenidas correctamente',
            data: grabaciones
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Error interno del servidor'
        });
    }
};

const obtenerEtiquetas = async (req, res) => {
    try {
        const etiquetas = await grabacionesService.obtenerEtiquetas();
        res.json({ success: true, message: 'Etiquetas obtenidas correctamente', data: etiquetas });
    } catch (error) {
        res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Error interno del servidor' });
    }
};

const crearGrabacion = async (req, res) => {
    try {
        const grabacion = await grabacionesService.crearGrabacion(req.body);
        res.status(201).json({ success: true, message: 'Grabación creada correctamente', data: grabacion });
    } catch (error) {
        res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Error interno del servidor' });
    }
};

const actualizarGrabacion = async (req, res) => {
    try {
        const grabacion = await grabacionesService.actualizarGrabacion(req.params.id, req.body);
        res.json({ success: true, message: 'Grabación actualizada correctamente', data: grabacion });
    } catch (error) {
        res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Error interno del servidor' });
    }
};

const cambiarVisibilidad = async (req, res) => {
    try {
        const grabacion = await grabacionesService.cambiarVisibilidad(
            req.params.id,
            req.body.visible,
            req.body.id_usuario,
            req.body.id_rol
        );

        res.json({
            success: true,
            message: 'Visibilidad actualizada correctamente',
            data: grabacion
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Error interno del servidor'
        });
    }
};

const eliminarGrabacion = async (req, res) => {
    try {
        const resultado = await grabacionesService.eliminarGrabacion(
            req.params.id,
            req.body.id_usuario,
            req.body.id_rol
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
    obtenerGrabaciones,
    obtenerGrabacionPorId,
    obtenerGrabacionesPorSesion,
    obtenerEtiquetas,
    crearGrabacion,
    actualizarGrabacion,
    cambiarVisibilidad,
    eliminarGrabacion
};