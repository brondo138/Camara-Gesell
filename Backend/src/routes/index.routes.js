const express = require('express');
const authRoutes        = require('./auth.routes');
const usuariosRoutes    = require('./usuarios.routes');
const camarasRoutes     = require('./camaras.routes');
const reservasRoutes    = require('./reservas.routes');
const sesionesRoutes    = require('./sesiones.routes');
const grabacionesRoutes = require('./grabaciones.routes');

const router = express.Router();

router.use('/auth',        authRoutes);
router.use('/usuarios',    usuariosRoutes);
router.use('/camaras',     camarasRoutes);
router.use('/reservas',    reservasRoutes);
router.use('/sesiones',    sesionesRoutes);
router.use('/grabaciones', grabacionesRoutes);

module.exports = router;