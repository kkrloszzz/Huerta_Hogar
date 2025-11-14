class CrudManager {
    constructor() {
        this.currentModule = null;
        this.currentData = [];
        this.init();
    }

    init() {
        console.log('CrudManager inicializado');
        this.configurarGlobales();
    }

    configurarGlobales() {
        // Configurar funciones globales
        window.cargarOrdenes = () => this.cargarModulo('ordenes');
        window.cargarProductos = () => this.cargarModulo('productos');
        window.cargarCategorias = () => this.cargarModulo('categorias');
        window.cargarUsuarios = () => this.cargarModulo('usuarios');
        window.cargarReportes = () => this.cargarModulo('reportes');
    }

    async cargarModulo(modulo) {
        console.log(`Cargando módulo: ${modulo}`);
        
        if (!window.crudManager) {
            console.error('CRUD Manager no disponible');
            this.mostrarError(modulo);
            return;
        }

        this.currentModule = modulo;
        
        try {
            await this.cargarDatos();
            this.renderizarVista();
        } catch (error) {
            console.error(`Error en ${modulo}:`, error);
            this.mostrarError(modulo);
        }
    }

    async cargarDatos() {
        switch(this.currentModule) {
            case 'ordenes':
                this.currentData = await window.crudManager.getOrdenes();
                break;
            case 'productos':
                this.currentData = await window.crudManager.getProductos();
                break;
            case 'categorias':
                this.currentData = await window.crudManager.getCategorias();
                break;
            case 'usuarios':
                this.currentData = await window.crudManager.getUsuarios();
                break;
            case 'reportes':
                const fechaInicio = new Date();
                fechaInicio.setDate(1);
                const fechaFin = new Date();
                const ventas = await window.crudManager.getReporteVentas(fechaInicio, fechaFin);
                const productosMasVendidos = await window.crudManager.getProductosMasVendidos();
                this.currentData = { ventas, productosMasVendidos };
                break;
        }
    }

    renderizarVista() {
        const containerId = `crud-container-${this.currentModule}`;
        const container = document.getElementById(containerId);
        if (!container) return;

        let html = `
            <div class="crud-header">
                <h2>${this.getModuloNombre(this.currentModule)}</h2>
                <span class="badge">${this.currentData.length || 0} registros</span>
            </div>
        `;

        if (this.currentData.length === 0 || (this.currentModule === 'reportes' && this.currentData.ventas.length === 0)) {
            html += '<div class="no-data"><p>No hay datos disponibles</p></div>';
        } else {
            html += '<div class="table-responsive"><table class="crud-table"><tbody>';
            
            if (this.currentModule === 'reportes') {
                html += this.renderizarReportes();
            } else {
                html += this.currentData.map(item => this.renderizarFila(item)).join('');
            }
            
            html += '</tbody></table></div>';
        }

        container.innerHTML = html;
    }

    renderizarFila(item) {
        // Renderizado básico según el módulo
        switch(this.currentModule) {
            case 'ordenes':
                return `
                    <tr>
                        <td>${item.id?.substring(0, 8)}...</td>
                        <td>${item.clienteNombre || 'N/A'}</td>
                        <td>$${item.total || 0}</td>
                        <td><span class="badge">${item.estado || 'Pendiente'}</span></td>
                    </tr>
                `;
            case 'productos':
                return `
                    <tr>
                        <td>${item.nombre || 'Sin nombre'}</td>
                        <td>$${item.precio || 0}</td>
                        <td>${item.cantidad || 0}</td>
                        <td>${item.categoria || 'General'}</td>
                    </tr>
                `;
            default:
                return `<tr><td>${JSON.stringify(item)}</td></tr>`;
        }
    }

    renderizarReportes() {
        const { ventas = [], productosMasVendidos = [] } = this.currentData;
        let html = '';
        
        if (ventas.length > 0) {
            html += ventas.map(venta => `
                <tr>
                    <td>${venta.id?.substring(0, 8)}...</td>
                    <td>$${venta.total || 0}</td>
                    <td>${venta.estado || 'Pendiente'}</td>
                </tr>
            `).join('');
        }
        
        return html;
    }

    mostrarError(modulo) {
        const containerId = `crud-container-${modulo}`;
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="error-message">
                <p>Error al cargar ${this.getModuloNombre(modulo)}</p>
                <p><small>Verifique la conexión con el servidor...</small></p>
            </div>
        `;
    }

    getModuloNombre(modulo) {
        const nombres = {
            'ordenes': 'Órdenes',
            'productos': 'Productos', 
            'categorias': 'Categorías',
            'usuarios': 'Usuarios',
            'reportes': 'Reportes'
        };
        return nombres[modulo] || modulo;
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM cargado - CrudManager listo');
    window.crudManagerInstance = new CrudManager();
});