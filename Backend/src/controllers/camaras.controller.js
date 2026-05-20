// Backend/src/controllers/camaras.controller.js
const camarasRepo = require("../repositories/camaras.repository");

// GET /api/camaras  (solo admin)
async function getAll(req, res) {
  try {
    const camaras = await camarasRepo.getAll();
    res.json(camaras);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener cámaras", error: error.message });
  }
}

// GET /api/camaras/disponibles  (docente y estudiante)
async function getDisponibles(req, res) {
  try {
    const camaras = await camarasRepo.getDisponibles();
    res.json(camaras);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener cámaras disponibles", error: error.message });
  }
}

// GET /api/camaras/:id  (admin)
async function getById(req, res) {
  try {
    const camara = await camarasRepo.getById(req.params.id);
    if (!camara) return res.status(404).json({ message: "Cámara no encontrada" });
    res.json(camara);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener la cámara", error: error.message });
  }
}

// POST /api/camaras  (solo admin)
async function create(req, res) {
  const { nombre, ubicacion, descripcion, activa } = req.body;

  if (!nombre?.trim() || !ubicacion?.trim()) {
    return res.status(400).json({ message: "Nombre y ubicación son obligatorios" });
  }

  try {
    const nueva = await camarasRepo.create({ nombre, ubicacion, descripcion, activa });
    res.status(201).json(nueva);
  } catch (error) {
    res.status(500).json({ message: "Error al crear la cámara", error: error.message });
  }
}

// PUT /api/camaras/:id  (solo admin)
async function update(req, res) {
  const { nombre, ubicacion, descripcion, activa } = req.body;

  if (!nombre?.trim() || !ubicacion?.trim()) {
    return res.status(400).json({ message: "Nombre y ubicación son obligatorios" });
  }

  try {
    const existe = await camarasRepo.getById(req.params.id);
    if (!existe) return res.status(404).json({ message: "Cámara no encontrada" });

    const actualizada = await camarasRepo.update(req.params.id, { nombre, ubicacion, descripcion, activa });
    res.json(actualizada);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar la cámara", error: error.message });
  }
}

// PATCH /api/camaras/:id/toggle  (solo admin)
async function toggleActiva(req, res) {
  try {
    const existe = await camarasRepo.getById(req.params.id);
    if (!existe) return res.status(404).json({ message: "Cámara no encontrada" });

    const actualizada = await camarasRepo.toggleActiva(req.params.id);
    res.json(actualizada);
  } catch (error) {
    res.status(500).json({ message: "Error al cambiar el estado", error: error.message });
  }
}

// DELETE /api/camaras/:id  (solo admin)
async function remove(req, res) {
  try {
    const existe = await camarasRepo.getById(req.params.id);
    if (!existe) return res.status(404).json({ message: "Cámara no encontrada" });

    await camarasRepo.remove(req.params.id);
    res.json({ message: "Cámara eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar la cámara", error: error.message });
  }
}

module.exports = { getAll, getDisponibles, getById, create, update, toggleActiva, remove };