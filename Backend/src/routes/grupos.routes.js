const express = require('express');
const router = express.Router();

const GruposController = require('../controllers/grupos.controller');

router.get('/', GruposController.obtenerTodos);
router.get('/:id', GruposController.obtenerPorId);
router.post('/', GruposController.crearGrupo);
router.put('/:id', GruposController.actualizarGrupo);
router.delete('/:id', GruposController.eliminarGrupo);

router.get('/:id/usuarios', GruposController.obtenerUsuariosGrupo);
router.post('/:id/usuarios', GruposController.asignarUsuarioGrupo);
router.delete('/:id/usuarios/:idUsuario', GruposController.quitarUsuarioGrupo);

module.exports = router;