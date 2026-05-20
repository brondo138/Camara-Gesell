// Backend/src/repositories/camaras.repository.js
const pool = require('../database/connection');

// Trae todas las cámaras (para admin)
const getAll = async () => {
    const [rows] = await pool.query(
        'SELECT * FROM camaras_gesell ORDER BY nombre ASC'
    );
    return rows;
};

// Trae solo las cámaras activas (para docentes y estudiantes)
const getDisponibles = async () => {
    const [rows] = await pool.query(
        'SELECT * FROM camaras_gesell WHERE activa = 1 ORDER BY nombre ASC'
    );
    return rows;
};

// Busca una cámara por id
const getById = async (id) => {
    const [rows] = await pool.query(
        'SELECT * FROM camaras_gesell WHERE id_camara = ?',
        [id]
    );
    return rows[0];
};

// Crea una nueva cámara
const create = async ({ nombre, ubicacion, descripcion = '', activa = true }) => {
    const [result] = await pool.query(
        `INSERT INTO camaras_gesell (nombre, ubicacion, descripcion, activa)
         VALUES (?, ?, ?, ?)`,
        [nombre, ubicacion, descripcion, activa ? 1 : 0]
    );
    return getById(result.insertId);
};

// Actualiza una cámara existente
const update = async (id, { nombre, ubicacion, descripcion, activa }) => {
    await pool.query(
        `UPDATE camaras
         SET nombre = ?, ubicacion = ?, descripcion = ?, activa = ?
         WHERE id_camara = ?`,
        [nombre, ubicacion, descripcion, activa ? 1 : 0, id]
    );
    return getById(id);
};

// Cambia el estado activa/inactiva (toggle)
const toggleActiva = async (id) => {
    await pool.query(
        'UPDATE camaras_gesell SET activa = NOT activa WHERE id_camara = ?',
        [id]
    );
    return getById(id);
};

// Elimina una cámara
const remove = async (id) => {
    const [result] = await pool.query(
        'DELETE FROM camaras_gesell_gesell WHERE id_camara = ?',
        [id]
    );
    return result;
};

module.exports = { getAll, getDisponibles, getById, create, update, toggleActiva, remove };