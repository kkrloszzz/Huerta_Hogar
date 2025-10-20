import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './Exito.css';

/**
 * Componente de Compra Exitosa
 * Muestra los detalles de la compra completada
 */
const CompraExitosa = () => {
  const [compra, setCompra] = useState(null);
  const [searchParams] = useSearchParams();
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
   * Simula la impresión de la boleta en PDF
   */
  const imprimirBoletaPDF = () => {
    alert('Generando boleta en PDF...\nLa descarga comenzará en breve.');
    // En una implementación real, aquí se generaría el PDF
  };

  /**
   * Simula el envío de la boleta por email
   */
  const enviarBoletaEmail = () => {
    if (!compra) return;
    alert(`Boleta enviada a: ${compra.cliente.correo}\nRevisa tu bandeja de entrada.`);
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
    <div className="exito-container">
      {/* Encabezado */}
      <div className="exito-header">
        <span className="codigo-orden">{compra.numeroOrden}</span>
        <div className="exito-titulo">
          <span className="icono-exito">✅</span>
          <h1>Se ha realizado la compra nro <span>{compra.numeroOrden}</span></h1>
        </div>
        <p className="exito-subtitulo">Completa la siguiente información</p>
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

      {/* Total Pagado */}
      <div className="total-pagado-container">
        <div className="total-pagado">
          <span className="total-text">Total Pagado: $</span>
          <span className="total-precio">
            {compra.total.toLocaleString('es-CL')}
          </span>
        </div>
      </div>

      {/* Botones Finales */}
      <div className="exito-footer">
        <button 
          className="btn-imprimir-pdf"
          onClick={imprimirBoletaPDF}
        >
          Imprimir Boleta en PDF
        </button>
        <button 
          className="btn-enviar-email"
          onClick={enviarBoletaEmail}
        >
          Enviar Boleta por Email
        </button>
      </div>
    </div>
  );
};

export default CompraExitosa;