import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Home from "../components/pages/Home";
import PerfilAdmin from "../components/pages/PerfilAdmin";
import PerfilCliente from "../components/pages/PerfilCliente";
import Header from "../components/organisms/Header";   
import Footer from "../components/organisms/Footer";

import Catalogo from "../components/pages/Catalogo";
import Carrito from "../components/pages/Carrito";
import Checkout from "../components/pages/Checkout";
import CompraExitosa from "../components/pages/CompraExitosa";
import ErrorPago from "../components/pages/ErrorPago";

const RouterConfg = () => (
    <>  
        <Header />
        <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/perfil-admin" component={PerfilAdmin} />
            <Route path="/perfil-cliente" component={PerfilCliente} />
            <Route path="/catalogo" component={Catalogo} />
            <Route path="/carrito" component={Carrito} />
            <Route path="/checkout" component={Checkout} />
            <Route path="/exito" component={CompraExitosa} />
            <Route path="/error" component={ErrorPago} />
        </Switch>
        <Footer />
    </>
);
export default RouterConfg;