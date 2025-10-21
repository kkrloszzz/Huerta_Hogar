import { addUser } from "./services/firestoreService";
import { validarEmail, validarRUN } from "./Utils/ValidarUsuario";
import { validarEdad } from "./Utils/ValidarEdad"; // Asegúrate de importar esta función

// Esperar a que el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formUsuario");
  const runInput = document.getElementById("run");
  const nombreInput = document.getElementById("nombre");
  const correoInput = document.getElementById("correo");
  const claveInput = document.getElementById("clave");
  const fechaInput = document.getElementById("fecha");
  const mensajeInput = document.getElementById("mensaje");

  // Validar si el formulario existe
  if (!form) return console.log("No se encontró #formUsuario");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    mensajeInput.innerText = ""; // Limpiar mensaje previo

    const run = runInput.value.trim().toUpperCase();
    const nombre = nombreInput.value.trim();
    const correo = correoInput.value.trim();
    const clave = claveInput.value;
    const fecha = fechaInput.value;

    // Validar ingreso correcto de los datos
    if (!validarRUN(run)) return (mensajeInput.innerText = "RUN incorrecto...");
    if (!nombre) return (mensajeInput.innerText = "Nombre inválido...");
    if (!validarEmail(correo)) return (mensajeInput.innerText = "Correo incorrecto...");
    if (!validarEdad(fecha)) return (mensajeInput.innerText = "Edad inválida...");

    try {
      await addUser({ run, nombre, correo, clave, fecha });
      mensajeInput.innerText = "Usuario agregado correctamente";

      setTimeout(() => {
        window.location.href = "/success.html"; // Redirigir a una página de éxito
      }, 2000);
    } catch (error) {
      console.error("Error al agregar usuario:", error);
      mensajeInput.innerText = "Error al agregar usuario. Inténtalo nuevamente.";
    }
  });
});