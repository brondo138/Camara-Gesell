const express = require('express');
const {
    obtenerReservas,
    obtenerReservaPorId,
    crearReserva,
    cambiarEstadoReserva,
    eliminarReserva
} = require('../controllers/reservas.controller');

const router = express.Router();

router.get('/',             obtenerReservas);
router.get('/:id',          obtenerReservaPorId);
router.post('/',            crearReserva);
router.patch('/:id/estado', cambiarEstadoReserva);
router.delete('/:id',       eliminarReserva);

module.exports = router;