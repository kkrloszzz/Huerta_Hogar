import React, { useEffect, useState } from 'react';
import { CrudService } from '../../services/crudService';
import { DashboardService } from '../../services/dashboardService';

const DashboardAPI = () => {
  const [estaMontado, setEstaMontado] = useState(false);

  useEffect(() => {
    console.log('DashboardAPI MONTADO en PerfilAdmin - Inicializando...');

    const inicializarAPIs = () => {
      try {
        console.log('Inicializando APIs de React para HTML...');

        // Exponer servicios directamente
        window.DashboardService = DashboardService;
        window.CrudService = CrudService;

        // Crear crudManager con todas las funciones necesarias
        window.crudManager = {
          // Órdenes
          getOrdenes: () => CrudService.getOrdenes(),
          getOrdenById: (id) => CrudService.getOrdenById(id),
          updateOrdenEstado: (id, estado) => CrudService.updateOrdenEstado(id, estado),
          
          // Productos
          getProductos: () => CrudService.getProductos(),
          getProductoById: (id) => CrudService.getProductoById(id),
          createProducto: (producto) => CrudService.createProducto(producto),
          updateProducto: (id, datos) => CrudService.updateProducto(id, datos),
          deleteProducto: (id) => CrudService.deleteProducto(id),
          
          // Categorías
          getCategorias: () => CrudService.getCategorias(),
          createCategoria: (categoria) => CrudService.createCategoria(categoria),
          updateCategoria: (id, datos) => CrudService.updateCategoria(id, datos),
          deleteCategoria: (id) => CrudService.deleteCategoria(id),
          
          // Usuarios
          getUsuarios: () => CrudService.getUsuarios(),
          getUsuarioById: (id) => CrudService.getUsuarioById(id),
          updateUsuario: (id, datos) => CrudService.updateUsuario(id, datos),
          
          // Reportes
          getReporteVentas: (fechaInicio, fechaFin) => CrudService.getReporteVentas(fechaInicio, fechaFin),
          getProductosMasVendidos: () => CrudService.getProductosMasVendidos()
        };

        // Función para obtener estadísticas del dashboard
        window.obtenerEstadisticasDashboard = async () => {
          console.log('obtenerEstadisticasDashboard llamado desde HTML');
          try {
            const stats = await DashboardService.getEstadisticasCompletas();
            console.log('Estadísticas REALES obtenidas de Firebase:', stats);
            return stats;
          } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            return null;
          }
        };

        // Marcar como listo
        window.dashboardAPIReady = true;
        setEstaMontado(true);
        
        console.log('DashboardAPI INICIALIZADO CORRECTAMENTE');
        console.log('Funciones disponibles en window:');
        console.log('- crudManager:', typeof window.crudManager);
        console.log('- DashboardService:', typeof window.DashboardService);
        console.log('- CrudService:', typeof window.CrudService);

        // Disparar evento personalizado para notificar que está listo
        const event = new CustomEvent('dashboardAPIReady');
        window.dispatchEvent(event);

        // También llamar directamente a cualquier callback existente
        if (window.onDashboardAPIReady) {
          window.onDashboardAPIReady();
        }

      } catch (error) {
        console.error('ERROR CRÍTICO en DashboardAPI:', error);
      }
    };

    // Pequeño delay para asegurar que el DOM esté listo
    setTimeout(inicializarAPIs, 100);

    // Cleanup
    return () => {
      console.log('DashboardAPI desmontándose...');
      delete window.DashboardService;
      delete window.CrudService;
      delete window.crudManager;
      delete window.obtenerEstadisticasDashboard;
      delete window.dashboardAPIReady;
      setEstaMontado(false);
    };
  }, []);

  if (!estaMontado) {
    return <div style={{display: 'none'}}>Cargando APIs...</div>;
  }

  return null;
};

export default DashboardAPI;