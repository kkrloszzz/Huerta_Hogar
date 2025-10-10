import { createContext, useState } from "react";
// Contexto para manejar el estado del usuario (logueado o no, datos del usuario)
export const UserContext = createContext();
// Proveedor del contexto
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Estado inicial sin usuario
    //Usamos UserContext.Provider para proveer el estado y la función para actualizarlo a los componentes hijos
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
