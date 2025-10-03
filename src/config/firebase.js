import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyAkqjjPbCFCi3CraWB3FIPSeq2fiLHBE_w",
    authDomain: "tienda-huerta-hogar.firebaseapp.com",
    projectId: "tienda-huerta-hogar",
    storageBucket: "tienda-huerta-hogar.firebasestorage.app",
    messagingSenderId: "29884421309",
    appId: "1:29884421309:web:eb7268e124949456d8d3d4",
    measurementId: "G-Q0GXZML5T1"
  };
  
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
  const db = getFirestore(app);