const express = require('express');
const {
    obtenerCamaras,
    obtenerCamaraPorId,
    crearCamara,
    actualizarCamara,
    cambiarEstadoCamara,
    eliminarCamara
} = require('../controllers/camaras.controller');

const router = express.Router();

router.get('/',         obtenerCamaras);
router.get('/:id',      obtenerCamaraPorId);
router.post('/',        crearCamara);
router.put('/:id',      actualizarCamara);
router.patch('/:id/estado', cambiarEstadoCamara);
router.delete('/:id',   eliminarCamara);

module.exports = router;