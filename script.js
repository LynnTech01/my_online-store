// Products Data (now using real image filenames)
const products = [
    // Electronics
    { id: 2, name: "Earphones", category: "electronics", price: 80, image: "ofia.jpeg", description: "Wired, with mic, ofia" },
    { id: 2, name: "Earphones", category: "electronics", price: 100, image: "oraimo.jpeg", description: "Wired, with mic,oraimo" },
    { id: 3, name: "Bluetooth Pods", category: "electronics", price: 550, image: "bluetooth.jpeg", description: "Wireless, charging case" },
    { id: 5, name: "USB Cable", category: "electronics", price: 100, image: "cable.jpeg", description: "Type-C/Micro USB" },
    { id: 1, name: "Phone Charger", category: "electronics", price: 299, image: "charger.jpeg", description: "Fast charging, Type-C" },

    // Sweets & Biscuits
    { id: 4, name: "Lollipops", category: "sweets", price: 8, image: "lollipop.jpeg", description: "Assorted flavors" },
    { id: 6, name: "Tropical", category: "sweets", price: 10, image: "tropical.jpeg", description: "Mint" },
    { id: 7, name: "Biscuit Pack", category: "sweets", price: 5, image: "biscuits.jpeg", description: "biscuits with Cream" },
];

// Cart array
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentOrderTotal = 0;
let currentCheckoutRequestID = '';

// API endpoint (update with your actual domain)
const API_URL = 'https://yourdomain.com/mpesa-api.php';

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    displayProducts(products);
    updateCartCount();
    updateCartDisplay();
    setupSmoothScrolling();
});

// Setup smooth scrolling
function setupSmoothScrolling() {
    document.querySelectorAll('.nav-menu a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#home') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    const offset = 80;
                    const elementPosition = targetElement.offsetTop - offset;
                    window.scrollTo({ top: elementPosition, behavior: 'smooth' });
                }
            }
            document.getElementById('navMenu').classList.remove('active');
        });
    });
}

// Display products (with real images)
function displayProducts(productsToShow) {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    productsToShow.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" 
                     onerror="this.src='images/placeholder.png'"
                     style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px;">
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">KSh ${product.price}</div>
                <button class="btn-add-to-cart" onclick="addToCart(${product.id})">
                    <i class="fas fa-shopping-cart"></i> Add to Cart
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Filter products
function filterProducts(category) {
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    if (category === 'all') {
        displayProducts(products);
    } else {
        const filtered = products.filter(p => p.category === category);
        displayProducts(filtered);
    }
}

// Add to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    updateCartDisplay();
    showNotification(`${product.name} added to cart!`);
}

// Update cart count
function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCounts = document.querySelectorAll('.cart-count');
    cartCounts.forEach(el => {
        el.textContent = count;
    });
}

// Update cart display (with real images)
function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (!cartItems || !cartTotal) return;
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart"><i class="fas fa-shopping-basket"></i><p>Your cart is empty</p></div>';
        cartTotal.textContent = 'KSh 0';
        return;
    }
    
    let html = '';
    let total = 0;
    
    cart.forEach(item => {
        total += item.price * item.quantity;
        html += `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}" 
                         onerror="this.src='images/placeholder.png'"
                         style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;">
                </div>
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p class="cart-item-price">KSh ${item.price}</p>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                        <button class="quantity-btn remove" onclick="removeFromCart(${item.id})"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            </div>
        `;
    });
    
    cartItems.innerHTML = html;
    cartTotal.textContent = `KSh ${total}`;
    currentOrderTotal = total;
}

// Update quantity
function updateQuantity(productId, newQuantity) {
    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }
    
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = newQuantity;
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartDisplay();
        updateCartCount();
    }
}

// Remove from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
    updateCartCount();
    showNotification('Item removed');
}

// Clear cart
function clearCart() {
    if (confirm('Clear your cart?')) {
        cart = [];
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartDisplay();
        updateCartCount();
    }
}

// Validate and show payment
function validateAndShowPayment() {
    if (cart.length === 0) {
        showNotification('Your cart is empty! Add some items first.');
        return;
    }
    
    const name = document.getElementById('customerName').value.trim();
    const phone = document.getElementById('customerPhone').value.trim();
    const hostel = document.getElementById('customerHostel').value;
    const room = document.getElementById('customerRoom').value.trim();
    
    if (!name) {
        showNotification('Please enter your name');
        document.getElementById('customerName').focus();
        return;
    }
    
    if (!phone) {
        showNotification('Please enter your phone number');
        document.getElementById('customerPhone').focus();
        return;
    }
    
    const phoneRegex = /^(07|01|\+254|254)[0-9]{8}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
        showNotification('Please enter a valid Kenyan phone number');
        return;
    }
    
    if (!hostel) {
        showNotification('Please select your hostel');
        document.getElementById('customerHostel').focus();
        return;
    }
    
    if (!room) {
        showNotification('Please enter your room number');
        document.getElementById('customerRoom').focus();
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const orderDetails = {
        name: name,
        phone: phone,
        hostel: hostel,
        room: room,
        instructions: document.getElementById('specialInstructions').value,
        total: total,
        items: [...cart],
        orderId: 'ORD' + Date.now()
    };
    
    sessionStorage.setItem('pendingOrder', JSON.stringify(orderDetails));
    document.getElementById('cartSidebar').classList.remove('active');
    showMpesaPaymentModal(orderDetails);
}

// Show M-Pesa payment modal
function showMpesaPaymentModal(order) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'paymentModal';
    modal.style.display = 'flex';
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 450px;">
            <span class="close" onclick="closePaymentModal()">&times;</span>
            <div class="modal-header">
                <img src="https://www.safaricom.co.ke/images/m-pesa-logo.png" alt="M-Pesa" style="height: 50px; margin-bottom: 10px;">
                <h2>M-Pesa Payment</h2>
            </div>
            
            <div style="padding: 10px 0 20px;">
                <div style="background: linear-gradient(135deg, #4CAF50, #2E7D32); color: white; padding: 20px; border-radius: 15px; margin-bottom: 20px; text-align: center;">
                    <p style="font-size: 0.9rem; opacity: 0.9;">Amount to Pay</p>
                    <div style="font-size: 2.5rem; font-weight: 700;">KSh ${order.total}</div>
                </div>
                
                <div style="background: #f5f5f5; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                    <p><strong>Name:</strong> ${order.name}</p>
                    <p><strong>Phone:</strong> ${order.phone}</p>
                    <p><strong>Delivery:</strong> ${order.hostel}, Room ${order.room}</p>
                </div>
                
                <div style="background: #e3f2fd; padding: 20px; border-radius: 15px; margin-bottom: 20px; text-align: center;">
                    <i class="fas fa-mobile-alt" style="font-size: 3rem; color: #1976D2; margin-bottom: 10px;"></i>
                    <h3 style="color: #1976D2; margin-bottom: 10px;">Check Your Phone</h3>
                    <p style="margin-bottom: 10px;">We've sent an M-Pesa prompt to:</p>
                    <div style="font-size: 1.5rem; font-weight: 700; color: #1976D2; margin-bottom: 15px;">
                        ${order.phone}
                    </div>
                    <div style="background: white; padding: 15px; border-radius: 10px;">
                        <p style="margin: 0;">📱 Enter your M-Pesa PIN on the prompt</p>
                    </div>
                </div>
                
                <div style="margin-bottom: 20px; text-align: center;" id="pinStatus">
                    <p style="color: #666;">Waiting for you to enter PIN...</p>
                    <div class="loading-spinner" style="margin: 10px auto;"></div>
                </div>
                
                <div id="paymentStatus" style="display: none;"></div>
                
                <button class="btn btn-secondary" onclick="closePaymentModal()" style="width: 100%; padding: 15px;">
                    <i class="fas fa-times"></i> Cancel Payment
                </button>
                
                <p style="text-align: center; color: #666; margin-top: 15px; font-size: 0.85rem;">
                    <i class="fas fa-shield-alt"></i> Secured by Safaricom M-Pesa
                </p>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    initiateSTKPush(order);
}

// Initiate STK Push
function initiateSTKPush(order) {
    const formData = new FormData();
    formData.append('action', 'stk_push');
    formData.append('phone', order.phone);
    formData.append('amount', order.total);
    formData.append('orderId', order.orderId);
    formData.append('customerName', order.name);
    
    fetch(API_URL, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            currentCheckoutRequestID = data.data.checkoutRequestID;
            showNotification('M-Pesa prompt sent to your phone');
            checkPaymentStatus(currentCheckoutRequestID);
        } else {
            showNotification(data.message || 'Failed to initiate payment');
            updatePinStatus('error', data.message || 'Payment initiation failed');
        }
    })
    .catch(error => {
        showNotification('Failed to connect to payment server');
        updatePinStatus('error', 'Connection failed');
    });
}

// Check payment status
function checkPaymentStatus(checkoutRequestID) {
    const statusDiv = document.getElementById('pinStatus');
    
    const interval = setInterval(() => {
        const formData = new FormData();
        formData.append('action', 'check_status');
        formData.append('checkoutRequestID', checkoutRequestID);
        
        fetch(API_URL, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success && data.data) {
                if (data.data.ResultCode === '0') {
                    clearInterval(interval);
                    paymentSuccessful();
                } else if (data.data.ResultCode === '1037') {
                    if (statusDiv) {
                        statusDiv.innerHTML = `
                            <p style="color: #ff9800;">⏳ Still waiting for you to enter PIN...</p>
                            <div class="loading-spinner"></div>
                        `;
                    }
                } else if (data.data.ResultCode !== '1037') {
                    clearInterval(interval);
                    paymentFailed(data.data.ResultDesc);
                }
            }
        })
        .catch(error => {
            console.error('Error checking status:', error);
        });
    }, 3000);
    
    setTimeout(() => {
        clearInterval(interval);
        if (document.getElementById('paymentModal')) {
            paymentFailed('Payment timeout. Please try again.');
        }
    }, 120000);
}

// Payment successful - WITH CLICKABLE BUTTON
function paymentSuccessful() {
    const statusDiv = document.getElementById('pinStatus');
    const paymentStatus = document.getElementById('paymentStatus');
    
    if (statusDiv) statusDiv.style.display = 'none';
    if (paymentStatus) {
        paymentStatus.style.display = 'block';
        paymentStatus.innerHTML = `
            <div style="background: linear-gradient(135deg, #d4edda, #c3e6cb); color: #155724; padding: 30px; border-radius: 20px; text-align: center; margin-bottom: 20px; border: 3px solid #28a745;">
                <div style="font-size: 5rem; color: #28a745; margin-bottom: 15px;">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h2 style="color: #28a745; margin-bottom: 10px; font-size: 2rem;">Payment Successful!</h2>
                <p style="margin-bottom: 25px; font-size: 1.2rem;">Your order has been confirmed and will be delivered soon.</p>
                
                <!-- CLICKABLE BUTTON -->
                <button onclick="closePaymentModalAndContinue()" style="background: #28a745; color: white; border: none; padding: 18px 30px; border-radius: 60px; font-size: 1.3rem; font-weight: 700; cursor: pointer; box-shadow: 0 8px 20px rgba(40, 167, 69, 0.4); transition: all 0.3s; width: 100%; border: 2px solid white;">
                    <i class="fas fa-check-circle"></i> CLICK HERE TO CONTINUE
                </button>
                
                <p style="margin-top: 15px; font-size: 0.9rem; color: #155724;">
                    <i class="fas fa-info-circle"></i> You can close this window anytime
                </p>
            </div>
        `;
    }
    
    const pendingOrder = JSON.parse(sessionStorage.getItem('pendingOrder'));
    
    if (pendingOrder) {
        const order = {
            id: pendingOrder.orderId,
            customer: pendingOrder.name,
            phone: pendingOrder.phone,
            hostel: pendingOrder.hostel,
            room: pendingOrder.room,
            instructions: pendingOrder.instructions || '',
            items: pendingOrder.items,
            total: pendingOrder.total,
            status: 'pending',
            paymentStatus: 'paid',
            paymentMethod: 'M-Pesa',
            paymentReference: currentCheckoutRequestID,
            timestamp: new Date().toLocaleString()
        };
        
        let orders = JSON.parse(localStorage.getItem('orders')) || [];
        orders.push(order);
        localStorage.setItem('orders', JSON.stringify(orders));
        
        cart = [];
        localStorage.setItem('cart', JSON.stringify(cart));
        sessionStorage.removeItem('pendingOrder');
        
        updateCartDisplay();
        updateCartCount();
        
        document.getElementById('customerName').value = '';
        document.getElementById('customerPhone').value = '';
        document.getElementById('customerHostel').value = '';
        document.getElementById('customerRoom').value = '';
        document.getElementById('specialInstructions').value = '';
        
        sendWhatsAppNotification(order);
    }
}

// Payment failed
function paymentFailed(message) {
    const statusDiv = document.getElementById('pinStatus');
    const paymentStatus = document.getElementById('paymentStatus');
    
    if (statusDiv) statusDiv.style.display = 'none';
    if (paymentStatus) {
        paymentStatus.style.display = 'block';
        paymentStatus.innerHTML = `
            <div style="background: #f8d7da; color: #721c24; padding: 30px; border-radius: 20px; text-align: center; margin-bottom: 20px; border: 3px solid #dc3545;">
                <i class="fas fa-times-circle" style="font-size: 5rem; color: #dc3545; margin-bottom: 15px;"></i>
                <h2 style="color: #dc3545; margin-bottom: 10px;">Payment Failed</h2>
                <p style="margin-bottom: 25px;">${message || 'Please try again'}</p>
                <button onclick="closePaymentModal()" style="background: #dc3545; color: white; border: none; padding: 15px 30px; border-radius: 60px; font-size: 1.2rem; cursor: pointer; width: 100%;">
                    <i class="fas fa-times"></i> CLOSE
                </button>
            </div>
        `;
    }
}

// Close payment modal and continue
function closePaymentModalAndContinue() {
    closePaymentModal();
    showNotification('✅ Order placed successfully!');
}

// Update PIN status
function updatePinStatus(type, message) {
    const statusDiv = document.getElementById('pinStatus');
    if (statusDiv) {
        if (type === 'error') {
            statusDiv.innerHTML = `<p style="color: #dc3545;">❌ ${message}</p>`;
        } else {
            statusDiv.innerHTML = `<p style="color: #28a745;">✅ ${message}</p>`;
        }
    }
}

// Close payment modal
function closePaymentModal() {
    const modal = document.getElementById('paymentModal');
    if (modal) {
        modal.remove();
    }
}

// Send WhatsApp notification
function sendWhatsAppNotification(order) {
    const itemsList = order.items.map(item => `• ${item.name} x${item.quantity} - KSh ${item.price * item.quantity}`).join('\n');
    
    const message = `*✅ NEW ORDER RECEIVED - PAID VIA M-PESA*
    
*Order ID:* ${order.id}
*Time:* ${order.timestamp}

*👤 Customer Details:*
• Name: ${order.customer}
• Phone: ${order.phone}
• Delivery: ${order.hostel}, Room ${order.room}

*📦 Items Ordered:*
${itemsList}

*💰 Total: KSh ${order.total}*
*💳 Payment: PAID via M-Pesa*
*🔑 Reference: ${order.paymentReference}

${order.instructions ? `*📝 Instructions:* ${order.instructions}` : ''}

Please prepare for delivery!`;
    
    const whatsappUrl = `https://wa.me/254701644905?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// Toggle mobile menu
function toggleMobileMenu() {
    const menu = document.getElementById('navMenu');
    if (menu) menu.classList.toggle('active');
}

// Toggle cart
function toggleCart(event) {
    event.preventDefault();
    const cart = document.getElementById('cartSidebar');
    if (cart) cart.classList.toggle('active');
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `<i class="fas fa-info-circle"></i> ${message}`;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Close modals when clicking outside
window.onclick = function(event) {
    const cart = document.getElementById('cartSidebar');
    const modal = document.getElementById('paymentModal');
    
    if (event.target === cart) {
        cart.classList.remove('active');
    }
    
    if (event.target === modal) {
        modal.remove();
    }
}