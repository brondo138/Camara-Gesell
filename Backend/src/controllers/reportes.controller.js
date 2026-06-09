const reportesService = require('../services/reportes.service');

const obtenerResumen = async (req, res) => {
    try {
        const data = await reportesService.obtenerResumen(req.query)
        res.json({ success: true, message: 'Resumen obtenido correctamente', data })
    } catch (error) {
        res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Error interno del servidor' })
    }
}

const obtenerUsoSalas = async (req, res) => {
    try {
        const data = await reportesService.obtenerUsoSalas(req.query)
        res.json({ success: true, message: 'Uso de salas obtenido correctamente', data })
    } catch (error) {
        res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Error interno del servidor' })
    }
}

const obtenerEstados = async (req, res) => {
    try {
        const data = await reportesService.obtenerEstados(req.query)
        res.json({ success: true, message: 'Estados obtenidos correctamente', data })
    } catch (error) {
        res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Error interno del servidor' })
    }
}

const obtenerActividadDocentes = async (req, res) => {
    try {
        const data = await reportesService.obtenerActividadDocentes(req.query)
        res.json({ success: true, message: 'Actividad docente obtenida correctamente', data })
    } catch (error) {
        res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Error interno del servidor' })
    }
}

const obtenerDetalle = async (req, res) => {
    try {
        const data = await reportesService.obtenerDetalle(req.query)
        res.json({ success: true, message: 'Detalle obtenido correctamente', data })
    } catch (error) {
        res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Error interno del servidor' })
    }
}

module.exports = {
    obtenerResumen,
    obtenerUsoSalas,
    obtenerEstados,
    obtenerActividadDocentes,
    obtenerDetalle
}