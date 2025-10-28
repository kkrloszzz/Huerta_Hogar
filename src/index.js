import { addUser } from "./services/firestoreService";
import { validarEdad, validarEmail, validarRUN } from "./Utils/ValidarUsuario";

function esPaginaEstatica() {
  return window.location.pathname.includes('.html') || window.location.pathname.includes('/assets/');
}

// Esperar a que el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  
  const form = document.getElementById("FormUsuario");
  const runInput = document.getElementById("run");
  const nombreInput = document.getElementById("nombre");
  const correoInput = document.getElementById("correo");
  const claveInput = document.getElementById("clave");
  const fechaInput = document.getElementById("fecha");
  const mensajeInput = document.getElementById("mensaje");

  // Validar si el formulario existe
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    mensajeInput.innerText = ""; // Limpiar mensaje previo

    const run = runInput.value.trim().toUpperCase();
    const nombre = nombreInput.value.trim();
    const correo = correoInput.value.trim();
    const clave = claveInput.value;
    const fecha = fechaInput.value;

    // Validar ingreso correcto de los datos
    if (!validarRUN(run)) return mensajeInput.innerText = "RUN incorrecto...";
    if (!nombre) return mensajeInput.innerText = "Nombre inválido...";
    if (!validarEmail(correo)) return mensajeInput.innerText = "Correo incorrecto...";
    if (!validarEdad(fecha)) return mensajeInput.innerText = "Edad inválida...";

    try {
      await addUser({ run, nombre, correo, clave, fecha });
      mensajeInput.innerText = "Formulario enviado correctamente";

      setTimeout(() => {
        window.location.href = 
          correo.toLowerCase()==="admin@duoc.cl" ?
            `assets/page/InterAdmin.html?nombre=${encodeURIComponent(nombre)}`
          : `assets/page/PerfilUsuario.html?nombre=${encodeURIComponent(nombre)}`
          
      }, 1000);
    } catch (error) {
      console.error("Error al guardar usuario:", error);
      mensajeInput.innerText = "Error al guardar usuario en firebase.";
    }
  });
});