import React, { useState } from "react";
import Input from "../Atoms/Input";
import Button from "../Atoms/Button";
import { validarRUT, validarEmail } from "../../Utils/ValidarUsuario";
import { addUser } from "../../services/firestoreService";
import { useHistory } from "react-router-dom";

const UserForm = () => {
    const [form, setForm] = useState({
        nombre: "",
        apellido: "",
        clave: "",
        confirmarContrasena: "",
        correo: "",
        rut: "",
        fechaNacimiento: "",
    });
    const [mgs, setMgs] = useState("");
    const history = useHistory();

    const handleChange = (e) => setForm({ ...form, [e.target.id]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { rut, nombre, apellido, correo, clave, confirmarContrasena, fechaNacimiento } = form;

        if (!validarRUT(rut)) return setMgs("RUT incorrecto...");
        if (!nombre) return setMgs("El nombre está vacío...");
        if (!apellido) return setMgs("El apellido está vacío...");
        if (!validarEmail(correo)) return setMgs("Correo incorrecto...");
        if (!clave) return setMgs("La contraseña está vacía...");
        if (clave !== confirmarContrasena) return setMgs("Las contraseñas no coinciden...");
        if (!fechaNacimiento) return setMgs("La fecha de nacimiento está vacía...");

        await addUser(form);
        setMgs("¡El formulario se envió correctamente!");

        setTimeout(() => {
            history.push(
                correo === "admin@duoc.cl"
                    ? `/perfil-admin?nombre=${nombre}`
                    : `/perfil-cliente?nombre=${nombre}`
            );
        }, 1000);
    };

    return (
        <form onSubmit={handleSubmit}>
            <Input id="nombre" label="Nombre" value={form.nombre} onChange={handleChange} />
            <Input id="apellido" label="Apellido" value={form.apellido} onChange={handleChange} />
            <Input id="correo" label="Correo" type="email" value={form.correo} onChange={handleChange} />
            <Input id="rut" label="RUT" value={form.rut} onChange={handleChange} />
            <Input
                id="fechaNacimiento"
                label="Fecha de Nacimiento"
                type="date"
                value={form.fechaNacimiento}
                onChange={handleChange}
            />
            <Input
                id="clave"
                label="Contraseña"
                type="password"
                value={form.clave}
                onChange={handleChange}
            />
            <Input
                id="confirmarContrasena"
                label="Confirmar Contraseña"
                type="password"
                value={form.confirmarContrasena}
                onChange={handleChange}
            />
            <Button type="submit">Registrar</Button>
            {mgs && <p>{mgs}</p>}
        </form>
    );
};

export default UserForm;