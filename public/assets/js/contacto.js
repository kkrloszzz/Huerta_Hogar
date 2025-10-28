// Espera a que todo el HTML se cargue antes de ejecutar el script.
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Apuntamos al ID correcto de tu formulario de contacto.
    const form = document.getElementById('formulario-contacto');

    // Si el formulario existe en la página...
    if (form) {
        // 2. Agregamos un "escuchador" para el evento 'submit' (cuando se envía).
        form.addEventListener('submit', (event) => {
            
            // 3. Evitamos que la página se recargue (comportamiento por defecto).
            event.preventDefault(); 
            
            // 4. Obtenemos los valores de los campos que SÍ existen.
            const nombre = document.getElementById('nombre').value.trim();
            const correo = document.getElementById('correo').value.trim();
            const contenido = document.getElementById('contenido').value.trim();

            // 5. Hacemos una validación simple.
            if (nombre === '' || correo === '' || contenido === '') {
                alert('Por favor, completa todos los campos.');
                return; // Detenemos la ejecución si algo falta.
            }

            // Si todo está bien, mostramos un mensaje de éxito.
            alert('¡Gracias por tu mensaje! Nos pondremos en contacto contigo pronto.');
            
            // 6. Limpiamos el formulario para un nuevo mensaje.
            form.reset();

            // (Opcional) Aquí podrías agregar el código para enviar los datos a una base de datos.
            console.log('Datos a enviar:', { nombre, correo, contenido });
        });
    } else {
        console.error('Error: No se encontró el formulario con el id "formulario-contacto".');
    }
});