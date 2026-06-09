const GruposService = require('../services/grupos.service');

const GruposController = {
    async obtenerTodos(req, res) {
        try {
            const grupos = await GruposService.obtenerTodos(req.query);

            res.json({
                success: true,
                data: grupos
            });
        } catch (error) {
            res.status(error.status || 500).json({
                success: false,
                message: error.message || 'Error al obtener los grupos'
            });
        }
    },

    async obtenerPorId(req, res) {
        try {
            const { id } = req.params;

            const grupo = await GruposService.obtenerPorId(id);

            res.json({
                success: true,
                data: grupo
            });
        } catch (error) {
            res.status(error.status || 500).json({
                success: false,
                message: error.message || 'Error al obtener el grupo'
            });
        }
    },

    async crearGrupo(req, res) {
        try {
            const grupoCreado = await GruposService.crearGrupo(req.body);

            res.status(201).json({
                success: true,
                message: 'Grupo creado correctamente',
                data: grupoCreado
            });
        } catch (error) {
            res.status(error.status || 500).json({
                success: false,
                message: error.message || 'Error al crear el grupo'
            });
        }
    },

    async actualizarGrupo(req, res) {
        try {
            const { id } = req.params;

            const grupoActualizado = await GruposService.actualizarGrupo(id, req.body);

            res.json({
                success: true,
                message: 'Grupo actualizado correctamente',
                data: grupoActualizado
            });
        } catch (error) {
            res.status(error.status || 500).json({
                success: false,
                message: error.message || 'Error al actualizar el grupo'
            });
        }
    },

    async eliminarGrupo(req, res) {
        try {
            const { id } = req.params;

            const resultado = await GruposService.eliminarGrupo(id);

            res.json({
                success: true,
                message: resultado.message
            });
        } catch (error) {
            res.status(error.status || 500).json({
                success: false,
                message: error.message || 'Error al eliminar el grupo'
            });
        }
    },

    async obtenerUsuariosGrupo(req, res) {
        try {
            const { id } = req.params;

            const usuarios = await GruposService.obtenerUsuariosGrupo(id);

            res.json({
                success: true,
                data: usuarios
            });
        } catch (error) {
            res.status(error.status || 500).json({
                success: false,
                message: error.message || 'Error al obtener los usuarios del grupo'
            });
        }
    },

    async asignarUsuarioGrupo(req, res) {
        try {
            const { id } = req.params;

            const resultado = await GruposService.asignarUsuarioGrupo(id, req.body);

            res.status(201).json({
                success: true,
                message: resultado.message
            });
        } catch (error) {
            res.status(error.status || 500).json({
                success: false,
                message: error.message || 'Error al asignar usuario al grupo'
            });
        }
    },

    async quitarUsuarioGrupo(req, res) {
        try {
            const { id, idUsuario } = req.params;

            const resultado = await GruposService.quitarUsuarioGrupo(id, idUsuario);

            res.json({
                success: true,
                message: resultado.message
            });
        } catch (error) {
            res.status(error.status || 500).json({
                success: false,
                message: error.message || 'Error al quitar usuario del grupo'
            });
        }
    }
};

module.exports = GruposController;
