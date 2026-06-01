const pool = require('../database/connection');

// ─── SELECT BASE reutilizable ─────────────────────────────────────────────────
const SELECT_GRABACION = `
    SELECT
        g.id_grabacion,
        g.id_sesion,
        g.titulo,
        g.url_video,
        g.descripcion,
        g.fecha_subida,
        g.visible,
        s.id_reserva,
        r.fecha            AS fecha_sesion,
        r.hora_inicio,
        r.hora_fin,
        c.id_camara,
        c.nombre           AS camara,
        r.id_usuario_solicitante,
        u.nombre           AS nombre_solicitante,
        u.apellido         AS apellido_solicitante,
        ro.id_rol,
        ro.nombre_rol      AS rol_solicitante
    FROM grabaciones g
    INNER JOIN sesiones s         ON g.id_sesion = s.id_sesion
    INNER JOIN reservas r         ON s.id_reserva = r.id_reserva
    INNER JOIN camaras_gesell c   ON r.id_camara = c.id_camara
    INNER JOIN usuarios u         ON r.id_usuario_solicitante = u.id_usuario
    INNER JOIN roles ro           ON u.id_rol = ro.id_rol
`;

const obtenerGrabaciones = async () => {
    const query = `${SELECT_GRABACION} ORDER BY g.fecha_subida DESC;`;
    const [rows] = await pool.query(query);
    return rows;
};

const obtenerGrabacionesPorUsuario = async (id_usuario) => {
    const query = `
        ${SELECT_GRABACION}
        WHERE r.id_usuario_solicitante = ? AND g.visible = 1
        ORDER BY g.fecha_subida DESC;
    `;
    const [rows] = await pool.query(query, [id_usuario]);
    return rows;
};

const obtenerGrabacionPorId = async (id_grabacion) => {
    const query = `${SELECT_GRABACION} WHERE g.id_grabacion = ? LIMIT 1;`;
    const [rows] = await pool.query(query, [id_grabacion]);
    return rows[0];
};

const obtenerGrabacionesPorSesion = async (id_sesion) => {
    const query = `
        ${SELECT_GRABACION}
        WHERE g.id_sesion = ?
        ORDER BY g.fecha_subida DESC;
    `;
    const [rows] = await pool.query(query, [id_sesion]);
    return rows;
};

const crearGrabacion = async (grabacion) => {
    const { id_sesion, titulo, url_video, descripcion, visible } = grabacion;
    const query = `
        INSERT INTO grabaciones (id_sesion, titulo, url_video, descripcion, visible)
        VALUES (?, ?, ?, ?, ?);
    `;
    const [result] = await pool.query(query, [
        id_sesion,
        titulo,
        url_video,
        descripcion ?? null,
        visible !== undefined ? visible : 1
    ]);
    return result.insertId;
};

const actualizarGrabacion = async (id_grabacion, grabacion) => {
    const { titulo, url_video, descripcion, visible } = grabacion;
    const query = `
        UPDATE grabaciones
        SET titulo = ?, url_video = ?, descripcion = ?, visible = ?
        WHERE id_grabacion = ?;
    `;
    const [result] = await pool.query(query, [
        titulo,
        url_video,
        descripcion ?? null,
        visible !== undefined ? visible : 1,
        id_grabacion
    ]);
    return result.affectedRows;
};

const cambiarVisibilidad = async (id_grabacion, visible) => {
    const query = `UPDATE grabaciones SET visible = ? WHERE id_grabacion = ?;`;
    const [result] = await pool.query(query, [visible, id_grabacion]);
    return result.affectedRows;
};

const eliminarGrabacion = async (id_grabacion) => {
    const query = `DELETE FROM grabaciones WHERE id_grabacion = ?;`;
    const [result] = await pool.query(query, [id_grabacion]);
    return result.affectedRows;
};

// ─── ETIQUETAS ────────────────────────────────────────────────────────────────

const obtenerEtiquetas = async () => {
    const [rows] = await pool.query(`SELECT * FROM etiquetas ORDER BY nombre ASC;`);
    return rows;
};

const obtenerEtiquetasPorGrabacion = async (id_grabacion) => {
    const query = `
        SELECT e.id_etiqueta, e.nombre
        FROM etiquetas e
        INNER JOIN grabaciones_etiquetas ge ON e.id_etiqueta = ge.id_etiqueta
        WHERE ge.id_grabacion = ?
        ORDER BY e.nombre ASC;
    `;
    const [rows] = await pool.query(query, [id_grabacion]);
    return rows;
};

const sincronizarEtiquetas = async (id_grabacion, ids_etiquetas, conn = pool) => {
    // Borrar las actuales y reinsertar las nuevas
    await conn.query(
        `DELETE FROM grabaciones_etiquetas WHERE id_grabacion = ?`,
        [id_grabacion]
    );
    if (ids_etiquetas.length > 0) {
        const values = ids_etiquetas.map(id => [id_grabacion, id]);
        await conn.query(
            `INSERT INTO grabaciones_etiquetas (id_grabacion, id_etiqueta) VALUES ?`,
            [values]
        );
    }
};

module.exports = {
    obtenerGrabaciones,
    obtenerGrabacionesPorUsuario,
    obtenerGrabacionPorId,
    obtenerGrabacionesPorSesion,
    crearGrabacion,
    actualizarGrabacion,
    cambiarVisibilidad,
    eliminarGrabacion,
    obtenerEtiquetas,
    obtenerEtiquetasPorGrabacion,
    sincronizarEtiquetas
};