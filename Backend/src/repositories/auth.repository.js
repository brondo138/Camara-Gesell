const pool = require('../database/connection');

const buscarUsuarioPorCorreo = async (correo) => {
    const query = `
        SELECT 
            u.id_usuario,
            u.nombre,
            u.apellido,
            u.correo,
            u.contrasena,
            u.activo,
            r.id_rol,
            r.nombre_rol
        FROM usuarios u
        INNER JOIN roles r ON u.id_rol = r.id_rol
        WHERE u.correo = ?
        LIMIT 1;
    `;

    const [rows] = await pool.query(query, [correo]);

    return rows[0];
};

module.exports = {
    buscarUsuarioPorCorreo
};