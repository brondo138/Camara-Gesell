const pool = require('../database/connection');

const obtenerObservaciones = async () => {
    const query = `
        SELECT
            o.id_observacion,
            o.id_sesion,
            o.id_usuario,
            o.observacion,
            o.fecha_observacion,

            u.nombre AS nombre_usuario,
            u.apellido AS apellido_usuario,
            ro.nombre_rol AS rol_usuario,

            s.titulo AS sesion,
            s.estado AS estado_sesion,

            r.id_reserva,
            r.id_grupo,
            g.nombre AS grupo
        FROM observaciones o
        INNER JOIN usuarios u ON o.id_usuario = u.id_usuario
        INNER JOIN roles ro ON u.id_rol = ro.id_rol
        INNER JOIN sesiones s ON o.id_sesion = s.id_sesion
        INNER JOIN reservas r ON s.id_reserva = r.id_reserva
        INNER JOIN grupos g ON r.id_grupo = g.id_grupo
        ORDER BY o.fecha_observacion DESC;
    `;

    const [rows] = await pool.query(query);
    return rows;
};

const obtenerObservacionesPorSesion = async (id_sesion) => {
    const query = `
        SELECT
            o.id_observacion,
            o.id_sesion,
            o.id_usuario,
            o.observacion,
            o.fecha_observacion,

            u.nombre AS nombre_usuario,
            u.apellido AS apellido_usuario,
            ro.nombre_rol AS rol_usuario,

            s.titulo AS sesion,
            s.estado AS estado_sesion,

            r.id_reserva,
            r.id_grupo,
            g.nombre AS grupo
        FROM observaciones o
        INNER JOIN usuarios u ON o.id_usuario = u.id_usuario
        INNER JOIN roles ro ON u.id_rol = ro.id_rol
        INNER JOIN sesiones s ON o.id_sesion = s.id_sesion
        INNER JOIN reservas r ON s.id_reserva = r.id_reserva
        INNER JOIN grupos g ON r.id_grupo = g.id_grupo
        WHERE o.id_sesion = ?
        ORDER BY o.fecha_observacion DESC;
    `;

    const [rows] = await pool.query(query, [id_sesion]);
    return rows;
};

const obtenerObservacionesPorUsuario = async (id_usuario) => {
    const query = `
        SELECT
            o.id_observacion,
            o.id_sesion,
            o.id_usuario,
            o.observacion,
            o.fecha_observacion,

            u.nombre AS nombre_usuario,
            u.apellido AS apellido_usuario,
            ro.nombre_rol AS rol_usuario,

            s.titulo AS sesion,
            s.estado AS estado_sesion,

            r.id_reserva,
            r.id_grupo,
            g.nombre AS grupo
        FROM observaciones o
        INNER JOIN usuarios u ON o.id_usuario = u.id_usuario
        INNER JOIN roles ro ON u.id_rol = ro.id_rol
        INNER JOIN sesiones s ON o.id_sesion = s.id_sesion
        INNER JOIN reservas r ON s.id_reserva = r.id_reserva
        INNER JOIN grupos g ON r.id_grupo = g.id_grupo
        INNER JOIN grupo_usuarios gu ON r.id_grupo = gu.id_grupo
        WHERE gu.id_usuario = ?
        ORDER BY o.fecha_observacion DESC;
    `;

    const [rows] = await pool.query(query, [id_usuario]);
    return rows;
};

const obtenerObservacionesPorSesionYUsuario = async (id_sesion, id_usuario) => {
    const query = `
        SELECT
            o.id_observacion,
            o.id_sesion,
            o.id_usuario,
            o.observacion,
            o.fecha_observacion,

            u.nombre AS nombre_usuario,
            u.apellido AS apellido_usuario,
            ro.nombre_rol AS rol_usuario,

            s.titulo AS sesion,
            s.estado AS estado_sesion,

            r.id_reserva,
            r.id_grupo,
            g.nombre AS grupo
        FROM observaciones o
        INNER JOIN usuarios u ON o.id_usuario = u.id_usuario
        INNER JOIN roles ro ON u.id_rol = ro.id_rol
        INNER JOIN sesiones s ON o.id_sesion = s.id_sesion
        INNER JOIN reservas r ON s.id_reserva = r.id_reserva
        INNER JOIN grupos g ON r.id_grupo = g.id_grupo
        INNER JOIN grupo_usuarios gu ON r.id_grupo = gu.id_grupo
        WHERE o.id_sesion = ?
          AND gu.id_usuario = ?
        ORDER BY o.fecha_observacion DESC;
    `;

    const [rows] = await pool.query(query, [id_sesion, id_usuario]);
    return rows;
};

const obtenerObservacionPorId = async (id_observacion) => {
    const query = `
        SELECT
            o.id_observacion,
            o.id_sesion,
            o.id_usuario,
            o.observacion,
            o.fecha_observacion,

            u.nombre AS nombre_usuario,
            u.apellido AS apellido_usuario,
            ro.nombre_rol AS rol_usuario,

            s.titulo AS sesion,
            s.estado AS estado_sesion,

            r.id_reserva,
            r.id_grupo,
            g.nombre AS grupo
        FROM observaciones o
        INNER JOIN usuarios u ON o.id_usuario = u.id_usuario
        INNER JOIN roles ro ON u.id_rol = ro.id_rol
        INNER JOIN sesiones s ON o.id_sesion = s.id_sesion
        INNER JOIN reservas r ON s.id_reserva = r.id_reserva
        INNER JOIN grupos g ON r.id_grupo = g.id_grupo
        WHERE o.id_observacion = ?
        LIMIT 1;
    `;

    const [rows] = await pool.query(query, [id_observacion]);
    return rows[0];
};

const obtenerSesionPorId = async (id_sesion) => {
    const query = `
        SELECT
            s.id_sesion,
            s.id_reserva,
            s.titulo,
            s.estado,
            r.id_grupo
        FROM sesiones s
        INNER JOIN reservas r ON s.id_reserva = r.id_reserva
        WHERE s.id_sesion = ?
        LIMIT 1;
    `;

    const [rows] = await pool.query(query, [id_sesion]);
    return rows[0];
};

const usuarioPerteneceAlGrupoDeSesion = async (id_usuario, id_sesion) => {
    const query = `
        SELECT gu.id_usuario
        FROM sesiones s
        INNER JOIN reservas r ON s.id_reserva = r.id_reserva
        INNER JOIN grupo_usuarios gu ON r.id_grupo = gu.id_grupo
        WHERE s.id_sesion = ?
          AND gu.id_usuario = ?
        LIMIT 1;
    `;

    const [rows] = await pool.query(query, [id_sesion, id_usuario]);
    return rows.length > 0;
};

const crearObservacion = async (observacionData) => {
    const { id_sesion, id_usuario, observacion } = observacionData;

    const query = `
        INSERT INTO observaciones
        (id_sesion, id_usuario, observacion)
        VALUES (?, ?, ?);
    `;

    const [result] = await pool.query(query, [
        id_sesion,
        id_usuario,
        observacion
    ]);

    return result.insertId;
};

const actualizarObservacion = async (id_observacion, observacion) => {
    const query = `
        UPDATE observaciones
        SET observacion = ?
        WHERE id_observacion = ?;
    `;

    const [result] = await pool.query(query, [observacion, id_observacion]);
    return result.affectedRows;
};

const eliminarObservacion = async (id_observacion) => {
    const query = `
        DELETE FROM observaciones
        WHERE id_observacion = ?;
    `;

    const [result] = await pool.query(query, [id_observacion]);
    return result.affectedRows;
};

module.exports = {
    obtenerObservaciones,
    obtenerObservacionesPorSesion,
    obtenerObservacionesPorUsuario,
    obtenerObservacionesPorSesionYUsuario,
    obtenerObservacionPorId,
    obtenerSesionPorId,
    usuarioPerteneceAlGrupoDeSesion,
    crearObservacion,
    actualizarObservacion,
    eliminarObservacion
};