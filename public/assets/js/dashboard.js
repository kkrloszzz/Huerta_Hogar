class DashboardManager {
    constructor() {
        this.estadisticas = null;
        this.estaCargando = false;
        this.firebaseInicializado = false;
        this.db = null;
        this.init();
    }

    async init() {
        console.log('Iniciando DashboardManager...');
        
        // Inicializar Firebase
        await this.inicializarFirebase();
        
        // Configurar navegación
        this.configurarNavegacion();
        this.inicializarNavegacion();
        
        // Cargar estadísticas
        await this.cargarEstadisticasReales();
    }

    async inicializarFirebase() {
        try {
            console.log('Inicializando Firebase...');
            
            const firebaseConfig = {
                apiKey: "AIzaSyBBT7jka7a-7v3vY19BlSajamiedLrBTN0",
                authDomain: "tiendanombretienda.firebaseapp.com",
                projectId: "tiendanombretienda",
                storageBucket: "tiendanombretienda.appspot.com",
                messagingSenderId: "408928911689",
                appId: "1:408928911689:web:d8b313c7e15fc528661a98",
                measurementId: "G-Y1DW47VEWZ"
            };

            if (typeof firebase === 'undefined') {
                console.error('Firebase no está cargado');
                return false;
            }

            if (!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
            }
            
            this.db = firebase.firestore();
            this.firebaseInicializado = true;
            
            console.log('Firebase inicializado correctamente');
            return true;
            
        } catch (error) {
            console.error('Error inicializando Firebase:', error);
            return false;
        }
    }

    configurarNavegacion() {
        const menuLinks = document.querySelectorAll('.menu-link');
        menuLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                if (link.getAttribute('href').startsWith('#')) {
                    e.preventDefault();
                    const seccion = link.getAttribute('href').substring(1);
                    this.navegarASeccion(seccion);
                }
            });
        });
    }

    inicializarNavegacion() {
        this.navegarASeccion('dashboard');
        this.actualizarBienvenida();
    }

    navegarASeccion(seccion) {
        const sections = document.querySelectorAll('main > section:not(.welcome-section)');
        sections.forEach(section => {
            section.style.display = 'none';
        });
        
        const targetSection = document.getElementById(seccion);
        if (targetSection) {
            targetSection.style.display = 'block';
        }
        
        const menuLinks = document.querySelectorAll('.menu-link');
        menuLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${seccion}`) {
                link.classList.add('active');
            }
        });

        if (seccion === 'dashboard' && this.firebaseInicializado) {
            this.cargarEstadisticasReales();
        }
    }

    // ==================== MÉTODOS DEL DASHBOARD ====================

    async cargarEstadisticasReales() {
        if (this.estaCargando || !this.firebaseInicializado) {
            console.log('No se pueden cargar estadísticas - Firebase no inicializado');
            this.usarDatosEjemplo();
            return;
        }
        
        try {
            this.estaCargando = true;
            this.mostrarEstadoCarga(true);
            
            console.log('Cargando estadísticas REALES de Firebase...');
            
            const [
                totalCompras,
                proyeccion,
                totalProductos,
                inventario,
                totalUsuarios,
                nuevosUsuarios
            ] = await Promise.all([
                this.getTotalCompras(),
                this.getProyeccionCompras(),
                this.getTotalProductos(),
                this.getInventarioTotal(),
                this.getTotalUsuarios(),
                this.getNuevosUsuariosMes()
            ]);

            this.estadisticas = {
                totalCompras,
                proyeccionCompras: proyeccion,
                totalProductos,
                inventarioTotal: inventario,
                totalUsuarios,
                nuevosUsuariosMes: nuevosUsuarios
            };

            console.log('Estadísticas REALES obtenidas:', this.estadisticas);
            this.actualizarUI();
            
        } catch (error) {
            console.error('Error cargando estadísticas reales:', error);
            this.usarDatosEjemplo();
        } finally {
            this.estaCargando = false;
            this.mostrarEstadoCarga(false);
        }
    }

    async getTotalCompras() {
        try {
            const snapshot = await this.db.collection("compras").get();
            return snapshot.size;
        } catch (error) {
            console.error("Error al obtener total de compras:", error);
            return 24;
        }
    }

    async getProyeccionCompras() {
        try {
            const ahora = new Date();
            const mesActualInicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
            const mesAnteriorInicio = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1);
            const mesAnteriorFin = new Date(ahora.getFullYear(), ahora.getMonth(), 0);

            const snapshotActual = await this.db.collection("compras")
                .where("fecha", ">=", mesActualInicio)
                .where("fecha", "<=", ahora)
                .get();
            const comprasActual = snapshotActual.size;

            const snapshotAnterior = await this.db.collection("compras")
                .where("fecha", ">=", mesAnteriorInicio)
                .where("fecha", "<=", mesAnteriorFin)
                .get();
            const comprasAnterior = snapshotAnterior.size;

            if (comprasAnterior === 0) return comprasActual > 0 ? 100 : 0;
            
            const aumento = ((comprasActual - comprasAnterior) / comprasAnterior) * 100;
            return Math.round(aumento);
        } catch (error) {
            console.error("Error al calcular proyección:", error);
            return 15;
        }
    }

    async getTotalProductos() {
        try {
            const snapshot = await this.db.collection("producto").get();
            return snapshot.size;
        } catch (error) {
            console.error("Error al obtener total de productos:", error);
            return 156;
        }
    }

    async getInventarioTotal() {
        try {
            const snapshot = await this.db.collection("producto").get();
            let totalInventario = 0;
            
            snapshot.forEach(doc => {
                const producto = doc.data();
                totalInventario += producto.cantidad || producto.stock || 0;
            });
            
            return totalInventario;
        } catch (error) {
            console.error("Error al calcular inventario:", error);
            return 1248;
        }
    }

    async getTotalUsuarios() {
        try {
            const snapshot = await this.db.collection("usuario").get();
            return snapshot.size;
        } catch (error) {
            console.error("Error al obtener total de usuarios:", error);
            return 89;
        }
    }

    async getNuevosUsuariosMes() {
        try {
            const inicioMes = new Date();
            inicioMes.setDate(1);
            inicioMes.setHours(0, 0, 0, 0);

            const snapshot = await this.db.collection("usuario")
                .where("createdAt", ">=", inicioMes)
                .get();
            
            return snapshot.size;
        } catch (error) {
            console.error("Error al obtener nuevos usuarios:", error);
            return 12;
        }
    }

    // ==================== MÉTODOS UI ====================

    usarDatosEjemplo() {
        this.estadisticas = {
            totalCompras: 24,
            proyeccionCompras: 15,
            totalProductos: 156,
            inventarioTotal: 1248,
            totalUsuarios: 89,
            nuevosUsuariosMes: 12
        };
        this.actualizarUI();
    }

    actualizarUI() {
        if (!this.estadisticas) return;

        const mapeoElementos = {
            'totalCompras': this.estadisticas.totalCompras,
            'proyeccionCompras': this.estadisticas.proyeccionCompras,
            'totalProductos': this.estadisticas.totalProductos,
            'inventarioTotal': this.estadisticas.inventarioTotal,
            'totalUsuarios': this.estadisticas.totalUsuarios,
            'nuevosUsuariosMes': this.estadisticas.nuevosUsuariosMes
        };

        Object.entries(mapeoElementos).forEach(([id, valor]) => {
            this.actualizarElemento(id, valor);
        });
    }

    actualizarElemento(id, valor) {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.textContent = valor;
        }
    }

    mostrarEstadoCarga(mostrar) {
        const cards = document.querySelectorAll('.summary-card');
        const botones = document.querySelectorAll('.nav-button');
        
        cards.forEach(card => {
            card.classList.toggle('cargando', mostrar);
        });
        
        botones.forEach(boton => {
            boton.style.opacity = mostrar ? '0.6' : '1';
        });
    }

    actualizarBienvenida() {
        const usuarioStr = localStorage.getItem("usuario");
        if (usuarioStr) {
            const usuario = JSON.parse(usuarioStr);
            const bienvenidoPrincipal = document.getElementById('bienvenidoPrincipal');
            if (bienvenidoPrincipal) {
                bienvenidoPrincipal.textContent = `Bienvenido, ${usuario.nombre}`;
            }
        }
    }
}

// Funciones globales básicas
function navegarA(seccion) {
    if (window.dashboardManager) {
        window.dashboardManager.navegarASeccion(seccion);
    }
}

function irATienda() {
    window.location.href = '../../index.html';
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    console.log('🏁 DOM Cargado - Inicializando DashboardManager...');
    window.dashboardManager = new DashboardManager();
});