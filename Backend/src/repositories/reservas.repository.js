const pool = require('../database/connection');

const obtenerReservas = async () => {
    const query = `
        SELECT
            r.id_reserva,
            r.fecha,
            r.hora_inicio,
            r.hora_fin,
            r.motivo,
            r.estado,
            r.fecha_creacion,

            r.id_camara,
            c.nombre AS camara,

            r.id_usuario_solicitante,
            u.nombre AS nombre_solicitante,
            u.apellido AS apellido_solicitante,
            u.correo AS correo_solicitante, 

            ro.id_rol,
            ro.nombre_rol AS rol_solicitante,

            r.id_grupo,
            g.nombre AS grupo
        FROM reservas r
        INNER JOIN camaras_gesell c ON r.id_camara = c.id_camara
        INNER JOIN usuarios u ON r.id_usuario_solicitante = u.id_usuario
        INNER JOIN roles ro ON u.id_rol = ro.id_rol
        INNER JOIN grupos g ON r.id_grupo = g.id_grupo
        ORDER BY r.fecha DESC, r.hora_inicio ASC;
    `;

    const [rows] = await pool.query(query);
    return rows;
};

const obtenerReservasPorUsuario = async (id_usuario) => {
    const query = `
        SELECT
            r.id_reserva,
            r.fecha,
            r.hora_inicio,
            r.hora_fin,
            r.motivo,
            r.estado,
            r.fecha_creacion,

            r.id_camara,
            c.nombre AS camara,

            r.id_usuario_solicitante,
            u.nombre AS nombre_solicitante,
            u.apellido AS apellido_solicitante,

            ro.id_rol,
            ro.nombre_rol AS rol_solicitante,

            r.id_grupo,
            g.nombre AS grupo
        FROM reservas r
        INNER JOIN camaras_gesell c ON r.id_camara = c.id_camara
        INNER JOIN usuarios u ON r.id_usuario_solicitante = u.id_usuario
        INNER JOIN roles ro ON u.id_rol = ro.id_rol
        INNER JOIN grupos g ON r.id_grupo = g.id_grupo
        INNER JOIN grupo_usuarios gu ON r.id_grupo = gu.id_grupo
        WHERE gu.id_usuario = ?
        ORDER BY r.fecha DESC, r.hora_inicio ASC;
    `;

    const [rows] = await pool.query(query, [id_usuario]);
    return rows;
};

const obtenerReservaPorId = async (id_reserva) => {
    const query = `
        SELECT
            r.id_reserva,
            r.fecha,
            r.hora_inicio,
            r.hora_fin,
            r.motivo,
            r.estado,
            r.fecha_creacion,

            r.id_camara,
            c.nombre AS camara,

            r.id_usuario_solicitante,
            u.nombre AS nombre_solicitante,
            u.apellido AS apellido_solicitante,
            u.correo AS correo_solicitante,

            ro.id_rol,
            ro.nombre_rol AS rol_solicitante,

            r.id_grupo,
            g.nombre AS grupo
        FROM reservas r
        INNER JOIN camaras_gesell c ON r.id_camara = c.id_camara
        INNER JOIN usuarios u ON r.id_usuario_solicitante = u.id_usuario
        INNER JOIN roles ro ON u.id_rol = ro.id_rol
        INNER JOIN grupos g ON r.id_grupo = g.id_grupo
        WHERE r.id_reserva = ?
        LIMIT 1;
    `;

    const [rows] = await pool.query(query, [id_reserva]);
    return rows[0];
};

const obtenerUsuarioPorId = async (id_usuario) => {
    const query = `
        SELECT
            u.id_usuario,
            u.nombre,
            u.apellido,
            u.correo,
            u.id_rol,
            ro.nombre_rol
        FROM usuarios u
        INNER JOIN roles ro ON u.id_rol = ro.id_rol
        WHERE u.id_usuario = ?
        LIMIT 1;
    `;

    const [rows] = await pool.query(query, [id_usuario]);
    return rows[0];
};

const obtenerGruposPorUsuario = async (id_usuario) => {
    const query = `
        SELECT
            g.id_grupo,
            g.nombre,
            g.descripcion,
            g.id_docente_responsable,
            gu.rol_en_grupo
        FROM grupo_usuarios gu
        INNER JOIN grupos g ON gu.id_grupo = g.id_grupo
        WHERE gu.id_usuario = ?
          AND g.activo = TRUE;
    `;

    const [rows] = await pool.query(query, [id_usuario]);
    return rows;
};

const usuarioPerteneceAGrupo = async (id_usuario, id_grupo) => {
    const query = `
        SELECT *
        FROM grupo_usuarios
        WHERE id_usuario = ?
          AND id_grupo = ?
        LIMIT 1;
    `;

    const [rows] = await pool.query(query, [id_usuario, id_grupo]);
    return rows.length > 0;
};

const existeConflictoHorario = async (id_camara, fecha, hora_inicio, hora_fin, excluir_id = null) => {
    const query = `
        SELECT id_reserva 
        FROM reservas
        WHERE id_camara = ?
          AND fecha = ?
          AND estado NOT IN ('Rechazada', 'Cancelada')
          AND hora_inicio < ?
          AND hora_fin > ?
          ${excluir_id ? 'AND id_reserva != ?' : ''}
        LIMIT 1;
    `;

    const params = excluir_id
        ? [id_camara, fecha, hora_fin, hora_inicio, excluir_id]
        : [id_camara, fecha, hora_fin, hora_inicio];

    const [rows] = await pool.query(query, params);
    return rows.length > 0;
};

const crearReserva = async (reserva) => {
    const {
        id_camara,
        id_usuario_solicitante,
        id_grupo,
        fecha,
        hora_inicio,
        hora_fin,
        motivo
    } = reserva;

    const query = `
        INSERT INTO reservas 
        (id_camara, id_usuario_solicitante, id_grupo, fecha, hora_inicio, hora_fin, motivo)
        VALUES (?, ?, ?, ?, ?, ?, ?);
    `;

    const [result] = await pool.query(query, [
        id_camara,
        id_usuario_solicitante,
        id_grupo,
        fecha,
        hora_inicio,
        hora_fin,
        motivo ?? null
    ]);

    return result.insertId;
};

const cambiarEstadoReserva = async (id_reserva, estado) => {
    const query = `
        UPDATE reservas 
        SET estado = ? 
        WHERE id_reserva = ?;
    `;

    const [result] = await pool.query(query, [estado, id_reserva]);
    return result.affectedRows;
};

const eliminarReserva = async (id_reserva) => {
    const query = `
        DELETE FROM reservas 
        WHERE id_reserva = ?;
    `;

    const [result] = await pool.query(query, [id_reserva]);
    return result.affectedRows;
};

module.exports = {
    obtenerReservas,
    obtenerReservasPorUsuario,
    obtenerReservaPorId,
    obtenerUsuarioPorId,
    obtenerGruposPorUsuario,
    usuarioPerteneceAGrupo,
    existeConflictoHorario,
    crearReserva,
    cambiarEstadoReserva,
    eliminarReserva
};