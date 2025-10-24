const db = require('./database');

console.log('Users table:');
const users = db.prepare('SELECT id, email, name, created_at FROM users').all();
console.log(users);

console.log('\nProducts table (first 5):');
const products = db.prepare('SELECT id, name, price, stock_qty FROM products LIMIT 5').all();
console.log(products);

console.log('\nCart items table:');
const cartItems = db.prepare('SELECT ci.id, u.email, p.name, ci.quantity FROM cart_items ci JOIN users u ON ci.user_id = u.id JOIN products p ON ci.product_id = p.id').all();
console.log(cartItems);

console.log('\nContact inquiries table:');
const inquiries = db.prepare('SELECT id, name, email, subject, message, created_at FROM contact_inquiries').all();
console.log(inquiries);
