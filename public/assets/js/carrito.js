document.addEventListener('DOMContentLoaded', () => {
    const productListContainer = document.querySelector('.product-list');
    const orderSummary = document.querySelector('.order-summary');
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    function renderCart() {
        if (!productListContainer) return;
        productListContainer.innerHTML = '';

        if (cart.length === 0) {
            productListContainer.innerHTML = '<p>Tu carrito está vacío.</p>';
            if (orderSummary) {
                orderSummary.style.display = 'none';
            }
            return;
        }

        if (orderSummary) {
            orderSummary.style.display = 'block';
        }

        let total = 0;

        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.classList.add('product-item');
            cartItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="product-image">
                <div class="product-details">
                    <h5>${item.name}</h5>
                </div>
                <div class="product-price">$${(item.price * item.quantity).toLocaleString()}</div>
                <div class="quantity-selector">
                    <button class="quantity-btn" data-id="${item.id}" data-action="decrease">-</button>
                    <input type="text" value="${item.quantity}" readonly>
                    <button class="quantity-btn" data-id="${item.id}" data-action="increase">+</button>
                </div>
                <button class="remove-btn" data-id="${item.id}">Eliminar</button>
            `;
            productListContainer.appendChild(cartItem);
            total += item.price * item.quantity;
        });

        if (orderSummary) {
            const totalElement = orderSummary.querySelector('.total-section span:last-child');
            if (totalElement) {
                totalElement.textContent = `$${total.toLocaleString()}`;
            }
        }
    }

    function updateCart(productId, action) {
        const cartItem = cart.find(item => item.id === productId);
        if (cartItem) {
            if (action === 'increase') {
                cartItem.quantity++;
            } else if (action === 'decrease') {
                cartItem.quantity--;
                if (cartItem.quantity === 0) {
                    cart = cart.filter(item => item.id !== productId);
                }
            } else if (action === 'remove') {
                cart = cart.filter(item => item.id !== productId);
            }
            localStorage.setItem('cart', JSON.stringify(cart));
            renderCart();
        }
    }

    if (productListContainer) {
        productListContainer.addEventListener('click', (event) => {
            const target = event.target;
            if (target.classList.contains('quantity-btn')) {
                const productId = parseInt(target.getAttribute('data-id'));
                const action = target.getAttribute('data-action');
                updateCart(productId, action);
            }
            if (target.classList.contains('remove-btn')) {
                const productId = parseInt(target.getAttribute('data-id'));
                updateCart(productId, 'remove');
            }
        });
    }

    renderCart();
}); 