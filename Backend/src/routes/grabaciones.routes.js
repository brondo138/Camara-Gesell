const express = require('express');
const {
    obtenerGrabaciones,
    obtenerGrabacionPorId,
    obtenerGrabacionesPorSesion,
    obtenerEtiquetas,
    crearGrabacion,
    actualizarGrabacion,
    cambiarVisibilidad,
    eliminarGrabacion
} = require('../controllers/grabaciones.controller');

const router = express.Router();

router.get('/',                         obtenerGrabaciones);
router.get('/etiquetas',                obtenerEtiquetas);
router.get('/sesion/:id_sesion',        obtenerGrabacionesPorSesion);
router.get('/:id',                      obtenerGrabacionPorId);
router.post('/',                        crearGrabacion);
router.put('/:id',                      actualizarGrabacion);
router.patch('/:id/visibilidad',        cambiarVisibilidad);
router.delete('/:id',                   eliminarGrabacion);

module.exports = router;