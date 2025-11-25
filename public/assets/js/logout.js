// ==================== SISTEMA DE CIERRE DE SESIÓN ====================

function cerrarSesion() {
    // Confirmar antes de cerrar sesión
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        try {
            // Limpiar localStorage
            localStorage.removeItem('usuario');
            localStorage.removeItem('sesionActiva');
            
            // Limpiar sessionStorage si se está usando
            sessionStorage.clear();
            
            // Mostrar mensaje de confirmación
            alert('Sesión cerrada correctamente');
            
            // Redirigir a la página de inicio de sesión
            // Ajusta la ruta según tu estructura de carpetas
            window.location.href = '../../index.html';
            
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            alert('Hubo un problema al cerrar la sesión. Por favor, intenta nuevamente.');
        }
    }
}

// Verificar si hay una sesión activa al cargar la página
function verificarSesion() {
    const usuario = localStorage.getItem('usuario');
    
    if (!usuario) {
        // Si no hay usuario, redirigir al login
        alert('Por favor, inicia sesión para acceder al panel de administración');
        window.location.href = '../../index.html';
        return false;
    }
    
    try {
        const usuarioData = JSON.parse(usuario);
        
        // Verificar que sea un administrador
        if (usuarioData.rol !== 'admin') {
            alert('Acceso denegado. Solo los administradores pueden acceder a esta sección.');
            localStorage.removeItem('usuario');
            window.location.href = '../../index.html';
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Error al verificar sesión:', error);
        localStorage.removeItem('usuario');
        window.location.href = '../../index.html';
        return false;
    }
}

// Ejecutar verificación al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    verificarSesion();
});

// Hacer la función global
window.cerrarSesion = cerrarSesion;