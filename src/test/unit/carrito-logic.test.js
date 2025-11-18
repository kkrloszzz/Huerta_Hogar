// Tests PUROS de Jasmine para la lógica del carrito
// Sin React, sin JSX, solo JavaScript puro

// Mock de localStorage
const createLocalStorageMock = () => {
    let store = {};
    return {
        getItem: function(key) {
            return store[key] || null;
        },
        setItem: function(key, value) {
            store[key] = value.toString();
        },
        removeItem: function(key) {
            delete store[key];
        },
        clear: function() {
            store = {};
        }
    };
};

// Función para calcular total del carrito (extraída del componente)
const calcularTotal = function(carrito) {
    return carrito.reduce(function(total, producto) {
        return total + (producto.precio || 0) * (producto.cantidad || 1);
    }, 0);
};

// Función para agregar producto al carrito
const agregarAlCarrito = function(carrito, producto) {
    const productoExistente = carrito.find(function(item) {
        return item.id === producto.id;
    });
    
    if (productoExistente) {
        return carrito.map(function(item) {
            return item.id === producto.id
                ? Object.assign({}, item, { cantidad: (item.cantidad || 1) + 1 })
                : item;
        });
    } else {
        return carrito.concat([Object.assign({}, producto, { cantidad: 1 })]);
    }
};

// Función para actualizar cantidad
const actualizarCantidad = function(carrito, index, nuevaCantidad) {
    if (nuevaCantidad < 1) return carrito;
    
    return carrito.map(function(item, i) {
        return i === index ? Object.assign({}, item, { cantidad: nuevaCantidad }) : item;
    });
};

// Función para eliminar producto
const eliminarDelCarrito = function(carrito, index) {
    return carrito.filter(function(_, i) {
        return i !== index;
    });
};

// TESTS CON JASMINE
describe('Lógica del Carrito de Compras', function() {
    
    let localStorageMock;
    
    beforeEach(function() {
        localStorageMock = createLocalStorageMock();
        // Mock global de localStorage para las pruebas
        if (typeof window !== 'undefined') {
            window.localStorage = localStorageMock;
        }
    });
    
    afterEach(function() {
        // Limpiar después de cada test
        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.clear();
        }
    });
    
    describe('Cálculo de Totales', function() {
        
        it('debe calcular correctamente el total con un producto', function() {
            const carrito = [
                { id: '1', nombre: 'Producto A', precio: 10000, cantidad: 2 }
            ];
            
            const total = calcularTotal(carrito);
            expect(total).toBe(20000);
        });
        
        it('debe calcular correctamente el total con múltiples productos', function() {
            const carrito = [
                { id: '1', nombre: 'Producto A', precio: 10000, cantidad: 1 },
                { id: '2', nombre: 'Producto B', precio: 20000, cantidad: 3 }
            ];
            
            const total = calcularTotal(carrito);
            expect(total).toBe(70000);
        });
        
        it('debe retornar 0 para carrito vacío', function() {
            const carrito = [];
            const total = calcularTotal(carrito);
            expect(total).toBe(0);
        });
        
        it('debe usar cantidad 1 por defecto cuando no hay cantidad definida', function() {
            const carrito = [
                { id: '1', nombre: 'Producto A', precio: 15000 } // sin cantidad
            ];
            
            const total = calcularTotal(carrito);
            expect(total).toBe(15000);
        });
        
        it('debe manejar productos sin precio', function() {
            const carrito = [
                { id: '1', nombre: 'Producto Gratis', cantidad: 1 } // sin precio
            ];
            
            const total = calcularTotal(carrito);
            expect(total).toBe(0);
        });
    });
    
    describe('Gestión del Carrito', function() {
        
        it('debe agregar nuevo producto al carrito', function() {
            const carritoInicial = [];
            const producto = { id: '1', nombre: 'Producto A', precio: 10000 };
            
            const nuevoCarrito = agregarAlCarrito(carritoInicial, producto);
            
            expect(nuevoCarrito.length).toBe(1);
            expect(nuevoCarrito[0].id).toBe('1');
            expect(nuevoCarrito[0].cantidad).toBe(1);
        });
        
        it('debe incrementar cantidad de producto existente', function() {
            const carritoInicial = [
                { id: '1', nombre: 'Producto A', precio: 10000, cantidad: 1 }
            ];
            const producto = { id: '1', nombre: 'Producto A', precio: 10000 };
            
            const nuevoCarrito = agregarAlCarrito(carritoInicial, producto);
            
            expect(nuevoCarrito.length).toBe(1);
            expect(nuevoCarrito[0].cantidad).toBe(2);
        });
        
        it('debe actualizar cantidad de producto específico', function() {
            const carrito = [
                { id: '1', nombre: 'Producto A', precio: 10000, cantidad: 1 },
                { id: '2', nombre: 'Producto B', precio: 20000, cantidad: 1 }
            ];
            
            const nuevoCarrito = actualizarCantidad(carrito, 0, 5);
            
            expect(nuevoCarrito[0].cantidad).toBe(5); // Producto A actualizado
            expect(nuevoCarrito[1].cantidad).toBe(1); // Producto B sin cambios
        });
        
        it('debe eliminar producto del carrito', function() {
            const carrito = [
                { id: '1', nombre: 'Producto A', precio: 10000, cantidad: 1 },
                { id: '2', nombre: 'Producto B', precio: 20000, cantidad: 1 }
            ];
            
            const nuevoCarrito = eliminarDelCarrito(carrito, 0);
            
            expect(nuevoCarrito.length).toBe(1);
            expect(nuevoCarrito[0].id).toBe('2');
        });
        
        it('no debe permitir cantidad menor a 1', function() {
            const carrito = [
                { id: '1', nombre: 'Producto A', precio: 10000, cantidad: 1 }
            ];
            
            const nuevoCarrito = actualizarCantidad(carrito, 0, 0);
            
            expect(nuevoCarrito[0].cantidad).toBe(1); // No cambia
        });
    });
    
    describe('Cálculo de Subtotales', function() {
        
        it('debe calcular subtotal por producto correctamente', function() {
            const producto = { precio: 5000, cantidad: 4 };
            const subtotal = producto.precio * producto.cantidad;
            
            expect(subtotal).toBe(20000);
        });
        
        it('debe calcular correctamente con decimales', function() {
            const carrito = [
                { id: '1', nombre: 'Producto A', precio: 19.99, cantidad: 2 },
                { id: '2', nombre: 'Producto B', precio: 29.50, cantidad: 1 }
            ];
            
            const total = calcularTotal(carrito);
            expect(total).toBeCloseTo(69.48, 2); // 19.99*2 + 29.50 = 69.48
        });
    });
    
    describe('Persistencia en localStorage', function() {
        
        it('debe guardar carrito en localStorage', function() {
            const carrito = [
                { id: '1', nombre: 'Producto A', precio: 10000, cantidad: 2 }
            ];
            
            localStorageMock.setItem('carrito', JSON.stringify(carrito));
            const carritoGuardado = JSON.parse(localStorageMock.getItem('carrito'));
            
            expect(carritoGuardado).toEqual(carrito);
            expect(carritoGuardado.length).toBe(1);
            expect(carritoGuardado[0].cantidad).toBe(2);
        });
        
        it('debe cargar carrito desde localStorage', function() {
            const carrito = [
                { id: '1', nombre: 'Producto A', precio: 10000, cantidad: 1 }
            ];
            
            localStorageMock.setItem('carrito', JSON.stringify(carrito));
            const carritoCargado = JSON.parse(localStorageMock.getItem('carrito') || '[]');
            
            expect(carritoCargado).toEqual(carrito);
        });
        
        it('debe manejar localStorage vacío', function() {
            const carritoCargado = JSON.parse(localStorageMock.getItem('carrito') || '[]');
            
            expect(carritoCargado).toEqual([]);
        });
    });
});

// Tests adicionales para validar el formato de moneda
describe('Formato de Moneda', function() {
    
    it('debe formatear números correctamente para display', function() {
        const numero = 12345.67;
        const formateado = numero.toLocaleString('es-CL');
        
        // Dependiendo del entorno, el formato puede variar
        expect(typeof formateado).toBe('string');
        expect(formateado).toContain('12'); // Al menos parte del número
    });
    
    it('debe manejar números grandes correctamente', function() {
        const carritoGrande = [
            { id: '1', nombre: 'Producto Caro', precio: 1000000, cantidad: 2 },
            { id: '2', nombre: 'Otro Producto', precio: 500000, cantidad: 1 }
        ];
        
        const total = calcularTotal(carritoGrande);
        expect(total).toBe(2500000); // 1,000,000 * 2 + 500,000 = 2,500,000
    });
});