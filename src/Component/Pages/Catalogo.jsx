import { useEffect } from "react";
import { db } from "../../services/firebase";

const CatalogoLoader = () => {
  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const snapshot = await db.collection("producto").get();
        const productos = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        window.catalogo = productos; //Exponer al HTML
        console.log("Productos cargados desde Firestore:", productos.length);
      } catch (err) {
        console.error("Error al cargar productos:", err);
      }
    };

    cargarProductos();
  }, []);

  return null; // No renderiza nada
};

export default CatalogoLoader;
