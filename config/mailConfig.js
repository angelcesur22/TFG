const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'Gmail', // O usa 'hotmail', 'yahoo', según el proveedor de tu correo.
    auth: {
        user: process.env.EMAIL_USER, // Tu correo completo
        pass: process.env.EMAIL_PASS  // Contraseña o contraseña de aplicación
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Error al conectar con el servidor de correo:', error);
    } else {
        console.log('✅ Servidor de correo listo para enviar correos.');
    }
});

module.exports = transporter;
