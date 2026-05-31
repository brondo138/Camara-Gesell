const express = require('express');
const {
    obtenerSesiones,
    obtenerSesionPorId,
    crearSesion,
    actualizarSesion,
    cambiarEstadoSesion
} = require('../controllers/sesiones.controller');

const router = express.Router();

router.get('/',                 obtenerSesiones);
router.get('/:id',              obtenerSesionPorId);
router.post('/',                crearSesion);
router.put('/:id',              actualizarSesion);
router.patch('/:id/estado',     cambiarEstadoSesion);

module.exports = router;