const pool = require('../database/connection');

const obtenerCamaras = async () => {
    const query = `
        SELECT
            id_camara,
            nombre,
            ubicacion,
            descripcion,
            activa
        FROM camaras_gesell
        ORDER BY id_camara DESC;
    `;

    const [rows] = await pool.query(query);
    return rows;
};

const obtenerCamaraPorId = async (id_camara) => {
    const query = `
        SELECT
            id_camara,
            nombre,
            ubicacion,
            descripcion,
            activa
        FROM camaras_gesell
        WHERE id_camara = ?;
    `;

    const [rows] = await pool.query(query, [id_camara]);
    return rows[0];
};

const crearCamara = async (camara) => {
    const { nombre, ubicacion, descripcion, activa } = camara;

    const query = `
        INSERT INTO camaras_gesell (
            nombre,
            ubicacion,
            descripcion,
            activa
        ) VALUES (?, ?, ?, ?);
    `;

    const [result] = await pool.query(query, [
        nombre,
        ubicacion ?? null,
        descripcion ?? null,
        activa !== undefined ? activa : true
    ]);

    return result.insertId;
};

const actualizarCamara = async (id_camara, camara) => {
    const { nombre, ubicacion, descripcion, activa } = camara;

    const query = `
        UPDATE camaras_gesell
        SET
            nombre = ?,
            ubicacion = ?,
            descripcion = ?,
            activa = ?
        WHERE id_camara = ?;
    `;

    const [result] = await pool.query(query, [
        nombre,
        ubicacion ?? null,
        descripcion ?? null,
        activa,
        id_camara
    ]);

    return result.affectedRows;
};

const cambiarEstadoCamara = async (id_camara, activa) => {
    const query = `
        UPDATE camaras_gesell
        SET activa = ?
        WHERE id_camara = ?;
    `;

    const [result] = await pool.query(query, [activa, id_camara]);
    return result.affectedRows;
};

const contarReservasPorCamara = async (id_camara) => {
    const query = `
        SELECT COUNT(*) AS total
        FROM reservas
        WHERE id_camara = ?;
    `;

    const [rows] = await pool.query(query, [id_camara]);
    return rows[0].total;
};

const eliminarCamara = async (id_camara) => {
    const query = `
        DELETE FROM camaras_gesell
        WHERE id_camara = ?;
    `;

    const [result] = await pool.query(query, [id_camara]);
    return result.affectedRows;
};

module.exports = {
    obtenerCamaras,
    obtenerCamaraPorId,
    crearCamara,
    actualizarCamara,
    cambiarEstadoCamara,
    contarReservasPorCamara,
    eliminarCamara
};
