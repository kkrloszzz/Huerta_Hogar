import React, {useState} from "react";
import Input from "../Atoms/Input";
import Button from "../Atoms/Button";
import {validarRUT, validarEmail, validarTelefono} from "../../Utils/ValidarUsuario";
import {addUse} from "../../services/firestoreService";
import { userHistory } from "react-router-dom";

const UserForm = () =>{
    const [form, setForm] = useState({run:"", nombre:"", email:"",clave:"",Telefono:""});
    const [mgs, setMgs] = useState("");
    const history=userHistory();

    const handleChange = e => setForm({...form, [e.target.id]:[e.target.value]});

    const handleSubmit = async e => {
        e.preventDefaoult();
        const {run,nombre,email,clave,Telefono} = form;
        if(!validarRUT(run)) return setMgs("Rut Incorrecto...");
        if(!nombre) return setMgs("Nombre esta vacio...");
        if(!validarEmail(email)) return setMgs("Correo incorrcto...");
        //if(!validarEdad(fecha)) return setMgs("Debe ser mayor a 18 años...");

        await addUser(form);
        setMgs("EL Formulario se envio Correctamente!");
        
        setTimeout(()=>{
            history.push(email==="admin@duoc.cl" ? "/perfil-admin?nombre="+nombre: "/perfil-cliente?nombre"+nombre);
        }, 1000);
    } ;

    return (
        <form onSubmit= {handleSubmit}>
            <Input id="rut"  label="RUN" value={form.run} onChange={handleChange} ></Input>
            <Input id="nombre"  label="Nombre" value={form.nombre} onChange={handleChange} ></Input>
            <Input id="Correo"  label="Correo" type="email"  value={form.email} onChange={handleChange} ></Input>
            <Input id="clave"  label="Contraseña" type="password"  value={form.clave} onChange={handleChange} ></Input>
            <Input id="Telefono"  label="Telefono" type="tel"  value={form.fecha} onChange={handleChange} ></Input>
            <Button type="submit"> Enviar</Button>
            <p style={{color:"crimson"}}>{mgs}</p>
        </form>
    );
};

export default UserForm;