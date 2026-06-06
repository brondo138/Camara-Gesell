const reservasRepository = require('../repositories/reservas.repository');
const sesionesRepository = require('../repositories/sesiones.repository');

const ESTADOS_VALIDOS = ['Pendiente', 'Aprobada', 'Rechazada', 'Cancelada', 'Finalizada'];

const obtenerReservas = async (id_usuario, id_rol) => {
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
    const {
        id_camara,
        id_usuario_solicitante,
        id_grupo,
        fecha,
        hora_inicio,
        hora_fin,
        motivo
    } = body;

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

    const usuario = await reservasRepository.obtenerUsuarioPorId(id_usuario_solicitante);

    if (!usuario) {
        const error = new Error('El usuario solicitante no existe');
        error.statusCode = 404;
        throw error;
    }

    if (usuario.nombre_rol === 'Administrador') {
        const error = new Error('Un administrador no puede crear reservas como solicitante de grupo');
        error.statusCode = 400;
        throw error;
    }

    let idGrupoReserva = id_grupo;

    if (!idGrupoReserva) {
        const gruposUsuario = await reservasRepository.obtenerGruposPorUsuario(id_usuario_solicitante);

        if (gruposUsuario.length === 0) {
            const error = new Error('El usuario solicitante no pertenece a ningún grupo');
            error.statusCode = 400;
            throw error;
        }

        if (gruposUsuario.length > 1) {
            const error = new Error('El usuario pertenece a más de un grupo. Debe enviar id_grupo en la reserva');
            error.statusCode = 400;
            throw error;
        }

        idGrupoReserva = gruposUsuario[0].id_grupo;
    }

    const perteneceGrupo = await reservasRepository.usuarioPerteneceAGrupo(
        id_usuario_solicitante,
        idGrupoReserva
    );

    if (!perteneceGrupo) {
        const error = new Error('El usuario solicitante no pertenece al grupo indicado');
        error.statusCode = 400;
        throw error;
    }

    const conflicto = await reservasRepository.existeConflictoHorario(
        id_camara,
        fecha,
        hora_inicio,
        hora_fin
    );

    if (conflicto) {
        const error = new Error('La cámara ya tiene una reserva en ese horario');
        error.statusCode = 409;
        throw error;
    }

    const insertId = await reservasRepository.crearReserva({
        id_camara,
        id_usuario_solicitante,
        id_grupo: idGrupoReserva,
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

    if (estado === 'Aprobada') {
        const sesionExistente = await sesionesRepository.obtenerSesionPorReserva(id_reserva);

        if (!sesionExistente) {
            await sesionesRepository.crearSesion({
                id_reserva,
                titulo: reserva.motivo,
                descripcion: null,
                tipo_sesion: 'Entrevista',
                fecha_realizacion: reserva.fecha
            });
        }
    }

    return await reservasRepository.obtenerReservaPorId(id_reserva);
};

const eliminarReserva = async (id_reserva) => {
    const reserva = await obtenerReservaPorId(id_reserva);

    // Solo se pueden eliminar reservas Pendientes, Rechazadas o Canceladas
    const ESTADOS_ELIMINABLES = ['Pendiente', 'Rechazada', 'Cancelada'];

    if (!ESTADOS_ELIMINABLES.includes(reserva.estado)) {
        const error = new Error(`No se puede eliminar una reserva en estado "${reserva.estado}". Solo se pueden eliminar reservas Pendientes, Rechazadas o Canceladas.`);
        error.statusCode = 409;
        throw error;
    }

    // Verificar que no tenga sesión asociada
    const sesion = await sesionesRepository.obtenerSesionPorReserva(id_reserva);

    if (sesion) {
        const error = new Error('No se puede eliminar la reserva porque tiene una sesión asociada.');
        error.statusCode = 409;
        throw error;
    }

    await reservasRepository.eliminarReserva(id_reserva);

    return {
        id_reserva,
        mensaje: 'Reserva eliminada correctamente'
    };
};
module.exports = {
    obtenerReservas,
    obtenerReservaPorId,
    crearReserva,
    cambiarEstadoReserva,
    eliminarReserva
};