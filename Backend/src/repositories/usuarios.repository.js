const pool = require('../database/connection');

const obtenerUsuarios = async () => {
    const query = `
        SELECT 
            u.id_usuario,
            u.nombre,
            u.apellido,
            u.correo,
            u.activo,
            u.fecha_creacion,
            r.id_rol,
            r.nombre_rol
        FROM usuarios u
        INNER JOIN roles r ON u.id_rol = r.id_rol
        ORDER BY u.id_usuario DESC;
    `;

    const [rows] = await pool.query(query);
    return rows;
};

const obtenerUsuarioPorId = async (id_usuario) => {
    const query = `
        SELECT 
            u.id_usuario,
            u.nombre,
            u.apellido,
            u.correo,
            u.activo,
            u.fecha_creacion,
            r.id_rol,
            r.nombre_rol
        FROM usuarios u
        INNER JOIN roles r ON u.id_rol = r.id_rol
        WHERE u.id_usuario = ?;
    `;

    const [rows] = await pool.query(query, [id_usuario]);
    return rows[0];
};

const obtenerUsuarioPorCorreo = async (correo) => {
    const query = `
        SELECT 
            id_usuario,
            nombre,
            apellido,
            correo,
            contrasena,
            id_rol,
            activo
        FROM usuarios
        WHERE correo = ?;
    `;

    const [rows] = await pool.query(query, [correo]);
    return rows[0];
};

const crearUsuario = async (usuario) => {
    const { nombre, apellido, correo, contrasena, id_rol } = usuario;

    const query = `
        INSERT INTO usuarios (
            nombre,
            apellido,
            correo,
            contrasena,
            id_rol
        ) VALUES (?, ?, ?, ?, ?);
    `;

    const [result] = await pool.query(query, [
        nombre,
        apellido,
        correo,
        contrasena,
        id_rol
    ]);

    return result.insertId;
};

const actualizarUsuario = async (id_usuario, usuario) => {
    const { nombre, apellido, correo, id_rol, activo } = usuario;

    const query = `
        UPDATE usuarios
        SET 
            nombre = ?,
            apellido = ?,
            correo = ?,
            id_rol = ?,
            activo = ?
        WHERE id_usuario = ?;
    `;

    const [result] = await pool.query(query, [
        nombre,
        apellido,
        correo,
        id_rol,
        activo,
        id_usuario
    ]);

    return result.affectedRows;
};

const actualizarContrasena = async (id_usuario, contrasena) => {
    const query = `
        UPDATE usuarios
        SET contrasena = ?
        WHERE id_usuario = ?;
    `;

    const [result] = await pool.query(query, [contrasena, id_usuario]);

    return result.affectedRows;
};

const eliminarUsuario = async (id_usuario) => {
    const query = `
        DELETE FROM usuarios
        WHERE id_usuario = ?;
    `;

    const [result] = await pool.query(query, [id_usuario]);

    return result.affectedRows;
};
const perteneceAGrupoActivo = async (id_usuario) => {
    const [rows] = await pool.query(`
        SELECT COUNT(*) AS total
        FROM grupo_usuarios gu
        INNER JOIN grupos g ON gu.id_grupo = g.id_grupo
        WHERE gu.id_usuario = ? AND g.activo = 1
    `, [id_usuario]);
    return rows[0].total > 0;
};

module.exports = {
    obtenerUsuarios,
    obtenerUsuarioPorId,
    obtenerUsuarioPorCorreo,
    crearUsuario,
    actualizarUsuario,
    actualizarContrasena,
    eliminarUsuario,
    perteneceAGrupoActivo
};