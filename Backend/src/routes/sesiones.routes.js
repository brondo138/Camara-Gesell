const express = require('express');
const {
    obtenerSesiones,
    obtenerSesionPorId,
    crearSesion,
    actualizarSesion,
    cambiarEstadoSesion,
    eliminarSesion          // ✅ importa junto con los demás
} = require('../controllers/sesiones.controller');

const router = express.Router();  // ✅ declara router primero

router.get('/',                 obtenerSesiones);
router.get('/:id',              obtenerSesionPorId);
router.post('/',                crearSesion);
router.put('/:id',              actualizarSesion);
router.patch('/:id/estado',     cambiarEstadoSesion);
router.delete('/:id',           eliminarSesion);  // ✅ úsalo después

module.exports = router;