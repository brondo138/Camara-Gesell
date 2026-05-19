const express = require('express');
const usuariosController = require('../controllers/usuarios.controller');

const router = express.Router();

router.get('/', usuariosController.obtenerUsuarios);

router.get('/:id', usuariosController.obtenerUsuarioPorId);

router.post('/', usuariosController.crearUsuario);

router.put('/:id', usuariosController.actualizarUsuario);

router.patch('/:id/contrasena', usuariosController.actualizarContrasena);

router.delete('/:id', usuariosController.eliminarUsuario);

module.exports = router;