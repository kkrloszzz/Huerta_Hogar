import {
    Timestamp,
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    updateDoc,
    where
} from "firebase/firestore";
import { db } from "../config/firebase";

export class CrudService {
  
  // ==================== ÓRDENES ====================
  static async getOrdenes() {
    try {
      const ordenesRef = collection(db, "compras");
      const q = query(ordenesRef, orderBy("fecha", "desc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        fecha: doc.data().fecha?.toDate?.() || doc.data().fecha
      }));
    } catch (error) {
      console.error("Error obteniendo órdenes:", error);
      return [];
    }
  }

  static async getOrdenById(id) {
    try {
      const ordenRef = doc(db, "compras", id);
      const ordenSnap = await getDoc(ordenRef);
      if (ordenSnap.exists()) {
        const data = ordenSnap.data();
        return { 
          id: ordenSnap.id, 
          ...data,
          fecha: data.fecha?.toDate?.() || data.fecha
        };
      }
      return null;
    } catch (error) {
      console.error("Error obteniendo orden:", error);
      return null;
    }
  }

  static async updateOrdenEstado(id, nuevoEstado) {
    try {
      const ordenRef = doc(db, "compras", id);
      await updateDoc(ordenRef, {
        estado: nuevoEstado,
        updatedAt: Timestamp.now()
      });
      return true;
    } catch (error) {
      console.error("Error actualizando orden:", error);
      return false;
    }
  }

  // ==================== PRODUCTOS ====================
  static async getProductos() {
    try {
      const productosRef = collection(db, "producto");
      const querySnapshot = await getDocs(productosRef);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error obteniendo productos:", error);
      return [];
    }
  }

  static async getProductoById(id) {
    try {
      const productoRef = doc(db, "producto", id);
      const productSnap = await getDoc(productoRef);
      if (productSnap.exists()) {
        return { id: productSnap.id, ...productSnap.data() };
      }
      return null;
    } catch (error) {
      console.error("Error obteniendo producto:", error);
      return null;
    }
  }

  static async createProducto(producto) {
    try {
      const docRef = await addDoc(collection(db, "producto"), {
        ...producto,
        createdAt: Timestamp.now(),
        activo: true
      });
      return docRef.id;
    } catch (error) {
      console.error("Error creando producto:", error);
      return null;
    }
  }

  static async updateProducto(id, datos) {
    try {
      const productoRef = doc(db, "producto", id);
      await updateDoc(productoRef, {
        ...datos,
        updatedAt: Timestamp.now()
      });
      return true;
    } catch (error) {
      console.error("Error actualizando producto:", error);
      return false;
    }
  }

  static async deleteProducto(id) {
    try {
      await deleteDoc(doc(db, "producto", id));
      return true;
    } catch (error) {
      console.error("Error eliminando producto:", error);
      return false;
    }
  }

  // ==================== CATEGORÍAS ====================
  static async getCategorias() {
    try {
      const categoriasRef = collection(db, "categorias");
      const querySnapshot = await getDocs(categoriasRef);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error obteniendo categorías:", error);
      return [];
    }
  }

  static async createCategoria(categoria) {
    try {
      const docRef = await addDoc(collection(db, "categorias"), {
        ...categoria,
        createdAt: Timestamp.now(),
        activa: true
      });
      return docRef.id;
    } catch (error) {
      console.error("Error creando categoría:", error);
      return null;
    }
  }

  static async updateCategoria(id, datos) {
    try {
      const categoriaRef = doc(db, "categorias", id);
      await updateDoc(categoriaRef, {
        ...datos,
        updatedAt: Timestamp.now()
      });
      return true;
    } catch (error) {
      console.error("Error actualizando categoría:", error);
      return false;
    }
  }

  static async deleteCategoria(id) {
    try {
      await deleteDoc(doc(db, "categorias", id));
      return true;
    } catch (error) {
      console.error("Error eliminando categoría:", error);
      return false;
    }
  }

  // ==================== USUARIOS ====================
  static async getUsuarios() {
    try {
      const usuariosRef = collection(db, "usuario");
      const querySnapshot = await getDocs(usuariosRef);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt
      }));
    } catch (error) {
      console.error("Error obteniendo usuarios:", error);
      return [];
    }
  }

  static async getUsuarioById(id) {
    try {
      const usuarioRef = doc(db, "usuario", id);
      const usuarioSnap = await getDoc(usuarioRef);
      if (usuarioSnap.exists()) {
        const data = usuarioSnap.data();
        return { 
          id: usuarioSnap.id, 
          ...data,
          createdAt: data.createdAt?.toDate?.() || data.createdAt
        };
      }
      return null;
    } catch (error) {
      console.error("Error obteniendo usuario:", error);
      return null;
    }
  }

  static async updateUsuario(id, datos) {
    try {
      const usuarioRef = doc(db, "usuario", id);
      const updateData = {
        updatedAt: Timestamp.now()
      };

      if (datos.nombre) {
        updateData.nombre = datos.nombre;
      }
      
      await updateDoc(usuarioRef, updateData);
      return true;
    } catch (error) {
      console.error("Error actualizando usuario:", error);
      return false;
    }
  }

  // ==================== REPORTES ====================
  static async getReporteVentas(fechaInicio, fechaFin) {
    try {
      const comprasRef = collection(db, "compras");
      const q = query(
        comprasRef,
        where("fecha", ">=", fechaInicio),
        where("fecha", "<=", fechaFin),
        orderBy("fecha", "desc")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        fecha: doc.data().fecha?.toDate?.() || doc.data().fecha
      }));
    } catch (error) {
      console.error("Error obteniendo reporte de ventas:", error);
      return [];
    }
  }

  static async getProductosMasVendidos() {
    try {
      // Esta es una implementación básica - puedes mejorarla según tus necesidades
      const comprasRef = collection(db, "compras");
      const querySnapshot = await getDocs(comprasRef);
      
      const productosVendidos = {};
      querySnapshot.forEach(doc => {
        const compra = doc.data();
        if (compra.productos) {
          compra.productos.forEach(producto => {
            if (productosVendidos[producto.id]) {
              productosVendidos[producto.id].cantidad += producto.cantidad;
            } else {
              productosVendidos[producto.id] = {
                ...producto,
                cantidad: producto.cantidad
              };
            }
          });
        }
      });

      return Object.values(productosVendidos)
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 10);
    } catch (error) {
      console.error("Error obteniendo productos más vendidos:", error);
      return [];
    }
  }
}