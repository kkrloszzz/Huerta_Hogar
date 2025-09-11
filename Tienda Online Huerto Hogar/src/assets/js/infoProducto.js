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

    const mainContent = document.querySelector('.main-content');

    function renderProductDetails() {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = parseInt(urlParams.get('id'));
        const product = products.find(p => p.id === productId);

        if (product && mainContent) {
            const mainImage = mainContent.querySelector('.main-img');
            if (mainImage) {
                mainImage.src = product.image;
                mainImage.alt = product.name;
            }
            
            const productTitle = mainContent.querySelector('.product-title');
            if (productTitle) productTitle.textContent = product.name;

            const productPrice = mainContent.querySelector('.product-price');
            if (productPrice) productPrice.textContent = `$${product.price.toLocaleString()}`;

            const productDescription = mainContent.querySelector('.product-description');
            if (productDescription) productDescription.textContent = product.description;

            const addToCartBtn = mainContent.querySelector('.add-to-cart-btn');
            if (addToCartBtn) {
                addToCartBtn.addEventListener('click', () => {
                    addToCart(product.id);
                });
            }
        } else if (mainContent) {
            mainContent.innerHTML = '<p>Producto no encontrado.</p>';
        }
    }

    function addToCart(productId) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const product = products.find(p => p.id === productId);

        if (product) {
            const quantityInput = document.querySelector('.quantity-input');
            const quantity = quantityInput ? parseInt(quantityInput.value) : 1;

            const cartItem = cart.find(item => item.id === productId);
            if (cartItem) {
                cartItem.quantity += quantity;
            } else {
                cart.push({ ...product, quantity: quantity });
            }
            localStorage.setItem('cart', JSON.stringify(cart));
            alert(`${product.name} (x${quantity}) ha sido añadido al carrito.`);
        }
    }

    renderProductDetails();
});
