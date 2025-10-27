export function validarRUN(run) {
    // Eliminar puntos y guiones, convertir a mayúscula
    run = run.replace(/\./g, '').replace(/-/g, '').toUpperCase();

    // Validar longitud (7 a 9 caracteres)
    if (run.length < 7 || run.length > 9) {
        return false;
    }
    
    // Separar número y dígito verificador
    const runNumero = run.slice(0, -1);
    const digitoVerificador = run.slice(-1);

    // Validar que el número sea numérico
    if (!/^\d+$/.test(runNumero)) {
        return false;
    }
    
    // Algoritmo de validación del dígito verificador (Módulo 11)
    let suma = 0;
    let multiplicador = 2;

    for (let i = runNumero.length - 1; i >= 0; i--) {
        suma += parseInt(runNumero[i]) * multiplicador;
        multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }
    
    const resto = suma % 11;
    const digitoCalculado = (11 - resto).toString();
    
    // El dígito verificador real es 10->K, 11->0, y 1-9 es el número.
    const digitoEsperado = digitoCalculado === '10' ? 'K' : digitoCalculado === '11' ? '0' : digitoCalculado;
    
    return digitoVerificador === digitoEsperado;
}

export function mostrarError(input, mensaje) {
    // Limpiar error anterior
    const errorAnterior = input.parentNode.querySelector('.error-message');
    if (errorAnterior) {
        errorAnterior.remove();
    }
    
    // Aplicar estilos y mensaje si hay error
    if (mensaje) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = mensaje;
        errorDiv.style.color = '#e74c3c';
        errorDiv.style.fontSize = '0.85em';
        errorDiv.style.marginTop = '5px';
        errorDiv.style.fontWeight = '500';
        
        input.style.borderColor = '#e74c3c';
        input.style.backgroundColor = '#ffeaea';
        
        input.parentNode.insertBefore(errorDiv, input.nextSibling);
    } else {
        // Remover estilo de error si no hay mensaje (limpiar)
        input.style.borderColor = '#27ae60';
        input.style.backgroundColor = '#eafaf1';
        input.classList.remove('invalid'); 
        input.classList.add('valid');
    }
}

export function validarEmail(email) {
    // 1. Regex de formato
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { valido: false, mensaje: 'Formato de correo inválido (ej: correo@dominio.cl)' };
    }
    
    // 2. Validación de dominios permitidos (código implementado por el usuario)
    const allowedDomains = ['@duoc.cl', '@profesor.duoc.cl', '@gmail.com'];
    const domainValid = allowedDomains.some(domain => email.toLowerCase().endsWith(domain));
    
    if (!domainValid) {
        return { 
            valido: false, 
            mensaje: 'Solo se permiten correos @duoc.cl, @profesor.duoc.cl y @gmail.com.' 
        };
    }
    
    return { valido: true, mensaje: '' };
}


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