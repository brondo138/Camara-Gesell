import { useState } from 'react'
import './App.css'

const indicadores = [
  {
    nombre: 'ansiedad o activación emocional',
    palabras: ['ansiedad', 'nervioso', 'miedo', 'llanto', 'estres', 'estrés'],
    recomendacion: 'Dar seguimiento emocional y registrar detonantes observados.',
  },
  {
    nombre: 'dificultades de atención',
    palabras: ['atencion', 'atención', 'concentracion', 'concentración', 'distraido', 'distraído'],
    recomendacion: 'Contrastar las observaciones con tareas estructuradas o entrevista complementaria.',
  },
  {
    nombre: 'conflicto familiar o interpersonal',
    palabras: ['familia', 'conflicto', 'discusion', 'discusión', 'agresivo', 'agresión'],
    recomendacion: 'Explorar la dinámica familiar y valorar intervención psicoeducativa.',
  },
]

function App() {
  const [form, setForm] = useState({
    paciente: 'Mariana López',
    expediente: 'EXP-1024',
    responsable: 'Psicólogo / Admin',
    observaciones:
      'Se observa ansiedad leve, dificultad para mantener la atención y reserva al hablar de temas familiares.',
  })
  const [reporte, setReporte] = useState('')

  const puedeGenerar = form.paciente.trim() && form.observaciones.trim()

  function actualizarCampo(campo, valor) {
    setForm((actual) => ({ ...actual, [campo]: valor }))
  }

  function generarReporte() {
    const texto = form.observaciones.toLowerCase()
    const hallazgos = indicadores.filter((indicador) =>
      indicador.palabras.some((palabra) => texto.includes(palabra)),
    )
    const indicadoresDetectados =
      hallazgos.length > 0
        ? hallazgos
        : [
            {
              nombre: 'observación general sin indicador dominante',
              recomendacion: 'Ampliar la entrevista antes de cerrar conclusiones.',
            },
          ]

    setReporte(
      [
        `Reporte preliminar - ${form.paciente.trim()}`,
        `Expediente: ${form.expediente.trim() || 'Sin expediente'}`,
        `Responsable: ${form.responsable.trim() || 'No especificado'}`,
        '',
        'Observaciones ingresadas:',
        form.observaciones.trim(),
        '',
        'Impresión diagnóstica preliminar:',
        `El sistema identifica ${indicadoresDetectados
          .map((indicador) => indicador.nombre)
          .join(', ')}. Este resultado debe ser validado por el profesional responsable.`,
        '',
        'Recomendaciones sugeridas:',
        ...indicadoresDetectados.map((indicador) => `- ${indicador.recomendacion}`),
        '',
        'Nota: este reporte es un borrador de apoyo y no sustituye una evaluación clínica.',
      ].join('\n'),
    )
  }

  return (
    <main className="app-shell">
      <header className="page-header">
        <p>Cámara Gesell</p>
        <h1>Generador de reportes automáticos</h1>
      </header>

      <section className="report-card">
        <div className="form-grid">
          <label>
            Paciente
            <input
              value={form.paciente}
              onChange={(event) => actualizarCampo('paciente', event.target.value)}
              placeholder="Nombre del paciente"
            />
          </label>
          <label>
            Expediente
            <input
              value={form.expediente}
              onChange={(event) => actualizarCampo('expediente', event.target.value)}
              placeholder="EXP-0000"
            />
          </label>
          <label className="full-field">
            Responsable
            <input
              value={form.responsable}
              onChange={(event) => actualizarCampo('responsable', event.target.value)}
              placeholder="Psicólogo o administrador"
            />
          </label>
          <label className="full-field">
            Observaciones
            <textarea
              value={form.observaciones}
              onChange={(event) => actualizarCampo('observaciones', event.target.value)}
              rows={7}
              placeholder="Escriba conductas observadas, contexto, lenguaje verbal/no verbal e indicadores relevantes."
            />
          </label>
        </div>

        <div className="actions">
          <button type="button" onClick={generarReporte} disabled={!puedeGenerar}>
            Generar reporte
          </button>
          <button type="button" onClick={() => window.print()} disabled={!reporte}>
            Imprimir
          </button>
        </div>

        <article className="preview" aria-live="polite">
          {reporte ? <pre>{reporte}</pre> : <p>El borrador del reporte aparecerá aquí.</p>}
        </article>
      </section>
    </main>
  )
}

export default App
