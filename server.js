const authRoutes = require('./routes/authRoutes');
app.use(express.urlencoded({ extended: true })); // Para leer formularios
app.use(authRoutes);
