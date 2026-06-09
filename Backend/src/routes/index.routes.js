const express = require('express');
const authRoutes = require('./auth.routes');
const usuariosRoutes = require('./usuarios.routes');
const camarasRoutes = require('./camaras.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/usuarios', usuariosRoutes);
router.use('/camaras', camarasRoutes);

module.exports = router;
