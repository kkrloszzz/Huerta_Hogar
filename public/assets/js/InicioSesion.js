document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('form');

    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const emailInput = document.getElementById('correo');
            const passwordInput = document.getElementById('contrasena');

            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();

            // Correo requerido
            if (email === '') {
                alert('Por favor, ingrese su correo electrónico.');
                emailInput.focus();
                return;
            }

            // Máximo 100 caracteres
            if (email.length > 100) {
                alert('El correo no debe superar los 100 caracteres.');
                emailInput.focus();
                return;
            }

            // Solo dominios permitidos
            const allowedDomains = ['@duoc.cl', '@profesor.duoc.cl', '@gmail.com'];
            const domainValid = allowedDomains.some(domain => email.endsWith(domain));
            if (!domainValid) {
                alert('Solo se permiten correos @duoc.cl, @profesor.duoc.cl y @gmail.com.');
                emailInput.focus();
                return;
            }

            // Expresión regular para validar el formato del correo electrónico
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Por favor, ingrese un correo electrónico válido.');
                emailInput.focus();
                return;
            }

            // Contraseña requerida
            if (password === '') {
                alert('Por favor, ingrese su contraseña.');
                passwordInput.focus();
                return;
            }

            // Contraseña entre 4 y 10 caracteres
            if (password.length < 4 || password.length > 10) {
                alert('La contraseña debe tener entre 4 y 10 caracteres.');
                passwordInput.focus();
                return;
            }

            // --- INICIO DE LA LÓGICA MODIFICADA ---
            // Si todas las validaciones pasan:
            alert('Inicio de sesión exitoso.');

            if (email === 'admin@duoc.cl') {
                // --- Lógica para el Admin ---
                const adminData = {
                    nombre: "Administrador", // Un nombre fijo para el perfil de admin
                    correo: email,
                    rol: "admin" // Rol de admin
                };
                
                // Guardamos sus datos antes de redirigir
                localStorage.setItem("usuario", JSON.stringify(adminData));
                
                // Redirigimos a la página de admin
                window.location.href = '../page/InterAdmin.html';

            } else {
                // --- Lógica para el Cliente ---

                // 1. Extraemos el nombre del correo (ej: 'ana.gomez')
                const nombreUsuario = email.split('@')[0]; 

                // 2. Creamos el objeto de usuario que espera tu script de perfil
                const datosUsuario = {
                    nombre: nombreUsuario, // Usamos el nombre extraído
                    correo: email,
                    rol: "cliente" // Rol de cliente
                };

                // 3. ¡Guardamos el objeto en localStorage! (Esta es la parte clave)
                localStorage.setItem("usuario", JSON.stringify(datosUsuario));

                // 4. Ahora sí, redirigimos al perfil
                window.location.href = '../page/perfilCliente.html';
            }
            // --- FIN DE LA LÓGICA MODIFICADA ---

        });
    }
});