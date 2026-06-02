const connection = require('../database/connection');

const GruposRepository = {
    async obtenerTodos() {
        const [rows] = await connection.query(`
            SELECT 
                g.id_grupo,
                g.nombre,
                g.descripcion,
                g.id_docente_responsable,
                CONCAT(u.nombre, ' ', u.apellido) AS docente_responsable,
                g.activo,
                g.fecha_creacion
            FROM grupos g
            INNER JOIN usuarios u ON g.id_docente_responsable = u.id_usuario
            ORDER BY g.id_grupo DESC
        `);

        return rows;
    },

    async obtenerPorId(id_grupo) {
        const [rows] = await connection.query(`
            SELECT 
                g.id_grupo,
                g.nombre,
                g.descripcion,
                g.id_docente_responsable,
                CONCAT(u.nombre, ' ', u.apellido) AS docente_responsable,
                g.activo,
                g.fecha_creacion
            FROM grupos g
            INNER JOIN usuarios u ON g.id_docente_responsable = u.id_usuario
            WHERE g.id_grupo = ?
        `, [id_grupo]);

        return rows[0];
    },

    async obtenerUsuarioPorId(id_usuario) {
        const [rows] = await connection.query(`
            SELECT 
                u.id_usuario,
                u.nombre,
                u.apellido,
                u.correo,
                u.id_rol,
                r.nombre_rol
            FROM usuarios u
            INNER JOIN roles r ON u.id_rol = r.id_rol
            WHERE u.id_usuario = ?
        `, [id_usuario]);

        return rows[0];
    },

    async crearGrupo(grupo) {
        const {
            nombre,
            descripcion,
            id_docente_responsable
        } = grupo;

        const [result] = await connection.query(`
            INSERT INTO grupos 
            (nombre, descripcion, id_docente_responsable)
            VALUES (?, ?, ?)
        `, [nombre, descripcion, id_docente_responsable]);

        return {
            id_grupo: result.insertId,
            nombre,
            descripcion,
            id_docente_responsable
        };
    },

    async actualizarGrupo(id_grupo, grupo) {
        const {
            nombre,
            descripcion,
            id_docente_responsable,
            activo
        } = grupo;

        const [result] = await connection.query(`
            UPDATE grupos
            SET 
                nombre = ?,
                descripcion = ?,
                id_docente_responsable = ?,
                activo = ?
            WHERE id_grupo = ?
        `, [nombre, descripcion, id_docente_responsable, activo, id_grupo]);

        return result.affectedRows;
    },

    async eliminarGrupo(id_grupo) {
        const [result] = await connection.query(`
            DELETE FROM grupos
            WHERE id_grupo = ?
        `, [id_grupo]);

        return result.affectedRows;
    },

    async asignarUsuarioGrupo(id_grupo, id_usuario, rol_en_grupo) {
        const [result] = await connection.query(`
            INSERT INTO grupo_usuarios
            (id_grupo, id_usuario, rol_en_grupo)
            VALUES (?, ?, ?)
        `, [id_grupo, id_usuario, rol_en_grupo]);

        return result.affectedRows;
    },

    async usuarioYaEstaEnGrupo(id_grupo, id_usuario) {
        const [rows] = await connection.query(`
            SELECT *
            FROM grupo_usuarios
            WHERE id_grupo = ? AND id_usuario = ?
        `, [id_grupo, id_usuario]);

        return rows.length > 0;
    },

    async obtenerUsuariosGrupo(id_grupo) {
        const [rows] = await connection.query(`
            SELECT
                gu.id_grupo,
                gu.id_usuario,
                u.nombre,
                u.apellido,
                u.correo,
                r.nombre_rol AS rol_sistema,
                gu.rol_en_grupo,
                gu.fecha_asignacion
            FROM grupo_usuarios gu
            INNER JOIN usuarios u ON gu.id_usuario = u.id_usuario
            INNER JOIN roles r ON u.id_rol = r.id_rol
            WHERE gu.id_grupo = ?
            ORDER BY gu.rol_en_grupo ASC, u.nombre ASC
        `, [id_grupo]);

        return rows;
    },

    async quitarUsuarioGrupo(id_grupo, id_usuario) {
        const [result] = await connection.query(`
            DELETE FROM grupo_usuarios
            WHERE id_grupo = ? AND id_usuario = ?
        `, [id_grupo, id_usuario]);

        return result.affectedRows;
    },

    async obtenerGrupoPorDocenteResponsable(id_grupo) {
        const [rows] = await connection.query(`
            SELECT id_docente_responsable
            FROM grupos
            WHERE id_grupo = ?
        `, [id_grupo]);

        return rows[0];
    }
};

module.exports = GruposRepository;