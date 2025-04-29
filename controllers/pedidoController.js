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

        console.log(`✅ Pedido actualizado a estado: ${estado}`);

        const usuario = pedido.usuario;

        if (!usuario || !usuario.email) {
            console.error('❌ El usuario no tiene un correo registrado o no existe.');
            return res.status(400).send('El usuario no tiene un correo registrado.');
        }

        console.log('📧 Usuario encontrado: ', usuario.email);

        // 🔥 Vamos a probar Nodemailer directamente aquí:
        const nodemailer = require('nodemailer');

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
            to: usuario.email,
            subject: `Actualización de tu pedido ${pedido.numeroPedido}`,
            text: `Hola ${usuario.nombre}, tu pedido ${pedido.numeroPedido} se encuentra ahora mismo en estado: ${estado}.`,
            html: `<h1>¡Hola ${usuario.nombre}!</h1>
                   <p>Tu pedido <strong>${pedido.numeroPedido}</strong> se encuentra ahora mismo en estado: <strong>${estado}</strong>.</p>
                   <br>
                   <p>¡Gracias por confiar en nosotros!</p>`
        };

        console.log('📧 Intentando enviar el correo a: ', usuario.email);

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('❌ Error al enviar el correo:', error);
            } else {
                console.log('✅ Correo enviado con éxito:', info.response);
            }
        });

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

            // 🔍 Solo actualiza y notifica si el estado ha cambiado
            if (pedido.estado !== nuevoEstado) {
                pedido.estado = nuevoEstado;
                await pedido.save();

                const usuario = pedido.usuario;

                if (!usuario || !usuario.email) continue;

                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: usuario.email,
                    subject: `Actualización de tu pedido ${pedido.numeroPedido}`,
                    html: `
                        <h1>¡Hola ${usuario.nombre}!</h1>
                        <p>Tu pedido <strong>${pedido.numeroPedido}</strong> ha cambiado a estado: <strong>${nuevoEstado}</strong>.</p>
                        <h3>Resumen del pedido:</h3>
                        <ul>
                            ${pedido.productos.map(p => `
                                <li>${p.producto.nombre} - Talla ${p.talla} - Cantidad ${p.cantidad}</li>
                            `).join('')}
                        </ul>
                        <br>
                        <p>Gracias por confiar en nosotros 💙</p>
                    `
                };

                await transporter.sendMail(mailOptions);
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
        const estado = req.params.estado.replace(/-/g, ' ');
        const estadoFormateado = estado.charAt(0).toUpperCase() + estado.slice(1);
        const pedidos = await Pedido.find({ estado: estadoFormateado }).populate('usuario');
        res.render('listarPedidos', { pedidos, estado: estadoFormateado }); 
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

    const { productoId, cantidad } = req.body;

    try {
        const producto = await Producto.findById(productoId);
        const usuario = await User.findById(req.session.user.id);

        if (!usuario) {
            console.error('❌ Usuario no encontrado. Asegúrate de que req.session.user.id está presente.');
            return res.status(404).send('Usuario no encontrado.');
        }

        console.log('✅ Usuario encontrado: ', usuario);
        console.log('📧 Correo del usuario: ', usuario.email || 'No se encontró un email asignado.');

        if (!producto) {
            console.error('❌ Producto no encontrado.');
            return res.status(404).send('Producto no encontrado.');
        }

        const nuevoPedido = new Pedido({
            usuario: usuario._id,
            productos: [{
                producto: {
                    _id: producto._id,
                    nombre: producto.nombre,
                    marca: producto.marca,
                    imagenes: producto.imagenes
                  },
                  
              cantidad: parseInt(cantidad),
              talla: "Sin especificar",
              precio: producto.precio
            }],
            total: producto.precio * cantidad,
            estado: 'Pendiente',
            fecha: new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })
          });
          

        await nuevoPedido.save();

        console.log('✅ Pedido creado con éxito.');

        // 🔥 Aquí configuramos Nodemailer para enviar un correo de prueba
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: usuario.email,
            subject: `¡Gracias por tu pedido, ${usuario.nombre}!`,
            text: `Pedido realizado correctamente por ${usuario.nombre}. Producto: ${producto.nombre}. Cantidad: ${cantidad}`,
            html: `<h1>¡Gracias por tu compra!</h1>
                   <p>Producto: ${producto.nombre}</p>
                   <p>Precio: ${producto.precio}</p>
                   <p>Cantidad: ${cantidad}</p>
                   <p>Estado: Pendiente</p>
                   <br>
                   <p>¡Gracias por confiar en nosotros!</p>`
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
