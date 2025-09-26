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
            const allowedDomains = ['@duocuc.cl', '@profesor.duocuc.cl', '@gmail.com'];
            const domainValid = allowedDomains.some(domain => email.endsWith(domain));
            if (!domainValid) {
                alert('Solo se permiten correos @duocuc.cl, @profesor.duocuc.cl y @gmail.com.');
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

            alert('Inicio de sesión exitoso.');
            window.location.href = '../page/InterAdmin.html';

        });
    }
});