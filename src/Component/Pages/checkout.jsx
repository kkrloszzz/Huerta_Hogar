import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './Checkout.css';

/**
 * Componente de Checkout - Procesamiento de compra
 */
const Checkout = () => {
  const [carrito, setCarrito] = useState([]);
  const [formData, setFormData] = useState({
    cliente: {
      nombre: '',
      apellidos: '',
      correo: ''
    },
    direccion: {
      calle: '',
      departamento: '',
      region: '',
      comuna: '',
      indicaciones: ''
    }
  });
  const [procesando, setProcesando] = useState(false);
  const navigate = useNavigate();

  // Cargar carrito desde localStorage
  useEffect(() => {
    const carritoGuardado = JSON.parse(localStorage.getItem('carrito')) || [];
    setCarrito(carritoGuardado);

    if (carritoGuardado.length === 0) {
      navigate('/carrito');
    }
  }, [navigate]);

  /**
   * Maneja cambios en los campos del formulario
   */
  const handleInputChange = (seccion, campo, valor) => {
    setFormData(prev => ({
      ...prev,
      [seccion]: {
        ...prev[seccion],
        [campo]: valor
      }
    }));
  };

  /**
   * Valida todos los campos del formulario
   */
  const validarFormulario = () => {
    const { cliente, direccion } = formData;
    
    // Validar campos requeridos del cliente
    if (!cliente.nombre.trim() || !cliente.apellidos.trim() || !cliente.correo.trim()) {
      alert('Por favor completa todos los campos del cliente');
      return false;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cliente.correo)) {
      alert('Por favor ingresa un email válido');
      return false;
    }

    // Validar campos requeridos de dirección
    if (!direccion.calle.trim() || !direccion.region.trim() || !direccion.comuna.trim()) {
      alert('Por favor completa todos los campos obligatorios de la dirección');
      return false;
    }

    return true;
  };

  /**
   * Procesa el pago y guarda la compra en Firestore
   */
  const procesarPago = async () => {
    if (!validarFormulario()) return;

    setProcesando(true);

    try {
      const total = carrito.reduce((sum, producto) => 
        sum + ((producto.precio || 0) * (producto.cantidad || 1)), 0
      );

      // Crear objeto de compra
      const compra = {
        fecha: new Date(),
        fechaTimestamp: new Date(),
        cliente: formData.cliente,
        direccion: formData.direccion,
        productos: carrito,
        total: total,
        subtotal: total,
        estado: 'pendiente',
        numeroOrden: generarNumeroOrden(),
        metodoPago: 'tarjeta',
        estadoEntrega: 'pendiente'
      };

      console.log('Guardando compra en Firestore:', compra);

      //GUARDAR COMPRA EN FIRESTORE
      const docRef = await addDoc(collection(db, 'compras'), compra);
      console.log('Compra guardada con ID:', docRef.id);

      // Simular procesamiento de pago (80% éxito)
      const pagoExitoso = Math.random() > 0.2;
      
      if (pagoExitoso) {
        //PAGO EXITOSO - Actualizar estado en Firestore
        await updateDoc(doc(db, 'compras', docRef.id), {
          estado: 'completada',
          pagoExitoso: true,
          fechaCompletada: new Date()
        });

        // Limpiar carrito y redirigir a éxito
        localStorage.removeItem('carrito');
        localStorage.setItem('ultimaCompra', JSON.stringify({
          ...compra,
          id: docRef.id
        }));

        navigate(`/exito?orden=${compra.numeroOrden}&id=${docRef.id}`);
      } else {
        // PAGO FALLIDO - Actualizar estado en Firestore
        await updateDoc(doc(db, 'compras', docRef.id), {
          estado: 'fallida',
          pagoExitoso: false,
          errorPago: 'Fallo en el procesamiento del pago'
        });

        localStorage.setItem('ultimaCompra', JSON.stringify({
          ...compra,
          id: docRef.id
        }));

        navigate(`/error?orden=${compra.numeroOrden}&id=${docRef.id}`);
      }

    } catch (error) {
      console.error('Error procesando la compra:', error);
      alert('Error al procesar la compra. Intenta nuevamente.');
    } finally {
      setProcesando(false);
    }
  };

  /**
   * Genera número de orden único
   */
  const generarNumeroOrden = () => {
    const fecha = new Date();
    const timestamp = fecha.getTime();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD${fecha.getFullYear()}${(fecha.getMonth()+1).toString().padStart(2, '0')}${fecha.getDate().toString().padStart(2, '0')}${random}`;
  };

  /**
   * Calcula el total del carrito
   */
  const calcularTotal = () => {
    return carrito.reduce((total, producto) => {
      return total + (producto.precio || 0) * (producto.cantidad || 1);
    }, 0);
  };

  if (carrito.length === 0) {
    return (
      <div className="carrito-vacio">
        <div className="icono">🛒</div>
        <h3>No hay productos en el carrito</h3>
        <button 
          className="btn-ir-catalogo"
          onClick={() => navigate('/carrito')}
        >
          Volver al Carrito
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      {/* Encabezado del Checkout */}
      <div className="checkout-header">
        <div className="checkout-titulos">
          <h1 className="checkout-titulo">Carrito de Compra</h1>
          <p className="checkout-subtitulo">Completa la siguiente información</p>
        </div>
        <div className="btn-total-pagar">
          Total a Pagar: ${calcularTotal().toLocaleString('es-CL')}
        </div>
      </div>

      {/* Tabla de Productos */}
      <div className="tabla-checkout-container">
        <table className="tabla-checkout">
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Precio $</th>
              <th>Cantidad</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {carrito.map((producto, index) => (
              <tr key={index}>
                <td>
                  <img 
                    src={producto.imagen} 
                    alt={producto.nombre}
                    className="imagen-tabla"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/100x100/cccccc/969696?text=Imagen';
                    }}
                  />
                </td>
                <td>{producto.nombre}</td>
                <td>${producto.precio?.toLocaleString('es-CL')}</td>
                <td>{producto.cantidad || 1}</td>
                <td>
                  ${((producto.precio || 0) * (producto.cantidad || 1)).toLocaleString('es-CL')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Información del Cliente */}
      <section className="info-cliente">
        <h2 className="section-title">Información del Cliente</h2>
        <p className="section-subtitle">Completa la siguiente información</p>
        
        <div className="form-cliente">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nombre">Nombre *</label>
              <input
                type="text"
                id="nombre"
                value={formData.cliente.nombre}
                onChange={(e) => handleInputChange('cliente', 'nombre', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="apellidos">Apellidos *</label>
              <input
                type="text"
                id="apellidos"
                value={formData.cliente.apellidos}
                onChange={(e) => handleInputChange('cliente', 'apellidos', e.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-group full-width">
            <label htmlFor="correo">Correo Electrónico *</label>
            <input
              type="email"
              id="correo"
              value={formData.cliente.correo}
              onChange={(e) => handleInputChange('cliente', 'correo', e.target.value)}
              required
            />
          </div>
        </div>
      </section>

      {/* Dirección de Entrega */}
      <section className="direccion-entrega">
        <h2 className="section-title">Dirección de entrega de los productos</h2>
        <p className="section-subtitle">Ingrese dirección de forma detallada</p>
        
        <div className="form-direccion">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="calle">Calle *</label>
              <input
                type="text"
                id="calle"
                value={formData.direccion.calle}
                onChange={(e) => handleInputChange('direccion', 'calle', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="departamento">Departamento (Opcional)</label>
              <input
                type="text"
                id="departamento"
                value={formData.direccion.departamento}
                onChange={(e) => handleInputChange('direccion', 'departamento', e.target.value)}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="region">Región *</label>
              <input
                type="text"
                id="region"
                value={formData.direccion.region}
                onChange={(e) => handleInputChange('direccion', 'region', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="comuna">Comuna *</label>
              <input
                type="text"
                id="comuna"
                value={formData.direccion.comuna}
                onChange={(e) => handleInputChange('direccion', 'comuna', e.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-group full-width">
            <label htmlFor="indicaciones">Indicaciones para la entrega (Opcional)</label>
            <textarea
              id="indicaciones"
              rows="3"
              value={formData.direccion.indicaciones}
              onChange={(e) => handleInputChange('direccion', 'indicaciones', e.target.value)}
              placeholder="Ej: Timbre azul, dejar con conserje..."
            />
          </div>
        </div>
      </section>

      {/* Botón Final */}
      <div className="checkout-footer">
        <button 
          className="btn-pagar-ahora"
          onClick={procesarPago}
          disabled={procesando}
        >
          {procesando ? '⏳ Procesando pago...' : `Pagar Ahora: $${calcularTotal().toLocaleString('es-CL')}`}
        </button>
      </div>
    </div>
  );
};

export default Checkout;