const express = require('express');
const {
    obtenerResumen,
    obtenerUsoSalas,
    obtenerEstados,
    obtenerActividadDocentes,
    obtenerDetalle
} = require('../controllers/reportes.controller');

const router = express.Router();

router.get('/resumen',   obtenerResumen);
router.get('/salas',     obtenerUsoSalas);
router.get('/estados',   obtenerEstados);
router.get('/docentes',  obtenerActividadDocentes);
router.get('/detalle',   obtenerDetalle);

module.exports = router;