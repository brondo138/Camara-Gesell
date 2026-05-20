import { useState, useEffect, useContext } from "react";
import AuthContext from "../context/AuthContext"; // ajustá el path si es distinto

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

// ─── helpers ────────────────────────────────────────────────────────────────
const estadoBadge = (activa) =>
  activa ? (
    <span className="badge badge-activa">Disponible</span>
  ) : (
    <span className="badge badge-inactiva">No disponible</span>
  );

// ─── modal de crear / editar ─────────────────────────────────────────────────
function CamaraModal({ camara, onClose, onSave }) {
  const inicial = {
    nombre: "",
    ubicacion: "",
    descripcion: "",
    activa: true,
  };
  const [form, setForm] = useState(camara ?? inicial);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError(err.message || "Error al guardar");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">
          {camara ? "Editar cámara" : "Nueva cámara"}
        </h2>

        {error && <p className="form-error">{error}</p>}

        <form onSubmit={handleSubmit} className="camara-form">
          <div className="form-group">
            <label>Nombre *</label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
              placeholder="Ej: Cámara A1"
            />
          </div>

          <div className="form-group">
            <label>Ubicación *</label>
            <input
              name="ubicacion"
              value={form.ubicacion}
              onChange={handleChange}
              required
              placeholder="Ej: Sala 203"
            />
          </div>

          <div className="form-group">
            <label>Descripción</label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              rows={3}
              placeholder="Detalles opcionales..."
            />
          </div>

          <div className="form-group form-check">
            <input
              type="checkbox"
              id="activa"
              name="activa"
              checked={form.activa}
              onChange={handleChange}
            />
            <label htmlFor="activa">Activa / Disponible</label>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={cargando}>
              {cargando ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── componente principal ────────────────────────────────────────────────────
export default function Camaras() {
  const { user } = useContext(AuthContext); // { rol: 'admin' | 'docente' | 'estudiante', token }
  const esAdmin = user?.nombre_rol === "Administrador";

  const [camaras, setCamaras] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [camaraEditando, setCamaraEditando] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [confirmEliminar, setConfirmEliminar] = useState(null);

  // ── fetch ──────────────────────────────────────────────────────────────────
  const fetchCamaras = async () => {
    setCargando(true);
    setError("");
    try {
      const endpoint = esAdmin ? "/api/camaras" : "/api/camaras/disponibles";
      const res = await fetch(`${API}${endpoint}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      if (!res.ok) throw new Error("No se pudieron cargar las cámaras");
      const data = await res.json();
      setCamaras(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchCamaras();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── CRUD ───────────────────────────────────────────────────────────────────
  const guardarCamara = async (form) => {
    const metodo = camaraEditando ? "PUT" : "POST";
    const url = camaraEditando
      ? `${API}/api/camaras/${camaraEditando.id_camara}`
      : `${API}/api/camaras`;

    const res = await fetch(url, {
      method: metodo,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user?.token}`,
      },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Error al guardar");
    }
    await fetchCamaras();
  };

  const toggleActiva = async (camara) => {
    try {
      const res = await fetch(`${API}/api/camaras/${camara.id_camara}/toggle`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      if (!res.ok) throw new Error();
      await fetchCamaras();
    } catch {
      alert("No se pudo cambiar el estado de la cámara");
    }
  };

  const eliminarCamara = async (id) => {
    try {
      const res = await fetch(`${API}/api/camaras/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      if (!res.ok) throw new Error();
      setConfirmEliminar(null);
      await fetchCamaras();
    } catch {
      alert("No se pudo eliminar la cámara");
    }
  };

  // ── filtro ─────────────────────────────────────────────────────────────────
  const camarasFiltradas = camaras.filter(
    (c) =>
      c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.ubicacion.toLowerCase().includes(busqueda.toLowerCase())
  );

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="page-camaras">
      <style>{styles}</style>

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <span className="icon">📷</span> Cámaras
          </h1>
          <p className="page-subtitle">
            {esAdmin
              ? "Administrá el inventario de cámaras físicas"
              : "Cámaras disponibles para reservar"}
          </p>
        </div>

        {esAdmin && (
          <button
            className="btn btn-primary"
            onClick={() => {
              setCamaraEditando(null);
              setModalAbierto(true);
            }}
          >
            + Nueva cámara
          </button>
        )}
      </div>

      {/* Buscador */}
      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Buscar por nombre o ubicación…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* Estados */}
      {cargando && <p className="estado-msg">Cargando cámaras…</p>}
      {error && <p className="estado-msg error">{error}</p>}

      {/* Grid de tarjetas */}
      {!cargando && !error && (
        <>
          {camarasFiltradas.length === 0 ? (
            <div className="empty-state">
              <span>📷</span>
              <p>No se encontraron cámaras</p>
            </div>
          ) : (
            <div className="camaras-grid">
              {camarasFiltradas.map((camara) => (
                <div
                  key={camara.id_camara}
                  className={`camara-card ${!camara.activa ? "inactiva" : ""}`}
                >
                  <div className="card-header-row">
                    <h3 className="camara-nombre">{camara.nombre}</h3>
                    {estadoBadge(camara.activa)}
                  </div>

                  <p className="camara-ubicacion">
                    📍 {camara.ubicacion}
                  </p>

                  {camara.descripcion && (
                    <p className="camara-descripcion">{camara.descripcion}</p>
                  )}

                  {/* Acciones solo para admin */}
                  {esAdmin && (
                    <div className="card-actions">
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => {
                          setCamaraEditando(camara);
                          setModalAbierto(true);
                        }}
                      >
                        ✏️ Editar
                      </button>

                      <button
                        className={`btn btn-sm ${
                          camara.activa ? "btn-warning" : "btn-success"
                        }`}
                        onClick={() => toggleActiva(camara)}
                      >
                        {camara.activa ? "⏸ Desactivar" : "▶ Activar"}
                      </button>

                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => setConfirmEliminar(camara)}
                      >
                        🗑 Eliminar
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal crear / editar */}
      {modalAbierto && (
        <CamaraModal
          camara={camaraEditando}
          onClose={() => setModalAbierto(false)}
          onSave={guardarCamara}
        />
      )}

      {/* Confirm eliminar */}
      {confirmEliminar && (
        <div className="modal-overlay" onClick={() => setConfirmEliminar(null)}>
          <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">¿Eliminar cámara?</h2>
            <p>
              Vas a eliminar <strong>{confirmEliminar.nombre}</strong>. Esta
              acción no se puede deshacer.
            </p>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setConfirmEliminar(null)}
              >
                Cancelar
              </button>
              <button
                className="btn btn-danger"
                onClick={() => eliminarCamara(confirmEliminar.id_camara)}
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── estilos scoped ──────────────────────────────────────────────────────────
const styles = `
  .page-camaras {
    padding: 2rem;
    max-width: 1100px;
    margin: 0 auto;
    font-family: 'Segoe UI', sans-serif;
    color: #e2e8f0;
  }

  /* Header */
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
  }
  .page-title {
    font-size: 1.8rem;
    font-weight: 700;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .page-subtitle {
    margin: 0.25rem 0 0;
    color: #94a3b8;
    font-size: 0.95rem;
  }

  /* Buscador */
  .search-bar {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 10px;
    padding: 0.5rem 1rem;
    margin-bottom: 1.5rem;
  }
  .search-bar input {
    background: transparent;
    border: none;
    outline: none;
    color: #e2e8f0;
    font-size: 0.95rem;
    width: 100%;
  }
  .search-icon { font-size: 1rem; color: #64748b; }

  /* Grid */
  .camaras-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.25rem;
  }

  /* Tarjeta */
  .camara-card {
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 14px;
    padding: 1.25rem;
    transition: box-shadow 0.2s;
  }
  .camara-card:hover {
    box-shadow: 0 4px 20px rgba(0,0,0,0.35);
  }
  .camara-card.inactiva {
    opacity: 0.6;
    border-style: dashed;
  }

  .card-header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  .camara-nombre {
    font-size: 1.05rem;
    font-weight: 600;
    margin: 0;
  }
  .camara-ubicacion {
    font-size: 0.85rem;
    color: #94a3b8;
    margin: 0.25rem 0;
  }
  .camara-descripcion {
    font-size: 0.85rem;
    color: #cbd5e1;
    margin: 0.5rem 0;
    line-height: 1.4;
  }

  /* Badges */
  .badge {
    font-size: 0.72rem;
    font-weight: 600;
    padding: 0.2rem 0.6rem;
    border-radius: 999px;
    white-space: nowrap;
  }
  .badge-activa  { background: #064e3b; color: #6ee7b7; }
  .badge-inactiva{ background: #3b1f1f; color: #fca5a5; }

  /* Acciones de tarjeta */
  .card-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
    flex-wrap: wrap;
  }

  /* Botones */
  .btn {
    cursor: pointer;
    border: none;
    border-radius: 8px;
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
    font-weight: 500;
    transition: filter 0.15s, transform 0.1s;
  }
  .btn:hover  { filter: brightness(1.15); }
  .btn:active { transform: scale(0.97); }

  .btn-sm { padding: 0.35rem 0.75rem; font-size: 0.8rem; }

  .btn-primary   { background: #3b82f6; color: #fff; }
  .btn-secondary { background: #334155; color: #e2e8f0; }
  .btn-success   { background: #059669; color: #fff; }
  .btn-warning   { background: #d97706; color: #fff; }
  .btn-danger    { background: #dc2626; color: #fff; }

  /* Empty / loading */
  .empty-state {
    text-align: center;
    padding: 4rem 2rem;
    color: #64748b;
  }
  .empty-state span { font-size: 3rem; display: block; margin-bottom: 1rem; }
  .estado-msg { text-align: center; color: #94a3b8; padding: 2rem; }
  .estado-msg.error { color: #f87171; }

  /* Modal */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    padding: 1rem;
  }
  .modal {
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 16px;
    padding: 2rem;
    width: 100%;
    max-width: 480px;
  }
  .modal-sm { max-width: 360px; }
  .modal-title {
    font-size: 1.2rem;
    font-weight: 700;
    margin: 0 0 1.25rem;
  }

  /* Form */
  .camara-form { display: flex; flex-direction: column; gap: 1rem; }
  .form-group { display: flex; flex-direction: column; gap: 0.3rem; }
  .form-group label { font-size: 0.85rem; color: #94a3b8; font-weight: 500; }
  .form-group input,
  .form-group textarea {
    background: #0f172a;
    border: 1px solid #334155;
    border-radius: 8px;
    padding: 0.55rem 0.75rem;
    color: #e2e8f0;
    font-size: 0.9rem;
    outline: none;
    transition: border-color 0.15s;
    resize: vertical;
  }
  .form-group input:focus,
  .form-group textarea:focus { border-color: #3b82f6; }
  .form-check { flex-direction: row !important; align-items: center; gap: 0.5rem !important; }
  .form-check input { width: auto; }
  .form-check label { margin: 0; color: #e2e8f0 !important; }
  .form-error { color: #f87171; font-size: 0.85rem; margin: 0 0 0.5rem; }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    margin-top: 0.5rem;
  }
`;