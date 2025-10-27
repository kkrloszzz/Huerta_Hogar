// validaciones.js - Módulo de funciones de validación (para usar en React/JSX)

// Validador de RUT chileno
export function validarRUT(rut) {
    // Eliminar puntos y guiones, convertir a mayúscula
    rut = rut.replace(/\./g, '').replace(/-/g, '').toUpperCase();
    
    if (rut.length < 7 || rut.length > 9) return false;
    
    const rutNumero = rut.slice(0, -1);
    const digitoVerificador = rut.slice(-1);
    
    if (!/^\d+$/.test(rutNumero)) return false;
    
    let suma = 0;
    let multiplicador = 2;
    
    for (let i = rutNumero.length - 1; i >= 0; i--) {
        suma += parseInt(rutNumero[i]) * multiplicador;
        multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }
    
    const resto = suma % 11;
    const digitoCalculado = (11 - resto).toString();
    const digitoEsperado = digitoCalculado === '10' ? 'K' : digitoCalculado === '11' ? '0' : digitoCalculado;
    
    return digitoVerificador === digitoEsperado;
}

// Validador de edad (>= 18 años)
export function validarEdad(fechaNacimiento) {
    const hoy = new Date();
    const fechaNac = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
        edad--;
    }
    return edad >= 18;
}

// Validador de correo electrónico (Dominios permitidos)
export function validarEmail(email) {
    const dominiosPermitidos = ['@duoc.cl', '@profesor.duoc.cl', '@gmail.com'];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
        return { valido: false, mensaje: 'Formato de correo inválido (ej: correo@dominio.cl)' };
    }
    
    const tieneDominioPermitido = dominiosPermitidos.some(dominio => email.toLowerCase().endsWith(dominio));
    if (!tieneDominioPermitido) {
        return { 
            valido: false, 
            mensaje: 'Solo se permiten correos @duoc.cl, @profesor.duoc.cl y @gmail.com.' 
        };
    }
    
    return { valido: true, mensaje: '' };
}