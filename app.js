// Product data from application_data_json
const products = [
    {
        id: 1,
        name: "AEROMERGE Drift Knit",
        price: 149.99,
        currency: "€",
        category: "lifestyle",
        colors: ["Cream", "Orange", "Blue"],
        sizes: [7, 8, 9, 10, 11, 12],
        description: "Comfortable knitted casual shoe perfect for everyday wear with premium materials and superior comfort.",
        longDescription: "The AEROMERGE Drift Knit represents the perfect fusion of style and comfort. Crafted with advanced knitting technology, this lifestyle shoe features a breathable upper that adapts to your foot's natural movement. The cream colorway with orange and blue accents makes a subtle yet distinctive statement, while the responsive midsole provides all-day comfort for urban adventures.",
        image: "👟",
        featured: true,
        stock: 50
    },
    {
        id: 2,
        name: "AEROMERGE Velocity Knit",
        price: 189.99,
        currency: "€",
        category: "sneakers",
        colors: ["Dark Grey", "Lime", "Blue"],
        sizes: [7, 8, 9, 10, 11, 12],
        description: "High-performance running shoe with advanced knit technology and superior energy return.",
        longDescription: "Engineered for speed and performance, the AEROMERGE Velocity Knit delivers exceptional responsiveness with every stride. The seamless knitted upper provides targeted support while maintaining breathability, and the innovative midsole technology offers superior energy return. The bold lime green and electric blue accents against the dark grey base make this the perfect choice for runners who refuse to compromise on style.",
        image: "🏃",
        featured: true,
        stock: 35
    },
    {
        id: 3,
        name: "AEROMERGE Pulse Racer",
        price: 169.99,
        currency: "€",
        category: "racing",
        colors: ["Coral", "Teal", "White"],
        sizes: [7, 8, 9, 10, 11, 12],
        description: "Sporty lifestyle shoe with visible air cushioning and dynamic color blocking.",
        longDescription: "The AEROMERGE Pulse Racer bridges the gap between performance and lifestyle with its striking design and advanced cushioning system. Featuring visible air units for maximum impact absorption and a vibrant coral upper with teal and white accents, this shoe makes a bold statement both on the track and on the street. The lightweight construction and responsive feel make it perfect for active lifestyles.",
        image: "⚡",
        featured: true,
        stock: 42
    }
];

// Success messages for order completion
const orderSuccessMessages = [
    "🚀 Your order is ready for takeoff!",
    "✨ Gravity-defying shoes incoming!",
    "🎯 Mission accomplished - order confirmed!",
    "⚡ Your AEROMERGE experience begins now!"
];

// Global state
let currentPage = 'home';
let cart = [];
let currentProduct = null;
let filteredProducts = [...products];
let redirectTimeout = null;

// Load cart from localStorage (commented out due to sandbox restrictions)
function loadCart() {
    // Note: localStorage disabled in sandbox environment
    cart = [];
}

// Utility functions
function formatPrice(price, currency = '€') {
    return `${currency}${price.toFixed(2)}`;
}

function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.classList.toggle('visible', totalItems > 0);
    }
}

function saveCart() {
    // Note: localStorage disabled in sandbox environment
    updateCartCount();
    updateCartDropdown();
}

function generateOrderNumber() {
    return 'AER' + Date.now().toString().slice(-8);
}

// Toast notification system
function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? '✅' : '❌';
    
    toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-message">${message}</div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Navigation functions
function showPage(pageId) {
    console.log('Navigating to:', pageId);
    
    // Update active navigation link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === pageId) {
            link.classList.add('active');
        }
    });
    
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.add('hidden');
    });
    
    // Show target page
    const targetPage = document.getElementById(pageId + 'Page');
    if (targetPage) {
        targetPage.classList.remove('hidden');
        currentPage = pageId;
        
        // Scroll to top
        window.scrollTo(0, 0);
        
        // Initialize page-specific content
        initializePage(pageId);
    } else {
        console.error('Page not found:', pageId + 'Page');
    }
}

function initializePage(pageId) {
    switch (pageId) {
        case 'home':
            loadFeaturedProducts();
            break;
        case 'products':
            loadAllProducts();
            break;
        case 'cart':
            loadCartItems();
            break;
        case 'checkout':
            loadCheckoutOrderSummary();
            break;
        case 'thankyou':
            startRedirectCountdown();
            break;
    }
}

// Thank you page redirect functionality
function startRedirectCountdown() {
    const countdownElement = document.getElementById('countdown');
    const redirectMessage = document.getElementById('redirectMessage');
    
    if (!countdownElement || !redirectMessage) return;
    
    let seconds = 5;
    
    const updateCountdown = () => {
        countdownElement.textContent = seconds;
        
        if (seconds <= 0) {
            showPage('home');
            return;
        }
        
        seconds--;
        redirectTimeout = setTimeout(updateCountdown, 1000);
    };
    
    updateCountdown();
}

// Product rendering functions
function createProductCard(product, showActions = true) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    card.innerHTML = `
        <div class="product-card__image">
            ${product.image}
        </div>
        <div class="product-card__content">
            <h3 class="product-card__title">${product.name}</h3>
            <div class="product-card__price">${formatPrice(product.price, product.currency)}</div>
            <p class="product-card__description">${product.description}</p>
            ${showActions ? `
                <div class="product-card__actions">
                    <button class="btn btn--secondary btn--sm view-product-btn" data-product-id="${product.id}">View Product</button>
                    <button class="btn btn--primary btn--sm add-to-cart-btn" data-product-id="${product.id}">Add to Cart</button>
                </div>
            ` : ''}
        </div>
    `;
    
    // Add event listeners
    if (showActions) {
        const viewBtn = card.querySelector('.view-product-btn');
        const addBtn = card.querySelector('.add-to-cart-btn');
        
        if (viewBtn) {
            viewBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                showProductDetail(product.id);
            });
        }
        
        if (addBtn) {
            addBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                addToCart(product.id, 1, 7);
            });
        }
    }
    
    // Make card clickable
    card.addEventListener('click', () => {
        showProductDetail(product.id);
    });
    
    return card;
}

function loadFeaturedProducts() {
    const grid = document.getElementById('featuredProductsGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    const featuredProducts = products.filter(p => p.featured);
    featuredProducts.forEach(product => {
        grid.appendChild(createProductCard(product));
    });
}

function loadAllProducts() {
    const grid = document.getElementById('allProductsGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    if (filteredProducts.length === 0) {
        grid.innerHTML = '<div class="empty-state">No products found matching your criteria.</div>';
        return;
    }
    
    filteredProducts.forEach(product => {
        grid.appendChild(createProductCard(product));
    });
}

// Product detail functions
function showProductDetail(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    currentProduct = product;
    
    const detailsContainer = document.getElementById('productDetails');
    if (!detailsContainer) return;
    
    detailsContainer.innerHTML = `
        <div class="product-gallery">
            <div class="product-main-image">
                ${product.image}
            </div>
        </div>
        <div class="product-info">
            <h1>${product.name}</h1>
            <div class="product-price">${formatPrice(product.price, product.currency)}</div>
            <div class="product-description">
                <p>${product.longDescription}</p>
            </div>
            
            <div class="product-options">
                <h3>Size</h3>
                <div class="size-options" id="sizeOptions">
                    ${product.sizes.map(size => `
                        <button class="size-option" data-size="${size}">${size}</button>
                    `).join('')}
                </div>
                
                <h3>Colors</h3>
                <div class="color-options">
                    <p>${product.colors.join(', ')}</p>
                </div>
                
                <h3>Quantity</h3>
                <div class="quantity-selector">
                    <button class="quantity-btn" id="decreaseQty">−</button>
                    <input type="number" class="quantity-input" id="quantityInput" value="1" min="1" max="10">
                    <button class="quantity-btn" id="increaseQty">+</button>
                </div>
            </div>
            
            <div class="product-actions">
                <button class="btn btn--primary btn--lg" id="addToCartBtn">Add to Cart</button>
                <button class="btn btn--secondary btn--lg" id="buyNowBtn">Buy Now</button>
            </div>
            
            <div class="product-details-info">
                <p><strong>Stock:</strong> ${product.stock} available</p>
                <p><strong>Category:</strong> ${product.category.charAt(0).toUpperCase() + product.category.slice(1)}</p>
            </div>
        </div>
    `;
    
    // Initialize product page interactions
    initializeProductPage();
    showPage('product');
}

function initializeProductPage() {
    let selectedSize = 7; // Default size
    
    // Size selection
    document.querySelectorAll('.size-option').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.size-option').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedSize = parseInt(btn.dataset.size);
        });
    });
    
    // Select first size by default
    const firstSizeBtn = document.querySelector('.size-option');
    if (firstSizeBtn) {
        firstSizeBtn.click();
    }
    
    // Quantity controls
    const quantityInput = document.getElementById('quantityInput');
    const decreaseBtn = document.getElementById('decreaseQty');
    const increaseBtn = document.getElementById('increaseQty');
    
    if (decreaseBtn) {
        decreaseBtn.addEventListener('click', () => {
            const value = parseInt(quantityInput.value);
            if (value > 1) {
                quantityInput.value = value - 1;
            }
        });
    }
    
    if (increaseBtn) {
        increaseBtn.addEventListener('click', () => {
            const value = parseInt(quantityInput.value);
            if (value < 10) {
                quantityInput.value = value + 1;
            }
        });
    }
    
    // Add to cart
    const addToCartBtn = document.getElementById('addToCartBtn');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            const quantity = parseInt(quantityInput.value);
            addToCart(currentProduct.id, quantity, selectedSize);
        });
    }
    
    // Buy now
    const buyNowBtn = document.getElementById('buyNowBtn');
    if (buyNowBtn) {
        buyNowBtn.addEventListener('click', () => {
            const quantity = parseInt(quantityInput.value);
            addToCart(currentProduct.id, quantity, selectedSize);
            showPage('cart');
        });
    }
}

// Cart functions
function addToCart(productId, quantity, size) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId && item.size === size);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: productId,
            name: product.name,
            price: product.price,
            currency: product.currency,
            image: product.image,
            size: size,
            quantity: quantity
        });
    }
    
    saveCart();
    showToast(`${product.name} added to cart!`);
}

function removeFromCart(productId, size) {
    const index = cart.findIndex(item => item.id === productId && item.size === size);
    if (index !== -1) {
        const item = cart[index];
        cart.splice(index, 1);
        saveCart();
        showToast(`${item.name} removed from cart`);
        
        if (currentPage === 'cart') {
            loadCartItems();
        }
    }
}

function updateCartItemQuantity(productId, size, newQuantity) {
    const item = cart.find(item => item.id === productId && item.size === size);
    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(productId, size);
        } else {
            item.quantity = newQuantity;
            saveCart();
            
            if (currentPage === 'cart') {
                loadCartItems();
            }
        }
    }
}

function loadCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    const subtotalEl = document.getElementById('cartSubtotal');
    const totalEl = document.getElementById('cartTotal');
    
    if (!cartItemsContainer || !subtotalEl || !totalEl) return;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-state">
                Your cart is empty. 
                <a href="#" onclick="showPage('products')" style="color: var(--brand-primary);">Continue shopping</a>
            </div>`;
        subtotalEl.textContent = '€0.00';
        totalEl.textContent = '€0.00';
        return;
    }
    
    cartItemsContainer.innerHTML = '';
    let subtotal = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-image">${item.image}</div>
            <div class="cart-item-info">
                <h3>${item.name}</h3>
                <p>Size: ${item.size}</p>
            </div>
            <div class="cart-item-quantity">
                <button class="quantity-btn decrease-btn" data-id="${item.id}" data-size="${item.size}">−</button>
                <span>${item.quantity}</span>
                <button class="quantity-btn increase-btn" data-id="${item.id}" data-size="${item.size}">+</button>
            </div>
            <div class="cart-item-price">${formatPrice(itemTotal, item.currency)}</div>
            <button class="cart-item-remove remove-btn" data-id="${item.id}" data-size="${item.size}" title="Remove item">×</button>
        `;
        
        // Add event listeners
        const decreaseBtn = cartItem.querySelector('.decrease-btn');
        const increaseBtn = cartItem.querySelector('.increase-btn');
        const removeBtn = cartItem.querySelector('.remove-btn');
        
        decreaseBtn.addEventListener('click', () => {
            updateCartItemQuantity(item.id, item.size, item.quantity - 1);
        });
        
        increaseBtn.addEventListener('click', () => {
            updateCartItemQuantity(item.id, item.size, item.quantity + 1);
        });
        
        removeBtn.addEventListener('click', () => {
            removeFromCart(item.id, item.size);
        });
        
        cartItemsContainer.appendChild(cartItem);
    });
    
    subtotalEl.textContent = formatPrice(subtotal);
    totalEl.textContent = formatPrice(subtotal); // Free shipping
}

function updateCartDropdown() {
    const cartDropdownItems = document.getElementById('cartDropdownItems');
    if (!cartDropdownItems) return;
    
    if (cart.length === 0) {
        cartDropdownItems.innerHTML = '<div class="cart-empty">Your cart is empty</div>';
        return;
    }
    
    cartDropdownItems.innerHTML = '';
    cart.slice(0, 3).forEach(item => {
        const dropdownItem = document.createElement('div');
        dropdownItem.style.cssText = 'padding: 8px; border-bottom: 1px solid var(--color-border); display: flex; align-items: center; gap: 8px; font-size: 12px;';
        dropdownItem.innerHTML = `
            <span style="font-size: 16px;">${item.image}</span>
            <div style="flex: 1;">
                <div style="font-weight: 500;">${item.name}</div>
                <div style="color: var(--color-text-secondary);">Size ${item.size} • Qty ${item.quantity}</div>
            </div>
        `;
        cartDropdownItems.appendChild(dropdownItem);
    });
    
    if (cart.length > 3) {
        const moreItems = document.createElement('div');
        moreItems.style.cssText = 'padding: 8px; text-align: center; color: var(--color-text-secondary); font-size: 12px;';
        moreItems.textContent = `+${cart.length - 3} more items`;
        cartDropdownItems.appendChild(moreItems);
    }
}

// Filter and search functions
function filterProducts() {
    const categoryFilter = document.getElementById('categoryFilter');
    const sortFilter = document.getElementById('sortFilter');
    
    if (!categoryFilter || !sortFilter) return;
    
    const categoryValue = categoryFilter.value;
    const sortValue = sortFilter.value;
    
    // Apply category filter
    if (categoryValue) {
        filteredProducts = products.filter(p => p.category === categoryValue);
    } else {
        filteredProducts = [...products];
    }
    
    // Apply sorting
    switch (sortValue) {
        case 'price-low':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'popularity':
            filteredProducts.sort((a, b) => b.stock - a.stock);
            break;
        case 'newest':
        default:
            filteredProducts.sort((a, b) => b.id - a.id);
            break;
    }
    
    loadAllProducts();
}

function searchProducts(query) {
    if (!query.trim()) {
        filteredProducts = [...products];
    } else {
        filteredProducts = products.filter(product => 
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            product.description.toLowerCase().includes(query.toLowerCase()) ||
            product.category.toLowerCase().includes(query.toLowerCase())
        );
    }
    
    if (currentPage === 'products') {
        loadAllProducts();
    }
}

// Checkout functions
function loadCheckoutOrderSummary() {
    const summaryContainer = document.getElementById('checkoutOrderSummary');
    if (!summaryContainer) return;
    
    if (cart.length === 0) {
        summaryContainer.innerHTML = '<p>No items in cart</p>';
        return;
    }
    
    let html = '';
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        html += `
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>${item.name} (Size ${item.size}) × ${item.quantity}</span>
                <span>${formatPrice(itemTotal, item.currency)}</span>
            </div>
        `;
    });
    
    html += `
        <div style="border-top: 1px solid var(--color-border); padding-top: 8px; margin-top: 8px; display: flex; justify-content: space-between; font-weight: bold;">
            <span>Total:</span>
            <span>${formatPrice(total)}</span>
        </div>
    `;
    
    summaryContainer.innerHTML = html;
}

// Removed form validation - forms now work without constraints
function validateShippingForm(form) {
    // Always return true - no validation constraints
    return true;
}

function validatePaymentForm(form) {
    // Always return true - no validation constraints
    return true;
}

function processCheckout() {
    // Show success toast
    const randomMessage = orderSuccessMessages[Math.floor(Math.random() * orderSuccessMessages.length)];
    showToast(randomMessage);
    
    // Generate order number and show thank you page
    const orderNumber = generateOrderNumber();
    const orderNumberEl = document.getElementById('orderNumber');
    if (orderNumberEl) {
        orderNumberEl.textContent = orderNumber;
    }
    
    // Create order summary
    const orderSummary = document.getElementById('orderSummary');
    if (orderSummary) {
        let html = '<div style="text-align: left; margin: 16px 0;"><h3>Items Ordered:</h3>';
        let total = 0;
        
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            html += `<p>${item.name} (Size ${item.size}) × ${item.quantity} - ${formatPrice(itemTotal, item.currency)}</p>`;
        });
        
        html += `<p style="border-top: 1px solid var(--color-border); padding-top: 8px; font-weight: bold;">Total: ${formatPrice(total)}</p></div>`;
        orderSummary.innerHTML = html;
    }
    
    // Clear cart
    cart = [];
    saveCart();
    
    // Show thank you page
    showPage('thankyou');
}

// Event handler for navigation and interactions
function handleNavigation(e) {
    // Handle navigation links
    if (e.target.hasAttribute('data-page')) {
        e.preventDefault();
        const page = e.target.getAttribute('data-page');
        
        // Clear any existing redirect timeout
        if (redirectTimeout) {
            clearTimeout(redirectTimeout);
            redirectTimeout = null;
        }
        
        showPage(page);
        return;
    }
    
    // Handle category links
    if (e.target.hasAttribute('data-category')) {
        e.preventDefault();
        const category = e.target.getAttribute('data-category');
        showPage('products');
        setTimeout(() => {
            const categoryFilter = document.getElementById('categoryFilter');
            if (categoryFilter) {
                categoryFilter.value = category;
                filterProducts();
            }
        }, 100);
        return;
    }

    // Handle hero CTA button
    if (e.target.classList.contains('hero__cta')) {
        e.preventDefault();
        showPage('products');
        return;
    }

    // Handle logo click to go home
    if (e.target.closest('.header__logo')) {
        e.preventDefault();
        showPage('home');
        return;
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing AEROMERGE app...');
    
    // Load cart from storage
    loadCart();
    
    // Add universal click handler for navigation
    document.addEventListener('click', handleNavigation);
    
    // Cart icon functionality
    const cartIcon = document.getElementById('cartIcon');
    const cartDropdown = document.getElementById('cartDropdown');
    
    if (cartIcon) {
        cartIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            showPage('cart');
        });
        
        cartIcon.addEventListener('mouseenter', () => {
            if (cartDropdown) {
                cartDropdown.classList.add('visible');
            }
        });
        
        cartIcon.addEventListener('mouseleave', () => {
            if (cartDropdown) {
                setTimeout(() => {
                    if (!cartDropdown.matches(':hover')) {
                        cartDropdown.classList.remove('visible');
                    }
                }, 100);
            }
        });
    }
    
    if (cartDropdown) {
        cartDropdown.addEventListener('mouseleave', () => {
            cartDropdown.classList.remove('visible');
        });
    }
    
    // View cart button in dropdown
    const viewCartBtn = document.getElementById('viewCartBtn');
    if (viewCartBtn) {
        viewCartBtn.addEventListener('click', () => {
            if (cartDropdown) {
                cartDropdown.classList.remove('visible');
            }
            showPage('cart');
        });
    }
    
    // Product filters
    const categoryFilter = document.getElementById('categoryFilter');
    const sortFilter = document.getElementById('sortFilter');
    
    if (categoryFilter) categoryFilter.addEventListener('change', filterProducts);
    if (sortFilter) sortFilter.addEventListener('change', filterProducts);
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchProducts(e.target.value);
        });
    }
    
    // Newsletter form
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = e.target.querySelector('input[type="email"]').value;
            showToast('Thank you for subscribing!');
            e.target.reset();
        });
    }
    
    // Contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showToast('Thank you for your message! We\'ll get back to you soon.');
            e.target.reset();
        });
    }
    
    // Checkout functionality
    const proceedToCheckout = document.getElementById('proceedToCheckout');
    if (proceedToCheckout) {
        proceedToCheckout.addEventListener('click', () => {
            if (cart.length === 0) {
                showToast('Your cart is empty', 'error');
                return;
            }
            showPage('checkout');
        });
    }
    
    // Shipping form - no validation constraints
    const shippingForm = document.getElementById('shippingForm');
    if (shippingForm) {
        shippingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Move to payment step without validation
            const shippingStep = document.getElementById('shippingStep');
            const paymentStep = document.getElementById('paymentStep');
            
            if (shippingStep && paymentStep) {
                shippingStep.classList.add('hidden');
                paymentStep.classList.remove('hidden');
                
                // Update step indicators
                const step1 = document.querySelector('[data-step="1"]');
                const step2 = document.querySelector('[data-step="2"]');
                
                if (step1) step1.classList.remove('active');
                if (step2) step2.classList.add('active');
                
                loadCheckoutOrderSummary();
            }
        });
    }
    
    // Payment form - no validation constraints
    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm) {
        paymentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Simulate payment processing
            showToast('Processing payment...');
            setTimeout(() => {
                processCheckout();
            }, 1500);
        });
    }
    
    // Continue shopping button
    const continueShopping = document.getElementById('continueShopping');
    if (continueShopping) {
        continueShopping.addEventListener('click', () => {
            // Clear any existing redirect timeout
            if (redirectTimeout) {
                clearTimeout(redirectTimeout);
                redirectTimeout = null;
            }
            showPage('home');
        });
    }
    
    // Card input formatting (simplified, no validation)
    document.addEventListener('input', (e) => {
        if (e.target.name === 'cardNumber') {
            let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
        }
        
        if (e.target.name === 'expiryDate') {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
        }
        
        if (e.target.name === 'cvv') {
            e.target.value = e.target.value.replace(/\D/g, '').substring(0, 4);
        }
    });
    
    // Initialize app state
    updateCartCount();
    updateCartDropdown();
    loadFeaturedProducts();
    
    // Set initial active nav link
    const homeNavLink = document.querySelector('[data-page="home"]');
    if (homeNavLink) {
        homeNavLink.classList.add('active');
    }
    
    console.log('AEROMERGE app initialized successfully');
});

// Make functions globally available for inline event handlers
window.showPage = showPage;
window.showProductDetail = showProductDetail;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartItemQuantity = updateCartItemQuantity;
window.filterProducts = filterProducts;