document.addEventListener('DOMContentLoaded', () => {
    // Apuntamos al ID que le dimos a tu formulario: 'registro-form'
    const form = document.getElementById('registro-form');

    form.addEventListener('submit', (event) => {
        event.preventDefault(); // Evitamos que se envíe automáticamente
        if (validateForm()) {
            alert('¡Usuario registrado con éxito!');
            form.reset();
        }
    });

    function validateForm() {
        clearErrors();
        let isValid = true;

        // --- Validaciones ---
        const nombre = document.getElementById('nombre');
        const email = document.getElementById('email');
        const cEmail = document.getElementById('Ccorreo');
        const password = document.getElementById('Contraseña');
        const cPassword = document.getElementById('Ccontraseña');
        const telefono = document.getElementById('Telefono');
        const departamento = document.getElementById('departamento');
        const comuna = document.getElementById('Comuna');

        // 1. Nombre
        if (nombre.value.trim() === '') {
            showError('nombre-error', 'El nombre completo es requerido.');
            isValid = false;
        } else if (nombre.value.trim().length > 100) {
            showError('nombre-error', 'El nombre no puede tener más de 100 caracteres.');
            isValid = false;
        }

        // 2. Correo (con la validación de dominio que pediste)
        if (email.value.trim() === '') {
            showError('email-error', 'El correo es requerido.');
            isValid = false;
        } else {
            const emailRegex = /^[^@\s]+@(?:duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/i;
            if (!emailRegex.test(email.value.trim())) {
                showError('email-error', 'Solo se permiten correos @duoc.cl, @profesor.duoc.cl o @gmail.com.');
                isValid = false;
            }
        }

        // 3. Confirmar Correo
        if (cEmail.value.trim() !== email.value.trim()) {
            showError('Ccorreo-error', 'Los correos no coinciden.');
            isValid = false;
        }

        // 4. Contraseña
        if (password.value.trim() === '') {
            showError('Contraseña-error', 'La contraseña es requerida.');
            isValid = false;
        } else if (password.value.trim().length < 6) {
            showError('Contraseña-error', 'La contraseña debe tener al menos 6 caracteres.');
            isValid = false;
        }

        // 5. Confirmar Contraseña
        if (cPassword.value.trim() !== password.value.trim()) {
            showError('Ccontraseña-error', 'Las contraseñas no coinciden.');
            isValid = false;
        }

        // 6. Teléfono (opcional, pero si se escribe debe ser numérico)
        if (telefono.value.trim() !== '' && !/^\d+$/.test(telefono.value.trim())) {
            showError('Telefono-error', 'El teléfono solo debe contener números.');
            isValid = false;
        }

        // 7. Región
        if (departamento.value === '') {
            showError('departamento-error', 'Debe seleccionar una región.');
            isValid = false;
        }

        // 8. Comuna
        if (comuna.value === '') {
            showError('Comuna-error', 'Debe seleccionar una comuna.');
            isValid = false;
        }

        return isValid;
    }

    function showError(elementId, message) {
        document.getElementById(elementId).textContent = message;
    }

    function clearErrors() {
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(el => el.textContent = '');
    }
});