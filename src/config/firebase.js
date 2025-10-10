import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAkqjjPbCFCi3CraWB3FIPSeq2fiLHBE_w",
    authDomain: "tienda-huerta-hogar.firebaseapp.com",
    projectId: "tienda-huerta-hogar",
    storageBucket: "tienda-huerta-hogar.appsup.com", //actualizar linea
    messagingSenderId: "29884421309",
    appId: "1:29884421309:web:eb7268e124949456d8d3d4",
    measurementId: "G-Q0GXZML5T1"
  };
  
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
  const db = getFirestore(app);

  export {db};