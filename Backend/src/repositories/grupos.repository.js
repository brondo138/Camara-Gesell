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

    async obtenerPorUsuario(id_usuario) {
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
            INNER JOIN grupo_usuarios gu ON gu.id_grupo = g.id_grupo
            WHERE gu.id_usuario = ?
            ORDER BY g.id_grupo DESC
        `, [id_usuario]);

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
    // 1. Verificar si tiene miembros que NO sean el docente responsable
    const [miembros] = await connection.query(
        `SELECT gu.id_usuario 
         FROM grupo_usuarios gu
         INNER JOIN grupos g ON g.id_grupo = gu.id_grupo
         WHERE gu.id_grupo = ?
           AND gu.id_usuario != g.id_docente_responsable
         LIMIT 1`,
        [id_grupo]
    );

    if (miembros.length > 0) {
        const error = new Error('No se puede eliminar el grupo porque tiene usuarios asignados.');
        error.statusCode = 409;
        throw error;
    }

    // 2. Verificar si tiene reservas/sesiones asociadas
    const [reservas] = await connection.query(
        `SELECT id_reserva FROM reservas WHERE id_grupo = ? LIMIT 1`,
        [id_grupo]
    );

    if (reservas.length > 0) {
        const error = new Error('No se puede eliminar el grupo porque tiene sesiones asociadas.');
        error.statusCode = 409;
        throw error;
    }

    // 3. Borrar al docente de grupo_usuarios antes de eliminar el grupo
    await connection.query(
        `DELETE FROM grupo_usuarios WHERE id_grupo = ?`,
        [id_grupo]
    );

    // 4. Eliminar el grupo
    const [result] = await connection.query(
        `DELETE FROM grupos WHERE id_grupo = ?`,
        [id_grupo]
    );

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

    async actualizarDocenteResponsable(id_grupo, id_docente_responsable) {
        const [result] = await connection.query(`
            UPDATE grupos
            SET id_docente_responsable = ?
            WHERE id_grupo = ?
        `, [id_docente_responsable, id_grupo]);

        return result.affectedRows;
    },

    async asignarOActualizarUsuarioGrupo(id_grupo, id_usuario, rol_en_grupo) {
        const [result] = await connection.query(`
            INSERT INTO grupo_usuarios
            (id_grupo, id_usuario, rol_en_grupo)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE
                rol_en_grupo = VALUES(rol_en_grupo)
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

    async quitarDocenteAnterior(id_grupo, id_usuario) {
        const [result] = await connection.query(`
            DELETE FROM grupo_usuarios
            WHERE id_grupo = ?
              AND id_usuario = ?
              AND rol_en_grupo = 'Docente'
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
