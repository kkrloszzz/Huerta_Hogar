import { db } from "../config/firebase";
import {collection, addDoc} from "firebase/firestore";

export async function addUser(user){
    return await addDoc(collection(db, "usuario"), {...user, createAt: new Date()});
}

/*export async function addProduct(product){
    return addDoc(collection(db, "producto"), {...product, createAt: new Date()});
}*/