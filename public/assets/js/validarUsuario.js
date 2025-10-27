
// Validador de RUN chileno
function validarRUN(run) {
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

// Validador de correo electrónico (AHORA USA SOLO LOS DOMINIOS: @duoc.cl, @profesor.duoc.cl y @gmail.com)
function validarEmail(email) {
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
// Función para mostrar errores
function mostrarError(input, mensaje) {
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

// Función para limpiar errores
function limpiarError(input) {
    mostrarError(input, '');
    input.classList.remove('valid', 'invalid');
    input.style.borderColor = ''; // Restablecer a estilos CSS normales
    input.style.backgroundColor = '';
}

// Función placeholder (la dejé solo para evitar un ReferenceError si alguien la llama)
function actualizarFormulario() {
    console.log("Función actualizarFormulario() ejecutada.");
}

// =======================================================
// 2. LÓGICA DE FORMULARIO: NUEVO USUARIO
// =======================================================

function configurarEventosNuevoUsuario() {
    const form = document.querySelector('.user-form');
    // Si el formulario no existe en la página, se termina aquí
    if (!form) return; 

    // Obtener referencias de inputs (IDs corregidos para calzar con NuevoUsuario.html)
    const runInput = document.getElementById('run');
    const nombreInput = document.getElementById('nombre');
    const apellidosInput = document.getElementById('apellidos');
    const correoInput = document.getElementById('correo');
    const fechaNacimientoInput = document.getElementById('fechaNacimiento'); // Corregido de 'fecha'

    // RUN - Validación en tiempo real
    if (runInput) runInput.addEventListener('input', function() {
        let valor = this.value.replace(/[^0-9kK]/g, '').toUpperCase();
        this.value = valor;
        
        if (valor.length >= 7) {
            if (validarRUN(valor)) {
                limpiarError(this);
            } else {
                mostrarError(this, 'RUN inválido');
            }
        } else if (valor.length > 0) {
            mostrarError(this, 'RUN debe tener entre 7 y 9 caracteres');
        } else {
            limpiarError(this);
        }
    });
    
    // Nombre - Validación
    if (nombreInput) nombreInput.addEventListener('input', function() {
        const valor = this.value.trim();
        if (valor.length === 0) {
            mostrarError(this, 'El nombre es requerido');
        } else if (valor.length > 50) {
            mostrarError(this, 'El nombre no puede exceder 50 caracteres');
        } else {
            limpiarError(this);
        }
    });
    
    // Apellidos - Validación
    if (apellidosInput) apellidosInput.addEventListener('input', function() {
        const valor = this.value.trim();
        if (valor.length === 0) {
            mostrarError(this, 'Los apellidos son requeridos');
        } else if (valor.length > 100) {
            mostrarError(this, 'Los apellidos no pueden exceder 100 caracteres');
        } else {
            limpiarError(this);
        }
    });
    
    // Correo - Validación (Con la lógica de dominio implementada)
    if (correoInput) correoInput.addEventListener('input', function() {
        const valor = this.value.trim();
        if (valor.length === 0) {
            mostrarError(this, 'El correo es requerido');
        } else if (valor.length > 100) {
            mostrarError(this, 'El correo no puede exceder 100 caracteres');
        } else {
            const validacion = validarEmail(valor);
            if (validacion.valido) {
                limpiarError(this);
            } else {
                // Muestra el mensaje de error de dominio o formato
                mostrarError(this, validacion.mensaje); 
            }
        }
    });
    
    // Envío del formulario
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Se asegura que los inputs estén definidos antes de usarlos
        if (!runInput || !nombreInput || !apellidosInput || !correoInput || !fechaNacimientoInput) {
            console.error('Faltan elementos en el formulario de Nuevo Usuario. Revisa los IDs.');
            return;
        }

        const campos = [
            { input: runInput, nombre: 'RUN' },
            { input: nombreInput, nombre: 'Nombre' },
            { input: apellidosInput, nombre: 'Apellidos' },
            { input: correoInput, nombre: 'Correo' },
            { input: fechaNacimientoInput, nombre: 'Fecha de Nacimiento' },
        ];
        
        let formularioValido = true;
        const errores = [];
        
        campos.forEach(campo => {
            const valor = campo.input.value.trim();
            
            // Forzar validación de campo requerido
            if (valor === '') {
                mostrarError(campo.input, `${campo.nombre} es requerido`);
                formularioValido = false;
                errores.push(campo.nombre);
            } else {
                limpiarError(campo.input); 
            }
        });
        
        // Re-validaciones específicas 
        if (runInput.value && !validarRUN(runInput.value)) {
            mostrarError(runInput, 'RUN inválido');
            formularioValido = false;
            errores.push('RUN inválido');
        }
        
        const validacionCorreo = validarEmail(correoInput.value);
        if (correoInput.value && !validacionCorreo.valido) {
            // Muestra el error de dominio o formato al hacer submit
            mostrarError(correoInput, validacionCorreo.mensaje); 
            formularioValido = false;
            errores.push('Correo inválido');
        }
        
        // Lógica final del formulario
        if (formularioValido) {
            // Recopilar datos del formulario
            const datosUsuario = {
                run: runInput.value,
                nombre: nombreInput.value.trim(),
                apellidos: apellidosInput.value.trim(),
                correo: correoInput.value.trim(),
                fechaNacimiento: fechaNacimientoInput.value 
            };
            
            console.log('Datos del usuario:', datosUsuario);
            
            alert('Usuario registrado exitosamente!\n\n' +
                  'Datos registrados:\n' +
                  `RUN: ${datosUsuario.run}\n` +
                  `Nombre: ${datosUsuario.nombre} ${datosUsuario.apellidos}\n` +
                  `Correo: ${datosUsuario.correo}`);
            
            // Aquí podrías enviar los datos a un servidor
            // enviarDatosServidor(datosUsuario);
            
        } else {
            alert('Por favor, corrija los errores marcados.');
        }
    });
}

// =======================================================
// 3. LÓGICA DE FORMULARIO: LOGIN (FIREBASE)
// =======================================================

function configurarLoginFirebase() {
    const form = document.getElementById("formLogin");
    
    // Si el formulario de Login NO existe, salimos
    if (!form) return; 
    
    const correoInput = document.getElementById("correoLogin");
    const claveInput = document.getElementById("claveLogin");
    const mensaje = document.getElementById("mensajeLogin");

    // Revisión de elementos clave
    if (!correoInput || !claveInput || !mensaje) {
        return console.error("Faltan elementos con ID para la lógica de Login (correoLogin, claveLogin o mensajeLogin).");
    }

    // Inicializar Firebase (Se asume que las librerías están cargadas globalmente)
    const firebaseConfig = {
        apiKey: "AIzaSyAkqjjPbCFCi3CraWB3FIPSeq2fiLHBE_w",
        authDomain: "tienda-huerta-hogar.firebaseapp.com",
        projectId: "tienda-huerta-hogar",
        storageBucket: "tienda-huerta-hogar.appsup.com",
        messagingSenderId: "29884421309",
        appId: "1:29884421309:web:eb7268e124949456d8d3d4",
        measurementId: "G-Q0GXZML5T1"
    };

    if (typeof firebase !== 'undefined' && !firebase.apps?.length) {
        firebase.initializeApp(firebaseConfig);
    } else if (typeof firebase === 'undefined') {
        console.error("Firebase no está cargado. Asegúrate de incluir las librerías de Firebase en el HTML.");
        return;
    }

    const auth = firebase.auth(); 
    const db = firebase.firestore(); 

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        mensaje.innerText = "";

        const correo = correoInput.value.trim().toLowerCase();
        const clave = claveInput.value;

        if (!correo || !clave) {
            mensaje.style.color = "red";
            mensaje.innerText = "Debes completar correo y clave";
            return;
        }

        // Admin: autenticar con Firebase Auth
        if (correo === "admin@duoc.cl") {
            try {
                await auth.signInWithEmailAndPassword(correo, clave);
                const usuario = { nombre: "Administrador", correo, rol: "admin" };
                localStorage.setItem("usuario", JSON.stringify(usuario));

                mensaje.style.color = "green";
                mensaje.innerText = "Bienvenido Administrador, redirigiendo...";
                setTimeout(() => {
                    window.location.href = `perfilAdmin.html`;
                }, 1000);
            } catch (error) {
                console.error("Error login admin:", error);
                mensaje.style.color = "red";
                mensaje.innerText = "Credenciales incorrectas para administrador";
            }
            return;
        }

        // Cliente: validar desde Firestore
        try {
            const query = await db.collection("usuario")
                .where("correo", "==", correo)
                .where("clave", "==", clave)
                .get();

            if (!query.empty) {
                const userData = query.docs[0].data();
                const nombre = userData.nombre || correo;

                const usuario = { nombre, correo, rol: "cliente" };
                localStorage.setItem("usuario", JSON.stringify(usuario));

                mensaje.style.color = "green";
                mensaje.innerText = "Bienvenido cliente, redirigiendo...";
                setTimeout(() => {
                    window.location.href = `perfilCliente.html`;
                }, 1000);
            } else {
                mensaje.style.color = "red";
                mensaje.innerText = "Correo o clave incorrectos";
            }
        } catch (error) {
            console.error("Error login cliente:", error);
            mensaje.style.color = "red";
            mensaje.innerText = "Error al verificar usuario";
        }
    });
}


// =======================================================
// 4. INICIALIZACIÓN PRINCIPAL (DOMContentLoaded)
// =======================================================

// Función que inicia el script para el formulario de Nuevo Usuario
document.addEventListener('DOMContentLoaded', function() {
    const formNuevoUsuario = document.querySelector('.user-form');
    if (formNuevoUsuario) {
        const inputs = formNuevoUsuario.querySelectorAll('input, select'); 
        actualizarFormulario(); 
        configurarEventosNuevoUsuario();
        console.log("Sistema de Nuevo Usuario inicializado.");
    }
});

// Función que inicia el script para el formulario de Login (#formLogin)
document.addEventListener("DOMContentLoaded", () => {
    const formLogin = document.getElementById("formLogin");
    if (formLogin) {
        configurarLoginFirebase(); 
        console.log("Sistema de Login inicializado.");
    }
});

// Exportar funciones para uso externo si es necesario
window.huertaHogar = {
    validarRUN,
    validarEmail,
};