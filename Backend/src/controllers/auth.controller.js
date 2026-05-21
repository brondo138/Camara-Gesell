const authService = require('../services/auth.service');

const login = async (req, res) => {
    try {
        const { correo, contrasena } = req.body;

        const resultado = await authService.login(correo, contrasena);

        res.json({
            success: true,
            message: 'Inicio de sesión exitoso',
            data: resultado
        });

    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Error interno del servidor'
        });
    }
};

module.exports = {
    login
};