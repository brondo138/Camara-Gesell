const pool = require('../database/connection');

// ─── FILTRO BASE reutilizable ─────────────────────────────────────────────────
// Construye el WHERE dinámico según rol y periodo
function buildWhere(id_usuario, id_rol, mes, anio, alias = 'r') {
    const conditions = []
    const params     = []

    // Docente y estudiante solo ven sus propios datos
    if (parseInt(id_rol) !== 1) {
        conditions.push(`${alias}.id_usuario_solicitante = ?`)
        params.push(id_usuario)
    }

    if (mes && mes !== 'todos') {
        conditions.push(`MONTH(r.fecha) = ?`)
        params.push(parseInt(mes))
    }

    if (anio && anio !== 'todos') {
        conditions.push(`YEAR(r.fecha) = ?`)
        params.push(parseInt(anio))
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    return { where, params }
}

// ─── KPIs GENERALES ───────────────────────────────────────────────────────────
const obtenerResumen = async (id_usuario, id_rol, mes, anio) => {
    const { where, params } = buildWhere(id_usuario, id_rol, mes, anio)

    const query = `
        SELECT
            COUNT(DISTINCT r.id_reserva)                                        AS total_reservas,
            COUNT(DISTINCT s.id_sesion)                                         AS total_sesiones,
            SUM(
                COALESCE(
                    TIME_TO_SEC(TIMEDIFF(r.hora_fin, r.hora_inicio)) / 60, 0
                )
            )                                                                   AS total_minutos,
            COUNT(DISTINCT g.id_grabacion)                                      AS total_grabaciones,
            COUNT(DISTINCT o.id_observacion)                                    AS total_observaciones,
            COUNT(DISTINCT CASE WHEN s.estado = 'Realizada'  THEN s.id_sesion END) AS sesiones_realizadas,
            COUNT(DISTINCT CASE WHEN s.estado = 'Cancelada'  THEN s.id_sesion END) AS sesiones_canceladas,
            COUNT(DISTINCT CASE WHEN s.estado = 'Programada' THEN s.id_sesion END) AS sesiones_programadas
        FROM reservas r
        LEFT JOIN sesiones s    ON s.id_reserva    = r.id_reserva
        LEFT JOIN grabaciones g ON g.id_sesion     = s.id_sesion
        LEFT JOIN observaciones o ON o.id_sesion   = s.id_sesion
        ${where};
    `
    const [rows] = await pool.query(query, params)
    return rows[0]
}

// ─── USO POR SALA ─────────────────────────────────────────────────────────────
const obtenerUsoSalas = async (id_usuario, id_rol, mes, anio) => {
    const { where, params } = buildWhere(id_usuario, id_rol, mes, anio)

    const query = `
        SELECT
            c.id_camara,
            c.nombre                                                            AS camara,
            COUNT(DISTINCT s.id_sesion)                                         AS total_sesiones,
            SUM(
                COALESCE(
                    TIME_TO_SEC(TIMEDIFF(r.hora_fin, r.hora_inicio)) / 60, 0
                )
            )                                                                   AS total_minutos
        FROM reservas r
        INNER JOIN camaras_gesell c ON r.id_camara  = c.id_camara
        LEFT  JOIN sesiones s       ON s.id_reserva = r.id_reserva
        ${where}
        GROUP BY c.id_camara, c.nombre
        ORDER BY total_sesiones DESC;
    `
    const [rows] = await pool.query(query, params)
    return rows
}

// ─── CONTEO POR ESTADO ────────────────────────────────────────────────────────
const obtenerEstados = async (id_usuario, id_rol, mes, anio) => {
    const { where, params } = buildWhere(id_usuario, id_rol, mes, anio)

    const query = `
        SELECT
            s.estado,
            COUNT(s.id_sesion) AS total
        FROM reservas r
        INNER JOIN sesiones s ON s.id_reserva = r.id_reserva
        ${where}
        GROUP BY s.estado
        ORDER BY total DESC;
    `
    const [rows] = await pool.query(query, params)
    return rows
}

// ─── ACTIVIDAD DOCENTE ────────────────────────────────────────────────────────
const obtenerActividadDocentes = async (id_usuario, id_rol, mes, anio) => {
    const { where, params } = buildWhere(id_usuario, id_rol, mes, anio)

    const query = `
        SELECT
            u.id_usuario,
            u.nombre                                AS nombre_docente,
            u.apellido                              AS apellido_docente,
            COUNT(DISTINCT s.id_sesion)             AS total_sesiones,
            COUNT(DISTINCT o.id_observacion)        AS total_observaciones,
            SUM(
                COALESCE(
                    TIME_TO_SEC(TIMEDIFF(r.hora_fin, r.hora_inicio)) / 60, 0
                )
            )                                       AS total_minutos
        FROM reservas r
        INNER JOIN usuarios u   ON r.id_usuario_solicitante = u.id_usuario
        INNER JOIN roles ro     ON u.id_rol = ro.id_rol
        LEFT  JOIN sesiones s   ON s.id_reserva = r.id_reserva
        LEFT  JOIN observaciones o ON o.id_sesion = s.id_sesion
        ${where ? where + ' AND' : 'WHERE'} ro.id_rol = 2
        GROUP BY u.id_usuario, u.nombre, u.apellido
        ORDER BY total_sesiones DESC;
    `
    const [rows] = await pool.query(query, params)
    return rows
}

// ─── TABLA DETALLE ────────────────────────────────────────────────────────────
const obtenerDetalle = async (id_usuario, id_rol, mes, anio) => {
    const { where, params } = buildWhere(id_usuario, id_rol, mes, anio)

    const query = `
        SELECT
            s.id_sesion,
            s.titulo,
            s.estado,
            r.fecha,
            r.hora_inicio,
            r.hora_fin,
            TIME_TO_SEC(TIMEDIFF(r.hora_fin, r.hora_inicio)) / 60   AS duracion_minutos,
            c.nombre                                                  AS camara,
            u.nombre                                                  AS nombre_solicitante,
            u.apellido                                                AS apellido_solicitante,
            ro.nombre_rol                                             AS rol_solicitante,
            COUNT(DISTINCT o.id_observacion)                          AS total_observaciones,
            COUNT(DISTINCT g.id_grabacion)                            AS total_grabaciones
        FROM reservas r
        INNER JOIN sesiones s       ON s.id_reserva = r.id_reserva
        INNER JOIN camaras_gesell c ON r.id_camara  = c.id_camara
        INNER JOIN usuarios u       ON r.id_usuario_solicitante = u.id_usuario
        INNER JOIN roles ro         ON u.id_rol = ro.id_rol
        LEFT  JOIN observaciones o  ON o.id_sesion = s.id_sesion
        LEFT  JOIN grabaciones g    ON g.id_sesion = s.id_sesion
        ${where}
        GROUP BY
            s.id_sesion, s.titulo, s.estado,
            r.fecha, r.hora_inicio, r.hora_fin,
            c.nombre, u.nombre, u.apellido, ro.nombre_rol
        ORDER BY r.fecha DESC, r.hora_inicio DESC;
    `
    const [rows] = await pool.query(query, params)
    return rows
}

module.exports = {
    obtenerResumen,
    obtenerUsoSalas,
    obtenerEstados,
    obtenerActividadDocentes,
    obtenerDetalle
}