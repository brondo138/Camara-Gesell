const reservasRepository = require('../repositories/reservas.repository');
const sesionesRepository = require('../repositories/sesiones.repository');

const ESTADOS_VALIDOS = ['Pendiente', 'Aprobada', 'Rechazada', 'Cancelada', 'Finalizada'];

const obtenerReservas = async (id_usuario, id_rol) => {
    // Admin (id_rol 1) ve todas; docente y estudiante solo las suyas
    if (parseInt(id_rol) === 1) {
        return await reservasRepository.obtenerReservas();
    }
    return await reservasRepository.obtenerReservasPorUsuario(id_usuario);
};

const obtenerReservaPorId = async (id_reserva) => {
    const reserva = await reservasRepository.obtenerReservaPorId(id_reserva);
    if (!reserva) {
        const error = new Error('La reserva no existe');
        error.statusCode = 404;
        throw error;
    }
    return reserva;
};

const crearReserva = async (body) => {
    const { id_camara, id_usuario_solicitante, fecha, hora_inicio, hora_fin, motivo } = body;

    if (!id_camara || !id_usuario_solicitante || !fecha || !hora_inicio || !hora_fin) {
        const error = new Error('id_camara, id_usuario_solicitante, fecha, hora_inicio y hora_fin son obligatorios');
        error.statusCode = 400;
        throw error;
    }

    if (!motivo || !motivo.trim()) {
        const error = new Error('El motivo de la reserva es obligatorio');
        error.statusCode = 400;
        throw error;
    }

    if (hora_inicio >= hora_fin) {
        const error = new Error('La hora de inicio debe ser anterior a la hora de fin');
        error.statusCode = 400;
        throw error;
    }

    const conflicto = await reservasRepository.existeConflictoHorario(
        id_camara, fecha, hora_inicio, hora_fin
    );
    if (conflicto) {
        const error = new Error('La cámara ya tiene una reserva en ese horario');
        error.statusCode = 409;
        throw error;
    }

    const insertId = await reservasRepository.crearReserva({
        id_camara,
        id_usuario_solicitante,
        fecha,
        hora_inicio,
        hora_fin,
        motivo: motivo.trim()
    });

    return await reservasRepository.obtenerReservaPorId(insertId);
};

const cambiarEstadoReserva = async (id_reserva, estado) => {
    if (!estado || !ESTADOS_VALIDOS.includes(estado)) {
        const error = new Error(`Estado no válido. Debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}`);
        error.statusCode = 400;
        throw error;
    }

    const reserva = await obtenerReservaPorId(id_reserva);

    if (['Finalizada', 'Cancelada'].includes(reserva.estado)) {
        const error = new Error(`No se puede modificar una reserva en estado ${reserva.estado}`);
        error.statusCode = 400;
        throw error;
    }

    await reservasRepository.cambiarEstadoReserva(id_reserva, estado);

    // Al aprobar → crear sesión automáticamente si no existe ya una
    if (estado === 'Aprobada') {
        const sesionExistente = await sesionesRepository.obtenerSesionPorReserva(id_reserva);
        if (!sesionExistente) {
            await sesionesRepository.crearSesion({
                id_reserva,
                titulo:            reserva.motivo,
                descripcion:       null,
                tipo_sesion:       'Entrevista',
                fecha_realizacion: reserva.fecha
            });
        }
    }

    return await reservasRepository.obtenerReservaPorId(id_reserva);
};

const eliminarReserva = async (id_reserva) => {
    await obtenerReservaPorId(id_reserva);
    await reservasRepository.eliminarReserva(id_reserva);
    return { id_reserva, mensaje: 'Reserva eliminada correctamente' };
};

module.exports = {
    obtenerReservas,
    obtenerReservaPorId,
    crearReserva,
    cambiarEstadoReserva,
    eliminarReserva
};