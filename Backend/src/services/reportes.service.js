const reportesRepository = require('../repositories/reportes.repository');

// Extrae y normaliza los filtros de periodo
function parseFiltros(query) {
    const { id_usuario, id_rol, mes, anio } = query
    return {
        id_usuario: id_usuario ?? null,
        id_rol:     id_rol     ?? null,
        mes:        mes        ?? 'todos',
        anio:       anio       ?? 'todos'
    }
}

const obtenerResumen = async (query) => {
    const { id_usuario, id_rol, mes, anio } = parseFiltros(query)
    const resumen = await reportesRepository.obtenerResumen(id_usuario, id_rol, mes, anio)

    const total_sesiones = parseInt(resumen.total_sesiones) || 0
    const realizadas     = parseInt(resumen.sesiones_realizadas) || 0

    return {
        total_reservas:       parseInt(resumen.total_reservas)       || 0,
        total_sesiones,
        total_minutos:        parseFloat(resumen.total_minutos)       || 0,
        total_grabaciones:    parseInt(resumen.total_grabaciones)     || 0,
        total_observaciones:  parseInt(resumen.total_observaciones)   || 0,
        sesiones_realizadas:  realizadas,
        sesiones_canceladas:  parseInt(resumen.sesiones_canceladas)   || 0,
        sesiones_programadas: parseInt(resumen.sesiones_programadas)  || 0,
        porcentaje_cumplimiento: total_sesiones > 0
            ? Math.round((realizadas / total_sesiones) * 100)
            : 0
    }
}

const obtenerUsoSalas = async (query) => {
    const { id_usuario, id_rol, mes, anio } = parseFiltros(query)
    const rows = await reportesRepository.obtenerUsoSalas(id_usuario, id_rol, mes, anio)
    return rows.map(r => ({
        id_camara:      r.id_camara,
        camara:         r.camara,
        total_sesiones: parseInt(r.total_sesiones) || 0,
        total_minutos:  parseFloat(r.total_minutos) || 0
    }))
}

const obtenerEstados = async (query) => {
    const { id_usuario, id_rol, mes, anio } = parseFiltros(query)
    const rows = await reportesRepository.obtenerEstados(id_usuario, id_rol, mes, anio)

    // Garantizar que siempre devolvemos los 3 estados aunque tengan 0
    const ESTADOS = ['Programada', 'Realizada', 'Cancelada']
    const mapa = Object.fromEntries(rows.map(r => [r.estado, parseInt(r.total) || 0]))
    return ESTADOS.map(estado => ({
        estado,
        total: mapa[estado] ?? 0
    }))
}

const obtenerActividadDocentes = async (query) => {
    const { id_usuario, id_rol, mes, anio } = parseFiltros(query)
    const rows = await reportesRepository.obtenerActividadDocentes(id_usuario, id_rol, mes, anio)
    return rows.map(r => ({
        id_usuario:          r.id_usuario,
        docente:             `${r.nombre_docente} ${r.apellido_docente}`,
        total_sesiones:      parseInt(r.total_sesiones)      || 0,
        total_observaciones: parseInt(r.total_observaciones) || 0,
        total_minutos:       parseFloat(r.total_minutos)     || 0
    }))
}

const obtenerDetalle = async (query) => {
    const { id_usuario, id_rol, mes, anio } = parseFiltros(query)
    const rows = await reportesRepository.obtenerDetalle(id_usuario, id_rol, mes, anio)
    return rows.map(r => ({
        id_sesion:            r.id_sesion,
        titulo:               r.titulo,
        estado:               r.estado,
        fecha:                r.fecha,
        hora_inicio:          r.hora_inicio?.slice(0, 5) ?? '—',
        hora_fin:             r.hora_fin?.slice(0, 5)    ?? '—',
        duracion_minutos:     parseFloat(r.duracion_minutos) || 0,
        camara:               r.camara,
        solicitante:          `${r.nombre_solicitante} ${r.apellido_solicitante}`,
        rol_solicitante:      r.rol_solicitante,
        total_observaciones:  parseInt(r.total_observaciones) || 0,
        total_grabaciones:    parseInt(r.total_grabaciones)   || 0
    }))
}

module.exports = {
    obtenerResumen,
    obtenerUsoSalas,
    obtenerEstados,
    obtenerActividadDocentes,
    obtenerDetalle
}