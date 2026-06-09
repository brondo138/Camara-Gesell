const camarasRepository = require('../repositories/camaras.repository');

const crearError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const esErrorRelacionBaseDatos = (error) => {
    return error?.code === 'ER_ROW_IS_REFERENCED_2' || error?.errno === 1451;
};

const obtenerCamaras = async () => {
    return await camarasRepository.obtenerCamaras();
};

const obtenerCamaraPorId = async (id_camara) => {
    const camara = await camarasRepository.obtenerCamaraPorId(id_camara);

    if (!camara) {
        throw crearError('La cámara de Gesell no existe', 404);
    }

    return camara;
};

const crearCamara = async (body) => {
    const { nombre, ubicacion, descripcion, activa } = body;

    if (!nombre || !nombre.trim()) {
        throw crearError('El nombre de la cámara es obligatorio', 400);
    }

    const insertId = await camarasRepository.crearCamara({
        nombre: nombre.trim(),
        ubicacion: ubicacion?.trim() || null,
        descripcion: descripcion?.trim() || null,
        activa: activa !== undefined ? activa : true
    });

    return await camarasRepository.obtenerCamaraPorId(insertId);
};

const actualizarCamara = async (id_camara, body) => {
    const { nombre, ubicacion, descripcion, activa } = body;

    if (!nombre || !nombre.trim()) {
        throw crearError('El nombre de la cámara es obligatorio', 400);
    }

    await obtenerCamaraPorId(id_camara);

    await camarasRepository.actualizarCamara(id_camara, {
        nombre: nombre.trim(),
        ubicacion: ubicacion?.trim() || null,
        descripcion: descripcion?.trim() || null,
        activa: activa !== undefined ? activa : true
    });

    return await camarasRepository.obtenerCamaraPorId(id_camara);
};

const cambiarEstadoCamara = async (id_camara, activa) => {
    if (activa === undefined || activa === null) {
        throw crearError('El estado de la cámara es obligatorio', 400);
    }

    await obtenerCamaraPorId(id_camara);

    const nuevoEstado = activa === true || activa === 1 || activa === 'true';

    await camarasRepository.cambiarEstadoCamara(id_camara, nuevoEstado);

    return await camarasRepository.obtenerCamaraPorId(id_camara);
};

const eliminarCamara = async (id_camara) => {
    await obtenerCamaraPorId(id_camara);

    const totalReservas = await camarasRepository.contarReservasPorCamara(id_camara);
    if (totalReservas > 0) {
        throw crearError('No se puede eliminar la cámara porque tiene reservas asociadas.', 409);
    }

    try {
        await camarasRepository.eliminarCamara(id_camara);
    } catch (error) {
        if (esErrorRelacionBaseDatos(error)) {
            throw crearError('No se puede eliminar la cámara porque tiene reservas asociadas.', 409);
        }

        throw error;
    }

    return { id_camara, mensaje: 'Cámara de Gesell eliminada correctamente' };
};

module.exports = {
    obtenerCamaras,
    obtenerCamaraPorId,
    crearCamara,
    actualizarCamara,
    cambiarEstadoCamara,
    eliminarCamara
};
