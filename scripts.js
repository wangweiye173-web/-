// Helpers fed by Redux-like store (see store.js)
function getTotalItems(cart) {
    return Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
}

function getTotalCost(cart) {
    return Object.values(cart).reduce((sum, item) => sum + item.quantity * item.price, 0);
}

function updateCartCount() {
    const cart = window.VQStore.getState();
    const countEl = document.getElementById('cart-count');
    if (countEl) countEl.textContent = String(getTotalItems(cart));
}

function initShopPage() {
    // Disable buttons for items already in cart
    const cart = window.VQStore.getState();
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        const id = btn.getAttribute('data-id');
        if (id && cart[id]) {
            btn.setAttribute('disabled', 'true');
            btn.textContent = 'Added';
        }
        btn.addEventListener('click', () => {
            const card = btn.closest('.card');
            if (!card) return;
            const pid = card.getAttribute('data-id');
            const name = card.getAttribute('data-name') || '';
            const price = Number(card.getAttribute('data-price') || '0');
            const img = card.getAttribute('data-img') || '';
            if (!pid) return;
            window.VQStore.dispatch({ type: window.VQActions.ADD_ITEM, payload: { id: pid, name, price, img } });
            btn.setAttribute('disabled', 'true');
            btn.textContent = 'Added';
        });
    });

    // Update cart count on state changes
    window.VQStore.subscribe(updateCartCount);
}

function renderCartPage() {
    const cart = window.VQStore.getState();
    const itemsContainer = document.getElementById('cart-items');
    const totalItemsEl = document.getElementById('total-items');
    const totalCostEl = document.getElementById('total-cost');
    const checkoutBtn = document.getElementById('checkout-btn');

    function refresh() {
        const c = window.VQStore.getState();
        // summary
        if (totalItemsEl) totalItemsEl.textContent = String(getTotalItems(c));
        if (totalCostEl) totalCostEl.textContent = getTotalCost(c).toFixed(2);
        updateCartCount();
        // list
        if (!itemsContainer) return;
        itemsContainer.innerHTML = '';
        const entries = Object.values(c);
        if (entries.length === 0) {
            const empty = document.createElement('p');
            empty.textContent = 'Your cart is empty.';
            itemsContainer.appendChild(empty);
            return;
        }
        entries.forEach(item => {
            const row = document.createElement('div');
            row.className = 'cart-item';
            row.innerHTML = `
                <img alt="${item.name}" src="${item.img}">
                <div class="meta">
                    <strong>${item.name}</strong>
                    <div class="unit">Unit price: $${item.price.toFixed(2)}</div>
                    <div class="unit">Subtotal: $${(item.price * item.quantity).toFixed(2)}</div>
                </div>
                <div class="qty-controls">
                    <button data-action="dec" aria-label="Decrease">-</button>
                    <span aria-live="polite">${item.quantity}</span>
                    <button data-action="inc" aria-label="Increase">+</button>
                    <button data-action="del" class="btn secondary" style="margin-left:8px">Delete</button>
                </div>
            `;
            const [decBtn, , incBtn, delBtn] = row.querySelectorAll('button, span');
            const qtySpan = row.querySelector('span');
            if (decBtn) decBtn.addEventListener('click', () => {
                window.VQStore.dispatch({ type: window.VQActions.DEC_ITEM, payload: { id: item.id } });
                refresh();
            });
            if (incBtn) incBtn.addEventListener('click', () => {
                window.VQStore.dispatch({ type: window.VQActions.INC_ITEM, payload: { id: item.id } });
                refresh();
            });
            if (delBtn) delBtn.addEventListener('click', () => {
                window.VQStore.dispatch({ type: window.VQActions.DEL_ITEM, payload: { id: item.id } });
                refresh();
            });
            itemsContainer.appendChild(row);
        });
    }

    if (checkoutBtn) checkoutBtn.addEventListener('click', () => {
        alert('Checkout coming soon!');
    });

    window.VQStore.subscribe(refresh);
    refresh();
}

// Initialize per-page
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    if (document.body.contains(document.querySelector('.hero'))) {
        // landing only needs cart count
        return;
    }
    if (document.body.contains(document.querySelector('[aria-label="Product Listing"]'))) {
        initShopPage();
    }
    if (document.body.contains(document.querySelector('[aria-label="Shopping Cart"]'))) {
        renderCartPage();
    }
});


