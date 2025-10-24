import Checkout from "../components/pages/Ccheckout";
import Exito from "../components/pages/compraExito";
import ErrorPago from "../components/pages/errorPago";
import Registro from "../components/pages/Registro"; // Nuevo componente para la página de registro

import Catalogo from "../components/pages/Catalogo";
import Carrito from "../components/pages/Carrito";
import Checkout from "../components/pages/Checkout";
import Exito from "../components/pages/Exito";
import ErrorPago from "../components/pages/ErrorPago";

const RouterConfig = () => (
    <>  
        <Header />
        <Switch>
            <Route exact path="/" component={() => <StaticPage src="/index.html" />} />
            <Route path="/registro" component={() => {
                window.location.href = '/assets/page/NuevoUsuario.html';
                return null;
            }} />
            
            
            <Route path="/perfil-admin" component={PerfilAdmin} />
            <Route path="/perfil-cliente" component={PerfilCliente} />

            {/* Nuevas rutas del sistema de carrito */}
            <Route path="/catalogo" component={Catalogo} />
            <Route path="/carrito" component={Carrito} />
            <Route path="/checkout" component={Checkout} />
            <Route path="/exito" component={Exito} />
            <Route path="/error" component={ErrorPago} />
        </Switch>
        <footer />
    </>
);

export default RouterConfig;