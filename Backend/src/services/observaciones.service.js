const observacionesRepository = require('../repositories/observaciones.repository');

const obtenerObservaciones = async (id_sesion, id_usuario, id_rol) => {
    if (parseInt(id_rol) === 1) {
        if (id_sesion) {
            return await observacionesRepository.obtenerObservacionesPorSesion(id_sesion);
        }

        return await observacionesRepository.obtenerObservaciones();
    }

    if (!id_usuario) {
        const error = new Error('El id_usuario es obligatorio');
        error.statusCode = 400;
        throw error;
    }

    if (id_sesion) {
        return await observacionesRepository.obtenerObservacionesPorSesionYUsuario(
            id_sesion,
            id_usuario
        );
    }

    return await observacionesRepository.obtenerObservacionesPorUsuario(id_usuario);
};

const obtenerObservacionPorId = async (id_observacion) => {
    const observacion = await observacionesRepository.obtenerObservacionPorId(id_observacion);

    if (!observacion) {
        const error = new Error('La observación no existe');
        error.statusCode = 404;
        throw error;
    }

    return observacion;
};

const crearObservacion = async (body) => {
    const {
        id_sesion,
        id_usuario,
        id_rol,
        observacion
    } = body;

    if (!id_sesion || !id_usuario || !observacion) {
        const error = new Error('id_sesion, id_usuario y observacion son obligatorios');
        error.statusCode = 400;
        throw error;
    }

    if (!observacion.trim()) {
        const error = new Error('La observación no puede estar vacía');
        error.statusCode = 400;
        throw error;
    }

    const sesion = await observacionesRepository.obtenerSesionPorId(id_sesion);

    if (!sesion) {
        const error = new Error('La sesión no existe');
        error.statusCode = 404;
        throw error;
    }

    if (sesion.estado === 'Cancelada') {
        const error = new Error('No se pueden agregar observaciones a una sesión cancelada');
        error.statusCode = 400;
        throw error;
    }

    if (parseInt(id_rol) !== 1) {
        const pertenece = await observacionesRepository.usuarioPerteneceAlGrupoDeSesion(
            id_usuario,
            id_sesion
        );

        if (!pertenece) {
            const error = new Error('El usuario no pertenece al grupo de esta sesión');
            error.statusCode = 403;
            throw error;
        }
    }

    const insertId = await observacionesRepository.crearObservacion({
        id_sesion,
        id_usuario,
        observacion: observacion.trim()
    });

    return await observacionesRepository.obtenerObservacionPorId(insertId);
};

const actualizarObservacion = async (id_observacion, body) => {
    const {
        id_usuario,
        id_rol,
        observacion
    } = body;

    if (!id_usuario || !observacion) {
        const error = new Error('id_usuario y observacion son obligatorios');
        error.statusCode = 400;
        throw error;
    }

    if (!observacion.trim()) {
        const error = new Error('La observación no puede estar vacía');
        error.statusCode = 400;
        throw error;
    }

    const observacionActual = await obtenerObservacionPorId(id_observacion);

    const esAdmin = parseInt(id_rol) === 1;
    const esAutor = Number(observacionActual.id_usuario) === Number(id_usuario);

    if (!esAdmin && !esAutor) {
        const error = new Error('Solo el autor o un administrador puede actualizar esta observación');
        error.statusCode = 403;
        throw error;
    }

    await observacionesRepository.actualizarObservacion(
        id_observacion,
        observacion.trim()
    );

    return await observacionesRepository.obtenerObservacionPorId(id_observacion);
};

const eliminarObservacion = async (id_observacion, id_usuario, id_rol) => {
    if (!id_usuario) {
        const error = new Error('id_usuario es obligatorio');
        error.statusCode = 400;
        throw error;
    }

    const observacionActual = await obtenerObservacionPorId(id_observacion);

    const esAdmin = parseInt(id_rol) === 1;
    const esAutor = Number(observacionActual.id_usuario) === Number(id_usuario);

    if (!esAdmin && !esAutor) {
        const error = new Error('Solo el autor o un administrador puede eliminar esta observación');
        error.statusCode = 403;
        throw error;
    }

    await observacionesRepository.eliminarObservacion(id_observacion);

    return {
        id_observacion,
        mensaje: 'Observación eliminada correctamente'
    };
};

module.exports = {
    obtenerObservaciones,
    obtenerObservacionPorId,
    crearObservacion,
    actualizarObservacion,
    eliminarObservacion
};