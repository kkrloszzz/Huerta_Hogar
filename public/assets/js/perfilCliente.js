document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. CONFIGURACIÓN DE FIREBASE ---
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

    const db = firebase.firestore();

    // --- 2. VERIFICACIÓN DE SESIÓN (AUTH GUARD) ---
    const usuarioStorage = localStorage.getItem("usuario");
    
    if (!usuarioStorage) {
        alert("Debes iniciar sesión para ver tu perfil.");
        window.location.href = "InicioSesionempresa.html";
        return;
    }

    const usuario = JSON.parse(usuarioStorage);

    if (usuario.rol !== "cliente" || !usuario.uid) { // <-- AÑADIDO: Chequeo de UID
        alert("Acceso no autorizado o sesión inválida.");
        localStorage.removeItem("usuario");
        window.location.href = "InicioSesionempresa.html";
        return;
    }

    // --- 3. ACTUALIZAR INTERFAZ CON DATOS DEL USUARIO ---
    const nombreClienteEl = document.querySelector(".sidebar-sticky h5 strong");
    if (nombreClienteEl) {
        nombreClienteEl.textContent = usuario.nombre || "Cliente";
    }

    // --- 4. FUNCIONALIDAD DE CERRAR SESIÓN ---
    const logoutLinks = document.querySelectorAll('a[href="logout.html"]');
    
    logoutLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem("usuario");
            // Opcional: firebase.auth().signOut();
            alert("Has cerrado sesión. ¡Vuelve pronto!");
            window.location.href = "InicioSesionempresa.html";
        });
    });

    // --- 5. CARGA DE DATOS DINÁMICOS (HISTORIALES) ---
    const comprasTbody = document.querySelector("#compras + .table-responsive tbody");
    const contactosListGroup = document.querySelector("#contactos + .list-group");

    /**
     * Carga el historial de compras del usuario desde Firestore
     */
    async function cargarHistorialCompras(correoUsuario) {
        if (!comprasTbody) return;
        comprasTbody.innerHTML = '<tr><td colspan="4">Cargando historial...</td></tr>';

        try {
            // ✅ CORRECCIÓN: Usar "cliente.correo" para la consulta
            const query = await db.collection("compras")
                                .where("cliente.correo", "==", correoUsuario)
                                .get();
            
            if (query.empty) {
                comprasTbody.innerHTML = '<tr><td colspan="4">Aún no tienes compras registradas.</td></tr>';
                return;
            }
            
            const docsOrdenados = query.docs.sort((a, b) => {
                const fechaA = a.data().fecha?.toDate() || 0;
                const fechaB = b.data().fecha?.toDate() || 0;
                return fechaB - fechaA;
            });

            let html = "";
            docsOrdenados.forEach(doc => {
                const compra = doc.data();
                const fecha = compra.fecha?.toDate ? compra.fecha.toDate().toLocaleDateString('es-CL') : 'N/A';
                const total = typeof compra.total === 'number' ? compra.total.toLocaleString('es-CL') : 'N/A';
                const estadoClass = compra.estado === 'completada' ? 'bg-success' : 'bg-warning';
                
                html += `
                    <tr>
                        <td>${doc.id}</td>
                        <td>${fecha}</td>
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
     */
    async function cargarHistorialContactos(correoUsuario) {
        if (!contactosListGroup) return;
        contactosListGroup.innerHTML = '<li class="list-group-item">Cargando mensajes...</li>';

        try {
            // ✅ CORRECCIÓN: Colección "contacto" (singular) y campo "correo"
            const query = await db.collection("contacto")
                                .where("correo", "==", correoUsuario)
                                .get();
            
            if (query.empty) {
                contactosListGroup.innerHTML = '<li class="list-group-item">No tienes mensajes de contacto enviados.</li>';
                return;
            }

            const docsOrdenados = query.docs.sort((a, b) => {
                const fechaA = a.data().fechaEnvio?.toDate() || 0;
                const fechaB = b.data().fechaEnvio?.toDate() || 0;
                return fechaB - fechaA;
            });

            let html = "";
            docsOrdenados.forEach(doc => {
                const msg = doc.data();
                // ✅ CORRECCIÓN: Usar "fechaEnvio"
                const fecha = msg.fechaEnvio?.toDate ? msg.fechaEnvio.toDate().toLocaleDateString('es-CL') : 'N/A';
                const estado = msg.estado === 'Resuelto' 
                    ? '<span class="text-success">Resuelto</span>' 
                    : '<span class="text-warning">Pendiente</span>';

                html += `
                    <a href="#" class="list-group-item list-group-item-action">
                        <div class="d-flex w-100 justify-content-between">
                            {/* ✅ CORRECCIÓN: Usar "contenido" como texto principal */}
                            <h5 class="mb-1">Consulta</h5>
                            <small>${fecha}</small>
                        </div>
                        <p class="mb-1">${msg.contenido || ''}</p>
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
    cargarHistorialCompras(usuario.correo);
    cargarHistorialContactos(usuario.correo);

    // --- 7. FUNCIONALIDAD PARA ACTUALIZAR PERFIL ---
    const updateProfileForm = document.querySelector("#update-profile-form");
    const nombreUsuarioInput = document.querySelector("#nombreUsuario");
    const updateMessageEl = document.querySelector("#update-message");

    if (updateProfileForm) {
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
                // ✅ CORRECCIÓN: Actualizar usando el UID del usuario
                const userDocRef = db.collection("usuario").doc(usuario.uid);

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