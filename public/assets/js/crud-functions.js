class CRUDFunctions {
    constructor() {
        this.db = null;
        this.inicializarFirebase();
        this.cargarDatosPerfil();
        this.ocultarModalesAlInicio();
    }

    inicializarFirebase() {
        try {
            const firebaseConfig = {
                apiKey: "AIzaSyAkqjjPbCFCi3CraWB3FIPSeq2fiLHBE_w",
                authDomain: "tienda-huerta-hogar.firebaseapp.com",
                projectId: "tienda-huerta-hogar",
                storageBucket: "tienda-huerta-hogar.appspot.com", //actualizar linea
                messagingSenderId: "29884421309",
                appId: "1:29884421309:web:eb7268e124949456d8d3d4",
                measurementId: "G-Q0GXZML5T1"
            };

            if (typeof firebase !== 'undefined' && !firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
            }
            
            this.db = firebase.firestore();
            console.log('Firebase listo para CRUD');
        } catch (error) {
            console.error('Error inicializando Firebase para CRUD:', error);
        }
    }

    ocultarModalesAlInicio() {
        const modales = ['modalProducto', 'modalCategoria', 'modalUsuario'];
        modales.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'none';
            }
        });
    }

    // ==================== MANEJO DE ESTADO DE CARGA ====================

    mostrarCargaResumen() {
        const elementosCarga = [
            'totalCompras', 'proyeccionCompras',
            'totalProductos', 'inventarioTotal', 
            'totalUsuarios', 'nuevosUsuariosMes'
        ];
        
        elementosCarga.forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.innerHTML = '<span class="loading-dots"><span>.</span><span>.</span><span>.</span></span>';
                elemento.classList.add('loading-state');
            }
        });
    }

    ocultarCargaResumen() {
        const elementos = document.querySelectorAll('.loading-state');
        elementos.forEach(elemento => {
            elemento.classList.remove('loading-state');
        });
    }

    mostrarErrorResumen(mensaje) {
        this.ocultarCargaResumen();
        const elementosError = {
            'totalCompras': '0',
            'proyeccionCompras': '0',
            'totalProductos': '0', 
            'inventarioTotal': '0',
            'totalUsuarios': '0',
            'nuevosUsuariosMes': '0'
        };
        
        for (const [id, valor] of Object.entries(elementosError)) {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.textContent = valor;
                elemento.classList.add('error-state');
            }
        }
        
        console.error('Error en resumen:', mensaje);
    }

    // ==================== DASHBOARD Y RESUMENES ====================

    async cargarResumenes() {
        try {
            console.log('Cargando resumenes del dashboard...');
            this.mostrarCargaResumen();
            
            const [comprasData, productosData, usuariosData] = await Promise.all([
                this.obtenerDatosCompras(),
                this.obtenerDatosProductos(), 
                this.obtenerDatosUsuarios()
            ]);
            
            this.actualizarResumenes(comprasData, productosData, usuariosData);
            this.ocultarCargaResumen();
            
        } catch (error) {
            console.error('Error cargando resumenes:', error);
            this.mostrarErrorResumen(error.message);
        }
    }

    async obtenerDatosCompras() {
        try {
            const snapshot = await this.db.collection("compras")
                .orderBy("fecha", "desc")
                .limit(100)
                .get();
                
            const compras = snapshot.docs.map(doc => ({
                ...doc.data(),
                fecha: doc.data().fecha?.toDate?.() || doc.data().fecha
            }));
            
            const totalCompras = compras.length;
            const ingresosTotales = compras.reduce((sum, compra) => sum + (compra.total || 0), 0);
            const proyeccion = this.calcularProyeccion(compras);
            
            return { totalCompras, ingresosTotales, proyeccion };
        } catch (error) {
            throw new Error(`Compras: ${error.message}`);
        }
    }

    async obtenerDatosProductos() {
        try {
            const snapshot = await this.db.collection("producto").get();
            const productos = snapshot.docs.map(doc => doc.data());
            
            const totalProductos = productos.length;
            const productosActivos = productos.filter(p => p.activo !== false).length;
            const inventarioTotal = productos.reduce((sum, p) => sum + (p.stock || 0), 0);
            const bajoStock = productos.filter(p => (p.stock || 0) < 10).length;
            
            return { totalProductos, productosActivos, inventarioTotal, bajoStock };
        } catch (error) {
            throw new Error(`Productos: ${error.message}`);
        }
    }

    async obtenerDatosUsuarios() {
        try {
            const snapshot = await this.db.collection("usuario").get();
            const usuarios = snapshot.docs.map(doc => ({
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt
            }));
            
            const totalUsuarios = usuarios.length;
            const nuevosUsuariosMes = this.contarUsuariosEsteMes(usuarios);
            const usuariosActivos = usuarios.filter(u => u.activo !== false).length;
            
            return { totalUsuarios, nuevosUsuariosMes, usuariosActivos };
        } catch (error) {
            throw new Error(`Usuarios: ${error.message}`);
        }
    }

    actualizarResumenes(comprasData, productosData, usuariosData) {
        if (document.getElementById('totalCompras')) {
            document.getElementById('totalCompras').textContent = comprasData.totalCompras;
        }
        if (document.getElementById('proyeccionCompras')) {
            document.getElementById('proyeccionCompras').textContent = comprasData.proyeccion;
        }
        
        if (document.getElementById('totalProductos')) {
            document.getElementById('totalProductos').textContent = productosData.totalProductos;
        }
        if (document.getElementById('inventarioTotal')) {
            document.getElementById('inventarioTotal').textContent = productosData.inventarioTotal;
        }
        
        if (document.getElementById('totalUsuarios')) {
            document.getElementById('totalUsuarios').textContent = usuariosData.totalUsuarios;
        }
        if (document.getElementById('nuevosUsuariosMes')) {
            document.getElementById('nuevosUsuariosMes').textContent = usuariosData.nuevosUsuariosMes;
        }
        
        console.log('Resumenes actualizados correctamente');
    }

    calcularProyeccion(compras) {
        if (compras.length === 0) return 0;
    
        const ahora = new Date();
        const año = ahora.getFullYear();
        const mes = ahora.getMonth();
    
        const primerDiaMes = new Date(año, mes, 1);
        const ultimoDiaMes = new Date(año, mes + 1, 0);
    
        const diaActual = ahora.getDate();
        const totalDiasMes = ultimoDiaMes.getDate();
    
        // Compras del mes actual
        const comprasMes = compras.filter(compra => {
            const fecha = compra.fecha?.toDate ? compra.fecha.toDate() : new Date(compra.fecha);
            return fecha >= primerDiaMes;
        }).length;
    
        if (comprasMes === 0) return 0;
    
        // Proyección basada en ritmo diario
        const proyeccion = Math.round((comprasMes / diaActual) * totalDiasMes);
    
        return proyeccion;
    }

    obtenerComprasUltimoMes(compras) {
        const ahora = new Date();
        const primerDiaMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        return compras.filter(compra => {
            const fechaCompra = compra.fecha?.toDate ? compra.fecha.toDate() : new Date(compra.fecha);
            return fechaCompra >= primerDiaMes;
        });
    }

    obtenerComprasMesAnterior(compras) {
        const ahora = new Date();
        const primerDiaMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1);
        const ultimoDiaMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth(), 0);
        
        return compras.filter(compra => {
            const fechaCompra = compra.fecha?.toDate ? compra.fecha.toDate() : new Date(compra.fecha);
            return fechaCompra >= primerDiaMesAnterior && fechaCompra <= ultimoDiaMesAnterior;
        });
    }

    contarUsuariosEsteMes(usuarios) {
        const ahora = new Date();
        const primerDiaMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        
        return usuarios.filter(usuario => {
            const fechaCreacion = usuario.createdAt?.toDate ? usuario.createdAt.toDate() : new Date(usuario.createdAt);
            return fechaCreacion >= primerDiaMes;
        }).length;
    }

    // ==================== ÓRDENES ====================
    async cargarOrdenes() {
        try {
            this.mostrarLoading('ordenes-tbody');
            const snapshot = await this.db.collection("compras")
                .orderBy("fecha", "desc")
                .get();
            
            const ordenes = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                fecha: doc.data().fecha?.toDate?.() || doc.data().fecha
            }));
            
            this.mostrarOrdenes(ordenes);
        } catch (error) {
            console.error('Error cargando ordenes:', error);
            this.mostrarError('ordenes-tbody', 'Error al cargar ordenes');
        }
    }

    mostrarOrdenes(ordenes) {
        const tbody = document.getElementById('ordenes-tbody');
        if (!tbody) return;

        if (ordenes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="no-data">No hay ordenes disponibles</td></tr>';
            return;
        }

        tbody.innerHTML = ordenes.map(orden => `
            <tr>
                <td>${orden.id.substring(0, 8)}...</td>
                <td>${orden.clienteNombre || orden.usuarioNombre || orden.nombre || 'N/A'}</td>
                <td>$${orden.total || orden.precio || 0}</td>
                <td>
                    <span class="badge ${this.getEstadoClass(orden.estado)}">
                        ${orden.estado || 'Pendiente'}
                    </span>
                </td>
                <td>${this.formatFecha(orden.fecha)}</td>
                <td class="acciones">
                    <button class="btn btn-sm btn-info" onclick="verDetalleOrden('${orden.id}')">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-warning" onclick="cambiarEstadoOrden('${orden.id}')">
                        <i class="bi bi-arrow-repeat"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async cambiarEstadoOrden(ordenId) {
        const nuevoEstado = prompt('Ingrese el nuevo estado (pendiente/procesando/completado/cancelado):');
        if (!nuevoEstado) return;

        try {
            await this.db.collection("compras").doc(ordenId).update({
                estado: nuevoEstado,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            alert('Estado actualizado correctamente');
            this.cargarOrdenes();
        } catch (error) {
            console.error('Error actualizando orden:', error);
            alert('Error al actualizar el estado');
        }
    }

    // ==================== PRODUCTOS ====================
    async cargarProductos() {
        try {
            this.mostrarLoading('productos-tbody');
            const snapshot = await this.db.collection("producto").get();
            const productos = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            this.mostrarProductos(productos);
        } catch (error) {
            console.error('Error cargando productos:', error);
            this.mostrarError('productos-tbody', 'Error al cargar productos');
        }
    }

    mostrarProductos(productos) {
        const tbody = document.getElementById('productos-tbody');
        if (!tbody) return;

        if (productos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="no-data">No hay productos disponibles</td></tr>';
            return;
        }

        tbody.innerHTML = productos.map(producto => `
            <tr>
                <td>${producto.nombre || 'Sin nombre'}</td>
                <td>$${producto.precio || 0}</td>
                <td>${producto.stock || 0}</td>
                <td>${producto.categoria || producto.categoría || 'General'}</td>
                <td>
                    <span class="badge ${(producto.activo !== false) ? 'activo' : 'inactivo'}">
                        ${(producto.activo !== false) ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td class="acciones">
                    <button class="btn btn-sm btn-warning" onclick="editarProducto('${producto.id}')">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="eliminarProducto('${producto.id}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async cargarDatosProducto(productoId) {
        try {
            const doc = await this.db.collection("producto").doc(productoId).get();
            if (doc.exists) {
                const producto = doc.data();
                
                const elementos = {
                    'productoId': productoId,
                    'productoNombre': producto.nombre || '',
                    'productoPrecio': producto.precio || '',
                    'productoStock': producto.stock || '',
                    'productoCategoria': producto.categoria || producto.categoría || '',
                    'productoImagen': producto.imagen || ''
                };

                for (const [id, value] of Object.entries(elementos)) {
                    const element = document.getElementById(id);
                    if (element) {
                        element.value = value;
                    } else {
                        console.warn('Elemento no encontrado:', id);
                    }
                }

                const titulo = document.getElementById('modalProductoTitulo');
                if (titulo) {
                    titulo.textContent = 'Editar Producto';
                }
            }
        } catch (error) {
            console.error('Error cargando producto:', error);
            alert('Error al cargar los datos del producto');
        }
    }

    async guardarProducto(productoData) {
        try {
            const producto = {
                nombre: productoData.nombre,
                precio: parseFloat(productoData.precio),
                stock: parseInt(productoData.stock),
                categoria: productoData.categoria,
                imagen: productoData.imagen,
                activo: true,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            if (productoData.id) {
                await this.db.collection("producto").doc(productoData.id).update(producto);
            } else {
                producto.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                await this.db.collection("producto").add(producto);
            }
            
            alert('Producto guardado correctamente');
            this.cerrarModal('modalProducto');
            this.cargarProductos();
        } catch (error) {
            console.error('Error guardando producto:', error);
            alert('Error al guardar el producto');
        }
    }

    async eliminarProducto(productoId) {
        if (!confirm('Estas seguro de que deseas eliminar este producto?')) return;

        try {
            await this.db.collection("producto").doc(productoId).delete();
            alert('Producto eliminado correctamente');
            this.cargarProductos();
        } catch (error) {
            console.error('Error eliminando producto:', error);
            alert('Error al eliminar el producto');
        }
    }

    // ==================== CATEGORÍAS ====================
    async cargarCategorias() {
        try {
            console.log('Cargando categorias desde productos...');
            this.mostrarLoading('categorias-tbody');
            
            const productosSnapshot = await this.db.collection("producto").get();
            const categorias = this.extraerCategoriasDeProductosSnapshot(productosSnapshot);
            
            console.log('Categorias extraidas:', categorias.length);
            this.mostrarCategorias(categorias);
        } catch (error) {
            console.error('Error cargando categorias:', error);
            this.mostrarError('categorias-tbody', 'Error al cargar categorias: ' + error.message);
        }
    }

    extraerCategoriasDeProductosSnapshot(productosSnapshot) {
        const categoriasMap = new Map();
        
        productosSnapshot.docs.forEach(doc => {
            const producto = doc.data();
            if (producto.categoria && producto.categoria.trim() !== '') {
                const categoriaNombre = producto.categoria.trim();
                
                if (!categoriasMap.has(categoriaNombre)) {
                    categoriasMap.set(categoriaNombre, {
                        id: categoriaNombre,
                        nombre: categoriaNombre,
                        descripcion: 'Categoria extraida de productos',
                        productosCount: 0,
                        esExtraida: true
                    });
                }
                
                const categoria = categoriasMap.get(categoriaNombre);
                categoria.productosCount++;
            }
        });

        const categorias = Array.from(categoriasMap.values());
        console.log('Categorias extraidas de productos:', categorias);
        return categorias;
    }

    mostrarCategorias(categorias) {
        const tbody = document.getElementById('categorias-tbody');
        if (!tbody) {
            console.error('No se encontro el tbody de categorias');
            return;
        }

        console.log('Mostrando categorias:', categorias);

        if (categorias.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="no-data">No hay categorias disponibles en los productos</td></tr>';
            return;
        }

        tbody.innerHTML = categorias.map(categoria => `
            <tr>
                <td>${categoria.nombre || 'Sin nombre'}</td>
                <td>${categoria.descripcion || 'Categoria de productos'}</td>
                <td>
                    <span class="badge activo">
                        Activa
                    </span>
                </td>
                <td>${categoria.productosCount || 0}</td>
                <td class="acciones">
                    <button class="btn btn-sm btn-info" onclick="verProductosCategoria('${categoria.nombre}')" title="Ver productos">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-warning" onclick="editarCategoriaGlobal('${categoria.nombre}')" title="Gestionar categoria">
                        <i class="bi bi-gear"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async crearCategoria() {
        try {
            const nombre = prompt('Ingrese el nombre de la nueva categoria:');
            if (!nombre || nombre.trim() === '') return;

            const productosSnapshot = await this.db.collection("producto")
                .where("categoria", "==", nombre.trim())
                .get();

            if (!productosSnapshot.empty) {
                alert('Esta categoria ya existe en los productos');
                return;
            }

            if (confirm('Desea asignar esta categoria a productos existentes?')) {
                await this.asignarCategoriaAProductos(nombre.trim());
            } else {
                alert('Categoria definida. Puede asignarla a productos despues.');
            }

            this.cargarCategorias();
        } catch (error) {
            console.error('Error creando categoria:', error);
            alert('Error al crear la categoria: ' + error.message);
        }
    }

    async asignarCategoriaAProductos(nombreCategoria) {
        try {
            const productosSnapshot = await this.db.collection("producto").get();
            const productosSinCategoria = productosSnapshot.docs.filter(doc => {
                const data = doc.data();
                return !data.categoria || data.categoria.trim() === '';
            });

            if (productosSinCategoria.length === 0) {
                alert('No hay productos sin categoria asignada');
                return;
            }

            let mensaje = 'Productos sin categoria:\n\n';
            productosSinCategoria.forEach((doc, index) => {
                const producto = doc.data();
                mensaje += `${index + 1}. ${producto.nombre || 'Sin nombre'}\n`;
            });

            const seleccion = prompt(`${mensaje}\nIngrese los numeros separados por coma (ej: 1,3,5) o "todos" para asignar a todos:`);
            
            if (!seleccion) return;

            if (seleccion.toLowerCase() === 'todos') {
                for (const doc of productosSinCategoria) {
                    await this.db.collection("producto").doc(doc.id).update({
                        categoria: nombreCategoria,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }
                alert(`Categoria "${nombreCategoria}" asignada a ${productosSinCategoria.length} productos`);
            } else {
                const indices = seleccion.split(',').map(i => parseInt(i.trim()) - 1).filter(i => !isNaN(i) && i < productosSinCategoria.length);
                
                for (const index of indices) {
                    const doc = productosSinCategoria[index];
                    await this.db.collection("producto").doc(doc.id).update({
                        categoria: nombreCategoria,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }
                alert(`Categoria "${nombreCategoria}" asignada a ${indices.length} productos`);
            }

            this.cargarCategorias();
        } catch (error) {
            console.error('Error asignando categoria:', error);
            alert('Error al asignar categoria: ' + error.message);
        }
    }

    async editarCategoriaGlobal(nombreCategoria) {
        try {
            const opcion = prompt(
                `Gestion de categoria: "${nombreCategoria}"\n\n` +
                `1. Cambiar nombre de la categoria\n` +
                `2. Asignar a mas productos\n` +
                `3. Ver productos de esta categoria\n` +
                `4. Eliminar categoria de productos\n\n` +
                `Ingrese el numero de la opcion:`
            );

            switch (opcion) {
                case '1':
                    await this.cambiarNombreCategoria(nombreCategoria);
                    break;
                case '2':
                    await this.asignarCategoriaAProductos(nombreCategoria);
                    break;
                case '3':
                    await this.verProductosCategoria(nombreCategoria);
                    break;
                case '4':
                    await this.eliminarCategoriaGlobal(nombreCategoria);
                    break;
                default:
                    return;
            }
        } catch (error) {
            console.error('Error en gestion de categoria:', error);
            alert('Error en la gestion: ' + error.message);
        }
    }

    async cambiarNombreCategoria(nombreActual) {
        const nuevoNombre = prompt(`Cambiar nombre de categoria:\n\nActual: "${nombreActual}"\n\nNuevo nombre:`);
        if (!nuevoNombre || nuevoNombre.trim() === '') return;

        try {
            const productosSnapshot = await this.db.collection("producto")
                .where("categoria", "==", nombreActual)
                .get();

            if (productosSnapshot.empty) {
                alert('No hay productos con esta categoria');
                return;
            }

            const batch = this.db.batch();
            productosSnapshot.docs.forEach(doc => {
                batch.update(doc.ref, {
                    categoria: nuevoNombre.trim(),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            });

            await batch.commit();
            alert(`Categoria cambiada de "${nombreActual}" a "${nuevoNombre}" en ${productosSnapshot.size} productos`);
            this.cargarCategorias();
        } catch (error) {
            console.error('Error cambiando nombre de categoria:', error);
            alert('Error al cambiar el nombre: ' + error.message);
        }
    }

    async verProductosCategoria(nombreCategoria) {
        try {
            const productosSnapshot = await this.db.collection("producto")
                .where("categoria", "==", nombreCategoria)
                .get();

            if (productosSnapshot.empty) {
                alert(`No hay productos en la categoria "${nombreCategoria}"`);
                return;
            }

            let mensaje = `Productos en categoria "${nombreCategoria}":\n\n`;
            productosSnapshot.docs.forEach((doc, index) => {
                const producto = doc.data();
                mensaje += `${index + 1}. ${producto.nombre || 'Sin nombre'} - $${producto.precio || 0} - Stock: ${producto.stock || 0}\n`;
            });

            alert(mensaje);
        } catch (error) {
            console.error('Error viendo productos:', error);
            alert('Error al cargar productos: ' + error.message);
        }
    }

    async eliminarCategoriaGlobal(nombreCategoria) {
        if (!confirm(`Esta seguro de que desea eliminar la categoria "${nombreCategoria}" de todos los productos?`)) return;

        try {
            const productosSnapshot = await this.db.collection("producto")
                .where("categoria", "==", nombreCategoria)
                .get();

            if (productosSnapshot.empty) {
                alert('No hay productos con esta categoria');
                return;
            }

            const batch = this.db.batch();
            productosSnapshot.docs.forEach(doc => {
                batch.update(doc.ref, {
                    categoria: '',
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            });

            await batch.commit();
            alert(`Categoria "${nombreCategoria}" eliminada de ${productosSnapshot.size} productos`);
            this.cargarCategorias();
        } catch (error) {
            console.error('Error eliminando categoria:', error);
            alert('Error al eliminar categoria: ' + error.message);
        }
    }

    // ==================== USUARIOS ====================
    async cargarUsuarios() {
        try {
            console.log('Cargando usuarios desde Firestore...');
            this.mostrarLoading('usuarios-tbody');
            
            const snapshot = await this.db.collection("usuario").get();
            console.log('Usuarios encontrados:', snapshot.size);
            
            const usuarios = snapshot.docs.map(doc => {
                const data = doc.data();
                console.log('Usuario:', doc.id, data);
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate?.() || data.createdAt,
                    updatedAt: data.updatedAt?.toDate?.() || data.updatedAt
                };
            });
            
            this.mostrarUsuarios(usuarios);
        } catch (error) {
            console.error('Error cargando usuarios:', error);
            this.mostrarError('usuarios-tbody', 'Error al cargar usuarios: ' + error.message);
        }
    }

    mostrarUsuarios(usuarios) {
        const tbody = document.getElementById('usuarios-tbody');
        if (!tbody) {
            console.error('No se encontro el tbody de usuarios');
            return;
        }

        console.log('Mostrando usuarios:', usuarios);

        if (usuarios.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="no-data">No hay usuarios registrados</td></tr>';
            return;
        }

        tbody.innerHTML = usuarios.map(usuario => `
            <tr>
                <td>${usuario.run || 'Sin run'}</td>
                <td>${usuario.nombre || 'Sin nombre'}</td>
                <td>${usuario.email || usuario.correo || 'Sin email'}</td>
                <td>${usuario.clave ||'Sin clave'}</td>
                <td>${usuario.fecha ||'Sin fecha'}</td>
                <td>${usuario.telefono || 'No especificado'}</td>
                <td>${usuario.direccion || 'No especificada'}</td>
                <td>
                    <span class="badge ${this.getRolClass(usuario.rol)}">
                        ${usuario.rol || 'usuario'}
                    </span>
                </td>
                <td>
                    <span class="badge ${usuario.activo !== false ? 'activo' : 'inactivo'}">
                        ${usuario.activo !== false ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td>${this.formatFecha(usuario.createdAt)}</td>
                <td class="acciones">
                    <button class="btn btn-sm btn-warning" onclick="editarUsuario('${usuario.id}')" title="Editar">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="cambiarEstadoUsuario('${usuario.id}', ${usuario.activo !== false})" title="${usuario.activo !== false ? 'Desactivar' : 'Activar'}">
                        <i class="bi bi-${usuario.activo !== false ? 'pause' : 'play'}"></i>
                    </button>
                    <button class="btn btn-sm btn-info" onclick="cambiarRolUsuario('${usuario.id}')" title="Cambiar Rol">
                        <i class="bi bi-person-gear"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="eliminarUsuario('${usuario.id}')" title="Eliminar">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async cargarDatosUsuario(usuarioId) {
        try {
            console.log('Cargando datos del usuario:', usuarioId);
            const doc = await this.db.collection("usuario").doc(usuarioId).get();
            
            if (doc.exists) {
                const usuario = doc.data();
                console.log('Datos del usuario:', usuario);
                
                const elementos = {
                    'usuarioId': usuarioId,
                    'usuarioRun': usuario.run || '',
                    'usuarioNombre': usuario.nombre || '',
                    'usuarioEmail': usuario.email || usuario.correo || '',
                    'usuarioClave': '',
                    'usuarioFecha': usuario.fecha || '',
                    'usuarioTelefono': usuario.telefono || '',
                    'usuarioDireccion': usuario.direccion || '',
                    'usuarioRol': usuario.rol || 'cliente',
                    'usuarioActivo': usuario.activo !== false
                };

                for (const [id, value] of Object.entries(elementos)) {
                    const element = document.getElementById(id);
                    if (element) {
                        if (element.type === 'checkbox') {
                            element.checked = value;
                        } else {
                            element.value = value;
                        }
                    } else {
                        console.warn('Elemento no encontrado:', id);
                    }
                }

                const titulo = document.getElementById('modalUsuarioTitulo');
                if (titulo) {
                    titulo.textContent = 'Editar Usuario';
                }
                
                const passwordField = document.getElementById('passwordField');
                if (passwordField) {
                    passwordField.style.display = 'none';
                }
            } else {
                console.error('Usuario no encontrado:', usuarioId);
                alert('Usuario no encontrado');
            }
        } catch (error) {
            console.error('Error cargando usuario:', error);
            alert('Error al cargar los datos del usuario: ' + error.message);
        }
    }

    async guardarUsuario(usuarioData) {
        try {
            console.log('Guardando usuario:', usuarioData);
            
            const usuario = {
                run: usuarioData.run,
                nombre: usuarioData.nombre,
                email: usuarioData.email,
                telefono: usuarioData.telefono,
                direccion: usuarioData.direccion,
                rol: usuarioData.rol,
                activo: usuarioData.activo,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            if (usuarioData.fecha) {
                usuario.fecha = usuarioData.fecha;
            }

            if (usuarioData.id) {
                await this.db.collection("usuario").doc(usuarioData.id).update(usuario);
                console.log('Usuario actualizado:', usuarioData.id);
            } else {
                usuario.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                
                if (usuarioData.clave) {
                    usuario.clave = usuarioData.clave;
                }
                
                const docRef = await this.db.collection("usuario").add(usuario);
                console.log('Usuario creado con ID:', docRef.id);
            }
            
            alert('Usuario guardado correctamente');
            this.cerrarModal('modalUsuario');
            this.cargarUsuarios();
        } catch (error) {
            console.error('Error guardando usuario:', error);
            alert('Error al guardar el usuario: ' + error.message);
        }
    }

    async eliminarUsuario(usuarioId) {
        if (!confirm('Estas seguro de que deseas eliminar este usuario? Esta accion no se puede deshacer.')) return;

        try {
            console.log('Eliminando usuario:', usuarioId);
            await this.db.collection("usuario").doc(usuarioId).delete();
            alert('Usuario eliminado correctamente');
            this.cargarUsuarios();
        } catch (error) {
            console.error('Error eliminando usuario:', error);
            alert('Error al eliminar el usuario: ' + error.message);
        }
    }

    async cambiarEstadoUsuario(usuarioId, estadoActual) {
        const nuevoEstado = !estadoActual;
        const accion = nuevoEstado ? 'activar' : 'desactivar';
        
        if (!confirm(`Estas seguro de que deseas ${accion} este usuario?`)) return;

        try {
            console.log('Cambiando estado del usuario:', usuarioId, 'a', nuevoEstado);
            await this.db.collection("usuario").doc(usuarioId).update({
                activo: nuevoEstado,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            alert(`Usuario ${nuevoEstado ? 'activado' : 'desactivado'} correctamente`);
            this.cargarUsuarios();
        } catch (error) {
            console.error('Error cambiando estado:', error);
            alert('Error al cambiar el estado del usuario: ' + error.message);
        }
    }

    async cambiarRolUsuario(usuarioId) {
        const nuevoRol = prompt('Ingrese el nuevo rol (admin/cliente):');
        if (!nuevoRol) return;

        const rolesPermitidos = ['admin', 'cliente'];
        if (!rolesPermitidos.includes(nuevoRol.toLowerCase())) {
            alert('Rol no valido. Use: admin o cliente');
            return;
        }

        try {
            console.log('Cambiando rol del usuario:', usuarioId, 'a', nuevoRol);
            await this.db.collection("usuario").doc(usuarioId).update({
                rol: nuevoRol.toLowerCase(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            alert('Rol actualizado correctamente');
            this.cargarUsuarios();
        } catch (error) {
            console.error('Error cambiando rol:', error);
            alert('Error al cambiar el rol: ' + error.message);
        }
    }

    // ==================== REPORTES ====================
    async generarReporte() {
        try {
            const fechaInicio = document.getElementById('fechaInicio').value;
            const fechaFin = document.getElementById('fechaFin').value;

            if (!fechaInicio || !fechaFin) {
                alert('Por favor seleccione ambas fechas');
                return;
            }

            const inicio = new Date(fechaInicio);
            const fin = new Date(fechaFin);
            fin.setHours(23, 59, 59, 999);

            const ventasSnapshot = await this.db.collection("compras")
                .where("fecha", ">=", inicio)
                .where("fecha", "<=", fin)
                .orderBy("fecha", "desc")
                .get();

            const ventas = ventasSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                fecha: doc.data().fecha?.toDate?.() || doc.data().fecha
            }));

            const productosSnapshot = await this.db.collection("producto").get();
            const productos = productosSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            this.mostrarReportes(ventas, productos);

        } catch (error) {
            console.error('Error generando reporte:', error);
            alert('Error al generar el reporte');
        }
    }

    mostrarReportes(ventas, productos) {
        const ventasDiv = document.getElementById('reporte-ventas');
        const productosDiv = document.getElementById('reporte-productos');

        if (ventasDiv) {
            const totalVentas = ventas.length;
            const ingresosTotales = ventas.reduce((sum, venta) => sum + (venta.total || 0), 0);
            
            ventasDiv.innerHTML = `
                <h5>Resumen de Ventas</h5>
                <div class="reporte-item">
                    <strong>Total ventas:</strong> ${totalVentas}
                </div>
                <div class="reporte-item">
                    <strong>Ingresos totales:</strong> $${ingresosTotales.toFixed(2)}
                </div>
                <div class="reporte-item">
                    <strong>Periodo:</strong> ${document.getElementById('fechaInicio').value} a ${document.getElementById('fechaFin').value}
                </div>
                ${totalVentas > 0 ? `
                    <div class="reporte-item">
                        <strong>Promedio por venta:</strong> $${(ingresosTotales / totalVentas).toFixed(2)}
                    </div>
                ` : ''}
            `;
        }

        if (productosDiv) {
            const productosActivos = productos.filter(p => p.activo !== false).length;
            const stockTotal = productos.reduce((sum, producto) => sum + (producto.stock || 0), 0);
            
            productosDiv.innerHTML = `
                <h5>Inventario y Productos</h5>
                <div class="reporte-item">
                    <strong>Total productos:</strong> ${productos.length}
                </div>
                <div class="reporte-item">
                    <strong>Productos activos:</strong> ${productosActivos}
                </div>
                <div class="reporte-item">
                    <strong>Stock total:</strong> ${stockTotal} unidades
                </div>
                <div class="reporte-item">
                    <strong>Productos con bajo stock:</strong> ${productos.filter(p => (p.cantidad || p.stock || 0) < 10).length}
                </div>
            `;
        }
    }

    // ==================== PERFIL ====================
    async actualizarPerfil(perfilData) {
        try {
            const usuarioStr = localStorage.getItem("usuario");
            let usuario = usuarioStr ? JSON.parse(usuarioStr) : null;

            if (!usuario || !usuario.correo) {
                alert('No se pudo obtener la informacion del usuario');
                return false;
            }

            // Find user by email to get the document ID
            const userQuery = await this.db.collection("usuario")
                                      .where("correo", "==", usuario.correo)
                                      .limit(1)
                                      .get();

            if (!userQuery.empty) {
                const userDocRef = userQuery.docs[0].ref;
                await userDocRef.update({
                    nombre: perfilData.nombre,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }

            usuario.nombre = perfilData.nombre;
            localStorage.setItem("usuario", JSON.stringify(usuario));

            const bienvenidoPrincipal = document.getElementById('bienvenidoPrincipal');
            if (bienvenidoPrincipal) {
                bienvenidoPrincipal.textContent = `Bienvenido, ${usuario.nombre}`;
            }
            
            const profileNombre = document.getElementById('profileNombre');
            if (profileNombre) {
                profileNombre.value = usuario.nombre;
            }

            return true;
        } catch (error) {
            console.error('Error actualizando perfil:', error);
            return false;
        }
    }

    cargarDatosPerfil() {
        const usuarioStr = localStorage.getItem("usuario");
        if (usuarioStr) {
            const usuario = JSON.parse(usuarioStr);
            const profileNombre = document.getElementById('profileNombre');
            const profileCorreo = document.getElementById('profileCorreo');
            const profileClave = document.getElementById('profileClave');
            const profileTelefono = document.getElementById('profileTelefono');
            
            if (profileNombre) profileNombre.value = usuario.nombre || '';
            if (profileCorreo) profileCorreo.value = usuario.correo || '';
            if (profileClave) profileClave.value = usuario.clave || '';
            if (profileTelefono) profileTelefono.value = usuario.telefono || '';
        }
    }

    // ==================== UTILIDADES ====================
    mostrarLoading(tbodyId) {
        const tbody = document.getElementById(tbodyId);
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="8" class="loading"><i class="bi bi-arrow-repeat"></i> Cargando...</td></tr>';
        }
    }

    mostrarError(tbodyId, mensaje) {
        const tbody = document.getElementById(tbodyId);
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="error-message">
                        <i class="bi bi-exclamation-triangle"></i>
                        ${mensaje}
                    </td>
                </tr>
            `;
        }
    }

    getEstadoClass(estado) {
        const estados = {
            'completado': 'completado',
            'preparando': 'en-proceso',
            'enviado': 'en-despacho',
            'recibido': 'entregado',
            'cancelado': 'error_pago'
        };
        return estados[estado] || 'preparando';
    }

    getRolClass(rol) {
        const roles = {
            'admin': 'admin',
            'cliente': 'cliente', 
            'usuario': 'usuario'
        };
        return roles[rol] || 'usuario';
    }

    formatFecha(fecha) {
        if (!fecha) return 'N/A';
        try {
            const date = fecha.toDate ? fecha.toDate() : new Date(fecha);
            return date.toLocaleDateString('es-ES');
        } catch (error) {
            return 'Fecha invalida';
        }
    }

    cerrarModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            const form = modal.querySelector('form');
            if (form) form.reset();
            if (document.getElementById('modalProductoTitulo')) {
                document.getElementById('modalProductoTitulo').textContent = 'Nuevo Producto';
            }
            if (document.getElementById('modalCategoriaTitulo')) {
                document.getElementById('modalCategoriaTitulo').textContent = 'Nueva Categoria';
            }
            if (document.getElementById('modalUsuarioTitulo')) {
                document.getElementById('modalUsuarioTitulo').textContent = 'Nuevo Usuario';
            }
            const passwordField = document.getElementById('passwordField');
            if (passwordField) {
                passwordField.style.display = 'block';
            }
        }
    }

    mostrarModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.style.display = 'block';
    }
}

// ==================== FUNCIONES GLOBALES ====================

let crudFunctions;

document.addEventListener('DOMContentLoaded', () => {
    crudFunctions = new CRUDFunctions();

    setTimeout(() => {
        if (document.getElementById('usuarios-tbody')) {
            console.log('Cargando usuarios automaticamente...');
            crudFunctions.cargarUsuarios();
        }
        if (document.getElementById('categorias-tbody')) {
            console.log('Cargando categorias automaticamente...');
            crudFunctions.cargarCategorias();
        }
    }, 1000);
    
    const hoy = new Date().toISOString().split('T')[0];
    const primerDiaMes = new Date();
    primerDiaMes.setDate(1);
    const primerDiaStr = primerDiaMes.toISOString().split('T')[0];
    
    const fechaInicio = document.getElementById('fechaInicio');
    const fechaFin = document.getElementById('fechaFin');
    
    if (fechaInicio) fechaInicio.value = primerDiaStr;
    if (fechaFin) fechaFin.value = hoy;
});

// Órdenes
function cargarOrdenes() {
    if (crudFunctions) crudFunctions.cargarOrdenes();
}

function cambiarEstadoOrden(ordenId) {
    if (crudFunctions) crudFunctions.cambiarEstadoOrden(ordenId);
}

function verDetalleOrden(ordenId) {
    alert(`Detalle de orden: ${ordenId}\n\nEsta funcion mostrara los detalles completos de la orden.`);
}

function filtrarOrdenes() {
    const filtro = document.getElementById('filtroEstado').value;
    const filas = document.querySelectorAll('#ordenes-tbody tr');
    
    filas.forEach(fila => {
        if (fila.classList.contains('no-data') || fila.classList.contains('loading') || fila.classList.contains('error-message')) {
            return;
        }
        
        const estado = fila.querySelector('.badge').textContent.toLowerCase();
        if (!filtro || estado === filtro) {
            fila.style.display = '';
        } else {
            fila.style.display = 'none';
        }
    });
}

// Productos
function cargarProductos() {
    if (crudFunctions) crudFunctions.cargarProductos();
}

function mostrarModalProducto(productoId = null) {
    if (crudFunctions) {
        if (productoId) {
            crudFunctions.cargarDatosProducto(productoId);
        } else {
            document.getElementById('modalProductoTitulo').textContent = 'Nuevo Producto';
            document.getElementById('productoId').value = '';
        }
        crudFunctions.mostrarModal('modalProducto');
    }
}

function guardarProducto(event) {
    event.preventDefault();
    
    const productoData = {
        id: document.getElementById('productoId').value,
        nombre: document.getElementById('productoNombre').value,
        precio: document.getElementById('productoPrecio').value,
        stock: document.getElementById('productoStock').value,
        categoria: document.getElementById('productoCategoria').value,
        imagen: document.getElementById('productoImagen').value
    };

    if (crudFunctions) {
        crudFunctions.guardarProducto(productoData);
    }
}

function eliminarProducto(productoId) {
    if (crudFunctions) crudFunctions.eliminarProducto(productoId);
}

function editarProducto(productoId) {
    mostrarModalProducto(productoId);
}

// Categorías
function crearCategoria() {
    if (crudFunctions) {
        crudFunctions.crearCategoria();
    }
}

function cargarCategorias() {
    if (crudFunctions) {
        crudFunctions.cargarCategorias();
    }
}

function verProductosCategoria(nombreCategoria) {
    if (crudFunctions) {
        crudFunctions.verProductosCategoria(nombreCategoria);
    }
}

function editarCategoriaGlobal(nombreCategoria) {
    if (crudFunctions) {
        crudFunctions.editarCategoriaGlobal(nombreCategoria);
    }
}

// Usuarios
function cargarUsuarios() {
    if (crudFunctions) crudFunctions.cargarUsuarios();
}

function mostrarModalUsuario(usuarioId = null) {
    if (crudFunctions) {
        if (usuarioId) {
            crudFunctions.cargarDatosUsuario(usuarioId);
        } else {
            document.getElementById('modalUsuarioTitulo').textContent = 'Nuevo Usuario';
            document.getElementById('usuarioId').value = '';
            document.getElementById('passwordField').style.display = 'block';
        }
        crudFunctions.mostrarModal('modalUsuario');
    }
}

function guardarUsuario(event) {
    event.preventDefault();
    
    const usuarioData = {
        id: document.getElementById('usuarioId').value,
        run: document.getElementById('usuarioRun').value,
        nombre: document.getElementById('usuarioNombre').value,
        email: document.getElementById('usuarioEmail').value,
        clave: document.getElementById('usuarioClave').value,
        fecha: document.getElementById('usuarioFecha').value,
        telefono: document.getElementById('usuarioTelefono').value,
        direccion: document.getElementById('usuarioDireccion').value,
        rol: document.getElementById('usuarioRol').value,
        activo: document.getElementById('usuarioActivo').checked
    };

    if (!usuarioData.id) {
        usuarioData.clave = document.getElementById('usuarioClave').value;
    }

    if (crudFunctions) {
        crudFunctions.guardarUsuario(usuarioData);
    }
}

function eliminarUsuario(usuarioId) {
    if (crudFunctions) crudFunctions.eliminarUsuario(usuarioId);
}

function editarUsuario(usuarioId) {
    mostrarModalUsuario(usuarioId);
}

function cambiarEstadoUsuario(usuarioId, estadoActual) {
    if (crudFunctions) crudFunctions.cambiarEstadoUsuario(usuarioId, estadoActual);
}

function cambiarRolUsuario(usuarioId) {
    if (crudFunctions) crudFunctions.cambiarRolUsuario(usuarioId);
}

// Reportes
function generarReporte() {
    if (crudFunctions) crudFunctions.generarReporte();
}

// Perfil
function actualizarPerfil(event) {
    event.preventDefault();
    
    const perfilData = {
        nombre: document.getElementById('profileNombre').value
    };

    if (crudFunctions) {
        crudFunctions.actualizarPerfil(perfilData).then(success => {
            if (success) {
                alert('Perfil actualizado correctamente');
            } else {
                alert('Error al actualizar el perfil');
            }
        });
    }
}

// Utilidades
function cerrarModal(modalId) {
    if (crudFunctions) crudFunctions.cerrarModal(modalId);
}

window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// ==================== SISTEMA DE NAVEGACIÓN ====================

function navegarA(seccion) {
    console.log('Navegando a:', seccion);
    
    const secciones = ['dashboard', 'ordenes', 'productos', 'categorias', 'usuarios', 'reportes', 'perfil'];
    secciones.forEach(sec => {
        const elemento = document.getElementById(sec);
        if (elemento) elemento.style.display = 'none';
    });

    const seccionActiva = document.getElementById(seccion);
    if (seccionActiva) {
        seccionActiva.style.display = 'block';
        
        setTimeout(() => {
            if (!window.crudFunctions) return;
            
            switch(seccion) {
                case 'dashboard':
                    console.log('Cargando resumenes del dashboard...');
                    window.crudFunctions.cargarResumenes();
                    break;
                case 'usuarios':
                    console.log('Cargando usuarios automaticamente...');
                    window.crudFunctions.cargarUsuarios();
                    break;
                case 'categorias':
                    console.log('Cargando categorias automaticamente...');
                    window.crudFunctions.cargarCategorias();
                    break;
                case 'productos':
                    console.log('Cargando productos automaticamente...');
                    window.crudFunctions.cargarProductos();
                    break;
                case 'ordenes':
                    console.log('Cargando ordenes automaticamente...');
                    window.crudFunctions.cargarOrdenes();
                    break;
            }
        }, 500);
    }

    document.querySelectorAll('.menu-link').forEach(link => {
        link.classList.remove('active');
    });
    
    const menuActivo = document.querySelector(`[href="#${seccion}"]`);
    if (menuActivo) {
        menuActivo.classList.add('active');
    }
}

function inicializarNavegacion() {
    console.log('Inicializando Navegacion...');
    
    document.querySelectorAll('.menu-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('href').replace('#', '');
            navegarA(target);
        });
    });
    
    setTimeout(() => {
        navegarA('dashboard');
    }, 1000);
}

window.navegarA = navegarA;

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(inicializarNavegacion, 500);
});