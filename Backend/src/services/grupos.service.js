const GruposRepository = require('../repositories/grupos.repository');

const GruposService = {
    async obtenerTodos() {
        return await GruposRepository.obtenerTodos();
    },

    async obtenerPorId(id_grupo) {
        const grupo = await GruposRepository.obtenerPorId(id_grupo);

        if (!grupo) {
            throw {
                status: 404,
                message: 'Grupo no encontrado'
            };
        }

        return grupo;
    },

    async crearGrupo(data) {
        const {
            nombre,
            descripcion,
            id_docente_responsable
        } = data;

        if (!nombre || !id_docente_responsable) {
            throw {
                status: 400,
                message: 'El nombre y el docente responsable son obligatorios'
            };
        }

        const docente = await GruposRepository.obtenerUsuarioPorId(id_docente_responsable);

        if (!docente) {
            throw {
                status: 404,
                message: 'El docente responsable no existe'
            };
        }

        if (docente.nombre_rol !== 'Docente') {
            throw {
                status: 400,
                message: 'El usuario asignado como responsable debe tener rol Docente'
            };
        }

        const grupoCreado = await GruposRepository.crearGrupo({
            nombre,
            descripcion: descripcion || null,
            id_docente_responsable
        });

        await GruposRepository.asignarUsuarioGrupo(
            grupoCreado.id_grupo,
            id_docente_responsable,
            'Docente'
        );

        return grupoCreado;
    },

    async actualizarGrupo(id_grupo, data) {
        const grupoExiste = await GruposRepository.obtenerPorId(id_grupo);

        if (!grupoExiste) {
            throw {
                status: 404,
                message: 'Grupo no encontrado'
            };
        }

        const {
            nombre,
            descripcion,
            id_docente_responsable,
            activo
        } = data;

        if (!nombre || !id_docente_responsable) {
            throw {
                status: 400,
                message: 'El nombre y el docente responsable son obligatorios'
            };
        }

        const docente = await GruposRepository.obtenerUsuarioPorId(id_docente_responsable);

        if (!docente) {
            throw {
                status: 404,
                message: 'El docente responsable no existe'
            };
        }

        if (docente.nombre_rol !== 'Docente') {
            throw {
                status: 400,
                message: 'El usuario responsable debe tener rol Docente'
            };
        }

        const filasAfectadas = await GruposRepository.actualizarGrupo(id_grupo, {
            nombre,
            descripcion: descripcion || null,
            id_docente_responsable,
            activo: activo ?? true
        });

        if (filasAfectadas === 0) {
            throw {
                status: 400,
                message: 'No se pudo actualizar el grupo'
            };
        }

        const yaEstaAsignado = await GruposRepository.usuarioYaEstaEnGrupo(
            id_grupo,
            id_docente_responsable
        );

        if (!yaEstaAsignado) {
            await GruposRepository.asignarUsuarioGrupo(
                id_grupo,
                id_docente_responsable,
                'Docente'
            );
        }

        return await GruposRepository.obtenerPorId(id_grupo);
    },

    async eliminarGrupo(id_grupo) {
        const grupoExiste = await GruposRepository.obtenerPorId(id_grupo);

        if (!grupoExiste) {
            throw {
                status: 404,
                message: 'Grupo no encontrado'
            };
        }

        const filasAfectadas = await GruposRepository.eliminarGrupo(id_grupo);

        if (filasAfectadas === 0) {
            throw {
                status: 400,
                message: 'No se pudo eliminar el grupo'
            };
        }

        return {
            message: 'Grupo eliminado correctamente'
        };
    },

    async obtenerUsuariosGrupo(id_grupo) {
        const grupoExiste = await GruposRepository.obtenerPorId(id_grupo);

        if (!grupoExiste) {
            throw {
                status: 404,
                message: 'Grupo no encontrado'
            };
        }

        return await GruposRepository.obtenerUsuariosGrupo(id_grupo);
    },

    async asignarUsuarioGrupo(id_grupo, data) {
        const {
            id_usuario,
            rol_en_grupo
        } = data;

        if (!id_usuario || !rol_en_grupo) {
            throw {
                status: 400,
                message: 'El usuario y el rol dentro del grupo son obligatorios'
            };
        }

        if (!['Docente', 'Practicante'].includes(rol_en_grupo)) {
            throw {
                status: 400,
                message: 'El rol dentro del grupo debe ser Docente o Practicante'
            };
        }

        const grupoExiste = await GruposRepository.obtenerPorId(id_grupo);

        if (!grupoExiste) {
            throw {
                status: 404,
                message: 'Grupo no encontrado'
            };
        }

        const usuario = await GruposRepository.obtenerUsuarioPorId(id_usuario);

        if (!usuario) {
            throw {
                status: 404,
                message: 'Usuario no encontrado'
            };
        }

        if (usuario.nombre_rol === 'Administrador') {
            throw {
                status: 400,
                message: 'No se pueden asignar administradores a un grupo'
            };
        }

        if (usuario.nombre_rol !== rol_en_grupo) {
            throw {
                status: 400,
                message: `El usuario tiene rol ${usuario.nombre_rol}, no puede asignarse como ${rol_en_grupo}`
            };
        }

        const yaEstaAsignado = await GruposRepository.usuarioYaEstaEnGrupo(id_grupo, id_usuario);

        if (yaEstaAsignado) {
            throw {
                status: 400,
                message: 'El usuario ya pertenece a este grupo'
            };
        }

        await GruposRepository.asignarUsuarioGrupo(id_grupo, id_usuario, rol_en_grupo);

        return {
            message: 'Usuario asignado al grupo correctamente'
        };
    },

    async quitarUsuarioGrupo(id_grupo, id_usuario) {
        const grupoExiste = await GruposRepository.obtenerPorId(id_grupo);

        if (!grupoExiste) {
            throw {
                status: 404,
                message: 'Grupo no encontrado'
            };
        }

        const grupoResponsable = await GruposRepository.obtenerGrupoPorDocenteResponsable(id_grupo);

        if (grupoResponsable.id_docente_responsable === Number(id_usuario)) {
            throw {
                status: 400,
                message: 'No se puede quitar al docente responsable del grupo'
            };
        }

        const filasAfectadas = await GruposRepository.quitarUsuarioGrupo(id_grupo, id_usuario);

        if (filasAfectadas === 0) {
            throw {
                status: 404,
                message: 'El usuario no pertenece a este grupo'
            };
        }

        return {
            message: 'Usuario removido del grupo correctamente'
        };
    }
};

module.exports = GruposService;