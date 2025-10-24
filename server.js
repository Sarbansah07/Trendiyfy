require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Sample products data for demo (since SQLite may not work on Render)
const products = [
  {
    id: 1,
    name: 'Cartoon Astronaut T-Shirts',
    price: 78,
    image: 'img/products/f1.jpg',
    is_featured: 1,
    stock_qty: 10,
    created_at: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 2,
    name: 'Cartoon Astronaut T-Shirts',
    price: 78,
    image: 'img/products/f2.jpg',
    is_featured: 1,
    stock_qty: 10,
    created_at: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 3,
    name: 'Cartoon Astronaut T-Shirts',
    price: 78,
    image: 'img/products/f3.jpg',
    is_featured: 1,
    stock_qty: 10,
    created_at: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 4,
    name: 'Cartoon Astronaut T-Shirts',
    price: 78,
    image: 'img/products/f4.jpg',
    is_featured: 1,
    stock_qty: 10,
    created_at: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 5,
    name: 'Cartoon Astronaut T-Shirts',
    price: 78,
    image: 'img/products/n1.jpg',
    is_featured: 0,
    stock_qty: 10,
    created_at: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 6,
    name: 'Cartoon Astronaut T-Shirts',
    price: 78,
    image: 'img/products/n2.jpg',
    is_featured: 0,
    stock_qty: 10,
    created_at: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 7,
    name: 'Cartoon Astronaut T-Shirts',
    price: 78,
    image: 'img/products/n3.jpg',
    is_featured: 0,
    stock_qty: 10,
    created_at: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 8,
    name: 'Cartoon Astronaut T-Shirts',
    price: 78,
    image: 'img/products/n4.jpg',
    is_featured: 0,
    stock_qty: 10,
    created_at: '2024-01-01T00:00:00.000Z'
  }
];

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';
const JWT_SECRET = process.env.JWT_SECRET || 'trendyfy-secret-key-change-in-production';

app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many attempts, please try again later'
});

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Too many contact submissions, please try again later'
});

function authenticateToken(req, res, next) {
  const token = req.cookies.token;
  
  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      req.user = null;
    } else {
      req.user = user;
    }
    next();
  });
}

function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

app.post('/api/auth/signup', authLimiter, (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password and name are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const result = db.prepare('INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)').run(email, passwordHash, name);

    const token = jwt.sign({ id: result.lastInsertRowid, email, name }, JWT_SECRET, { expiresIn: '7d' });
    
    res.cookie('token', token, { 
      httpOnly: true, 
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax'
    });

    res.json({ success: true, user: { id: result.lastInsertRowid, email, name } });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error during signup' });
  }
});

app.post('/api/auth/login', authLimiter, (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const validPassword = bcrypt.compareSync(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    
    res.cookie('token', token, { 
      httpOnly: true, 
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax'
    });

    res.json({ success: true, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  if (!req.user) {
    return res.json({ user: null });
  }
  res.json({ user: req.user });
});

app.get('/api/products', (req, res) => {
  try {
    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Server error fetching products' });
  }
});

app.get('/api/products/featured', (req, res) => {
  try {
    const featuredProducts = products.filter(p => p.is_featured === 1);
    res.json(featuredProducts);
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({ error: 'Server error fetching featured products' });
  }
});

app.get('/api/products/:id', (req, res) => {
  try {
    const product = products.find(p => p.id === parseInt(req.params.id));
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Server error fetching product' });
  }
});

// In-memory cart storage for demo
let cartItems = [];
let nextCartItemId = 1;

app.get('/api/cart', authenticateToken, requireAuth, (req, res) => {
  try {
    const userCartItems = cartItems.filter(item => item.user_id === req.user.id);
    const cartWithProducts = userCartItems.map(item => {
      const product = products.find(p => p.id === item.product_id);
      return {
        id: item.id,
        quantity: item.quantity,
        ...product
      };
    });

    res.json(cartWithProducts);
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Server error fetching cart' });
  }
});

app.post('/api/cart', authenticateToken, requireAuth, (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || quantity < 1) {
    return res.status(400).json({ error: 'Invalid product or quantity' });
  }

  try {
    const product = products.find(p => p.id === parseInt(productId));
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.stock_qty < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    const existing = cartItems.find(item => item.user_id === req.user.id && item.product_id === parseInt(productId));

    if (existing) {
      const newQuantity = existing.quantity + quantity;
      if (product.stock_qty < newQuantity) {
        return res.status(400).json({ error: 'Insufficient stock' });
      }
      existing.quantity = newQuantity;
      res.json({ success: true, message: 'Cart updated', quantity: newQuantity });
    } else {
      const cartItem = {
        id: nextCartItemId++,
        user_id: req.user.id,
        product_id: parseInt(productId),
        quantity
      };
      cartItems.push(cartItem);
      res.json({ success: true, message: 'Added to cart', quantity });
    }
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Server error adding to cart' });
  }
});

app.patch('/api/cart/:itemId', authenticateToken, requireAuth, (req, res) => {
  const { quantity } = req.body;

  if (quantity < 1) {
    return res.status(400).json({ error: 'Quantity must be at least 1' });
  }

  try {
    const cartItem = cartItems.find(item => item.id === parseInt(req.params.itemId) && item.user_id === req.user.id);

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    const product = products.find(p => p.id === cartItem.product_id);
    if (product.stock_qty < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    cartItem.quantity = quantity;
    res.json({ success: true });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ error: 'Server error updating cart' });
  }
});

app.delete('/api/cart/:itemId', authenticateToken, requireAuth, (req, res) => {
  try {
    const index = cartItems.findIndex(item => item.id === parseInt(req.params.itemId) && item.user_id === req.user.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    cartItems.splice(index, 1);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete cart item error:', error);
    res.status(500).json({ error: 'Server error removing item' });
  }
});

app.get('/api/cart/count', authenticateToken, (req, res) => {
  if (!req.user) {
    return res.json({ count: 0 });
  }

  try {
    const userCartItems = cartItems.filter(item => item.user_id === req.user.id);
    const totalCount = userCartItems.reduce((sum, item) => sum + item.quantity, 0);
    res.json({ count: totalCount });
  } catch (error) {
    console.error('Get cart count error:', error);
    res.json({ count: 0 });
  }
});

// In-memory contact storage for demo
let contactInquiries = [];
let nextContactId = 1;

app.post('/api/contact', contactLimiter, (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email and message are required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  try {
    const userId = req.user ? req.user.id : null;
    const inquiry = {
      id: nextContactId++,
      user_id: userId,
      name,
      email,
      subject: subject || '',
      message,
      created_at: new Date().toISOString()
    };
    contactInquiries.push(inquiry);

    res.json({ success: true, message: 'Thank you for contacting us! We will get back to you soon.' });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ error: 'Server error submitting contact form' });
  }
});

// Serve static files from the root directory
app.use(express.static(path.join(__dirname), {
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  }
}));

app.use(authenticateToken);

// Catch all handler: send back index.html for any non-API routes
app.get('*', (req, res) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Trendyfy server running at http://${HOST}:${PORT}/`);
  console.log('Backend APIs ready:');
  console.log('  - Authentication: /api/auth/*');
  console.log('  - Products: /api/products');
  console.log('  - Cart: /api/cart');
  console.log('  - Contact: /api/contact');
});
