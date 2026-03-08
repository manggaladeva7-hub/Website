// =====================================================
// LUXE - Premium E-Commerce Website JavaScript
// =====================================================

// Products Data - Starts Empty for You to Fill
let products = [];

// Cart Data
let cart = [];

// Orders Data - Stored in localStorage
let orders = JSON.parse(localStorage.getItem('luxe_orders')) || [];

// Testimonials Data - Stored in localStorage
let testimonials = JSON.parse(localStorage.getItem('luxe_testimonials')) || [
    {
        id: 1,
        name: "Ahmad Wijaya",
        rating: 5,
        comment: "Seller responsif dan produk berkualitas! Sangat recommend.",
        date: "2024-01-15"
    },
    {
        id: 2,
        name: "Siti Nurhaliza",
        rating: 5,
        comment: "Pembelian mudah, proses cepat. Terima kasih LUXE Store!",
        date: "2024-01-10"
    },
    {
        id: 3,
        name: "Budi Santoso",
        rating: 4,
        comment: "Produk sesuai deskripsi, packing rapih. Will buy again!",
        date: "2024-01-05"
    }
];

// Admin State
let isAdmin = false;
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

// Payment Configuration - DANA & Telegram Server
const PAYMENT_CONFIG = {
    danaNumber: '6287881538701',
    qrImageUrl: 'https://files.catbox.moe/239o0t.jpeg',
    // Ganti dengan URL server Node.js Anda
    apiUrl: 'https://your-server-url.com'
};

// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
    // Initialize
    initLoader();
    initNavbar();
    initSearch();
    initCart();
    initPayment();
    initAdmin();
    initUploadModal();
    initQuickView();
    initNewsletter();
    initProductFilter();
    renderProducts(products);
    renderTestimonials();
    animateStats();
});

// =====================================================
// LOADER
// =====================================================
function initLoader() {
    const loader = document.getElementById('loader');
    setTimeout(() => {
        loader.classList.add('hidden');
    }, 2000);
}

// =====================================================
// NAVBAR
// =====================================================
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });
}

// =====================================================
// PAYMENT - QRIS DANA
// =====================================================
function initPayment() {
    const checkoutBtn = document.getElementById('checkoutBtn');
    const paymentModal = document.getElementById('paymentModal');
    const paymentModalClose = document.getElementById('paymentModalClose');
    const paymentForm = document.getElementById('paymentForm');
    
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length > 0) {
                showPaymentModal();
            } else {
                showToast('error', 'Checkout', 'Keranjang Anda kosong!');
            }
        });
    }
    
    if (paymentModalClose) {
        paymentModalClose.addEventListener('click', closePaymentModal);
    }
    
    if (paymentForm) {
        paymentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            processPayment();
        });
    }
}

function showPaymentModal() {
    const paymentModal = document.getElementById('paymentModal');
    const paymentContent = paymentModal.querySelector('.payment-content');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Generate random order ID
    const orderId = 'ORD' + Date.now();
    
    paymentContent.innerHTML = `
        <div class="payment-header">
            <h3><i class="fas fa-qrcode"></i> Pembayaran QRIS</h3>
            <p class="order-id">Order ID: ${orderId}</p>
        </div>
        
        <div class="payment-amount">
            <span class="label">Total Pembayaran</span>
            <span class="amount">${formatPrice(total)}</span>
        </div>
        
        <div class="payment-qr-section">
            <p class="payment-info">Scan QRIS ini dengan aplikasi DANA / Bank Anda</p>
            <div class="qr-image-container">
                <img src="${PAYMENT_CONFIG.qrImageUrl}" alt="QRIS Payment" class="qris-image">
            </div>
            <p class="dana-number">atau transfer ke DANA: <strong>${PAYMENT_CONFIG.danaNumber}</strong></p>
        </div>
        
        <div class="payment-form-section">
            <div class="form-group">
                <label for="customerName">Nama Pembeli</label>
                <input type="text" id="customerName" placeholder="Masukkan nama Anda" required>
            </div>
            <div class="form-group">
                <label for="paymentProof">Bukti Transfer (Opsional)</label>
                <input type="file" id="paymentProof" accept="image/*">
            </div>
            <div class="form-group">
                <label for="customerNote">Catatan (Opsional)</label>
                <textarea id="customerNote" placeholder="Tambahkan catatan..." rows="2"></textarea>
            </div>
        
        <div class="payment-actions">
            <button type="button" class="btn-cancel" onclick="closePaymentModal()">Batal</button>
            <button type="submit" class="btn-submit" form="paymentForm">
                <i class="fas fa-check"></i> Konfirmasi Pembayaran
            </button>
        </div>
    `;
    
    paymentModal.classList.add('active');
}

function closePaymentModal() {
    const paymentModal = document.getElementById('paymentModal');
    paymentModal.classList.remove('active');
}

function processPayment() {
    const customerName = document.getElementById('customerName').value;
    const customerNote = document.getElementById('customerNote').value;
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const orderId = 'ORD' + Date.now();
    
    // Get cart items summary
    const itemsSummary = cart.map(item => `${item.name} (x${item.quantity})`).join(', ');
    
    // Save order to localStorage
    const orderData = {
        orderId: orderId,
        customerName: customerName,
        itemsSummary: itemsSummary,
        total: total,
        note: customerNote,
        status: 'pending',
        date: new Date().toISOString()
    };
    saveOrder(orderData);
    
    // Create WhatsApp message
    const whatsappMessage = `*PESANAN BARU - LUXE Store*%0A%0A` +
        `*Order ID:* ${orderId}%0A` +
        `*Nama Pembeli:* ${customerName}%0A` +
        `*Total:* ${formatPrice(total)}%0A` +
        `*Produk:* ${itemsSummary}%0A` +
        `*Catatan:* ${customerNote || '-'}%0A%0A` +
        `Pembayaran via QRIS DANA`;
    
    // Open WhatsApp with message
    const whatsappUrl = `https://wa.me/6287881538701?text=${whatsappMessage}`;
    window.open(whatsappUrl, '_blank');
    
    // Clear cart and show success
    cart = [];
    renderCart();
    closePaymentModal();
    closeCart();
    
    // Show success modal
    showSuccessModal(orderId);
}

function closeCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');
    if (cartSidebar) cartSidebar.classList.remove('active');
    if (cartOverlay) cartOverlay.classList.remove('active');
}

// =====================================================
// SEARCH
// =====================================================
function initSearch() {
    const searchBtn = document.getElementById('searchBtn');
    const searchBar = document.getElementById('searchBar');
    const searchInput = document.getElementById('searchInput');
    const searchSubmit = document.querySelector('.search-submit');
    
    if (searchBtn && searchBar) {
        searchBtn.addEventListener('click', () => {
            searchBar.classList.toggle('active');
            if (searchBar.classList.contains('active') && searchInput) {
                searchInput.focus();
            }
        });
    }
    
    if (searchSubmit) {
        searchSubmit.addEventListener('click', performSearch);
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
    
    function performSearch() {
        const query = searchInput.value.toLowerCase().trim();
        if (query) {
            const filtered = products.filter(p => 
                p.name.toLowerCase().includes(query) || 
                p.category.toLowerCase().includes(query)
            );
            renderProducts(filtered);
            document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
            searchBar.classList.remove('active');
            searchInput.value = '';
            
            if (filtered.length === 0) {
                showToast('info', 'Pencarian', 'Tidak ada produk yang ditemukan');
            }
        }
    }
}

// =====================================================
// CART
// =====================================================
function initCart() {
    const cartBtn = document.getElementById('cartBtn');
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartClose = document.getElementById('cartClose');
    
    if (cartBtn) {
        cartBtn.addEventListener('click', () => {
            cartSidebar.classList.add('active');
            cartOverlay.classList.add('active');
        });
    }
    
    if (cartClose) {
        cartClose.addEventListener('click', closeCartFunc);
    }
    
    if (cartOverlay) {
        cartOverlay.addEventListener('click', closeCartFunc);
    }
    
    function closeCartFunc() {
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
    }
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        const existingItem = cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        
        renderCart();
        showToast('success', 'Keranjang', `${product.name} ditambahkan ke keranjang!`);
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    renderCart();
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            renderCart();
        }
    }
}

function renderCart() {
    const cartItems = document.getElementById('cartItems');
    const cartCount = document.getElementById('cartCount');
    const cartTotal = document.getElementById('cartTotal');
    
    if (cartCount) {
        cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    }
    
    if (!cartItems) return;
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="cart-empty">
                <i class="fas fa-shopping-bag"></i>
                <p>Keranjang Anda kosong</p>
            </div>
        `;
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${formatPrice(item.price)}</div>
                    <div class="cart-item-qty">
                        <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                <button class="cart-item-remove" onclick="removeFromCart(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
    }
    
    if (cartTotal) {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = formatPrice(total);
    }
}

// =====================================================
// ADMIN LOGIN
// =====================================================
function initAdmin() {
    const adminBtn = document.getElementById('adminBtn');
    const adminModal = document.getElementById('adminModal');
    const adminModalClose = document.getElementById('adminModalClose');
    const adminCancel = document.getElementById('adminCancel');
    const adminLoginForm = document.getElementById('adminLoginForm');
    
    if (adminBtn) {
        adminBtn.addEventListener('click', () => {
            if (isAdmin) {
                if (confirm('Apakah Anda ingin logout dari mode admin?')) {
                    logoutAdmin();
                }
            } else if (adminModal) {
                adminModal.classList.add('active');
            }
        });
    }
    
    function closeAdminModal() {
        if (adminModal) {
            adminModal.classList.remove('active');
        }
        if (adminLoginForm) {
            adminLoginForm.reset();
        }
    }
    
    if (adminModalClose) {
        adminModalClose.addEventListener('click', closeAdminModal);
    }
    if (adminCancel) {
        adminCancel.addEventListener('click', closeAdminModal);
    }
    if (adminModal) {
        adminModal.addEventListener('click', (e) => {
            if (e.target === adminModal) closeAdminModal();
        });
    }
    
if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const username = document.getElementById('adminUsername').value;
            const password = document.getElementById('adminPassword').value;
            
            if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
                isAdmin = true;
                closeAdminModal();
                showUploadButton();
                showOrdersButton();
                showToast('success', 'Login Berhasil', 'Selamat datang, Admin!');
                if (adminBtn) adminBtn.classList.add('active');
            } else {
                showToast('error', 'Login Gagal', 'Username atau password salah!');
            }
        });
    }
}

function showUploadButton() {
    const uploadBtn = document.getElementById('uploadBtn');
    if (uploadBtn) {
        uploadBtn.style.display = 'flex';
    }
}

function logoutAdmin() {
    isAdmin = false;
    const uploadBtn = document.getElementById('uploadBtn');
    const adminBtn = document.getElementById('adminBtn');
    if (uploadBtn) uploadBtn.style.display = 'none';
    if (adminBtn) adminBtn.classList.remove('active');
    showToast('info', 'Logout', 'Anda telah logout dari mode admin');
}

// =====================================================
// UPLOAD PRODUCT MODAL
// =====================================================
function initUploadModal() {
    const uploadBtn = document.getElementById('uploadBtn');
    const uploadModal = document.getElementById('uploadModal');
    const modalClose = document.getElementById('modalClose');
    const cancelUpload = document.getElementById('cancelUpload');
    const uploadForm = document.getElementById('uploadForm');
    
    if (uploadBtn) {
        uploadBtn.addEventListener('click', () => {
            if (!isAdmin) {
                showToast('error', 'Akses Ditolak', 'Silakan login sebagai admin terlebih dahulu!');
                return;
            }
            if (uploadModal) uploadModal.classList.add('active');
        });
    }
    
    function closeModal() {
        if (uploadModal) uploadModal.classList.remove('active');
        if (uploadForm) uploadForm.reset();
    }
    
    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (cancelUpload) cancelUpload.addEventListener('click', closeModal);
    if (uploadModal) {
        uploadModal.addEventListener('click', (e) => {
            if (e.target === uploadModal) closeModal();
        });
    }
    
    // Form submission
    if (uploadForm) {
        uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('productName').value;
            const category = document.getElementById('productCategory').value;
            const price = parseInt(document.getElementById('productPrice').value);
            const description = document.getElementById('productDesc').value;
            
            let imageUrl = 'https://via.placeholder.com/600x400?text=Product';
            
            // Try to get image from preview
            const previewImg = document.getElementById('previewImg');
            if (previewImg && previewImg.src) {
                imageUrl = previewImg.src;
            }
            
            createProduct(name, category, price, description, imageUrl);
        });
    }
}

function createProduct(name, category, price, description, imageUrl) {
    const newProduct = {
        id: products.length + 1,
        name: name,
        category: category,
        price: price,
        originalPrice: Math.round(price * 1.2),
        image: imageUrl,
        rating: 5.0,
        reviews: 0,
        badge: "Baru",
        description: description
    };
    
    products.unshift(newProduct);
    renderProducts(products);
    
    const uploadModal = document.getElementById('uploadModal');
    if (uploadModal) uploadModal.classList.remove('active');
    
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) uploadForm.reset();
    
    showToast('success', 'Berhasil', 'Produk baru berhasil ditambahkan!');
    
    const productsSection = document.getElementById('products');
    if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// =====================================================
// QUICK VIEW
// =====================================================
function initQuickView() {
    const quickViewModal = document.getElementById('quickViewModal');
    const quickViewClose = document.getElementById('quickViewClose');
    
    if (quickViewClose) {
        quickViewClose.addEventListener('click', () => {
            if (quickViewModal) quickViewModal.classList.remove('active');
        });
    }
    
    if (quickViewModal) {
        quickViewModal.addEventListener('click', (e) => {
            if (e.target === quickViewModal) {
                quickViewModal.classList.remove('active');
            }
        });
    }
}

function openQuickView(productId) {
    const product = products.find(p => p.id === productId);
    const quickViewModal = document.getElementById('quickViewModal');
    const quickViewContent = document.getElementById('quickViewContent');
    
    if (product && quickViewContent) {
        quickViewContent.innerHTML = `
            <div class="quick-view-image">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="quick-view-info">
                <span class="product-category">${product.category}</span>
                <h2>${product.name}</h2>
                <div class="quick-view-price">
                    ${formatPrice(product.price)}
                    ${product.originalPrice ? `<span class="original-price">${formatPrice(product.originalPrice)}</span>` : ''}
                </div>
                <div class="product-rating">
                    <div class="stars">${renderStars(product.rating)}</div>
                    <span class="rating-count">(${product.reviews} reviews)</span>
                </div>
                <p class="quick-view-desc">${product.description}</p>
                <div class="quick-view-actions">
                    <div class="quantity-selector">
                        <button onclick="decreaseQty()"><i class="fas fa-minus"></i></button>
                        <span id="qvQty">1</span>
                        <button onclick="increaseQty()"><i class="fas fa-plus"></i></button>
                    </div>
                    <button class="btn-primary" onclick="addToCartAndClose(${product.id})">
                        <span>Tambah ke Keranjang</span>
                        <i class="fas fa-shopping-bag"></i>
                    </button>
                </div>
        `;
        
        if (quickViewModal) quickViewModal.classList.add('active');
    }
}

function increaseQty() {
    const qty = document.getElementById('qvQty');
    if (qty) qty.textContent = parseInt(qty.textContent) + 1;
}

function decreaseQty() {
    const qty = document.getElementById('qvQty');
    if (qty && parseInt(qty.textContent) > 1) {
        qty.textContent = parseInt(qty.textContent) - 1;
    }
}

function addToCartAndClose(productId) {
    const qty = document.getElementById('qvQty');
    const quantity = qty ? parseInt(qty.textContent) : 1;
    
    for (let i = 0; i < quantity; i++) {
        addToCart(productId);
    }
    
    const quickViewModal = document.getElementById('quickViewModal');
    if (quickViewModal) quickViewModal.classList.remove('active');
}

// =====================================================
// PRODUCTS RENDER
// =====================================================
function renderProducts(productsData) {
    const productsGrid = document.getElementById('productsGrid');
    
    if (!productsGrid) return;
    
    if (productsData.length === 0) {
        productsGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 80px 20px;">
                <i class="fas fa-plus-circle" style="font-size: 60px; color: #ccc; margin-bottom: 20px;"></i>
                <h3 style="color: #888; font-size: 24px; margin-bottom: 10px;">Belum Ada Produk</h3>
                <p style="color: #aaa; font-size: 16px;">Login sebagai admin untuk menambahkan produk pertama Anda!</p>
                <p style="color: #aaa; font-size: 14px; margin-top: 10px;">Klik icon shield (🛡️) di navbar untuk login</p>
            </div>
        `;
        return;
    }
    
    productsGrid.innerHTML = productsData.map(product => `
        <div class="product-card" data-category="${product.category}">
            <div class="product-image" onclick="openQuickView(${product.id})" style="cursor: pointer;">
                <img src="${product.image}" alt="${product.name}">
                ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
                <div class="product-actions">
                    <button class="product-action-btn" onclick="event.stopPropagation(); openQuickView(${product.id})" title="Quick View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="product-action-btn" onclick="event.stopPropagation(); addToCart(${product.id})" title="Add to Cart">
                        <i class="fas fa-shopping-bag"></i>
                    </button>
                </div>
            <div class="product-info">
                <span class="product-category">${product.category}</span>
                <h3 class="product-name">${product.name}</h3>
                <div class="product-price">
                    <span class="current-price">${formatPrice(product.price)}</span>
                    ${product.originalPrice ? `<span class="original-price">${formatPrice(product.originalPrice)}</span>` : ''}
                </div>
                <div class="product-rating">
                    <div class="stars">${renderStars(product.rating)}</div>
                    <span class="rating-count">(${product.reviews})</span>
                </div>
                <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                    <i class="fas fa-shopping-bag"></i>
                    <span>Tambah ke Keranjang</span>
                </button>
            </div>
    `).join('');
}

// =====================================================
// PRODUCT FILTER
// =====================================================
function initProductFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.dataset.filter;
            
            if (filter === 'all') {
                renderProducts(products);
            } else {
                const filtered = products.filter(p => p.category === filter);
                renderProducts(filtered);
            }
        });
    });
    
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            showToast('info', 'Load More', 'Menampilkan semua produk!');
        });
    }
}

// =====================================================
// NEWSLETTER
// =====================================================
function initNewsletter() {
    const newsletterForm = document.getElementById('newsletterForm');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = newsletterForm.querySelector('input').value;
            
            if (email) {
                showToast('success', 'Berhasil', 'Terima kasih telah berlangganan!');
                newsletterForm.reset();
            }
        });
    }
}

// =====================================================
// ANIMATE STATS
// =====================================================
function animateStats() {
    const stats = document.querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const count = parseInt(target.dataset.count);
                animateCount(target, 0, count, 2000);
                observer.unobserve(target);
            }
        });
    });
    
    stats.forEach(stat => observer.observe(stat));
}

function animateCount(element, start, end, duration) {
    let startTime = null;
    
    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const current = Math.floor(progress * (end - start) + start);
        element.textContent = current + (element.dataset.suffix || '+');
        
        if (progress < 1) {
            requestAnimationFrame(step);
        }
    }
    
    requestAnimationFrame(step);
}

// =====================================================
// TOAST NOTIFICATION
// =====================================================
function showToast(type, title, message) {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = '';
    switch(type) {
        case 'success': icon = '<i class="fas fa-check-circle"></i>'; break;
        case 'error': icon = '<i class="fas fa-times-circle"></i>'; break;
        case 'info': icon = '<i class="fas fa-info-circle"></i>'; break;
    }
    
    toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-content">
            <h4>${title}</h4>
            <p>${message}</p>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================
function formatPrice(price) {
    return 'Rp ' + price.toLocaleString('id-ID');
}

function renderStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    if (hasHalf) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    
    return stars;
}

// =====================================================
// SUCCESS PAYMENT & ORDERS MANAGEMENT
// =====================================================

function showSuccessModal(orderId) {
    const successModal = document.getElementById('successModal');
    const successOrderId = document.getElementById('successOrderId');
    const telegramBtn = document.getElementById('telegramBtn');
    
    if (successOrderId) {
        successOrderId.textContent = orderId;
    }
    
    // Get the order data and send Telegram notification
    const order = orders.find(o => o.orderId === orderId);
    if (order) {
        sendToTelegram(order.orderId, order.customerName, order.itemsSummary, order.total, order.note);
        
        // Update Telegram button link
        if (telegramBtn) {
            const chatId = PAYMENT_CONFIG.telegramAdminChatId.replace('@', '');
            const message = `Hai admin, saya ${order.customerName} ingin mengirim bukti transfer untuk order ${orderId}. Mohon ditunggu!`;
            telegramBtn.href = `https://t.me/${chatId}?text=${encodeURIComponent(message)}`;
        }
    }
    
    if (successModal) {
        successModal.classList.add('active');
    }
}

function closeSuccessModal() {
    const successModal = document.getElementById('successModal');
    if (successModal) {
        successModal.classList.remove('active');
    }
}

function saveOrder(orderData) {
    orders.push(orderData);
    localStorage.setItem('luxe_orders', JSON.stringify(orders));
}

function showOrdersModal() {
    if (!isAdmin) {
        showToast('error', 'Akses Ditolak', 'Silakan login sebagai admin!');
        return;
    }
    
    const ordersModal = document.getElementById('ordersModal');
    const ordersList = document.getElementById('ordersList');
    
    if (!ordersModal || !ordersList) return;
    
    if (orders.length === 0) {
        ordersList.innerHTML = `
            <div class="no-orders">
                <i class="fas fa-shopping-bag"></i>
                <h3>Belum Ada Pesanan</h3>
                <p>Pesanan akan muncul di sini setelah customer melakukan checkout.</p>
            </div>
        `;
    } else {
        ordersList.innerHTML = orders.map(order => `
            <div class="order-item">
                <div class="order-header">
                    <span class="order-id-badge">${order.orderId}</span>
                    <span class="order-status ${order.status}">${getStatusLabel(order.status)}</span>
                </div>
                <div class="order-customer">
                    <i class="fas fa-user"></i> ${order.customerName}
                </div>
                <div class="order-products">
                    <i class="fas fa-box"></i> ${order.itemsSummary}
                </div>
                <div class="order-total">
                    Total: ${formatPrice(order.total)}
                </div>
                <div class="order-actions">
                    ${order.status === 'pending' ? 
                        `<button class="btn-confirm" onclick="updateOrderStatus('${order.orderId}', 'confirmed')">
                            <i class="fas fa-check"></i> Konfirmasi
                        </button>` : ''}
                    ${order.status === 'confirmed' ? 
                        `<button class="btn-complete" onclick="updateOrderStatus('${order.orderId}', 'completed')">
                            <i class="fas fa-check-double"></i> Selesai
                        </button>` : ''}
                </div>
            </div>
        `).join('');
    }
    
    ordersModal.classList.add('active');
}

function getStatusLabel(status) {
    switch(status) {
        case 'pending': return 'Menunggu';
        case 'confirmed': return 'Dikonfirmasi';
        case 'completed': return 'Selesai';
        default: return status;
    }
}

function updateOrderStatus(orderId, newStatus) {
    const orderIndex = orders.findIndex(o => o.orderId === orderId);
    if (orderIndex !== -1) {
        orders[orderIndex].status = newStatus;
        localStorage.setItem('luxe_orders', JSON.stringify(orders));
        showOrdersModal();
        showToast('success', 'Status Diupdate', `Pesanan ${orderId} status: ${getStatusLabel(newStatus)}`);
        
        // Auto-add to testimonials when order is completed
        if (newStatus === 'completed') {
            const order = orders[orderIndex];
            addToTestimonials(order.customerName, order.itemsSummary);
        }
    }
}

// =====================================================
// TESTIMONIALS MANAGEMENT
// =====================================================
function addToTestimonials(customerName, productsPurchased) {
    const newTestimonial = {
        id: testimonials.length + 1,
        name: customerName,
        rating: 5,
        comment: `Terima kasih! Pembelian ${productsPurchased} - Sangat memuaskan!`,
        date: new Date().toISOString().split('T')[0]
    };
    
    testimonials.unshift(newTestimonial);
    localStorage.setItem('luxe_testimonials', JSON.stringify(testimonials));
    showToast('success', 'Testimoni Ditambahkan', `${customerName} ditambahkan ke testimoni!`);
    
    // Refresh testimonials display if on page
    if (document.getElementById('testimonialsGrid')) {
        renderTestimonials();
    }
}

function renderTestimonials() {
    const testimonialsGrid = document.getElementById('testimonialsGrid');
    if (!testimonialsGrid) return;
    
    testimonialsGrid.innerHTML = testimonials.map(testimonial => `
        <div class="testimonial-card">
            <div class="testimonial-header">
                <div class="testimonial-avatar">
                    ${testimonial.name.charAt(0).toUpperCase()}
                </div>
                <div class="testimonial-info">
                    <h4>${testimonial.name}</h4>
                    <div class="testimonial-rating">
                        ${renderStars(testimonial.rating)}
                    </div>
                </div>
                <span class="testimonial-date">${formatDate(testimonial.date)}</span>
            </div>
            <p class="testimonial-comment">${testimonial.comment}</p>
        </div>
    `).join('');
}

function formatDate(dateStr) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('id-ID', options);
}

// Add orders button to admin after login
function showOrdersButton() {
    const navActions = document.querySelector('.nav-actions');
    if (navActions && !document.getElementById('ordersBtn')) {
        const ordersBtn = document.createElement('button');
        ordersBtn.className = 'orders-btn';
        ordersBtn.id = 'ordersBtn';
        ordersBtn.innerHTML = '<i class="fas fa-clipboard-list"></i>';
        ordersBtn.title = 'Lihat Pesanan';
        ordersBtn.onclick = showOrdersModal;
        
        const style = document.createElement('style');
        style.textContent = `
            .orders-btn {
                width: 44px;
                height: 44px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                color: var(--primary);
                transition: var(--transition);
            }
            .orders-btn:hover {
                background: var(--light-gray);
                color: var(--accent);
            }
        `;
        document.head.appendChild(style);
        navActions.appendChild(ordersBtn);
    }
}

// =====================================================
// TELEGRAM BOT INTEGRATION
// =====================================================

// Function to send message to Telegram
async function sendToTelegram(orderId, customerName, itemsSummary, total, customerNote) {
    const token = PAYMENT_CONFIG.telegramBotToken;
    const chatId = PAYMENT_CONFIG.telegramAdminChatId;
    
    if (!token || !chatId || token === 'YOUR_TELEGRAM_BOT_TOKEN') {
        console.log('Telegram bot not configured. Skipping notification.');
        return false;
    }
    
    const message = `*PEMBAYARAN BARU - LUXE STORE*%0A%0A` +
        `📋 *Order ID:* ${orderId}%0A` +
        `👤 *Nama:* ${customerName}%0A` +
        `💰 *Total:* Rp ${total.toLocaleString('id-ID')}%0A` +
        `📦 *Produk:* ${itemsSummary}%0A` +
        `📝 *Catatan:* ${customerNote || '-'}%0A%0A` +
        `⏰ Waktu: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`;
    
    const url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${message}&parse_mode=Markdown`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.ok;
    } catch (error) {
        console.error('Telegram notification error:', error);
        return false;
    }
}

// Function to send photo proof to Telegram
async function sendPaymentProofToTelegram(orderId, customerName, fileInput) {
    const token = PAYMENT_CONFIG.telegramBotToken;
    const chatId = PAYMENT_CONFIG.telegramAdminChatId;
    
    if (!token || !chatId || token === 'YOUR_TELEGRAM_BOT_TOKEN') {
        showToast('info', 'Telegram', 'Bot Telegram belum dikonfigurasi. Silakan hubungi admin via WhatsApp!');
        return false;
    }
    
    if (!fileInput || !fileInput.files || !fileInput.files[0]) {
        showToast('error', 'Bukti Transfer', 'Silakan pilih file bukti transfer terlebih dahulu!');
        return false;
    }
    
    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('caption', `*BUKTI TRANSFER - Order ${orderId}*\n👤 Customer: ${customerName}\n⏰ ${new Date().toLocaleString('id-ID')}`);
    formData.append('parse_mode', 'Markdown');
    
    try {
        const response = await fetch(`https://api.telegram.org/bot${token}/sendPhoto?chat_id=${chatId}`, {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        
        if (data.ok) {
            showToast('success', 'Berhasil', 'Bukti transfer terkirim ke admin!');
            return true;
        } else {
            showToast('error', 'Gagal', 'Gagal mengirim bukti transfer');
            return false;
        }
    } catch (error) {
        console.error('Telegram photo upload error:', error);
        showToast('error', 'Error', 'Gagal upload bukti transfer');
        return false;
    }
}

// Function to open Telegram with order info
function openTelegram(orderId, customerName) {
    const message = `Hai admin, saya ${customerName} ingin mengirim bukti transfer untuk order ${orderId}. Mohon ditunggu!`;
    const telegramUrl = `https://t.me/${PAYMENT_CONFIG.telegramAdminChatId.replace('@', '')}?text=${encodeURIComponent(message)}`;
    window.open(telegramUrl, '_blank');
}
