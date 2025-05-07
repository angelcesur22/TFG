const bcrypt = require('bcryptjs');
const crypto = require('crypto'); // 🔥 Asegúrate de requerir crypto
const User = require('../models/User');
const transporter = require('../config/mailConfig');

// 🔒 Iniciar sesión
exports.login = async (req, res) => {
    try {
        const { email, contraseña } = req.body;
        
        const usuario = await User.findOne({ email: email }).lean(); // 🔥 Usa .lean() para obtener un objeto plano

        if (!usuario) {
            return res.render('login', { error: 'Correo o contraseña incorrectos' });
        }

        console.log(`Usuario encontrado: ${usuario.nombre}, Rol: ${usuario.rol}`); // 🔥 Verificar que se lee el rol

        if (!usuario.verificado && usuario.rol !== 'admin') {
            return res.render('login', { error: 'Debes verificar tu cuenta antes de iniciar sesión.' });
        }

        const esValido = await bcrypt.compare(contraseña, usuario.contraseña);

        if (!esValido) {
            return res.render('login', { error: 'Correo o contraseña incorrectos' });
        }

        // ✅ Guardar la sesión del usuario
        req.session.user = usuario; // ✅ Guarda todo el objeto del usuario


        console.log(`✅ Sesión guardada: ${JSON.stringify(req.session.user)}`);
        
        req.session.save((err) => { 
            if (err) {
                console.error('❌ Error al guardar la sesión:', err);
                return res.render('login', { error: 'Error al iniciar sesión.' });
            }

            console.log(`✅ Inicio de sesión exitoso. Rol: ${req.session.user.rol || 'No definido'}`); 

            if (req.session.user.rol === 'admin') {
                return res.redirect('/admin');
            } else {
                return res.redirect('/');
            }
        });

    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.render('login', { error: 'Ocurrió un error al iniciar sesión' });
    }
};
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const usuario = await User.findOne({ email });
        if (!usuario) return res.render('forgot-password', { error: 'Correo no registrado' });

        const token = crypto.randomBytes(32).toString('hex');
        usuario.resetToken = token;
        usuario.resetTokenExp = Date.now() + 3600000; // 1 hora
        await usuario.save();

        console.log(`✅ Token generado y guardado: ${token}`);
        console.log(`✅ Expiración del token: ${new Date(usuario.resetTokenExp).toLocaleString()}`);

        const resetUrl = `https://www.footlaces.es/reset-password?token=${token}`;

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Restablecimiento de contraseña',
            html: `<p>Haz clic en el enlace para restablecer tu contraseña:</p><a href="${resetUrl}">Restablecer contraseña</a>`
        });

        res.json({ message: `Se ha enviado un correo a: ${email}` });

    } catch (error) {
        console.error('Error en forgotPassword:', error);
        res.status(500).render('forgot-password', { error: 'Error al enviar el correo de recuperación' });
    }
};

// 🔒 Restablecer contraseña
exports.resetPassword = async (req, res) => {
    const { token, nuevaContraseña } = req.body;

    console.log(`✅ Token recibido en el formulario: ${token}`);

    try {
        const usuario = await User.findOne({ resetToken: token, resetTokenExp: { $gt: Date.now() } });

        if (!usuario) {
            console.error('❌ Usuario no encontrado o token expirado.');

            const debugUsuario = await User.findOne({ resetToken: token });
            console.error(`🧐 Debug - Usuario encontrado con token:`, debugUsuario);

            return res.status(400).json({ success: false, error: 'Token inválido o expirado' });
        }

        console.log(`✅ Usuario encontrado: ${usuario.email}`);

        usuario.contraseña = await bcrypt.hash(nuevaContraseña, 10);
        usuario.resetToken = undefined;
        usuario.resetTokenExp = undefined;

        await usuario.save();

        res.json({ success: true, message: 'Contraseña restablecida correctamente' });

    } catch (error) {
        console.error('Error en resetPassword:', error);
        res.status(500).json({ success: false, error: 'Error al restablecer la contraseña' });
    }
};

exports.registerUser = async (req, res) => {
  const { nombre, email, contraseña, confirmarContraseña } = req.body;

  if (contraseña !== confirmarContraseña) {
      return res.render('register', { error: 'Las contraseñas no coinciden' });
  }

  try {
      const usuarioExistente = await User.findOne({ email });

      if (usuarioExistente) {
          return res.render('register', { error: 'El correo ya está registrado.' });
      }

      const hashedPassword = await bcrypt.hash(contraseña, 10);
      const token = crypto.randomBytes(32).toString('hex');

      const newUser = new User({
          nombre,
          email,
          contraseña: hashedPassword,
          verificado: false,
          verificacionToken: token
      });

      await newUser.save();

      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
      const url = `${baseUrl}/verify?token=${token}`;
      


      console.log("✅ Intentando enviar correo a:", email); // Log para confirmar que se intenta enviar el correo

      // 🔥 Enviar correo de verificación
      await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Verificación de cuenta',
          html: `<h2>Verificación de cuenta</h2><p>Haz clic en el siguiente enlace para verificar tu cuenta:</p><a href="${url}">Verificar cuenta</a>`
      }, (error, info) => {
          if (error) {
              console.error("❌ Error al enviar el correo:", error); // 🔥 Mostrar el error específico en consola
              return res.render('register', { error: 'Error al enviar el correo de verificación.' });
          }
          console.log("✅ Correo enviado exitosamente:", info.response);
          res.render('verificaCorreo', { email: user.email });
      });

  } catch (error) {
      console.error('❌ Error al registrar usuario o enviar correo:', error); // 🔥 Mostrar cualquier error en la consola
      res.render('register', { error: 'Error al registrar el usuario o enviar el correo.' });
  }
};

// 🔒 Verificar usuario desde el enlace del correo
exports.verifyUser = async (req, res) => {
  const { token } = req.query;

  try {
      console.log("✅ Token recibido en la URL:", token); // Confirmar que se recibe el token

      // 🔥 Aquí es donde se usa el modelo User
      const user = await User.findOne({ verificacionToken: token });

      if (!user) {
          console.log("❌ Usuario no encontrado con ese token.");
          return res.send('Token de verificación inválido o expirado.');
      }

      console.log("✅ Usuario encontrado:", user.email); // Verificar que se encuentra un usuario con ese token

      user.verificado = true;
      user.verificacionToken = null; // Eliminar el token tras verificar al usuario
      await user.save();

      res.render('verificadoExitoso', { nombre: user.nombre });
;
  } catch (error) {
      console.error('❌ Error al verificar la cuenta:', error);
      res.send('Ocurrió un error al verificar la cuenta.');
  }
};
