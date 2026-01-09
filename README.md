# DonateHub
DonateHub — Full‑stack donation &amp; marketplace app (Node.js/Express + MongoDB + React) for listing, donating, and selling items.

# DonateHub 🤝

A full-stack web application that connects donors and buyers in a simple, intuitive marketplace. Share and discover donations or sell items seamlessly.

[![Node.js](https://img.shields.io/badge/Node.js-v16+-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v18+-blue)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-v7+-green)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

## 📖 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Database Models](#database-models)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Core Functionality
- **User Management**
  - User registration and authentication (JWT-based)
  - Role-based access control (User, Admin)
  - Profile management
  - Email verification and password reset

- **Donation System**
  - Create, view, and manage donations
  - Multiple donation types: blood, cash, books, food, knowledge, items
  - Track donation history and status
  - Real-time donation notifications

- **Marketplace**
  - Browse and search items
  - List items for sale
  - Item categorization
  - Seller ratings and reviews
  - Image uploads (Cloudinary integration)

- **Transactions**
  - Process donations and purchases
  - Transaction history tracking
  - Payment status management
  - Receipt generation

- **Admin Dashboard**
  - User management
  - Donation and transaction monitoring
  - System statistics and analytics
  - Content moderation

- **Security & Reliability**
  - Helmet for HTTP headers security
  - Rate limiting to prevent abuse
  - CORS protection
  - Input validation and sanitization
  - Password hashing with bcrypt

## 🛠 Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JWT (JSON Web Tokens)
- **File Upload:** Multer + Cloudinary
- **Email:** Nodemailer
- **Validation:** express-validator
- **Security:** Helmet, bcryptjs, express-rate-limit

### Frontend
- **Framework:** React 18
- **Routing:** React Router
- **State Management:** Context API
- **HTTP Client:** Axios
- **Styling:** CSS
- **UI Components:** Custom React components

### DevOps & Tools
- **Development:** Nodemon (auto-reload)
- **Database:** MongoDB Atlas / Local MongoDB
- **Storage:** Cloudinary CDN
- **Email Service:** Gmail/SMTP compatible

## 📁 Project Structure

```
donatehub/
├── donatehub-backend/                # Node.js + Express API
│   ├── src/
│   │   ├── index.js                 # Server entry point
│   │   ├── config/
│   │   │   └── database.js          # MongoDB connection
│   │   ├── controllers/             # Business logic handlers
│   │   ├── models/                  # Mongoose schemas
│   │   ├── routes/                  # API endpoints
│   │   ├── middleware/              # Auth, validation middleware
│   │   ├── utils/                   # Helper functions (email, tokens, uploads)
│   │   ├── scripts/                 # Database seeding
│   │   └── uploads/                 # Local file storage
│   ├── .env                         # Environment variables
│   └── package.json
│
├── donatehub-frontend/              # React application
│   ├── src/
│   │   ├── index.js                 # React entry point
│   │   ├── App.js                   # Root component
│   │   ├── components/              # Reusable UI components
│   │   ├── pages/                   # Page components
│   │   ├── services/                # API calls
│   │   ├── context/                 # Context providers (Auth, Theme)
│   │   ├── styles/                  # Global stylesheets
│   │   └── utils/                   # Validation, helpers
│   ├── public/                      # Static assets
│   └── package.json
│
└── README.md                        # This file
```

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** (v7 or higher) or **yarn**
- **MongoDB** (v5+) - Local or Atlas account
- **Git**

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/donatehub.git
cd donatehub
```

### 2. Backend Setup

```bash
cd donatehub-backend
npm install
```

### 3. Frontend Setup

```bash
cd ../donatehub-frontend
npm install
```

## ⚙️ Configuration

### Backend Environment Variables

Create a `.env` file in `donatehub-backend/`:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/donatehub
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/donatehub

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_key_here
JWT_EXPIRY=1h
JWT_REFRESH_EXPIRY=7d

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Nodemailer)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

# Frontend URL (CORS)
FRONTEND_URL=http://localhost:3000

# Admin Email
ADMIN_EMAIL=admin@donatehub.com
```

### Frontend Environment Variables

Create a `.env` file in `donatehub-frontend/`:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_API_TIMEOUT=10000
```

### 4. Initialize Database

Seed the database with sample data:

```bash
cd donatehub-backend
npm run seed
```

## 🎮 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd donatehub-backend
npm run dev
```
Backend runs at `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd donatehub-frontend
npm start
```
Frontend runs at `http://localhost:3000`

### Production Mode

**Backend:**
```bash
cd donatehub-backend
npm start
```

**Frontend:**
```bash
cd donatehub-frontend
npm run build
# Serve the build folder using a static server
npx serve -s build
```

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| POST | `/api/auth/refresh-token` | Refresh JWT token |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/profile` | Get user profile |
| PUT | `/api/users/profile` | Update profile |
| GET | `/api/users/:id` | Get user by ID |

### Donations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/donations` | Get all donations |
| POST | `/api/donations` | Create donation |
| GET | `/api/donations/:id` | Get donation details |
| PUT | `/api/donations/:id` | Update donation |
| DELETE | `/api/donations/:id` | Delete donation |

### Items/Marketplace
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/items` | Get all items |
| POST | `/api/items` | List new item |
| GET | `/api/items/:id` | Get item details |
| PUT | `/api/items/:id` | Update item |
| DELETE | `/api/items/:id` | Delete item |

### Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transactions` | Get user transactions |
| POST | `/api/transactions` | Create transaction |
| GET | `/api/transactions/:id` | Get transaction details |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Admin dashboard stats |
| GET | `/api/admin/users` | List all users |
| DELETE | `/api/admin/users/:id` | Remove user |

## 💾 Database Models

### User Model
```javascript
{
  firstName, lastName, email, password, phone,
  avatar, bio, address, role, verified, createdAt
}
```

### Donation Model
```javascript
{
  title, description, type, category, donor,
  quantity, status, image, createdAt
}
```

### Item Model
```javascript
{
  title, description, category, seller, price,
  image, available, createdAt
}
```

### Transaction Model
```javascript
{
  buyer, seller, item, amount, status, date, receipt
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Support

For questions or issues, please:
- Open an issue on GitHub
- Contact: support@donatehub.com
- Check existing documentation

---

**Happy Contributing! 🎉**

Built with ❤️ for the community.



