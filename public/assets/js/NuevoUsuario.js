import { addUser } from '../../../src/services/firestoreService.js';
// Sistema de validación para formulario de Nuevo Usuario
// Escuela de Administración y Negocios

// Validador de RUN chileno
function validarRUN(run) {
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

// Validador de correo electrónico
function validarEdad(fechaNacimiento) {
    const hoy = new Date();
    const fechaNac = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
        edad--;
    }
    return edad >= 18;
}

function validarEmail(email) {
    const dominiosPermitidos = ['@duoc.cl', '@profesor.duoc.cl', '@gmail.com'];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
        return { valido: false, mensaje: 'Formato de correo inválido' };
    }
    
    const tieneRun = dominiosPermitidos.some(dominio => email.endsWith(dominio));
    if (!tieneRun) {
        return { 
            valido: false, 
            mensaje: 'Solo se permiten correos de @duoc.cl, @profesor.duoc.cl y @gmail.com' 
        };
    }
    
    return { valido: true, mensaje: '' };
}

// Función para mostrar errores
function mostrarError(input, mensaje) {
    // Remover error anterior si existe
    const errorAnterior = input.parentNode.querySelector('.error-message');
    if (errorAnterior) {
        errorAnterior.remove();
    }
    
    if (mensaje) {
        // Crear elemento de error
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = mensaje;
        errorDiv.style.color = '#e74c3c';
        errorDiv.style.fontSize = '0.85em';
        errorDiv.style.marginTop = '5px';
        errorDiv.style.fontWeight = '500';
        
        // Agregar estilo de error al input
        input.style.borderColor = '#e74c3c';
        input.style.backgroundColor = '#ffeaea';
        
        // Insertar después del input
        input.parentNode.insertBefore(errorDiv, input.nextSibling);
    } else {
        // Remover estilo de error
        input.style.borderColor = '#27ae60';
        input.style.backgroundColor = '#eafaf1';
    }
}

// Función para limpiar errores
function limpiarError(input) {
    mostrarError(input, '');
}



// Función de inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded and parsed");
    const form = document.querySelector('.user-form');
    if (!form) {
        console.error("Form not found");
        return;
    }
    console.log("Form found");

    configurarEventos(form);
});

function configurarEventos(form) {
    
    // RUN - Validación en tiempo real
    const runInput = document.getElementById('run');
    const nombreInput = document.getElementById('nombre');
    const apellidosInput = document.getElementById('apellidos');
    const correoInput = document.getElementById('correo');
    const tipoUsuarioSelect = document.getElementById('tipoUsuario');


    runInput.addEventListener('input', function() {
        let valor = this.value.replace(/[^0-9kK]/g, '').toUpperCase();
        this.value = valor;
        
        if (valor.length >= 7) {
            if (validarRUN(valor)) {
                limpiarError(this);
                this.classList.add('valid');
                this.classList.remove('invalid');
            } else {
                mostrarError(this, 'RUN inválido');
                this.classList.add('invalid');
                this.classList.remove('valid');
            }
        } else if (valor.length > 0) {
            mostrarError(this, 'RUN debe tener entre 7 y 9 caracteres');
            this.classList.add('invalid');
            this.classList.remove('valid');
        } else {
            limpiarError(this);
            this.classList.remove('valid', 'invalid');
        }
    });
    
    // Nombre - Validación
    nombreInput.addEventListener('input', function() {
        const valor = this.value.trim();
        if (valor.length === 0) {
            mostrarError(this, 'El nombre es requerido');
            this.classList.add('invalid');
            this.classList.remove('valid');
        } else if (valor.length > 50) {
            mostrarError(this, 'El nombre no puede exceder 50 caracteres');
            this.classList.add('invalid');
            this.classList.remove('valid');
        } else {
            limpiarError(this);
            this.classList.add('valid');
            this.classList.remove('invalid');
        }
    });
    
    // Apellidos - Validación
    apellidosInput.addEventListener('input', function() {
        const valor = this.value.trim();
        if (valor.length === 0) {
            mostrarError(this, 'Los apellidos son requeridos');
            this.classList.add('invalid');
            this.classList.remove('valid');
        } else if (valor.length > 100) {
            mostrarError(this, 'Los apellidos no pueden exceder 100 caracteres');
            this.classList.add('invalid');
            this.classList.remove('valid');
        } else {
            limpiarError(this);
            this.classList.add('valid');
            this.classList.remove('invalid');
        }
    });
    
    // Correo - Validación
    correoInput.addEventListener('input', function() {
        const valor = this.value.trim();
        if (valor.length === 0) {
            mostrarError(this, 'El correo es requerido');
            this.classList.add('invalid');
            this.classList.remove('valid');
        } else if (valor.length > 100) {
            mostrarError(this, 'El correo no puede exceder 100 caracteres');
            this.classList.add('invalid');
            this.classList.remove('valid');
        } else {
            const validacion = validarEmail(valor);
            if (validacion.valido) {
                limpiarError(this);
                this.classList.add('valid');
                this.classList.remove('invalid');
            } else {
                mostrarError(this, validacion.mensaje);
                this.classList.add('invalid');
                this.classList.remove('valid');
            }
        }
    });
    
    // Tipo de Usuario - Validación
    tipoUsuarioSelect.addEventListener('change', function() {
        if (this.value === '') {
            mostrarError(this, 'Debe seleccionar un tipo de usuario');
            this.classList.add('invalid');
            this.classList.remove('valid');
        } else {
            limpiarError(this);
            this.classList.add('valid');
            this.classList.remove('invalid');
        }
    });
    
    
    // Envío del formulario
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log("Form submitted");
        
        // Validar todos los campos requeridos
        const campos = [
            { input: runInput, nombre: 'RUN' },
            { input: nombreInput, nombre: 'Nombre' },
            { input: apellidosInput, nombre: 'Apellidos' },
            { input: correoInput, nombre: 'Correo' },
            { input: tipoUsuarioSelect, nombre: 'Tipo de Usuario' },
            
        ];
        
        let formularioValido = true;
        const errores = [];
        
        campos.forEach(campo => {
            const valor = campo.input.value.trim();
            
            if (valor === '') {
                mostrarError(campo.input, `${campo.nombre} es requerido`);
                campo.input.classList.add('invalid');
                campo.input.classList.remove('valid');
                formularioValido = false;
                errores.push(campo.nombre);
            }
        });
        
        // Validaciones específicas
        if (runInput.value && !validarRUN(runInput.value)) {
            formularioValido = false;
            errores.push('RUN inválido');
        }
        
        if (correoInput.value && !validarEmail(correoInput.value).valido) {
            formularioValido = false;
            errores.push('Correo inválido');
        }
        
        if (formularioValido) {
            console.log("Form is valid");
            // Recopilar datos del formulario
            const datosUsuario = {
                run: runInput.value,
                nombre: nombreInput.value.trim(),
                apellidos: apellidosInput.value.trim(),
                correo: correoInput.value.trim(),
                fechaNacimiento: document.getElementById('fechaNacimiento').value,
                tipoUsuario: tipoUsuarioSelect.value
            };
            
            try {
                console.log("Adding user...");
                const docRef = await addUser(datosUsuario);
                console.log("User added successfully");
                alert("Cuenta creada exitosamente...");

                setTimeout(() => {
                    window.location.href = '../../index.html';
                }, 2000);

            } catch (error) {
                console.error("Error al registrar usuario: ", error);
                alert("Error al registrar usuario. Por favor, intente de nuevo.");
            }
            
        } else {
            alert('Por favor, corrija los siguientes errores:\n- ' + errores.join('\n- '));
        }
    });
}