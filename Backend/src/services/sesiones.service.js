const sesionesRepository = require('../repositories/sesiones.repository');

const ESTADOS_VALIDOS  = ['Programada', 'Realizada', 'Cancelada'];
const TIPOS_VALIDOS    = ['Entrevista', 'Práctica', 'Evaluación', 'Supervisión', 'Otro'];

const obtenerSesiones = async (id_usuario, id_rol) => {
    if (parseInt(id_rol) === 1) {
        return await sesionesRepository.obtenerSesiones();
    }
    return await sesionesRepository.obtenerSesionesPorUsuario(id_usuario);
};

const obtenerSesionPorId = async (id_sesion) => {
    const sesion = await sesionesRepository.obtenerSesionPorId(id_sesion);
    if (!sesion) {
        const error = new Error('La sesión no existe');
        error.statusCode = 404;
        throw error;
    }
    return sesion;
};

const crearSesion = async (body) => {
    const { id_reserva, titulo, descripcion, tipo_sesion, fecha_realizacion } = body;

    if (!id_reserva) {
        const error = new Error('id_reserva es obligatorio');
        error.statusCode = 400;
        throw error;
    }
    if (!titulo || !titulo.trim()) {
        const error = new Error('El título de la sesión es obligatorio');
        error.statusCode = 400;
        throw error;
    }
    if (tipo_sesion && !TIPOS_VALIDOS.includes(tipo_sesion)) {
        const error = new Error(`tipo_sesion no válido. Debe ser: ${TIPOS_VALIDOS.join(', ')}`);
        error.statusCode = 400;
        throw error;
    }

    const insertId = await sesionesRepository.crearSesion({
        id_reserva,
        titulo: titulo.trim(),
        descripcion: descripcion?.trim() || null,
        tipo_sesion: tipo_sesion ?? 'Entrevista',
        fecha_realizacion: fecha_realizacion || null
    });

    return await sesionesRepository.obtenerSesionPorId(insertId);
};

const actualizarSesion = async (id_sesion, body) => {
    const { titulo, descripcion, tipo_sesion, fecha_realizacion } = body;

    if (!titulo || !titulo.trim()) {
        const error = new Error('El título de la sesión es obligatorio');
        error.statusCode = 400;
        throw error;
    }
    if (tipo_sesion && !TIPOS_VALIDOS.includes(tipo_sesion)) {
        const error = new Error(`tipo_sesion no válido. Debe ser: ${TIPOS_VALIDOS.join(', ')}`);
        error.statusCode = 400;
        throw error;
    }

    await obtenerSesionPorId(id_sesion); // lanza 404 si no existe

    await sesionesRepository.actualizarSesion(id_sesion, {
        titulo: titulo.trim(),
        descripcion: descripcion?.trim() || null,
        tipo_sesion: tipo_sesion ?? 'Entrevista',
        fecha_realizacion: fecha_realizacion || null
    });

    return await sesionesRepository.obtenerSesionPorId(id_sesion);
};

const cambiarEstadoSesion = async (id_sesion, estado) => {
    if (!estado || !ESTADOS_VALIDOS.includes(estado)) {
        const error = new Error(`Estado no válido. Debe ser: ${ESTADOS_VALIDOS.join(', ')}`);
        error.statusCode = 400;
        throw error;
    }

    await obtenerSesionPorId(id_sesion); // lanza 404 si no existe

    await sesionesRepository.cambiarEstadoSesion(id_sesion, estado);
    return await sesionesRepository.obtenerSesionPorId(id_sesion);
};

module.exports = {
    obtenerSesiones,
    obtenerSesionPorId,
    crearSesion,
    actualizarSesion,
    cambiarEstadoSesion
};