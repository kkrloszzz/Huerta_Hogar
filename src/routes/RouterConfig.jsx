import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

// Importa tus componentes de layout (suponiendo que existen)
// import Header from './Layout/Header'; 
// import Footer from './Layout/Footer';

// Importa los componentes de las páginas desde su ubicación correcta
import Carrito from '../Component/Pages/Carrito';
import Catalogo from '../Component/Pages/Catalogo';
import Home from '../Component/Pages/Home';
import LoginWrapper from '../Component/Pages/LoginWrapper'; // Para el inicio de sesión
import Registro from '../Component/Pages/Registro'; // Asumiendo que crearás este componente
import Checkout from '../Component/Pages/checkout';
import Exito from '../Component/Pages/compraExitosa';
import ErrorPago from '../Component/Pages/errorPago';
// ... importa los demás componentes que necesites (PerfilCliente, etc.)

const RouterConfig = () => {
    return (
        <Router>
            {/* <Header />  Puedes colocar tu Header aquí si es global */}
            
            <Routes>
                {/* --- Rutas Principales --- */}
                {/* La ruta raíz ahora renderiza el componente Home de React */}
                <Route path="/" element={<Home />} />
                
                {/* --- La forma CORRECTA de manejar el registro --- */}
                {/* Redirige a un componente de React, no a un archivo HTML */}
                <Route path="/registro" element={<Registro />} />
                
                <Route path="/login" element={<LoginWrapper />} />
                
                {/* --- Rutas del Carrito --- */}
                <Route path="/catalogo" element={<Catalogo />} />
                <Route path="/carrito" element={<Carrito />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/exito" element={<Exito />} />
                <Route path="/error" element={<ErrorPago />} />

                {/* --- Rutas de Perfil (Ejemplo) --- */}
                {/* <Route path="/perfil-admin" element={<PerfilAdmin />} /> */}
                {/* <Route path="/perfil-cliente" element={<PerfilCliente />} /> */}
            </Routes>
            
            {/* <Footer /> Puedes colocar tu Footer aquí si es global */}
        </Router>
    );
};

export default RouterConfig;