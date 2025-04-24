const isAdmin = (req, res, next) => {
  if (!req.session.user || req.session.user.rol !== 'admin') {
    return res.redirect('/login');
  }
  next();
};

const verificarSesion = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  req.user = req.session.user; // ✅ Aquí asignamos el usuario a req.user
  next();
};
module.exports = {
  isAdmin,
  verificarSesion
};  
