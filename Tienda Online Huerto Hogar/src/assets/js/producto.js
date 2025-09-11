document.addEventListener('DOMContentLoaded', () => {
    const products = [
        { id: 1, name: 'Manzanas Fuji', price: 1200, image: '../Img/manzanas_fuji.jpg', description: 'Una manzana crujiente y dulce, perfecta para cualquier momento del día.' },
        { id: 2, name: 'Naranjas Valencia', price: 100, image: '../Img/Naranjas Valencia.jpg', description: 'Naranjas jugosas y llenas de vitamina C, ideales para zumos.' },
        { id: 3, name: 'Banana Cavendish', price: 1200, image: '../Img/banana cavendish.jpg', description: 'Bananas cremosas y energéticas, un snack natural y saludable.' },
        { id: 4, name: 'Zanahoria Organica', price: 100, image: '../Img/Zhanaoria Organica.jpg', description: 'Zanahorias orgánicas, frescas y llenas de nutrientes.' },
        { id: 5, name: 'Espinacas Frescas', price: 100, image: '../Img/espinacas Frescas.jpg', description: 'Espinacas tiernas y sabrosas, perfectas para ensaladas o cocidas.' },
        { id: 6, name: 'Pimientos Tricolor', price: 100, image: '../Img/Pimientos_Tricolor.jpg', description: 'Pimientos de tres colores, añaden sabor y color a tus platos.' },
        { id: 7, name: 'Miel Organica', price: 100, image: '../Img/Miel Organica.jpg', description: 'Miel pura y orgánica, un endulzante natural y saludable.' },
        { id: 8, name: 'Quinoa Organica', price: 100, image: '../Img/Quinoa Organica.jpg', description: 'Quinoa orgánica, un superalimento versátil y nutritivo.' },
        { id: 9, name: 'Leche Entera', price: 100, image: '../Img/Leche Entera.jpg', description: 'Leche fresca y entera, rica en calcio y proteínas.' }
    ];

    const productContainer = document.querySelector('.ajuste');

    function renderProducts() {
        if (!productContainer) return;
        productContainer.innerHTML = '';
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('carta_producto');
            productCard.innerHTML = `
                <div class="product-image"> <img src="${product.image}" alt="${product.name}"></div>
                <div class="titulo_producto">${product.name}</div>
                <div class="detalle_producto">
                    <span>Precio</span>
                    <span class="precio">${product.price.toLocaleString()}</span>
                </div>
                <button class="button">Añadir</button>
            `;
            productContainer.appendChild(productCard);
        });
    }

    renderProducts();
});