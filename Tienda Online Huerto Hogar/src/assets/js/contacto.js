document.addEventListener('DOMContentLoaded', () => {
    // Seleccionar el formulario por su ID. Asegúrate de que tu <form> tenga id="contact-form".
    const contactForm = document.getElementById('contact-form');

    // Si el formulario no existe en la página, detenemos el script para evitar errores.
    if (!contactForm) {
        console.error('Error: No se encontró el formulario con el id "contact-form".');
        return;
    }

    contactForm.addEventListener('submit', (event) => {
        // Prevenimos el envío para realizar la validación con JavaScript.
        event.preventDefault();

        // Limpiamos errores previos antes de una nueva validación.
        clearErrors();

        // Obtenemos las referencias a los campos del formulario.
        const nombreInput = document.getElementById('nombre');
        const correoInput = document.getElementById('correo');
        const comentarioInput = document.getElementById('comentario');

        // Extraemos los valores y quitamos espacios en blanco al inicio y al final.
        const nombre = nombreInput.value.trim();
        const correo = correoInput.value.trim();
        const comentario = comentarioInput.value.trim();
        
        let isValid = true;

        // --- 1. Validación del Nombre ---
        if (nombre === '') {
            showError('nombre-error', 'El nombre es requerido.');
            isValid = false;
        } else if (nombre.length > 100) {
            showError('nombre-error', 'El nombre no debe exceder los 100 caracteres.');
            isValid = false;
        }

        // --- 2. Validación del Correo (CORREGIDA Y VERIFICADA) ---
        if (correo !== '') { // Solo validamos si el usuario ha escrito algo.
            if (correo.length > 100) {
                showError('correo-error', 'El correo no debe exceder los 100 caracteres.');
                isValid = false;
            } else {
                const emailRegex = /^[^@\s]+@(?:duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/i;

                // Probamos si el correo ingresado cumple con la regla.
                if (!emailRegex.test(correo)) {
                    showError('correo-error', 'Correo inválido. Solo se permiten dominios @duoc.cl, @profesor.duoc.cl o @gmail.com.');
                    isValid = false;
                }
            }
        }
        
        // --- 3. Validación del Comentario ---
        if (comentario === '') {
            showError('comentario-error', 'El comentario es requerido.');
            isValid = false;
        } else if (comentario.length > 500) {
            showError('comentario-error', 'El comentario no debe exceder los 500 caracteres.');
            isValid = false;
        }

        // --- 4. Resultado de la Validación ---
        if (isValid) {
            alert('¡Formulario validado y enviado con éxito!');
            // Si todo está correcto, se limpia el formulario.
            // En una aplicación real, aquí llamarías a la función para enviar los datos al servidor.
            contactForm.reset();
        }
    });

    function showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
        }
    }

    function clearErrors() {
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(element => element.textContent = '');
    }
});