export function validarRUT(rut) {
    // Eliminar puntos y guiones, convertir a mayúscula
    rut = rut.replace(/\./g, '').replace(/-/g, '').toUpperCase();
    
    // Validar longitud
    if (rut.length < 7 || rut.length > 9) {
        return false;
    }
    
    // Separar número y dígito verificador
    const rutNumero = rut.slice(0, -1);
    const digitoVerificador = rut.slice(-1);
    
    // Validar que el número sea numérico
    if (!/^\d+$/.test(rutNumero)) {
        return false;
    }
    
    // Algoritmo de validación del dígito verificador
    let suma = 0;
    let multiplicador = 2;
    
    for (let i = rutNumero.length - 1; i >= 0; i--) {
        suma += parseInt(rutNumero[i]) * multiplicador;
        multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }
    
    const resto = suma % 11;
    const digitoCalculado = resto < 2 ? resto.toString() : resto === 2 ? '0' : (11 - resto).toString();
    const digitoEsperado = digitoCalculado === '10' ? 'K' : digitoCalculado;
    
    return digitoVerificador === digitoEsperado;
}

export function validarEmail(email) {
    const dominiosPermitidos = ['@duocuc.cl', '@profesor.duocuc.cl', '@gmail.com'];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
        return { valido: false, mensaje: 'Formato de correo inválido' };
    }
    
    const tieneRut = dominiosPermitidos.some(dominio => email.endsWith(dominio));
    if (!tieneRut) {
        return { 
            valido: false, 
            mensaje: 'Solo se permiten correos de @duocuc.cl, @profesor.duocuc.cl y @gmail.com' 
        };
    }
    
    return { valido: true, mensaje: '' };
}