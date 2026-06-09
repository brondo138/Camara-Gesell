const camarasRepository = require('../repositories/camaras.repository');

const obtenerCamaras = async () => {
    const camaras = await camarasRepository.obtenerCamaras();
    return camaras;
};

const obtenerCamaraPorId = async (id_camara) => {
    const camara = await camarasRepository.obtenerCamaraPorId(id_camara);

    if (!camara) {
        const error = new Error('La cámara de Gesell no existe');
        error.statusCode = 404;
        throw error;
    }

    return camara;
};

const crearCamara = async (body) => {
    const { nombre, ubicacion, descripcion, activa } = body;

    if (!nombre || !nombre.trim()) {
        const error = new Error('El nombre de la cámara es obligatorio');
        error.statusCode = 400;
        throw error;
    }

    const insertId = await camarasRepository.crearCamara({
        nombre: nombre.trim(),
        ubicacion: ubicacion?.trim() || null,
        descripcion: descripcion?.trim() || null,
        activa: activa !== undefined ? activa : true
    });

    const camara = await camarasRepository.obtenerCamaraPorId(insertId);
    return camara;
};

const actualizarCamara = async (id_camara, body) => {
    const { nombre, ubicacion, descripcion, activa } = body;

    if (!nombre || !nombre.trim()) {
        const error = new Error('El nombre de la cámara es obligatorio');
        error.statusCode = 400;
        throw error;
    }

    await obtenerCamaraPorId(id_camara); // lanza 404 si no existe

    await camarasRepository.actualizarCamara(id_camara, {
        nombre: nombre.trim(),
        ubicacion: ubicacion?.trim() || null,
        descripcion: descripcion?.trim() || null,
        activa: activa !== undefined ? activa : true
    });

    const camara = await camarasRepository.obtenerCamaraPorId(id_camara);
    return camara;
};

const cambiarEstadoCamara = async (id_camara, activa) => {
    if (activa === undefined || activa === null) {
        const error = new Error('El estado de la cámara es obligatorio');
        error.statusCode = 400;
        throw error;
    }

    await obtenerCamaraPorId(id_camara); // lanza 404 si no existe

    // Normalizar: acepta true/false, 1/0, "true"/"false"
    const nuevoEstado = activa === true || activa === 1 || activa === 'true';

    await camarasRepository.cambiarEstadoCamara(id_camara, nuevoEstado);

    const camara = await camarasRepository.obtenerCamaraPorId(id_camara);
    return camara;
};

const eliminarCamara = async (id_camara) => {
    await obtenerCamaraPorId(id_camara); // lanza 404 si no existe

    await camarasRepository.eliminarCamara(id_camara);

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