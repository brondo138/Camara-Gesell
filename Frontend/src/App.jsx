import { useMemo, useState } from 'react'
import './App.css'

const roles = [
  { id: 'admin', label: 'Administrador' },
  { id: 'psychologist', label: 'Psicólogo / Docente' },
  { id: 'student', label: 'Estudiante' },
]

const adminStats = [
  { label: 'Usuarios registrados', value: '248', detail: 'Activos en la plataforma' },
  { label: 'Psicólogos y docentes', value: '32', detail: 'Con agenda disponible' },
  { label: 'Sesiones programadas', value: '86', detail: 'Para esta semana' },
  { label: 'Reportes generados', value: '174', detail: 'Archivados y validados' },
]

const psychologistStats = [
  { label: 'Próximas sesiones', value: '5', detail: 'Agendadas para hoy y mañana' },
  { label: 'Pacientes asignados', value: '18', detail: 'Con seguimiento activo' },
  { label: 'Reportes pendientes', value: '3', detail: 'Requieren entrega' },
]

const studentStats = [
  { label: 'Próximas citas', value: '2', detail: 'Confirmadas en agenda' },
  { label: 'Sesiones realizadas', value: '7', detail: 'Registradas en historial' },
  { label: 'Reservas en revisión', value: '1', detail: 'Pendiente de aprobación' },
]

const adminActivity = [
  {
    title: 'Sesión de observación clínica',
    meta: 'Hoy, 9:00 AM',
    status: 'Confirmada',
    owner: 'Dra. Ana Gomez',
  },
  {
    title: 'Práctica docente supervisada',
    meta: 'Hoy, 11:30 AM',
    status: 'Preparando sala',
    owner: 'Lic. Carlos Mejia',
  },
  {
    title: 'Evaluación de seguimiento',
    meta: 'Mañana, 2:00 PM',
    status: 'Pendiente',
    owner: 'Mtra. Sofia Rivera',
  },
]

const psychologistSessions = [
  {
    title: 'Primera entrevista',
    meta: 'Hoy, 10:00 AM',
    patient: 'Mariana Lopez',
    status: 'Sala 2 asignada',
  },
  {
    title: 'Seguimiento conductual',
    meta: 'Hoy, 1:30 PM',
    patient: 'Diego Hernandez',
    status: 'Ficha completa',
  },
  {
    title: 'Sesión familiar',
    meta: 'Mañana, 8:00 AM',
    patient: 'Valeria Torres',
    status: 'Consentimiento pendiente',
  },
]

const psychologistDailyHistory = [
  { time: '8:00 AM', description: 'Revisión de expediente: Mariana López' },
  { time: '9:15 AM', description: 'Notas clínicas actualizadas' },
  { time: '11:00 AM', description: 'Reporte enviado a administración' },
]

const completedSessions = [
  { date: '15 mayo 2026', patient: 'Kevin Morales', result: 'Reporte generado' },
  { date: '14 mayo 2026', patient: 'Andrea Fuentes', result: 'Seguimiento sugerido' },
  { date: '13 mayo 2026', patient: 'Luis Ramírez', result: 'Caso cerrado' },
]

const assignedPatients = [
  { name: 'Mariana López', code: 'EXP-1024', priority: 'Alta' },
  { name: 'Diego Hernandez', code: 'EXP-1088', priority: 'Media' },
  { name: 'Valeria Torres', code: 'EXP-1116', priority: 'Media' },
  { name: 'Andrea Fuentes', code: 'EXP-0991', priority: 'Baja' },
]

const pendingReports = [
  { title: 'Informe inicial de Mariana López', due: 'Vence hoy' },
  { title: 'Cierre de caso de Luis Ramírez', due: 'Vence mañana' },
  { title: 'Observaciones de práctica docente', due: 'Vence en 3 días' },
]

const studentAppointments = [
  {
    title: 'Cita de orientación',
    meta: 'Viernes, 9:00 AM',
    specialist: 'Dra. Ana Gomez',
    status: 'Confirmada',
  },
  {
    title: 'Seguimiento academico',
    meta: 'Lunes, 3:30 PM',
    specialist: 'Lic. Carlos Mejía',
    status: 'Pendiente de sala',
  },
]

const studentHistory = [
  { date: '10 mayo 2026', specialist: 'Dra. Ana Gomez', result: 'Asistida' },
  { date: '3 mayo 2026', specialist: 'Lic. Carlos Mejía', result: 'Asistida' },
  { date: '26 abril 2026', specialist: 'Mtra. Sofia Rivera', result: 'Reprogramada' },
]

const reservations = [
  { request: 'Reserva de sala Gesell', date: '22 mayo 2026', state: 'Aprobada' },
  { request: 'Cambio de horario', date: '25 mayo 2026', state: 'En revisión' },
  { request: 'Nueva cita', date: '29 mayo 2026', state: 'Pendiente' },
]

function App() {
  const [activeRole, setActiveRole] = useState('admin')
  const currentRole = useMemo(
    () => roles.find((role) => role.id === activeRole),
    [activeRole],
  )

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Cámara Gesell</p>
          <h1>Panel de control por perfil</h1>
        </div>
        <nav className="role-tabs" aria-label="Seleccionar perfil">
          {roles.map((role) => (
            <button
              key={role.id}
              type="button"
              className={role.id === activeRole ? 'active' : ''}
              onClick={() => setActiveRole(role.id)}
            >
              {role.label}
            </button>
          ))}
        </nav>
      </header>

      <section className="profile-summary" aria-labelledby="profile-title">
        <div>
          <p className="eyebrow">Perfil actual</p>
          <h2 id="profile-title">{currentRole.label}</h2>
        </div>
        <p>
          {activeRole === 'admin'
            ? 'Acceso completo para supervisar usuarios, agenda institucional y reportes.'
            : activeRole === 'psychologist'
              ? 'Vista enfocada en agenda profesional, pacientes asignados y reportes clínicos.'
              : 'Vista personal para consultar citas, sesiones y estado de reservas.'}
        </p>
      </section>

      {activeRole === 'admin' && <AdminDashboard />}
      {activeRole === 'psychologist' && <PsychologistDashboard />}
      {activeRole === 'student' && <StudentDashboard />}
    </main>
  )
}

function AdminDashboard() {
  return (
    <>
      <StatsGrid stats={adminStats} />
      <section className="dashboard-grid admin-grid">
        <DataPanel title="Sesiones programadas" items={adminActivity} />
        <DataPanel
          title="Control administrativo"
          items={[
            {
              title: 'Gestión de usuarios',
              meta: 'Altas, bajas y permisos',
              status: 'Disponible',
              owner: 'Administrador',
            },
            {
              title: 'Reportes institucionales',
              meta: 'Generación y descarga',
              status: 'Actualizado',
              owner: 'Sistema',
            },
            {
              title: 'Agenda general',
              meta: 'Salas, especialistas y estudiantes',
              status: 'Sin conflictos',
              owner: 'Coordinación',
            },
          ]}
        />
      </section>
    </>
  )
}

function PsychologistDashboard() {
  return (
    <>
      <StatsGrid stats={psychologistStats} />
      <section className="dashboard-grid">
        <DataPanel title="Próximas sesiones" items={psychologistSessions} />
        <Timeline title="Historial del día" items={psychologistDailyHistory} />
        <TablePanel
          title="Historial de sesiones realizadas"
          columns={['Fecha', 'Paciente', 'Resultado']}
          rows={completedSessions.map((item) => [item.date, item.patient, item.result])}
        />
        <TablePanel
          title="Pacientes asignados"
          columns={['Paciente', 'Expediente', 'Prioridad']}
          rows={assignedPatients.map((item) => [item.name, item.code, item.priority])}
        />
        <Checklist title="Reportes pendientes de generar" items={pendingReports} />
      </section>
    </>
  )
}

function StudentDashboard() {
  return (
    <>
      <StatsGrid stats={studentStats} />
      <section className="dashboard-grid">
        <DataPanel title="Próximas citas" items={studentAppointments} />
        <TablePanel
          title="Historial de sesiones"
          columns={['Fecha', 'Especialista', 'Estado']}
          rows={studentHistory.map((item) => [item.date, item.specialist, item.result])}
        />
        <TablePanel
          title="Estado de reservas"
          columns={['Solicitud', 'Fecha', 'Estado']}
          rows={reservations.map((item) => [item.request, item.date, item.state])}
        />
      </section>
    </>
  )
}

function StatsGrid({ stats }) {
  return (
    <section className="stats-grid" aria-label="Indicadores principales">
      {stats.map((stat) => (
        <article className="stat-card" key={stat.label}>
          <span>{stat.label}</span>
          <strong>{stat.value}</strong>
          <p>{stat.detail}</p>
        </article>
      ))}
    </section>
  )
}

function DataPanel({ title, items }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      <div className="item-list">
        {items.map((item) => (
          <article className="list-item" key={`${item.title}-${item.meta}`}>
            <div>
              <h3>{item.title}</h3>
              <p>{item.meta}</p>
              {'patient' in item && <p>{item.patient}</p>}
              {'owner' in item && <p>{item.owner}</p>}
              {'specialist' in item && <p>{item.specialist}</p>}
            </div>
            <span className="status">{item.status}</span>
          </article>
        ))}
      </div>
    </section>
  )
}

function Timeline({ title, items }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      <ol className="timeline">
        {items.map((item) => (
          <li key={`${item.time}-${item.description}`}>
            <time>{item.time}</time>
            <span>{item.description}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}

function TablePanel({ title, columns, rows }) {
  return (
    <section className="panel wide-panel">
      <h2>{title}</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.join('-')}>
                {row.map((cell) => (
                  <td key={cell}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function Checklist({ title, items }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      <div className="checklist">
        {items.map((item) => (
          <label key={item.title}>
            <input type="checkbox" />
            <span>
              <strong>{item.title}</strong>
              <small>{item.due}</small>
            </span>
          </label>
        ))}
      </div>
    </section>
  )
}

export default App
