// =======================================================
// 0. INICIALIZACIÓN DE FIREBASE (¡IMPORTANTE!)
// =======================================================
// --- CAMBIO: Se movió la configuración aquí arriba para que esté disponible para AMBAS lógicas (Registro y Login).
const firebaseConfig = {
    apiKey: "AIzaSyAkqjjPbCFCi3CraWB3FIPSeq2fiLHBE_w",
    authDomain: "tienda-huerta-hogar.firebaseapp.com",
    projectId: "tienda-huerta-hogar",
    storageBucket: "tienda-huerta-hogar.appsup.com",
    messagingSenderId: "29884421309",
    appId: "1:29884421309:web:eb7268e124949456d8d3d4",
    measurementId: "G-Q0GXZML5T1"
};

// --- CAMBIO: Inicializamos Firebase solo una vez, si no se ha hecho antes.
if (typeof firebase !== 'undefined' && !firebase.apps?.length) {
    try {
        firebase.initializeApp(firebaseConfig);
    } catch (error) {
        console.error("Error inicializando Firebase:", error);
    }
} else if (typeof firebase === 'undefined') {
    console.error("Firebase no está cargado. Asegúrate de incluir las librerías de Firebase en el HTML.");
}


// =======================================================
// 1. FUNCIONES DE VALIDACIÓN (Sin cambios)
// =======================================================

// Validador de RUN chileno
function validarRUN(run) {
    run = run.replace(/\./g, '').replace(/-/g, '').toUpperCase();
    if (run.length < 7 || run.length > 9) {
        return false;
    }
    const runNumero = run.slice(0, -1);
    const digitoVerificador = run.slice(-1);
    if (!/^\d+$/.test(runNumero)) {
        return false;
    }
    let suma = 0;
    let multiplicador = 2;
    for (let i = runNumero.length - 1; i >= 0; i--) {
        suma += parseInt(runNumero[i]) * multiplicador;
        multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }
    const resto = suma % 11;
    const digitoCalculado = (11 - resto).toString();
    const digitoEsperado = digitoCalculado === '10' ? 'K' : digitoCalculado === '11' ? '0' : digitoCalculado;
    return digitoVerificador === digitoEsperado;
}

// Validador de correo electrónico
function validarEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { valido: false, mensaje: 'Formato de correo inválido (ej: correo@dominio.cl)' };
    }
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

// Validador de edad
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
    const errorAnterior = input.parentNode.querySelector('.error-message');
    if (errorAnterior) {
        errorAnterior.remove();
    }
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
    input.style.borderColor = '';
    input.style.backgroundColor = '';
}

function actualizarFormulario() {
    console.log("Función actualizarFormulario() ejecutada.");
}

// =======================================================
// 2. LÓGICA DE FORMULARIO: NUEVO USUARIO (¡AQUÍ ESTÁ EL ARREGLO!)
// =======================================================

function configurarEventosNuevoUsuario() {
    const form = document.querySelector('.user-form');
    if (!form) return; 

    const runInput = document.getElementById('run');
    const nombreInput = document.getElementById('nombre');
    const apellidosInput = document.getElementById('apellidos');
    const correoInput = document.getElementById('correo');
    const fechaNacimientoInput = document.getElementById('fechaNacimiento');
    // --- CAMBIO: Añadidas las contraseñas ---
    const contrasenaInput = document.getElementById('contrasena');
    const confirmarContrasenaInput = document.getElementById('confirmarContrasena');

    // ... (Aquí van todos tus addEventListener de 'input' para validar en tiempo real) ...
    // ... (No los pego para ahorrar espacio, pero deben ir aquí) ...
    
    // Envío del formulario
    // --- CAMBIO: Convertida en función 'async' para usar await con Firebase ---
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // --- CAMBIO: Añadida la validación de que existan los campos de contraseña ---
        if (!runInput || !nombreInput || !apellidosInput || !correoInput || !fechaNacimientoInput || !contrasenaInput || !confirmarContrasenaInput) {
            console.error('Faltan elementos en el formulario de Nuevo Usuario. Revisa los IDs.');
            return;
        }

        const campos = [
            { input: runInput, nombre: 'RUN' },
            { input: nombreInput, nombre: 'Nombre' },
            { input: apellidosInput, nombre: 'Apellidos' },
            { input: correoInput, nombre: 'Correo' },
            { input: fechaNacimientoInput, nombre: 'Fecha de Nacimiento' },
            // --- CAMBIO: Añadida la validación de contraseñas ---
            { input: contrasenaInput, nombre: 'Contraseña' },
            { input: confirmarContrasenaInput, nombre: 'Confirmar Contraseña' },
        ];
        
        let formularioValido = true;
        const errores = [];
        
        campos.forEach(campo => {
            const valor = campo.input.value.trim();
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
            mostrarError(correoInput, validacionCorreo.mensaje); 
            formularioValido = false;
            errores.push('Correo inválido');
        }
        
        // --- CAMBIO: Nueva validación de contraseñas ---
        if (contrasenaInput.value && contrasenaInput.value.length < 6) {
            mostrarError(contrasenaInput, 'La contraseña debe tener al menos 6 caracteres');
            formularioValido = false;
        } else if (contrasenaInput.value !== confirmarContrasenaInput.value) {
            mostrarError(confirmarContrasenaInput, 'Las contraseñas no coinciden');
            formularioValido = false;
        }

        // --- CAMBIO: ESTA ES LA LÓGICA DE FIREBASE QUE FALTABA ---
        // Lógica final del formulario  
        if (formularioValido) {
            const datosUsuario = {
                run: runInput.value.trim(),
                nombre: nombreInput.value.trim(),
                apellidos: apellidosInput.value.trim(),
                correo: correoInput.value.trim().toLowerCase(), // Guardar en minúscula
                fechaNacimiento: fechaNacimientoInput.value,
                rol: "cliente" // Añadir un rol por defecto
            };
            const email = datosUsuario.correo;
            const password = contrasenaInput.value;
            
            console.log('Datos del usuario:', datosUsuario);
            console.log('Intentando registrar en Firebase...');
            
            try {
                // Obtenemos las instancias de Auth y Firestore
                const auth = firebase.auth();
                const db = firebase.firestore();

                // 1. Crear usuario en Firebase Authentication
                const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                const user = userCredential.user;
                console.log('Usuario creado en Auth:', user.uid);

                // 2. Guardar los datos ADICIONALES en Firestore
                // Usamos .doc(user.uid) para que el ID de Auth y el de Firestore coincidan
                // Usamos 'usuario' (singular) para que coincida con tu colección de Login
                await db.collection('usuario').doc(user.uid).set(datosUsuario);

                console.log('Datos del usuario guardados en Firestore');
                alert('¡Usuario registrado exitosamente!');
                form.reset(); // Limpiar el formulario
                // Opcional: Redirigir a la página de login
                // window.location.href = 'iniciar-sesion.html';

            } catch (error) {
                // Capturamos errores de Firebase
                console.error('¡ERROR DE FIREBASE!', error.code, error.message);
                if (error.code === 'auth/email-already-in-use') {
                    mostrarError(correoInput, 'Este correo ya está registrado.');
                } else if (error.code === 'auth/weak-password') {
                    mostrarError(contrasenaInput, 'La contraseña es muy débil (mínimo 6 caracteres).');
                } else {
                    alert('Error al registrar: ' + error.message);
                }
            }
            
        } else {
            alert('Por favor, corrija los errores marcados.');
        }
    });
}

// =======================================================
// 3. LÓGICA DE FORMULARIO: LOGIN (¡AQUÍ ESTÁ EL ARREGLO DE SEGURIDAD!)
// =======================================================

function configurarLoginFirebase() {
    const form = document.getElementById("formLogin");
    if (!form) return; 
    
    const correoInput = document.getElementById("correoLogin");
    const claveInput = document.getElementById("claveLogin");
    const mensaje = document.getElementById("mensajeLogin");

    if (!correoInput || !claveInput || !mensaje) {
        return console.error("Faltan elementos con ID para la lógica de Login (correoLogin, claveLogin o mensajeLogin).");
    }

    // Las variables de auth y db se obtienen de la inicialización global
    const auth = firebase.auth();
    const db = firebase.firestore(); 

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        mensaje.innerText = "";
        mensaje.style.color = "red"; // Color por defecto para errores

        const correo = correoInput.value.trim().toLowerCase();
        const clave = claveInput.value;

        if (!correo || !clave) {
            mensaje.innerText = "Debes completar correo y clave";
            return;
        }

        // --- CAMBIO: Lógica de login unificada y segura ---
        try {
            // 1. Intentar iniciar sesión con Firebase Auth
            const userCredential = await auth.signInWithEmailAndPassword(correo, clave);
            const user = userCredential.user;

            // 2. Revisar si es Admin o Cliente
            if (user.email === "admin@duoc.cl") {
                // Es Administrador
                const usuario = { nombre: "Administrador", correo, rol: "admin" };
                localStorage.setItem("usuario", JSON.stringify(usuario));

                mensaje.style.color = "green";
                mensaje.innerText = "Bienvenido Administrador, redirigiendo...";
                setTimeout(() => {
                    window.location.href = `perfilAdmin.html`;
                }, 1000);

            } else {
                // Es Cliente. Buscamos sus datos en Firestore usando su UID
                const userDoc = await db.collection('usuario').doc(user.uid).get();

                if (userDoc.exists) {
                    const userData = userDoc.data();
                    const usuario = { 
                        nombre: userData.nombre || "Cliente", 
                        correo: userData.correo, 
                        rol: "cliente" 
                    };
                    localStorage.setItem("usuario", JSON.stringify(usuario));

                    mensaje.style.color = "green";
                    mensaje.innerText = "Bienvenido, redirigiendo...";
                    setTimeout(() => {
                        window.location.href = `perfilCliente.html`;
                    }, 1000);

                } else {
                    // Esto no debería pasar si el registro es correcto
                    console.error("Error: Usuario existe en Auth pero no en Firestore DB.");
                    mensaje.innerText = "Error de datos de usuario. Contacte al soporte.";
                    auth.signOut(); // Cerrar sesión
                }
            }

        } catch (error) {
            // 3. Manejar errores de login (ej. clave incorrecta)
            console.error("Error de inicio de sesión:", error.code);
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                mensaje.innerText = "Correo o clave incorrectos";
            } else {
                mensaje.innerText = "Error al iniciar sesión. Intente más tarde.";
            }
        }
    });
}


// =======================================================
// 4. INICIALIZACIÓN PRINCIPAL (DOMContentLoaded)
// =======================================================
// --- CAMBIO: Un solo listener para 'DOMContentLoaded' que inicializa todo.
document.addEventListener('DOMContentLoaded', function() {
    
    // Intenta configurar el formulario de Nuevo Usuario
    if (document.querySelector('.user-form')) {
        configurarEventosNuevoUsuario();
        console.log("Sistema de Nuevo Usuario inicializado.");
    }
    
    // Intenta configurar el formulario de Login
    if (document.getElementById("formLogin")) {
        configurarLoginFirebase(); 
        console.log("Sistema de Login inicializado.");
    }

    // (La función 'actualizarFormulario()' no parece usarse, pero la dejé)
    if (typeof actualizarFormulario === 'function') {
        actualizarFormulario();
    }
});

// Exportar funciones para uso externo si es necesario
window.huertaHogar = {
    validarRUN,
    validarEmail,
};