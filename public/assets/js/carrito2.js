const firebaseConfig = {

    apiKey: "AIzaSyAkqjjPbCFCi3CraWB3FIPSeq2fiLHBE_w",

    authDomain: "tiendaHuertaHogar.firebaseapp.com",

    projectId: "tienda-huerta-hogar",

};



// Inicializar Firebase PRIMERO

if (!firebase.apps.length) {

    firebase.initializeApp(firebaseConfig);

}



const db = firebase.firestore();

const auth = firebase.auth(); // AHORA sí podemos usar auth



// Variables globales

let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

let productosOferta = [];



// Inicializar la aplicación cuando el DOM esté listo

document.addEventListener('DOMContentLoaded', function() {

    inicializarCarrito();

    cargarProductosOferta();

    configurarEventos();

});



/**

 * Inicializa la interfaz del carrito

 */

function inicializarCarrito() {

    actualizarCarritoHeader();

    renderizarCarrito();

    calcularTotal();

}



/**

 * Carga productos en oferta desde Firestore

 */

async function cargarProductosOferta() {

    try {

        const snapshot = await db.collection("producto").get();

        productosOferta = snapshot.docs.map(doc => ({

            id: doc.id,

            ...doc.data()

        }));

        

        const productosConOferta = productosOferta.filter(producto => producto.precioAnterior);

        renderizarProductosOferta(productosConOferta);

    } catch (error) {

        console.error("Error cargando productos en oferta:", error);

    }

}



/**

 * Renderiza los productos en oferta

 */

function renderizarProductosOferta(productos) {

    const contenedor = document.getElementById('productosOferta');

    

    if (productos.length === 0) {

        contenedor.innerHTML = '<p class="text-muted">No hay productos en oferta en este momento.</p>';

        return;

    }



    contenedor.innerHTML = productos.map(producto => `

        <div class="producto-card">

            <img src="${producto.imagen}" 

                 alt="${producto.nombre}" 

                 class="producto-imagen"

                 onerror="this.src='https://via.placeholder.com/400x300/cccccc/969696?text=Imagen+No+Disponible'">

            <div class="producto-info">

                <h3 class="producto-nombre">${producto.nombre}</h3>

                <div class="precios-oferta">

                    <span class="precio-anterior">$${producto.precioAnterior?.toLocaleString('es-CL')}</span>

                    <span class="precio-actual">$${producto.precio?.toLocaleString('es-CL')}</span>

                </div>

                <p class="stock-disponible">Stock: ${producto.stock || 10}</p>

                <button class="btn-agregar-oferta" data-id="${producto.id}">

                    Añadir

                </button>

            </div>

        </div>

    `).join('');



    document.querySelectorAll('.btn-agregar-oferta').forEach(btn => {

        btn.addEventListener('click', function() {

            const productId = this.getAttribute('data-id');

            agregarProductoAlCarrito(productId);

        });

    });

}



/**

 * Renderiza los productos en el carrito

 */

function renderizarCarrito() {

    const tbody = document.getElementById('tablaCarritoBody');

    

    if (carrito.length === 0) {

        tbody.innerHTML = `

            <tr class="text-center">

                <td colspan="6" class="py-4">

                    <img src="https://via.placeholder.com/60x60.png?text=🛒" alt="Carrito vacío" class="mb-2">

                    <p class="mb-1">Tu carrito está vacío</p>

                    <small class="text-muted">Agrega algunos productos para continuar</small>

                    <div class="mt-3">

                        <a href="catalogo.html" class="btn btn-primary">Ir al Catálogo</a>

                    </div>

                </td>

            </tr>

        `;

        actualizarBotones(false);

        return;

    }



    tbody.innerHTML = carrito.map((producto, index) => `

        <tr>

            <td>

                <img src="${producto.imagen}" 

                     alt="${producto.nombre}" 

                     class="imagen-tabla"

                     style="width: 60px; height: 60px; object-fit: cover;"

                     onerror="this.src='https://via.placeholder.com/60x60/cccccc/969696?text=Img'">

            </td>

            <td>${producto.nombre}</td>

            <td>$${producto.precio?.toLocaleString('es-CL')}</td>

            <td>

                <div class="d-flex align-items-center justify-content-center">

                    <button class="btn btn-sm btn-outline-secondary" xx="disminuirCantidad(${index})">-</button>

                    <span class="mx-3">${producto.cantidad || 1}</span>

                    <button class="btn btn-sm btn-outline-secondary" xx="aumentarCantidad(${index})">+</button>

                </div>

            </td>

            <td>$${((producto.precio || 0) * (producto.cantidad || 1)).toLocaleString('es-CL')}</td>

            <td>

                <button class="btn btn-sm btn-danger" xx="eliminarDelCarrito(${index})">

                    Eliminar

                </button>

            </td>

        </tr>

    `).join('');

    

    actualizarBotones(true);

}



/**

 * Actualiza estado de botones

 */

function actualizarBotones(habilitado) {

    document.getElementById('btnLimpiarCarrito').disabled = !habilitado;

    document.getElementById('btnComprarAhora').disabled = !habilitado;

}



/**

 * Agrega un producto al carrito

 */

function agregarProductoAlCarrito(productId) {

    const producto = productosOferta.find(p => p.id === productId);

    

    if (producto) {

        if (producto.stock <= 0) {

            mostrarNotificacion('Producto sin stock disponible', 'error');

            return;

        }

        

        const productoExistente = carrito.find(item => item.id === productId);

        

        if (productoExistente) {

            if (productoExistente.cantidad >= producto.stock) {

                mostrarNotificacion('No hay más stock disponible', 'error');

                return;

            }

            productoExistente.cantidad = (productoExistente.cantidad || 1) + 1;

        } else {

            carrito.push({

                ...producto,

                cantidad: 1

            });

        }

        

        guardarCarrito();

        renderizarCarrito();

        calcularTotal();

        actualizarStockFirebase(productId, 1);

        mostrarNotificacion(`"${producto.nombre}" agregado al carrito`);

    }

}



/**

 * Actualizar stock en Firebase

 */

async function actualizarStockFirebase(productId, cantidad) {

    try {

        const productoRef = db.collection("producto").doc(productId);

        const productoDoc = await productoRef.get();

        

        if (productoDoc.exists) {

            const stockActual = productoDoc.data().stock;

            const nuevoStock = stockActual - cantidad;

            

            await productoRef.update({

                stock: nuevoStock

            });

            

            console.log(`Stock actualizado - Nuevo stock: ${nuevoStock}`);

        }

    } catch (error) {

        console.error("Error actualizando stock:", error);

    }

}



/**

 * Restaurar stock en Firebase

 */

async function restaurarStockFirebase(productId, cantidad) {

    try {

        const productoRef = db.collection("producto").doc(productId);

        const productoDoc = await productoRef.get();

        

        if (productoDoc.exists) {

            const stockActual = productoDoc.data().stock;

            const nuevoStock = stockActual + cantidad;

            

            await productoRef.update({

                stock: nuevoStock

            });

            

            console.log(`Stock restaurado - Nuevo stock: ${nuevoStock}`);

        }

    } catch (error) {

        console.error("Error restaurando stock:", error);

    }

}



/**

 * Aumenta la cantidad de un producto

 */

function aumentarCantidad(index) {

    const producto = carrito[index];

    

    if (producto.stock <= producto.cantidad) {

        mostrarNotificacion('No hay suficiente stock disponible', 'error');

        return;

    }

    

    carrito[index].cantidad = (carrito[index].cantidad || 1) + 1;

    guardarCarrito();

    renderizarCarrito();

    calcularTotal();

    actualizarStockFirebase(producto.id, 1);

}



/**

 * Disminuye la cantidad de un producto

 */

function disminuirCantidad(index) {

    const producto = carrito[index];

    

    if (carrito[index].cantidad > 1) {

        carrito[index].cantidad--;

        guardarCarrito();

        renderizarCarrito();

        calcularTotal();

        restaurarStockFirebase(producto.id, 1);

    }

}



/**

 * Elimina un producto del carrito

 */

function eliminarDelCarrito(index) {

    const producto = carrito[index];

    const cantidadEliminada = producto.cantidad || 1;

    

    carrito.splice(index, 1);

    guardarCarrito();

    renderizarCarrito();

    calcularTotal();

    restaurarStockFirebase(producto.id, cantidadEliminada);

    mostrarNotificacion(`"${producto.nombre}" eliminado del carrito`);

}



/**

 * Calcula el total del carrito

 */

function calcularTotal() {

    const total = carrito.reduce((sum, producto) => {

        return sum + ((producto.precio || 0) * (producto.cantidad || 1));

    }, 0);

    

    document.getElementById('totalCarrito').textContent = total.toLocaleString('es-CL');

    actualizarCarritoHeader();

}



/**

 * Actualiza el header del carrito

 */

function actualizarCarritoHeader() {

    const total = carrito.reduce((sum, producto) => {

        return sum + ((producto.precio || 0) * (producto.cantidad || 1));

    }, 0);

    

    const carritoBtn = document.querySelector('.btn-success span:last-child');

    if (carritoBtn) {

        carritoBtn.textContent = ` Carrito $${total.toLocaleString('es-CL')}`;

    }

}



/**

 * Guarda el carrito en localStorage

 */

function guardarCarrito() {

    localStorage.setItem('carrito', JSON.stringify(carrito));

}



/**

 * Limpia todo el carrito

 */

function limpiarCarrito() {

    if (carrito.length === 0) {

        mostrarNotificacion('El carrito ya está vacío', 'info');

        return;

    }

    

    if (confirm('¿Estás seguro de que quieres limpiar todo el carrito?')) {

        // Restaurar stock de todos los productos

        carrito.forEach(producto => {

            restaurarStockFirebase(producto.id, producto.cantidad);

        });

        

        carrito = [];

        guardarCarrito();

        renderizarCarrito();

        calcularTotal();

        mostrarNotificacion('Carrito limpiado correctamente');

    }

}



/**

 * Redirige al checkout

 */


/**

 * Muestra una notificación temporal

 */

function mostrarNotificacion(mensaje, tipo = 'success') {

    const colores = {

        success: '#28a745',

        error: '#dc3545',

        info: '#17a2b8'

    };

    

    const notificacion = document.createElement('div');

    notificacion.style.cssText = `

        position: fixed;

        top: 100px;

        right: 20px;

        background: ${colores[tipo]};

        color: white;

        padding: 15px 20px;

        border-radius: 5px;

        z-index: 10000;

        box-shadow: 0 3px 10px rgba(0,0,0,0.2);

        font-weight: 600;

    `;

    notificacion.textContent = mensaje;

    document.body.appendChild(notificacion);

    

    setTimeout(() => {

        notificacion.remove();

    }, 3000);

}



/**

 * Configura los eventos de la página

 */

function configurarEventos() {
    document.getElementById('btnLimpiarCarrito').addEventListener('click', limpiarCarrito);

}



// Hacer funciones disponibles globalmente

window.aumentarCantidad = aumentarCantidad;

window.disminuirCantidad = disminuirCantidad;

window.eliminarDelCarrito = eliminarDelCarrito;