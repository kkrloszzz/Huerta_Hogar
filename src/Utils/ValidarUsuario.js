export function validarRUN(run) {
    // Eliminar puntos y guiones, convertir a mayúscula
    run = run.replace(/\./g, '').replace(/-/g, '').toUpperCase();
    
    // Validar longitud
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
    
    // Algoritmo de validación del dígito verificador
    let suma = 0;
    let multiplicador = 2;
    
    for (let i = runNumero.length - 1; i >= 0; i--) {
        suma += parseInt(runNumero[i]) * multiplicador;
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
    
    const tieneRun = dominiosPermitidos.some(dominio => email.endsWith(dominio));
    if (!tieneRun) {
        return { 
            valido: false, 
            mensaje: 'Solo se permiten correos de @duocuc.cl, @profesor.duocuc.cl y @gmail.com' 
        };
    }
    
    return { valido: true, mensaje: '' };
}
export function validarTelefono(telefono){
    if(telefono >0 && telefono<10){
        return telefono;
    }else{
        return console.log("Error, el Numero telefonico debe estar entre 0 y 10 digitos, y deben ser numeros...")
    }
}