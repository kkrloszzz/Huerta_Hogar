document.addEventListener('DOMContentLoaded', function() {
    // --- 1. CONFIGURACIÓN E INICIALIZACIÓN DE FIREBASE ---
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
        try {
            firebase.initializeApp(firebaseConfig);
        } catch (error) {
            console.error("Error inicializando Firebase:", error);
            alert("Error de configuración. No se puede conectar con el sistema.");
            return;
        }
    } else if (typeof firebase === 'undefined') {
        console.error("Firebase no está cargado. Asegúrate de incluir las librerías de Firebase en el HTML.");
        alert("Error crítico: Las librerías de autenticación no se cargaron.");
        return;
    }

    // --- 2. LÓGICA DE LOGIN SEGURA CON FIREBASE ---
    const loginForm = document.querySelector('form');
    if (!loginForm) {
        console.error("No se encontró el formulario de login en la página.");
        return;
    }

    const emailInput = document.getElementById('correo');
    const passwordInput = document.getElementById('contrasena');
    
    // Intentamos encontrar un elemento para mensajes, si no, usaremos alert.
    const messageElement = document.getElementById('mensajeLogin'); 

    if (!emailInput || !passwordInput) {
        console.error("No se encontraron los campos 'correo' o 'contrasena' en el formulario.");
        return;
    }

    // Instancias de Firebase
    const auth = firebase.auth();
    const db = firebase.firestore();

    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const email = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value.trim();

        // Limpiar mensajes de error previos
        if (messageElement) messageElement.textContent = "";

        if (email === '' || password === '') {
            const errorMsg = 'Por favor, complete todos los campos.';
            if (messageElement) messageElement.textContent = errorMsg;
            else alert(errorMsg);
            return;
        }

        try {
            // 1. Autenticar al usuario con Firebase Auth
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // 2. Determinar si es Admin o Cliente
            if (user.email === 'admin@duoc.cl') {
                // --- Lógica para Admin ---
                const adminData = {
                    nombre: "Administrador",
                    correo: user.email,
                    rol: "admin"
                };
                localStorage.setItem("usuario", JSON.stringify(adminData));
                
                const successMsg = "Bienvenido Administrador, redirigiendo...";
                if (messageElement) messageElement.textContent = successMsg;
                else alert(successMsg);

                window.location.href = '../page/InterAdmin.html';

            } else {
                // --- Lógica para Cliente ---
                // Buscar datos adicionales en Firestore
                const userDoc = await db.collection('usuario').doc(user.uid).get();

                if (userDoc.exists) {
                    const userData = userDoc.data();
                    // ✅ ¡AQUÍ ESTÁ LA CLAVE! Guardamos el UID
                    const datosUsuario = {
                        uid: user.uid,
                        nombre: userData.nombre || "Cliente",
                        correo: userData.correo,
                        rol: "cliente"
                    };
                    localStorage.setItem("usuario", JSON.stringify(datosUsuario));

                    const successMsg = "Inicio de sesión exitoso, redirigiendo...";
                    if (messageElement) messageElement.textContent = successMsg;
                    else alert(successMsg);
                    
                    // Redirigir a la página de perfil del cliente
                    window.location.href = '../page/perfilCliente.html';

                } else {
                    // Este caso es raro: el usuario existe en Auth pero no en la base de datos.
                    console.error("Error de consistencia: Usuario autenticado pero sin datos en Firestore.");
                    auth.signOut(); // Cerramos la sesión por seguridad.
                    const errorMsg = "Su perfil no está completo. Por favor, contacte a soporte.";
                    if (messageElement) messageElement.textContent = errorMsg;
                    else alert(errorMsg);
                }
            }

        } catch (error) {
            // 3. Manejar errores de Firebase (contraseña incorrecta, etc.)
            console.error("Error de inicio de sesión:", error.code, error.message);
            let errorMsg = "Error al iniciar sesión. Intente más tarde.";
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                errorMsg = "Correo o contraseña incorrectos.";
            }
            
            if (messageElement) messageElement.textContent = errorMsg;
            else alert(errorMsg);
        }
    });
});
