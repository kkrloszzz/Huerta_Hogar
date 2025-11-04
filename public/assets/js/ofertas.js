document.addEventListener("DOMContentLoaded", () => {
  // --- 1. CONFIGURACIÓN DE FIREBASE (CORREGIDA) ---
  // Esta es la configuración correcta que debes usar.
  const firebaseConfig = {
      apiKey: "AIzaSyAkqjjPbCFCi3CraWB3FIPSeq2fiLHBE_w",
      authDomain: "tienda-huerta-hogar.firebaseapp.com", // CORREGIDO
      projectId: "tienda-huerta-hogar",
      storageBucket: "tienda-huerta-hogar.appspot.com",
      messagingSenderId: "29884421309",
      appId: "1:29884421309:web:eb7268e124949456d8d3d4"
  };

  // --- 2. INICIALIZACIÓN DE FIREBASE ---
  // Se inicializa solo si no ha sido inicializado antes.
  if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
  }
  const db = firebase.firestore();
  console.log("Firebase inicializado correctamente.");

  // --- 3. ELEMENTOS DEL DOM ---
  // Se obtienen todas las referencias a los elementos del HTML.
  const dropdownCategorias = document.getElementById("dropdownCategorias");
  const cardsCategorias = document.getElementById("cardsCategorias");
  const productosGrid = document.getElementById("productosGrid");
  const tituloProductos = document.getElementById("tituloProductos");
  const buscador = document.getElementById("buscador");
  const btnBuscar = document.getElementById("btnBuscar");
  const carritoTotal = document.querySelector('.carrito-total');
  const btnVerTodos = document.getElementById("btnVerTodos");
  const btnCarrito = document.querySelector('.btn-carrito'); // Este debe existir en el HTML

  // --- 4. ESTADO DE LA APLICACIÓN ---
  let productosGlobal = [];
  let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  let categoriaActiva = 'todos';

  // --- 5. LÓGICA PRINCIPAL ---

  /**
   * Carga los productos desde la colección 'producto' en Firestore.
   */
  async function cargarProductos() {
      if (!productosGrid) return; 

      try {
          tituloProductos.textContent = "Cargando productos...";

          // --- MODIFICACIÓN AQUÍ ---

          // 1. Define los IDs de los productos que quieres (reemplaza estos)
          const idsProductosElegidos = [
              "LCFV5hpfSlC0qpZox8wm", 
              "RDxxfmbWlUWgy1lzP29I", 
              "U3W7RjH0GFdTVeZ4hI8Y"
          ];

          // 2. Cambia la consulta para buscar SOLO esos IDs
          const snapshot = await db.collection("producto")
              .where(firebase.firestore.FieldPath.documentId(), "in", idsProductosElegidos)
              .get();

          // --- FIN DE LA MODIFICACIÓN ---

          productosGlobal = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
          }));

          console.log("Productos cargados desde Firestore:", productosGlobal);
          
          // IMPORTANTE: Ajusta el título
          if (tituloProductos) {
            tituloProductos.textContent = "🎁 Productos en Ofertas 🎁"; // O el título que quieras
          }

          // Llama a mostrarProductos directamente en lugar de inicializar todo
          mostrarProductos(productosGlobal); 
          
          // Aún necesitas los eventos y el listener de stock
          configurarEventos();
          escucharCambiosStock();
          
          // Opcional: Si quieres que las categorías sigan funcionando
          // para *todos* los productos, tendrías que cargarlas aparte.
          // Por ahora, esto solo mostrará los 3 productos.

      } catch (error) {
          console.error("Error al cargar productos:", error);
          tituloProductos.textContent = "Error al cargar productos";
          if (productosGrid) {
              productosGrid.innerHTML = "<p class='error'>No se pudieron cargar los productos.</p>";
          }
      }
  }
  /**
   * Configura la interfaz de usuario una vez que los productos se han cargado.
   */
  function inicializarInterfaz(productos) {
      const categorias = [...new Set(productos.map(p => p.categoria).filter(Boolean))];

      mostrarDropdownCategorias(categorias);
      mostrarCardsCategorias(categorias);
      mostrarTodosLosProductos();
      configurarEventos();
      escucharCambiosStock();
  }

  /**
   * Muestra las categorías en el menú desplegable.
   */
  function mostrarDropdownCategorias(categorias) {
      if (!dropdownCategorias) return;
      dropdownCategorias.innerHTML = categorias.map(cat => `
          <li><a class="dropdown-item" href="#" data-categoria="${cat}">${cat}</a></li>
      `).join("");

      dropdownCategorias.addEventListener('click', (e) => {
          if (e.target.matches('.dropdown-item')) {
              e.preventDefault();
              filtrarPorCategoria(e.target.dataset.categoria);
          }
      });
  }

  /**
   * Muestra las categorías como tarjetas visuales.
   */
  function mostrarCardsCategorias(categorias) {
      if (!cardsCategorias) return;
      // Aquí puedes agregar la lógica para los iconos si lo deseas
      cardsCategorias.innerHTML = categorias.map(cat => `
          <div class="categoria-card" data-categoria="${cat}">
              <div class="categoria-nombre">${cat}</div>
          </div>
      `).join("");

      cardsCategorias.addEventListener('click', (e) => {
          const card = e.target.closest('.categoria-card');
          if (card) {
              filtrarPorCategoria(card.dataset.categoria);
          }
      });
  }

  /**
   * Renderiza una lista de productos en la cuadrícula.
   */
  /**
  * Renderiza una lista de productos en la cuadrícula.
  */
  function mostrarProductos(productos) {
      if (!productosGrid) return;
      if (productos.length === 0) {
          productosGrid.innerHTML = `<p class='error' style="grid-column: 1 / -1;">No se encontraron productos para esta selección.</p>`;
          return;
      }

      productosGrid.innerHTML = productos.map(producto => `
          <div class="producto-card">
              <img src="${producto.imagen}" alt="${producto.nombre}" class="producto-imagen" onerror="this.src='https://via.placeholder.com/400x300?text=Sin+Imagen'">
              <div class="producto-info">
                  <h3 class="producto-nombre">${producto.nombre || 'Producto sin nombre'}</h3>
                  
                  ${producto.precioAnterior 
                      ? `<p class="producto-precio-anterior">Precio Anterior: $${(producto.precioAnterior).toLocaleString('es-CL')}</p>` 
                      : ''
                  }
                  <p class="producto-precio">Ahora: $${(producto.precio || 0).toLocaleString('es-CL')}</p>
                  <p class="producto-stock">Stock: ${producto.stock ?? 'N/A'}</p>
                  <button class="btn-agregar" data-id="${producto.id}" ${producto.stock <= 0 ? 'disabled' : ''}>
                      ${producto.stock <= 0 ? 'Sin Stock' : '🛒 Agregar al carrito'}
                  </button>
              </div>
          </div>
      `).join("");

      // Añadir eventos a los nuevos botones
      document.querySelectorAll('.btn-agregar').forEach(btn => {
          btn.addEventListener('click', (e) => {
              agregarAlCarrito(e.currentTarget.dataset.id);
          });
      });
  }

  /**
   * Agrega un producto al carrito y actualiza el stock.
   */
  function agregarAlCarrito(productId) {
      const producto = productosGlobal.find(p => p.id === productId);
      if (!producto || producto.stock <= 0) {
          mostrarNotificacion('Producto sin stock disponible.', 'error');
          return;
      }

      const itemEnCarrito = carrito.find(item => item.id === productId);
      if (itemEnCarrito) {
          itemEnCarrito.cantidad++;
      } else {
          carrito.push({ ...producto, cantidad: 1 });
      }

      localStorage.setItem('carrito', JSON.stringify(carrito));
      actualizarCarritoTotal();
      actualizarStockFirebase(productId, -1); // Resta 1 del stock
      mostrarNotificacion(`"${producto.nombre}" agregado al carrito.`);
  }

  /**
   * Actualiza el stock de un producto en Firebase.
   * @param {string} productId - ID del producto.
   * @param {number} cantidad - Cantidad a sumar o restar (ej. -1 para restar).
   */
  async function actualizarStockFirebase(productId, cantidad) {
      const productoRef = db.collection("producto").doc(productId);
      try {
          await db.runTransaction(async (transaction) => {
              const doc = await transaction.get(productoRef);
              if (!doc.exists) {
                  throw "El documento no existe!";
              }
              const nuevoStock = (doc.data().stock || 0) + cantidad;
              transaction.update(productoRef, { stock: nuevoStock });
          });
      } catch (error) {
          console.error("Error al actualizar stock:", error);
      }
  }

  /**
   * Escucha cambios en tiempo real en la colección de productos.
   */
  function escucharCambiosStock() {
      db.collection("producto").onSnapshot(snapshot => {
          snapshot.docChanges().forEach(change => {
              if (change.type === "modified") {
                  const productoActualizado = { id: change.doc.id, ...change.doc.data() };
                  const index = productosGlobal.findIndex(p => p.id === productoActualizado.id);
                  if (index > -1) {
                      productosGlobal[index] = productoActualizado;
                      // Vuelve a renderizar los productos visibles para reflejar el cambio de stock
                      const productosEnVista = categoriaActiva === 'todos'
                          ? productosGlobal
                          : productosGlobal.filter(p => p.categoria === categoriaActiva);
                      mostrarProductos(productosEnVista);
                  }
              }
          });
      });
  }

  // --- FUNCIONES AUXILIARES Y DE EVENTOS ---

  function filtrarPorCategoria(categoria) {
      categoriaActiva = categoria;
      const productosFiltrados = productosGlobal.filter(p => p.categoria === categoria);
      tituloProductos.textContent = categoria;
      mostrarProductos(productosFiltrados);
  }

  function mostrarTodosLosProductos() {
      categoriaActiva = 'todos';
      tituloProductos.textContent = "Ofertas";
      mostrarProductos(productosGlobal);
  }

  function buscarProductos() {
      const termino = buscador.value.toLowerCase().trim();
      if (!termino) {
          mostrarTodosLosProductos();
          return;
      }
      const filtrados = productosGlobal.filter(p =>
          p.nombre?.toLowerCase().includes(termino) ||
          p.categoria?.toLowerCase().includes(termino)
      );
      tituloProductos.textContent = `Resultados para "${termino}"`;
      mostrarProductos(filtrados);
    }
  
  function actualizarCarritoTotal() {
      const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
      if (carritoTotal) {
          carritoTotal.textContent = total.toLocaleString('es-CL');
      }
  }

  function mostrarNotificacion(mensaje, tipo = 'success') {
      const notificacion = document.createElement('div');
      notificacion.className = `notificacion ${tipo}`;
      notificacion.textContent = mensaje;
      document.body.appendChild(notificacion);
      setTimeout(() => notificacion.remove(), 3000);
  }

  function configurarEventos() {
      if (btnVerTodos) btnVerTodos.addEventListener('click', mostrarTodosLosProductos);
      if (btnBuscar) btnBuscar.addEventListener('click', buscarProductos);
      if (buscador) buscador.addEventListener('keypress', e => e.key === 'Enter' && buscarProductos());
      
      // Se asegura que el botón exista antes de agregar el evento
      if (btnCarrito) {
          btnCarrito.addEventListener('click', () => {
              window.location.href = 'carrito.html';
          });
      } else {
          console.warn("El elemento con clase '.btn-carrito' no fue encontrado en el HTML.");
      }
  }

  // --- INICIO DE LA APP ---
  actualizarCarritoTotal();
  cargarProductos();
});