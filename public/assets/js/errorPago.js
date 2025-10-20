// Inicializar página de error cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    inicializarPaginaError();
    configurarEventosError();
    actualizarCarritoHeader(); // Mantener carrito en error
});

/**
 * Inicializa la página de error con los datos de la compra fallida
 */
function inicializarPaginaError() {
    const urlParams = new URLSearchParams(window.location.search);
    const ordenParam = urlParams.get('orden');
    const ultimaCompra = JSON.parse(localStorage.getItem('ultimaCompra'));
    
    if (!ultimaCompra && !ordenParam) {
        // Redirigir al carrito si no hay datos de compra
        window.location.href = 'carrito.html';
        return;
    }

    // Mostrar datos de la compra fallida
    mostrarDatosCompraError(ultimaCompra);
    renderizarProductosError(ultimaCompra.productos);
    actualizarTotalError(ultimaCompra.total);
}

/**
 * Muestra los datos de la compra fallida en los formularios
 */
function mostrarDatosCompraError(compra) {
    // Actualizar número de compra
    document.getElementById('numeroError').textContent = compra.numeroOrden;

    // Datos del cliente
    document.getElementById('errorNombre').value = compra.cliente.nombre;
    document.getElementById('errorApellidos').value = compra.cliente.apellidos;
    document.getElementById('errorCorreo').value = compra.cliente.correo;

    // Datos de dirección
    document.getElementById('errorCalle').value = compra.direccion.calle;
    document.getElementById('errorDepartamento').value = compra.direccion.departamento;
    document.getElementById('errorRegion').value = compra.direccion.region;
    document.getElementById('errorComuna').value = compra.direccion.comuna;
    document.getElementById('errorIndicaciones').value = compra.direccion.indicaciones;
}

/**
 * Renderiza los productos en la tabla de error
 */
function renderizarProductosError(productos) {
    const tbody = document.getElementById('tablaErrorBody');
    
    tbody.innerHTML = productos.map(producto => `
        <tr>
            <td>
                <img src="${producto.imagen}" 
                     alt="${producto.nombre}" 
                     class="imagen-tabla"
                     onerror="this.src='https://via.placeholder.com/100x100/cccccc/969696?text=Imagen'">
            </td>
            <td>${producto.nombre}</td>
            <td>$${producto.precio?.toLocaleString('es-CL')}</td>
            <td>${producto.cantidad || 1}</td>
            <td>$${((producto.precio || 0) * (producto.cantidad || 1)).toLocaleString('es-CL')}</td>
        </tr>
    `).join('');
}

/**
 * Actualiza el total en la página de error
 */
function actualizarTotalError(total) {
    document.getElementById('totalError').textContent = total.toLocaleString('es-CL');
}

/**
 * Actualiza el header del carrito (mantener productos en error)
 */
function actualizarCarritoHeader() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const total = carrito.reduce((sum, producto) => {
        return sum + ((producto.precio || 0) * (producto.cantidad || 1));
    }, 0);
    
    const carritoTotalElement = document.querySelector('.carrito-total');
    if (carritoTotalElement) {
        carritoTotalElement.textContent = total.toLocaleString('es-CL');
    }
}

/**
 * Redirige al checkout para reintentar el pago
 */
function reintentarPago() {
    window.location.href = 'checkout.html';
}

/**
 * Configura los eventos de la página de error
 */
function configurarEventosError() {
    document.getElementById('btnReintentarPago').addEventListener('click', reintentarPago);
}