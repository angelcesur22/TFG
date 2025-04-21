const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // ✅ Importamos correctamente el controlador

router.get('/register', (req, res) => {
  res.render('register', { error: null });
});

router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return console.error(err);
    res.redirect('/login');
  });
});

// ✅ Usar funciones del controlador en lugar de código directos
router.post('/register', authController.registerUser);
router.post('/login', authController.login);
router.get('/verify', authController.verifyUser); // 🔥 La única definición de la ruta /verify debe ser esta

module.exports = router;
