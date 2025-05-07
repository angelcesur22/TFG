require('dotenv').config();
const express = require('express');
const session = require('express-session'); // ✅ Importar express-session solo una vez
const app = express();
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const webRoutes = require('./routes/webRoutes');
const bodyParser = require('body-parser');

const adminRoutes = require('./routes/adminRoutes');
const productoRoutes = require('./routes/productoRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const Counter = require('./models/Counter')
const webhookRoutes = require('./routes/webhookRoutes');



// Conectar a la base de datos
connectDB();
require('dotenv').config();

// Configuración de sesiones (✅ Solo declarar esto una vez)
app.use(session({
    secret: 'tu_clave_secreta', // Cambia esto por algo único y seguro
    resave: false,
    saveUninitialized: true
}));
app.use(async (req, res, next) => {
  const User = require('./models/User');

  if (req.session?.user?._id) {
    try {
      req.user = await User.findById(req.session.user._id).populate('wishlist');
    } catch (err) {
      console.error('❌ Error al cargar el usuario desde la sesión:', err);
      req.user = null;
    }
  } else {
    req.user = null;
  }

  next();
});



// Configuración de vistas
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/pcookies', (req, res) => {
  res.render('pcookies', { user: req.user || null });
});

app.get('/aviso-legal', (req, res) => {
  res.render('aviso-legal', { user: req.user || null });
});

app.get('/politica-de-privacidad', (req, res) => {
  res.render('politica-de-privacidad', { user: req.user || null });
});
// Middleware
app.use(logger('dev'));
// ⚠️ Solo usar express.json() si NO es webhook
app.use((req, res, next) => {
  if (req.originalUrl === '/webhook/stripe') {
    next(); // saltamos el bodyParser para esta ruta
  } else {
    express.json()(req, res, next);
  }
});
app.use('/', require('./routes/wishlistRoutes'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Configuración de rutas principales
app.use('/', webRoutes);
app.use('/', authRoutes);
app.use('/', userRoutes);
app.use('/admin', adminRoutes);
app.use('/admin/productos', productoRoutes);
app.use('/users', userRoutes);

app.use('/webhook', webhookRoutes);
app.use((req, res, next) => {
  const error = new Error('Página no encontrada');
  error.status = 404;
  next(error);
});

// Manejador de errores generales
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.render('error', { 
    message: error.message,
    error: error
  });
});
async function inicializarContador() {
  const existe = await Counter.findOne({ name: 'pedido' });

  if (!existe) {
      const nuevoContador = new Counter({ name: 'pedido', value: 0 });
      await nuevoContador.save();
      console.log('Contador inicializado en 0.');
  }
}


inicializarContador();




module.exports = app;
