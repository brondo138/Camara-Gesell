const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const pool = require('./database/connection');
const routes = require('./routes/index.routes');

const app = express();

app.use(cors());
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

app.listen(env.PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${env.PORT}`);
});