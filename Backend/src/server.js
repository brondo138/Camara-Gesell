const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const pool = require('./database/connection');
const routes = require('./routes/index.routes');

const app = express();

const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
    },
    credentials: true
}));

app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'API de Cámara de Gesell funcionando correctamente'
    });
});

app.get('/api/test-db', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT 1 + 1 AS resultado');

        res.json({
            success: true,
            message: 'Conexión a MySQL funcionando correctamente',
            data: rows[0]
        });
    } catch (error) {
        console.error('Error al conectar con MySQL:', error);

        res.status(500).json({
            success: false,
            message: 'Error al conectar con la base de datos',
            error: error.message
        });
    }
});

app.use('/api', routes);

const PORT = process.env.PORT || env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});