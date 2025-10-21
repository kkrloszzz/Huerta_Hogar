import { useContext, useEffect } from "react";
import { UserContext } from "../../contexts/UserContext";
import { useHistory } from "react-router-dom";

// Helper para obtener usuario de localStorage
const getUsuarioFromLocalStorage = () => {
  try {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (usuario && usuario.rol) {
      return usuario;
    }
    return null;
  } catch (error) {
    console.error("Error al leer usuario de localStorage:", error);
    return null;
  }
};

// Componente que revisa si hay usuario logueado en localStorage y actualiza el contexto
const LoginWrapper = () => {
  const { setUser } = useContext(UserContext);
  const history = useHistory();

  useEffect(() => {
    const usuario = getUsuarioFromLocalStorage();
    if (usuario) {
      setUser(usuario); // Actualizar contexto
      // Redirigir a la página correspondiente según el rol
      const currentPath = history.location.pathname;
      const targetPath = usuario.rol === "admin" ? "/perfil-admin" : "/perfil-cliente";
      if (currentPath !== targetPath) {
        history.push(targetPath);
      }
    }
  }, [setUser, history]);

  return null; // No renderiza nada
};

export default LoginWrapper;