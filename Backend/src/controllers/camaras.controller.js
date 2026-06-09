const camarasService = require('../services/camaras.service');

const responderError = (res, error) => {
    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
    });
};

const obtenerCamaras = async (req, res) => {
    try {
        const camaras = await camarasService.obtenerCamaras();

        res.json({
            success: true,
            message: 'Cámaras de Gesell obtenidas correctamente',
            data: camaras
        });
    } catch (error) {
        responderError(res, error);
    }
};

const obtenerCamaraPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const camara = await camarasService.obtenerCamaraPorId(id);

        res.json({
            success: true,
            message: 'Cámara de Gesell obtenida correctamente',
            data: camara
        });
    } catch (error) {
        responderError(res, error);
    }
};

const crearCamara = async (req, res) => {
    try {
        const camara = await camarasService.crearCamara(req.body);

        res.status(201).json({
            success: true,
            message: 'Cámara de Gesell creada correctamente',
            data: camara
        });
    } catch (error) {
        responderError(res, error);
    }
};

const actualizarCamara = async (req, res) => {
    try {
        const { id } = req.params;
        const camara = await camarasService.actualizarCamara(id, req.body);

        res.json({
            success: true,
            message: 'Cámara de Gesell actualizada correctamente',
            data: camara
        });
    } catch (error) {
        responderError(res, error);
    }
};

const cambiarEstadoCamara = async (req, res) => {
    try {
        const { id } = req.params;
        const { activa } = req.body;
        const camara = await camarasService.cambiarEstadoCamara(id, activa);

        res.json({
            success: true,
            message: 'Estado de la cámara actualizado correctamente',
            data: camara
        });
    } catch (error) {
        responderError(res, error);
    }
};

const eliminarCamara = async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await camarasService.eliminarCamara(id);

        res.json({
            success: true,
            message: resultado.mensaje,
            data: resultado
        });
    } catch (error) {
        responderError(res, error);
    }
};

module.exports = {
    obtenerCamaras,
    obtenerCamaraPorId,
    crearCamara,
    actualizarCamara,
    cambiarEstadoCamara,
    eliminarCamara
};
