// Setup básico para las pruebas
// Este archivo se puede usar para configuraciones globales

// Mock global de console para evitar ruido en las pruebas
if (typeof console === 'undefined') {
    console = {
        log: function() {},
        error: function() {},
        warn: function() {}
    };
}