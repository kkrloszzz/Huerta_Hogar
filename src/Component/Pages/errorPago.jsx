import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ErrorPago.css';

/**
 * Componente de Error en el Pago
 * Muestra los detalles cuando falla el procesamiento del pago
 */
const ErrorPago = () => {
  const [compra, setCompra] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const ultimaCompra = JSON.parse(localStorage.getItem('ultimaCompra'));
    
    if (!ultimaCompra) {
      navigate('/carrito');
      return;
    }

    setCompra(ultimaCompra);
  }, [navigate]);

  /**
   * Redirige al checkout para reintentar el pago
   */
  const reintentarPago = () => {
    navigate('/checkout');
  };

  if (!compra) {
    return (
      <div className="cargando">
        <div className="spinner">🔄</div>
        <p>Cargando detalles de la compra...</p>
      </div>
    );
  }

  return (
    <div className="error-container">
      {/* Encabezado */}
      <div className="error-header">
        <div className="error-titulo">
          <span className="icono-error">❌</span>
          <h1>No se pudo realizar el pago <span>{compra.numeroOrden}</span></h1>
        </div>
        <h2 className="error-subtitulo">Detalle de compra</h2>
        <button 
          className="btn-reintentar-pago"
          onClick={reintentarPago}
        >
          Volver a realizar el pago
        </button>
      </div>

      {/* Información del Cliente */}
      <section className="info-cliente">
        <h2 className="section-title">Información del Cliente</h2>
        
        <div className="form-cliente readonly">
          <div className="form-row">
            <div className="form-group">
              <label>Nombre</label>
              <input 
                type="text" 
                value={compra.cliente.nombre} 
                readOnly 
              />
            </div>
            <div className="form-group">
              <label>Apellidos</label>
              <input 
                type="text" 
                value={compra.cliente.apellidos} 
                readOnly 
              />
            </div>
            <div className="form-group">
              <label>Correo</label>
              <input 
                type="email" 
                value={compra.cliente.correo} 
                readOnly 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Dirección de Entrega */}
      <section className="direccion-entrega">
        <h2 className="section-title">Dirección de entrega de los productos</h2>
        
        <div className="form-direccion readonly">
          <div className="form-row">
            <div className="form-group">
              <label>Calle</label>
              <input 
                type="text" 
                value={compra.direccion.calle} 
                readOnly 
              />
            </div>
            <div className="form-group">
              <label>Departamento</label>
              <input 
                type="text" 
                value={compra.direccion.departamento || 'N/A'} 
                readOnly 
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Región</label>
              <input 
                type="text" 
                value={compra.direccion.region} 
                readOnly 
              />
            </div>
            <div className="form-group">
              <label>Comuna</label>
              <input 
                type="text" 
                value={compra.direccion.comuna} 
                readOnly 
              />
            </div>
          </div>
          <div className="form-group full-width">
            <label>Indicaciones</label>
            <textarea 
              value={compra.direccion.indicaciones || 'Ninguna'} 
              readOnly 
            />
          </div>
        </div>
      </section>

      {/* Tabla de Productos */}
      <div className="tabla-checkout-container">
        <table className="tabla-checkout">
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Precio $</th>
              <th>Cantidad</th>
              <th>Subtotal $</th>
            </tr>
          </thead>
          <tbody>
            {compra.productos.map((producto, index) => (
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

      {/* Total */}
      <div className="total-pagado-container">
        <div className="total-pagado">
          <span className="total-text">Total: $</span>
          <span className="total-precio">
            {compra.total.toLocaleString('es-CL')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ErrorPago;