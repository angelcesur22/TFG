const Pedido = require('../models/Pedido');
const transporter = require('../config/mailConfig');
const ProductoComunidad = require('../models/ProductoComunidad');





exports.panel = (req, res) => {
    res.render('adminPanel', { user: req.session.user });
};
exports.verDevoluciones = async (req, res) => {
    const devoluciones = await Pedido.find({ estado: "Solicitud de devolución" }).populate('usuario');
    res.render('adminDevoluciones', { devoluciones });
  };
  
  exports.aceptarDevolucion = async (req, res) => {
    try {
      const pedido = await Pedido.findById(req.params.id).populate('usuario');
      if (!pedido) return res.status(404).send('Pedido no encontrado');
  
      pedido.estado = 'Devolución aceptada';
      await pedido.save();
  
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: pedido.usuario.email,
        subject: '✅ Devolución aceptada',
        html: `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; background: #f8f8f8; border-radius: 8px; text-align: center;">
    <h2 style="color: #222;">Hola ${usuario.nombre}!</h2>

    <p style="font-size: 16px;">
      Tu solicitud de devolución del pedido <strong>${pedido.numeroPedido}</strong> ha sido
      <span style="color: ${estado === 'aceptada' ? '#2ecc71' : '#e74c3c'}; font-weight: bold;">
        ${estado === 'aceptada' ? 'aceptada' : 'rechazada'}.
      </span>
    </p>

    <p style="font-size: 16px; margin-top: 20px;">
      <strong>Motivo:</strong> ${motivoRespuesta}
    </p>

    <p style="font-size: 14px; margin-top: 30px; color: #555;">
      Si tienes dudas, puedes escribirnos a 
      <a href="mailto:contactfootlaces@gmail.com" style="color: #0051ff;">contactfootlaces@gmail.com</a>.
    </p>

    <p style="font-size: 14px; margin-top: 30px; color: #777;">Gracias por confiar en <strong>FootLaces</strong> 💙</p>
  </div>
`
      });
  
      res.redirect('/admin/devoluciones');
    } catch (error) {
      console.error('Error al aceptar devolución:', error);
      res.status(500).send('Error al procesar la aceptación.');
    }
  };
  
  
  exports.denegarDevolucion = async (req, res) => {
    try {
      const { motivoAdmin } = req.body;
      const pedido = await Pedido.findById(req.params.id).populate('usuario');
  
      if (!pedido) return res.status(404).send('Pedido no encontrado');
  
      pedido.estado = 'Devolución denegada';
      pedido.devolucion = pedido.devolucion || {};
      pedido.devolucion.comentarioAdmin = motivoAdmin;
  
      await pedido.save();
  
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: pedido.usuario.email,
        subject: '❌ Devolución denegada',
        html: `
          <h3>Hola ${pedido.usuario.nombre},</h3>
          <p>Tu solicitud de devolución del pedido <strong>${pedido.numeroPedido}</strong> ha sido <strong>denegada</strong>.</p>
          <p><strong>Motivo:</strong> ${motivoAdmin}</p>
          <p>Para más información puedes escribirnos a <a href="mailto:contactfootlaces@gmail.com">contactfootlaces@gmail.com</a>.</p>
          <p>Gracias por tu comprensión.</p>
        `
      });
  
      res.redirect('/admin/devoluciones');
    } catch (error) {
      console.error('Error al denegar devolución:', error);
      res.status(500).send('Error al procesar la denegación.');
    }
  };


exports.verProductosComunidad = async (req, res) => {
  try {
    const productos = await ProductoComunidad.find().populate('usuario');
    const productosRevision = productos.filter(p => p.estadoAdmin === 'revisión');
    const productosNoRevision = productos.filter(p => p.estadoAdmin !== 'revisión');

    res.render('gestionComunidad', {
      productosRevision,
      productosNoRevision,
      user: req.session.user || null
    });
  } catch (error) {
    console.error('Error al cargar productos de comunidad:', error);
    res.status(500).send('Error al cargar productos de comunidad');
  }
};



exports.aprobarProductoComunidad = async (req, res) => {
  try {
    await ProductoComunidad.findByIdAndUpdate(req.params.id, { estadoAdmin: 'aprobado' });
    res.redirect('/admin/comunidad');
  } catch (error) {
    console.error('Error al aprobar producto:', error);
    res.status(500).send('Error al aprobar el producto.');
  }
};

exports.actualizarEstadosComunidad = async (req, res) => {
  try {
    const { productoId, nuevoEstadoAdmin } = req.body;
    await ProductoComunidad.findByIdAndUpdate(productoId, { estadoAdmin: nuevoEstadoAdmin });
    res.redirect('/admin/comunidad');
  } catch (error) {
    console.error('Error al actualizar estado del producto:', error);
    res.status(500).send('Error al actualizar estado.');
  }
};
exports.rechazarProductoComunidad = async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;

    await ProductoComunidad.findByIdAndUpdate(id, {
      estadoAdmin: 'rechazado',
      motivoRechazo: motivo
    });

    res.redirect('/admin/comunidad');
  } catch (error) {
    console.error('Error al rechazar producto:', error);
    res.status(500).send('Error al rechazar producto');
  }
};
exports.eliminarProductoComunidad = async (req, res) => {
  try {
    const { id } = req.params;
    await ProductoComunidad.findByIdAndDelete(id);
    res.redirect('/admin/comunidad');
  } catch (error) {
    console.error('Error al eliminar el producto de comunidad:', error);
    res.status(500).send('Error al eliminar producto.');
  }
};


exports.verComunidadPublica = async (req, res) => {
  try {
    const productos = await ProductoComunidad.find({ estadoAdmin: 'aprobado' })
      .populate('usuario');

    const productosFiltrados = productos.filter(p => p.usuario && p.usuario.nombre);

    // 🧪 Log para depurar usuarios poblados
    console.log('🧪 Usuarios poblados:', productosFiltrados.map(p => ({
      producto: p.nombre,
      usuario: p.usuario,
      nombre: p.usuario?.nombre
    })));

    res.render('comunidad', { productos: productosFiltrados, user: req.session.user || null });
  } catch (error) {
    console.error('Error al cargar productos de comunidad:', error);
    if (!res.headersSent) {
      res.status(500).send('Error interno al mostrar productos de comunidad');
    }
  }
};


