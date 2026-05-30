const reservasService = require('../services/reservas.service');

const obtenerReservas = async (req, res) => {
    try {
        // id_usuario e id_rol vienen como query params para filtrar por rol
        const { id_usuario, id_rol } = req.query;
        const reservas = await reservasService.obtenerReservas(id_usuario, id_rol);
        res.json({
            success: true,
            message: 'Reservas obtenidas correctamente',
            data: reservas
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Error interno del servidor'
        });
    }
};

const obtenerReservaPorId = async (req, res) => {
    try {
        const reserva = await reservasService.obtenerReservaPorId(req.params.id);
        res.json({
            success: true,
            message: 'Reserva obtenida correctamente',
            data: reserva
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Error interno del servidor'
        });
    }
};

const crearReserva = async (req, res) => {
    try {
        // id_usuario_solicitante viene en el body desde el frontend
        const reserva = await reservasService.crearReserva(req.body);
        res.status(201).json({
            success: true,
            message: 'Reserva creada correctamente',
            data: reserva
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Error interno del servidor'
        });
    }
};

const cambiarEstadoReserva = async (req, res) => {
    try {
        const reserva = await reservasService.cambiarEstadoReserva(
            req.params.id,
            req.body.estado
        );
        res.json({
            success: true,
            message: 'Estado de la reserva actualizado correctamente',
            data: reserva
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Error interno del servidor'
        });
    }
};

const eliminarReserva = async (req, res) => {
    try {
        const resultado = await reservasService.eliminarReserva(req.params.id);
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
    obtenerReservas,
    obtenerReservaPorId,
    crearReserva,
    cambiarEstadoReserva,
    eliminarReserva
};