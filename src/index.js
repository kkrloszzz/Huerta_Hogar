import { addUser } from "./services/firestoreService";
import {validarEmail, validarRUN} from "./Utils/ValidarUsuario";

//Esperar a que el DOm este listo
document.addEventListener("DOMContentLoaded", () => {
  const form =document.getElementById("formUsuario");
  const runInput= document.getElementById("Usuario");
  const nombreInput=document.getElementById("nombre");
  const correoInput=document.getElementById("nombre");
  const claveInput=document.getElementById("nombre");
  const fehaInput=document.getElementById("nombre");
  const mensajeInput=document.getElementById("nombre");
  //validar si hay o noconexion 
  if (!form) return console.log("No se encontro #formUsuario");
  form.addEventListener("submit", async(e) => {
    e.preventDefault();
    mensajeInput="";
    const run =runInput.value.trim().toUpperCase()
    const nombre = nombreInput.value.trim();
    const correo = correoInput.value.trim();
    const clave = claveInput.value;
    const fecha = fehaInput.value;
    //validar ingreso correcto de los datos.
    if (!validarRUN(run)) return mensajeInput.innerText="Run Incorrecto...";
    if (!nombre) return mensajeInput.innerText="Nombre invalido...";
    if (!validarEmail(correo)) return mensajeInput.innerText="Correo Incorrecto...";
    //if (!validarEdad(fecha)) return mensajeInput.innerText= "Edad invalida...";

    try {
        await addUser({run, nombre, correo, clave, fecha});
        mensajeInput.innerText="Usuario Agregado correctamente";

        setTimeout(() =>{
          window.location.href = 
          correo.toLowerCase() === "admin@duoc.cl"
          ? `assets/page/InterAdmin.html?nombre=${encodeURIComponent(nombre)}`
          : `assets/page/Index.html?nombre=${encodeURIComponent(nombre)}`;
        }, 1000);
    } catch (error) {
        console.error("Error al guardar Usuario...", error);
        mensajeInput.innerText="Error al guardar";
    }
  })
}
)