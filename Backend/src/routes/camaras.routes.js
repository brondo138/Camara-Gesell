// Backend/src/routes/camaras.routes.js
const { Router } = require("express");
const controller = require("../controllers/camaras.controller");

// Reutilizá tus middlewares existentes de autenticación y roles
// Ajustá los paths si son distintos en tu proyecto
const { verifyToken } = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/roles.middleware");

const router = Router();

// ── Rutas públicas para usuarios autenticados (todos los roles) ────────────
// Docentes y estudiantes ven solo las disponibles
router.get(
  "/disponibles",
  verifyToken,
  requireRole(["Administrador", "Docente", "Practicante"]),
  controller.getDisponibles
);

// ── Rutas solo para admin ──────────────────────────────────────────────────
router.get(
  "/",
  verifyToken,
  requireRole(["Administrador"]),
  controller.getAll
);

router.get(
  "/:id",
  verifyToken,
  requireRole(["Administrador"]),
  controller.getById
);

router.post(
  "/",
  verifyToken,
  requireRole(["Administrador"]),
  controller.create
);

router.put(
  "/:id",
  verifyToken,
  requireRole(["Administrador"]),
  controller.update
);

router.patch(
  "/:id/toggle",
  verifyToken,
  requireRole(["Administrador"]),
  controller.toggleActiva
);

router.delete(
  "/:id",
  verifyToken,
  requireRole(["Administrador"]),
  controller.remove
);

module.exports = router;

