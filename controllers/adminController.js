const Pedido = require('../models/Pedido');



exports.panel = (req, res) => {
    res.render('adminPanel', { user: req.session.user });
};
exports.verDevoluciones = async (req, res) => {
    const devoluciones = await Pedido.find({ estado: "Solicitud de devolución" }).populate('usuario');
    res.render('adminDevoluciones', { devoluciones });
  };
  
  exports.aceptarDevolucion = async (req, res) => {
    await Pedido.findByIdAndUpdate(req.params.id, { estado: "Devolución aceptada" });
    res.redirect('/admin/devoluciones');
  };
  
  exports.denegarDevolucion = async (req, res) => {
    const { motivoAdmin } = req.body;
    await Pedido.findByIdAndUpdate(req.params.id, {
      estado: "Devolución denegada",
      motivoDevolucionAdmin: motivoAdmin
    });
    res.redirect('/admin/devoluciones');
  };
  