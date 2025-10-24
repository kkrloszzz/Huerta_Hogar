import { db } from "../config/firebase";
import {collection, addDoc} from "firebase/firestore";

export async function addUser(user){
    try {
        const docRef = await addDoc(collection(db, "usuario"), {
            ...user, 
            createdAt: new Date(),

        });
        console.log("Usuario Registrado con id: ",docRef.id);
        return docRef;

    } catch(error)  {
        console.error("Error al registrar usuario: ",error);
        return error;
    }
}

/*export async function addProduct(product){
    return addDoc(collection(db, "producto"), {...product, createAt: new Date()});
}*/