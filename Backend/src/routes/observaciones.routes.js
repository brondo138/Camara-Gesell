const express = require('express');

const {
    obtenerObservaciones,
    obtenerObservacionPorId,
    crearObservacion,
    actualizarObservacion,
    eliminarObservacion
} = require('../controllers/observaciones.controller');

const router = express.Router();

router.get('/', obtenerObservaciones);
router.get('/:id', obtenerObservacionPorId);
router.post('/', crearObservacion);
router.put('/:id', actualizarObservacion);
router.delete('/:id', eliminarObservacion);

module.exports = router;