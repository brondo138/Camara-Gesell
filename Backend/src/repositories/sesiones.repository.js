const pool = require('../database/connection');

const obtenerSesiones = async () => {
    const query = `
        SELECT
            s.id_sesion,
            s.id_reserva,
            s.titulo,
            s.descripcion,
            s.tipo_sesion,
            s.fecha_realizacion,
            s.estado,

            r.id_camara,
            c.nombre AS camara,
            r.fecha,
            r.hora_inicio,
            r.hora_fin,
            r.motivo,
            r.estado AS estado_reserva,

            r.id_usuario_solicitante,
            u.nombre AS nombre_solicitante,
            u.apellido AS apellido_solicitante,
            ro.id_rol,
            ro.nombre_rol AS rol_solicitante,

            r.id_grupo,
            g.nombre AS grupo
        FROM sesiones s
        INNER JOIN reservas r ON s.id_reserva = r.id_reserva
        INNER JOIN camaras_gesell c ON r.id_camara = c.id_camara
        INNER JOIN usuarios u ON r.id_usuario_solicitante = u.id_usuario
        INNER JOIN roles ro ON u.id_rol = ro.id_rol
        INNER JOIN grupos g ON r.id_grupo = g.id_grupo
        ORDER BY s.id_sesion DESC;
    `;

    const [rows] = await pool.query(query);
    return rows;
};

const obtenerSesionesPorUsuario = async (id_usuario) => {
    const query = `
        SELECT
            s.id_sesion,
            s.id_reserva,
            s.titulo,
            s.descripcion,
            s.tipo_sesion,
            s.fecha_realizacion,
            s.estado,

            r.id_camara,
            c.nombre AS camara,
            r.fecha,
            r.hora_inicio,
            r.hora_fin,
            r.motivo,
            r.estado AS estado_reserva,

            r.id_usuario_solicitante,
            u.nombre AS nombre_solicitante,
            u.apellido AS apellido_solicitante,
            ro.id_rol,
            ro.nombre_rol AS rol_solicitante,

            r.id_grupo,
            g.nombre AS grupo
        FROM sesiones s
        INNER JOIN reservas r ON s.id_reserva = r.id_reserva
        INNER JOIN camaras_gesell c ON r.id_camara = c.id_camara
        INNER JOIN usuarios u ON r.id_usuario_solicitante = u.id_usuario
        INNER JOIN roles ro ON u.id_rol = ro.id_rol
        INNER JOIN grupos g ON r.id_grupo = g.id_grupo
        INNER JOIN grupo_usuarios gu ON r.id_grupo = gu.id_grupo
        WHERE gu.id_usuario = ?
        ORDER BY s.id_sesion DESC;
    `;

    const [rows] = await pool.query(query, [id_usuario]);
    return rows;
};

const obtenerSesionPorId = async (id_sesion) => {
    const query = `
        SELECT
            s.id_sesion,
            s.id_reserva,
            s.titulo,
            s.descripcion,
            s.tipo_sesion,
            s.fecha_realizacion,
            s.estado,

            r.id_camara,
            c.nombre AS camara,
            r.fecha,
            r.hora_inicio,
            r.hora_fin,
            r.motivo,
            r.estado AS estado_reserva,

            r.id_usuario_solicitante,
            u.nombre AS nombre_solicitante,
            u.apellido AS apellido_solicitante,
            ro.id_rol,
            ro.nombre_rol AS rol_solicitante,

            r.id_grupo,
            g.nombre AS grupo
        FROM sesiones s
        INNER JOIN reservas r ON s.id_reserva = r.id_reserva
        INNER JOIN camaras_gesell c ON r.id_camara = c.id_camara
        INNER JOIN usuarios u ON r.id_usuario_solicitante = u.id_usuario
        INNER JOIN roles ro ON u.id_rol = ro.id_rol
        INNER JOIN grupos g ON r.id_grupo = g.id_grupo
        WHERE s.id_sesion = ?
        LIMIT 1;
    `;

    const [rows] = await pool.query(query, [id_sesion]);
    return rows[0];
};

const obtenerSesionPorReserva = async (id_reserva) => {
    const query = `
        SELECT 
            id_sesion 
        FROM sesiones 
        WHERE id_reserva = ? 
        LIMIT 1;
    `;

    const [rows] = await pool.query(query, [id_reserva]);
    return rows[0];
};

const obtenerReservaPorId = async (id_reserva) => {
    const query = `
        SELECT
            r.id_reserva,
            r.id_camara,
            r.id_usuario_solicitante,
            r.id_grupo,
            r.fecha,
            r.hora_inicio,
            r.hora_fin,
            r.motivo,
            r.estado
        FROM reservas r
        WHERE r.id_reserva = ?
        LIMIT 1;
    `;

    const [rows] = await pool.query(query, [id_reserva]);
    return rows[0];
};

const crearSesion = async (sesion) => {
    const {
        id_reserva,
        titulo,
        descripcion,
        tipo_sesion,
        fecha_realizacion
    } = sesion;

    const query = `
        INSERT INTO sesiones 
        (id_reserva, titulo, descripcion, tipo_sesion, fecha_realizacion)
        VALUES (?, ?, ?, ?, ?);
    `;

    const [result] = await pool.query(query, [
        id_reserva,
        titulo,
        descripcion ?? null,
        tipo_sesion ?? 'Entrevista',
        fecha_realizacion ?? null
    ]);

    return result.insertId;
};

const actualizarSesion = async (id_sesion, sesion) => {
    const {
        titulo,
        descripcion,
        tipo_sesion,
        fecha_realizacion
    } = sesion;

    const query = `
        UPDATE sesiones
        SET 
            titulo = ?, 
            descripcion = ?, 
            tipo_sesion = ?, 
            fecha_realizacion = ?
        WHERE id_sesion = ?;
    `;

    const [result] = await pool.query(query, [
        titulo,
        descripcion ?? null,
        tipo_sesion,
        fecha_realizacion ?? null,
        id_sesion
    ]);

    return result.affectedRows;
};

const cambiarEstadoSesion = async (id_sesion, estado) => {
    const query = `
        UPDATE sesiones 
        SET estado = ? 
        WHERE id_sesion = ?;
    `;

    const [result] = await pool.query(query, [estado, id_sesion]);
    return result.affectedRows;
};

const eliminarSesion = async (id_sesion) => {
    const [result] = await pool.query(
        `DELETE FROM sesiones WHERE id_sesion = ?`,
        [id_sesion]
    );
    return result.affectedRows;
};

const tieneSesionesProgramadas = async (id_grupo) => {
    const [rows] = await pool.query(`
        SELECT COUNT(*) AS total 
        FROM sesiones s
        INNER JOIN reservas r ON s.id_reserva = r.id_reserva
        WHERE r.id_grupo = ? AND s.estado = 'Programada'
    `, [id_grupo]);
    return rows[0].total > 0;
};

module.exports = {
    obtenerSesiones,
    obtenerSesionesPorUsuario,
    obtenerSesionPorId,
    obtenerSesionPorReserva,
    obtenerReservaPorId,
    crearSesion,
    actualizarSesion,
    cambiarEstadoSesion,
    eliminarSesion,
    tieneSesionesProgramadas
};