document.addEventListener('DOMContentLoaded', function () {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    displayCart();

    document.getElementById('clearCartBtn').addEventListener('click', function () {
        if (confirm('Clear your cart?')) {
            localStorage.removeItem('cart');
            displayCart();
        }
    });

    document.getElementById('checkoutBtn').addEventListener('click', function () {
        alert('Payment Sucesfil');
        localStorage.removeItem('cart');
        displayCart();
    });
});

// Display cart items
function displayCart() {
    const cartItems = document.getElementById('cartItems');
    const emptyCart = document.getElementById('emptyCart');
    const cartSummary = document.getElementById('cartSummary');
    const totalPriceElement = document.getElementById('totalPrice');

    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    cartItems.innerHTML = '';

    if (cart.length === 0) {
        emptyCart.style.display = 'block';
        cartSummary.style.display = 'none';
        return;
    }

    emptyCart.style.display = 'none';
    cartSummary.style.display = 'block';

    let totalPrice = 0;

    cart.forEach((item, index) => {
        const itemTotalPrice = item.price * item.quantity;
        totalPrice += itemTotalPrice;

        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
                    <div class="cart-item-image">
                        <img src="${item.image}" alt="${item.title}">
                    </div>
                    <div class="cart-item-details">
                        <div class="cart-item-title">${item.title}</div>
                        <div class="cart-item-price">$${item.price.toFixed(2)} each</div>
                    </div>
                    <div class="cart-item-actions">
                        <div class="quantity-control">
                            <button class="quantity-btn" onclick="updateQuantity(${index}, -1)">-</button>
                            <input type="text" class="quantity-input" value="${item.quantity}" readonly>
                            <button class="quantity-btn" onclick="updateQuantity(${index}, 1)">+</button>
                        </div>
                        <div class="cart-item-subtotal">$${itemTotalPrice.toFixed(2)}</div>
                        <button class="remove-btn" onclick="removeItem(${index})">Remove</button>
                    </div>
                `;

        cartItems.appendChild(cartItem);
    });

    totalPriceElement.textContent = totalPrice.toFixed(2);
}

// Update item
function updateQuantity(index, change) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (index >= 0 && index < cart.length) {
        cart[index].quantity += change;

        // quantity check test case
        if (cart[index].quantity < 1) {
            cart[index].quantity = 1;
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        displayCart();
    }
}

function removeItem(index) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (index >= 0 && index < cart.length) {
        cart.splice(index, 1);

        localStorage.setItem('cart', JSON.stringify(cart));

        displayCart();
    }
}