const grabacionesRepository = require('../repositories/grabaciones.repository');

const obtenerGrabaciones = async (id_usuario, id_rol) => {
    // Admin y docente ven todas; estudiante solo las visibles de sus sesiones
    if (parseInt(id_rol) === 1 || parseInt(id_rol) === 2) {
        const grabaciones = await grabacionesRepository.obtenerGrabaciones();
        return await _adjuntarEtiquetas(grabaciones);
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
    return { ...grabacion, etiquetas };
};

const obtenerGrabacionesPorSesion = async (id_sesion) => {
    const grabaciones = await grabacionesRepository.obtenerGrabacionesPorSesion(id_sesion);
    return await _adjuntarEtiquetas(grabaciones);
};

const obtenerEtiquetas = async () => {
    return await grabacionesRepository.obtenerEtiquetas();
};

const crearGrabacion = async (body) => {
    const { id_sesion, titulo, url_video, descripcion, visible, etiquetas } = body;

    if (!id_sesion) {
        const error = new Error('id_sesion es obligatorio');
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

    const insertId = await grabacionesRepository.crearGrabacion({
        id_sesion,
        titulo:      titulo.trim(),
        url_video:   url_video.trim(),
        descripcion: descripcion?.trim() || null,
        visible:     visible !== undefined ? visible : 1
    });

    // Sincronizar etiquetas si se enviaron
    if (Array.isArray(etiquetas) && etiquetas.length > 0) {
        await grabacionesRepository.sincronizarEtiquetas(insertId, etiquetas);
    }

    return await obtenerGrabacionPorId(insertId);
};

const actualizarGrabacion = async (id_grabacion, body) => {
    const { titulo, url_video, descripcion, visible, etiquetas } = body;

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

    await obtenerGrabacionPorId(id_grabacion); // lanza 404 si no existe

    await grabacionesRepository.actualizarGrabacion(id_grabacion, {
        titulo:      titulo.trim(),
        url_video:   url_video.trim(),
        descripcion: descripcion?.trim() || null,
        visible:     visible !== undefined ? visible : 1
    });

    // Sincronizar etiquetas
    await grabacionesRepository.sincronizarEtiquetas(
        id_grabacion,
        Array.isArray(etiquetas) ? etiquetas : []
    );

    return await obtenerGrabacionPorId(id_grabacion);
};

const cambiarVisibilidad = async (id_grabacion, visible) => {
    if (visible === undefined || visible === null) {
        const error = new Error('El campo visible es obligatorio');
        error.statusCode = 400;
        throw error;
    }
    await obtenerGrabacionPorId(id_grabacion); // lanza 404 si no existe
    const nuevoEstado = visible === true || visible === 1 || visible === 'true';
    await grabacionesRepository.cambiarVisibilidad(id_grabacion, nuevoEstado);
    return await obtenerGrabacionPorId(id_grabacion);
};

const eliminarGrabacion = async (id_grabacion) => {
    await obtenerGrabacionPorId(id_grabacion); // lanza 404 si no existe
    await grabacionesRepository.eliminarGrabacion(id_grabacion);
    return { id_grabacion, mensaje: 'Grabación eliminada correctamente' };
};

// ─── HELPER PRIVADO ───────────────────────────────────────────────────────────
async function _adjuntarEtiquetas(grabaciones) {
    return await Promise.all(
        grabaciones.map(async (g) => {
            const etiquetas = await grabacionesRepository.obtenerEtiquetasPorGrabacion(g.id_grabacion);
            return { ...g, etiquetas };
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