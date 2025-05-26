// controllers/pedidoController.js

const Pedido = require('../models/Pedido');
const Producto = require('../models/Producto');
const User = require('../models/User');
const Counter = require('../models/Counter');
const transporter = require('../config/mailConfig'); 




exports.listarPedidos = async (req, res) => {
    try {
      const pedidos = await Pedido.find().populate('usuario').sort({ fecha: -1 }); // ✅ SIN populate productos
      res.render('listarPedidos', { pedidos, estado: 'Todos' }); 
    } catch (error) {
      console.error('Error al listar pedidos:', error);
      res.status(500).send('Error al listar pedidos');
    }
  };







exports.eliminarPedido = async (req, res) => {
    try {
        const { id } = req.params;
        await Pedido.findByIdAndDelete(id);
        res.redirect('/admin/pedidos');
    } catch (error) {
        console.error('Error al eliminar el pedido:', error);
        res.status(500).send('Error al eliminar el pedido.');
    }
};



exports.actualizarEstado = async (req, res) => {
    try {
      const { id } = req.params;
      const { estado } = req.body;
  
      const pedido = await Pedido.findById(id).populate('usuario');
  
      if (!pedido) {
        console.error('❌ Pedido no encontrado.');
        return res.status(404).send('Pedido no encontrado.');
      }
  
      pedido.estado = estado;
      await pedido.save();
  
      const usuario = pedido.usuario;
  
      if (!usuario || !usuario.email) {
        console.error('❌ El usuario no tiene un correo registrado o no existe.');
        return res.status(400).send('El usuario no tiene un correo registrado.');
      }
  
      console.log('🧪 Estado recibido:', estado);
      if (estado.trim().toLowerCase() === 'pendiente de devolución')
{
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: usuario.email,
          subject: '📦 Instrucciones para devolver tu pedido',
          html: `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; background: #f4f4f4; border-radius: 10px; text-align: center;">
    <h2 style="color: #222;">¡Hola ${pedido.usuario.nombre}!</h2>
    <p style="font-size: 16px;">Tu solicitud de devolución ha sido <strong>aprobada</strong>.</p>

    <div style="text-align: left; margin-top: 20px; background: #fff; padding: 20px; border-radius: 8px;">
      <h3 style="color: #444;">Pasos a seguir:</h3>
      <ol style="padding-left: 20px; color: #333;">
        <li>Empaqueta el producto correctamente.</li>
        <li>Incluye una copia con el número de pedido: <strong>${pedido.numeroPedido}</strong>.</li>
        <li>Envíalo mediante el transportista de tu elección.</li>
      </ol>
    </div>

    <p style="margin-top: 30px;">
      <a href="${process.env.BASE_URL}/confirmar-devolucion/${pedido._id}" 
         style="display: inline-block; background-color: #0051ff; color: white; text-decoration: none; padding: 10px 20px; border-radius: 6px; margin-top: 20px;">
         Confirmar que he devuelto el producto
      </a>
    </p>

    <p style="margin-top: 30px; font-size: 14px; color: #555;">
      Si tienes dudas, contáctanos en 
      <a href="mailto:contactfootlaces@gmail.com" style="color: #0051ff;">contactfootlaces@gmail.com</a>.
    </p>

    <p style="margin-top: 20px; font-size: 14px; color: #777;">Gracias por confiar en <strong>FootLaces</strong> 💙</p>
  </div>
`

        }); 
      } else {
        // EMAIL GENERAL para cualquier otro estado
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: usuario.email,
          subject: `Actualización de tu pedido ${pedido.numeroPedido}`,
          html: `<h1>¡Hola ${usuario.nombre}!</h1>
                 <p>Tu pedido <strong>${pedido.numeroPedido}</strong> se encuentra ahora mismo en estado: <strong>${estado}</strong>.</p>
                 <br>
                 <p>¡Gracias por confiar en nosotros!</p>`
        };
  
        await transporter.sendMail(mailOptions);
      }
  
      console.log(`✅ Estado actualizado a: ${estado} y correo enviado a ${usuario.email}`);
      res.redirect('/admin/pedidos');
    } catch (error) {
      console.error('Error al actualizar el estado del pedido:', error);
      res.status(500).send('Error al actualizar el estado del pedido.');
    }
  };
  

  exports.guardarCambios = async (req, res) => {
    try {
        const estados = req.body.estados;
        const nodemailer = require('nodemailer');

        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        transporter.verify((error, success) => {
            if (error) console.error('❌ Error al verificar Nodemailer:', error);
        });

        for (let pedidoId in estados) {
            const nuevoEstado = estados[pedidoId];

            const pedido = await Pedido.findById(pedidoId).populate('usuario');

            if (!pedido) continue;

            if (pedido.estado !== nuevoEstado) {
                pedido.estado = nuevoEstado;
                await pedido.save();

                const usuario = pedido.usuario;
                if (!usuario || !usuario.email) continue;

                if (nuevoEstado.trim().toLowerCase() === 'pendiente de devolución') {
                    await transporter.sendMail({
                        from: process.env.EMAIL_USER,
                        to: usuario.email,
                        subject: '📦 Instrucciones para devolver tu pedido',
                        html: `
                            <p>Hola ${pedido.usuario.nombre},</p>
                            <p>Tu solicitud de devolución ha sido aprobada.</p>
                            <ol>
                              <li>Empaqueta el producto correctamente.</li>
                              <li>Incluye una copia con el número de pedido: <strong>${pedido.numeroPedido}</strong>.</li>
                              <li>Envíalo mediante el transportista de tu elección.</li>
                            </ol>
                            <a href="${process.env.BASE_URL}/confirmar-devolucion/${pedido._id}">Confirmar que he devuelto el producto</a>
                            <p>Si tienes dudas, contáctanos en <a href="mailto:contactfootlaces@gmail.com">contactfootlaces@gmail.com</a>.</p>
                        `
                    });
                } else {
                    const mailOptions = {
                        from: process.env.EMAIL_USER,
                        to: usuario.email,
                        subject: `Actualización de tu pedido ${pedido.numeroPedido}`,
                        html: `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; background: #f4f4f4; border-radius: 8px; text-align: center;">
    <h2 style="color: #222;">¡Hola ${usuario.nombre}!</h2>
    <p style="font-size: 16px;">Tu pedido <strong>${pedido.numeroPedido}</strong> ha cambiado a estado:</p>
    <p style="font-size: 18px; font-weight: bold; color: #0051ff;">${nuevoEstado}</p>
    
    <div style="background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: left;">
      <h3 style="border-bottom: 1px solid #ddd; padding-bottom: 8px;">Resumen del pedido:</h3>
      <ul style="padding-left: 20px;">
        ${pedido.productos.map(p => `
          <li style="margin: 8px 0;">${p.producto.nombre} - Talla ${p.talla} - Cantidad ${p.cantidad}</li>
        `).join('')}
      </ul>
    </div>

    <p style="font-size: 14px; color: #555;">Gracias por confiar en <strong>FootLaces</strong> </p>
    <p style="font-size: 12px; color: #999;">Este es un mensaje automático. Por favor, no respondas a este correo.</p>
  </div>
`
                    };
                    await transporter.sendMail(mailOptions);
                }
            }
        }

        console.log('✅ Solo se enviaron correos para pedidos con estado modificado.');
        res.redirect('/admin/pedidos');
    } catch (error) {
        console.error('❌ Error al guardar cambios y enviar correos:', error);
        res.render('error', { message: 'Ocurrió un error al guardar los cambios.', error });
    }
};




exports.listarPedidosPorEstado = async (req, res) => {
    try {
        let estadoParam = req.params.estado.replace(/-/g, ' ').toLowerCase();
        let pedidos = [];

        if (estadoParam === 'devoluciones') {
            pedidos = await Pedido.find({
                estado: {
                    $in: [
                        'Solicitud de devolución',
                        'Pendiente de devolución',
                        'Devolución aceptada',
                        'Devolución denegada',
                        'Devuelto'
                    ]
                }
            }).populate('usuario');
            estadoParam = 'Devoluciones';
        } else {
            const estadoCapitalizado = estadoParam.split(' ')
                .map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
            pedidos = await Pedido.find({ estado: estadoCapitalizado }).populate('usuario');
            estadoParam = estadoCapitalizado;
        }

        res.render('listarPedidos', { pedidos, estado: estadoParam });
    } catch (error) {
        console.error('Error al listar pedidos por estado:', error);
        res.status(500).send('Error al listar pedidos.');
    }
};


exports.listarTodosLosPedidos = async (req, res) => {
    try {
        const pedidos = await Pedido.find().populate('usuario'); // SIN populate de productos

        
        res.render('listarPedidos', { pedidos, estado: 'Todos' }); 
    } catch (error) {
        console.error('Error al listar todos los pedidos:', error);
        res.status(500).send('Error al listar todos los pedidos.');
    }
};
const generarNumeroPedido = async () => {
    // Buscar el último pedido creado ordenado por número de pedido descendente
    const ultimoPedido = await Pedido.findOne().sort({ numeroPedido: -1 }); 

    let nuevoNumero = 1; // Si no existe ningún pedido, empezamos con 1

    if (ultimoPedido && ultimoPedido.numeroPedido) {
        // Si existe un pedido anterior, incrementamos el número
        nuevoNumero = parseInt(ultimoPedido.numeroPedido) + 1;
    }

    // Formatear el número con 4 dígitos, rellenando con ceros si es necesario
    return nuevoNumero.toString().padStart(4, '0');
};

exports.crearPedido = async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  const { productoId, cantidad, talla } = req.body;

  try {
    const producto = await Producto.findById(productoId);
    const usuario = await User.findById(req.session.user.id);

    if (!usuario || !producto) {
      return res.status(404).send('Usuario o producto no encontrado.');
    }
    if (!producto.imagenes || !producto.imagenes.length) {
      console.warn('⚠️ Producto sin imagen al intentar crear pedido:', producto.nombre);
      return res.status(400).send('Este producto no tiene imagen asignada.');
    }
   // Buscar el índice de la talla seleccionada
   const tallaIndex = producto.tallas.findIndex(t => t.talla === talla);
   console.log('🔍 Talla recibida del formulario:', talla);
   console.log('🧱 Tallas disponibles en producto:', producto.tallas);
   
   if (tallaIndex === -1 || producto.tallas[tallaIndex].stock < cantidad) {
     console.log('❌ Talla no encontrada o stock insuficiente');
     return res.status(400).send('Stock insuficiente para la talla seleccionada.');
   }
   
   const tallaSeleccionada = producto.tallas[tallaIndex];
   console.log('✅ Talla seleccionada:', tallaSeleccionada.talla);
   console.log('📦 Stock antes:', tallaSeleccionada.stock);
   
   // Restar
   tallaSeleccionada.stock -= cantidad;
   console.log('📉 Nuevo stock:', tallaSeleccionada.stock);
   
   producto.markModified('tallas');
   await producto.save();
   console.log('✅ Producto guardado con nuevo stock');
   
   console.log('🖼 Imágenes del producto:', producto.imagenes);


    const nuevoPedido = new Pedido({
      usuario: usuario._id,
      productos: [{
        producto: {
          _id: producto._id,
          nombre: producto.nombre,
          marca: producto.marca,
          foto: producto.imagenes[0]
        },
        
        cantidad: parseInt(cantidad),
        talla: talla,
        precio: tallaSeleccionada.precio
      }],
      total: tallaSeleccionada.precio * cantidad,
      estado: 'Pendiente',
      fecha: new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })
    });
    console.log('🖼 Imagen que se guardará en el pedido:', producto.imagenes[0]);

    await nuevoPedido.save();

        console.log('✅ Pedido creado con éxito.');

        // 🔥 Aquí configuramos Nodemailer para enviar un correo de prueba
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: usuario.email,
            subject: `¡Gracias por tu pedido, ${usuario.nombre}!`,
            text: `Pedido realizado correctamente por ${usuario.nombre}. Producto: ${producto.nombre}. Cantidad: ${cantidad}`,
            html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; text-align: center; padding: 20px;">
        <img src="https://footlaces.com/images/LogoTFL.png" alt="FootLaces Logo" style="width: 120px; margin-bottom: 20px;" />
        <h1 style="color: #333;">¡Gracias por tu compra, ${usuario.nombre}!</h1>
        <p style="font-size: 16px;">Has realizado el siguiente pedido:</p>
        <img src="${producto.imagenes[0]}" alt="${producto.nombre}" style="width: 200px; border-radius: 10px; margin: 20px auto;" />
        <p><strong>Producto:</strong> ${producto.nombre}</p>
        <p><strong>Precio:</strong> ${producto.precio}€</p>
        <p><strong>Cantidad:</strong> 1</p>
        <p><strong>Estado:</strong> Pendiente</p>
        <hr style="margin: 30px 0;">
        <p style="font-size: 14px; color: #777;">Gracias por confiar en FootLaces.</p>
      </div>
`

        };

        console.log('📧 MailOptions configurados: ', mailOptions);

        // 🔥 Probar si Nodemailer está configurado
        transporter.verify((error, success) => {
            if (error) {
                console.error('❌ Error al verificar el servicio de correo:', error);
            } else {
                console.log('✅ Servidor de correo listo para enviar correos.');
            }
        });

        console.log('📧 Intentando enviar el correo a: ', usuario.email);

        // 🔥 Intentar enviar el correo
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('❌ Error al enviar el correo:', error);
            } else {
                console.log('✅ Correo enviado con éxito:', info.response);
            }
        });

        res.send('Pedido realizado con éxito.');
    } catch (error) {
        console.error('Error al realizar el pedido:', error);
        res.status(500).send('Error al realizar el pedido.');
    }
};


exports.buscarPedidos = async (req, res) => {
    const query = req.query.query?.trim() || '';
    console.log("Consulta recibida en el backend:", query); 

    try {
        const regex = new RegExp(query, 'i'); 

        const usuarios = await User.find({ nombre: regex });
        const usuarioIds = usuarios.map(user => user._id);

        const productos = await Producto.find({ nombre: regex });
        const productoIds = productos.map(producto => producto._id);
                
        
        let pedidos = await Pedido.find({
            $or: [
                { numeroPedido: regex },
                { estado: regex },
                { usuario: { $in: usuarioIds } },
                { producto: { $in: productoIds } }
            ]
        })
        .populate('usuario')
        .populate('productos.producto')

        console.log("Pedidos encontrados (filtrados):", pedidos);

        res.json(pedidos);
    } catch (error) {
        console.error('Error al buscar pedidos:', error);
        res.status(500).json({ error: 'Error al buscar pedidos.' });
    }
};
exports.cancelarPedido = async (req, res) => {
    try {
      const pedido = await Pedido.findById(req.params.id);
  
      if (!pedido) {
        return res.redirect('/perfil?error=Pedido no encontrado');
      }
  
      // Comparación sin importar mayúsculas/minúsculas
      const estadoActual = pedido.estado.toLowerCase();
  
      if (estadoActual !== 'pendiente' && estadoActual !== 'en proceso') {
        return res.redirect(`/perfil?error=No se puede cancelar este pedido porque está en estado: ${pedido.estado}`);
      }
  
      // Guardar con C mayúscula
      pedido.estado = 'Cancelado';
      await pedido.save();
  
      return res.redirect('/perfil?success=Pedido cancelado correctamente');
    } catch (error) {
      console.error('[❌ Error al cancelar pedido]', error);
      return res.redirect('/perfil?error=Error al cancelar el pedido');
    }
  };
  

  exports.devolverPedido = async (req, res) => {
    try {
      const { id } = req.params;
      const { motivo, comentario } = req.body;
  
      const pedido = await Pedido.findById(id).populate('usuario');
  
      if (!pedido) {
        return res.status(404).send('Pedido no encontrado');
      }
  
      if (pedido.estado !== 'Entregado') {
        return res.redirect(`/perfil?error=Este pedido no es elegible para devolución.`);
      }
  
      pedido.estado = 'Solicitud de devolución';
      pedido.devolucion = {
        motivo,
        comentario,
        fechaSolicitud: new Date()
      };
  
      await pedido.save();
  
      await transporter.sendMail({
        from: `"FootLaces" <${process.env.EMAIL_USER}>`,
        to: pedido.usuario.email,
        subject: '✅ Solicitud de devolución enviada',
        html: `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; background: #f5f5f5; border-radius: 8px; text-align: center;">
    <h2 style="color: #222;">¡Hola ${pedido.usuario.nombre}!</h2>

    <p style="font-size: 16px;">
      Hemos recibido tu <strong>solicitud de devolución</strong> del pedido <strong>${pedido.numeroPedido}</strong>.
    </p>

    <p style="font-size: 16px; margin-top: 20px;">
      <strong>Motivo:</strong> ${motivo}
    </p>

    <p style="font-size: 14px; margin-top: 20px; color: #555;">
      En un plazo de 48 horas (días laborables) recibirás un correo con la resolución de tu solicitud.
    </p>

    <p style="font-size: 14px; margin-top: 20px; color: #555;">
      Si no lo recibes, por favor contáctanos en 
      <a href="mailto:contactfootlaces@gmail.com" style="color: #0051ff;">contactfootlaces@gmail.com</a>.
    </p>

    <p style="font-size: 14px; margin-top: 30px; color: #777;">Gracias por confiar en <strong>FootLaces</strong> 💙</p>
  </div>
`
      });
  
      res.redirect('/perfil?success=✅ Solicitud de devolución enviada correctamente');
    } catch (error) {
      console.error('[❌ ERROR DEVOLUCIÓN]:', error);
      res.status(500).send('Error al procesar la devolución');
    }
  };
  exports.confirmarDevolucion = async (req, res) => {
    try {
      const { id } = req.params;
      const { email } = req.body;
  
      const pedido = await Pedido.findById(id).populate('usuario');
  
      if (!pedido) {
        return res.status(404).send('Pedido no encontrado');
      }
  
      if (pedido.usuario.email !== email) {
        return res.status(400).send('El correo no coincide con el del pedido');
      }
  
      pedido.estado = 'Devuelto';
      await pedido.save();
  
      // ✉️ Enviar correo de confirmación
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: pedido.usuario.email,
        subject: `📦 Confirmación de devolución para el pedido ${pedido.numeroPedido}`,
        html: `
          <h3>Hola ${pedido.usuario.nombre},</h3>
          <p>Hemos recibido tu confirmación de devolución del pedido <strong>${pedido.numeroPedido}</strong>.</p>
          <p>En breve revisaremos el paquete y gestionaremos el reembolso si corresponde.</p>
          <br>
          <p>Gracias por tu confianza,</p>
          <p>Equipo Footlaces</p>
        `
      });
  
      res.send('✅ Devolución confirmada correctamente. Revisa tu correo para más detalles.');
    } catch (error) {
      console.error('❌ Error al confirmar devolución:', error);
      res.status(500).send('Error al confirmar la devolución');
    }
  };