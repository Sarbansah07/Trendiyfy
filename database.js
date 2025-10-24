const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'trendyfy.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    stock_qty INTEGER DEFAULT 0,
    image_url TEXT,
    category TEXT,
    is_featured INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS cart_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE(user_id, product_id)
  );

  CREATE TABLE IF NOT EXISTS contact_inquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  );

  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_items(user_id);
  CREATE INDEX IF NOT EXISTS idx_cart_product ON cart_items(product_id);
`);

function seedProducts() {
  const count = db.prepare('SELECT COUNT(*) as count FROM products').get();
  
  if (count.count === 0) {
    const products = [
      { name: 'Cartoon Tropical T-Shirt Blue', description: 'Comfortable cotton t-shirt with tropical print', price: 88900, stock_qty: 50, image_url: 'img/about/products/f1.jpg', category: 'T-Shirts', is_featured: 1 },
      { name: 'Cartoon Tropical T-Shirt Pink', description: 'Stylish pink t-shirt with cartoon design', price: 88900, stock_qty: 45, image_url: 'img/about/products/f2.jpg', category: 'T-Shirts', is_featured: 1 },
      { name: 'Cartoon Tropical T-Shirt Green', description: 'Fresh green tropical design t-shirt', price: 88900, stock_qty: 60, image_url: 'img/about/products/f3.jpg', category: 'T-Shirts', is_featured: 1 },
      { name: 'Cartoon Tropical T-Shirt Orange', description: 'Vibrant orange tropical t-shirt', price: 88900, stock_qty: 40, image_url: 'img/about/products/f4.jpg', category: 'T-Shirts', is_featured: 1 },
      { name: 'Cartoon Tropical T-Shirt Red', description: 'Bold red cartoon t-shirt', price: 88900, stock_qty: 55, image_url: 'img/about/products/f5.jpg', category: 'T-Shirts', is_featured: 1 },
      { name: 'Cartoon Tropical T-Shirt Yellow', description: 'Bright yellow tropical design', price: 88900, stock_qty: 50, image_url: 'img/about/products/f6.jpg', category: 'T-Shirts', is_featured: 1 },
      { name: 'Cartoon Tropical T-Shirt Purple', description: 'Purple tropical print t-shirt', price: 88900, stock_qty: 35, image_url: 'img/about/products/f7.jpg', category: 'T-Shirts', is_featured: 1 },
      { name: 'Cartoon Tropical T-Shirt Navy', description: 'Classic navy tropical t-shirt', price: 88900, stock_qty: 48, image_url: 'img/about/products/f8.jpg', category: 'T-Shirts', is_featured: 1 },
      { name: 'New Arrival Shirt White', description: 'Modern white casual shirt', price: 88900, stock_qty: 30, image_url: 'img/about/products/n1.jpg', category: 'Shirts', is_featured: 0 },
      { name: 'New Arrival Shirt Black', description: 'Elegant black casual shirt', price: 88900, stock_qty: 25, image_url: 'img/about/products/n2.jpg', category: 'Shirts', is_featured: 0 },
      { name: 'New Arrival Shirt Grey', description: 'Comfortable grey shirt', price: 88900, stock_qty: 40, image_url: 'img/about/products/n3.jpg', category: 'Shirts', is_featured: 0 },
      { name: 'New Arrival Shirt Beige', description: 'Stylish beige casual shirt', price: 88900, stock_qty: 35, image_url: 'img/about/products/n4.jpg', category: 'Shirts', is_featured: 0 },
      { name: 'New Arrival Shirt Blue', description: 'Classic blue casual shirt', price: 88900, stock_qty: 45, image_url: 'img/about/products/n5.jpg', category: 'Shirts', is_featured: 0 },
      { name: 'New Arrival Shirt Brown', description: 'Warm brown casual shirt', price: 88900, stock_qty: 30, image_url: 'img/about/products/n6.jpg', category: 'Shirts', is_featured: 0 },
      { name: 'New Arrival Shirt Olive', description: 'Trendy olive casual shirt', price: 88900, stock_qty: 28, image_url: 'img/about/products/n7.jpg', category: 'Shirts', is_featured: 0 },
      { name: 'New Arrival Shirt Maroon', description: 'Rich maroon casual shirt', price: 88900, stock_qty: 32, image_url: 'img/about/products/n8.jpg', category: 'Shirts', is_featured: 0 }
    ];

    const insert = db.prepare(
      'INSERT INTO products (name, description, price, stock_qty, image_url, category, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );

    products.forEach(product => {
      insert.run(product.name, product.description, product.price, product.stock_qty, product.image_url, product.category, product.is_featured);
    });

    console.log('Products seeded successfully');
  }
}

seedProducts();

module.exports = db;
