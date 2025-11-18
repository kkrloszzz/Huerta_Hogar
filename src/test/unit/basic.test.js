// Test básico para verificar que Jasmine + Karma funcionan
describe('Pruebas Matemáticas Básicas', function() {
    
    it('debería sumar números correctamente', function() {
        const resultado = 2 + 3;
        expect(resultado).toBe(5);
    });
    
    it('debería multiplicar números correctamente', function() {
        const resultado = 4 * 5;
        expect(resultado).toBe(20);
    });
    
    it('debería verificar igualdad de objetos', function() {
        const obj1 = { nombre: 'test', valor: 123 };
        const obj2 = { nombre: 'test', valor: 123 };
        expect(obj1).toEqual(obj2);
    });
});

describe('Validación de Carrito Básica', function() {
    
    it('debería crear un carrito vacío', function() {
        const carrito = [];
        expect(carrito.length).toBe(0);
        expect(Array.isArray(carrito)).toBe(true);
    });
    
    it('debería calcular total básico', function() {
        const productos = [
            { precio: 100, cantidad: 2 },
            { precio: 200, cantidad: 1 }
        ];
        
        const total = productos.reduce(function(sum, prod) {
            return sum + (prod.precio * prod.cantidad);
        }, 0);
        expect(total).toBe(400);
    });
});