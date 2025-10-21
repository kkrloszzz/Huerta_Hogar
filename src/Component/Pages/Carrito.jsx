import React, { useState, useEffect } from "react";

const Carrito = () => {
    const [productos, setProductos] = useState([]);
    const [total, setTotal] = useState(0);

    // Función para actualizar el encabezado del carrito
    const actualizarCarritoHeader = () => {
        console.log(`Carrito actualizado: ${productos.length} productos`);
    };

    // Función para renderizar los productos en el carrito
    const renderizarCarrito = () => {
        return productos.map((producto, index) => (
            <tr key={index}>
                <td>{producto.nombre}</td>
                <td>{producto.cantidad}</td>
                <td>${producto.precio.toFixed(2)}</td>
                <td>${(producto.cantidad * producto.precio).toFixed(2)}</td>
            </tr>
        ));
    };

    // Función para calcular el total del carrito
    const calcularTotal = () => {
        const totalCalculado = productos.reduce(
            (acc, producto) => acc + producto.cantidad * producto.precio,
            0
        );
        setTotal(totalCalculado);
    };

    // Inicializar el carrito cuando el componente se monte
    useEffect(() => {
        inicializarCarrito();
    }, []);

    // Función para inicializar el carrito
    const inicializarCarrito = () => {
        actualizarCarritoHeader();
        renderizarCarrito();
        calcularTotal();
    };

    return (
        <div>
            <h1>Carrito de Compras</h1>
            <table>
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Precio Unitario</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>
                <tbody>{renderizarCarrito()}</tbody>
            </table>
            <h2>Total: ${total.toFixed(2)}</h2>
        </div>
    );
};

export default Carrito;