// 1. BASE DE DATOS DE PRODUCTOS (Puedes cambiar imágenes, nombres, precios y categorías)
const products = [
    {
        id: 1,
        name: "Consola Retro Portátil",
        price: 85000,
        category: "consolas",
        image: "https://images.unsplash.com/photo-1592840496694-26d035b52b48?auto=format&fit=crop&w=500&q=80"
    },
    {
        id: 2,
        name: "Teclado Mecánico RGB",
        price: 62000,
        category: "perifericos",
        image: "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=500&q=80"
    },
    {
        id: 3,
        name: "Auriculares Gamer Pro",
        price: 54000,
        category: "perifericos",
        image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=500&q=80"
    },
    {
        id: 4,
        name: "Joystick Inalámbrico",
        price: 48000,
        category: "accesorios",
        image: "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=500&q=80"
    },
    {
        id: 5,
        name: "Mouse Ultraligero",
        price: 35000,
        category: "perifericos",
        image: "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=500&q=80"
    },
    {
        id: 6,
        name: "Soporte Auriculares LED",
        price: 19000,
        category: "accesorios",
        image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=500&q=80"
    }
];

// 2. ESTADO DE LA APLICACIÓN (Recuperando datos guardados en localStorage)
let cart = JSON.parse(localStorage.getItem("pixelcraft_cart")) || [];
let favorites = JSON.parse(localStorage.getItem("pixelcraft_favs")) || [];
let currentCategory = "todos";
let showOnlyFavorites = false;
let discountApplied = false;

// 3. REFERENCIAS AL DOM
const productsGrid = document.getElementById("productsGrid");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const categoryButtons = document.querySelectorAll(".cat-btn");
const cartSidebar = document.getElementById("cartSidebar");
const overlay = document.getElementById("overlay");
const cartItemsContainer = document.getElementById("cartItems");
const toast = document.getElementById("toast");

// 4. MOSTRAR NOTIFICACIONES AL USUARIO
function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

// 5. RENDERIZAR PRODUCTOS (Con filtros de categoría, búsqueda, favoritos y orden)
function renderProducts() {
    const searchTerm = searchInput.value.toLowerCase();
    const sortBy = sortSelect.value;

    // Filtrar
    let filtered = products.filter(product => {
        const matchesCat = currentCategory === "todos" || product.category === currentCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchTerm);
        const matchesFav = !showOnlyFavorites || favorites.includes(product.id);
        return matchesCat && matchesSearch && matchesFav;
    });

    // Ordenar
    if (sortBy === "price-asc") {
        filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
        filtered.sort((a, b) => b.price - a.price);
    }

    productsGrid.innerHTML = "";

    if (filtered.length === 0) {
        productsGrid.innerHTML = "<p>No se encontraron productos con esos filtros.</p>";
        return;
    }

    filtered.forEach(product => {
        const isFav = favorites.includes(product.id);
        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
            <button class="fav-btn" onclick="toggleFavorite(${product.id})">
                ${isFav ? "❤️" : "🤍"}
            </button>
            <img src="${product.image}" alt="${product.name}" class="product-img">
            <div class="product-info">
                <span class="product-category">${product.category}</span>
                <h3 class="product-title">${product.name}</h3>
                <p class="product-price">$${product.price.toLocaleString("es-AR")}</p>
                <button class="primary-btn" onclick="addToCart(${product.id})">Agregar al carrito</button>
            </div>
        `;
        productsGrid.appendChild(card);
    });
}

// 6. FUNCIONES DEL CARRITO
function addToCart(id) {
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        const product = products.find(p => p.id === id);
        cart.push({ ...product, quantity: 1 });
    }
    updateCart();
    showToast("Producto agregado al carrito 🛒");
}

function changeQuantity(id, delta) {
    const item = cart.find(item => item.id === id);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
        removeFromCart(id);
    } else {
        updateCart();
    }
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCart();
    showToast("Producto eliminado del carrito 🗑️");
}

function updateCart() {
    // Guardar en localStorage
    localStorage.setItem("pixelcraft_cart", JSON.stringify(cart));

    // Actualizar contador en el header
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById("cartCount").textContent = totalItems;

    // Dibujar items en el panel lateral
    cartItemsContainer.innerHTML = "";
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = "<p>Tu carrito está vacío.</p>";
    } else {
        cart.forEach(item => {
            const div = document.createElement("div");
            div.className = "cart-item";
            div.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>$${(item.price * item.quantity).toLocaleString("es-AR")}</p>
                    <div class="qty-controls">
                        <button onclick="changeQuantity(${item.id}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="changeQuantity(${item.id}, 1)">+</button>
                    </div>
                </div>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">🗑️</button>
            `;
            cartItemsContainer.appendChild(div);
        });
    }

    // Calcular totales y descuentos
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discount = discountApplied ? subtotal * 0.10 : 0;
    const total = subtotal - discount;

    document.getElementById("cartSubtotal").textContent = subtotal.toLocaleString("es-AR");
    document.getElementById("cartDiscount").textContent = discount.toLocaleString("es-AR");
    document.getElementById("cartTotal").textContent = total.toLocaleString("es-AR");
    document.getElementById("modalTotal").textContent = total.toLocaleString("es-AR");
    document.getElementById("discountRow").style.display = discountApplied ? "block" : "none";
}

// 7. FAVORITOS
function toggleFavorite(id) {
    if (favorites.includes(id)) {
        favorites = favorites.filter(favId => favId !== id);
        showToast("Quitado de favoritos");
    } else {
        favorites.push(id);
        showToast("Guardado en favoritos ❤️");
    }
    localStorage.setItem("pixelcraft_favs", JSON.stringify(favorites));
    document.getElementById("favCount").textContent = favorites.length;
    renderProducts();
}

// 8. EVENTOS DE INTERFAZ (Búsqueda, categorías, modo oscuro, modales)
searchInput.addEventListener("input", renderProducts);
sortSelect.addEventListener("change", renderProducts);

categoryButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        categoryButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentCategory = btn.dataset.category;
        renderProducts();
    });
});

document.getElementById("favFilterBtn").addEventListener("click", () => {
    showOnlyFavorites = !showOnlyFavorites;
    showToast(showOnlyFavorites ? "Mostrando solo favoritos" : "Mostrando todos los productos");
    renderProducts();
});

// Abrir y cerrar carrito
document.getElementById("cartBtn").addEventListener("click", () => {
    cartSidebar.classList.add("open");
    overlay.classList.add("active");
});

function closeAllPanels() {
    cartSidebar.classList.remove("open");
    document.getElementById("checkoutModal").classList.remove("active");
    overlay.classList.remove("active");
}

document.getElementById("closeCartBtn").addEventListener("click", closeAllPanels);
overlay.addEventListener("click", closeAllPanels);

// Código de descuento
document.getElementById("applyDiscountBtn").addEventListener("click", () => {
    const code = document.getElementById("discountInput").value.trim().toUpperCase();
    if (code === "DESCUENTO10") {
        discountApplied = true;
        updateCart();
        showToast("¡Descuento del 10% aplicado! 🎉");
    } else {
        showToast("Código inválido (Prueba con DESCUENTO10)");
    }
});

// Simulación de compra
document.getElementById("checkoutBtn").addEventListener("click", () => {
    if (cart.length === 0) {
        showToast("Agrega productos antes de comprar");
        return;
    }
    cartSidebar.classList.remove("open");
    document.getElementById("checkoutModal").classList.add("active");
});

document.getElementById("closeModalBtn").addEventListener("click", closeAllPanels);

document.getElementById("checkoutForm").addEventListener("submit", (e) => {
    e.preventDefault();
    cart = [];
    discountApplied = false;
    updateCart();
    closeAllPanels();
    showToast("¡Compra realizada con éxito! Gracias por tu pedido 📦");
});

// Modo oscuro
const themeToggle = document.getElementById("themeToggle");
if (localStorage.getItem("pixelcraft_theme") === "dark") {
    document.body.classList.add("dark-mode");
    themeToggle.textContent = "☀️";
}

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    themeToggle.textContent = isDark ? "☀️" : "🌙";
    localStorage.setItem("pixelcraft_theme", isDark ? "dark" : "light");
});

// Inicializar la tienda al cargar la página
document.getElementById("favCount").textContent = favorites.length;
renderProducts();
updateCart();
