# Trendyfy E-commerce Website

## Overview
Trendyfy is a full-stack e-commerce website for shopping clothing and accessories. Users can create accounts, browse products, add items to cart, and submit contact inquiries - all with data persistence in a database.

## Project Structure

### Backend
- `server.js` - Express.js backend server with REST API endpoints
- `database.js` - SQLite database setup and initialization with seeded product data
- `cart-utils.js` - Shared client-side cart and authentication utilities

### Frontend
- `index.html` - Homepage with dynamic product loading from database
- `shop.html` - Product catalog page
- `blog.html` - Blog section
- `about.html` - About page
- `contact.html` - Contact page with form submission to database
- `cart.html` - Shopping cart with real-time data from database
- `login/login.html` - User login page
- `login/signup.html` - User registration page
- `style.css` - Main stylesheet
- `javascript.js` - Client-side JavaScript for mobile navigation

### Database
- `trendyfy.db` - SQLite database (auto-created)
  - `users` table - User accounts with hashed passwords
  - `products` table - Product catalog (pre-seeded with 16 products)
  - `cart_items` table - User shopping cart items
  - `contact_inquiries` table - Contact form submissions

## Technology Stack

### Backend
- Node.js 20 with Express.js
- SQLite (better-sqlite3) for data persistence
- bcryptjs for password hashing
- JWT (jsonwebtoken) for stateless authentication
- Security: Helmet, CORS, rate limiting
- Performance: Compression middleware

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- Font Awesome for icons
- Google Fonts (Spartan)
- Fetch API for backend communication

## Features

### User Authentication
- Secure signup with email validation and password hashing (bcrypt)
- Login with JWT-based session management (7-day expiry)
- Logout functionality
- Protected routes requiring authentication

### Shopping Cart
- Add products to cart (requires login)
- Update item quantities
- Remove items from cart
- Real-time cart count display
- Persistent cart storage in database
- Stock quantity validation

### Product Catalog
- 16 pre-seeded products (8 featured, 8 new arrivals)
- Dynamic product loading from database
- Product images, descriptions, and pricing
- Featured products section
- New arrivals section

### Contact Form
- Submit inquiries with name, email, subject, and message
- Data stored in database
- Rate limiting (5 submissions per hour per IP)
- Email validation

## Performance & Concurrency (100 Concurrent Users)

The application is designed to handle 100 concurrent users through:

### Security Measures
- **Helmet.js**: Sets secure HTTP headers
- **Rate Limiting**: 
  - Auth endpoints: 10 attempts per 15 minutes per IP
  - Contact form: 5 submissions per hour per IP
- **Password Security**: bcrypt hashing with salt rounds
- **JWT Authentication**: Stateless, httpOnly cookies with 7-day expiry

### Performance Optimizations
- **Compression**: Gzip compression for all responses
- **Cache Control**: Proper cache headers to prevent stale data
- **Database Indexing**: Indexes on email, user_id, product_id
- **Stateless Authentication**: JWT enables horizontal scaling
- **Connection Pooling**: SQLite with better-sqlite3 (synchronous, no pooling needed)
- **Efficient Queries**: Optimized SQL queries with prepared statements

### Scalability Considerations
- **SQLite Limitations**: For production with >100 concurrent writes, consider PostgreSQL
- **Current Setup**: Handles 100+ concurrent reads easily, ~50-100 concurrent writes
- **Horizontal Scaling**: Stateless JWT auth enables multiple server instances (with shared PostgreSQL)
- **Static Assets**: Served with compression, can be moved to CDN for better performance

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user info

### Products
- `GET /api/products` - Get all products
- `GET /api/products/featured` - Get featured products
- `GET /api/products/:id` - Get single product

### Shopping Cart
- `GET /api/cart` - Get user's cart items (requires auth)
- `POST /api/cart` - Add item to cart (requires auth)
- `PATCH /api/cart/:itemId` - Update item quantity (requires auth)
- `DELETE /api/cart/:itemId` - Remove item from cart (requires auth)
- `GET /api/cart/count` - Get total cart item count

### Contact
- `POST /api/contact` - Submit contact inquiry (rate limited)

## Running the Project
The project runs on port 5000 using Express.js server with all API endpoints and static file serving.

```bash
node server.js
```

## Environment Variables
- `JWT_SECRET` - Secret key for JWT signing (default: development key)
- `PORT` - Server port (default: 5000)
- `HOST` - Server host (default: 0.0.0.0)

## Recent Changes
- 2025-10-24: Initial import and setup for Replit environment
- 2025-10-24: Converted from static site to full-stack application
  - Added Express.js backend with REST API
  - Implemented SQLite database with 4 tables
  - Added user authentication (signup/login/logout)
  - Added shopping cart functionality
  - Added contact form with database storage
  - Implemented security measures (helmet, rate limiting, password hashing)
  - Added performance optimizations (compression, caching)
  - Seeded database with 16 products
  - Dynamic product loading from database
  - Real-time cart updates
