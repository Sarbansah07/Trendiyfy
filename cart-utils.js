async function getCurrentUser() {
  try {
    const response = await fetch('/api/auth/me');
    const data = await response.json();
    return data.user;
  } catch (error) {
    return null;
  }
}

async function addToCart(productId) {
  const user = await getCurrentUser();
  
  if (!user) {
    alert('Please login to add items to cart');
    window.location.href = '/login/login.html';
    return false;
  }

  try {
    const response = await fetch('/api/cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ productId, quantity: 1 })
    });

    const data = await response.json();

    if (response.ok) {
      alert('Product added to cart!');
      updateCartCount();
      return true;
    } else {
      alert(data.error || 'Failed to add to cart');
      return false;
    }
  } catch (error) {
    alert('Network error. Please try again.');
    return false;
  }
}

async function updateCartCount() {
  try {
    const response = await fetch('/api/cart/count');
    const data = await response.json();
    const cartBadges = document.querySelectorAll('.cart-count');
    cartBadges.forEach(badge => {
      badge.textContent = data.count;
      badge.style.display = data.count > 0 ? 'inline' : 'none';
    });
  } catch (error) {
    console.error('Failed to update cart count:', error);
  }
}

async function updateAuthUI() {
  const user = await getCurrentUser();
  const loginLinks = document.querySelectorAll('.auth-link');
  
  loginLinks.forEach(link => {
    if (user) {
      link.innerHTML = `<span style="color: #088178; font-weight: 600;">Welcome, ${user.name}!</span> | <a href="#" onclick="logout(); return false;">Logout</a>`;
    }
  });

  updateCartCount();
}

async function logout() {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/index.html';
  } catch (error) {
    alert('Logout failed');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', updateAuthUI);
} else {
  updateAuthUI();
}
