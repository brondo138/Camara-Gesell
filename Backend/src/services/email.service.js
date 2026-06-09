const nodemailer = require('nodemailer');
const env = require('../config/env');

// ─── TRANSPORTER ─────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS
    }
});

// ─── HELPER: plantilla base ───────────────────────────────────────────────────
function plantillaBase(contenido) {
    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>GesellApp</title>
    </head>
    <body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
            <tr>
                <td align="center">
                    <table width="100%" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                        <!-- Header -->
                        <tr>
                            <td style="background:#1e3a5f;padding:24px 32px;">
                                <p style="margin:0;color:#ffffff;font-size:18px;font-weight:bold;">GesellApp</p>
                                <p style="margin:4px 0 0;color:#93c5fd;font-size:12px;">Gestión Clínica · Universidad</p>
                            </td>
                        </tr>
                        <!-- Contenido -->
                        <tr>
                            <td style="padding:32px;">
                                ${contenido}
                            </td>
                        </tr>
                        <!-- Footer -->
                        <tr>
                            <td style="background:#f8fafc;padding:16px 32px;border-top:1px solid #e2e8f0;">
                                <p style="margin:0;color:#94a3b8;font-size:11px;text-align:center;">
                                    Este es un mensaje automático de GesellApp. No respondas a este correo.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `
}

// ─── NOTIFICACIÓN: reserva aprobada ──────────────────────────────────────────
const notificarReservaAprobada = async ({ correo, nombre, camara, fecha, hora_inicio, hora_fin }) => {
    const contenido = `
        <p style="margin:0 0 8px;color:#1e3a5f;font-size:20px;font-weight:bold;">¡Tu reserva fue aprobada! ✅</p>
        <p style="margin:0 0 24px;color:#64748b;font-size:14px;">Hola <strong>${nombre}</strong>, tu solicitud de reserva ha sido aprobada.</p>

        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;margin-bottom:24px;">
            <tr><td style="padding:20px 24px;">
                <p style="margin:0 0 12px;color:#15803d;font-size:13px;font-weight:bold;">Detalles de la reserva</p>
                <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="color:#64748b;font-size:13px;padding:4px 0;width:40%;">Cámara</td>
                        <td style="color:#1e293b;font-size:13px;font-weight:bold;padding:4px 0;">${camara}</td>
                    </tr>
                    <tr>
                        <td style="color:#64748b;font-size:13px;padding:4px 0;">Fecha</td>
                        <td style="color:#1e293b;font-size:13px;font-weight:bold;padding:4px 0;">${fecha}</td>
                    </tr>
                    <tr>
                        <td style="color:#64748b;font-size:13px;padding:4px 0;">Horario</td>
                        <td style="color:#1e293b;font-size:13px;font-weight:bold;padding:4px 0;">${hora_inicio} – ${hora_fin}</td>
                    </tr>
                </table>
            </td></tr>
        </table>

        <p style="margin:0;color:#64748b;font-size:13px;line-height:1.6;">
            Tu sesión ha sido programada automáticamente. Puedes revisarla en el módulo de <strong>Sesiones</strong> dentro de la app.
        </p>
    `

    await transporter.sendMail({
        from: `"GesellApp" <${env.EMAIL_USER}>`,
        to: correo,
        subject: '✅ Reserva aprobada — GesellApp',
        html: plantillaBase(contenido)
    })
}

// ─── NOTIFICACIÓN: reserva rechazada ─────────────────────────────────────────
const notificarReservaRechazada = async ({ correo, nombre, camara, fecha, hora_inicio, hora_fin }) => {
    const contenido = `
        <p style="margin:0 0 8px;color:#1e3a5f;font-size:20px;font-weight:bold;">Tu reserva fue rechazada ❌</p>
        <p style="margin:0 0 24px;color:#64748b;font-size:14px;">Hola <strong>${nombre}</strong>, lamentablemente tu solicitud de reserva no fue aprobada.</p>

        <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;margin-bottom:24px;">
            <tr><td style="padding:20px 24px;">
                <p style="margin:0 0 12px;color:#dc2626;font-size:13px;font-weight:bold;">Detalles de la reserva</p>
                <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="color:#64748b;font-size:13px;padding:4px 0;width:40%;">Cámara</td>
                        <td style="color:#1e293b;font-size:13px;font-weight:bold;padding:4px 0;">${camara}</td>
                    </tr>
                    <tr>
                        <td style="color:#64748b;font-size:13px;padding:4px 0;">Fecha</td>
                        <td style="color:#1e293b;font-size:13px;font-weight:bold;padding:4px 0;">${fecha}</td>
                    </tr>
                    <tr>
                        <td style="color:#64748b;font-size:13px;padding:4px 0;">Horario</td>
                        <td style="color:#1e293b;font-size:13px;font-weight:bold;padding:4px 0;">${hora_inicio} – ${hora_fin}</td>
                    </tr>
                </table>
            </td></tr>
        </table>

        <p style="margin:0;color:#64748b;font-size:13px;line-height:1.6;">
            Puedes crear una nueva solicitud desde el módulo de <strong>Reservas</strong> eligiendo otro horario o cámara disponible.
        </p>
    `

    await transporter.sendMail({
        from: `"GesellApp" <${env.EMAIL_USER}>`,
        to: correo,
        subject: '❌ Reserva rechazada — GesellApp',
        html: plantillaBase(contenido)
    })
}

module.exports = {
    notificarReservaAprobada,
    notificarReservaRechazada
}