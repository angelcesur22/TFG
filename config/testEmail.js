// testEmail.js
const nodemailer = require('nodemailer');
require('dotenv').config();

const sendTestEmail = (correoDestino) => {
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    transporter.verify((error, success) => {
        if (error) {
            console.error('❌ Error al verificar Nodemailer:', error);
        } else {
            console.log('✅ Servidor de correo listo para enviar correos.');
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: correoDestino,
        subject: 'Prueba de envío de correo dinámica',
        text: 'Este es un correo de prueba para verificar Nodemailer funciona correctamente con un correo dinámico.'
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('❌ Error al enviar el correo:', error);
        } else {
            console.log('✅ Correo enviado con éxito:', info.response);
        }
    });
};

module.exports = sendTestEmail;
