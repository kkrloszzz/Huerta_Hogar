// Sistema de validación para formulario de Nuevo Usuario
// Escuela de Administración y Negocios

// Datos de regiones y comunas de Chile
const regionesComunas = {
    metropolitana: [
        "Santiago", "Las Condes", "Providencia", "Ñuñoa", "La Reina", "Vitacura", 
        "Lo Barnechea", "Macul", "San Miguel", "La Florida", "Puente Alto"
    ],
    araucania: [
        "Temuco", "Padre Las Casas", "Villarrica", "Pucón", "Angol"
        
    ],
    nuble: [
        "Chillán", "Chillán Viejo", "Bulnes", "Quillón", "San Ignacio"
    ]
};

// Validador de RUT chileno
function validarRUT(rut) {
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

// Validador de correo electrónico
function validarEmail(email) {
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

// Función para poblar comunas según región seleccionada
function actualizarComunas() {
    const regionSelect = document.getElementById('region');
    const comunaSelect = document.getElementById('comuna');
    const regionSeleccionada = regionSelect.value;
    
    // Limpiar opciones de comuna
    comunaSelect.innerHTML = '<option value="">Seleccione una comuna</option>';
    
    if (regionSeleccionada && regionesComunas[regionSeleccionada]) {
        regionesComunas[regionSeleccionada].forEach(comuna => {
            const option = document.createElement('option');
            option.value = comuna.toLowerCase().replace(/\s+/g, '-');
            option.textContent = comuna;
            comunaSelect.appendChild(option);
        });
        comunaSelect.disabled = false;
    } else {
        comunaSelect.disabled = true;
    }
}

// Función de inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.user-form');
    const inputs = form.querySelectorAll('input, select');
    
    // Actualizar los campos del formulario según los requerimientos
    actualizarFormulario();
    
    // Configurar eventos
    configurarEventos();
});

function actualizarFormulario() {
    const form = document.querySelector('.user-form');
    
    // Actualizar el HTML del formulario
    form.innerHTML = `
        <label class="required">RUT</label>
        <input type="text" id="rut" name="rut" placeholder="Ej: 19011022K" maxlength="9">
        
        <label class="required">Nombre</label>
        <input type="text" id="nombre" name="nombre" placeholder="Ingrese nombre" maxlength="50">
        
        <label class="required">Apellidos</label>
        <input type="text" id="apellidos" name="apellidos" placeholder="Ingrese apellidos" maxlength="100">
        
        <label class="required">Correo</label>
        <input type="email" id="correo" name="correo" placeholder="ejemplo@duoc.cl" maxlength="100">
        
        <label>Fecha de Nacimiento</label>
        <input type="date" id="fechaNacimiento" name="fechaNacimiento">
        
        <label class="required">Tipo de Usuario</label>
        <select id="tipoUsuario" name="tipoUsuario">
            <option value="">Seleccione tipo de usuario</option>
            <option value="administrador">Administrador</option>
            <option value="cliente">Cliente</option>
            <option value="vendedor">Vendedor</option>
        </select>
        
        <label class="required">Región</label>
        <select id="region" name="region">
            <option value="">Seleccione una región</option>
            <option value="metropolitana">Región Metropolitana</option>
            <option value="araucania">Araucanía</option>
            <option value="nuble">Ñuble</option>
        </select>
        
        <label class="required">Comuna</label>
        <select id="comuna" name="comuna" disabled>
            <option value="">Seleccione una comuna</option>
        </select>
        
        <label class="required">Dirección</label>
        <textarea id="direccion" name="direccion" placeholder="Ingrese dirección completa" maxlength="300" rows="3"></textarea>
        
        <button type="submit">Registrar Usuario</button>
    `;
    
    // Agregar estilos para campos requeridos
    const style = document.createElement('style');
    style.textContent = `
        .required::after {
            content: " *";
            color: #e74c3c;
            font-weight: bold;
        }
        .error-message {
            animation: fadeIn 0.3s ease-in;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-5px); }
            to { opacity: 1; transform: translateY(0); }
        }
        input.valid, select.valid, textarea.valid {
            border-color: #27ae60 !important;
            background-color: #eafaf1 !important;
        }
        input.invalid, select.invalid, textarea.invalid {
            border-color: #e74c3c !important;
            background-color: #ffeaea !important;
        }
    `;
    document.head.appendChild(style);
}

function configurarEventos() {
    const form = document.querySelector('.user-form');
    
    // RUT - Validación en tiempo real
    const rutInput = document.getElementById('rut');
    rutInput.addEventListener('input', function() {
        let valor = this.value.replace(/[^0-9kK]/g, '').toUpperCase();
        this.value = valor;
        
        if (valor.length >= 7) {
            if (validarRUT(valor)) {
                limpiarError(this);
                this.classList.add('valid');
                this.classList.remove('invalid');
            } else {
                mostrarError(this, 'RUT inválido');
                this.classList.add('invalid');
                this.classList.remove('valid');
            }
        } else if (valor.length > 0) {
            mostrarError(this, 'RUT debe tener entre 7 y 9 caracteres');
            this.classList.add('invalid');
            this.classList.remove('valid');
        } else {
            limpiarError(this);
            this.classList.remove('valid', 'invalid');
        }
    });
    
    // Nombre - Validación
    const nombreInput = document.getElementById('nombre');
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
    const apellidosInput = document.getElementById('apellidos');
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
    const correoInput = document.getElementById('correo');
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
    const tipoUsuarioSelect = document.getElementById('tipoUsuario');
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
    
    // Región - Validación y actualización de comunas
    const regionSelect = document.getElementById('region');
    regionSelect.addEventListener('change', function() {
        if (this.value === '') {
            mostrarError(this, 'Debe seleccionar una región');
            this.classList.add('invalid');
            this.classList.remove('valid');
        } else {
            limpiarError(this);
            this.classList.add('valid');
            this.classList.remove('invalid');
        }
        actualizarComunas();
        
        // Limpiar selección de comuna
        const comunaSelect = document.getElementById('comuna');
        comunaSelect.value = '';
        limpiarError(comunaSelect);
        comunaSelect.classList.remove('valid', 'invalid');
    });
    
    // Comuna - Validación
    const comunaSelect = document.getElementById('comuna');
    comunaSelect.addEventListener('change', function() {
        if (this.value === '') {
            mostrarError(this, 'Debe seleccionar una comuna');
            this.classList.add('invalid');
            this.classList.remove('valid');
        } else {
            limpiarError(this);
            this.classList.add('valid');
            this.classList.remove('invalid');
        }
    });
    
    // Dirección - Validación
    const direccionInput = document.getElementById('direccion');
    direccionInput.addEventListener('input', function() {
        const valor = this.value.trim();
        if (valor.length === 0) {
            mostrarError(this, 'La dirección es requerida');
            this.classList.add('invalid');
            this.classList.remove('valid');
        } else if (valor.length > 300) {
            mostrarError(this, 'La dirección no puede exceder 300 caracteres');
            this.classList.add('invalid');
            this.classList.remove('valid');
        } else {
            limpiarError(this);
            this.classList.add('valid');
            this.classList.remove('invalid');
        }
    });
    
    // Envío del formulario
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validar todos los campos requeridos
        const campos = [
            { input: rutInput, nombre: 'RUT' },
            { input: nombreInput, nombre: 'Nombre' },
            { input: apellidosInput, nombre: 'Apellidos' },
            { input: correoInput, nombre: 'Correo' },
            { input: tipoUsuarioSelect, nombre: 'Tipo de Usuario' },
            { input: regionSelect, nombre: 'Región' },
            { input: comunaSelect, nombre: 'Comuna' },
            { input: direccionInput, nombre: 'Dirección' }
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
        if (rutInput.value && !validarRUT(rutInput.value)) {
            formularioValido = false;
            errores.push('RUT inválido');
        }
        
        if (correoInput.value && !validarEmail(correoInput.value).valido) {
            formularioValido = false;
            errores.push('Correo inválido');
        }
        
        if (formularioValido) {
            // Recopilar datos del formulario
            const datosUsuario = {
                rut: rutInput.value,
                nombre: nombreInput.value.trim(),
                apellidos: apellidosInput.value.trim(),
                correo: correoInput.value.trim(),
                fechaNacimiento: document.getElementById('fechaNacimiento').value,
                tipoUsuario: tipoUsuarioSelect.value,
                region: regionSelect.options[regionSelect.selectedIndex].text,
                comuna: comunaSelect.options[comunaSelect.selectedIndex].text,
                direccion: direccionInput.value.trim()
            };
            
            console.log('Datos del usuario:', datosUsuario);
            
            // Mostrar mensaje de éxito
            alert('Usuario registrado exitosamente!\n\n' +
                  'Datos registrados:\n' +
                  `RUT: ${datosUsuario.rut}\n` +
                  `Nombre: ${datosUsuario.nombre} ${datosUsuario.apellidos}\n` +
                  `Correo: ${datosUsuario.correo}\n` +
                  `Tipo: ${datosUsuario.tipoUsuario}\n` +
                  `Ubicación: ${datosUsuario.comuna}, ${datosUsuario.region}`);
            
            // Aquí podrías enviar los datos a un servidor
            // enviarDatosServidor(datosUsuario);
            
        } else {
            alert('Por favor, corrija los siguientes errores:\n- ' + errores.join('\n- '));
        }
    });
}

// Función para enviar datos al servidor (placeholder)
function enviarDatosServidor(datos) {
    // Implementar llamada AJAX o fetch API según sea necesario
    console.log('Enviando datos al servidor:', datos);
    
    /*
    fetch('/api/usuarios', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Usuario creado:', data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
    */
}

// Funciones utilitarias adicionales
function limpiarFormulario() {
    const form = document.querySelector('.user-form');
    form.reset();
    
    // Limpiar todos los errores y estilos
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        limpiarError(input);
        input.classList.remove('valid', 'invalid');
    });
    
    // Deshabilitar select de comuna
    document.getElementById('comuna').disabled = true;
}

// Exportar funciones para uso externo si es necesario
window.huertaHogar = {
    validarRUT,
    validarEmail,
    limpiarFormulario,
    actualizarComunas
};