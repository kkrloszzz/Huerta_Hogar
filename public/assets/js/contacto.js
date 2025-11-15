// Espera a que todo el HTML se cargue antes de ejecutar el script.
document.addEventListener('DOMContentLoaded', () => {
    
    // Asegúrate de que las librerías de Firebase estén cargadas
    if (typeof firebase === 'undefined' || !firebase.apps.length) {
        console.error("Firebase no está inicializado. Revisa que los scripts de Firebase estén antes de este archivo en el HTML.");
        return;
    }
    
    // 🔑 OBTENER LA INSTANCIA DE FIRESTORE
    const db = firebase.firestore();

    // 1. Apuntamos al ID correcto de tu formulario de contacto.
    const form = document.getElementById('formulario-contacto');

    // Si el formulario existe en la página...
    if (form) {
        // 2. Agregamos un "escuchador" para el evento 'submit'.
        // ✅ CAMBIO CLAVE: La función ahora es 'async' para usar 'await'
        form.addEventListener('submit', async (event) => {
            
            // 3. Evitamos que la página se recargue.
            event.preventDefault(); 
            
            // 4. Obtenemos los valores de los campos.
            const nombre = document.getElementById('nombre').value.trim();
            const correo = document.getElementById('correo').value.trim();
            const contenido = document.getElementById('contenido').value.trim();

            // 5. Hacemos una validación simple.
            if (nombre === '' || correo === '' || contenido === '') {
                alert('Por favor, completa todos los campos.');
                return; // Detenemos la ejecución si algo falta.
            }

            // 6. Preparamos el objeto de datos, asegurando que las claves coincidan con Firestore
            const datosContacto = {
                // Mapeamos 'nombre' del HTML a 'nombre completo' en Firestore (tu clave)
                'nombre completo': nombre, 
                correo: correo,
                contenido: contenido,
                fechaEnvio: firebase.firestore.FieldValue.serverTimestamp() // Añadimos la fecha de envío
            };

            console.log('Intentando guardar datos:', datosContacto);

            try {
                // 7. ✅ LÓGICA CLAVE: Guardar en la colección 'contacto'
                await db.collection('contacto').add(datosContacto);

                // Éxito:
                alert('¡Gracias por tu mensaje! Ha sido guardado y te contactaremos pronto.');
                
                // 8. Limpiamos el formulario.
                form.reset();

            } catch (error) {
                // Manejo de error de la base de datos
                console.error("Error al guardar el mensaje en Firestore:", error);
                alert("Ocurrió un error al enviar tu mensaje. Por favor, intenta de nuevo.");
            }
        });
    } else {
        console.error('Error: No se encontró el formulario con el id "formulario-contacto".');
    }
});