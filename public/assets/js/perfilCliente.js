

document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. CONFIGURACIÓN DE FIREBASE ---
    // (Copiada de tu script de login para mantener la conexión)
    const firebaseConfig = {
        apiKey: "AIzaSyAkqjjPbCFCi3CraWB3FIPSeq2fiLHBE_w",
        authDomain: "tienda-huerta-hogar.firebaseapp.com",
        projectId: "tienda-huerta-hogar",
        storageBucket: "tienda-huerta-hogar.appsup.com",
        messagingSenderId: "29884421309",
        appId: "1:29884421309:web:eb7268e124949456d8d3d4",
        measurementId: "G-Q0GXZML5T1"
    };

    if (!firebase.apps?.length) {
        firebase.initializeApp(firebaseConfig);
    }

    // Instancia de Firestore para consultar la base de datos
    const db = firebase.firestore();

    // --- 2. VERIFICACIÓN DE SESIÓN (AUTH GUARD) ---
    // Revisa si hay un usuario guardado en localStorage
    const usuarioStorage = localStorage.getItem("usuario");
    
    if (!usuarioStorage) {
        // Si no hay usuario, no puede estar aquí. Redirige al login.
        alert("Debes iniciar sesión para ver tu perfil.");
        window.location.href = "login.html"; // Asegúrate que esta sea tu pág. de login
        return; // Detiene la ejecución del script
    }

    // Si existe, convierte el string JSON a un objeto
    const usuario = JSON.parse(usuarioStorage);

    // Verificamos que sea un cliente
    if (usuario.rol !== "cliente") {
        // Si es admin u otro rol, lo sacamos
        alert("Acceso no autorizado para este tipo de perfil.");
        localStorage.removeItem("usuario"); // Limpiamos la sesión
        window.location.href = "login.html";
        return;
    }

    // --- 3. ACTUALIZAR INTERFAZ CON DATOS DEL USUARIO ---
    
    // Seleccionamos el <strong> dentro del <h5> para poner el nombre
    const nombreClienteEl = document.querySelector(".sidebar-sticky h5 strong");
    if (nombreClienteEl) {
        // Asignamos el nombre guardado en localStorage
        nombreClienteEl.textContent = usuario.nombre || "Cliente";
    }

    // --- 4. FUNCIONALIDAD DE CERRAR SESIÓN ---
    
    // Seleccionamos TODOS los enlaces que lleven a "logout.html"
    const logoutLinks = document.querySelectorAll('a[href="logout.html"]');
    
    logoutLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault(); // Evita que el navegador siga el enlace
            
            // Limpiar los datos de sesión
            localStorage.removeItem("usuario");
            
            // Opcional: Si usas Firebase Auth para clientes, también ciérralo
            // firebase.auth().signOut();
            
            alert("Has cerrado sesión. ¡Vuelve pronto!");
            
            // Redirigir al login
            window.location.href = "login.html";
        });
    });

    // --- 5. CARGA DE DATOS DINÁMICOS (HISTORIALES) ---
    
    const comprasTbody = document.querySelector("#compras + .table-responsive tbody");
    const contactosListGroup = document.querySelector("#contactos + .list-group");

    /**
     * Carga el historial de compras del usuario desde Firestore
     * @param {string} correoUsuario - El correo del usuario logueado
     */
    async function cargarHistorialCompras(correoUsuario) {
        if (!comprasTbody) return;
        comprasTbody.innerHTML = '<tr><td colspan="4">Cargando historial...</td></tr>';

        try {
            // Asumimos que la colección se llama "compras" y tiene un campo "correoUsuario"
            const query = await db.collection("compras")
                                .where("correoUsuario", "==", correoUsuario)
                                .get();
            
            if (query.empty) {
                comprasTbody.innerHTML = '<tr><td colspan="4">Aún no tienes compras registradas.</td></tr>';
                return;
            }
            
            // Ordenar los documentos por fecha en el lado del cliente
            const docsOrdenados = query.docs.sort((a, b) => {
                const fechaA = a.data().fecha?.toDate() || 0;
                const fechaB = b.data().fecha?.toDate() || 0;
                return fechaB - fechaA; // Descendente
            });

            let html = "";
            docsOrdenados.forEach(doc => {
                const compra = doc.data();
                // Convierte el Timestamp de Firebase a una fecha legible
                const fecha = compra.fecha.toDate ? compra.fecha.toDate().toLocaleDateString('es-CL') : 'N/A';
                const total = typeof compra.total === 'number' ? compra.total.toLocaleString('es-CL') : 'N/A';
                const estadoClass = compra.estado === 'Entregado' ? 'bg-success' : 'bg-warning';
                
                html += `
                    <tr>
                        <td>${doc.id}</td> <td>${fecha}</td>
                        <td>$${total}</td>
                        <td><span class="badge ${estadoClass}">${compra.estado || 'Pendiente'}</span></td>
                    </tr>
                `;
            });
            comprasTbody.innerHTML = html;

        } catch (error) {
            console.error("Error al cargar historial de compras:", error);
            comprasTbody.innerHTML = '<tr><td colspan="4">Error al cargar el historial. Intenta más tarde.</td></tr>';
        }
    }

    /**
     * Carga el historial de contactos del usuario desde Firestore
     * @param {string} correoUsuario - El correo del usuario logueado
     */
    async function cargarHistorialContactos(correoUsuario) {
        if (!contactosListGroup) return;
        contactosListGroup.innerHTML = '<li class="list-group-item">Cargando mensajes...</li>';

        try {
            // Asumimos que la colección se llama "contactos" y tiene "correoUsuario"
            const query = await db.collection("contactos")
                                .where("correoUsuario", "==", correoUsuario)
                                .get();
            
            if (query.empty) {
                contactosListGroup.innerHTML = '<li class="list-group-item">No tienes mensajes de contacto enviados.</li>';
                return;
            }

            // Ordenar los documentos por fecha en el lado del cliente
            const docsOrdenados = query.docs.sort((a, b) => {
                const fechaA = a.data().fecha?.toDate() || 0;
                const fechaB = b.data().fecha?.toDate() || 0;
                return fechaB - fechaA; // Descendente
            });

            let html = "";
            docsOrdenados.forEach(doc => {
                const msg = doc.data();
                const fecha = msg.fecha.toDate ? msg.fecha.toDate().toLocaleDateString('es-CL') : 'N/A';
                const estado = msg.estado === 'Resuelto' 
                    ? '<span class="text-success">Resuelto</span>' 
                    : '<span class="text-warning">Pendiente</span>';

                html += `
                    <a href="#" class="list-group-item list-group-item-action">
                        <div class="d-flex w-100 justify-content-between">
                            <h5 class="mb-1">${msg.asunto || 'Sin Asunto'}</h5>
                            <small>${fecha}</small>
                        </div>
                        <p class="mb-1">${msg.mensaje || ''}</p>
                        <small>Estado: ${estado}</small>
                    </a>
                `;
            });
            contactosListGroup.innerHTML = html;

        } catch (error) {
            console.error("Error al cargar historial de contactos:", error);
            contactosListGroup.innerHTML = '<li class="list-group-item">Error al cargar los mensajes.</li>';
        }
    }

    // --- 6. EJECUTAR LAS FUNCIONES DE CARGA ---
    // Usamos el correo del objeto 'usuario' que obtuvimos de localStorage
    cargarHistorialCompras(usuario.correo);
    cargarHistorialContactos(usuario.correo);

    // --- 7. FUNCIONALIDAD PARA ACTUALIZAR PERFIL ---
    const updateProfileForm = document.querySelector("#update-profile-form");
    const nombreUsuarioInput = document.querySelector("#nombreUsuario");
    const updateMessageEl = document.querySelector("#update-message");

    if (updateProfileForm) {
        // Rellenar el campo con el nombre actual
        nombreUsuarioInput.value = usuario.nombre || "";

        updateProfileForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const nuevoNombre = nombreUsuarioInput.value.trim();

            if (!nuevoNombre) {
                updateMessageEl.textContent = "El nombre no puede estar vacío.";
                updateMessageEl.className = "alert alert-danger";
                return;
            }

            updateMessageEl.textContent = "Actualizando...";
            updateMessageEl.className = "alert alert-info";

            try {
                // Buscar el documento del usuario por su correo
                const userQuery = await db.collection("usuario")
                                          .where("correo", "==", usuario.correo)
                                          .limit(1)
                                          .get();

                if (userQuery.empty) {
                    throw new Error("No se encontró el perfil de usuario para actualizar.");
                }

                // Obtener la referencia del documento
                const userDocRef = userQuery.docs[0].ref;

                // Actualizar solo el nombre
                await userDocRef.update({
                    nombre: nuevoNombre
                });

                // Actualizar el objeto en localStorage
                usuario.nombre = nuevoNombre;
                localStorage.setItem("usuario", JSON.stringify(usuario));

                // Actualizar la UI
                if (nombreClienteEl) {
                    nombreClienteEl.textContent = nuevoNombre;
                }

                updateMessageEl.textContent = "¡Nombre actualizado con éxito!";
                updateMessageEl.className = "alert alert-success";

            } catch (error) {
                console.error("Error al actualizar el perfil:", error);
                updateMessageEl.textContent = "Error al actualizar. Inténtalo de nuevo más tarde.";
                updateMessageEl.className = "alert alert-danger";
            }
        });
    }
});