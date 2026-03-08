// LUXE Store JavaScript

// Data - sync with localStorage
var products = JSON.parse(localStorage.getItem('luxe_products')) || [];
var cart = [];
var orders = JSON.parse(localStorage.getItem('luxe_orders')) || [];
var testimonials = JSON.parse(localStorage.getItem('luxe_testimonials')) || [];

var isAdmin = JSON.parse(localStorage.getItem('luxe_isAdmin')) || false;

// Sample products if empty
if (products.length === 0) {
    products = [
        { id: 1, name: "Akun Premium Netflix", price: 25000, image: "https://files.catbox.moe/3k2qjx.jpg" },
        { id: 2, name: "Akun Spotify Premium", price: 20000, image: "https://files.catbox.moe/3k2qjx.jpg" },
        { id: 3, name: "Akun YouTube Premium", price: 30000, image: "https://files.catbox.moe/3k2qjx.jpg" },
        { id: 4, name: "Akun Disney+ Hotstar", price: 15000, image: "https://files.catbox.moe/3k2qjx.jpg" },
        { id: 5, name: "Script WhatsApp Marketing", price: 50000, image: "https://files.catbox.moe/3k2qjx.jpg" },
        { id: 6, name: "Aplikasi Bug Headshot", price: 35000, image: "https://files.catbox.moe/3k2qjx.jpg" },
        { id: 7, name: "Logo Custom Premium", price: 75000, image: "https://files.catbox.moe/3k2qjx.jpg" },
        { id: 8, name: "Script Auto Followers", price: 40000, image: "https://files.catbox.moe/3k2qjx.jpg" }
    ];
    localStorage.setItem('luxe_products', JSON.stringify(products));
}

// Init
document.addEventListener('DOMContentLoaded', function() {
    renderProducts();
    renderTestimonials();
    updateCartCount();
    
    // Setup event listeners
    setupCartOverlay();
    setupModalClose();
});

// Setup cart overlay click to close
function setupCartOverlay() {
    var overlay = document.querySelector('.cart-overlay');
    if (overlay) {
        overlay.addEventListener('click', closeCart);
    }
}

// Setup modal close on background click
function setupModalClose() {
    // Payment Modal
    var paymentModal = document.getElementById('paymentModal');
    if (paymentModal) {
        paymentModal.addEventListener('click', function(e) {
            if (e.target === paymentModal) {
                closePayment();
            }
        });
    }
    
    // Success Modal
    var successModal = document.getElementById('successModal');
    if (successModal) {
        successModal.addEventListener('click', function(e) {
            if (e.target === successModal) {
                closeSuccess();
            }
        });
    }
    
    // Admin Modal
    var adminModal = document.getElementById('adminModal');
    if (adminModal) {
        adminModal.addEventListener('click', function(e) {
            if (e.target === adminModal) {
                closeAdminModal();
            }
        });
    }
    
    // Upload Modal
    var uploadModal = document.getElementById('uploadModal');
    if (uploadModal) {
        uploadModal.addEventListener('click', function(e) {
            if (e.target === uploadModal) {
                closeUpload();
            }
        });
    }
}

// =====================
// CART FUNCTIONS
// =====================

function openCart() {
    var sidebar = document.querySelector('.cart-sidebar');
    var overlay = document.querySelector('.cart-overlay');
    if(sidebar) sidebar.classList.add('active');
    if(overlay) overlay.classList.add('active');
}

function closeCart() {
    var sidebar = document.querySelector('.cart-sidebar');
    var overlay = document.querySelector('.cart-overlay');
    if(sidebar) sidebar.classList.remove('active');
    if(overlay) overlay.classList.remove('active');
}

function addToCart(id) {
    var product = products.find(function(p) { return p.id === id; });
    if (product) {
        var existing = cart.find(function(item) { return item.id === id; });
        if (existing) {
            existing.quantity++;
        } else {
            cart.push({id: product.id, name: product.name, price: product.price, image: product.image, quantity: 1});
        }
        renderCart();
        updateCartCount();
        showToast('success', 'Berhasil', product.name + ' ditambahkan ke keranjang!');
    }
}

function removeFromCart(id) {
    cart = cart.filter(function(item) { return item.id !== id; });
    renderCart();
    updateCartCount();
}

function increaseQty(id) {
    var item = cart.find(function(item) { return item.id === id; });
    if (item) {
        item.quantity++;
        renderCart();
        updateCartCount();
    }
}

function decreaseQty(id) {
    var item = cart.find(function(item) { return item.id === id; });
    if (item) {
        if (item.quantity > 1) {
            item.quantity--;
        } else {
            removeFromCart(id);
            return;
        }
        renderCart();
        updateCartCount();
    }
}

function renderCart() {
    var cartItems = document.getElementById('cartItems');
    if (!cartItems) return;
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="cart-empty"><i class="fas fa-shopping-bag"></i><p>Keranjang kosong</p></div>';
    } else {
        cartItems.innerHTML = cart.map(function(item) {
            return '<div class="cart-item">' +
                '<img src="' + item.image + '" alt="' + item.name + '">' +
                '<div class="cart-item-info">' +
                '<h4>' + item.name + '</h4>' +
                '<p class="price">' + formatPrice(item.price) + '</p>' +
                '<div class="cart-item-qty">' +
                '<button onclick="decreaseQty(' + item.id + ')" class="qty-btn"><i class="fas fa-minus"></i></button>' +
                '<span>' + item.quantity + '</span>' +
                '<button onclick="increaseQty(' + item.id + ')" class="qty-btn"><i class="fas fa-plus"></i></button>' +
                '</div>' +
                '</div>' +
                '<button onclick="removeFromCart(' + item.id + ')" class="remove-btn"><i class="fas fa-trash"></i></button>' +
                '</div>';
        }).join('');
    }
    
    var total = cart.reduce(function(sum, item) { return sum + (item.price * item.quantity); }, 0);
    var totalEl = document.getElementById('cartTotal');
    if(totalEl) totalEl.textContent = formatPrice(total);
}

function updateCartCount() {
    var count = cart.reduce(function(sum, item) { return sum + item.quantity; }, 0);
    var countEl = document.getElementById('cartCount');
    if(countEl) countEl.textContent = count;
}

// =====================
// CHECKOUT & PAYMENT
// =====================

function checkout() {
    if (cart.length === 0) {
        showToast('error', 'Error', 'Keranjang kosong! Tambahkan produk terlebih dahulu.');
        return;
    }
    
    var total = cart.reduce(function(sum, item) { return sum + (item.price * item.quantity); }, 0);
    var payTotal = document.getElementById('payTotal');
    if(payTotal) payTotal.textContent = formatPrice(total);
    
    var paymentModal = document.getElementById('paymentModal');
    if(paymentModal) paymentModal.classList.add('active');
}

function processPayment() {
    var customerName = document.getElementById('customerName');
    if (!customerName || !customerName.value.trim()) {
        showToast('error', 'Error', 'Masukkan nama Anda!');
        return;
    }
    
    var total = cart.reduce(function(sum, item) { return sum + (item.price * item.quantity); }, 0);
    var orderId = 'ORD' + Date.now();
    var itemsSummary = cart.map(function(item) { return item.name + ' (x' + item.quantity + ')'; }).join(', ');
    
    var orderData = {
        orderId: orderId,
        customerName: customerName.value.trim(),
        itemsSummary: itemsSummary,
        total: total,
        status: 'pending',
        date: new Date().toISOString()
    };
    
    orders.push(orderData);
    localStorage.setItem('luxe_orders', JSON.stringify(orders));
    
    // Create WhatsApp message
    var waMsg = '*PESANAN BARU - LUXE Store*%0A%0A' +
        'Order ID: ' + orderId + '%0A' +
        'Nama: ' + customerName.value.trim() + '%0A' +
        'Total: ' + formatPrice(total) + '%0A' +
        'Produk: ' + itemsSummary + '%0A%0A' +
        'Mohon tunggu konfirmasi dari admin.';
    
    window.open('https://wa.me/6287881538701?text=' + waMsg, '_blank');
    
    // Clear cart
    cart = [];
    renderCart();
    updateCartCount();
    closePayment();
    
    // Show success
    var successOrderId = document.getElementById('successOrderId');
    if(successOrderId) successOrderId.textContent = orderId;
    var successModal = document.getElementById('successModal');
    if(successModal) successModal.classList.add('active');
    
    showToast('success', 'Pesanan Dikirim', 'Silakan kirim bukti transfer via WhatsApp!');
}

function closePayment() {
    var paymentModal = document.getElementById('paymentModal');
    if(paymentModal) paymentModal.classList.remove('active');
    var customerName = document.getElementById('customerName');
    if(customerName) customerName.value = '';
}

function closeSuccess() {
    var successModal = document.getElementById('successModal');
    if(successModal) successModal.classList.remove('active');
}

// =====================
// ADMIN FUNCTIONS
// =====================

function openAdmin() {
    if (isAdmin) {
        window.location.href = 'dashboard.html';
    } else {
        var adminModal = document.getElementById('adminModal');
        if(adminModal) adminModal.classList.add('active');
    }
}

function closeAdminModal() {
    var adminModal = document.getElementById('adminModal');
    if(adminModal) adminModal.classList.remove('active');
    var username = document.getElementById('adminUsername');
    var password = document.getElementById('adminPassword');
    if(username) username.value = '';
    if(password) password.value = '';
}

function loginAdmin() {
    var username = document.getElementById('adminUsername');
    var password = document.getElementById('adminPassword');
    
    if (username && password && username.value === 'admin' && password.value === 'admin123') {
        isAdmin = true;
        localStorage.setItem('luxe_isAdmin', JSON.stringify(isAdmin));
        closeAdminModal();
        showToast('success', 'Login Berhasil', 'Selamat datang Admin!');
        setTimeout(function() {
            window.location.href = 'dashboard.html';
        }, 1000);
    } else {
        showToast('error', 'Login Gagal', 'Username/password salah!');
    }
}

function logoutAdmin() {
    isAdmin = false;
    localStorage.setItem('luxe_isAdmin', JSON.stringify(isAdmin));
    showToast('info', 'Logout', 'Anda telah logout');
    window.location.href = 'index.html';
}

// =====================
// PRODUCT FUNCTIONS
// =====================

function addProduct() {
    var nameEl = document.getElementById('productName');
    var priceEl = document.getElementById('productPrice');
    var descEl = document.getElementById('productDesc');
    var imageUrlEl = document.getElementById('productImage');
    var imageFileEl = document.getElementById('productImageFile');
    
    if (!nameEl || !priceEl || !nameEl.value || !priceEl.value) {
        showToast('error', 'Error', 'Masukkan nama dan harga produk!');
        return;
    }
    
    var finalImage = 'https://via.placeholder.com/300x300?text=' + encodeURIComponent(nameEl.value);
    var productDesc = descEl ? descEl.value : '';
    
    // Check if URL is provided
    if (imageUrlEl && imageUrlEl.value && imageUrlEl.value.trim() !== '') {
        finalImage = imageUrlEl.value.trim();
    }
    
    // Check if file is uploaded
    if (imageFileEl && imageFileEl.files && imageFileEl.files[0]) {
        var file = imageFileEl.files[0];
        finalImage = URL.createObjectURL(file);
    }
    
    products.push({
        id: products.length + 1, 
        name: nameEl.value, 
        price: parseInt(priceEl.value),
        description: productDesc,
        image: finalImage
    });
    
    localStorage.setItem('luxe_products', JSON.stringify(products));
    renderProducts();
    closeUpload();
    showToast('success', 'Berhasil', 'Produk ditambahkan!');
    
    // Clear inputs
    if(nameEl) nameEl.value = '';
    if(priceEl) priceEl.value = '';
    if(descEl) descEl.value = '';
    if(imageUrlEl) imageUrlEl.value = '';
    if(imageFileEl) imageFileEl.value = '';
}

function renderProducts() {
    var grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    if (products.length === 0) {
        grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px 20px;"><i class="fas fa-box-open" style="font-size:48px;color:var(--text-muted);margin-bottom:20px;"></i><h3 style="font-size:24px;margin-bottom:10px;">Belum Ada Produk</h3><p style="color:var(--text-secondary);">Silakan hubungi admin untuk menambahkan produk</p></div>';
        return;
    }
    
    grid.innerHTML = products.map(function(p) {
        return '<div class="product-card">' +
            '<div class="product-image">' +
            '<img src="' + p.image + '" alt="' + p.name + '">' +
            '</div>' +
            '<div class="product-info">' +
            '<h3 class="product-name">' + p.name + '</h3>' +
            '<div class="product-price">' +
            '<span class="current-price">' + formatPrice(p.price) + '</span>' +
            '</div>' +
            '<button class="add-to-cart-btn" onclick="addToCart(' + p.id + ')">' +
            '<i class="fas fa-shopping-bag"></i> Tambah ke Keranjang' +
            '</button>' +
            '</div>' +
            '</div>';
    }).join('');
}

// =====================
// TESTIMONIALS
// =====================

function renderTestimonials() {
    var grid = document.getElementById('testimonialsGrid');
    if (!grid) return;
    
    if (testimonials.length === 0) {
        grid.innerHTML = '<p style="text-align:center;color:var(--text-muted);">Belum ada testimoni</p>';
        return;
    }
    
    grid.innerHTML = testimonials.map(function(t) {
        return '<div class="testimonial-card">' +
            '<div class="testimonial-header">' +
            '<div class="testimonial-avatar">' + t.name.charAt(0) + '</div>' +
            '<div class="testimonial-info"><h4>' + t.name + '</h4>' +
            '<div class="stars">' + '★'.repeat(t.rating) + '</div></div>' +
            '</div>' +
            '<p class="testimonial-comment">' + t.comment + '</p>' +
            '</div>';
    }).join('');
}

// =====================
// UPLOAD MODAL
// =====================

function closeUpload() {
    var uploadModal = document.getElementById('uploadModal');
    if(uploadModal) {
        uploadModal.classList.remove('active');
    }
}

function showUploadModal() {
    var uploadModal = document.getElementById('uploadModal');
    if(uploadModal) {
        uploadModal.classList.add('active');
    }
}

// =====================
// HELPERS
// =====================

function formatPrice(price) {
    return 'Rp ' + price.toLocaleString('id-ID');
}

function showToast(type, title, message) {
    var container = document.getElementById('toastContainer');
    if (!container) return;
    
    var toast = document.createElement('div');
    toast.className = 'toast ' + type;
    
    var icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    if (type === 'error') icon = 'fa-times-circle';
    
    toast.innerHTML = '<i class="fas ' + icon + '"></i>' +
        '<div><h4>' + title + '</h4><p>' + message + '</p></div>';
    container.appendChild(toast);
    
    setTimeout(function() { toast.classList.add('show'); }, 10);
    setTimeout(function() { 
        toast.classList.remove('show'); 
        setTimeout(function() { toast.remove(); }, 300); 
    }, 3000);
}

