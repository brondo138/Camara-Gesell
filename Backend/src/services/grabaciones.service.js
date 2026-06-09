const grabacionesRepository = require('../repositories/grabaciones.repository');

const obtenerGrabaciones = async (id_usuario, id_rol) => {
    // Admin ve todas las grabaciones.
    // Docentes y practicantes ven grabaciones visibles de los grupos donde pertenecen.
    if (parseInt(id_rol) === 1) {
        const grabaciones = await grabacionesRepository.obtenerGrabaciones();
        return await _adjuntarEtiquetas(grabaciones);
    }

    if (!id_usuario) {
        const error = new Error('El id_usuario es obligatorio');
        error.statusCode = 400;
        throw error;
    }

    const grabaciones = await grabacionesRepository.obtenerGrabacionesPorUsuario(id_usuario);
    return await _adjuntarEtiquetas(grabaciones);
};

const obtenerGrabacionPorId = async (id_grabacion) => {
    const grabacion = await grabacionesRepository.obtenerGrabacionPorId(id_grabacion);

    if (!grabacion) {
        const error = new Error('La grabación no existe');
        error.statusCode = 404;
        throw error;
    }

    const etiquetas = await grabacionesRepository.obtenerEtiquetasPorGrabacion(id_grabacion);

    return {
        ...grabacion,
        etiquetas
    };
};

const obtenerGrabacionesPorSesion = async (id_sesion, id_usuario, id_rol) => {
    let grabaciones;

    if (parseInt(id_rol) === 1) {
        grabaciones = await grabacionesRepository.obtenerGrabacionesPorSesion(id_sesion);
    } else {
        if (!id_usuario) {
            const error = new Error('El id_usuario es obligatorio');
            error.statusCode = 400;
            throw error;
        }

        grabaciones = await grabacionesRepository.obtenerGrabacionesPorSesionYUsuario(
            id_sesion,
            id_usuario
        );
    }

    return await _adjuntarEtiquetas(grabaciones);
};

const obtenerEtiquetas = async () => {
    return await grabacionesRepository.obtenerEtiquetas();
};

const crearGrabacion = async (body) => {
    const {
        id_sesion,
        id_usuario_subio,
        id_rol,
        titulo,
        url_video,
        descripcion,
        visible,
        etiquetas
    } = body;

    if (!id_sesion) {
        const error = new Error('id_sesion es obligatorio');
        error.statusCode = 400;
        throw error;
    }

    if (!id_usuario_subio) {
        const error = new Error('id_usuario_subio es obligatorio');
        error.statusCode = 400;
        throw error;
    }

    if (!titulo || !titulo.trim()) {
        const error = new Error('El título es obligatorio');
        error.statusCode = 400;
        throw error;
    }

    if (!url_video || !url_video.trim()) {
        const error = new Error('La URL del video es obligatoria');
        error.statusCode = 400;
        throw error;
    }

    const sesion = await grabacionesRepository.obtenerSesionPorId(id_sesion);

    if (!sesion) {
        const error = new Error('La sesión no existe');
        error.statusCode = 404;
        throw error;
    }

    if (sesion.estado === 'Cancelada') {
        const error = new Error('No se pueden subir grabaciones a una sesión cancelada');
        error.statusCode = 400;
        throw error;
    }

    if (parseInt(id_rol) !== 1) {
        const pertenece = await grabacionesRepository.usuarioPerteneceAlGrupoDeSesion(
            id_usuario_subio,
            id_sesion
        );

        if (!pertenece) {
            const error = new Error('El usuario no pertenece al grupo de esta sesión');
            error.statusCode = 403;
            throw error;
        }
    }

    const insertId = await grabacionesRepository.crearGrabacion({
        id_sesion,
        id_usuario_subio,
        titulo: titulo.trim(),
        url_video: url_video.trim(),
        descripcion: descripcion?.trim() || null,
        visible: visible !== undefined ? visible : 1
    });

    if (Array.isArray(etiquetas)) {
        await grabacionesRepository.sincronizarEtiquetas(insertId, etiquetas);
    }

    return await obtenerGrabacionPorId(insertId);
};

const actualizarGrabacion = async (id_grabacion, body) => {
    const {
        id_usuario,
        id_rol,
        titulo,
        url_video,
        descripcion,
        visible,
        etiquetas
    } = body;

    if (!titulo || !titulo.trim()) {
        const error = new Error('El título es obligatorio');
        error.statusCode = 400;
        throw error;
    }

    if (!url_video || !url_video.trim()) {
        const error = new Error('La URL del video es obligatoria');
        error.statusCode = 400;
        throw error;
    }

    const grabacionActual = await obtenerGrabacionPorId(id_grabacion);

    const esAdmin = parseInt(id_rol) === 1;
    const esAutor = Number(grabacionActual.id_usuario_subio) === Number(id_usuario);

    if (!esAdmin && !esAutor) {
        const error = new Error('Solo el usuario que subió la grabación o un administrador puede actualizarla');
        error.statusCode = 403;
        throw error;
    }

    await grabacionesRepository.actualizarGrabacion(id_grabacion, {
        titulo: titulo.trim(),
        url_video: url_video.trim(),
        descripcion: descripcion?.trim() || null,
        visible: visible !== undefined ? visible : grabacionActual.visible
    });

    await grabacionesRepository.sincronizarEtiquetas(
        id_grabacion,
        Array.isArray(etiquetas) ? etiquetas : []
    );

    return await obtenerGrabacionPorId(id_grabacion);
};

const cambiarVisibilidad = async (id_grabacion, visible, id_usuario, id_rol) => {
    if (visible === undefined || visible === null) {
        const error = new Error('El campo visible es obligatorio');
        error.statusCode = 400;
        throw error;
    }

    const grabacionActual = await obtenerGrabacionPorId(id_grabacion);

    const esAdmin = parseInt(id_rol) === 1;
    const esAutor = Number(grabacionActual.id_usuario_subio) === Number(id_usuario);

    if (!esAdmin && !esAutor) {
        const error = new Error('Solo el usuario que subió la grabación o un administrador puede cambiar la visibilidad');
        error.statusCode = 403;
        throw error;
    }

    const nuevoEstado = visible === true || visible === 1 || visible === 'true';

    await grabacionesRepository.cambiarVisibilidad(id_grabacion, nuevoEstado);

    return await obtenerGrabacionPorId(id_grabacion);
};

const eliminarGrabacion = async (id_grabacion, id_usuario, id_rol) => {
    const grabacionActual = await obtenerGrabacionPorId(id_grabacion);

    const esAdmin = parseInt(id_rol) === 1;
    const esAutor = Number(grabacionActual.id_usuario_subio) === Number(id_usuario);

    if (!esAdmin && !esAutor) {
        const error = new Error('Solo el usuario que subió la grabación o un administrador puede eliminarla');
        error.statusCode = 403;
        throw error;
    }

    await grabacionesRepository.eliminarGrabacion(id_grabacion);

    return {
        id_grabacion,
        mensaje: 'Grabación eliminada correctamente'
    };
};

// ─── HELPER PRIVADO ───────────────────────────────────────────────────────────

async function _adjuntarEtiquetas(grabaciones) {
    return await Promise.all(
        grabaciones.map(async (g) => {
            const etiquetas = await grabacionesRepository.obtenerEtiquetasPorGrabacion(g.id_grabacion);

            return {
                ...g,
                etiquetas
            };
        })
    );
}

module.exports = {
    obtenerGrabaciones,
    obtenerGrabacionPorId,
    obtenerGrabacionesPorSesion,
    obtenerEtiquetas,
    crearGrabacion,
    actualizarGrabacion,
    cambiarVisibilidad,
    eliminarGrabacion
};