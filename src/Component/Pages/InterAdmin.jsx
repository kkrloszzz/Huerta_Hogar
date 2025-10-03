import {useLocation} from "react-router-dom";

function useQuery(){ return new URLSearchParams(useLocation().search())};

const PerfilAdministrador = () => {
    const q = useQuery();
    return <h1>Bienvenido {q.get("nombre")} </h1> 
};

export default PerfilAdministrador;

/*
PErfil CLiente: 
function useQuery(){ return new URLSearchParams(useLocation().search())};

const PerfilCliente = () => {
    const q = useQuery();
    return <h1>Bienvenido {q.get("nombre")} </h1> 
};

export default PerfilCliente;



*/ 