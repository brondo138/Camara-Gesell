const sesionesRepository = require('../repositories/sesiones.repository');

const ESTADOS_VALIDOS = ['Programada', 'Realizada', 'Cancelada'];

const TIPOS_SESION_VALIDOS = [
    'Entrevista',
    'Práctica',
    'Evaluación',
    'Supervisión',
    'Otro'
];

const obtenerSesiones = async (id_usuario, id_rol) => {
    // Admin ve todas las sesiones.
    // Docentes y practicantes ven las sesiones de los grupos donde pertenecen.
    if (parseInt(id_rol) === 1) {
        return await sesionesRepository.obtenerSesiones();
    }

    if (!id_usuario) {
        const error = new Error('El id_usuario es obligatorio');
        error.statusCode = 400;
        throw error;
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
    const {
        id_reserva,
        titulo,
        descripcion,
        tipo_sesion,
        fecha_realizacion
    } = body;

    if (!id_reserva || !titulo) {
        const error = new Error('id_reserva y titulo son obligatorios');
        error.statusCode = 400;
        throw error;
    }

    const reserva = await sesionesRepository.obtenerReservaPorId(id_reserva);

    if (!reserva) {
        const error = new Error('La reserva no existe');
        error.statusCode = 404;
        throw error;
    }

    if (reserva.estado !== 'Aprobada') {
        const error = new Error('Solo se puede crear una sesión para una reserva aprobada');
        error.statusCode = 400;
        throw error;
    }

    const sesionExistente = await sesionesRepository.obtenerSesionPorReserva(id_reserva);

    if (sesionExistente) {
        const error = new Error('Ya existe una sesión para esta reserva');
        error.statusCode = 400;
        throw error;
    }

    if (tipo_sesion && !TIPOS_SESION_VALIDOS.includes(tipo_sesion)) {
        const error = new Error(`Tipo de sesión no válido. Debe ser uno de: ${TIPOS_SESION_VALIDOS.join(', ')}`);
        error.statusCode = 400;
        throw error;
    }

    const insertId = await sesionesRepository.crearSesion({
        id_reserva,
        titulo: titulo.trim(),
        descripcion: descripcion || null,
        tipo_sesion: tipo_sesion || 'Entrevista',
        fecha_realizacion: fecha_realizacion || reserva.fecha
    });

    return await sesionesRepository.obtenerSesionPorId(insertId);
};

const actualizarSesion = async (id_sesion, body) => {
    const sesionActual = await obtenerSesionPorId(id_sesion);

    const {
        titulo,
        descripcion,
        tipo_sesion,
        fecha_realizacion
    } = body;

    if (!titulo) {
        const error = new Error('El título es obligatorio');
        error.statusCode = 400;
        throw error;
    }

    if (tipo_sesion && !TIPOS_SESION_VALIDOS.includes(tipo_sesion)) {
        const error = new Error(`Tipo de sesión no válido. Debe ser uno de: ${TIPOS_SESION_VALIDOS.join(', ')}`);
        error.statusCode = 400;
        throw error;
    }

    if (sesionActual.estado === 'Cancelada') {
        const error = new Error('No se puede actualizar una sesión cancelada');
        error.statusCode = 400;
        throw error;
    }

    await sesionesRepository.actualizarSesion(id_sesion, {
        titulo: titulo.trim(),
        descripcion: descripcion || null,
        tipo_sesion: tipo_sesion || sesionActual.tipo_sesion,
        fecha_realizacion: fecha_realizacion || sesionActual.fecha_realizacion
    });

    return await sesionesRepository.obtenerSesionPorId(id_sesion);
};

const cambiarEstadoSesion = async (id_sesion, estado) => {
    if (!estado || !ESTADOS_VALIDOS.includes(estado)) {
        const error = new Error(`Estado no válido. Debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}`);
        error.statusCode = 400;
        throw error;
    }

    const sesion = await obtenerSesionPorId(id_sesion);

    if (sesion.estado === 'Cancelada') {
        const error = new Error('No se puede modificar una sesión cancelada');
        error.statusCode = 400;
        throw error;
    }

    await sesionesRepository.cambiarEstadoSesion(id_sesion, estado);

    return await sesionesRepository.obtenerSesionPorId(id_sesion);
};
const eliminarSesion = async (id_sesion) => {
    const sesion = await obtenerSesionPorId(id_sesion) // valida 404

    if (sesion.estado === 'Programada') {
        const error = new Error(
            'No se puede eliminar una sesión programada. ' +
            'Primero márcala como Realizada o Cancelada.'
        )
        error.statusCode = 400
        throw error
    }

    await sesionesRepository.eliminarSesion(id_sesion)
    return { id_sesion, mensaje: 'Sesión eliminada correctamente' }
}

module.exports = {
    obtenerSesiones,
    obtenerSesionPorId,
    crearSesion,
    actualizarSesion,
    cambiarEstadoSesion,
    eliminarSesion       // ← agregar
}